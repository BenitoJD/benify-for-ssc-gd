from pydantic import ConfigDict, BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from uuid import UUID

from ..auth.schemas import UserRole, SubscriptionStatus


class Language(str, Enum):
    EN = "en"
    HI = "hi"


class Level(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_preference: Language = Language.EN
    target_exam_year: Optional[int] = None
    current_level: Optional[Level] = None
    daily_study_hours: Optional[float] = Field(None, ge=0, le=24)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    gender: Optional[str] = None
    fitness_level: Optional[Level] = None


class ProfileUpdate(ProfileBase):
    """Fields that can be updated by the user."""
    pass


class ProfileResponse(ProfileBase):
    """Full profile response."""
    id: UUID
    user_id: UUID
    onboarding_complete: bool = False
    phone_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OnboardingRequest(BaseModel):
    """Onboarding step data."""
    language_preference: Optional[Language] = None
    target_exam_year: Optional[int] = None
    current_level: Optional[Level] = None
    daily_study_hours: Optional[float] = Field(None, ge=1, le=24)
    phone: Optional[str] = None
    gender: Optional[str] = None
    fitness_level: Optional[Level] = None


class UserStats(BaseModel):
    """User statistics for dashboard."""
    total_lessons_completed: int = 0
    total_tests_taken: int = 0
    total_study_hours: float = 0
    current_streak: int = 0
    longest_streak: int = 0
    overall_progress: float = 0  # percentage
    weak_areas_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class UsersListResponse(BaseModel):
    """Paginated users list for admin."""
    id: str
    email: str
    name: Optional[str] = None
    role: UserRole
    subscription_status: SubscriptionStatus
    created_at: datetime
    last_login_at: Optional[datetime] = None
    is_active: bool = True


class UserDetailResponse(UsersListResponse):
    """Detailed user info for admin."""
    profile: Optional[ProfileResponse] = None
    stats: Optional[UserStats] = None
