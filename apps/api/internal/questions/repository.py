"""
Repository layer for question bank module.

Handles all database operations for questions.
"""
from typing import Optional, List, Tuple
from uuid import UUID
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from .models import Question, QuestionType, Difficulty


class QuestionRepository:
    """Repository for question-related database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_question_by_id(self, question_id: UUID) -> Optional[Question]:
        """Get question by ID with topic loaded."""
        result = await self.db.execute(
            select(Question)
            .options(selectinload(Question.topic).selectinload(lambda t: t.subject) if hasattr(t, 'subject') else selectinload(Question.topic))
            .where(Question.id == question_id)
        )
        return result.scalar_one_or_none()
    
    async def get_question_with_details(self, question_id: UUID) -> Optional[Question]:
        """Get question with full topic and subject details."""
        result = await self.db.execute(
            select(Question)
            .options(
                selectinload(Question.topic).selectinload(lambda t: t.subject)
            )
            .where(Question.id == question_id)
        )
        return result.scalar_one_or_none()
    
    async def get_questions_by_topic(
        self,
        topic_id: UUID,
        difficulty: Optional[Difficulty] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Question]:
        """Get questions for a specific topic."""
        query = select(Question).where(Question.topic_id == topic_id)
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        query = query.offset(offset).limit(limit).order_by(func.random())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_questions_by_subjects(
        self,
        subject_ids: List[UUID],
        difficulty: Optional[Difficulty] = None,
        limit: int = 100
    ) -> List[Question]:
        """Get questions for multiple subjects (for sectional tests)."""
        from ..syllabus.models import Topic
        
        query = (
            select(Question)
            .join(Topic)
            .where(Topic.subject_id.in_(subject_ids))
        )
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        query = query.limit(limit).order_by(func.random())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_random_questions(
        self,
        count: int,
        topic_ids: Optional[List[UUID]] = None,
        difficulty: Optional[Difficulty] = None,
        exclude_ids: Optional[List[UUID]] = None
    ) -> List[Question]:
        """Get random questions for test generation."""
        query = select(Question)
        
        if topic_ids:
            query = query.where(Question.topic_id.in_(topic_ids))
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        if exclude_ids:
            query = query.where(Question.id.not_in(exclude_ids))
        
        query = query.limit(count).order_by(func.random())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_question_count(
        self,
        topic_id: Optional[UUID] = None,
        subject_id: Optional[UUID] = None,
        difficulty: Optional[Difficulty] = None,
        is_premium: Optional[bool] = None
    ) -> int:
        """Get total count of questions matching filters."""
        query = select(func.count(Question.id))
        
        if topic_id:
            query = query.where(Question.topic_id == topic_id)
        
        if difficulty:
            query = query.where(Question.difficulty == difficulty)
        
        if is_premium is not None:
            query = query.where(Question.is_premium == is_premium)
        
        if subject_id:
            from ..syllabus.models import Topic
            query = query.join(Topic).where(Topic.subject_id == subject_id)
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def search_questions(
        self,
        search_term: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[Question]:
        """Search questions by text."""
        query = (
            select(Question)
            .where(
                or_(
                    Question.question_text.ilike(f"%{search_term}%"),
                    Question.explanation.ilike(f"%{search_term}%")
                )
            )
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def create_question(self, data: dict) -> Question:
        """Create a new question."""
        # Convert options list to JSON string
        if 'options' in data and isinstance(data['options'], list):
            data['options'] = json.dumps(data['options'])
        
        question = Question(**data)
        self.db.add(question)
        await self.db.flush()
        await self.db.refresh(question)
        return question
    
    async def update_question(
        self,
        question_id: UUID,
        data: dict
    ) -> Optional[Question]:
        """Update an existing question."""
        result = await self.db.execute(
            select(Question).where(Question.id == question_id)
        )
        question = result.scalar_one_or_none()
        
        if question:
            # Convert options list to JSON string if needed
            if 'options' in data and isinstance(data['options'], list):
                data['options'] = json.dumps(data['options'])
            
            for key, value in data.items():
                if hasattr(question, key) and value is not None:
                    setattr(question, key, value)
            
            await self.db.flush()
            await self.db.refresh(question)
        
        return question
    
    async def delete_question(self, question_id: UUID) -> bool:
        """Delete a question by ID."""
        result = await self.db.execute(
            select(Question).where(Question.id == question_id)
        )
        question = result.scalar_one_or_none()
        
        if question:
            await self.db.delete(question)
            await self.db.flush()
            return True
        return False
    
    async def get_pyqs_by_year(
        self,
        exam_year: int,
        subject_id: Optional[UUID] = None,
        topic_id: Optional[UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Question]:
        """Get Previous Year Questions by exam year."""
        query = (
            select(Question)
            .where(Question.exam_year == exam_year)
            .where(Question.source.isnot(None))
        )
        
        if subject_id:
            from ..syllabus.models import Topic
            query = query.join(Topic).where(Topic.subject_id == subject_id)
        
        if topic_id:
            query = query.where(Question.topic_id == topic_id)
        
        query = query.offset(offset).limit(limit).order_by(Question.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
