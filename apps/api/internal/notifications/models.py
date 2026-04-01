"""
Notification models for the OLLI Academy(SSC GD) platform.
"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class NotificationType(str, enum.Enum):
    """Types of notifications."""
    REPLY = "reply"
    ANSWER_ACCEPTED = "answer_accepted"
    UPVOTE_MILESTONE = "upvote_milestone"
    BADGE_EARNED = "badge_earned"
    STREAK_REMINDER = "streak_reminder"
    ANNOUNCEMENT = "announcement"
    STUDY_REMINDER = "study_reminder"
    EXAM_ALERT = "exam_alert"
    DOCUMENT_DEADLINE = "document_deadline"


class Notification(Base):
    """Notification model for user notifications."""
    
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    action_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Notification {self.id} - {self.type.value}>"


class NotificationPreference(Base):
    """User notification preferences."""
    
    __tablename__ = "notification_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Toggle for each notification type
    replies_enabled = Column(Boolean, default=True, nullable=False)
    answer_accepted_enabled = Column(Boolean, default=True, nullable=False)
    upvote_milestone_enabled = Column(Boolean, default=True, nullable=False)
    badge_earned_enabled = Column(Boolean, default=True, nullable=False)
    streak_reminder_enabled = Column(Boolean, default=True, nullable=False)
    study_reminder_enabled = Column(Boolean, default=True, nullable=False)
    exam_alert_enabled = Column(Boolean, default=True, nullable=False)
    document_deadline_enabled = Column(Boolean, default=True, nullable=False)
    announcement_enabled = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<NotificationPreference {self.user_id}>"


class PushToken(Base):
    """FCM push token for web push notifications."""
    
    __tablename__ = "push_tokens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    token = Column(Text, nullable=False)
    device_type = Column(String(20), default="web", nullable=False)  # web, ios, android
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Subscription details
    subscription_info = Column(Text, nullable=True)  # JSON string with endpoint and keys
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<PushToken {self.id} - {self.device_type}>"
