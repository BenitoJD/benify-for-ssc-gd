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
    STUDY_REMINDER = "study_reminder"
    EXAM_ALERT = "exam_alert"
    DOCUMENT_DEADLINE = "document_deadline"
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
    study_reminder_enabled: bool = True
    exam_alert_enabled: bool = True
    document_deadline_enabled: bool = True
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
    
    @property
    def preferences(self) -> dict:
        """Return preferences as a dictionary for API compatibility."""
        return {
            "streak_reminder": self.streak_reminder_enabled,
            "study_reminder": self.study_reminder_enabled,
            "exam_alert": self.exam_alert_enabled,
            "document_deadline": self.document_deadline_enabled,
            "badge_earned": self.badge_earned_enabled,
            "reply_received": self.replies_enabled,
            "answer_accepted": self.answer_accepted_enabled,
            "upvote_milestone": self.upvote_milestone_enabled,
            "announcement": self.announcement_enabled,
        }


# ============================================================================
# Push Token Schemas
# ============================================================================

class PushTokenCreate(BaseModel):
    """Schema for registering a push token."""
    fcm_token: str = Field(..., min_length=1, description="FCM registration token")
    subscription_info: Optional[dict] = Field(
        None,
        description="Push subscription info (endpoint, keys, etc.)"
    )


class PushTokenResponse(BaseModel):
    """Schema for push token response."""
    success: bool
    message: str
    token_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True


class PushTokenDeleteResponse(BaseModel):
    """Schema for deleting a push token."""
    success: bool
    message: str
