"""
API routes for community endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user, TokenData, require_roles
from ..auth.schemas import UserRole
from .schemas import (
    DiscussionCreate, DiscussionUpdate, DiscussionResponse, DiscussionListResponse,
    ReplyCreate, ReplyResponse,
    UpvoteToggleResponse, AcceptAnswerRequest, AcceptAnswerResponse,
    PinDiscussionResponse, HideDiscussionResponse, DeleteDiscussionResponse,
    ReportCreate, ReportResponse, ReportListResponse, ReportReviewRequest,
    PaginationMeta
)
from .service import DiscussionService, ReplyService, UpvoteService, ReportService


router = APIRouter(prefix="/discussions", tags=["Community"])


# ============================================================================
# Discussions
# ============================================================================

@router.get("", response_model=DiscussionListResponse)
async def list_discussions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    topic_tag: Optional[str] = Query(None, description="Filter by topic tag"),
    is_answered: Optional[bool] = Query(None, description="Filter by answered status"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    sort_by: str = Query("created_at", description="Sort by: created_at, upvotes, reply_count"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get paginated list of discussions.
    
    Supports filtering by topic tag, answered status, and full-text search.
    Pinned discussions always appear first.
    """
    service = DiscussionService(db)
    
    discussions, meta = await service.list_discussions(
        page=page,
        limit=limit,
        topic_tag=topic_tag,
        is_answered=is_answered,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        user_id=UUID(current_user.user_id)
    )
    
    return DiscussionListResponse(data=discussions, meta=meta)


@router.post("", response_model=DiscussionResponse, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    request: DiscussionCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new discussion/doubt.
    
    Title must be at least 10 characters.
    Content must be at least 20 characters.
    """
    service = DiscussionService(db)
    
    discussion = await service.create_discussion(
        user_id=UUID(current_user.user_id),
        data=request
    )
    
    return discussion


@router.get("/{discussion_id}", response_model=DiscussionResponse)
async def get_discussion(
    discussion_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a discussion by ID.
    
    Increments view count. Returns discussion with upvote status for current user.
    """
    service = DiscussionService(db)
    
    discussion = await service.get_discussion(
        discussion_id=discussion_id,
        user_id=UUID(current_user.user_id)
    )
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    return discussion


@router.patch("/{discussion_id}", response_model=DiscussionResponse)
async def update_discussion(
    discussion_id: UUID,
    request: DiscussionUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a discussion (author only).
    
    Users can only edit their own discussions.
    """
    service = DiscussionService(db)
    
    try:
        discussion = await service.update_discussion(
            discussion_id=discussion_id,
            user_id=UUID(current_user.user_id),
            data=request
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    return discussion


@router.delete("/{discussion_id}", response_model=DeleteDiscussionResponse)
async def delete_discussion(
    discussion_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a discussion.
    
    Authors can delete their own discussions.
    Moderators and admins can delete any discussion.
    """
    service = DiscussionService(db)
    
    is_moderator = current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]
    
    try:
        result = await service.delete_discussion(
            discussion_id=discussion_id,
            user_id=UUID(current_user.user_id),
            is_moderator=is_moderator
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    return result


# ============================================================================
# Replies
# ============================================================================

@router.get("/{discussion_id}/replies", response_model=List[ReplyResponse])
async def get_replies(
    discussion_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all replies for a discussion.
    
    Returns replies sorted with accepted answer first, then by creation date.
    """
    service = ReplyService(db)
    
    replies = await service.get_replies(
        discussion_id=discussion_id,
        user_id=UUID(current_user.user_id)
    )
    
    return replies


@router.post("/{discussion_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_reply(
    discussion_id: UUID,
    request: ReplyCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a reply to a discussion.
    
    Reply content must be at least 10 characters.
    """
    service = ReplyService(db)
    
    try:
        reply = await service.create_reply(
            discussion_id=discussion_id,
            user_id=UUID(current_user.user_id),
            data=request
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    return reply


# ============================================================================
# Upvotes
# ============================================================================

@router.post("/{discussion_id}/upvote", response_model=UpvoteToggleResponse)
async def toggle_discussion_upvote(
    discussion_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle upvote on a discussion.
    
    Clicking again removes the upvote.
    """
    service = UpvoteService(db)
    
    result = await service.toggle_discussion_upvote(
        discussion_id=discussion_id,
        user_id=UUID(current_user.user_id)
    )
    
    return result


@router.post("/replies/{reply_id}/upvote", response_model=UpvoteToggleResponse)
async def toggle_reply_upvote(
    reply_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle upvote on a reply.
    
    Clicking again removes the upvote.
    """
    service = UpvoteService(db)
    
    result = await service.toggle_reply_upvote(
        reply_id=reply_id,
        user_id=UUID(current_user.user_id)
    )
    
    return result


# ============================================================================
# Accepted Answer
# ============================================================================

@router.patch("/{discussion_id}/accepted-answer", response_model=AcceptAnswerResponse)
async def accept_answer(
    discussion_id: UUID,
    request: AcceptAnswerRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a reply as the accepted answer.
    
    Only the discussion author can accept an answer.
    """
    service = ReplyService(db)
    
    try:
        result = await service.accept_answer(
            discussion_id=discussion_id,
            reply_id=request.reply_id,
            user_id=UUID(current_user.user_id)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.message
        )
    
    return result


# ============================================================================
# Moderator Actions
# ============================================================================

@router.patch("/{discussion_id}/pin", response_model=PinDiscussionResponse)
async def pin_discussion(
    discussion_id: UUID,
    is_pinned: bool = Query(True, description="Pin or unpin the discussion"),
    current_user: TokenData = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)),
    db: AsyncSession = Depends(get_db)
):
    """Pin or unpin a discussion (moderator only).
    
    Pinned discussions appear at the top of the community feed.
    """
    service = DiscussionService(db)
    
    result = await service.pin_discussion(discussion_id, is_pinned)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    return result


@router.patch("/{discussion_id}/hide", response_model=HideDiscussionResponse)
async def hide_discussion(
    discussion_id: UUID,
    current_user: TokenData = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)),
    db: AsyncSession = Depends(get_db)
):
    """Hide a discussion (moderator only).
    
    Hidden discussions are not visible to regular users but can be restored.
    """
    service = DiscussionService(db)
    
    result = await service.hide_discussion(discussion_id)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    return result


# ============================================================================
# Reports
# ============================================================================

@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    request: ReportCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Report inappropriate content.
    
    content_type should be 'discussion' or 'reply'.
    reason should be: spam, inappropriate, harassment, misinformation, or other.
    """
    valid_reasons = ["spam", "inappropriate", "harassment", "misinformation", "other"]
    if request.reason not in valid_reasons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reason. Must be one of: {', '.join(valid_reasons)}"
        )
    
    service = ReportService(db)
    
    report = await service.create_report(
        reporter_id=UUID(current_user.user_id),
        content_type=request.content_type,
        content_id=request.content_id,
        reason=request.reason,
        description=request.description
    )
    
    return report


# ============================================================================
# Admin/Moderator Reports Management
# ============================================================================

reports_router = APIRouter(prefix="/admin/reports", tags=["Admin - Reports"])


@reports_router.get("", response_model=ReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    current_user: TokenData = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)),
    db: AsyncSession = Depends(get_db)
):
    """Get paginated list of reported content (moderator only).
    
    Supports filtering by status: pending, reviewed, dismissed, actioned.
    """
    service = ReportService(db)
    
    reports, meta = await service.list_reports(
        page=page,
        limit=limit,
        status=status_filter
    )
    
    return ReportListResponse(
        data=[
            ReportResponse(
                id=r.id,
                reporter_id=r.reporter_id,
                content_type=r.content_type,
                discussion_id=r.discussion_id,
                reply_id=r.reply_id,
                reason=r.reason,
                description=r.description,
                status=r.status,
                reviewed_by=r.reviewed_by,
                reviewed_at=r.reviewed_at,
                action_taken=r.action_taken,
                created_at=r.created_at
            )
            for r in reports
        ],
        meta=meta
    )


@reports_router.patch("/{report_id}/review", response_model=ReportResponse)
async def review_report(
    report_id: UUID,
    request: ReportReviewRequest,
    current_user: TokenData = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)),
    db: AsyncSession = Depends(get_db)
):
    """Review a report and take action (moderator only).
    
    Actions:
    - dismiss: Report is dismissed, no action taken on content
    - hide_content: Hide the reported content
    - warn_user: Issue a warning to the content author
    - suspend_user: Suspend the content author
    """
    valid_actions = ["dismiss", "hide_content", "warn_user", "suspend_user"]
    if request.action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Must be one of: {', '.join(valid_actions)}"
        )
    
    service = ReportService(db)
    
    success = await service.review_report(
        report_id=report_id,
        reviewer_id=UUID(current_user.user_id),
        action=request.action,
        notes=request.notes
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Fetch updated report
    from .repository import ReportRepository
    repo = ReportRepository(db)
    report = await repo.get_by_id(report_id)
    
    return ReportResponse(
        id=report.id,
        reporter_id=report.reporter_id,
        content_type=report.content_type,
        discussion_id=report.discussion_id,
        reply_id=report.reply_id,
        reason=report.reason,
        description=report.description,
        status=report.status,
        reviewed_by=report.reviewed_by,
        reviewed_at=report.reviewed_at,
        action_taken=report.action_taken,
        created_at=report.created_at
    )
