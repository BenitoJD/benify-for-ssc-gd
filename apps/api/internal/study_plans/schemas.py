"""
Pydantic schemas for study plans API.

Defines request/response models for study plan endpoints.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class TaskType(str, Enum):
    LESSON = "lesson"
    TEST = "test"
    REVISION = "revision"
    PRACTICE = "practice"


class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    MISSED = "missed"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class TaskResponse(BaseModel):
    """Daily task response schema."""
    id: str
    study_plan_id: str
    date: datetime
    order_index: int
    task_type: TaskType
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    estimated_minutes: Optional[int] = None
    priority: int
    difficulty: Optional[Difficulty] = None
    is_ai_recommended: bool = False
    ai_reason: Optional[str] = None
    is_revision: bool = False
    revision_interval_days: Optional[int] = None
    next_revision_date: Optional[datetime] = None
    times_revised: int = 0
    status: TaskStatus = TaskStatus.PENDING
    is_from_backlog: bool = False
    completed_at: Optional[datetime] = None
    time_spent_minutes: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class StudyPlanBase(BaseModel):
    """Base study plan schema."""
    title: str
    description: Optional[str] = None
    daily_study_hours_goal: Optional[float] = Field(None, ge=0, le=24)
    exam_date: Optional[datetime] = None


class StudyPlanCreate(StudyPlanBase):
    """Schema for generating a new study plan."""
    pass


class StudyPlanResponse(BaseModel):
    """Full study plan response schema."""
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool = True
    is_ai_generated: bool = True
    daily_study_hours_goal: Optional[float] = None
    exam_date: Optional[datetime] = None
    current_level: Optional[str] = None
    total_tasks: int = 0
    completed_tasks: int = 0
    completion_percentage: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True


class StudyPlanSummary(BaseModel):
    """Summary of study plan without full tasks."""
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool = True
    is_ai_generated: bool = True
    daily_study_hours_goal: Optional[float] = None
    exam_date: Optional[datetime] = None
    total_tasks: int = 0
    completed_tasks: int = 0
    completion_percentage: float = 0.0
    created_at: datetime
    
    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    """Schema for updating a task status."""
    status: TaskStatus
    time_spent_minutes: Optional[int] = Field(None, ge=0)


class TodayTasksResponse(BaseModel):
    """Response schema for today's tasks."""
    date: date
    tasks: List[TaskResponse]
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    streak: int
    streak_message: Optional[str] = None


class WeeklyGoalsResponse(BaseModel):
    """Weekly goals with progress."""
    week_start: date
    week_end: date
    daily_goals: List["DailyGoal"]


class DailyGoal(BaseModel):
    """Daily goal with progress."""
    date: date
    planned_tasks: int
    completed_tasks: int
    completion_percentage: float
    study_hours_completed: float
    study_hours_goal: float


class BacklogTask(BaseModel):
    """Missed/backlog task that needs to be rescheduled."""
    task_id: str
    original_date: datetime
    title: str
    task_type: TaskType
    priority: int
    days_overdue: int


class BacklogRecoveryResponse(BaseModel):
    """Response for backlog recovery."""
    recovered_tasks: List[BacklogTask]
    new_schedule_dates: dict[str, datetime]  # task_id -> new_date


class SpacedRepetitionTask(BaseModel):
    """Task scheduled for spaced repetition revision."""
    topic_id: str
    topic_name: str
    current_interval: int  # days
    next_interval: int  # days (calculated)
    ease_factor: float
    repetitions: int
    next_review_date: datetime
    questions_to_review: int


class RevisionPlanResponse(BaseModel):
    """AI-powered revision plan using spaced repetition."""
    topics_to_revise: List[SpacedRepetitionTask]
    total_revision_tasks: int
    estimated_minutes: int
    priority_order: List[str]  # topic_ids in priority order


# Update forward references
WeeklyGoalsResponse.model_rebuild()
