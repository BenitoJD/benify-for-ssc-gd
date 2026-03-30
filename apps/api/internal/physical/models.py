"""
SQLAlchemy models for physical training module.

Includes: PhysicalPlan, PhysicalProgressLog models.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base
import enum


class PhysicalPlanType(str, enum.Enum):
    """Physical plan type enumeration."""
    RUNNING = "running"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    MIXED = "mixed"


class PhysicalGoalGender(str, enum.Enum):
    """Target gender for physical plans."""
    MALE = "male"
    FEMALE = "female"
    ALL = "all"


class PhysicalPlan(Base):
    """Physical training plan model."""
    
    __tablename__ = "physical_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Plan configuration
    plan_type = Column(SQLEnum(PhysicalPlanType), nullable=False)
    target_gender = Column(SQLEnum(PhysicalGoalGender), default=PhysicalGoalGender.ALL, nullable=False)
    duration_weeks = Column(Integer, nullable=False, default=8)
    
    # Content
    exercises = Column(Text, nullable=True)  # JSON array of exercises with sets, reps, duration
    schedule = Column(Text, nullable=True)  # JSON schedule of weekly workouts
    targets = Column(Text, nullable=True)  # JSON targets (e.g., 1.5km in 7 minutes)
    
    # Access control
    is_premium = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Metadata
    difficulty_level = Column(String(20), nullable=True)  # beginner, intermediate, advanced
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<PhysicalPlan {self.id}: {self.title}>"


class PhysicalProgressLog(Base):
    """Model for tracking user's physical training progress."""
    
    __tablename__ = "physical_progress_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    physical_plan_id = Column(UUID(as_uuid=True), ForeignKey("physical_plans.id"), nullable=True)
    
    # Log data
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    activity_type = Column(String(50), nullable=False)  # running, strength, flexibility
    
    # Metrics
    duration_minutes = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)  # For running
    pace_min_per_km = Column(Float, nullable=True)  # For running
    sets_reps = Column(Text, nullable=True)  # JSON for strength training
    weight_kg = Column(Float, nullable=True)  # For strength training
    
    # Performance metrics
    performance_rating = Column(Integer, nullable=True)  # 1-5 rating
    notes = Column(Text, nullable=True)
    
    # Completion status
    is_completed = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    physical_plan = relationship("PhysicalPlan", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<PhysicalProgressLog {self.id}: user={self.user_id} activity={self.activity_type}>"
