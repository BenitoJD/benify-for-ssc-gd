"""
Repository layer for test series module.

Handles all database operations for test series and attempts.
"""
from typing import Optional, List, Tuple
from uuid import UUID
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from .models import TestSeries, MockAttempt, AttemptAnswer, TestType
from ..questions.models import Question


class TestSeriesRepository:
    """Repository for test series database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_test_series_by_id(
        self,
        test_series_id: UUID
    ) -> Optional[TestSeries]:
        """Get test series by ID."""
        result = await self.db.execute(
            select(TestSeries).where(TestSeries.id == test_series_id)
        )
        return result.scalar_one_or_none()
    
    async def get_active_test_series(
        self,
        test_type: Optional[TestType] = None,
        is_premium: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[TestSeries]:
        """Get active test series with optional filters."""
        query = select(TestSeries).where(TestSeries.is_active == True)
        
        if test_type:
            query = query.where(TestSeries.test_type == test_type)
        
        if is_premium is not None:
            query = query.where(TestSeries.is_premium == is_premium)
        
        query = query.offset(offset).limit(limit).order_by(TestSeries.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_test_series_count(
        self,
        test_type: Optional[TestType] = None,
        is_premium: Optional[bool] = None
    ) -> int:
        """Get count of active test series."""
        query = select(func.count(TestSeries.id)).where(TestSeries.is_active == True)
        
        if test_type:
            query = query.where(TestSeries.test_type == test_type)
        
        if is_premium is not None:
            query = query.where(TestSeries.is_premium == is_premium)
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def search_test_series(
        self,
        search_term: str,
        test_type: Optional[TestType] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[TestSeries]:
        """Search test series by title."""
        query = (
            select(TestSeries)
            .where(
                and_(
                    TestSeries.is_active == True,
                    or_(
                        TestSeries.title.ilike(f"%{search_term}%"),
                        TestSeries.description.ilike(f"%{search_term}%")
                    )
                )
            )
        )
        
        if test_type:
            query = query.where(TestSeries.test_type == test_type)
        
        query = query.offset(offset).limit(limit).order_by(TestSeries.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def create_test_series(self, data: dict) -> TestSeries:
        """Create a new test series."""
        # Convert lists to JSON strings
        if 'subject_ids' in data and data['subject_ids']:
            data['subject_ids'] = json.dumps([str(s) for s in data['subject_ids']])
        if 'topic_ids' in data and data['topic_ids']:
            data['topic_ids'] = json.dumps([str(t) for t in data['topic_ids']])
        
        test_series = TestSeries(**data)
        self.db.add(test_series)
        await self.db.flush()
        await self.db.refresh(test_series)
        return test_series
    
    async def update_test_series(
        self,
        test_series_id: UUID,
        data: dict
    ) -> Optional[TestSeries]:
        """Update an existing test series."""
        result = await self.db.execute(
            select(TestSeries).where(TestSeries.id == test_series_id)
        )
        test_series = result.scalar_one_or_none()
        
        if test_series:
            # Convert lists to JSON strings
            if 'subject_ids' in data:
                data['subject_ids'] = json.dumps([str(s) for s in data['subject_ids']]) if data['subject_ids'] else None
            if 'topic_ids' in data:
                data['topic_ids'] = json.dumps([str(t) for t in data['topic_ids']]) if data['topic_ids'] else None
            
            for key, value in data.items():
                if hasattr(test_series, key) and value is not None:
                    setattr(test_series, key, value)
            
            await self.db.flush()
            await self.db.refresh(test_series)
        
        return test_series


class AttemptRepository:
    """Repository for mock attempt database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_attempt_by_id(
        self,
        attempt_id: UUID
    ) -> Optional[MockAttempt]:
        """Get attempt by ID with test series loaded."""
        result = await self.db.execute(
            select(MockAttempt)
            .options(selectinload(MockAttempt.test_series))
            .where(MockAttempt.id == attempt_id)
        )
        return result.scalar_one_or_none()
    
    async def get_attempt_with_answers(
        self,
        attempt_id: UUID
    ) -> Optional[MockAttempt]:
        """Get attempt with all answers loaded."""
        result = await self.db.execute(
            select(MockAttempt)
            .options(
                selectinload(MockAttempt.test_series),
                selectinload(MockAttempt.answers)
            )
            .where(MockAttempt.id == attempt_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_attempts_for_test(
        self,
        user_id: UUID,
        test_series_id: UUID
    ) -> List[MockAttempt]:
        """Get all attempts by user for a specific test."""
        result = await self.db.execute(
            select(MockAttempt)
            .where(
                and_(
                    MockAttempt.user_id == user_id,
                    MockAttempt.test_series_id == test_series_id
                )
            )
            .order_by(MockAttempt.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_user_attempt_count(
        self,
        user_id: UUID,
        test_series_id: UUID
    ) -> int:
        """Get count of user's attempts for a test."""
        result = await self.db.execute(
            select(func.count(MockAttempt.id))
            .where(
                and_(
                    MockAttempt.user_id == user_id,
                    MockAttempt.test_series_id == test_series_id
                )
            )
        )
        return result.scalar() or 0
    
    async def get_user_best_score(
        self,
        user_id: UUID,
        test_series_id: UUID
    ) -> Optional[float]:
        """Get user's best score for a test."""
        result = await self.db.execute(
            select(func.max(MockAttempt.total_score))
            .where(
                and_(
                    MockAttempt.user_id == user_id,
                    MockAttempt.test_series_id == test_series_id,
                    MockAttempt.is_completed == True
                )
            )
        )
        return result.scalar()
    
    async def get_user_last_attempt(
        self,
        user_id: UUID,
        test_series_id: UUID
    ) -> Optional[MockAttempt]:
        """Get user's last attempt for a test."""
        result = await self.db.execute(
            select(MockAttempt)
            .where(
                and_(
                    MockAttempt.user_id == user_id,
                    MockAttempt.test_series_id == test_series_id
                )
            )
            .order_by(MockAttempt.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def create_attempt(
        self,
        user_id: UUID,
        test_series_id: UUID,
        question_ids: List[UUID]
    ) -> MockAttempt:
        """Create a new attempt."""
        attempt = MockAttempt(
            user_id=user_id,
            test_series_id=test_series_id,
            question_ids=json.dumps([str(q) for q in question_ids]),
            question_order=json.dumps(list(range(len(question_ids)))),
        )
        self.db.add(attempt)
        await self.db.flush()
        await self.db.refresh(attempt)
        return attempt
    
    async def update_attempt_score(
        self,
        attempt_id: UUID,
        total_score: float,
        max_score: float,
        correct_count: int,
        incorrect_count: int,
        unattempted_count: int,
        time_spent_seconds: int,
        rank_percentile: Optional[float] = None,
        rank: Optional[int] = None
    ) -> Optional[MockAttempt]:
        """Update attempt with calculated scores."""
        result = await self.db.execute(
            select(MockAttempt).where(MockAttempt.id == attempt_id)
        )
        attempt = result.scalar_one_or_none()
        
        if attempt:
            attempt.total_score = total_score
            attempt.max_score = max_score
            attempt.correct_count = correct_count
            attempt.incorrect_count = incorrect_count
            attempt.unattempted_count = unattempted_count
            attempt.time_spent_seconds = time_spent_seconds
            attempt.rank_percentile = rank_percentile
            attempt.rank = rank
            attempt.is_completed = True
            attempt.is_submitted = True
            attempt.completed_at = func.now()
            
            await self.db.flush()
            await self.db.refresh(attempt)
        
        return attempt
    
    async def get_answer_by_attempt_question(
        self,
        attempt_id: UUID,
        question_id: UUID
    ) -> Optional[AttemptAnswer]:
        """Get answer for a specific attempt and question."""
        result = await self.db.execute(
            select(AttemptAnswer).where(
                and_(
                    AttemptAnswer.attempt_id == attempt_id,
                    AttemptAnswer.question_id == question_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_answers_by_attempt(
        self,
        attempt_id: UUID
    ) -> List[AttemptAnswer]:
        """Get all answers for an attempt."""
        result = await self.db.execute(
            select(AttemptAnswer)
            .where(AttemptAnswer.attempt_id == attempt_id)
            .order_by(AttemptAnswer.order_index)
        )
        return list(result.scalars().all())
    
    async def create_or_update_answer(
        self,
        attempt_id: UUID,
        question_id: UUID,
        selected_option: Optional[str],
        is_flagged: bool,
        order_index: int
    ) -> AttemptAnswer:
        """Create or update an answer for a question."""
        existing = await self.get_answer_by_attempt_question(attempt_id, question_id)
        
        if existing:
            existing.selected_option = selected_option
            existing.is_flagged = is_flagged
            await self.db.flush()
            await self.db.refresh(existing)
            return existing
        else:
            answer = AttemptAnswer(
                attempt_id=attempt_id,
                question_id=question_id,
                selected_option=selected_option,
                is_flagged=is_flagged,
                order_index=order_index,
            )
            self.db.add(answer)
            await self.db.flush()
            await self.db.refresh(answer)
            return answer
    
    async def get_all_attempts_for_test(
        self,
        test_series_id: UUID,
        is_completed: bool = True
    ) -> List[MockAttempt]:
        """Get all completed attempts for a test (for percentile calculation)."""
        result = await self.db.execute(
            select(MockAttempt)
            .where(
                and_(
                    MockAttempt.test_series_id == test_series_id,
                    MockAttempt.is_completed == is_completed
                )
            )
            .order_by(MockAttempt.total_score.desc())
        )
        return list(result.scalars().all())
    
    async def get_attempt_rank(
        self,
        test_series_id: UUID,
        score: float
    ) -> Tuple[int, float]:
        """Get rank and percentile for a score in a test.
        
        Returns: (rank, percentile)
        """
        attempts = await self.get_all_attempts_for_test(test_series_id)
        
        if not attempts:
            return 1, 100.0  # First attempt gets top rank
        
        rank = 1
        for i, attempt in enumerate(attempts):
            if attempt.total_score > score:
                rank = i + 2  # +2 because index starts at 0 and rank is 1-based
            elif attempt.total_score == score:
                rank = i + 1
                break
        
        total_attempts = len(attempts)
        percentile = ((total_attempts - rank + 1) / total_attempts) * 100
        
        return rank, round(percentile, 2)
