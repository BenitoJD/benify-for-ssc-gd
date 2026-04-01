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
    
    # ============ Percentile Rank Estimation ============
    
    async def get_all_user_scores_for_percentile(
        self,
        test_series_id: Optional[UUID] = None,
        limit: int = 10000
    ) -> List[dict]:
        """Get all user scores for percentile rank estimation.
        
        Returns list of dicts with user_id and score.
        If test_series_id is None, gets all completed attempts.
        """
        query = select(
            MockAttempt.user_id,
            MockAttempt.total_score,
            MockAttempt.completed_at
        ).where(
            MockAttempt.is_completed == True,
            MockAttempt.total_score.isnot(None)
        )
        
        if test_series_id:
            query = query.where(MockAttempt.test_series_id == test_series_id)
        
        query = query.order_by(MockAttempt.total_score.desc()).limit(limit)
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {"user_id": row.user_id, "score": row.total_score, "completed_at": row.completed_at}
            for row in rows
        ]
    
    async def calculate_percentile_rank(
        self,
        user_id: UUID,
        user_score: float
    ) -> dict:
        """Calculate estimated percentile rank for a user.
        
        Uses normalized score distribution to estimate percentile.
        """
        all_scores = await self.get_all_user_scores_for_percentile()
        
        if not all_scores:
            return {
                "estimated_percentile": 50.0,
                "total_test_takers": 0,
                "user_score": user_score,
                "rank_category": "below_avg"
            }
        
        # Count how many scores are below user's score
        scores_below = sum(1 for s in all_scores if s["score"] < user_score)
        total_test_takers = len(all_scores)
        
        # Calculate percentile
        percentile = (scores_below / total_test_takers) * 100 if total_test_takers > 0 else 50.0
        
        # Determine rank category
        if percentile >= 90:
            rank_category = "top_10"
        elif percentile >= 75:
            rank_category = "top_25"
        elif percentile >= 50:
            rank_category = "top_50"
        elif percentile >= 25:
            rank_category = "above_avg"
        else:
            rank_category = "below_avg"
        
        return {
            "estimated_percentile": round(percentile, 2),
            "total_test_takers": total_test_takers,
            "user_score": user_score,
            "cohort_scores": [s["score"] for s in all_scores],
            "rank_category": rank_category
        }
    
    # ============ Cohort Comparison ============
    
    async def get_user_creation_date(self, user_id: UUID) -> Optional[datetime]:
        """Get the date when user was created."""
        from ..users.models import User
        result = await self.db.execute(
            select(User.created_at).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_cohort_users(
        self,
        user_id: UUID,
        cohort_months_back: int = 1
    ) -> List[UUID]:
        """Get users who started in the same month as the target user.
        
        Returns user IDs of cohort members.
        """
        user_created = await self.get_user_creation_date(user_id)
        if not user_created:
            return []
        
        # Calculate the month range
        cohort_start = user_created.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if cohort_start.month == 12:
            cohort_end = cohort_start.replace(year=cohort_start.year + 1, month=1)
        else:
            cohort_end = cohort_start.replace(month=cohort_start.month + 1)
        
        # Allow some flexibility (±cohort_months_back months)
        flexible_start = cohort_start - timedelta(days=30 * cohort_months_back)
        flexible_end = cohort_end + timedelta(days=30 * cohort_months_back)
        
        from ..users.models import User
        result = await self.db.execute(
            select(User.id).where(
                and_(
                    User.created_at >= flexible_start,
                    User.created_at < flexible_end,
                    User.id != user_id
                )
            )
        )
        cohort_user_ids = [row[0] for row in result.all()]
        
        return cohort_user_ids
    
    async def get_cohort_progress(self, cohort_user_ids: List[UUID]) -> dict:
        """Calculate average progress metrics for a cohort."""
        if not cohort_user_ids:
            return {
                "cohort_size": 0,
                "avg_mocks_taken": 0,
                "avg_accuracy": 0,
                "avg_readiness": 0
            }
        
        # Get average mocks taken
        result = await self.db.execute(
            select(func.count(MockAttempt.id))
            .where(
                and_(
                    MockAttempt.user_id.in_(cohort_user_ids),
                    MockAttempt.is_completed == True
                )
            )
        )
        total_attempts = result.scalar() or 0
        
        # Get attempts by cohort users
        attempts_result = await self.db.execute(
            select(MockAttempt)
            .where(
                and_(
                    MockAttempt.user_id.in_(cohort_user_ids),
                    MockAttempt.is_completed == True
                )
            )
        )
        all_attempts = list(attempts_result.scalars().all())
        
        # Calculate average accuracy
        total_questions = 0
        total_correct = 0
        for attempt in all_attempts:
            total_questions += attempt.total_questions or 0
            total_correct += attempt.correct_count or 0
        
        avg_accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
        
        return {
            "cohort_size": len(cohort_user_ids),
            "total_attempts": total_attempts,
            "avg_mocks_taken": total_attempts / len(cohort_user_ids) if cohort_user_ids else 0,
            "avg_accuracy": round(avg_accuracy, 2)
        }
    
    # ============ Physical Readiness ============
    
    async def get_physical_readiness_data(self, user_id: UUID) -> dict:
        """Get physical readiness data for a user."""
        from ..physical.models import PhysicalProgressLog
        from ..users.models import Profile
        
        # Get user profile
        result = await self.db.execute(
            select(Profile).where(Profile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        
        # Get physical progress logs
        logs_result = await self.db.execute(
            select(PhysicalProgressLog)
            .where(
                and_(
                    PhysicalProgressLog.user_id == user_id,
                    PhysicalProgressLog.is_completed == True
                )
            )
        )
        logs = list(logs_result.scalars().all())
        
        # Calculate readiness factors
        height_measured = profile and profile.height_cm and profile.height_cm > 0
        weight_measured = profile and profile.weight_kg and profile.weight_kg > 0
        
        # PET readiness - at least some progress logged
        pet_ready = len(logs) > 0
        
        # Check for running progress (most important for PET)
        running_logs = [l for l in logs if l.activity_type == "running"]
        has_running_progress = len(running_logs) > 0
        
        return {
            "height_measured": height_measured,
            "weight_measured": weight_measured,
            "pet_ready": pet_ready,
            "has_running_progress": has_running_progress,
            "total_progress_logs": len(logs),
            "running_sessions": len(running_logs),
            "gender": profile.gender if profile else "male"
        }
    
    # ============ Document Readiness ============
    
    async def get_document_readiness_data(self, user_id: UUID) -> dict:
        """Get document readiness data for a user."""
        from ..documents.models import UserDocumentChecklist, DocumentChecklist, DocumentStatus
        from ..users.models import Profile
        
        # Get user profile for gender
        profile_result = await self.db.execute(
            select(Profile).where(Profile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        user_gender = profile.gender if profile else None
        
        # Get user's document submissions
        user_docs_result = await self.db.execute(
            select(UserDocumentChecklist)
            .where(UserDocumentChecklist.user_id == user_id)
        )
        user_docs = list(user_docs_result.scalars().all())
        
        # Get relevant checklists
        checklist_query = select(DocumentChecklist).where(
            DocumentChecklist.is_active == True
        )
        if user_gender:
            checklist_query = checklist_query.where(
                (DocumentChecklist.is_required_for_all == True) |
                (DocumentChecklist.is_required_for_gender == None) |
                (DocumentChecklist.is_required_for_gender == user_gender)
            )
        
        checklists_result = await self.db.execute(checklist_query)
        checklists = list(checklists_result.scalars().all())
        
        # Count verified and pending
        verified_count = sum(
            1 for ud in user_docs 
            if ud.status == DocumentStatus.VERIFIED
        )
        uploaded_count = sum(
            1 for ud in user_docs 
            if ud.status in [DocumentStatus.UPLOADED, DocumentStatus.UNDER_VERIFICATION, DocumentStatus.VERIFIED]
        )
        total_required = len(checklists)
        
        return {
            "verified_count": verified_count,
            "uploaded_count": uploaded_count,
            "total_required": total_required,
            "completion_percentage": (verified_count / total_required * 100) if total_required > 0 else 0
        }
