"""
Repository layer for analytics module.

Handles all database operations for analytics.
"""
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from .models import UserAnalytics
from ..tests.models import MockAttempt, AttemptAnswer
from ..questions.models import Question
from ..syllabus.models import Subject, Topic


class AnalyticsRepository:
    """Repository for analytics database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ============ User Attempts ============
    
    async def get_user_attempts(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 10
    ) -> List[MockAttempt]:
        """Get user's mock attempts with optional date filter."""
        query = select(MockAttempt).where(
            and_(
                MockAttempt.user_id == user_id,
                MockAttempt.is_completed
            )
        )
        
        if start_date:
            query = query.where(MockAttempt.completed_at >= start_date)
        if end_date:
            query = query.where(MockAttempt.completed_at <= end_date)
        
        query = query.order_by(desc(MockAttempt.completed_at)).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_user_attempt_count(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> int:
        """Get count of user's completed attempts."""
        query = select(func.count(MockAttempt.id)).where(
            and_(
                MockAttempt.user_id == user_id,
                MockAttempt.is_completed
            )
        )
        
        if start_date:
            query = query.where(MockAttempt.completed_at >= start_date)
        if end_date:
            query = query.where(MockAttempt.completed_at <= end_date)
        
        result = await self.db.execute(query)
        return result.scalar() or 0
    
    async def get_attempt_answers(
        self,
        attempt_id: UUID
    ) -> List[AttemptAnswer]:
        """Get all answers for an attempt."""
        result = await self.db.execute(
            select(AttemptAnswer).where(AttemptAnswer.attempt_id == attempt_id)
        )
        return list(result.scalars().all())
    
    async def get_question_with_topic(
        self,
        question_id: UUID
    ) -> Optional[Question]:
        """Get question with topic and subject loaded."""
        result = await self.db.execute(
            select(Question)
            .options(selectinload(Question.topic).selectinload(Topic.subject))
            .where(Question.id == question_id)
        )
        return result.scalar_one_or_none()
    
    # ============ Subject Analytics ============
    
    async def get_subject_stats_for_attempts(
        self,
        user_id: UUID,
        subject_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """Get subject-wise statistics for user's attempts."""
        # Get all attempts
        attempts = await self.get_user_attempts(user_id, start_date, end_date, limit=1000)
        
        total_questions = 0
        correct_answers = 0
        total_time = 0
        
        for attempt in attempts:
            answers = await self.get_attempt_answers(attempt.id)
            for answer in answers:
                question = await self.get_question_with_topic(answer.question_id)
                if question and question.topic and question.topic.subject_id == subject_id:
                    total_questions += 1
                    if answer.is_correct:
                        correct_answers += 1
                    if answer.time_spent_seconds:
                        total_time += answer.time_spent_seconds
        
        accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        avg_time = (total_time / total_questions) if total_questions > 0 else 0
        
        return {
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "accuracy": accuracy,
            "avg_time_per_question": avg_time,
            "total_time": total_time
        }
    
    async def get_all_subjects(self) -> List[Subject]:
        """Get all subjects."""
        result = await self.db.execute(
            select(Subject).order_by(Subject.order_index)
        )
        return list(result.scalars().all())
    
    # ============ Topic Analytics ============
    
    async def get_topic_stats_for_attempts(
        self,
        user_id: UUID,
        topic_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """Get topic-wise statistics for user's attempts."""
        attempts = await self.get_user_attempts(user_id, start_date, end_date, limit=1000)
        
        total_questions = 0
        correct_answers = 0
        incorrect_answers = 0
        total_time = 0
        
        for attempt in attempts:
            answers = await self.get_attempt_answers(attempt.id)
            for answer in answers:
                question = await self.get_question_with_topic(answer.question_id)
                if question and question.topic_id == topic_id:
                    total_questions += 1
                    if answer.is_correct:
                        correct_answers += 1
                    else:
                        incorrect_answers += 1
                    if answer.time_spent_seconds:
                        total_time += answer.time_spent_seconds
        
        accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        error_rate = (incorrect_answers / total_questions * 100) if total_questions > 0 else 0
        avg_time = (total_time / total_questions) if total_questions > 0 else 0
        
        return {
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "incorrect_answers": incorrect_answers,
            "accuracy": accuracy,
            "error_rate": error_rate,
            "avg_time_per_question": avg_time,
            "total_time": total_time
        }
    
    async def get_all_topics(self) -> List[Topic]:
        """Get all topics."""
        result = await self.db.execute(
            select(Topic).options(selectinload(Topic.subject))
        )
        return list(result.scalars().all())
    
    async def get_weak_questions_for_topic(
        self,
        user_id: UUID,
        topic_id: UUID,
        limit: int = 10
    ) -> List[dict]:
        """Get questions that user answered incorrectly for a topic."""
        attempts = await self.get_user_attempts(user_id, limit=1000)
        
        incorrect_questions = []
        for attempt in attempts:
            answers = await self.get_attempt_answers(attempt.id)
            for answer in answers:
                if not answer.is_correct:
                    question = await self.get_question_with_topic(answer.question_id)
                    if question and question.topic_id == topic_id:
                        incorrect_questions.append({
                            "question_id": question.id,
                            "question_text": question.question_text[:100],  # Truncate
                            "selected_option": answer.selected_option,
                            "correct_option": question.correct_answer,
                        })
                        if len(incorrect_questions) >= limit:
                            break
            if len(incorrect_questions) >= limit:
                break
        
        return incorrect_questions[:limit]
    
    # ============ Platform Average ============
    
    async def get_platform_average_for_test(
        self,
        test_series_id: UUID
    ) -> Optional[float]:
        """Get platform average score for a test series."""
        result = await self.db.execute(
            select(func.avg(MockAttempt.total_score))
            .where(
                and_(
                    MockAttempt.test_series_id == test_series_id,
                    MockAttempt.is_completed
                )
            )
        )
        return result.scalar()
    
    # ============ User Analytics (cached) ============
    
    async def get_or_create_user_analytics(
        self,
        user_id: UUID
    ) -> UserAnalytics:
        """Get or create user analytics record."""
        result = await self.db.execute(
            select(UserAnalytics).where(UserAnalytics.user_id == user_id)
        )
        analytics = result.scalar_one_or_none()
        
        if not analytics:
            analytics = UserAnalytics(user_id=user_id)
            self.db.add(analytics)
            await self.db.flush()
            await self.db.refresh(analytics)
        
        return analytics
    
    # ============ Time Analytics ============
    
    async def get_time_stats_by_subject(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[dict]:
        """Get time spent per question by subject."""
        attempts = await self.get_user_attempts(user_id, start_date, end_date, limit=1000)
        
        subject_stats = {}
        
        for attempt in attempts:
            answers = await self.get_attempt_answers(attempt.id)
            for answer in answers:
                question = await self.get_question_with_topic(answer.question_id)
                if question and question.topic:
                    subject_id = str(question.topic.subject_id)
                    subject_name = question.topic.subject.name if question.topic.subject else "Unknown"
                    
                    if subject_id not in subject_stats:
                        subject_stats[subject_id] = {
                            "subject_id": subject_id,
                            "subject_name": subject_name,
                            "total_time": 0,
                            "total_questions": 0,
                        }
                    
                    if answer.time_spent_seconds:
                        subject_stats[subject_id]["total_time"] += answer.time_spent_seconds
                    subject_stats[subject_id]["total_questions"] += 1
        
        result = []
        for subject_id, stats in subject_stats.items():
            result.append({
                "subject_id": UUID(subject_id),
                "subject_name": stats["subject_name"],
                "avg_time_seconds": (
                    stats["total_time"] / stats["total_questions"] 
                    if stats["total_questions"] > 0 else 0
                ),
                "total_questions": stats["total_questions"]
            })
        
        return result
    
    # ============ Streak Calculation ============
    
    async def calculate_streak(self, user_id: UUID) -> Tuple[int, int]:
        """Calculate current and longest streak.
        
        Returns: (current_streak, longest_streak)
        """
        result = await self.db.execute(
            select(MockAttempt)
            .where(
                and_(
                    MockAttempt.user_id == user_id,
                    MockAttempt.is_completed
                )
            )
            .order_by(desc(MockAttempt.completed_at))
        )
        attempts = list(result.scalars().all())
        
        if not attempts:
            return 0, 0
        
        current_streak = 0
        longest_streak = 0
        temp_streak = 0
        last_date = None
        
        for attempt in attempts:
            if not attempt.completed_at:
                continue
            
            attempt_date = attempt.completed_at.date()
            
            if last_date is None:
                # First attempt
                today = datetime.utcnow().date()
                if attempt_date == today or attempt_date == today - timedelta(days=1):
                    temp_streak = 1
                    current_streak = 1
                else:
                    temp_streak = 1  # Still counting
            else:
                days_diff = (last_date - attempt_date).days
                
                if days_diff == 1:
                    temp_streak += 1
                    if current_streak > 0:
                        current_streak = temp_streak
                elif days_diff > 1:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
                    if current_streak > 0:
                        # Streak broken
                        pass
            
            last_date = attempt_date
        
        longest_streak = max(longest_streak, temp_streak)
        
        return current_streak, longest_streak
