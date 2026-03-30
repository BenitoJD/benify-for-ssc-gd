"""
SQLAlchemy models for question bank module.

Includes: Question, QuestionOption models.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base
import enum


class QuestionType(str, enum.Enum):
    """Question type enumeration."""
    MCQ = "mcq"
    TRUE_FALSE = "true_false"


class Difficulty(str, enum.Enum):
    """Question difficulty enumeration."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Question(Base):
    """Question model in the question bank."""
    
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    
    # Question content
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), default=QuestionType.MCQ, nullable=False)
    options = Column(Text, nullable=False)  # JSON array of options
    correct_answer = Column(String(10), nullable=False)  # Option key (A, B, C, D)
    explanation = Column(Text, nullable=True)
    
    # Metadata
    difficulty = Column(SQLEnum(Difficulty), default=Difficulty.MEDIUM, nullable=False)
    marks = Column(Float, default=1.0, nullable=False)  # Positive marks
    negative_marks = Column(Float, default=0.25, nullable=False)  # Negative marks
    is_premium = Column(Boolean, default=False, nullable=False)
    
    # Reference info
    source = Column(String(255), nullable=True)  # e.g., "SSC GD 2023", "Mock Test"
    exam_year = Column(Integer, nullable=True)
    
    # Relationships
    topic = relationship("Topic", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Question {self.id}: {self.question_text[:50]}>"
