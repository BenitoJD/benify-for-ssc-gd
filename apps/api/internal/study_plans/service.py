"""
Service layer for study plans business logic.

Handles AI-powered study plan generation, spaced repetition revision,
backlog recovery, and streak tracking.
"""
import json
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import StudyPlanRepository
from .schemas import (
    StudyPlanCreate,
    StudyPlanResponse,
    TaskResponse,
    TaskUpdate,
    TaskStatus,
    TodayTasksResponse,
    WeeklyGoalsResponse,
    DailyGoal,
    BacklogRecoveryResponse,
    BacklogTask,
    RevisionPlanResponse,
    SpacedRepetitionTask,
    TaskType,
)
from ..users.repository import UserRepository
from ..analytics.repository import AnalyticsRepository
from .models import StudyPlan, DailyTask


# SM-2 Spaced Repetition Algorithm constants
INITIAL_EASE_FACTOR = 2.5
MIN_EASE_FACTOR = 1.3
EASE_BONUS = 0.1
EASE_PENALTY = 0.2


class StudyPlanService:
    """Service layer for study plan operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = StudyPlanRepository(db)
        self.user_repo = UserRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
    
    async def generate_study_plan(
        self,
        user_id: UUID,
        plan_data: StudyPlanCreate
    ) -> StudyPlanResponse:
        """Generate an AI-powered personalized study plan."""
        # Get user profile for context
        profile = await self.user_repo.get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Get weak topics from analytics
        weak_topic_ids = await self._get_weak_topic_ids(user_id)
        
        # Calculate plan duration based on exam date
        if plan_data.exam_date:
            start_date = datetime.utcnow()
            end_date = plan_data.exam_date
        else:
            # Default: 30 days from now
            start_date = datetime.utcnow()
            end_date = start_date + timedelta(days=30)
        
        # Create study plan
        plan_dict = {
            "user_id": user_id,
            "title": plan_data.title or f"Study Plan {start_date.strftime('%Y-%m-%d')}",
            "description": plan_data.description or "Personalized study plan based on your performance",
            "start_date": start_date,
            "end_date": end_date,
            "is_active": True,
            "is_ai_generated": True,
            "daily_study_hours_goal": plan_data.daily_study_hours_goal or profile.daily_study_hours or 2.0,
            "exam_date": plan_data.exam_date,
            "weak_topic_ids": json.dumps([str(t) for t in weak_topic_ids]) if weak_topic_ids else "[]",
            "current_level": profile.current_level.value if profile.current_level else "beginner",
        }
        
        plan = await self.repo.create_study_plan(plan_dict)
        
        # Generate daily tasks
        tasks = await self._generate_daily_tasks(plan, weak_topic_ids, profile)
        
        # Update plan task counts
        plan.total_tasks = len(tasks)
        await self.repo.update_study_plan(plan, {"total_tasks": len(tasks)})
        
        return await self._build_plan_response(plan)
    
    async def _get_weak_topic_ids(self, user_id: UUID) -> List[UUID]:
        """Get topics where user has low accuracy (<60%)."""
        topics = await self.repo.get_all_topics()
        weak_topic_ids = []
        
        for topic in topics:
            if not topic.subject:
                continue
            
            # Get topic analytics
            stats = await self.analytics_repo.get_topic_stats_for_attempts(
                user_id, topic.id, None, None
            )
            
            if stats["total_questions"] >= 3 and stats["accuracy"] < 60:
                weak_topic_ids.append(topic.id)
        
        return weak_topic_ids
    
    async def _generate_daily_tasks(
        self,
        plan: StudyPlan,
        weak_topic_ids: List[UUID],
        profile
    ) -> List:
        """Generate daily tasks for the study plan using AI logic."""
        tasks_data = []
        current_date = plan.start_date
        task_index = 0
        
        # Get topics and their lessons
        all_topics = await self.repo.get_all_topics()
        topic_lessons = {}
        for topic in all_topics:
            lessons = await self.repo.get_lessons_for_topic(topic.id)
            topic_lessons[topic.id] = lessons
        
        # Calculate days until exam (for future use in prioritizing)
        _days_until_exam = (plan.end_date - current_date).days
        
        # Priority 1: Weak topics (daily revision + practice)
        weak_topics = [t for t in all_topics if t.id in weak_topic_ids]
        
        # Priority 2: Remaining topics (lessons + tests)
        strong_topics = [t for t in all_topics if t.id not in weak_topic_ids]
        
        # Generate tasks day by day
        current_date = plan.start_date
        while current_date <= plan.end_date:
            day_tasks = []
            
            # Check if it's a weekday (prioritize difficult topics on weekdays)
            _is_weekend = current_date.weekday() >= 5
            
            # 1. Revision task for weak topics (spaced repetition)
            for topic in weak_topics[:2]:  # Max 2 revisions per day
                if topic_lessons.get(topic.id):
                    day_tasks.append(self._create_revision_task(
                        plan.id, current_date, topic, task_index
                    ))
                    task_index += 1
            
            # 2. New lesson for weak topics (if not enough revision)
            remaining_slot = 4 - len(day_tasks)  # Max 4 main tasks per day
            
            if remaining_slot > 0:
                for topic in weak_topics[:remaining_slot]:
                    lessons = topic_lessons.get(topic.id, [])
                    if lessons:
                        lesson = lessons[0]  # Take first incomplete lesson
                        day_tasks.append(self._create_lesson_task(
                            plan.id, current_date, topic, lesson, task_index
                        ))
                        task_index += 1
            
            # 3. Lesson for strong topics
            remaining_slot = 6 - len(day_tasks)  # Max 6 tasks per day
            
            if remaining_slot > 0:
                for topic in strong_topics[:remaining_slot]:
                    lessons = topic_lessons.get(topic.id, [])
                    if lessons:
                        lesson = lessons[0]
                        day_tasks.append(self._create_lesson_task(
                            plan.id, current_date, topic, lesson, task_index
                        ))
                        task_index += 1
            
            # 4. Test/practice task (2-3 times per week)
            if current_date.weekday() in [2, 5]:  # Wednesday and Saturday
                day_tasks.append(self._create_test_task(
                    plan.id, current_date, task_index
                ))
                task_index += 1
            
            # Add tasks to list
            for i, task in enumerate(day_tasks):
                task["order_index"] = i
                tasks_data.append(task)
            
            # Move to next day
            current_date += timedelta(days=1)
        
        # Create tasks in database
        created_tasks = await self.repo.create_daily_tasks_bulk(tasks_data)
        return created_tasks
    
    def _create_lesson_task(
        self,
        plan_id: UUID,
        date: datetime,
        topic,
        lesson,
        order: int
    ) -> dict:
        """Create a lesson task."""
        return {
            "study_plan_id": plan_id,
            "date": date,
            "order_index": order,
            "task_type": TaskType.LESSON.value,
            "reference_type": "lesson",
            "reference_id": lesson.id,
            "title": f"Learn: {lesson.title}",
            "description": f"Complete lesson on {topic.name}",
            "estimated_minutes": lesson.estimated_minutes or 30,
            "priority": 2,  # Normal priority
            "difficulty": "medium",
            "is_ai_recommended": True,
            "ai_reason": f"Lesson for {topic.name} - essential for building fundamentals",
            "is_revision": False,
            "status": TaskStatus.PENDING.value,
        }
    
    def _create_revision_task(
        self,
        plan_id: UUID,
        date: datetime,
        topic,
        order: int
    ) -> dict:
        """Create a revision task with spaced repetition."""
        # Initial interval: 1 day
        interval_days = 1
        next_revision = date + timedelta(days=interval_days)
        
        return {
            "study_plan_id": plan_id,
            "date": date,
            "order_index": order,
            "task_type": TaskType.REVISION.value,
            "reference_type": "topic",
            "reference_id": topic.id,
            "title": f"Revise: {topic.name}",
            "description": f"Spaced repetition revision for {topic.name}",
            "estimated_minutes": 20,
            "priority": 1,  # High priority
            "difficulty": "medium",
            "is_ai_recommended": True,
            "ai_reason": "Weak area identified - requires regular revision",
            "is_revision": True,
            "revision_interval_days": interval_days,
            "last_revision_date": None,
            "next_revision_date": next_revision,
            "times_revised": 0,
            "status": TaskStatus.PENDING.value,
        }
    
    def _create_test_task(
        self,
        plan_id: UUID,
        date: datetime,
        order: int
    ) -> dict:
        """Create a test/practice task."""
        return {
            "study_plan_id": plan_id,
            "date": date,
            "order_index": order,
            "task_type": TaskType.TEST.value,
            "reference_type": "test_series",
            "reference_id": None,  # Will be filled with actual test
            "title": "Practice Test",
            "description": "Take a practice test to assess your progress",
            "estimated_minutes": 60,
            "priority": 1,
            "difficulty": "medium",
            "is_ai_recommended": True,
            "ai_reason": "Regular testing helps identify gaps in learning",
            "is_revision": False,
            "status": TaskStatus.PENDING.value,
        }
    
    async def get_user_study_plan(self, user_id: UUID) -> Optional[StudyPlanResponse]:
        """Get the active study plan for a user."""
        plan = await self.repo.get_active_study_plan(user_id)
        if not plan:
            return None
        return await self._build_plan_response(plan)
    
    async def get_study_plan_by_id(self, plan_id: UUID, user_id: UUID) -> StudyPlanResponse:
        """Get a specific study plan by ID."""
        plan = await self.repo.get_study_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Study plan not found")
        if plan.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this plan")
        return await self._build_plan_response(plan)
    
    async def get_today_tasks(self, user_id: UUID) -> TodayTasksResponse:
        """Get today's tasks for the user."""
        today = date.today()
        
        # Get tasks for today
        tasks = await self.repo.get_tasks_for_date(user_id, today)
        
        # Get streak info
        streak_info = await self._update_streak(user_id)
        
        # Count completed/pending
        completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED.value)
        
        # Build response
        task_responses = [TaskResponse.model_validate(t) for t in tasks]
        
        message = None
        if completed == len(tasks) and len(tasks) > 0:
            message = "🎉 Great job! All tasks completed for today!"
        elif streak_info["current_streak"] > 0:
            message = f"🔥 {streak_info['current_streak']} day streak! Keep it up!"
        
        return TodayTasksResponse(
            date=today,
            tasks=task_responses,
            total_tasks=len(tasks),
            completed_tasks=completed,
            pending_tasks=len(tasks) - completed,
            streak=streak_info["current_streak"],
            streak_message=message,
        )
    
    async def update_task_status(
        self,
        plan_id: UUID,
        task_id: UUID,
        user_id: UUID,
        update_data: TaskUpdate
    ) -> TaskResponse:
        """Update task status (complete, skip, etc.)."""
        # Get the task
        task = await self.repo.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Verify ownership
        plan = await self.repo.get_study_plan(plan_id)
        if not plan or plan.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if task.study_plan_id != plan_id:
            raise HTTPException(status_code=400, detail="Task does not belong to this plan")
        
        # Update task
        update_dict = {"status": update_data.status.value}
        if update_data.time_spent_minutes:
            update_dict["time_spent_minutes"] = update_data.time_spent_minutes
        
        # If completing a task
        if update_data.status == TaskStatus.COMPLETED:
            update_dict["completed_at"] = datetime.utcnow()
            
            # Update streak
            await self._update_streak_on_completion(user_id)
            
            # Update plan completion stats
            plan.completed_tasks += 1
            plan.completion_percentage = (
                (plan.completed_tasks / plan.total_tasks * 100) if plan.total_tasks > 0 else 0
            )
            await self.repo.update_study_plan(plan, {
                "completed_tasks": plan.completed_tasks,
                "completion_percentage": plan.completion_percentage
            })
            
            # Handle spaced repetition for revision tasks
            if task.is_revision:
                await self._handle_spaced_repetition(task)
        
        # If skipping a task
        elif update_data.status == TaskStatus.SKIPPED:
            # Could trigger backlog recovery
            pass
        
        # If missing a task (past due and not completed)
        elif update_data.status == TaskStatus.MISSED:
            task.is_from_backlog = True
            task.original_date = task.date
        
        updated_task = await self.repo.update_task(task, update_dict)
        return TaskResponse.model_validate(updated_task)
    
    async def _handle_spaced_repetition(self, task: DailyTask) -> None:
        """Handle SM-2 spaced repetition algorithm for revision tasks."""
        # Calculate new interval using SM-2
        current_interval = task.revision_interval_days or 1
        times_revised = task.times_revised + 1
        
        # SM-2 formula
        # New interval = old interval * ease factor
        # Ease factor adjusts based on performance (simplified - assume good performance)
        ease_factor = INITIAL_EASE_FACTOR + EASE_BONUS
        new_interval = int(current_interval * ease_factor)
        
        # Cap interval at 30 days for long-term retention
        new_interval = min(new_interval, 30)
        
        # Calculate next review date
        next_review = datetime.utcnow() + timedelta(days=new_interval)
        
        await self.repo.update_task(task, {
            "times_revised": times_revised,
            "last_revision_date": datetime.utcnow(),
            "next_revision_date": next_review,
            "revision_interval_days": new_interval,
        })
    
    async def _update_streak(self, user_id: UUID) -> dict:
        """Update and return streak information."""
        record = await self.repo.get_streak_record(user_id)
        if not record:
            record = await self.repo.create_streak_record(user_id)
        
        now = datetime.utcnow()
        today = now.date()
        
        # Check if already active today
        if record.last_activity_date:
            last_date = record.last_activity_date.date()
            if last_date == today:
                # Already active today
                pass
            elif last_date == today - timedelta(days=1):
                # Consecutive day - streak continues
                pass
            elif record.streak_freezes_available > 0:
                # Use a streak freeze
                record.streak_freezes_available -= 1
                record.streak_freezes_used += 1
            else:
                # Streak broken
                record.current_streak = 0
        
        return {
            "current_streak": record.current_streak,
            "longest_streak": record.longest_streak,
            "streak_freezes_available": record.streak_freezes_available,
        }
    
    async def _update_streak_on_completion(self, user_id: UUID) -> None:
        """Update streak when a task is completed."""
        record = await self.repo.get_streak_record(user_id)
        if not record:
            record = await self.repo.create_streak_record(user_id)
        
        now = datetime.utcnow()
        today = now.date()
        
        if record.last_activity_date:
            last_date = record.last_activity_date.date()
            if last_date == today:
                # Already counted today, no change
                pass
            elif last_date == today - timedelta(days=1):
                # Next consecutive day
                record.current_streak += 1
            else:
                # Streak broken or first activity
                record.current_streak = 1
        else:
            # First activity ever
            record.current_streak = 1
        
        # Update longest streak if needed
        if record.current_streak > record.longest_streak:
            record.longest_streak = record.current_streak
        
        record.last_activity_date = now
        
        # Award streak freeze every 7 days
        if record.current_streak > 0 and record.current_streak % 7 == 0:
            record.streak_freezes_available += 1
        
        await self.repo.update_streak_record(record, {
            "current_streak": record.current_streak,
            "longest_streak": record.longest_streak,
            "last_activity_date": record.last_activity_date,
            "streak_freezes_available": record.streak_freezes_available,
            "streak_freezes_used": record.streak_freezes_used,
        })
    
    async def get_backlog_recovery(self, user_id: UUID) -> BacklogRecoveryResponse:
        """Get and reschedule backlog (missed) tasks."""
        backlog_tasks = await self.repo.get_backlog_tasks(user_id)
        
        recovered = []
        new_schedule = {}
        
        for task in backlog_tasks:
            # Calculate new date (push to today or tomorrow)
            new_date = datetime.utcnow() + timedelta(days=1)
            
            # Update task with new date and mark as from backlog
            await self.repo.update_task(task, {
                "date": new_date,
                "is_from_backlog": True,
                "original_date": task.date,
                "priority": max(task.priority, 5),  # Increase priority
            })
            
            # Add to recovery list
            days_overdue = (datetime.utcnow().date() - task.date.date()).days
            recovered.append(BacklogTask(
                task_id=str(task.id),
                original_date=task.date,
                title=task.title,
                task_type=TaskType(task.task_type),
                priority=task.priority,
                days_overdue=days_overdue,
            ))
            
            new_schedule[str(task.id)] = new_date
        
        return BacklogRecoveryResponse(
            recovered_tasks=recovered,
            new_schedule_dates=new_schedule,
        )
    
    async def get_revision_plan(self, user_id: UUID) -> RevisionPlanResponse:
        """Get AI-powered spaced repetition revision plan."""
        now = datetime.utcnow()
        
        # Get all topics for context
        topics = await self.repo.get_all_topics()
        topic_dict = {t.id: t for t in topics}
        
        # Get tasks due for revision
        revision_tasks = await self.repo.get_revision_tasks(user_id, now)
        
        # Build spaced repetition data per topic
        topic_revisions = {}
        for task in revision_tasks:
            if task.reference_id and task.reference_type == "topic":
                topic_id = task.reference_id
                if topic_id not in topic_revisions:
                    topic_revisions[topic_id] = {
                        "topic_id": topic_id,
                        "topic_name": topic_dict.get(topic_id, type('obj', (object,), {'name': 'Unknown'})),
                        "current_interval": task.revision_interval_days or 1,
                        "ease_factor": INITIAL_EASE_FACTOR,
                        "repetitions": task.times_revised,
                        "next_review_date": task.next_revision_date or now,
                        "questions_to_review": 5,  # Default
                    }
        
        # Sort by priority (lowest interval = most urgent)
        sorted_topics = sorted(
            topic_revisions.values(),
            key=lambda x: x["next_review_date"]
        )
        
        # Calculate next intervals using SM-2
        for revision in sorted_topics:
            next_interval = int(revision["current_interval"] * revision["ease_factor"])
            revision["next_interval"] = min(next_interval, 30)
        
        # Build response
        sr_tasks = [
            SpacedRepetitionTask(
                topic_id=str(r["topic_id"]),
                topic_name=r["topic_name"].name if hasattr(r["topic_name"], 'name') else str(r["topic_name"]),
                current_interval=r["current_interval"],
                next_interval=r["next_interval"],
                ease_factor=r["ease_factor"],
                repetitions=r["repetitions"],
                next_review_date=r["next_review_date"],
                questions_to_review=r["questions_to_review"],
            )
            for r in sorted_topics
        ]
        
        total_minutes = sum(20 for _ in sr_tasks)  # 20 min per revision session
        
        return RevisionPlanResponse(
            topics_to_revise=sr_tasks,
            total_revision_tasks=len(sr_tasks),
            estimated_minutes=total_minutes,
            priority_order=[t.topic_id for t in sr_tasks],
        )
    
    async def get_weekly_goals(self, user_id: UUID) -> WeeklyGoalsResponse:
        """Get weekly goals with progress tracking."""
        today = date.today()
        # Start of week (Monday)
        week_start = today - timedelta(days=today.weekday())
        # End of week (Sunday)
        week_end = week_start + timedelta(days=6)
        
        tasks = await self.repo.get_tasks_for_week(user_id, week_start, week_end)
        
        # Group by date
        daily_tasks = {}
        for task in tasks:
            task_date = task.date.date()
            if task_date not in daily_tasks:
                daily_tasks[task_date] = []
            daily_tasks[task_date].append(task)
        
        # Build daily goals
        daily_goals = []
        current_date = week_start
        while current_date <= week_end:
            date_tasks = daily_tasks.get(current_date, [])
            completed = sum(1 for t in date_tasks if t.status == TaskStatus.COMPLETED.value)
            total = len(date_tasks)
            
            # Calculate study hours
            hours_completed = sum(
                (t.time_spent_minutes or 0) / 60 for t in date_tasks
                if t.status == TaskStatus.COMPLETED.value
            )
            
            daily_goals.append(DailyGoal(
                date=current_date,
                planned_tasks=total,
                completed_tasks=completed,
                completion_percentage=((completed / total * 100) if total > 0 else 0),
                study_hours_completed=round(hours_completed, 1),
                study_hours_goal=2.0,  # Default goal
            ))
            
            current_date += timedelta(days=1)
        
        return WeeklyGoalsResponse(
            week_start=week_start,
            week_end=week_end,
            daily_goals=daily_goals,
        )
    
    async def _build_plan_response(self, plan) -> StudyPlanResponse:
        """Build full plan response with tasks."""
        # Get all tasks for the plan
        full_plan = await self.repo.get_study_plan(plan.id)
        tasks = full_plan.tasks if full_plan else []
        
        task_responses = [
            TaskResponse.model_validate(t) for t in sorted(tasks, key=lambda x: (x.date, x.order_index))
        ]
        
        return StudyPlanResponse(
            id=str(plan.id),
            user_id=str(plan.user_id),
            title=plan.title,
            description=plan.description,
            start_date=plan.start_date,
            end_date=plan.end_date,
            is_active=plan.is_active,
            is_ai_generated=plan.is_ai_generated,
            daily_study_hours_goal=plan.daily_study_hours_goal,
            exam_date=plan.exam_date,
            current_level=plan.current_level,
            total_tasks=plan.total_tasks,
            completed_tasks=plan.completed_tasks,
            completion_percentage=plan.completion_percentage,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            tasks=task_responses,
        )
    
    async def get_user_streaks(self, user_id: UUID) -> dict:
        """Get streak information for the user."""
        record = await self.repo.get_streak_record(user_id)
        if not record:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "last_activity_date": None,
                "streak_freezes_available": 0,
                "streak_freezes_used": 0,
            }
        
        return {
            "current_streak": record.current_streak,
            "longest_streak": record.longest_streak,
            "last_activity_date": record.last_activity_date,
            "streak_freezes_available": record.streak_freezes_available,
            "streak_freezes_used": record.streak_freezes_used,
        }
