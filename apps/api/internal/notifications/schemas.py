"""
Pydantic schemas for notifications.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class NotificationType(str, Enum):
    """Types of notifications."""
    REPLY = "reply"
    ANSWER_ACCEPTED = "answer_accepted"
    UPVOTE_MILESTONE = "upvote_milestone"
    BADGE_EARNED = "badge_earned"
    STREAK_REMINDER = "streak_reminder"
    ANNOUNCEMENT = "announcement"


# ============================================================================
# Notification Schemas
# ============================================================================

class NotificationBase(BaseModel):
    """Base notification schema."""
    type: NotificationType
    title: str = Field(..., max_length=255)
    message: str = Field(..., max_length=1000)
    action_url: Optional[str] = Field(None, max_length=500)


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    pass


class NotificationResponse(NotificationBase):
    """Schema for notification response."""
    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Paginated notification list response."""
    items: List[NotificationResponse]
    total: int
    page: int
    limit: int
    pages: int


class NotificationUnreadCount(BaseModel):
    """Unread notification count response."""
    unread_count: int


class NotificationMarkRead(BaseModel):
    """Response after marking notification as read."""
    success: bool
    notification_id: UUID


class NotificationMarkAllRead(BaseModel):
    """Response after marking all notifications as read."""
    success: bool
    marked_count: int


# ============================================================================
# Notification Preference Schemas
# ============================================================================

class NotificationPreferenceBase(BaseModel):
    """Base notification preference schema."""
    replies_enabled: bool = True
    answer_accepted_enabled: bool = True
    upvote_milestone_enabled: bool = True
    badge_earned_enabled: bool = True
    streak_reminder_enabled: bool = True
    announcement_enabled: bool = True


class NotificationPreferenceUpdate(NotificationPreferenceBase):
    """Schema for updating notification preferences."""
    pass


class NotificationPreferenceResponse(NotificationPreferenceBase):
    """Schema for notification preference response."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
