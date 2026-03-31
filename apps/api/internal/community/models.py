"""
Community models for discussions, replies, upvotes, and reported content.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class DiscussionStatus(str, enum.Enum):
    """Discussion status enum."""
    ACTIVE = "active"
    PINNED = "pinned"
    HIDDEN = "hidden"
    DELETED = "deleted"


class Discussion(Base):
    """Discussion/Doubt model.
    
    Users can post doubts/questions and other users can reply and upvote.
    """
    
    __tablename__ = "discussions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Content
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)  # Question/doubt body
    topic_tag = Column(String(100), nullable=True)  # e.g., "Mathematics", "Reasoning", "GK"
    
    # Engagement metrics
    upvotes = Column(Integer, default=0, nullable=False)
    reply_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    
    # Status
    is_answered = Column(Boolean, default=False, nullable=False)  # Has accepted answer
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)  # Soft delete by moderator
    status = Column(String(20), default=DiscussionStatus.ACTIVE.value, nullable=False)
    
    # Accepted answer
    accepted_reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="discussions")
    replies = relationship("DiscussionReply", back_populates="discussion", cascade="all, delete-orphan", foreign_keys="[DiscussionReply.discussion_id]")
    upvotes_records = relationship("DiscussionUpvote", back_populates="discussion", cascade="all, delete-orphan", foreign_keys="[DiscussionUpvote.discussion_id]")
    
    # Indexes
    __table_args__ = (
        Index("ix_discussions_user_created", "user_id", "created_at"),
        Index("ix_discussions_topic_tag", "topic_tag"),
        Index("ix_discussions_status_created", "status", "created_at"),
    )
    
    def __repr__(self):
        return f"<Discussion {self.id}: {self.title[:50]}>"


class DiscussionReply(Base):
    """Reply to a discussion.
    
    Users can reply to doubts with their answer/solution.
    """
    
    __tablename__ = "discussion_replies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    discussion_id = Column(UUID(as_uuid=True), ForeignKey("discussions.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Content
    content = Column(Text, nullable=False)  # Reply body
    
    # Engagement
    upvotes = Column(Integer, default=0, nullable=False)
    is_accepted_answer = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    discussion = relationship("Discussion", back_populates="replies", foreign_keys="[DiscussionReply.discussion_id]")
    user = relationship("User", backref="discussion_replies")
    upvotes_records = relationship("DiscussionUpvote", back_populates="reply", cascade="all, delete-orphan", foreign_keys="[DiscussionUpvote.reply_id]")
    
    # Indexes
    __table_args__ = (
        Index("ix_discussion_replies_discussion_created", "discussion_id", "created_at"),
    )
    
    def __repr__(self):
        return f"<DiscussionReply {self.id} on {self.discussion_id}>"


class UpvoteType(str, enum.Enum):
    """Type of upvote."""
    DISCUSSION = "discussion"
    REPLY = "reply"


class DiscussionUpvote(Base):
    """Upvote on a discussion or reply.
    
    Tracks which users have upvoted what to prevent duplicate upvotes.
    """
    
    __tablename__ = "discussion_upvotes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Target - either discussion or reply
    discussion_id = Column(UUID(as_uuid=True), ForeignKey("discussions.id"), nullable=True, index=True)
    reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id"), nullable=True, index=True)
    
    # Type for clarity
    upvote_type = Column(String(20), nullable=False)  # "discussion" or "reply"
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    discussion = relationship("Discussion", back_populates="upvotes_records", foreign_keys="[DiscussionUpvote.discussion_id]")
    reply = relationship("DiscussionReply", back_populates="upvotes_records", foreign_keys="[DiscussionUpvote.reply_id]")
    user = relationship("User", backref="discussion_upvotes")
    
    # Indexes
    __table_args__ = (
        Index("ix_discussion_upvotes_user_discussion", "user_id", "discussion_id", unique=True),
        Index("ix_discussion_upvotes_user_reply", "user_id", "reply_id", unique=True),
    )
    
    def __repr__(self):
        return f"<DiscussionUpvote {self.id} by {self.user_id}>"


class ReportReason(str, enum.Enum):
    """Reason for reporting content."""
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"
    HARASSMENT = "harassment"
    MISINFORMATION = "misinformation"
    OTHER = "other"


class ReportStatus(str, enum.Enum):
    """Status of a report."""
    PENDING = "pending"
    REVIEWED = "reviewed"
    DISMISSED = "dismissed"
    ACTIONED = "actioned"


class ReportedContent(Base):
    """Reports of inappropriate content.
    
    Users can report discussions or replies that violate community guidelines.
    """
    
    __tablename__ = "reported_content"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Reporter
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Content being reported
    content_type = Column(String(20), nullable=False)  # "discussion" or "reply"
    discussion_id = Column(UUID(as_uuid=True), ForeignKey("discussions.id"), nullable=True, index=True)
    reply_id = Column(UUID(as_uuid=True), ForeignKey("discussion_replies.id"), nullable=True, index=True)
    
    # Report details
    reason = Column(String(30), nullable=False)  # spam, inappropriate, harassment, misinformation, other
    description = Column(Text, nullable=True)  # Additional details
    
    # Moderation
    status = Column(String(20), default=ReportStatus.PENDING.value, nullable=False)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    action_taken = Column(Text, nullable=True)  # What action was taken
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], backref="reports_filed")
    reviewed_by_admin = relationship("User", foreign_keys=[reviewed_by], backref="reports_reviewed")
    discussion = relationship("Discussion", foreign_keys=[discussion_id])
    reply = relationship("DiscussionReply", foreign_keys=[reply_id])
    
    # Indexes
    __table_args__ = (
        Index("ix_reported_content_status", "status"),
        Index("ix_reported_content_created", "created_at"),
    )
    
    def __repr__(self):
        return f"<ReportedContent {self.id}: {self.content_type} {self.reason}>"
