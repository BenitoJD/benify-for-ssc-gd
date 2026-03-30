"""
Pydantic schemas for syllabus module.

Includes request/response schemas for subjects, topics, lessons,
notes, bookmarks, and progress tracking.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ============ Subject Schemas ============

class SubjectBase(BaseModel):
    """Base subject schema."""
    name: str
    code: str
    description: Optional[str] = None
    icon_url: Optional[str] = None


class SubjectCreate(SubjectBase):
    """Schema for creating a subject."""
    order_index: int = 0


class SubjectUpdate(BaseModel):
    """Schema for updating a subject."""
    name: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    order_index: Optional[int] = None


class SubjectResponse(SubjectBase):
    """Response schema for a subject."""
    id: UUID
    order_index: int
    topic_count: int = 0  # Computed field
    completed_count: int = 0  # Computed field for user's progress
    progress_percentage: float = 0.0  # Computed field
    
    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    """Response schema for listing subjects."""
    id: str
    name: str
    code: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    topic_count: int = 0
    progress_percentage: float = 0.0
    
    class Config:
        from_attributes = True


# ============ Topic Schemas ============

class TopicBase(BaseModel):
    """Base topic schema."""
    name: str
    description: Optional[str] = None
    estimated_hours: Optional[float] = None


class TopicCreate(TopicBase):
    """Schema for creating a topic."""
    subject_id: UUID
    order_index: int = 0


class TopicUpdate(BaseModel):
    """Schema for updating a topic."""
    name: Optional[str] = None
    description: Optional[str] = None
    estimated_hours: Optional[float] = None
    order_index: Optional[int] = None


class TopicResponse(TopicBase):
    """Response schema for a topic."""
    id: UUID
    subject_id: UUID
    order_index: int
    lesson_count: int = 0  # Computed field
    completed_count: int = 0  # Computed field for user's progress
    progress_percentage: float = 0.0  # Computed field
    
    class Config:
        from_attributes = True


class TopicListResponse(BaseModel):
    """Response schema for listing topics."""
    id: str
    name: str
    description: Optional[str] = None
    estimated_hours: Optional[float] = None
    lesson_count: int = 0
    completed_count: int = 0
    progress_percentage: float = 0.0
    
    class Config:
        from_attributes = True


# ============ Lesson Schemas ============

class LessonBase(BaseModel):
    """Base lesson schema."""
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    estimated_minutes: Optional[int] = None
    is_premium: bool = False


class LessonCreate(LessonBase):
    """Schema for creating a lesson."""
    topic_id: UUID
    order_index: int = 0


class LessonUpdate(BaseModel):
    """Schema for updating a lesson."""
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    estimated_minutes: Optional[int] = None
    is_premium: Optional[bool] = None
    order_index: Optional[int] = None


class LessonResponse(LessonBase):
    """Response schema for a lesson."""
    id: UUID
    topic_id: UUID
    order_index: int
    is_completed: bool = False  # Computed: user's completion status
    is_bookmarked: bool = False  # Computed: user's bookmark status
    
    class Config:
        from_attributes = True


class LessonListResponse(BaseModel):
    """Response schema for listing lessons."""
    id: str
    title: str
    video_url: Optional[str] = None
    estimated_minutes: Optional[int] = None
    is_premium: bool = False
    is_completed: bool = False
    is_bookmarked: bool = False
    
    class Config:
        from_attributes = True


class LessonDetailResponse(LessonBase):
    """Response schema for lesson detail (full content)."""
    id: UUID
    topic_id: UUID
    order_index: int
    is_completed: bool = False
    is_bookmarked: bool = False
    personal_note: Optional[str] = None  # User's note if exists
    
    class Config:
        from_attributes = True


# ============ Note Schemas ============

class NoteBase(BaseModel):
    """Base note schema."""
    personal_notes: str = Field(..., min_length=1)


class NoteCreate(NoteBase):
    """Schema for creating a note."""
    lesson_id: Optional[UUID] = None  # Optional - lesson_id comes from path, not body


class NoteUpdate(BaseModel):
    """Schema for updating a note."""
    personal_notes: str = Field(..., min_length=1)


class NoteResponse(BaseModel):
    """Response schema for a note."""
    id: UUID
    user_id: UUID
    lesson_id: UUID
    personal_notes: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NoteWithLessonResponse(BaseModel):
    """Response schema for note with lesson details."""
    id: str
    lesson_id: str
    lesson_title: str
    topic_id: str
    topic_name: str
    subject_id: str
    subject_name: str
    personal_notes: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============ Bookmark Schemas ============

class BookmarkResponse(BaseModel):
    """Response schema for a bookmark."""
    id: UUID
    user_id: UUID
    lesson_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookmarkWithDetailsResponse(BaseModel):
    """Response schema for bookmark with full lesson details."""
    id: str
    lesson_id: str
    lesson_title: str
    topic_id: str
    topic_name: str
    subject_id: str
    subject_name: str
    estimated_minutes: Optional[int] = None
    is_premium: bool = False
    is_completed: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Progress Schemas ============

class LessonProgressResponse(BaseModel):
    """Response schema for lesson progress."""
    id: UUID
    user_id: UUID
    lesson_id: UUID
    completed_at: datetime
    
    class Config:
        from_attributes = True


class TopicProgressResponse(BaseModel):
    """Response schema for topic progress."""
    topic_id: str
    topic_name: str
    total_lessons: int
    completed_lessons: int
    progress_percentage: float


class SubjectProgressResponse(BaseModel):
    """Response schema for subject progress."""
    subject_id: str
    subject_name: str
    total_topics: int
    completed_topics: int
    total_lessons: int
    completed_lessons: int
    progress_percentage: float


# ============ Grouped Responses ============

class BookmarksBySubject(BaseModel):
    """Bookmarks grouped by subject."""
    subject_id: str
    subject_name: str
    bookmarks: List[BookmarkWithDetailsResponse]


class NotesBySubject(BaseModel):
    """Notes grouped by subject."""
    subject_id: str
    subject_name: str
    notes: List[NoteWithLessonResponse]
