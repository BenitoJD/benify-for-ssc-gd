"""
SQLAlchemy models for study plans module.

Provides AI-powered personalized study plans with daily tasks,
spaced repetition revision cycles, backlog recovery, and streak tracking.
"""
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class StudyPlan(Base):
    """AI-generated personalized study plan for a user."""
    
    __tablename__ = "study_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Plan metadata
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Date range
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_ai_generated = Column(Boolean, default=True, nullable=False)
    
    # Settings
    daily_study_hours_goal = Column(Float, nullable=True)  # Target hours per day
    exam_date = Column(DateTime, nullable=True)  # Target SSC GD exam date
    
    # AI configuration
    weak_topic_ids = Column(Text, nullable=True)  # JSON array of weak topic UUIDs
    current_level = Column(String(20), nullable=True)  # beginner, intermediate, advanced
    
    # Progress tracking
    total_tasks = Column(Integer, default=0, nullable=False)
    completed_tasks = Column(Integer, default=0, nullable=False)
    completion_percentage = Column(Float, default=0.0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    tasks = relationship("DailyTask", back_populates="study_plan", lazy="selectin", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<StudyPlan {self.id} user={self.user_id} active={self.is_active}>"


class DailyTask(Base):
    """Daily task within a study plan."""
    
    __tablename__ = "daily_tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_plan_id = Column(UUID(as_uuid=True), ForeignKey("study_plans.id"), nullable=False)
    
    # Date and order
    date = Column(DateTime, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    
    # Task type
    task_type = Column(String(20), nullable=False)  # lesson, test, revision, practice
    
    # Task reference (polymorphic - can reference different entities)
    reference_type = Column(String(20), nullable=True)  # lesson, topic, test_series, pyq
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # ID of the referenced entity
    
    # Task details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    estimated_minutes = Column(Integer, nullable=True)
    
    # Priority and difficulty
    priority = Column(Integer, default=0, nullable=False)  # 1 = highest
    difficulty = Column(String(20), nullable=True)  # easy, medium, hard
    
    # AI recommendation
    is_ai_recommended = Column(Boolean, default=False, nullable=False)
    ai_reason = Column(Text, nullable=True)  # Why AI recommended this task
    
    # Spaced repetition (for revision tasks)
    is_revision = Column(Boolean, default=False, nullable=False)
    revision_interval_days = Column(Integer, nullable=True)  # Days until next revision
    last_revision_date = Column(DateTime, nullable=True)
    next_revision_date = Column(DateTime, nullable=True)
    times_revised = Column(Integer, default=0, nullable=False)
    
    # Status
    status = Column(String(20), default="pending", nullable=False)  # pending, completed, skipped, missed
    
    # Backlog recovery
    is_from_backlog = Column(Boolean, default=False, nullable=False)
    original_date = Column(DateTime, nullable=True)  # Original planned date if rescheduled
    
    # Completion tracking
    completed_at = Column(DateTime, nullable=True)
    time_spent_minutes = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    study_plan = relationship("StudyPlan", back_populates="tasks")
    
    def __repr__(self):
        return f"<DailyTask {self.id} date={self.date} type={self.task_type} status={self.status}>"


class StreakRecord(Base):
    """Daily streak tracking for gamification."""
    
    __tablename__ = "streak_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Streak data
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime, nullable=True)
    
    # Streak freeze (to preserve streak if they miss a day)
    streak_freezes_available = Column(Integer, default=0, nullable=False)
    streak_freezes_used = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    
    def __repr__(self):
        return f"<StreakRecord user={self.user_id} current={self.current_streak}>"
