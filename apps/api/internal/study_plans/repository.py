"""
Repository layer for study plans database operations.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import StudyPlan, DailyTask, StreakRecord
from ..syllabus.models import Lesson, Topic
from ..tests.models import TestSeries


class StudyPlanRepository:
    """Repository for study plan database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_study_plan(self, plan_data: dict) -> StudyPlan:
        """Create a new study plan."""
        plan = StudyPlan(**plan_data)
        self.db.add(plan)
        await self.db.flush()
        await self.db.refresh(plan)
        return plan
    
    async def get_study_plan(self, plan_id: UUID) -> Optional[StudyPlan]:
        """Get a study plan by ID."""
        result = await self.db.execute(
            select(StudyPlan)
            .options(selectinload(StudyPlan.tasks))
            .where(StudyPlan.id == plan_id)
        )
        return result.scalar_one_or_none()
    
    async def get_active_study_plan(self, user_id: UUID) -> Optional[StudyPlan]:
        """Get the active study plan for a user."""
        result = await self.db.execute(
            select(StudyPlan)
            .options(selectinload(StudyPlan.tasks))
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.is_active is True
                )
            )
            .order_by(StudyPlan.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_user_study_plans(self, user_id: UUID) -> List[StudyPlan]:
        """Get all study plans for a user."""
        result = await self.db.execute(
            select(StudyPlan)
            .options(selectinload(StudyPlan.tasks))
            .where(StudyPlan.user_id == user_id)
            .order_by(StudyPlan.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def update_study_plan(self, plan: StudyPlan, update_data: dict) -> StudyPlan:
        """Update a study plan."""
        for key, value in update_data.items():
            if hasattr(plan, key):
                setattr(plan, key, value)
        await self.db.flush()
        await self.db.refresh(plan)
        return plan
    
    async def deactivate_old_plans(self, user_id: UUID, exclude_plan_id: UUID) -> None:
        """Deactivate old study plans when creating a new one."""
        result = await self.db.execute(
            select(StudyPlan)
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.id != exclude_plan_id,
                    StudyPlan.is_active is True
                )
            )
        )
        old_plans = list(result.scalars().all())
        for plan in old_plans:
            plan.is_active = False
        await self.db.flush()
    
    # Daily Tasks
    
    async def create_daily_task(self, task_data: dict) -> DailyTask:
        """Create a new daily task."""
        task = DailyTask(**task_data)
        self.db.add(task)
        await self.db.flush()
        await self.db.refresh(task)
        return task
    
    async def create_daily_tasks_bulk(self, tasks_data: List[dict]) -> List[DailyTask]:
        """Create multiple daily tasks."""
        tasks = [DailyTask(**data) for data in tasks_data]
        self.db.add_all(tasks)
        await self.db.flush()
        for task in tasks:
            await self.db.refresh(task)
        return tasks
    
    async def get_task(self, task_id: UUID) -> Optional[DailyTask]:
        """Get a task by ID."""
        result = await self.db.execute(
            select(DailyTask).where(DailyTask.id == task_id)
        )
        return result.scalar_one_or_none()
    
    async def get_tasks_for_date(self, user_id: UUID, target_date: date) -> List[DailyTask]:
        """Get all tasks for a specific date."""
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        result = await self.db.execute(
            select(DailyTask)
            .join(StudyPlan)
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.is_active is True,
                    DailyTask.date >= start_of_day,
                    DailyTask.date <= end_of_day
                )
            )
            .order_by(DailyTask.order_index)
        )
        return list(result.scalars().all())
    
    async def get_tasks_for_week(
        self, user_id: UUID, week_start: date, week_end: date
    ) -> List[DailyTask]:
        """Get all tasks for a date range (week)."""
        start = datetime.combine(week_start, datetime.min.time())
        end = datetime.combine(week_end, datetime.max.time())
        
        result = await self.db.execute(
            select(DailyTask)
            .join(StudyPlan)
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.is_active is True,
                    DailyTask.date >= start,
                    DailyTask.date <= end
                )
            )
            .order_by(DailyTask.date, DailyTask.order_index)
        )
        return list(result.scalars().all())
    
    async def get_backlog_tasks(self, user_id: UUID) -> List[DailyTask]:
        """Get missed tasks that need to be rescheduled."""
        now = datetime.utcnow()
        
        result = await self.db.execute(
            select(DailyTask)
            .join(StudyPlan)
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.is_active is True,
                    DailyTask.status == "pending",
                    DailyTask.date < now
                )
            )
            .order_by(DailyTask.priority, DailyTask.date)
        )
        return list(result.scalars().all())
    
    async def update_task(self, task: DailyTask, update_data: dict) -> DailyTask:
        """Update a task."""
        for key, value in update_data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        await self.db.flush()
        await self.db.refresh(task)
        return task
    
    async def get_tasks_by_topic(
        self, user_id: UUID, topic_id: UUID
    ) -> List[DailyTask]:
        """Get all tasks for a specific topic."""
        result = await self.db.execute(
            select(DailyTask)
            .join(StudyPlan)
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.is_active is True,
                    DailyTask.reference_type == "topic",
                    DailyTask.reference_id == topic_id
                )
            )
            .order_by(DailyTask.date)
        )
        return list(result.scalars().all())
    
    async def get_revision_tasks(self, user_id: UUID, before_date: datetime) -> List[DailyTask]:
        """Get tasks due for revision."""
        result = await self.db.execute(
            select(DailyTask)
            .join(StudyPlan)
            .where(
                and_(
                    StudyPlan.user_id == user_id,
                    StudyPlan.is_active is True,
                    DailyTask.is_revision is True,
                    DailyTask.next_revision_date is not None,
                    DailyTask.next_revision_date <= before_date,
                    DailyTask.status != "completed"
                )
            )
            .order_by(DailyTask.next_revision_date)
        )
        return list(result.scalars().all())
    
    # Streak Records
    
    async def get_streak_record(self, user_id: UUID) -> Optional[StreakRecord]:
        """Get streak record for a user."""
        result = await self.db.execute(
            select(StreakRecord).where(StreakRecord.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_streak_record(self, user_id: UUID) -> StreakRecord:
        """Create a new streak record."""
        record = StreakRecord(user_id=user_id)
        self.db.add(record)
        await self.db.flush()
        await self.db.refresh(record)
        return record
    
    async def update_streak_record(self, record: StreakRecord, update_data: dict) -> StreakRecord:
        """Update streak record."""
        for key, value in update_data.items():
            if hasattr(record, key):
                setattr(record, key, value)
        await self.db.flush()
        await self.db.refresh(record)
        return record
    
    # Analytics data access
    
    async def get_all_topics(self) -> List[Topic]:
        """Get all topics for generating study plan."""
        result = await self.db.execute(
            select(Topic).options(selectinload(Topic.subject))
        )
        return list(result.scalars().all())
    
    async def get_lessons_for_topic(self, topic_id: UUID) -> List[Lesson]:
        """Get all lessons for a topic."""
        result = await self.db.execute(
            select(Lesson).where(Lesson.topic_id == topic_id)
        )
        return list(result.scalars().all())
    
    async def get_test_series(self, limit: int = 10) -> List[TestSeries]:
        """Get available test series for practice."""
        result = await self.db.execute(
            select(TestSeries)
            .where(TestSeries.is_active is True)
            .limit(limit)
        )
        return list(result.scalars().all())
