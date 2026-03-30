from sqlalchemy import Column, String, DateTime, Boolean, Float, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base
from ..auth.schemas import UserRole, SubscriptionStatus
from .schemas import Language, Level


class Profile(Base):
    """User profile extension."""
    
    __tablename__ = "profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Personal info
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Preferences
    language_preference = Column(String(10), default="en", nullable=False)
    
    # Onboarding
    target_exam_year = Column(Integer, nullable=True)
    current_level = Column(SQLEnum(Level), nullable=True)
    daily_study_hours = Column(Float, nullable=True)
    onboarding_complete = Column(Boolean, default=False, nullable=False)
    
    # Contact
    phone = Column(String(20), nullable=True)
    phone_verified = Column(Boolean, default=False, nullable=False)
    
    # Physical (for PST/PET)
    gender = Column(String(10), nullable=True)  # male, female
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    physical_fitness_baseline = Column(String(20), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Profile {self.user_id}>"


class UserStats(Base):
    """User statistics."""
    
    __tablename__ = "user_stats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Activity stats
    total_lessons_completed = Column(Integer, default=0, nullable=False)
    total_tests_taken = Column(Integer, default=0, nullable=False)
    total_study_hours = Column(Float, default=0, nullable=False)
    total_focus_minutes = Column(Integer, default=0, nullable=False)
    
    # Streak
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime, nullable=True)
    
    # Calculated fields
    overall_progress = Column(Float, default=0, nullable=False)  # percentage
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<UserStats {self.user_id}>"
