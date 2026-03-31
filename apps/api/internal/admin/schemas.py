from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from ..auth.schemas import UserRole, SubscriptionStatus


class AdminLoginRequest(BaseModel):
    """Admin login request."""
    email: EmailStr
    password: str


class AdminDashboardStats(BaseModel):
    """Admin dashboard statistics."""
    total_users: int
    active_subscriptions: int
    daily_active_users: int
    reports_count: int
    total_lessons_completed: int
    total_tests_taken: int


class AdminDashboardResponse(BaseModel):
    """Admin dashboard response."""
    stats: AdminDashboardStats
    recent_registrations: list
    recent_activity: list


class UserStatusUpdateRequest(BaseModel):
    """Request to update user status."""
    is_active: bool


class UserStatusUpdateResponse(BaseModel):
    """Response for user status update."""
    id: str
    is_active: bool
    message: str


class ProfileInfo(BaseModel):
    """Profile info for admin user detail."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language_preference: str = "en"
    target_exam_year: Optional[int] = None
    current_level: Optional[str] = None
    daily_study_hours: Optional[float] = None
    onboarding_complete: bool = False
    phone: Optional[str] = None
    phone_verified: bool = False
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    physical_fitness_baseline: Optional[str] = None


class UserStatsInfo(BaseModel):
    """User stats for admin user detail."""
    total_lessons_completed: int = 0
    total_tests_taken: int = 0
    total_study_hours: float = 0
    total_focus_minutes: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    overall_progress: float = 0


class AdminUserListItem(BaseModel):
    """User list item for admin."""
    id: str
    email: str
    name: Optional[str] = None
    role: UserRole
    subscription_status: SubscriptionStatus
    created_at: datetime
    last_login_at: Optional[datetime] = None
    is_active: bool = True


class AdminUserDetail(BaseModel):
    """Detailed user info for admin."""
    id: str
    email: str
    name: Optional[str] = None
    role: UserRole
    subscription_status: SubscriptionStatus
    created_at: datetime
    last_login_at: Optional[datetime] = None
    is_active: bool = True
    profile: Optional[ProfileInfo] = None
    stats: Optional[UserStatsInfo] = None


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    pages: int


class PaginatedUsersResponse(BaseModel):
    """Paginated users list response."""
    data: List[AdminUserListItem]
    meta: PaginationMeta
