"""
Repository for community database operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from uuid import UUID

from .models import (
    Discussion, DiscussionReply, DiscussionUpvote,
    ReportedContent, DiscussionStatus, ReportStatus, UpvoteType
)


class DiscussionRepository:
    """Repository for Discussion operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, user_id: UUID, title: str, content: str, topic_tag: Optional[str] = None) -> Discussion:
        """Create a new discussion."""
        discussion = Discussion(
            user_id=user_id,
            title=title,
            content=content,
            topic_tag=topic_tag,
            status=DiscussionStatus.ACTIVE.value
        )
        self.db.add(discussion)
        await self.db.flush()
        return discussion
    
    async def get_by_id(self, discussion_id: UUID) -> Optional[Discussion]:
        """Get a discussion by ID."""
        result = await self.db.execute(
            select(Discussion)
            .options(selectinload(Discussion.user))
            .where(
                and_(
                    Discussion.id == discussion_id,
                    Discussion.status != DiscussionStatus.DELETED.value
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_by_id_with_replies(self, discussion_id: UUID) -> Optional[Discussion]:
        """Get a discussion with its replies."""
        result = await self.db.execute(
            select(Discussion)
            .options(
                selectinload(Discussion.user),
                selectinload(Discussion.replies).selectinload(DiscussionReply.user)
            )
            .where(
                and_(
                    Discussion.id == discussion_id,
                    Discussion.status != DiscussionStatus.DELETED.value
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list_discussions(
        self,
        page: int = 1,
        limit: int = 20,
        topic_tag: Optional[str] = None,
        is_answered: Optional[bool] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        exclude_hidden: bool = True
    ) -> Tuple[List[Discussion], int]:
        """List discussions with filters and pagination."""
        query = select(Discussion).options(selectinload(Discussion.user))
        
        # Build filters
        filters = []
        if exclude_hidden:
            filters.append(Discussion.status != DiscussionStatus.DELETED.value)
            filters.append(Discussion.is_hidden == False)
        if topic_tag:
            filters.append(Discussion.topic_tag == topic_tag)
        if is_answered is not None:
            filters.append(Discussion.is_answered == is_answered)
        if search:
            filters.append(
                or_(
                    Discussion.title.ilike(f"%{search}%"),
                    Discussion.content.ilike(f"%{search}%")
                )
            )
        
        if filters:
            query = query.where(and_(*filters))
        
        # Get total count
        count_query = select(func.count(Discussion.id))
        if filters:
            count_query = count_query.where(and_(*filters))
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Sorting - pinned discussions always first
        if sort_by == "upvotes":
            order_col = Discussion.upvotes
        elif sort_by == "reply_count":
            order_col = Discussion.reply_count
        else:
            order_col = Discussion.created_at
        
        if sort_order == "asc":
            query = query.order_by(desc(Discussion.is_pinned), desc(order_col))
        else:
            query = query.order_by(desc(Discussion.is_pinned), desc(order_col))
        
        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        discussions = result.scalars().all()
        
        return list(discussions), total
    
    async def update(self, discussion: Discussion) -> Discussion:
        """Update a discussion."""
        await self.db.flush()
        return discussion
    
    async def delete(self, discussion_id: UUID) -> bool:
        """Soft delete a discussion."""
        discussion = await self.get_by_id(discussion_id)
        if discussion:
            discussion.status = DiscussionStatus.DELETED.value
            await self.db.flush()
            return True
        return False
    
    async def hide(self, discussion_id: UUID) -> bool:
        """Hide a discussion (moderator action)."""
        discussion = await self.get_by_id(discussion_id)
        if discussion:
            discussion.is_hidden = True
            discussion.status = DiscussionStatus.HIDDEN.value
            await self.db.flush()
            return True
        return False
    
    async def pin(self, discussion_id: UUID, is_pinned: bool = True) -> bool:
        """Pin or unpin a discussion."""
        discussion = await self.get_by_id(discussion_id)
        if discussion:
            discussion.is_pinned = is_pinned
            if is_pinned:
                discussion.status = DiscussionStatus.PINNED.value
            else:
                discussion.status = DiscussionStatus.ACTIVE.value
            await self.db.flush()
            return True
        return False
    
    async def set_accepted_reply(self, discussion_id: UUID, reply_id: UUID) -> bool:
        """Set the accepted reply for a discussion."""
        discussion = await self.get_by_id(discussion_id)
        if discussion:
            discussion.accepted_reply_id = reply_id
            discussion.is_answered = True
            await self.db.flush()
            return True
        return False
    
    async def increment_view_count(self, discussion_id: UUID) -> None:
        """Increment the view count of a discussion."""
        discussion = await self.get_by_id(discussion_id)
        if discussion:
            discussion.view_count += 1
            await self.db.flush()
    
    async def get_user_discussions(self, user_id: UUID, page: int = 1, limit: int = 20) -> Tuple[List[Discussion], int]:
        """Get discussions created by a user."""
        query = select(Discussion).where(
            and_(
                Discussion.user_id == user_id,
                Discussion.status != DiscussionStatus.DELETED.value
            )
        ).order_by(desc(Discussion.created_at))
        
        # Count
        count_query = select(func.count(Discussion.id)).where(
            and_(
                Discussion.user_id == user_id,
                Discussion.status != DiscussionStatus.DELETED.value
            )
        )
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Paginate
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        discussions = result.scalars().all()
        
        return list(discussions), total


class ReplyRepository:
    """Repository for DiscussionReply operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, discussion_id: UUID, user_id: UUID, content: str) -> DiscussionReply:
        """Create a new reply."""
        reply = DiscussionReply(
            discussion_id=discussion_id,
            user_id=user_id,
            content=content
        )
        self.db.add(reply)
        await self.db.flush()
        
        # Update discussion reply count
        from .models import Discussion
        discussion = await self.db.get(Discussion, discussion_id)
        if discussion:
            discussion.reply_count += 1
        
        await self.db.flush()
        return reply
    
    async def get_by_id(self, reply_id: UUID) -> Optional[DiscussionReply]:
        """Get a reply by ID."""
        result = await self.db.execute(
            select(DiscussionReply)
            .options(selectinload(DiscussionReply.user))
            .where(DiscussionReply.id == reply_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_discussion(self, discussion_id: UUID) -> List[DiscussionReply]:
        """Get all replies for a discussion."""
        result = await self.db.execute(
            select(DiscussionReply)
            .options(selectinload(DiscussionReply.user))
            .where(DiscussionReply.discussion_id == discussion_id)
            .order_by(desc(DiscussionReply.is_accepted_answer), asc(DiscussionReply.created_at))
        )
        return list(result.scalars().all())
    
    async def update(self, reply: DiscussionReply) -> DiscussionReply:
        """Update a reply."""
        await self.db.flush()
        return reply
    
    async def delete(self, reply_id: UUID) -> bool:
        """Delete a reply."""
        reply = await self.get_by_id(reply_id)
        if reply:
            reply_id_value = reply.id
            discussion_id = reply.discussion_id
            
            await self.db.delete(reply)
            await self.db.flush()
            
            # Update discussion reply count
            from .models import Discussion
            discussion = await self.db.get(Discussion, discussion_id)
            if discussion:
                discussion.reply_count = max(0, discussion.reply_count - 1)
            
            await self.db.flush()
            return True
        return False
    
    async def set_accepted(self, reply_id: UUID, is_accepted: bool = True) -> bool:
        """Mark a reply as accepted/unaccepted."""
        reply = await self.get_by_id(reply_id)
        if reply:
            # First, unaccept all other replies for this discussion
            if is_accepted:
                result = await self.db.execute(
                    select(DiscussionReply)
                    .where(DiscussionReply.discussion_id == reply.discussion_id)
                )
                for r in result.scalars():
                    if r.is_accepted_answer:
                        r.is_accepted_answer = False
            
            reply.is_accepted_answer = is_accepted
            await self.db.flush()
            return True
        return False


class UpvoteRepository:
    """Repository for DiscussionUpvote operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_discussion_upvote(self, user_id: UUID, discussion_id: UUID) -> DiscussionUpvote:
        """Create an upvote on a discussion."""
        upvote = DiscussionUpvote(
            user_id=user_id,
            discussion_id=discussion_id,
            upvote_type=UpvoteType.DISCUSSION.value
        )
        self.db.add(upvote)
        await self.db.flush()
        
        # Increment discussion upvotes
        from .models import Discussion
        discussion = await self.db.get(Discussion, discussion_id)
        if discussion:
            discussion.upvotes += 1
            await self.db.flush()
        
        return upvote
    
    async def create_reply_upvote(self, user_id: UUID, reply_id: UUID) -> DiscussionUpvote:
        """Create an upvote on a reply."""
        upvote = DiscussionUpvote(
            user_id=user_id,
            reply_id=reply_id,
            upvote_type=UpvoteType.REPLY.value
        )
        self.db.add(upvote)
        await self.db.flush()
        
        # Increment reply upvotes
        reply = await self.db.get(DiscussionReply, reply_id)
        if reply:
            reply.upvotes += 1
            await self.db.flush()
        
        return upvote
    
    async def delete_discussion_upvote(self, user_id: UUID, discussion_id: UUID) -> bool:
        """Remove an upvote from a discussion."""
        result = await self.db.execute(
            select(DiscussionUpvote).where(
                and_(
                    DiscussionUpvote.user_id == user_id,
                    DiscussionUpvote.discussion_id == discussion_id,
                    DiscussionUpvote.upvote_type == UpvoteType.DISCUSSION.value
                )
            )
        )
        upvote = result.scalar_one_or_none()
        
        if upvote:
            await self.db.delete(upvote)
            await self.db.flush()
            
            # Decrement discussion upvotes
            from .models import Discussion
            discussion = await self.db.get(Discussion, discussion_id)
            if discussion:
                discussion.upvotes = max(0, discussion.upvotes - 1)
                await self.db.flush()
            
            return True
        return False
    
    async def delete_reply_upvote(self, user_id: UUID, reply_id: UUID) -> bool:
        """Remove an upvote from a reply."""
        result = await self.db.execute(
            select(DiscussionUpvote).where(
                and_(
                    DiscussionUpvote.user_id == user_id,
                    DiscussionUpvote.reply_id == reply_id,
                    DiscussionUpvote.upvote_type == UpvoteType.REPLY.value
                )
            )
        )
        upvote = result.scalar_one_or_none()
        
        if upvote:
            await self.db.delete(upvote)
            await self.db.flush()
            
            # Decrement reply upvotes
            reply = await self.db.get(DiscussionReply, reply_id)
            if reply:
                reply.upvotes = max(0, reply.upvotes - 1)
                await self.db.flush()
            
            return True
        return False
    
    async def has_discussion_upvoted(self, user_id: UUID, discussion_id: UUID) -> bool:
        """Check if user has upvoted a discussion."""
        result = await self.db.execute(
            select(DiscussionUpvote).where(
                and_(
                    DiscussionUpvote.user_id == user_id,
                    DiscussionUpvote.discussion_id == discussion_id
                )
            )
        )
        return result.scalar_one_or_none() is not None
    
    async def has_reply_upvoted(self, user_id: UUID, reply_id: UUID) -> bool:
        """Check if user has upvoted a reply."""
        result = await self.db.execute(
            select(DiscussionUpvote).where(
                and_(
                    DiscussionUpvote.user_id == user_id,
                    DiscussionUpvote.reply_id == reply_id
                )
            )
        )
        return result.scalar_one_or_none() is not None


class ReportRepository:
    """Repository for ReportedContent operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(
        self,
        reporter_id: UUID,
        content_type: str,
        content_id: UUID,
        reason: str,
        description: Optional[str] = None
    ) -> ReportedContent:
        """Create a new report."""
        # Set the appropriate foreign key
        kwargs = {
            "reporter_id": reporter_id,
            "content_type": content_type,
            "reason": reason,
            "description": description,
            "status": ReportStatus.PENDING.value
        }
        
        if content_type == "discussion":
            kwargs["discussion_id"] = content_id
        else:
            kwargs["reply_id"] = content_id
        
        report = ReportedContent(**kwargs)
        self.db.add(report)
        await self.db.flush()
        return report
    
    async def get_by_id(self, report_id: UUID) -> Optional[ReportedContent]:
        """Get a report by ID."""
        result = await self.db.execute(
            select(ReportedContent)
            .options(
                selectinload(ReportedContent.reporter),
                selectinload(ReportedContent.discussion),
                selectinload(ReportedContent.reply)
            )
            .where(ReportedContent.id == report_id)
        )
        return result.scalar_one_or_none()
    
    async def list_reports(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None
    ) -> Tuple[List[ReportedContent], int]:
        """List reports with filters and pagination."""
        query = select(ReportedContent).options(
            selectinload(ReportedContent.reporter),
            selectinload(ReportedContent.discussion),
            selectinload(ReportedContent.reply)
        )
        
        filters = []
        if status:
            filters.append(ReportedContent.status == status)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Count
        count_query = select(func.count(ReportedContent.id))
        if filters:
            count_query = count_query.where(and_(*filters))
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Sort by creation date (newest first)
        query = query.order_by(desc(ReportedContent.created_at))
        
        # Paginate
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        reports = result.scalars().all()
        
        return list(reports), total
    
    async def update_status(
        self,
        report_id: UUID,
        status: str,
        reviewed_by: UUID,
        action_taken: Optional[str] = None
    ) -> bool:
        """Update report status after review."""
        report = await self.get_by_id(report_id)
        if report:
            report.status = status
            report.reviewed_by = reviewed_by
            from datetime import datetime
            report.reviewed_at = datetime.utcnow()
            if action_taken:
                report.action_taken = action_taken
            await self.db.flush()
            return True
        return False
