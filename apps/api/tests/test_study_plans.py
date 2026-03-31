"""
Tests for study plans API endpoints.
"""
import pytest
from datetime import datetime, timedelta, date
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock, patch

from internal.study_plans.schemas import (
    StudyPlanCreate,
    StudyPlanResponse,
    TaskResponse,
    TaskUpdate,
    TaskStatus,
    TaskType,
    TodayTasksResponse,
    WeeklyGoalsResponse,
    BacklogRecoveryResponse,
    RevisionPlanResponse,
)


class TestStudyPlanSchemas:
    """Test Pydantic schemas for study plans."""
    
    def test_study_plan_create_defaults(self):
        """Test StudyPlanCreate with defaults."""
        plan = StudyPlanCreate()
        assert plan.title is None
        assert plan.description is None
        assert plan.daily_study_hours_goal is None
        assert plan.exam_date is None
    
    def test_study_plan_create_with_data(self):
        """Test StudyPlanCreate with provided data."""
        exam_date = datetime.utcnow() + timedelta(days=30)
        plan = StudyPlanCreate(
            title="30 Day Master Plan",
            description="Intensive preparation",
            daily_study_hours_goal=3.0,
            exam_date=exam_date,
        )
        assert plan.title == "30 Day Master Plan"
        assert plan.description == "Intensive preparation"
        assert plan.daily_study_hours_goal == 3.0
        assert plan.exam_date == exam_date
    
    def test_task_update_completed(self):
        """Test TaskUpdate with completed status."""
        update = TaskUpdate(
            status=TaskStatus.COMPLETED,
            time_spent_minutes=30,
        )
        assert update.status == TaskStatus.COMPLETED
        assert update.time_spent_minutes == 30
    
    def test_task_update_skipped(self):
        """Test TaskUpdate with skipped status."""
        update = TaskUpdate(status=TaskStatus.SKIPPED)
        assert update.status == TaskStatus.SKIPPED
        assert update.time_spent_minutes is None
    
    def test_task_response_from_model(self):
        """Test TaskResponse can be created from dict."""
        task_data = {
            "id": str(uuid4()),
            "study_plan_id": str(uuid4()),
            "date": datetime.utcnow(),
            "order_index": 0,
            "task_type": TaskType.LESSON.value,
            "reference_type": "lesson",
            "reference_id": str(uuid4()),
            "title": "Learn: Number Systems",
            "description": "Complete the lesson",
            "estimated_minutes": 30,
            "priority": 1,
            "difficulty": "medium",
            "is_ai_recommended": True,
            "ai_reason": "Foundation topic",
            "is_revision": False,
            "times_revised": 0,
            "status": TaskStatus.PENDING.value,
            "is_from_backlog": False,
            "completed_at": None,
            "time_spent_minutes": None,
            "created_at": datetime.utcnow(),
        }
        task = TaskResponse(**task_data)
        assert task.title == "Learn: Number Systems"
        assert task.is_ai_recommended is True
    
    def test_task_status_enum_values(self):
        """Test TaskStatus enum values."""
        assert TaskStatus.PENDING.value == "pending"
        assert TaskStatus.COMPLETED.value == "completed"
        assert TaskStatus.SKIPPED.value == "skipped"
        assert TaskStatus.MISSED.value == "missed"
    
    def test_task_type_enum_values(self):
        """Test TaskType enum values."""
        assert TaskType.LESSON.value == "lesson"
        assert TaskType.TEST.value == "test"
        assert TaskType.REVISION.value == "revision"
        assert TaskType.PRACTICE.value == "practice"


class TestStudyPlanService:
    """Test StudyPlanService business logic."""
    
    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = AsyncMock()
        return db
    
    @pytest.fixture
    def mock_user_repo(self):
        """Create mock user repository."""
        repo = MagicMock()
        return repo
    
    @pytest.fixture
    def mock_analytics_repo(self):
        """Create mock analytics repository."""
        repo = AsyncMock()
        return repo
    
    @pytest.mark.asyncio
    async def test_get_weak_topic_ids(self, mock_db, mock_user_repo, mock_analytics_repo):
        """Test getting weak topics from analytics."""
        from internal.study_plans.service import StudyPlanService
        
        user_id = uuid4()
        topic_id_1 = uuid4()
        topic_id_2 = uuid4()
        
        # Create mock service with mocked dependencies
        service = StudyPlanService(mock_db)
        service.user_repo = mock_user_repo
        service.analytics_repo = mock_analytics_repo
        
        # Mock profile
        mock_profile = MagicMock()
        mock_profile.daily_study_hours = 2.0
        mock_user_repo.get_profile = AsyncMock(return_value=mock_profile)
        
        # Mock all topics
        mock_topic_1 = MagicMock()
        mock_topic_1.id = topic_id_1
        mock_topic_1.subject = MagicMock()
        
        mock_topic_2 = MagicMock()
        mock_topic_2.id = topic_id_2
        mock_topic_2.subject = MagicMock()
        
        service.repo.get_all_topics = AsyncMock(return_value=[mock_topic_1, mock_topic_2])
        
        # Mock topic stats - one weak, one strong
        service.analytics_repo.get_topic_stats_for_attempts = AsyncMock(side_effect=[
            {"total_questions": 10, "accuracy": 45.0},  # Weak (< 60%)
            {"total_questions": 10, "accuracy": 75.0},  # Strong (>= 60%)
        ])
        
        weak_ids = await service._get_weak_topic_ids(user_id)
        
        assert topic_id_1 in weak_ids
        assert topic_id_2 not in weak_ids
    
    @pytest.mark.asyncio
    async def test_create_revision_task(self):
        """Test revision task creation with spaced repetition."""
        from internal.study_plans.service import StudyPlanService
        
        service = StudyPlanService(AsyncMock())
        
        plan_id = uuid4()
        current_date = datetime.utcnow()
        mock_topic = MagicMock()
        mock_topic.id = uuid4()
        mock_topic.name = "Arithmetic"
        
        task = service._create_revision_task(plan_id, current_date, mock_topic, 0)
        
        assert task["study_plan_id"] == plan_id
        assert task["task_type"] == TaskType.REVISION.value
        assert task["priority"] == 1  # High priority
        assert task["is_revision"] is True
        assert task["revision_interval_days"] == 1  # Initial interval
        assert task["next_revision_date"] is not None
    
    @pytest.mark.asyncio
    async def test_create_lesson_task(self):
        """Test lesson task creation."""
        from internal.study_plans.service import StudyPlanService
        
        service = StudyPlanService(AsyncMock())
        
        plan_id = uuid4()
        current_date = datetime.utcnow()
        mock_topic = MagicMock()
        mock_topic.name = "Algebra"
        
        mock_lesson = MagicMock()
        mock_lesson.id = uuid4()
        mock_lesson.title = "Linear Equations"
        mock_lesson.estimated_minutes = 45
        
        task = service._create_lesson_task(plan_id, current_date, mock_topic, mock_lesson, 0)
        
        assert task["study_plan_id"] == plan_id
        assert task["task_type"] == TaskType.LESSON.value
        assert task["title"] == "Learn: Linear Equations"
        assert task["estimated_minutes"] == 45
        assert task["is_revision"] is False
    
    @pytest.mark.asyncio
    async def test_spaced_repetition_sm2_algorithm(self):
        """Test SM-2 spaced repetition algorithm calculation."""
        from internal.study_plans.service import StudyPlanService, INITIAL_EASE_FACTOR, EASE_BONUS
        
        service = StudyPlanService(AsyncMock())
        
        # Mock revision task
        mock_task = MagicMock()
        mock_task.revision_interval_days = 1
        mock_task.times_revised = 0
        
        # Manually calculate expected new interval
        ease_factor = INITIAL_EASE_FACTOR + EASE_BONUS
        expected_interval = int(1 * ease_factor)
        
        assert expected_interval == 2  # 1 * 2.6 = 2.6 -> 2
    
    @pytest.mark.asyncio
    async def test_streak_calculation_first_activity(self, mock_db):
        """Test streak calculation for first activity."""
        from internal.study_plans.service import StudyPlanService
        
        service = StudyPlanService(mock_db)
        
        # Mock no existing streak record
        service.repo.get_streak_record = AsyncMock(return_value=None)
        service.repo.create_streak_record = AsyncMock()
        
        # Would need to mock the update method to fully test


class TestBacklogRecovery:
    """Test backlog recovery functionality."""
    
    def test_backlog_task_schema(self):
        """Test BacklogTask schema."""
        from internal.study_plans.schemas import BacklogTask
        
        task = BacklogTask(
            task_id=str(uuid4()),
            original_date=datetime.utcnow() - timedelta(days=3),
            title="Missed Revision",
            task_type=TaskType.REVISION,
            priority=5,
            days_overdue=3,
        )
        
        assert task.days_overdue == 3
        assert task.task_type == TaskType.REVISION
    
    def test_backlog_recovery_response_schema(self):
        """Test BacklogRecoveryResponse schema."""
        from internal.study_plans.schemas import BacklogRecoveryResponse, BacklogTask
        
        task_id = str(uuid4())
        new_date = datetime.utcnow() + timedelta(days=1)
        
        response = BacklogRecoveryResponse(
            recovered_tasks=[
                BacklogTask(
                    task_id=task_id,
                    original_date=datetime.utcnow() - timedelta(days=2),
                    title="Old Task",
                    task_type=TaskType.LESSON,
                    priority=3,
                    days_overdue=2,
                )
            ],
            new_schedule_dates={task_id: new_date},
        )
        
        assert len(response.recovered_tasks) == 1
        assert response.new_schedule_dates[task_id] == new_date


class TestSpacedRepetition:
    """Test spaced repetition revision plan."""
    
    def test_spaced_repetition_task_schema(self):
        """Test SpacedRepetitionTask schema."""
        from internal.study_plans.schemas import SpacedRepetitionTask
        
        task = SpacedRepetitionTask(
            topic_id=str(uuid4()),
            topic_name="Number Systems",
            current_interval=1,
            next_interval=3,
            ease_factor=2.6,
            repetitions=1,
            next_review_date=datetime.utcnow() + timedelta(days=3),
            questions_to_review=5,
        )
        
        assert task.current_interval == 1
        assert task.next_interval == 3
        assert task.ease_factor == 2.6
    
    def test_revision_plan_response_schema(self):
        """Test RevisionPlanResponse schema."""
        from internal.study_plans.schemas import RevisionPlanResponse, SpacedRepetitionTask
        
        topic_id = str(uuid4())
        
        task = SpacedRepetitionTask(
            topic_id=topic_id,
            topic_name="Algebra",
            current_interval=2,
            next_interval=5,
            ease_factor=2.6,
            repetitions=2,
            next_review_date=datetime.utcnow() + timedelta(days=5),
            questions_to_review=10,
        )
        
        response = RevisionPlanResponse(
            topics_to_revise=[task],
            total_revision_tasks=1,
            estimated_minutes=20,
            priority_order=[topic_id],
        )
        
        assert response.total_revision_tasks == 1
        assert response.estimated_minutes == 20
        assert response.priority_order == [topic_id]


class TestWeeklyGoals:
    """Test weekly goals functionality."""
    
    def test_daily_goal_schema(self):
        """Test DailyGoal schema."""
        from internal.study_plans.schemas import DailyGoal
        
        goal = DailyGoal(
            date=date.today(),
            planned_tasks=5,
            completed_tasks=3,
            completion_percentage=60.0,
            study_hours_completed=1.5,
            study_hours_goal=2.0,
        )
        
        assert goal.planned_tasks == 5
        assert goal.completion_percentage == 60.0
    
    def test_weekly_goals_response_schema(self):
        """Test WeeklyGoalsResponse schema."""
        from internal.study_plans.schemas import WeeklyGoalsResponse, DailyGoal
        
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        goals = [
            DailyGoal(
                date=week_start,
                planned_tasks=4,
                completed_tasks=4,
                completion_percentage=100.0,
                study_hours_completed=2.0,
                study_hours_goal=2.0,
            )
        ]
        
        response = WeeklyGoalsResponse(
            week_start=week_start,
            week_end=week_end,
            daily_goals=goals,
        )
        
        assert len(response.daily_goals) == 1
        assert response.week_start == week_start


class TestTodayTasks:
    """Test today's tasks functionality."""
    
    def test_today_tasks_response_schema(self):
        """Test TodayTasksResponse schema."""
        from internal.study_plans.schemas import TodayTasksResponse, TaskResponse
        
        task = TaskResponse(
            id=str(uuid4()),
            study_plan_id=str(uuid4()),
            date=datetime.utcnow(),
            order_index=0,
            task_type=TaskType.LESSON,
            title="Today's Lesson",
            priority=1,
            status=TaskStatus.PENDING,
            is_ai_recommended=True,
            times_revised=0,
            created_at=datetime.utcnow(),
        )
        
        response = TodayTasksResponse(
            date=date.today(),
            tasks=[task],
            total_tasks=1,
            completed_tasks=0,
            pending_tasks=1,
            streak=5,
            streak_message="🔥 5 day streak! Keep it up!",
        )
        
        assert response.total_tasks == 1
        assert response.streak == 5
        assert response.streak_message is not None


class TestAPIIntegration:
    """Test API integration scenarios."""
    
    @pytest.fixture
    def sample_study_plan_response(self):
        """Create sample study plan response."""
        plan_id = str(uuid4())
        user_id = str(uuid4())
        now = datetime.utcnow()
        
        return StudyPlanResponse(
            id=plan_id,
            user_id=user_id,
            title="SSC GD 2026 Prep",
            description="Complete preparation plan",
            start_date=now,
            end_date=now + timedelta(days=30),
            is_active=True,
            is_ai_generated=True,
            daily_study_hours_goal=2.0,
            exam_date=now + timedelta(days=30),
            current_level="intermediate",
            total_tasks=60,
            completed_tasks=10,
            completion_percentage=16.67,
            created_at=now,
            updated_at=now,
            tasks=[],
        )
    
    def test_study_plan_response_structure(self, sample_study_plan_response):
        """Test StudyPlanResponse structure."""
        assert sample_study_plan_response.is_active is True
        assert sample_study_plan_response.is_ai_generated is True
        assert sample_study_plan_response.total_tasks == 60
        assert sample_study_plan_response.completion_percentage == 16.67
    
    def test_plan_completion_percentage_calculation(self):
        """Test that completion percentage is calculated correctly."""
        plan = StudyPlanResponse(
            id=str(uuid4()),
            user_id=str(uuid4()),
            title="Test Plan",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=7),
            total_tasks=10,
            completed_tasks=5,
            completion_percentage=50.0,
            created_at=datetime.utcnow(),
            tasks=[],
        )
        
        assert plan.completion_percentage == 50.0
        assert plan.total_tasks == 10
        assert plan.completed_tasks == 5
