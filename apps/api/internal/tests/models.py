"""
SQLAlchemy models for test series module.

Includes: TestSeries, TestQuestion models.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base
import enum


class TestType(str, enum.Enum):
    """Test type enumeration."""
    __test__ = False

    FULL_LENGTH = "full_length"
    SECTIONAL = "sectional"
    CHAPTER = "chapter"
    QUIZ = "quiz"


class TestSeries(Base):
    """Test series model for mock tests."""
    __test__ = False
    
    __tablename__ = "test_series"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    
    # Test configuration
    test_type = Column(SQLEnum(TestType), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=90)
    total_questions = Column(Integer, nullable=False, default=100)
    
    # Marks configuration
    marks_per_question = Column(Float, default=1.0, nullable=False)
    negative_marking = Column(Boolean, default=True, nullable=False)
    negative_marks_per_question = Column(Float, default=0.25, nullable=False)
    
    # Access control
    is_premium = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Optional constraints
    subject_ids = Column(Text, nullable=True)  # JSON array of subject UUIDs for sectional tests
    topic_ids = Column(Text, nullable=True)  # JSON array of topic UUIDs for chapter tests
    
    # Metadata
    instructions = Column(Text, nullable=True)
    passing_percentage = Column(Float, default=35.0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<TestSeries {self.id}: {self.title}>"


class MockAttempt(Base):
    """Model for tracking student's mock test attempts."""
    
    __tablename__ = "mock_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    test_series_id = Column(UUID(as_uuid=True), ForeignKey("test_series.id"), nullable=False)
    
    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)
    
    # Score (calculated on submission)
    total_score = Column(Float, nullable=True)
    max_score = Column(Float, nullable=True)
    correct_count = Column(Integer, nullable=True)
    incorrect_count = Column(Integer, nullable=True)
    unattempted_count = Column(Integer, nullable=True)
    
    # Percentile (calculated after submission)
    rank_percentile = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=False, nullable=False)
    is_submitted = Column(Boolean, default=False, nullable=False)
    
    # Question IDs for this attempt (JSON array - cached from test config)
    question_ids = Column(Text, nullable=False)  # JSON array of question UUIDs
    question_order = Column(Text, nullable=True)  # JSON array defining question order
    
    # Relationships
    user = relationship("User", lazy="selectin")
    test_series = relationship("TestSeries", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<MockAttempt {self.id}: user={self.user_id} test={self.test_series_id}>"


class AttemptAnswer(Base):
    """Model for storing individual question answers in an attempt."""
    
    __tablename__ = "attempt_answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("mock_attempts.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    
    # Answer data
    selected_option = Column(String(10), nullable=True)  # A, B, C, D, or null if unattempted
    is_correct = Column(Boolean, nullable=True)  # Calculated on submission
    marks_obtained = Column(Float, nullable=True)  # Calculated on submission
    
    # Time tracking
    time_spent_seconds = Column(Integer, nullable=True, default=0)
    order_index = Column(Integer, nullable=False)  # Question order in the test
    
    # Status
    is_flagged = Column(Boolean, default=False, nullable=False)  # For question palette marking
    
    # Relationships
    attempt = relationship("MockAttempt", lazy="selectin")
    question = relationship("Question", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Unique constraint: one answer per attempt per question
    __table_args__ = (
        # UniqueConstraint('attempt_id', 'question_id', name='unique_attempt_question'),
    )
    
    def __repr__(self):
        return f"<AttemptAnswer attempt={self.attempt_id} question={self.question_id}>"
