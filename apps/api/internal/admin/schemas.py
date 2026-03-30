from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


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
