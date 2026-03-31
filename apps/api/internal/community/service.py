"""
Service layer for community business logic.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Tuple
from uuid import UUID

from .models import Discussion, DiscussionReply, DiscussionUpvote, ReportedContent
from .repository import DiscussionRepository, ReplyRepository, UpvoteRepository, ReportRepository
from .schemas import (
    DiscussionCreate, DiscussionUpdate, DiscussionResponse,
    ReplyCreate, ReplyResponse,
    UpvoteToggleResponse, AcceptAnswerResponse,
    PinDiscussionResponse, HideDiscussionResponse, DeleteDiscussionResponse,
    PaginationMeta
)


class DiscussionService:
    """Service for discussion operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DiscussionRepository(db)
    
    async def create_discussion(
        self,
        user_id: UUID,
        data: DiscussionCreate
    ) -> DiscussionResponse:
        """Create a new discussion."""
        discussion = await self.repo.create(
            user_id=user_id,
            title=data.title,
            content=data.content,
            topic_tag=data.topic_tag
        )
        await self.db.commit()
        
        return DiscussionResponse(
            id=discussion.id,
            user_id=discussion.user_id,
            title=discussion.title,
            content=discussion.content,
            topic_tag=discussion.topic_tag,
            upvotes=discussion.upvotes,
            reply_count=discussion.reply_count,
            view_count=discussion.view_count,
            is_answered=discussion.is_answered,
            is_pinned=discussion.is_pinned,
            is_hidden=discussion.is_hidden,
            accepted_reply_id=discussion.accepted_reply_id,
            created_at=discussion.created_at,
            updated_at=discussion.updated_at,
            user_name=getattr(discussion.user, 'name', None),
            user_avatar=getattr(discussion.user, 'avatar_url', None),
            has_upvoted=False
        )
    
    async def get_discussion(
        self,
        discussion_id: UUID,
        user_id: Optional[UUID] = None,
        increment_views: bool = True
    ) -> Optional[DiscussionResponse]:
        """Get a discussion by ID."""
        if increment_views:
            await self.repo.increment_view_count(discussion_id)
            await self.db.commit()
        
        discussion = await self.repo.get_by_id(discussion_id)
        if not discussion:
            return None
        
        has_upvoted = False
        if user_id:
            upvote_repo = UpvoteRepository(self.db)
            has_upvoted = await upvote_repo.has_discussion_upvoted(user_id, discussion_id)
        
        return DiscussionResponse(
            id=discussion.id,
            user_id=discussion.user_id,
            title=discussion.title,
            content=discussion.content,
            topic_tag=discussion.topic_tag,
            upvotes=discussion.upvotes,
            reply_count=discussion.reply_count,
            view_count=discussion.view_count,
            is_answered=discussion.is_answered,
            is_pinned=discussion.is_pinned,
            is_hidden=discussion.is_hidden,
            accepted_reply_id=discussion.accepted_reply_id,
            created_at=discussion.created_at,
            updated_at=discussion.updated_at,
            user_name=getattr(discussion.user, 'name', None),
            user_avatar=getattr(discussion.user, 'avatar_url', None),
            has_upvoted=has_upvoted
        )
    
    async def list_discussions(
        self,
        page: int = 1,
        limit: int = 20,
        topic_tag: Optional[str] = None,
        is_answered: Optional[bool] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        user_id: Optional[UUID] = None
    ) -> Tuple[List[DiscussionResponse], PaginationMeta]:
        """List discussions with filters."""
        discussions, total = await self.repo.list_discussions(
            page=page,
            limit=limit,
            topic_tag=topic_tag,
            is_answered=is_answered,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        upvote_repo = UpvoteRepository(self.db)
        
        response_list = []
        for d in discussions:
            has_upvoted = False
            if user_id:
                has_upvoted = await upvote_repo.has_discussion_upvoted(user_id, d.id)
            
            response_list.append(DiscussionResponse(
                id=d.id,
                user_id=d.user_id,
                title=d.title,
                content=d.content,
                topic_tag=d.topic_tag,
                upvotes=d.upvotes,
                reply_count=d.reply_count,
                view_count=d.view_count,
                is_answered=d.is_answered,
                is_pinned=d.is_pinned,
                is_hidden=d.is_hidden,
                accepted_reply_id=d.accepted_reply_id,
                created_at=d.created_at,
                updated_at=d.updated_at,
                user_name=getattr(d.user, 'name', None),
                user_avatar=getattr(d.user, 'avatar_url', None),
                has_upvoted=has_upvoted
            ))
        
        pages = (total + limit - 1) // limit if limit > 0 else 0
        meta = PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            pages=pages
        )
        
        return response_list, meta
    
    async def update_discussion(
        self,
        discussion_id: UUID,
        user_id: UUID,
        data: DiscussionUpdate
    ) -> Optional[DiscussionResponse]:
        """Update a discussion (author only)."""
        discussion = await self.repo.get_by_id(discussion_id)
        if not discussion:
            return None
        
        # Only author can update
        if discussion.user_id != user_id:
            raise PermissionError("You can only edit your own discussions")
        
        if data.title is not None:
            discussion.title = data.title
        if data.content is not None:
            discussion.content = data.content
        if data.topic_tag is not None:
            discussion.topic_tag = data.topic_tag
        
        await self.repo.update(discussion)
        await self.db.commit()
        
        return DiscussionResponse(
            id=discussion.id,
            user_id=discussion.user_id,
            title=discussion.title,
            content=discussion.content,
            topic_tag=discussion.topic_tag,
            upvotes=discussion.upvotes,
            reply_count=discussion.reply_count,
            view_count=discussion.view_count,
            is_answered=discussion.is_answered,
            is_pinned=discussion.is_pinned,
            is_hidden=discussion.is_hidden,
            accepted_reply_id=discussion.accepted_reply_id,
            created_at=discussion.created_at,
            updated_at=discussion.updated_at,
            user_name=getattr(discussion.user, 'name', None),
            user_avatar=getattr(discussion.user, 'avatar_url', None),
            has_upvoted=False
        )
    
    async def delete_discussion(self, discussion_id: UUID, user_id: UUID, is_moderator: bool = False) -> DeleteDiscussionResponse:
        """Delete a discussion (author or moderator)."""
        discussion = await self.repo.get_by_id(discussion_id)
        if not discussion:
            return DeleteDiscussionResponse(
                success=False,
                discussion_id=discussion_id,
                message="Discussion not found"
            )
        
        # Check permission: author or moderator
        is_author = discussion.user_id == user_id
        if not is_author and not is_moderator:
            raise PermissionError("You can only delete your own discussions")
        
        success = await self.repo.delete(discussion_id)
        await self.db.commit()
        
        return DeleteDiscussionResponse(
            success=success,
            discussion_id=discussion_id,
            message="Discussion deleted successfully"
        )
    
    async def hide_discussion(self, discussion_id: UUID) -> HideDiscussionResponse:
        """Hide a discussion (moderator action)."""
        success = await self.repo.hide(discussion_id)
        await self.db.commit()
        
        return HideDiscussionResponse(
            success=success,
            discussion_id=discussion_id,
            message="Discussion hidden successfully" if success else "Failed to hide discussion"
        )
    
    async def pin_discussion(self, discussion_id: UUID, is_pinned: bool = True) -> PinDiscussionResponse:
        """Pin or unpin a discussion (moderator action)."""
        success = await self.repo.pin(discussion_id, is_pinned)
        await self.db.commit()
        
        return PinDiscussionResponse(
            success=success,
            is_pinned=is_pinned,
            discussion_id=discussion_id
        )


class ReplyService:
    """Service for reply operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReplyRepository(db)
        self.discussion_repo = DiscussionRepository(db)
    
    async def create_reply(
        self,
        discussion_id: UUID,
        user_id: UUID,
        data: ReplyCreate
    ) -> ReplyResponse:
        """Create a new reply to a discussion."""
        # Verify discussion exists
        discussion = await self.discussion_repo.get_by_id(discussion_id)
        if not discussion:
            raise ValueError("Discussion not found")
        
        reply = await self.repo.create(
            discussion_id=discussion_id,
            user_id=user_id,
            content=data.content
        )
        await self.db.commit()
        
        return ReplyResponse(
            id=reply.id,
            discussion_id=reply.discussion_id,
            user_id=reply.user_id,
            content=reply.content,
            upvotes=reply.upvotes,
            is_accepted_answer=reply.is_accepted_answer,
            created_at=reply.created_at,
            updated_at=reply.updated_at,
            user_name=getattr(reply.user, 'name', None),
            user_avatar=getattr(reply.user, 'avatar_url', None),
            has_upvoted=False
        )
    
    async def get_replies(self, discussion_id: UUID, user_id: Optional[UUID] = None) -> List[ReplyResponse]:
        """Get all replies for a discussion."""
        replies = await self.repo.get_by_discussion(discussion_id)
        
        upvote_repo = UpvoteRepository(self.db)
        
        response_list = []
        for r in replies:
            has_upvoted = False
            if user_id:
                has_upvoted = await upvote_repo.has_reply_upvoted(user_id, r.id)
            
            response_list.append(ReplyResponse(
                id=r.id,
                discussion_id=r.discussion_id,
                user_id=r.user_id,
                content=r.content,
                upvotes=r.upvotes,
                is_accepted_answer=r.is_accepted_answer,
                created_at=r.created_at,
                updated_at=r.updated_at,
                user_name=getattr(r.user, 'name', None),
                user_avatar=getattr(r.user, 'avatar_url', None),
                has_upvoted=has_upvoted
            ))
        
        return response_list
    
    async def accept_answer(
        self,
        discussion_id: UUID,
        reply_id: UUID,
        user_id: UUID
    ) -> AcceptAnswerResponse:
        """Mark a reply as the accepted answer (discussion author only)."""
        discussion = await self.discussion_repo.get_by_id(discussion_id)
        if not discussion:
            return AcceptAnswerResponse(
                success=False,
                accepted_reply_id=reply_id,
                discussion_id=discussion_id,
                message="Discussion not found"
            )
        
        # Only discussion author can accept
        if discussion.user_id != user_id:
            raise PermissionError("Only the discussion author can accept an answer")
        
        reply = await self.repo.get_by_id(reply_id)
        if not reply or str(reply.discussion_id) != str(discussion_id):
            return AcceptAnswerResponse(
                success=False,
                accepted_reply_id=reply_id,
                discussion_id=discussion_id,
                message="Reply not found in this discussion"
            )
        
        # Mark as accepted
        await self.repo.set_accepted(reply_id, True)
        await self.discussion_repo.set_accepted_reply(discussion_id, reply_id)
        await self.db.commit()
        
        return AcceptAnswerResponse(
            success=True,
            accepted_reply_id=reply_id,
            discussion_id=discussion_id,
            message="Answer accepted successfully"
        )


class UpvoteService:
    """Service for upvote operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UpvoteRepository(db)
        self.discussion_repo = DiscussionRepository(db)
        self.reply_repo = ReplyRepository(db)
    
    async def toggle_discussion_upvote(
        self,
        discussion_id: UUID,
        user_id: UUID
    ) -> UpvoteToggleResponse:
        """Toggle upvote on a discussion."""
        # Verify discussion exists
        discussion = await self.discussion_repo.get_by_id(discussion_id)
        if not discussion:
            return UpvoteToggleResponse(
                success=False,
                upvoted=False,
                upvotes=0
            )
        
        # Check if already upvoted
        has_upvoted = await self.repo.has_discussion_upvoted(user_id, discussion_id)
        
        if has_upvoted:
            # Remove upvote
            await self.repo.delete_discussion_upvote(user_id, discussion_id)
            await self.db.commit()
            return UpvoteToggleResponse(
                success=True,
                upvoted=False,
                upvotes=max(0, discussion.upvotes - 1)
            )
        else:
            # Add upvote
            await self.repo.create_discussion_upvote(user_id, discussion_id)
            await self.db.commit()
            return UpvoteToggleResponse(
                success=True,
                upvoted=True,
                upvotes=discussion.upvotes + 1
            )
    
    async def toggle_reply_upvote(
        self,
        reply_id: UUID,
        user_id: UUID
    ) -> UpvoteToggleResponse:
        """Toggle upvote on a reply."""
        # Verify reply exists
        reply = await self.reply_repo.get_by_id(reply_id)
        if not reply:
            return UpvoteToggleResponse(
                success=False,
                upvoted=False,
                upvotes=0
            )
        
        # Check if already upvoted
        has_upvoted = await self.repo.has_reply_upvoted(user_id, reply_id)
        
        if has_upvoted:
            # Remove upvote
            await self.repo.delete_reply_upvote(user_id, reply_id)
            await self.db.commit()
            return UpvoteToggleResponse(
                success=True,
                upvoted=False,
                upvotes=max(0, reply.upvotes - 1)
            )
        else:
            # Add upvote
            await self.repo.create_reply_upvote(user_id, reply_id)
            await self.db.commit()
            return UpvoteToggleResponse(
                success=True,
                upvoted=True,
                upvotes=reply.upvotes + 1
            )


class ReportService:
    """Service for content reporting operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReportRepository(db)
    
    async def create_report(
        self,
        reporter_id: UUID,
        content_type: str,
        content_id: UUID,
        reason: str,
        description: Optional[str] = None
    ) -> ReportedContent:
        """Create a new report."""
        report = await self.repo.create(
            reporter_id=reporter_id,
            content_type=content_type,
            content_id=content_id,
            reason=reason,
            description=description
        )
        await self.db.commit()
        return report
    
    async def list_reports(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None
    ) -> Tuple[List[ReportedContent], PaginationMeta]:
        """List reports with pagination."""
        reports, total = await self.repo.list_reports(page, limit, status)
        
        pages = (total + limit - 1) // limit if limit > 0 else 0
        meta = PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            pages=pages
        )
        
        return list(reports), meta
    
    async def review_report(
        self,
        report_id: UUID,
        reviewer_id: UUID,
        action: str,
        notes: Optional[str] = None
    ) -> bool:
        """Review a report and take action."""
        from .models import ReportStatus
        
        # Map action to status
        status_map = {
            "dismiss": ReportStatus.DISMISSED.value,
            "hide_content": ReportStatus.ACTIONED.value,
            "warn_user": ReportStatus.ACTIONED.value,
            "suspend_user": ReportStatus.ACTIONED.value,
        }
        
        status = status_map.get(action, ReportStatus.REVIEWED.value)
        success = await self.repo.update_status(report_id, status, reviewer_id, notes)
        
        if success and action == "hide_content":
            # Hide the content
            report = await self.repo.get_by_id(report_id)
            if report and report.discussion_id:
                discussion_repo = DiscussionRepository(self.db)
                await discussion_repo.hide(report.discussion_id)
        
        await self.db.commit()
        return success
