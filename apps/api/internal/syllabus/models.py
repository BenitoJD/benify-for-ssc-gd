"""
SQLAlchemy models for syllabus module.

Includes: Subject, Topic, Lesson, Note (user notes on lessons),
Bookmark (user bookmarks), LessonProgress (completion tracking).
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class Subject(Base):
    """Subject model (e.g., General Intelligence, Mathematics)."""
    
    __tablename__ = "subjects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False, unique=True)  # e.g., "GIR", "GKA", "EM", "EH"
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    
    # Relationships
    topics = relationship("Topic", back_populates="subject", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Subject {self.code}: {self.name}>"


class Topic(Base):
    """Topic model belonging to a subject."""
    
    __tablename__ = "topics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    estimated_hours = Column(Float, nullable=True)
    
    # Relationships
    subject = relationship("Subject", back_populates="topics", lazy="selectin")
    lessons = relationship("Lesson", back_populates="topic", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Topic {self.name}>"


class Lesson(Base):
    """Lesson model belonging to a topic."""
    
    __tablename__ = "lessons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)  # Rich text/Markdown content
    video_url = Column(String(500), nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    estimated_minutes = Column(Integer, nullable=True)
    is_premium = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    topic = relationship("Topic", back_populates="lessons", lazy="selectin")
    notes = relationship("Note", back_populates="lesson", lazy="selectin")
    bookmarks = relationship("Bookmark", back_populates="lesson", lazy="selectin")
    progress_records = relationship("LessonProgress", back_populates="lesson", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Lesson {self.title}>"


class Note(Base):
    """User personal notes on lessons."""
    
    __tablename__ = "notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    personal_notes = Column(Text, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    lesson = relationship("Lesson", back_populates="notes", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Note user={self.user_id} lesson={self.lesson_id}>"


class Bookmark(Base):
    """User bookmarks on lessons."""
    
    __tablename__ = "bookmarks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    lesson = relationship("Lesson", back_populates="bookmarks", lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Unique constraint to prevent duplicate bookmarks
    __table_args__ = (
        UniqueConstraint('user_id', 'lesson_id', name='uq_bookmark_user_lesson'),
    )
    
    def __repr__(self):
        return f"<Bookmark user={self.user_id} lesson={self.lesson_id}>"


class LessonProgress(Base):
    """Track user's lesson completion progress."""
    
    __tablename__ = "lesson_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", lazy="selectin")
    lesson = relationship("Lesson", back_populates="progress_records", lazy="selectin")
    
    # Unique constraint: one progress record per user per lesson
    __table_args__ = (
        UniqueConstraint('user_id', 'lesson_id', name='uq_lesson_progress_user_lesson'),
    )
    
    def __repr__(self):
        return f"<LessonProgress user={self.user_id} lesson={self.lesson_id}>"
