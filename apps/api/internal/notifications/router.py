"""
API routes for notification endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from .schemas import (
    NotificationResponse,
    NotificationListResponse,
    NotificationUnreadCount,
    NotificationMarkRead,
    NotificationMarkAllRead,
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse,
)
from .service import NotificationService


router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ============================================================================
# Notifications
# ============================================================================

@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    unread_only: bool = Query(False, description="Filter to unread notifications only"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated notifications for the current user.
    
    Returns notifications sorted by creation date (newest first).
    """
    service = NotificationService(db)
    return await service.get_notifications(
        user_id=UUID(current_user.user_id),
        page=page,
        limit=limit,
        unread_only=unread_only
    )


@router.get("/unread-count", response_model=NotificationUnreadCount)
async def get_unread_count(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get unread notification count for badge display.
    """
    service = NotificationService(db)
    return await service.get_unread_count(UUID(current_user.user_id))


@router.patch("/{notification_id}/read", response_model=NotificationMarkRead)
async def mark_notification_read(
    notification_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a single notification as read.
    """
    service = NotificationService(db)
    result = await service.mark_as_read(
        notification_id=notification_id,
        user_id=UUID(current_user.user_id)
    )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return result


@router.post("/read-all", response_model=NotificationMarkAllRead)
async def mark_all_notifications_read(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all notifications as read for the current user.
    """
    service = NotificationService(db)
    return await service.mark_all_as_read(UUID(current_user.user_id))


# ============================================================================
# Notification Preferences
# ============================================================================

# Note: Notification preferences are at /api/v1/users/{user_id}/notification-preferences
# This follows the expected behavior from the feature specification


async def get_notification_preferences(
    user_id: UUID,
    current_user: TokenData,
    db: AsyncSession
) -> NotificationPreferenceResponse:
    """
    Get notification preferences for a user.
    User can only view their own preferences.
    """
    # Check authorization
    if str(user_id) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view another user's notification preferences"
        )
    
    service = NotificationService(db)
    return await service.get_preferences(user_id)


async def update_notification_preferences(
    user_id: UUID,
    preferences: NotificationPreferenceUpdate,
    current_user: TokenData,
    db: AsyncSession
) -> NotificationPreferenceResponse:
    """
    Update notification preferences for a user.
    User can only update their own preferences.
    """
    # Check authorization
    if str(user_id) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another user's notification preferences"
        )
    
    service = NotificationService(db)
    return await service.update_preferences(user_id, preferences)
