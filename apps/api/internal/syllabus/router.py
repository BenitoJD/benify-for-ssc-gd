"""
API router for syllabus module.

Provides endpoints for:
- GET /api/v1/subjects - List all subjects
- GET /api/v1/subjects/{id} - Get subject details
- GET /api/v1/subjects/{id}/topics - List topics for a subject
- GET /api/v1/topics/{id} - Get topic details
- GET /api/v1/topics/{id}/lessons - List lessons for a topic
- GET /api/v1/lessons/{id} - Get lesson details
- POST /api/v1/lessons/{id}/complete - Mark lesson as complete
- DELETE /api/v1/lessons/{id}/complete - Unmark lesson as complete
- POST /api/v1/lessons/{id}/bookmark - Toggle bookmark
- GET /api/v1/users/me/bookmarks - Get user's bookmarks
- POST /api/v1/lessons/{id}/notes - Create/update note
- DELETE /api/v1/lessons/{id}/notes - Delete note
- GET /api/v1/users/me/notes - Get user's notes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.dependencies import get_current_user, TokenData
from .schemas import (
    SubjectListResponse,
    SubjectResponse,
    TopicListResponse,
    TopicResponse,
    LessonListResponse,
    LessonDetailResponse,
    NoteCreate,
    NoteResponse,
    BookmarkResponse,
    BookmarksBySubject,
    NotesBySubject,
    LessonProgressResponse,
    TopicProgressResponse,
    SubjectProgressResponse,
)
from .service import SyllabusService

router = APIRouter(tags=["Syllabus"])


# ============ Subject Endpoints ============

@router.get("/subjects", response_model=List[SubjectListResponse])
async def get_subjects(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all subjects with topic counts and user progress."""
    service = SyllabusService(db)
    return await service.get_all_subjects(UUID(current_user.user_id))


@router.get("/subjects/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get subject by ID with progress."""
    service = SyllabusService(db)
    try:
        return await service.get_subject_by_id(
            UUID(subject_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subject ID format"
        )


@router.get("/subjects/{subject_id}/topics", response_model=List[TopicListResponse])
async def get_subject_topics(
    subject_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all topics for a subject with lesson counts and progress."""
    service = SyllabusService(db)
    try:
        return await service.get_topics_by_subject(
            UUID(subject_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subject ID format"
        )


# ============ Topic Endpoints ============

@router.get("/topics/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get topic by ID with progress."""
    service = SyllabusService(db)
    try:
        return await service.get_topic_by_id(
            UUID(topic_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid topic ID format"
        )


@router.get("/topics/{topic_id}/lessons", response_model=List[LessonListResponse])
async def get_topic_lessons(
    topic_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all lessons for a topic with completion and bookmark status."""
    service = SyllabusService(db)
    try:
        return await service.get_lessons_by_topic(
            UUID(topic_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid topic ID format"
        )


@router.get("/topics/{topic_id}/progress", response_model=TopicProgressResponse)
async def get_topic_progress(
    topic_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get progress for a specific topic."""
    service = SyllabusService(db)
    try:
        return await service.get_topic_progress(
            UUID(topic_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid topic ID format"
        )


# ============ Lesson Endpoints ============

@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full lesson details including user's note and bookmark status."""
    service = SyllabusService(db)
    try:
        return await service.get_lesson_by_id(
            UUID(lesson_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )


@router.post("/lessons/{lesson_id}/complete", response_model=LessonProgressResponse)
async def mark_lesson_complete(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a lesson as completed."""
    service = SyllabusService(db)
    try:
        return await service.mark_lesson_complete(
            UUID(lesson_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )


@router.delete("/lessons/{lesson_id}/complete")
async def unmark_lesson_complete(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a lesson as not completed (undo completion)."""
    service = SyllabusService(db)
    try:
        result = await service.unmark_lesson_complete(
            UUID(lesson_id), UUID(current_user.user_id)
        )
        return {"message": "Lesson unmarked as complete" if result else "Lesson was not completed"}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )


@router.post("/lessons/{lesson_id}/bookmark")
async def toggle_bookmark(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle bookmark for a lesson.
    
    Returns whether the lesson is now bookmarked (true) or not (false).
    """
    service = SyllabusService(db)
    try:
        is_bookmarked, created = await service.toggle_bookmark(
            UUID(lesson_id), UUID(current_user.user_id)
        )
        return {
            "is_bookmarked": is_bookmarked,
            "message": "Bookmark added" if is_bookmarked else "Bookmark removed"
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )


# ============ Note Endpoints ============

@router.post("/lessons/{lesson_id}/notes", response_model=NoteResponse)
async def create_or_update_note(
    lesson_id: str,
    data: NoteCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update a personal note for a lesson."""
    service = SyllabusService(db)
    try:
        return await service.create_or_update_note(
            UUID(lesson_id), UUID(current_user.user_id), data
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )


@router.delete("/lessons/{lesson_id}/notes")
async def delete_note(
    lesson_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a personal note for a lesson."""
    service = SyllabusService(db)
    try:
        result = await service.delete_note(
            UUID(lesson_id), UUID(current_user.user_id)
        )
        return {"message": "Note deleted" if result else "No note found to delete"}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )


# ============ User Bookmarks/Notes Endpoints ============

@router.get("/users/me/bookmarks", response_model=List[BookmarksBySubject])
async def get_user_bookmarks(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all bookmarked lessons grouped by subject and topic."""
    service = SyllabusService(db)
    return await service.get_user_bookmarks(UUID(current_user.user_id))


@router.get("/users/me/notes", response_model=List[NotesBySubject])
async def get_user_notes(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all personal notes grouped by subject and topic."""
    service = SyllabusService(db)
    return await service.get_user_notes(UUID(current_user.user_id))


# ============ Progress Endpoints ============

@router.get("/subjects/{subject_id}/progress", response_model=SubjectProgressResponse)
async def get_subject_progress(
    subject_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get progress for a specific subject."""
    service = SyllabusService(db)
    try:
        return await service.get_subject_progress(
            UUID(subject_id), UUID(current_user.user_id)
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subject ID format"
        )
