"""
SQLAlchemy models for analytics module.

Analytics module provides performance tracking and insights.
"""
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class UserAnalytics(Base):
    """Aggregated user analytics data (cached/pre-computed)."""
    
    __tablename__ = "user_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Overall stats
    total_mocks_taken = Column(Integer, default=0, nullable=False)
    total_questions_attempted = Column(Integer, default=0, nullable=False)
    total_correct_answers = Column(Integer, default=0, nullable=False)
    overall_accuracy = Column(Float, default=0.0, nullable=False)
    
    # Best scores
    best_score = Column(Float, nullable=True)
    best_score_date = Column(DateTime, nullable=True)
    
    # Average scores
    avg_score = Column(Float, nullable=True)
    avg_time_per_question = Column(Float, nullable=True)  # in seconds
    
    # Rank statistics
    avg_rank_percentile = Column(Float, nullable=True)
    best_rank_percentile = Column(Float, nullable=True)
    
    # Streak
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    
    def __repr__(self):
        return f"<UserAnalytics user={self.user_id} accuracy={self.overall_accuracy}>"


class SubjectAnalytics(Base):
    """Subject-wise analytics for a user."""
    
    __tablename__ = "subject_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    
    # Stats
    total_attempts = Column(Integer, default=0, nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    correct_answers = Column(Integer, default=0, nullable=False)
    accuracy = Column(Float, default=0.0, nullable=False)
    
    # Time
    total_time_seconds = Column(Integer, default=0, nullable=False)
    avg_time_per_question = Column(Float, default=0.0, nullable=False)
    
    # Trend (comparing recent vs older attempts)
    recent_accuracy = Column(Float, nullable=True)  # Last 5 attempts
    older_accuracy = Column(Float, nullable=True)  # Attempts before last 5
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    subject = relationship("Subject", lazy="selectin")
    
    # Unique constraint
    __table_args__ = (
        # UniqueConstraint('user_id', 'subject_id', name='uq_user_subject_analytics'),
    )
    
    def __repr__(self):
        return f"<SubjectAnalytics user={self.user_id} subject={self.subject_id} accuracy={self.accuracy}>"


class TopicAnalytics(Base):
    """Topic-wise analytics for a user."""
    
    __tablename__ = "topic_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    
    # Stats
    total_attempts = Column(Integer, default=0, nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    correct_answers = Column(Integer, default=0, nullable=False)
    accuracy = Column(Float, default=0.0, nullable=False)
    
    # Time
    total_time_seconds = Column(Integer, default=0, nullable=False)
    avg_time_per_question = Column(Float, default=0.0, nullable=False)
    
    # Weakness indicator
    error_rate = Column(Float, default=0.0, nullable=False)
    is_weak = Column(String(10), default="no", nullable=False)  # yes, no, borderline
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    topic = relationship("Topic", lazy="selectin")
    
    # Unique constraint
    __table_args__ = (
        # UniqueConstraint('user_id', 'topic_id', name='uq_user_topic_analytics'),
    )
    
    def __repr__(self):
        return f"<TopicAnalytics user={self.user_id} topic={self.topic_id} accuracy={self.accuracy}>"


class RevisionRecommendation(Base):
    """Revision recommendations for a user."""
    
    __tablename__ = "revision_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    
    # Recommendation data
    priority = Column(Integer, default=0, nullable=False)  # 1 = highest
    current_accuracy = Column(Float, default=0.0, nullable=False)
    questions_to_practice = Column(Integer, default=0, nullable=False)
    
    # Links to content
    pyq_filter_url = Column(String(500), nullable=True)  # Pre-built PYQ filter URL
    study_material_url = Column(String(500), nullable=True)  # Link to study material
    
    # Status
    is_completed = Column(String(10), default="pending", nullable=False)  # pending, in_progress, completed
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    topic = relationship("Topic", lazy="selectin")
    
    def __repr__(self):
        return f"<RevisionRecommendation user={self.user_id} topic={self.topic_id} priority={self.priority}>"
