"""
Service layer for question bank module.

Handles business logic for questions.
"""
from typing import Optional, List
from uuid import UUID
import json
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import QuestionRepository
from .schemas import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionListResponse,
    QuestionBankFilter,
    QuestionWithAnswerResponse,
    PYQResponse,
    Difficulty,
)
from .models import Question
from ..shared.exceptions import NotFoundException, ValidationException


class QuestionService:
    """Service layer for question operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = QuestionRepository(db)
    
    def _parse_options(self, question: Question) -> List[str]:
        """Parse options JSON to list."""
        if isinstance(question.options, str):
            try:
                return json.loads(question.options)
            except json.JSONDecodeError:
                return []
        return question.options or []
    
    def _question_to_response(
        self,
        question: Question,
        include_answer: bool = False
    ) -> QuestionResponse:
        """Convert Question model to response schema."""
        options = self._parse_options(question)
        
        response_data = {
            "id": question.id,
            "topic_id": question.topic_id,
            "topic_name": question.topic.name if question.topic else None,
            "question_text": question.question_text,
            "question_type": question.question_type.value if hasattr(question.question_type, 'value') else question.question_type,
            "options": options,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation,
            "difficulty": question.difficulty.value if hasattr(question.difficulty, 'value') else question.difficulty,
            "marks": question.marks,
            "negative_marks": question.negative_marks,
            "is_premium": question.is_premium,
            "source": question.source,
            "exam_year": question.exam_year,
            "created_at": question.created_at,
        }
        
        # Add subject name if topic is loaded
        if question.topic and hasattr(question.topic, 'subject'):
            response_data["subject_name"] = question.topic.subject.name if question.topic.subject else None
        
        if include_answer:
            return QuestionWithAnswerResponse(**response_data)
        return QuestionResponse(**response_data)
    
    async def get_question_by_id(
        self,
        question_id: UUID,
        include_answer: bool = False
    ) -> QuestionResponse:
        """Get question by ID."""
        question = await self.repo.get_question_with_details(question_id)
        if not question:
            raise NotFoundException("Question")
        
        return self._question_to_response(question, include_answer=include_answer)
    
    async def get_questions_by_topic(
        self,
        topic_id: UUID,
        difficulty: Optional[Difficulty] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[QuestionListResponse]:
        """Get questions for a specific topic."""
        difficulty_enum = Difficulty(difficulty) if difficulty else None
        
        questions = await self.repo.get_questions_by_topic(
            topic_id, difficulty_enum, limit, offset
        )
        
        return [
            QuestionListResponse(
                id=str(q.id),
                topic_id=str(q.topic_id),
                topic_name=q.topic.name if q.topic else None,
                question_text=q.question_text,
                question_type=q.question_type.value if hasattr(q.question_type, 'value') else q.question_type,
                difficulty=q.difficulty.value if hasattr(q.difficulty, 'value') else q.difficulty,
                marks=q.marks,
                is_premium=q.is_premium,
                source=q.source,
                exam_year=q.exam_year,
            )
            for q in questions
        ]
    
    async def get_random_questions_for_test(
        self,
        count: int,
        topic_ids: Optional[List[UUID]] = None,
        difficulty: Optional[Difficulty] = None,
        exclude_ids: Optional[List[UUID]] = None
    ) -> List[QuestionWithAnswerResponse]:
        """Get random questions for test generation (includes correct answers)."""
        difficulty_enum = Difficulty(difficulty) if difficulty else None
        
        questions = await self.repo.get_random_questions(
            count, topic_ids, difficulty_enum, exclude_ids
        )
        
        return [self._question_to_response(q, include_answer=True) for q in questions]
    
    async def search_questions(
        self,
        search_term: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[QuestionListResponse]:
        """Search questions by text."""
        questions = await self.repo.search_questions(search_term, limit, offset)
        
        return [
            QuestionListResponse(
                id=str(q.id),
                topic_id=str(q.topic_id),
                topic_name=q.topic.name if q.topic else None,
                question_text=q.question_text,
                question_type=q.question_type.value if hasattr(q.question_type, 'value') else q.question_type,
                difficulty=q.difficulty.value if hasattr(q.difficulty, 'value') else q.difficulty,
                marks=q.marks,
                is_premium=q.is_premium,
                source=q.source,
                exam_year=q.exam_year,
            )
            for q in questions
        ]
    
    async def create_question(self, data: QuestionCreate) -> QuestionResponse:
        """Create a new question."""
        question = await self.repo.create_question(data.model_dump())
        return self._question_to_response(question, include_answer=True)
    
    async def update_question(
        self,
        question_id: UUID,
        data: QuestionUpdate
    ) -> QuestionResponse:
        """Update an existing question."""
        update_data = data.model_dump(exclude_unset=True)
        
        if not update_data:
            raise ValidationException("No fields to update")
        
        question = await self.repo.update_question(question_id, update_data)
        if not question:
            raise NotFoundException("Question")
        
        return self._question_to_response(question, include_answer=True)
    
    async def delete_question(self, question_id: UUID) -> bool:
        """Delete a question."""
        success = await self.repo.delete_question(question_id)
        if not success:
            raise NotFoundException("Question")
        return True
    
    async def get_question_count(
        self,
        topic_id: Optional[UUID] = None,
        subject_id: Optional[UUID] = None,
        difficulty: Optional[Difficulty] = None,
        is_premium: Optional[bool] = None
    ) -> int:
        """Get total count of questions matching filters."""
        difficulty_enum = Difficulty(difficulty) if difficulty else None
        return await self.repo.get_question_count(
            topic_id, subject_id, difficulty_enum, is_premium
        )
    
    async def get_pyqs_by_year(
        self,
        exam_year: int,
        subject_id: Optional[UUID] = None,
        topic_id: Optional[UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[PYQResponse]:
        """Get Previous Year Questions by exam year."""
        questions = await self.repo.get_pyqs_by_year(
            exam_year, subject_id, topic_id, limit, offset
        )
        
        result = []
        for q in questions:
            options = self._parse_options(q)
            result.append(PYQResponse(
                id=str(q.id),
                topic_id=str(q.topic_id),
                topic_name=q.topic.name if q.topic else None,
                subject_id=str(q.topic.subject_id) if q.topic else None,
                subject_name=q.topic.subject.name if q.topic and hasattr(q.topic, 'subject') and q.topic.subject else None,
                question_text=q.question_text,
                question_type=q.question_type.value if hasattr(q.question_type, 'value') else q.question_type,
                options=options,
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                source=q.source or "",
                exam_year=q.exam_year or exam_year,
                created_at=q.created_at,
            ))
        
        return result
