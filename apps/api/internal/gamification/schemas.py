"""
Pydantic schemas for gamification endpoints.
"""
from pydantic import ConfigDict, BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class BadgeType(str, Enum):
    """Types of badges."""
    FIRST_ACCEPTED_ANSWER = "first_accepted_answer"
    WEEK_WARRIOR = "week_warrior"
    MONTH_MASTER = "month_master"
    FIRST_MOCK = "first_mock"
    FIRST_LESSON = "first_lesson"
    PERFECT_SCORE = "perfect_score"
    STREAK_3_DAYS = "streak_3_days"
    STREAK_7_DAYS = "streak_7_days"
    STREAK_30_DAYS = "streak_30_days"
    FIRST_DISCUSSION = "first_discussion"
    HELPFUL_MEMBER = "helpful_member"


class AchievementType(str, Enum):
    """Types of achievements."""
    FOCUS_10H = "focus_10h"
    FOCUS_50H = "focus_50h"
    FOCUS_100H = "focus_100h"
    FIRST_SUBJECT_COMPLETE = "first_subject_complete"
    ALL_SUBJECTS_COMPLETE = "all_subjects_complete"
    TESTS_10 = "tests_10"
    TESTS_50 = "tests_50"
    TESTS_100 = "tests_100"


class PomodoroStatus(str, Enum):
    """Pomodoro session status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MissionType(str, Enum):
    """Types of daily missions."""
    LESSON = "lesson"
    TEST = "test"
    REVISION = "revision"
    PHYSICAL = "physical"
    COMMUNITY = "community"
    POMODORO = "pomodoro"


class MissionStatus(str, Enum):
    """Daily mission status."""
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"


# ============================================================================
# Badge Schemas
# ============================================================================

class BadgeBase(BaseModel):
    """Base badge schema."""
    name: str
    description: str
    badge_type: BadgeType
    icon_url: Optional[str] = None


class BadgeResponse(BadgeBase):
    """Badge response schema."""
    id: UUID
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserBadgeResponse(BaseModel):
    """User badge with badge details."""
    id: UUID
    badge_id: UUID
    earned_at: datetime
    badge: BadgeResponse
    
    model_config = ConfigDict(from_attributes=True)


class UserBadgesResponse(BaseModel):
    """List of badges earned by user."""
    badges: List[UserBadgeResponse]
    total_count: int


# ============================================================================
# Achievement Schemas
# ============================================================================

class AchievementBase(BaseModel):
    """Base achievement schema."""
    name: str
    description: str
    achievement_type: AchievementType
    icon_url: Optional[str] = None


class AchievementResponse(AchievementBase):
    """Achievement response schema."""
    id: UUID
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserAchievementResponse(BaseModel):
    """User achievement with achievement details."""
    id: UUID
    achievement_id: UUID
    unlocked_at: datetime
    achievement: AchievementResponse
    
    model_config = ConfigDict(from_attributes=True)


class UserAchievementsResponse(BaseModel):
    """List of achievements unlocked by user."""
    achievements: List[UserAchievementResponse]
    total_count: int


# ============================================================================
# Streak Schemas
# ============================================================================

class StreakStatsResponse(BaseModel):
    """User streak statistics."""
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime] = None
    streak_freezes_available: int  # 1 if not used this week, 0 if used
    streak_freezes_used_this_week: int
    total_focus_minutes: int
    total_pomodoro_sessions: int


class StreakFreezeResponse(BaseModel):
    """Streak freeze record."""
    id: UUID
    freeze_date: datetime
    used_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Pomodoro Schemas
# ============================================================================

class PomodoroStartRequest(BaseModel):
    """Request to start a Pomodoro session."""
    duration_minutes: int = Field(default=25, ge=1, le=60)
    study_type: Optional[str] = Field(None, max_length=50)
    study_reference_id: Optional[UUID] = None


class PomodoroStartResponse(BaseModel):
    """Response after starting a Pomodoro session."""
    session_id: UUID
    started_at: datetime
    duration_minutes: int
    status: PomodoroStatus


class PomodoroCompleteRequest(BaseModel):
    """Request to complete a Pomodoro session."""
    session_id: UUID


class PomodoroCompleteResponse(BaseModel):
    """Response after completing a Pomodoro session."""
    session_id: UUID
    completed_at: datetime
    focus_minutes: int
    status: PomodoroStatus
    new_total_focus_minutes: int
    new_total_focus_hours: float
    badges_earned: List[BadgeResponse] = []
    achievements_unlocked: List[AchievementResponse] = []


class PomodoroCancelRequest(BaseModel):
    """Request to cancel a Pomodoro session."""
    session_id: UUID


class PomodoroCancelResponse(BaseModel):
    """Response after cancelling a Pomodoro session."""
    session_id: UUID
    cancelled_at: datetime
    status: PomodoroStatus
    partial_focus_minutes: int  # Time actually spent


class PomodoroSessionResponse(BaseModel):
    """Pomodoro session details."""
    id: UUID
    duration_minutes: int
    status: PomodoroStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    focus_minutes: int
    study_type: Optional[str] = None
    study_reference_id: Optional[UUID] = None
    
    model_config = ConfigDict(from_attributes=True)


class PomodoroActiveResponse(BaseModel):
    """Current active Pomodoro session."""
    has_active_session: bool
    session: Optional[PomodoroSessionResponse] = None


class PomodoroStatsResponse(BaseModel):
    """Pomodoro statistics for a user."""
    total_sessions: int
    total_focus_minutes: int
    total_focus_hours: float
    sessions_today: int
    focus_minutes_today: int
    current_streak: int


# ============================================================================
# Daily Mission Schemas
# ============================================================================

class DailyMissionBase(BaseModel):
    """Base daily mission schema."""
    mission_type: MissionType
    title: str
    description: Optional[str] = None
    target_value: int = 1


class DailyMissionResponse(DailyMissionBase):
    """Daily mission response."""
    id: UUID
    user_id: UUID
    current_value: int = 0
    status: MissionStatus
    reference_id: Optional[UUID] = None
    bonus_streak_points: int
    date: datetime
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class DailyMissionsResponse(BaseModel):
    """List of daily missions for a user."""
    missions: List[DailyMissionResponse]
    total_count: int
    completed_count: int
    bonus_streak_points_available: int


class DailyMissionCompleteRequest(BaseModel):
    """Request to mark a daily mission as complete."""
    mission_id: UUID


class DailyMissionCompleteResponse(BaseModel):
    """Response after completing a daily mission."""
    mission: DailyMissionResponse
    bonus_streak_points_earned: int
    new_current_streak: int


# ============================================================================
# Gamification Dashboard Schema
# ============================================================================

class GamificationDashboardResponse(BaseModel):
    """Combined gamification data for dashboard."""
    streak: StreakStatsResponse
    pomodoro: PomodoroStatsResponse
    badges: UserBadgesResponse
    achievements: UserAchievementsResponse
    today_missions: DailyMissionsResponse
    active_pomodoro: PomodoroActiveResponse
