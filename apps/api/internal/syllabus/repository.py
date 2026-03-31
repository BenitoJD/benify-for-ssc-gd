"""
Repository layer for syllabus module.

Handles all database operations for subjects, topics, lessons,
notes, bookmarks, and lesson progress.
"""
from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from .models import Subject, Topic, Lesson, Note, Bookmark, LessonProgress


class SyllabusRepository:
    """Repository for syllabus-related database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ============ Subject Operations ============
    
    async def get_all_subjects(self) -> List[Subject]:
        """Get all subjects ordered by order_index."""
        result = await self.db.execute(
            select(Subject).order_by(Subject.order_index)
        )
        return list(result.scalars().all())
    
    async def get_subject_by_id(self, subject_id: UUID) -> Optional[Subject]:
        """Get subject by ID."""
        result = await self.db.execute(
            select(Subject).where(Subject.id == subject_id)
        )
        return result.scalar_one_or_none()
    
    async def get_subject_by_code(self, code: str) -> Optional[Subject]:
        """Get subject by code."""
        result = await self.db.execute(
            select(Subject).where(Subject.code == code)
        )
        return result.scalar_one_or_none()
    
    async def get_subject_topic_count(self, subject_id: UUID) -> int:
        """Get count of topics for a subject."""
        result = await self.db.execute(
            select(func.count(Topic.id)).where(Topic.subject_id == subject_id)
        )
        return result.scalar() or 0
    
    # ============ Topic Operations ============
    
    async def get_topics_by_subject(self, subject_id: UUID) -> List[Topic]:
        """Get all topics for a subject ordered by order_index."""
        result = await self.db.execute(
            select(Topic)
            .where(Topic.subject_id == subject_id)
            .order_by(Topic.order_index)
        )
        return list(result.scalars().all())
    
    async def get_topic_by_id(self, topic_id: UUID) -> Optional[Topic]:
        """Get topic by ID."""
        result = await self.db.execute(
            select(Topic).where(Topic.id == topic_id)
        )
        return result.scalar_one_or_none()
    
    async def get_topic_lesson_count(self, topic_id: UUID) -> int:
        """Get count of lessons for a topic."""
        result = await self.db.execute(
            select(func.count(Lesson.id)).where(Lesson.topic_id == topic_id)
        )
        return result.scalar() or 0
    
    # ============ Lesson Operations ============
    
    async def get_lessons_by_topic(self, topic_id: UUID) -> List[Lesson]:
        """Get all lessons for a topic ordered by order_index."""
        result = await self.db.execute(
            select(Lesson)
            .where(Lesson.topic_id == topic_id)
            .order_by(Lesson.order_index)
        )
        return list(result.scalars().all())
    
    async def get_lesson_by_id(self, lesson_id: UUID) -> Optional[Lesson]:
        """Get lesson by ID with topic and subject loaded."""
        result = await self.db.execute(
            select(Lesson)
            .options(selectinload(Lesson.topic).selectinload(Topic.subject))
            .where(Lesson.id == lesson_id)
        )
        return result.scalar_one_or_none()
    
    async def get_lesson_with_details(self, lesson_id: UUID) -> Optional[Lesson]:
        """Get lesson with full topic and subject details."""
        result = await self.db.execute(
            select(Lesson)
            .options(
                selectinload(Lesson.topic).selectinload(Topic.subject)
            )
            .where(Lesson.id == lesson_id)
        )
        return result.scalar_one_or_none()
    
    async def get_adjacent_lessons(
        self, lesson_id: UUID, topic_id: UUID
    ) -> Tuple[Optional[Lesson], Optional[Lesson]]:
        """Get previous and next lessons for navigation."""
        # Previous lesson
        prev_result = await self.db.execute(
            select(Lesson)
            .where(
                and_(
                    Lesson.topic_id == topic_id,
                    Lesson.order_index < (
                        select(Lesson.order_index)
                        .where(Lesson.id == lesson_id)
                        .scalar_subquery()
                    )
                )
            )
            .order_by(Lesson.order_index.desc())
            .limit(1)
        )
        previous_lesson = prev_result.scalar_one_or_none()
        
        # Next lesson
        next_result = await self.db.execute(
            select(Lesson)
            .where(
                and_(
                    Lesson.topic_id == topic_id,
                    Lesson.order_index > (
                        select(Lesson.order_index)
                        .where(Lesson.id == lesson_id)
                        .scalar_subquery()
                    )
                )
            )
            .order_by(Lesson.order_index.asc())
            .limit(1)
        )
        next_lesson = next_result.scalar_one_or_none()
        
        return previous_lesson, next_lesson
    
    # ============ Note Operations ============
    
    async def get_note_by_user_lesson(
        self, user_id: UUID, lesson_id: UUID
    ) -> Optional[Note]:
        """Get note for a specific user and lesson."""
        result = await self.db.execute(
            select(Note).where(
                and_(
                    Note.user_id == user_id,
                    Note.lesson_id == lesson_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_notes_by_user(self, user_id: UUID) -> List[Note]:
        """Get all notes for a user with lesson details."""
        result = await self.db.execute(
            select(Note)
            .options(selectinload(Note.lesson).selectinload(Lesson.topic).selectinload(Topic.subject))
            .where(Note.user_id == user_id)
            .order_by(Note.updated_at.desc())
        )
        return list(result.scalars().all())
    
    async def create_note(
        self, user_id: UUID, lesson_id: UUID, personal_notes: str
    ) -> Note:
        """Create a new note."""
        note = Note(
            user_id=user_id,
            lesson_id=lesson_id,
            personal_notes=personal_notes
        )
        self.db.add(note)
        await self.db.flush()
        await self.db.refresh(note)
        return note
    
    async def update_note(
        self, note_id: UUID, personal_notes: str
    ) -> Optional[Note]:
        """Update an existing note."""
        result = await self.db.execute(
            select(Note).where(Note.id == note_id)
        )
        note = result.scalar_one_or_none()
        if note:
            note.personal_notes = personal_notes
            await self.db.flush()
            await self.db.refresh(note)
        return note
    
    async def delete_note(self, note_id: UUID) -> bool:
        """Delete a note by ID."""
        result = await self.db.execute(
            select(Note).where(Note.id == note_id)
        )
        note = result.scalar_one_or_none()
        if note:
            await self.db.delete(note)
            await self.db.flush()
            return True
        return False
    
    # ============ Bookmark Operations ============
    
    async def get_bookmark_by_user_lesson(
        self, user_id: UUID, lesson_id: UUID
    ) -> Optional[Bookmark]:
        """Get bookmark for a specific user and lesson."""
        result = await self.db.execute(
            select(Bookmark).where(
                and_(
                    Bookmark.user_id == user_id,
                    Bookmark.lesson_id == lesson_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_bookmarks_by_user(self, user_id: UUID) -> List[Bookmark]:
        """Get all bookmarks for a user with lesson details."""
        result = await self.db.execute(
            select(Bookmark)
            .options(selectinload(Bookmark.lesson).selectinload(Lesson.topic).selectinload(Topic.subject))
            .where(Bookmark.user_id == user_id)
            .order_by(Bookmark.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def create_bookmark(self, user_id: UUID, lesson_id: UUID) -> Optional[Bookmark]:
        """Create a new bookmark with UPSERT behavior.
        
        Handles concurrent requests gracefully by first checking if a bookmark
        exists, and only creating a new one if it doesn't. This approach works
        reliably across both PostgreSQL and SQLite.
        """
        # First check if bookmark already exists
        existing = await self.get_bookmark_by_user_lesson(user_id, lesson_id)
        if existing:
            return existing
        
        # Create new bookmark
        bookmark = Bookmark(user_id=user_id, lesson_id=lesson_id)
        self.db.add(bookmark)
        
        try:
            await self.db.flush()
            await self.db.refresh(bookmark)
            return bookmark
        except Exception:
            # If insert fails (e.g., due to race condition), fetch and return existing
            await self.db.rollback()
            existing = await self.get_bookmark_by_user_lesson(user_id, lesson_id)
            return existing
    
    async def delete_bookmark(self, bookmark_id: UUID) -> bool:
        """Delete a bookmark by ID."""
        result = await self.db.execute(
            select(Bookmark).where(Bookmark.id == bookmark_id)
        )
        bookmark = result.scalar_one_or_none()
        if bookmark:
            await self.db.delete(bookmark)
            await self.db.flush()
            return True
        return False
    
    # ============ Progress Operations ============
    
    async def get_progress_by_user_lesson(
        self, user_id: UUID, lesson_id: UUID
    ) -> Optional[LessonProgress]:
        """Get progress record for a specific user and lesson."""
        result = await self.db.execute(
            select(LessonProgress).where(
                and_(
                    LessonProgress.user_id == user_id,
                    LessonProgress.lesson_id == lesson_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_completed_lessons_by_user_topic(
        self, user_id: UUID, topic_id: UUID
    ) -> List[LessonProgress]:
        """Get all completed lessons for a user in a topic."""
        result = await self.db.execute(
            select(LessonProgress)
            .join(Lesson)
            .where(
                and_(
                    LessonProgress.user_id == user_id,
                    Lesson.topic_id == topic_id
                )
            )
        )
        return list(result.scalars().all())
    
    async def get_completed_lessons_by_user_subject(
        self, user_id: UUID, subject_id: UUID
    ) -> List[LessonProgress]:
        """Get all completed lessons for a user in a subject."""
        result = await self.db.execute(
            select(LessonProgress)
            .join(Lesson)
            .join(Topic)
            .where(
                and_(
                    LessonProgress.user_id == user_id,
                    Topic.subject_id == subject_id
                )
            )
        )
        return list(result.scalars().all())
    
    async def mark_lesson_complete(
        self, user_id: UUID, lesson_id: UUID
    ) -> LessonProgress:
        """Mark a lesson as completed with UPSERT behavior.
        
        Handles concurrent requests gracefully by first checking if progress
        exists, and only creating a new record if it doesn't. This approach
        works reliably across both PostgreSQL and SQLite.
        """
        from datetime import datetime
        
        # First check if progress already exists
        existing = await self.get_progress_by_user_lesson(user_id, lesson_id)
        if existing:
            return existing
        
        # Create new progress record
        progress = LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            completed_at=datetime.utcnow()
        )
        self.db.add(progress)
        
        try:
            await self.db.flush()
            await self.db.refresh(progress)
            return progress
        except Exception:
            # If insert fails (e.g., due to race condition), fetch and return existing
            await self.db.rollback()
            existing = await self.get_progress_by_user_lesson(user_id, lesson_id)
            if existing:
                return existing
            # If still no existing (shouldn't happen), try to create again
            progress = LessonProgress(
                user_id=user_id,
                lesson_id=lesson_id,
                completed_at=datetime.utcnow()
            )
            self.db.add(progress)
            await self.db.flush()
            await self.db.refresh(progress)
            return progress
    
    async def unmark_lesson_complete(
        self, user_id: UUID, lesson_id: UUID
    ) -> bool:
        """Mark a lesson as not completed."""
        result = await self.db.execute(
            select(LessonProgress).where(
                and_(
                    LessonProgress.user_id == user_id,
                    LessonProgress.lesson_id == lesson_id
                )
            )
        )
        progress = result.scalar_one_or_none()
        if progress:
            await self.db.delete(progress)
            await self.db.flush()
            return True
        return False
    
    # ============ Stats Operations ============
    
    async def get_user_topic_progress(
        self, user_id: UUID, topic_id: UUID
    ) -> Tuple[int, int]:
        """Get completed and total lessons for a topic for a user.
        
        Returns: (completed_count, total_count)
        """
        # Total lessons in topic
        total = await self.get_topic_lesson_count(topic_id)
        
        # Completed lessons
        completed_result = await self.db.execute(
            select(func.count(LessonProgress.id))
            .join(Lesson)
            .where(
                and_(
                    LessonProgress.user_id == user_id,
                    Lesson.topic_id == topic_id
                )
            )
        )
        completed = completed_result.scalar() or 0
        
        return completed, total
    
    async def get_user_subject_progress(
        self, user_id: UUID, subject_id: UUID
    ) -> Tuple[int, int, int]:
        """Get completed topics, completed lessons, and total lessons for a subject.
        
        Returns: (completed_topics, completed_lessons, total_lessons)
        """
        # Get all topics in subject
        topics = await self.get_topics_by_subject(subject_id)
        total_lessons = 0
        completed_lessons = 0
        completed_topics = 0
        
        for topic in topics:
            topic_completed, topic_total = await self.get_user_topic_progress(user_id, topic.id)
            total_lessons += topic_total
            completed_lessons += topic_completed
            if topic_total > 0 and topic_completed == topic_total:
                completed_topics += 1
        
        return completed_topics, completed_lessons, total_lessons
