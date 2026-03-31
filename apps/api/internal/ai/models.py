"""
AI module models for advanced AI features.

Includes:
- Spaced repetition (SM-2) data for revision tracking
- Doubt assistant knowledge base
- AI habit nudge records
- Daily summary records
"""
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, Text, Boolean, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class HabitNudgeType(str, enum.Enum):
    """Types of habit nudges."""
    STREAK_REMINDER = "streak_reminder"
    STUDY_REMINDER = "study_reminder"
    EXAM_COUNTDOWN = "exam_countdown"
    WEAK_TOPIC_ALERT = "weak_topic_alert"
    MILESTONE_CELEBRATION = "milestone_celebration"
    WEEKLY_PROGRESS = "weekly_progress"
    STREAK_NUDGE = "streak_nudge"


class HabitNudgeRecord(Base):
    """Records sent habit nudges to avoid duplicates."""
    
    __tablename__ = "habit_nudge_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    nudge_type = Column(String(50), nullable=False)
    
    # Content
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    motivational_quote = Column(String(500), nullable=True)
    
    # Context data (JSON for flexibility)
    context_data = Column(JSON, nullable=True)  # streak, progress, exam_date, etc.
    
    # Status
    was_sent = Column(Boolean, default=False, nullable=False)
    was_read = Column(Boolean, default=False, nullable=False)
    was_clicked = Column(Boolean, default=False, nullable=False)
    
    # Scheduled vs immediate
    is_scheduled = Column(Boolean, default=False, nullable=False)
    scheduled_for = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="habit_nudge_records")
    
    # Indexes
    __table_args__ = (
        Index("ix_habit_nudge_user_type", "user_id", "nudge_type"),
        Index("ix_habit_nudge_scheduled", "scheduled_for", "is_scheduled"),
    )
    
    def __repr__(self):
        return f"<HabitNudgeRecord {self.id} user={self.user_id} type={self.nudge_type}>"


class DailySummaryRecord(Base):
    """Daily summary records for tracking sent summaries."""
    
    __tablename__ = "daily_summary_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Date of the summary
    summary_date = Column(DateTime, nullable=False, index=True)
    
    # Content
    title = Column(String(255), nullable=False)
    message = Column(String(2000), nullable=False)
    motivational_quote = Column(String(500), nullable=True)
    
    # Tasks included
    tasks_summary = Column(JSON, nullable=True)  # List of task titles
    completed_tasks_count = Column(Integer, default=0, nullable=False)
    pending_tasks_count = Column(Integer, default=0, nullable=False)
    
    # Stats included
    stats_data = Column(JSON, nullable=True)  # streak, accuracy, etc.
    
    # Status
    was_sent = Column(Boolean, default=False, nullable=False)
    was_read = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="daily_summary_records")
    
    # Indexes
    __table_args__ = (
        Index("ix_daily_summary_user_date", "user_id", "summary_date"),
    )
    
    def __repr__(self):
        return f"<DailySummaryRecord {self.id} user={self.user_id} date={self.summary_date}>"


class DoubtAssistantKnowledge(Base):
    """Knowledge base for the AI doubt assistant.
    
    Contains common SSC GD questions and answers.
    """
    
    __tablename__ = "doubt_assistant_knowledge"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Question
    question = Column(Text, nullable=False)
    question_keywords = Column(JSON, nullable=True)  # Keywords for matching
    
    # Answer
    answer = Column(Text, nullable=False)
    answer_detailed = Column(Text, nullable=True)  # More detailed explanation
    
    # Category
    category = Column(String(100), nullable=False, index=True)  # reasoning, gk, math, english
    subcategory = Column(String(100), nullable=True)  # blood_relation, coding_decoding, etc.
    
    # Metadata
    source = Column(String(255), nullable=True)  # SSC GD 2023, RS Aggarwal, etc.
    difficulty_level = Column(String(20), nullable=True)  # easy, medium, hard
    
    # Usage stats
    times_queried = Column(Integer, default=0, nullable=False)
    times_found_helpful = Column(Integer, default=0, nullable=False)
    times_marked_unhelpful = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<DoubtAssistantKnowledge {self.id} category={self.category}>"


class SpacedRepetitionData(Base):
    """Spaced repetition data using SM-2 algorithm for each topic per user.
    
    Tracks:
    - Ease factor (difficulty multiplier)
    - Interval (days until next review)
    - Repetitions (number of successful reviews)
    - Next review date
    """
    
    __tablename__ = "spaced_repetition_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False, index=True)
    
    # SM-2 Algorithm fields
    ease_factor = Column(Float, default=2.5, nullable=False)  # Difficulty multiplier (minimum 1.3)
    interval = Column(Integer, default=1, nullable=False)  # Days until next review
    repetitions = Column(Integer, default=0, nullable=False)  # Successful repetitions count
    
    # Quality of last review (0-5 scale, 3+ is pass)
    last_quality = Column(Integer, nullable=True)  # 0-5
    
    # Review dates
    last_review_date = Column(DateTime, nullable=True)
    next_review_date = Column(DateTime, nullable=True, index=True)
    
    # Current accuracy on this topic
    current_accuracy = Column(Float, default=0.0, nullable=False)
    total_attempts = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_mastered = Column(Boolean, default=False, nullable=False)  # True if accuracy > 85% for 5+ reps
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="spaced_repetition_data")
    topic = relationship("Topic", backref="spaced_repetition_data")
    
    # Indexes
    __table_args__ = (
        Index("ix_spaced_rep_user_topic", "user_id", "topic_id", unique=True),
        Index("ix_spaced_rep_next_review", "next_review_date", "is_active"),
    )
    
    def __repr__(self):
        return f"<SpacedRepetitionData user={self.user_id} topic={self.topic_id} ef={self.ease_factor}>"


class AIMockAnalysisRecord(Base):
    """Records of AI mock analysis summaries generated."""
    
    __tablename__ = "ai_mock_analysis_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("mock_attempts.id"), nullable=False)
    
    # Analysis content
    summary_text = Column(Text, nullable=False)  # Main analysis text
    improvement_tips = Column(JSON, nullable=False)  # List of improvement tips per topic
    
    # Per-topic analysis
    topic_analysis = Column(JSON, nullable=True)  # Detailed per-topic feedback
    
    # Overall scores
    overall_accuracy = Column(Float, nullable=False)
    estimated_cutoff = Column(Float, nullable=True)
    improvement_vs_previous = Column(Float, nullable=True)  # Percentage improvement
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="ai_mock_analysis_records")
    attempt = relationship("MockAttempt", backref="ai_analysis")
    
    def __repr__(self):
        return f"<AIMockAnalysisRecord {self.id} user={self.user_id} attempt={self.attempt_id}>"
