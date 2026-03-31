"""
Pydantic schemas for AI advanced features.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from enum import Enum


# ========================================================================
# Enums
# ========================================================================

class NudgeType(str, Enum):
    """Types of habit nudges."""
    STREAK_REMINDER = "streak_reminder"
    STUDY_REMINDER = "study_reminder"
    EXAM_COUNTDOWN = "exam_countdown"
    WEAK_TOPIC_ALERT = "weak_topic_alert"
    MILESTONE_CELEBRATION = "milestone_celebration"
    WEEKLY_PROGRESS = "weekly_progress"
    STREAK_NUDGE = "streak_nudge"


class TaskType(str, Enum):
    """Types of tasks for revision."""
    LESSON = "lesson"
    TEST = "test"
    REVISION = "revision"
    PRACTICE = "practice"


class TaskStatus(str, Enum):
    """Task completion status."""
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    MISSED = "missed"


# ========================================================================
# AI Mock Analysis Schemas
# ========================================================================

class TopicImprovementTip(BaseModel):
    """Improvement tip for a specific topic."""
    topic_id: UUID
    topic_name: str
    subject_name: str
    current_accuracy: float
    tip_text: str
    priority: int  # 1 = highest


class AIMockAnalysisResponse(BaseModel):
    """AI-generated mock analysis summary."""
    attempt_id: UUID
    summary_text: str  # Main analysis text
    overall_accuracy: float
    topic_improvement_tips: List[TopicImprovementTip]
    estimated_cutoff: Optional[float] = None
    improvement_vs_previous: Optional[float] = None
    key_strengths: List[str]
    priority_improvements: List[str]
    generated_at: datetime


class AIMockAnalysisRequest(BaseModel):
    """Request to generate AI mock analysis."""
    attempt_id: UUID


# ========================================================================
# AI Revision Planner (SM-2 Spaced Repetition) Schemas
# ========================================================================

class SpacedRepetitionTopic(BaseModel):
    """Spaced repetition data for a topic."""
    topic_id: UUID
    topic_name: str
    subject_name: str
    ease_factor: float
    interval: int  # Days
    repetitions: int
    current_accuracy: float
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    is_mastered: bool = False


class RevisionPlanResponse(BaseModel):
    """AI-powered revision plan with spaced repetition."""
    topics_to_revise: List[SpacedRepetitionTopic]
    total_topics: int
    estimated_minutes: int
    priority_order: List[UUID]  # Topic IDs in priority order
    upcoming_reviews: List[dict]  # Next 7 days of reviews


class SM2ReviewRequest(BaseModel):
    """Submit a review result for SM-2 algorithm."""
    topic_id: UUID
    quality: int = Field(..., ge=0, le=5, description="Quality of recall (0-5, 3+ is pass)")


class SM2ReviewResponse(BaseModel):
    """Response after SM-2 review calculation."""
    topic_id: UUID
    new_ease_factor: float
    new_interval: int
    new_repetitions: int
    next_review_date: Optional[datetime] = None
    message: str  # Encouragement or tip


class RevisionScheduleResponse(BaseModel):
    """Revision schedule for the next N days."""
    date: date
    topics: List[SpacedRepetitionTopic]
    estimated_minutes: int


class FullRevisionScheduleResponse(BaseModel):
    """Full revision schedule."""
    schedules: List[RevisionScheduleResponse]
    total_reviews_today: int
    total_reviews_this_week: int


# ========================================================================
# AI Habit Nudges Schemas
# ========================================================================

class HabitNudgeResponse(BaseModel):
    """A single habit nudge."""
    id: UUID
    nudge_type: NudgeType
    title: str
    message: str
    motivational_quote: Optional[str] = None
    context_data: Optional[dict] = None
    created_at: datetime


class HabitNudgesListResponse(BaseModel):
    """List of habit nudges."""
    nudges: List[HabitNudgeResponse]
    total_count: int


class HabitNudgeGenerateRequest(BaseModel):
    """Request to generate habit nudge (usually automatic, but can request)."""
    nudge_type: Optional[NudgeType] = None  # Specific type or auto-detect


class HabitNudgeMarkReadRequest(BaseModel):
    """Mark a nudge as read/clicked."""
    nudge_id: UUID
    was_clicked: bool = False


# ========================================================================
# AI Doubt Assistant Schemas
# ========================================================================

class DoubtAssistantQueryRequest(BaseModel):
    """Query to the AI doubt assistant."""
    question: str = Field(..., min_length=5, max_length=500)
    category: Optional[str] = Field(None, description="Optional category filter")


class DoubtAssistantAnswer(BaseModel):
    """Answer from the doubt assistant."""
    question: str  # Original question (for confirmation)
    answer: str
    answer_detailed: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    source: Optional[str] = None
    confidence: float  # 0-1
    related_topics: Optional[List[str]] = None


class DoubtAssistantQueryResponse(BaseModel):
    """Response from the doubt assistant."""
    query: str
    answer: DoubtAssistantAnswer
    found_knowledge_id: Optional[UUID] = None
    suggestions: List[str]  # Related questions user might ask


class DoubtAssistantFeedbackRequest(BaseModel):
    """Feedback on an answer."""
    knowledge_id: UUID
    is_helpful: bool


# ========================================================================
# Daily Summary Schemas
# ========================================================================

class DailyTaskSummary(BaseModel):
    """Summary of a single task."""
    task_id: UUID
    title: str
    task_type: TaskType
    status: TaskStatus
    completed_at: Optional[datetime] = None


class DailySummaryResponse(BaseModel):
    """Daily summary for a user."""
    date: date
    title: str
    message: str
    motivational_quote: Optional[str] = None
    
    # Today's tasks
    tasks: List[DailyTaskSummary]
    completed_tasks_count: int
    pending_tasks_count: int
    
    # Progress stats
    current_streak: int
    overall_accuracy: float
    weak_topics_count: int
    
    # Upcoming
    next_exam_days: Optional[int] = None
    upcoming_reviews_count: int
    
    was_sent: bool = False
    sent_at: Optional[datetime] = None


class DailySummaryRequest(BaseModel):
    """Request today's daily summary."""
    pass  # No params needed, derived from user


class DailySummaryPreferences(BaseModel):
    """User preferences for daily summary."""
    enabled: bool = True
    send_time: str = "08:00"  # HH:MM format
    include_motivational_quote: bool = True
    include_tasks: bool = True
    include_stats: bool = True


# ========================================================================
# Generic AI Response
# ========================================================================

class AISuccessResponse(BaseModel):
    """Generic success response for AI operations."""
    success: bool = True
    message: str
    data: Optional[dict] = None
