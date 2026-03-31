"""
Repository layer for AI module database operations.
"""
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, text
from sqlalchemy.orm import selectinload

from .models import (
    HabitNudgeRecord,
    DailySummaryRecord,
    DoubtAssistantKnowledge,
    SpacedRepetitionData,
    AIMockAnalysisRecord,
)
from ..study_plans.models import StreakRecord


class AIRepository:
    """Repository for AI database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ========================================================================
    # Habit Nudge Records
    # ========================================================================
    
    async def create_habit_nudge(
        self,
        user_id: UUID,
        nudge_type: str,
        title: str,
        message: str,
        motivational_quote: Optional[str] = None,
        context_data: Optional[dict] = None,
        is_scheduled: bool = False,
        scheduled_for: Optional[datetime] = None,
    ) -> HabitNudgeRecord:
        """Create a new habit nudge record."""
        nudge = HabitNudgeRecord(
            user_id=user_id,
            nudge_type=nudge_type,
            title=title,
            message=message,
            motivational_quote=motivational_quote,
            context_data=context_data,
            is_scheduled=is_scheduled,
            scheduled_for=scheduled_for,
        )
        self.db.add(nudge)
        await self.db.flush()
        await self.db.refresh(nudge)
        return nudge
    
    async def get_recent_nudges(
        self,
        user_id: UUID,
        limit: int = 10
    ) -> List[HabitNudgeRecord]:
        """Get recent nudges for a user."""
        result = await self.db.execute(
            select(HabitNudgeRecord)
            .where(HabitNudgeRecord.user_id == user_id)
            .order_by(desc(HabitNudgeRecord.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_scheduled_nudges(
        self,
        before_time: datetime,
        limit: int = 100
    ) -> List[HabitNudgeRecord]:
        """Get nudges scheduled to be sent before a certain time."""
        result = await self.db.execute(
            select(HabitNudgeRecord)
            .where(
                and_(
                    HabitNudgeRecord.is_scheduled == True,
                    HabitNudgeRecord.scheduled_for <= before_time,
                    HabitNudgeRecord.was_sent == False
                )
            )
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def mark_nudge_sent(
        self,
        nudge_id: UUID
    ) -> Optional[HabitNudgeRecord]:
        """Mark a nudge as sent."""
        result = await self.db.execute(
            select(HabitNudgeRecord).where(HabitNudgeRecord.id == nudge_id)
        )
        nudge = result.scalar_one_or_none()
        if nudge:
            nudge.was_sent = True
            nudge.sent_at = datetime.utcnow()
            await self.db.flush()
        return nudge
    
    async def mark_nudge_read(
        self,
        nudge_id: UUID,
        was_clicked: bool = False
    ) -> bool:
        """Mark a nudge as read."""
        result = await self.db.execute(
            select(HabitNudgeRecord).where(HabitNudgeRecord.id == nudge_id)
        )
        nudge = result.scalar_one_or_none()
        if nudge:
            nudge.was_read = True
            if was_clicked:
                nudge.was_clicked = True
            await self.db.flush()
            return True
        return False
    
    async def get_today_nudge_for_type(
        self,
        user_id: UUID,
        nudge_type: str
    ) -> Optional[HabitNudgeRecord]:
        """Check if a nudge of this type was already sent today."""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(HabitNudgeRecord)
            .where(
                and_(
                    HabitNudgeRecord.user_id == user_id,
                    HabitNudgeRecord.nudge_type == nudge_type,
                    HabitNudgeRecord.was_sent == True,
                    HabitNudgeRecord.created_at >= today_start
                )
            )
        )
        return result.scalar_one_or_none()
    
    # ========================================================================
    # Daily Summary Records
    # ========================================================================
    
    async def create_daily_summary(
        self,
        user_id: UUID,
        summary_date: datetime,
        title: str,
        message: str,
        motivational_quote: Optional[str] = None,
        tasks_summary: Optional[list] = None,
        completed_tasks_count: int = 0,
        pending_tasks_count: int = 0,
        stats_data: Optional[dict] = None,
    ) -> DailySummaryRecord:
        """Create a daily summary record."""
        summary = DailySummaryRecord(
            user_id=user_id,
            summary_date=summary_date,
            title=title,
            message=message,
            motivational_quote=motivational_quote,
            tasks_summary=tasks_summary,
            completed_tasks_count=completed_tasks_count,
            pending_tasks_count=pending_tasks_count,
            stats_data=stats_data,
        )
        self.db.add(summary)
        await self.db.flush()
        await self.db.refresh(summary)
        return summary
    
    async def get_daily_summary_for_date(
        self,
        user_id: UUID,
        summary_date: date
    ) -> Optional[DailySummaryRecord]:
        """Get daily summary for a specific date."""
        date_start = datetime.combine(summary_date, datetime.min.time())
        date_end = datetime.combine(summary_date, datetime.max.time())
        result = await self.db.execute(
            select(DailySummaryRecord)
            .where(
                and_(
                    DailySummaryRecord.user_id == user_id,
                    DailySummaryRecord.summary_date >= date_start,
                    DailySummaryRecord.summary_date <= date_end
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def mark_summary_sent(
        self,
        summary_id: UUID
    ) -> Optional[DailySummaryRecord]:
        """Mark a summary as sent."""
        result = await self.db.execute(
            select(DailySummaryRecord).where(DailySummaryRecord.id == summary_id)
        )
        summary = result.scalar_one_or_none()
        if summary:
            summary.was_sent = True
            summary.sent_at = datetime.utcnow()
            await self.db.flush()
        return summary
    
    # ========================================================================
    # Doubt Assistant Knowledge Base
    # ========================================================================
    
    async def search_knowledge_base(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 5
    ) -> List[DoubtAssistantKnowledge]:
        """Search knowledge base for matching entries."""
        query_lower = query.lower()
        
        # Build search conditions
        search_conditions = or_(
            DoubtAssistantKnowledge.question.ilike(f"%{query_lower}%"),
            DoubtAssistantKnowledge.question_keywords.op("?")(f"%{query_lower}%"),
        )
        
        if category:
            search_conditions = and_(
                search_conditions,
                DoubtAssistantKnowledge.category == category
            )
        
        result = await self.db.execute(
            select(DoubtAssistantKnowledge)
            .where(
                and_(
                    search_conditions,
                    DoubtAssistantKnowledge.is_active == True
                )
            )
            .order_by(desc(DoubtAssistantKnowledge.times_found_helpful))
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_knowledge_by_id(
        self,
        knowledge_id: UUID
    ) -> Optional[DoubtAssistantKnowledge]:
        """Get a specific knowledge entry."""
        result = await self.db.execute(
            select(DoubtAssistantKnowledge)
            .where(DoubtAssistantKnowledge.id == knowledge_id)
        )
        return result.scalar_one_or_none()
    
    async def increment_knowledge_query_count(
        self,
        knowledge_id: UUID
    ) -> None:
        """Increment the query count for a knowledge entry."""
        result = await self.db.execute(
            select(DoubtAssistantKnowledge).where(DoubtAssistantKnowledge.id == knowledge_id)
        )
        knowledge = result.scalar_one_or_none()
        if knowledge:
            knowledge.times_queried += 1
            await self.db.flush()
    
    async def record_knowledge_feedback(
        self,
        knowledge_id: UUID,
        is_helpful: bool
    ) -> None:
        """Record user feedback on a knowledge entry."""
        result = await self.db.execute(
            select(DoubtAssistantKnowledge).where(DoubtAssistantKnowledge.id == knowledge_id)
        )
        knowledge = result.scalar_one_or_none()
        if knowledge:
            if is_helpful:
                knowledge.times_found_helpful += 1
            else:
                knowledge.times_marked_unhelpful += 1
            await self.db.flush()
    
    async def get_all_active_knowledge(
        self,
        category: Optional[str] = None
    ) -> List[DoubtAssistantKnowledge]:
        """Get all active knowledge entries, optionally filtered by category."""
        query = select(DoubtAssistantKnowledge).where(
            DoubtAssistantKnowledge.is_active == True
        )
        if category:
            query = query.where(DoubtAssistantKnowledge.category == category)
        
        query = query.order_by(DoubtAssistantKnowledge.category, DoubtAssistantKnowledge.question)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    # ========================================================================
    # Spaced Repetition Data (SM-2)
    # ========================================================================
    
    async def get_spaced_rep_data(
        self,
        user_id: UUID,
        topic_id: UUID
    ) -> Optional[SpacedRepetitionData]:
        """Get spaced repetition data for a user-topic pair."""
        result = await self.db.execute(
            select(SpacedRepetitionData)
            .where(
                and_(
                    SpacedRepetitionData.user_id == user_id,
                    SpacedRepetitionData.topic_id == topic_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def create_or_update_spaced_rep(
        self,
        user_id: UUID,
        topic_id: UUID,
        ease_factor: float = 2.5,
        interval: int = 1,
        repetitions: int = 0,
        last_quality: Optional[int] = None,
        last_review_date: Optional[datetime] = None,
        next_review_date: Optional[datetime] = None,
        current_accuracy: float = 0.0,
        total_attempts: int = 0,
    ) -> SpacedRepetitionData:
        """Create or update spaced repetition data."""
        existing = await self.get_spaced_rep_data(user_id, topic_id)
        
        if existing:
            existing.ease_factor = ease_factor
            existing.interval = interval
            existing.repetitions = repetitions
            existing.last_quality = last_quality
            existing.last_review_date = last_review_date
            existing.next_review_date = next_review_date
            existing.current_accuracy = current_accuracy
            existing.total_attempts = total_attempts
            await self.db.flush()
            await self.db.refresh(existing)
            return existing
        else:
            data = SpacedRepetitionData(
                user_id=user_id,
                topic_id=topic_id,
                ease_factor=ease_factor,
                interval=interval,
                repetitions=repetitions,
                last_quality=last_quality,
                last_review_date=last_review_date,
                next_review_date=next_review_date,
                current_accuracy=current_accuracy,
                total_attempts=total_attempts,
            )
            self.db.add(data)
            await self.db.flush()
            await self.db.refresh(data)
            return data
    
    async def get_topics_due_for_review(
        self,
        user_id: UUID,
        before_date: Optional[datetime] = None,
        limit: int = 20
    ) -> List[SpacedRepetitionData]:
        """Get topics due for review."""
        if before_date is None:
            before_date = datetime.utcnow()
        
        result = await self.db.execute(
            select(SpacedRepetitionData)
            .options(selectinload(SpacedRepetitionData.topic).selectinload("subject"))
            .where(
                and_(
                    SpacedRepetitionData.user_id == user_id,
                    SpacedRepetitionData.is_active == True,
                    or_(
                        SpacedRepetitionData.next_review_date <= before_date,
                        SpacedRepetitionData.next_review_date == None
                    )
                )
            )
            .order_by(SpacedRepetitionData.next_review_date)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_upcoming_reviews(
        self,
        user_id: UUID,
        days: int = 7
    ) -> List[Tuple[date, List[SpacedRepetitionData]]]:
        """Get upcoming reviews for the next N days grouped by date."""
        now = datetime.utcnow()
        end_date = now + timedelta(days=days)
        
        result = await self.db.execute(
            select(SpacedRepetitionData)
            .options(selectinload(SpacedRepetitionData.topic).selectinload("subject"))
            .where(
                and_(
                    SpacedRepetitionData.user_id == user_id,
                    SpacedRepetitionData.is_active == True,
                    SpacedRepetitionData.next_review_date != None,
                    SpacedRepetitionData.next_review_date <= end_date
                )
            )
            .order_by(SpacedRepetitionData.next_review_date)
        )
        
        data = list(result.scalars().all())
        
        # Group by date
        grouped = {}
        for item in data:
            if item.next_review_date:
                item_date = item.next_review_date.date()
                if item_date not in grouped:
                    grouped[item_date] = []
                grouped[item_date].append(item)
        
        return [(d, grouped[d]) for d in sorted(grouped.keys())]
    
    async def get_all_active_spaced_rep(
        self,
        user_id: UUID
    ) -> List[SpacedRepetitionData]:
        """Get all active spaced repetition data for a user."""
        result = await self.db.execute(
            select(SpacedRepetitionData)
            .options(selectinload(SpacedRepetitionData.topic).selectinload("subject"))
            .where(
                and_(
                    SpacedRepetitionData.user_id == user_id,
                    SpacedRepetitionData.is_active == True
                )
            )
            .order_by(SpacedRepetitionData.next_review_date)
        )
        return list(result.scalars().all())
    
    # ========================================================================
    # AI Mock Analysis Records
    # ========================================================================
    
    async def create_mock_analysis(
        self,
        user_id: UUID,
        attempt_id: UUID,
        summary_text: str,
        improvement_tips: list,
        topic_analysis: Optional[dict] = None,
        overall_accuracy: float = 0.0,
        estimated_cutoff: Optional[float] = None,
        improvement_vs_previous: Optional[float] = None,
    ) -> AIMockAnalysisRecord:
        """Create an AI mock analysis record."""
        analysis = AIMockAnalysisRecord(
            user_id=user_id,
            attempt_id=attempt_id,
            summary_text=summary_text,
            improvement_tips=improvement_tips,
            topic_analysis=topic_analysis,
            overall_accuracy=overall_accuracy,
            estimated_cutoff=estimated_cutoff,
            improvement_vs_previous=improvement_vs_previous,
        )
        self.db.add(analysis)
        await self.db.flush()
        await self.db.refresh(analysis)
        return analysis
    
    async def get_latest_analysis_for_attempt(
        self,
        attempt_id: UUID
    ) -> Optional[AIMockAnalysisRecord]:
        """Get the latest analysis for an attempt."""
        result = await self.db.execute(
            select(AIMockAnalysisRecord)
            .where(AIMockAnalysisRecord.attempt_id == attempt_id)
            .order_by(desc(AIMockAnalysisRecord.created_at))
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    # ========================================================================
    # Streak Data
    # ========================================================================
    
    async def get_streak_record(
        self,
        user_id: UUID
    ) -> Optional[StreakRecord]:
        """Get streak record for a user."""
        result = await self.db.execute(
            select(StreakRecord).where(StreakRecord.user_id == user_id)
        )
        return result.scalar_one_or_none()
