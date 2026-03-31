"""
Pydantic schemas for community API.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ============================================================================
# Discussion Schemas
# ============================================================================

class DiscussionBase(BaseModel):
    """Base discussion schema."""
    title: str = Field(..., min_length=10, max_length=500, description="Title of the doubt (min 10 chars)")
    content: str = Field(..., min_length=20, description="Content/body of the doubt (min 20 chars)")
    topic_tag: Optional[str] = Field(None, max_length=100, description="Topic tag (e.g., Mathematics, Reasoning)")


class DiscussionCreate(DiscussionBase):
    """Schema for creating a new discussion."""
    
    @field_validator('title')
    @classmethod
    def title_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError('Title must be at least 10 characters')
        return v.strip()
    
    @field_validator('content')
    @classmethod
    def content_min_length(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError('Content must be at least 20 characters')
        return v.strip()


class DiscussionUpdate(BaseModel):
    """Schema for updating a discussion (author only)."""
    title: Optional[str] = Field(None, min_length=10, max_length=500)
    content: Optional[str] = Field(None, min_length=20)
    topic_tag: Optional[str] = Field(None, max_length=100)


class DiscussionResponse(BaseModel):
    """Response schema for a discussion."""
    id: UUID
    user_id: UUID
    title: str
    content: str
    topic_tag: Optional[str] = None
    upvotes: int = 0
    reply_count: int = 0
    view_count: int = 0
    is_answered: bool = False
    is_pinned: bool = False
    is_hidden: bool = False
    accepted_reply_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    # Computed fields (optional)
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    has_upvoted: bool = False  # Current user's upvote status
    
    class Config:
        from_attributes = True


class DiscussionDetailResponse(DiscussionResponse):
    """Detailed response with replies."""
    replies: List["ReplyResponse"] = []


class DiscussionListResponse(BaseModel):
    """Paginated list of discussions."""
    data: List[DiscussionResponse]
    meta: "PaginationMeta"


# ============================================================================
# Reply Schemas
# ============================================================================

class ReplyBase(BaseModel):
    """Base reply schema."""
    content: str = Field(..., min_length=10, description="Reply content (min 10 chars)")


class ReplyCreate(ReplyBase):
    """Schema for creating a reply."""
    
    @field_validator('content')
    @classmethod
    def content_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError('Reply must be at least 10 characters')
        return v.strip()


class ReplyUpdate(BaseModel):
    """Schema for updating a reply (author only)."""
    content: Optional[str] = Field(None, min_length=10)


class ReplyResponse(BaseModel):
    """Response schema for a reply."""
    id: UUID
    discussion_id: UUID
    user_id: UUID
    content: str
    upvotes: int = 0
    is_accepted_answer: bool = False
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    has_upvoted: bool = False  # Current user's upvote status
    
    class Config:
        from_attributes = True


# ============================================================================
# Upvote Schemas
# ============================================================================

class UpvoteToggleResponse(BaseModel):
    """Response for upvote toggle."""
    success: bool
    upvoted: bool  # True if now upvoted, False if removed
    upvotes: int  # New total count


# ============================================================================
# Accepted Answer Schemas
# ============================================================================

class AcceptAnswerRequest(BaseModel):
    """Request to mark a reply as accepted answer."""
    reply_id: UUID


class AcceptAnswerResponse(BaseModel):
    """Response for accepting an answer."""
    success: bool
    accepted_reply_id: UUID
    discussion_id: UUID
    message: str


# ============================================================================
# Moderator Schemas
# ============================================================================

class PinDiscussionResponse(BaseModel):
    """Response for pinning a discussion."""
    success: bool
    is_pinned: bool
    discussion_id: UUID


class HideDiscussionResponse(BaseModel):
    """Response for hiding a discussion."""
    success: bool
    discussion_id: UUID
    message: str


class DeleteDiscussionResponse(BaseModel):
    """Response for deleting a discussion."""
    success: bool
    discussion_id: UUID
    message: str


# ============================================================================
# Report Schemas
# ============================================================================

class ReportCreate(BaseModel):
    """Schema for reporting content."""
    content_type: str = Field(..., description="Type: 'discussion' or 'reply'")
    content_id: UUID = Field(..., description="ID of the discussion or reply")
    reason: str = Field(..., description="Reason: spam, inappropriate, harassment, misinformation, other")
    description: Optional[str] = Field(None, max_length=1000, description="Additional details")


class ReportResponse(BaseModel):
    """Response for a report."""
    id: UUID
    reporter_id: UUID
    content_type: str
    discussion_id: Optional[UUID] = None
    reply_id: Optional[UUID] = None
    reason: str
    description: Optional[str] = None
    status: str
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    action_taken: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Paginated list of reports."""
    data: List[ReportResponse]
    meta: "PaginationMeta"


class ReportReviewRequest(BaseModel):
    """Request to review a report."""
    action: str = Field(..., description="Action: dismiss, hide_content, warn_user, suspend_user")
    notes: Optional[str] = Field(None, description="Moderator notes")


# ============================================================================
# Admin/Moderator Discussion Management
# ============================================================================

class DiscussionModerationResponse(BaseModel):
    """Response for moderator actions on discussions."""
    success: bool
    discussion_id: UUID
    action: str
    message: str


class DiscussionWithReports(DiscussionResponse):
    """Discussion with associated reports."""
    reports: List[ReportResponse] = []


# ============================================================================
# Pagination
# ============================================================================

class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    pages: int


class DiscussionFilters(BaseModel):
    """Filters for listing discussions."""
    topic_tag: Optional[str] = None
    is_answered: Optional[bool] = None
    search: Optional[str] = None
    sort_by: str = "created_at"  # created_at, upvotes, reply_count
    sort_order: str = "desc"  # asc, desc


# Update forward references
DiscussionListResponse.model_rebuild()
ReportListResponse.model_rebuild()
