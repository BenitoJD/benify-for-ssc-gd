"""
Service layer for syllabus module.

Handles business logic for subjects, topics, lessons,
notes, bookmarks, and progress tracking.
"""
from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import SyllabusRepository
from .schemas import (
    SubjectResponse,
    SubjectListResponse,
    TopicResponse,
    TopicListResponse,
    LessonResponse,
    LessonListResponse,
    LessonDetailResponse,
    NoteResponse,
    NoteWithLessonResponse,
    BookmarkResponse,
    BookmarkWithDetailsResponse,
    TopicProgressResponse,
    SubjectProgressResponse,
    LessonProgressResponse,
    NoteCreate,
    NoteUpdate,
    BookmarksBySubject,
    NotesBySubject,
)
from ..shared.exceptions import NotFoundException, ConflictException


class SyllabusService:
    """Service layer for syllabus operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SyllabusRepository(db)
    
    # ============ Subject Operations ============
    
    async def get_all_subjects(self, user_id: Optional[UUID] = None) -> List[SubjectListResponse]:
        """Get all subjects with topic counts and user progress."""
        subjects = await self.repo.get_all_subjects()
        result = []
        
        for subject in subjects:
            topic_count = await self.repo.get_subject_topic_count(subject.id)
            
            progress_percentage = 0.0
            if user_id:
                completed_topics, completed_lessons, total_lessons = \
                    await self.repo.get_user_subject_progress(user_id, subject.id)
                if total_lessons > 0:
                    progress_percentage = (completed_lessons / total_lessons) * 100
            
            result.append(SubjectListResponse(
                id=str(subject.id),
                name=subject.name,
                code=subject.code,
                description=subject.description,
                icon_url=subject.icon_url,
                topic_count=topic_count,
                progress_percentage=round(progress_percentage, 1)
            ))
        
        return result
    
    async def get_subject_by_id(
        self, subject_id: UUID, user_id: Optional[UUID] = None
    ) -> SubjectResponse:
        """Get subject by ID with progress."""
        subject = await self.repo.get_subject_by_id(subject_id)
        if not subject:
            raise NotFoundException("Subject")
        
        topic_count = await self.repo.get_subject_topic_count(subject.id)
        
        progress_percentage = 0.0
        completed_count = 0
        if user_id:
            completed_topics, completed_lessons, total_lessons = \
                await self.repo.get_user_subject_progress(user_id, subject.id)
            if total_lessons > 0:
                progress_percentage = (completed_lessons / total_lessons) * 100
            completed_count = completed_lessons
        
        return SubjectResponse(
            id=subject.id,
            name=subject.name,
            code=subject.code,
            description=subject.description,
            icon_url=subject.icon_url,
            order_index=subject.order_index,
            topic_count=topic_count,
            completed_count=completed_count,
            progress_percentage=round(progress_percentage, 1)
        )
    
    # ============ Topic Operations ============
    
    async def get_topics_by_subject(
        self, subject_id: UUID, user_id: Optional[UUID] = None
    ) -> List[TopicListResponse]:
        """Get all topics for a subject with lesson counts and progress."""
        # Verify subject exists
        subject = await self.repo.get_subject_by_id(subject_id)
        if not subject:
            raise NotFoundException("Subject")
        
        topics = await self.repo.get_topics_by_subject(subject_id)
        result = []
        
        for topic in topics:
            lesson_count = await self.repo.get_topic_lesson_count(topic.id)
            
            progress_percentage = 0.0
            completed_count = 0
            if user_id:
                completed, total = await self.repo.get_user_topic_progress(user_id, topic.id)
                completed_count = completed
                if total > 0:
                    progress_percentage = (completed / total) * 100
            
            result.append(TopicListResponse(
                id=str(topic.id),
                name=topic.name,
                description=topic.description,
                estimated_hours=topic.estimated_hours,
                lesson_count=lesson_count,
                completed_count=completed_count,
                progress_percentage=round(progress_percentage, 1)
            ))
        
        return result
    
    async def get_topic_by_id(
        self, topic_id: UUID, user_id: Optional[UUID] = None
    ) -> TopicResponse:
        """Get topic by ID with progress."""
        topic = await self.repo.get_topic_by_id(topic_id)
        if not topic:
            raise NotFoundException("Topic")
        
        lesson_count = await self.repo.get_topic_lesson_count(topic.id)
        
        progress_percentage = 0.0
        completed_count = 0
        if user_id:
            completed, total = await self.repo.get_user_topic_progress(user_id, topic.id)
            completed_count = completed
            if total > 0:
                progress_percentage = (completed / total) * 100
        
        return TopicResponse(
            id=topic.id,
            subject_id=topic.subject_id,
            name=topic.name,
            description=topic.description,
            order_index=topic.order_index,
            estimated_hours=topic.estimated_hours,
            lesson_count=lesson_count,
            completed_count=completed_count,
            progress_percentage=round(progress_percentage, 1)
        )
    
    # ============ Lesson Operations ============
    
    async def get_lessons_by_topic(
        self, topic_id: UUID, user_id: Optional[UUID] = None
    ) -> List[LessonListResponse]:
        """Get all lessons for a topic with completion and bookmark status."""
        # Verify topic exists
        topic = await self.repo.get_topic_by_id(topic_id)
        if not topic:
            raise NotFoundException("Topic")
        
        lessons = await self.repo.get_lessons_by_topic(topic_id)
        result = []
        
        for lesson in lessons:
            is_completed = False
            is_bookmarked = False
            
            if user_id:
                progress = await self.repo.get_progress_by_user_lesson(user_id, lesson.id)
                is_completed = progress is not None
                
                bookmark = await self.repo.get_bookmark_by_user_lesson(user_id, lesson.id)
                is_bookmarked = bookmark is not None
            
            result.append(LessonListResponse(
                id=str(lesson.id),
                title=lesson.title,
                video_url=lesson.video_url,
                estimated_minutes=lesson.estimated_minutes,
                is_premium=lesson.is_premium,
                is_completed=is_completed,
                is_bookmarked=is_bookmarked
            ))
        
        return result
    
    async def get_lesson_by_id(
        self, lesson_id: UUID, user_id: Optional[UUID] = None
    ) -> LessonDetailResponse:
        """Get full lesson details including user's note."""
        lesson = await self.repo.get_lesson_with_details(lesson_id)
        if not lesson:
            raise NotFoundException("Lesson")
        
        is_completed = False
        is_bookmarked = False
        personal_note = None
        
        if user_id:
            progress = await self.repo.get_progress_by_user_lesson(user_id, lesson.id)
            is_completed = progress is not None
            
            bookmark = await self.repo.get_bookmark_by_user_lesson(user_id, lesson.id)
            is_bookmarked = bookmark is not None
            
            note = await self.repo.get_note_by_user_lesson(user_id, lesson.id)
            if note:
                personal_note = note.personal_notes
        
        return LessonDetailResponse(
            id=lesson.id,
            topic_id=lesson.topic_id,
            title=lesson.title,
            content=lesson.content,
            video_url=lesson.video_url,
            order_index=lesson.order_index,
            estimated_minutes=lesson.estimated_minutes,
            is_premium=lesson.is_premium,
            is_completed=is_completed,
            is_bookmarked=is_bookmarked,
            personal_note=personal_note
        )
    
    async def get_adjacent_lessons(
        self, lesson_id: UUID, user_id: Optional[UUID] = None
    ) -> Tuple[Optional[LessonListResponse], Optional[LessonListResponse]]:
        """Get previous and next lessons for navigation."""
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise NotFoundException("Lesson")
        
        prev_lesson, next_lesson = await self.repo.get_adjacent_lessons(
            lesson_id, lesson.topic_id
        )
        
        def _to_response(l: LessonResponse) -> Optional[LessonListResponse]:
            if not l:
                return None
            return LessonListResponse(
                id=str(l.id),
                title=l.title,
                video_url=l.video_url,
                estimated_minutes=l.estimated_minutes,
                is_premium=l.is_premium,
                is_completed=False,
                is_bookmarked=False
            )
        
        # For now, just return basic info without user-specific data
        # The actual navigation could fetch user-specific data if needed
        prev_resp = None
        next_resp = None
        
        if prev_lesson:
            is_completed = False
            is_bookmarked = False
            if user_id:
                progress = await self.repo.get_progress_by_user_lesson(user_id, prev_lesson.id)
                is_completed = progress is not None
                bookmark = await self.repo.get_bookmark_by_user_lesson(user_id, prev_lesson.id)
                is_bookmarked = bookmark is not None
            prev_resp = LessonListResponse(
                id=str(prev_lesson.id),
                title=prev_lesson.title,
                video_url=prev_lesson.video_url,
                estimated_minutes=prev_lesson.estimated_minutes,
                is_premium=prev_lesson.is_premium,
                is_completed=is_completed,
                is_bookmarked=is_bookmarked
            )
        
        if next_lesson:
            is_completed = False
            is_bookmarked = False
            if user_id:
                progress = await self.repo.get_progress_by_user_lesson(user_id, next_lesson.id)
                is_completed = progress is not None
                bookmark = await self.repo.get_bookmark_by_user_lesson(user_id, next_lesson.id)
                is_bookmarked = bookmark is not None
            next_resp = LessonListResponse(
                id=str(next_lesson.id),
                title=next_lesson.title,
                video_url=next_lesson.video_url,
                estimated_minutes=next_lesson.estimated_minutes,
                is_premium=next_lesson.is_premium,
                is_completed=is_completed,
                is_bookmarked=is_bookmarked
            )
        
        return prev_resp, next_resp
    
    # ============ Progress Operations ============
    
    async def mark_lesson_complete(
        self, lesson_id: UUID, user_id: UUID
    ) -> LessonProgressResponse:
        """Mark a lesson as completed."""
        # Verify lesson exists
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise NotFoundException("Lesson")
        
        progress = await self.repo.mark_lesson_complete(user_id, lesson_id)
        
        return LessonProgressResponse(
            id=progress.id,
            user_id=progress.user_id,
            lesson_id=progress.lesson_id,
            completed_at=progress.completed_at
        )
    
    async def unmark_lesson_complete(
        self, lesson_id: UUID, user_id: UUID
    ) -> bool:
        """Mark a lesson as not completed."""
        return await self.repo.unmark_lesson_complete(user_id, lesson_id)
    
    # ============ Bookmark Operations ============
    
    async def toggle_bookmark(
        self, lesson_id: UUID, user_id: UUID
    ) -> Tuple[bool, bool]:
        """Toggle bookmark for a lesson.
        
        Returns: (is_bookmarked: bool, created: bool)
        """
        # Verify lesson exists
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise NotFoundException("Lesson")
        
        existing = await self.repo.get_bookmark_by_user_lesson(user_id, lesson_id)
        
        if existing:
            # Remove bookmark
            await self.repo.delete_bookmark(existing.id)
            return False, False
        else:
            # Create bookmark
            await self.repo.create_bookmark(user_id, lesson_id)
            return True, True
    
    async def get_user_bookmarks(
        self, user_id: UUID
    ) -> List[BookmarksBySubject]:
        """Get all bookmarks grouped by subject."""
        bookmarks = await self.repo.get_bookmarks_by_user(user_id)
        
        # Group by subject
        subject_groups = {}
        for bookmark in bookmarks:
            lesson = bookmark.lesson
            topic = lesson.topic
            subject = topic.subject
            
            subject_key = str(subject.id)
            if subject_key not in subject_groups:
                subject_groups[subject_key] = {
                    "subject_id": str(subject.id),
                    "subject_name": subject.name,
                    "bookmarks": []
                }
            
            is_completed = False
            progress = await self.repo.get_progress_by_user_lesson(user_id, lesson.id)
            if progress:
                is_completed = True
            
            subject_groups[subject_key]["bookmarks"].append(
                BookmarkWithDetailsResponse(
                    id=str(bookmark.id),
                    lesson_id=str(lesson.id),
                    lesson_title=lesson.title,
                    topic_id=str(topic.id),
                    topic_name=topic.name,
                    subject_id=str(subject.id),
                    subject_name=subject.name,
                    estimated_minutes=lesson.estimated_minutes,
                    is_premium=lesson.is_premium,
                    is_completed=is_completed,
                    created_at=bookmark.created_at
                )
            )
        
        return [
            BookmarksBySubject(**group) 
            for group in subject_groups.values()
        ]
    
    # ============ Note Operations ============
    
    async def create_or_update_note(
        self, lesson_id: UUID, user_id: UUID, data: NoteCreate
    ) -> NoteResponse:
        """Create or update a note for a lesson."""
        # Verify lesson exists
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise NotFoundException("Lesson")
        
        # Check if note already exists
        existing = await self.repo.get_note_by_user_lesson(user_id, lesson_id)
        
        if existing:
            # Update
            note = await self.repo.update_note(existing.id, data.personal_notes)
        else:
            # Create
            note = await self.repo.create_note(user_id, lesson_id, data.personal_notes)
        
        return NoteResponse(
            id=note.id,
            user_id=note.user_id,
            lesson_id=note.lesson_id,
            personal_notes=note.personal_notes,
            created_at=note.created_at,
            updated_at=note.updated_at
        )
    
    async def delete_note(
        self, lesson_id: UUID, user_id: UUID
    ) -> bool:
        """Delete a note for a lesson."""
        note = await self.repo.get_note_by_user_lesson(user_id, lesson_id)
        if not note:
            return False
        
        return await self.repo.delete_note(note.id)
    
    async def get_user_notes(
        self, user_id: UUID
    ) -> List[NotesBySubject]:
        """Get all notes grouped by subject."""
        notes = await self.repo.get_notes_by_user(user_id)
        
        # Group by subject
        subject_groups = {}
        for note in notes:
            lesson = note.lesson
            topic = lesson.topic
            subject = topic.subject
            
            subject_key = str(subject.id)
            if subject_key not in subject_groups:
                subject_groups[subject_key] = {
                    "subject_id": str(subject.id),
                    "subject_name": subject.name,
                    "notes": []
                }
            
            subject_groups[subject_key]["notes"].append(
                NoteWithLessonResponse(
                    id=str(note.id),
                    lesson_id=str(lesson.id),
                    lesson_title=lesson.title,
                    topic_id=str(topic.id),
                    topic_name=topic.name,
                    subject_id=str(subject.id),
                    subject_name=subject.name,
                    personal_notes=note.personal_notes,
                    created_at=note.created_at,
                    updated_at=note.updated_at
                )
            )
        
        return [
            NotesBySubject(**group)
            for group in subject_groups.values()
        ]
    
    # ============ Stats Operations ============
    
    async def get_topic_progress(
        self, topic_id: UUID, user_id: UUID
    ) -> TopicProgressResponse:
        """Get progress for a specific topic."""
        topic = await self.repo.get_topic_by_id(topic_id)
        if not topic:
            raise NotFoundException("Topic")
        
        completed, total = await self.repo.get_user_topic_progress(user_id, topic_id)
        progress_percentage = (completed / total * 100) if total > 0 else 0.0
        
        return TopicProgressResponse(
            topic_id=str(topic.id),
            topic_name=topic.name,
            total_lessons=total,
            completed_lessons=completed,
            progress_percentage=round(progress_percentage, 1)
        )
    
    async def get_subject_progress(
        self, subject_id: UUID, user_id: UUID
    ) -> SubjectProgressResponse:
        """Get progress for a specific subject."""
        subject = await self.repo.get_subject_by_id(subject_id)
        if not subject:
            raise NotFoundException("Subject")
        
        completed_topics, completed_lessons, total_lessons = \
            await self.repo.get_user_subject_progress(user_id, subject_id)
        
        topics = await self.get_topics_by_subject(subject_id)
        progress_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0.0
        
        return SubjectProgressResponse(
            subject_id=str(subject.id),
            subject_name=subject.name,
            total_topics=len(topics),
            completed_topics=completed_topics,
            total_lessons=total_lessons,
            completed_lessons=completed_lessons,
            progress_percentage=round(progress_percentage, 1)
        )
