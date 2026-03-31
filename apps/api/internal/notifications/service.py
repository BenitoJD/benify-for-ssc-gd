"""
Service layer for notification business logic.
"""
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Notification, NotificationPreference, NotificationType
from .repository import NotificationRepository
from .schemas import (
    NotificationCreate,
    NotificationResponse,
    NotificationListResponse,
    NotificationUnreadCount,
    NotificationMarkRead,
    NotificationMarkAllRead,
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse,
)


class NotificationService:
    """Service for notification operations."""
    
    def __init__(self, db: AsyncSession):
        self.repo = NotificationRepository(db)
    
    # ========================================================================
    # Notifications
    # ========================================================================
    
    async def create_notification(
        self,
        user_id: UUID,
        notification_type: NotificationType,
        title: str,
        message: str,
        action_url: Optional[str] = None
    ) -> Notification:
        """Create a new notification for a user."""
        # Check if notifications of this type are enabled
        is_enabled = await self.repo.is_notification_enabled(user_id, notification_type)
        if not is_enabled:
            return None
        
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            action_url=action_url
        )
        return await self.repo.create(notification)
    
    async def get_notifications(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 20,
        unread_only: bool = False
    ) -> NotificationListResponse:
        """Get paginated notifications for a user."""
        notifications, total = await self.repo.get_paginated(
            user_id, page, limit, unread_only
        )
        
        pages = (total + limit - 1) // limit if total > 0 else 1
        
        return NotificationListResponse(
            items=[NotificationResponse.model_validate(n) for n in notifications],
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )
    
    async def get_unread_count(self, user_id: UUID) -> NotificationUnreadCount:
        """Get unread notification count for badge display."""
        count = await self.repo.get_unread_count(user_id)
        return NotificationUnreadCount(unread_count=count)
    
    async def mark_as_read(
        self,
        notification_id: UUID,
        user_id: UUID
    ) -> NotificationMarkRead:
        """Mark a single notification as read."""
        success = await self.repo.mark_as_read(notification_id, user_id)
        return NotificationMarkRead(
            success=success,
            notification_id=notification_id
        )
    
    async def mark_all_as_read(self, user_id: UUID) -> NotificationMarkAllRead:
        """Mark all notifications as read for a user."""
        marked_count = await self.repo.mark_all_as_read(user_id)
        return NotificationMarkAllRead(
            success=True,
            marked_count=marked_count
        )
    
    # ========================================================================
    # Notification Triggers
    # ========================================================================
    
    async def notify_reply(
        self,
        doubt_author_id: UUID,
        replier_name: str,
        doubt_title: str,
        reply_id: UUID,
        discussion_id: UUID
    ) -> Optional[Notification]:
        """Send notification when someone replies to user's doubt."""
        title = "New reply to your doubt"
        message = f"{replier_name} replied to your doubt: '{doubt_title[:50]}...'"
        action_url = f"/community/{discussion_id}#reply-{reply_id}"
        
        return await self.create_notification(
            user_id=doubt_author_id,
            notification_type=NotificationType.REPLY,
            title=title,
            message=message,
            action_url=action_url
        )
    
    async def notify_answer_accepted(
        self,
        answer_author_id: UUID,
        asker_name: str,
        doubt_title: str,
        discussion_id: UUID
    ) -> Optional[Notification]:
        """Send notification when user's answer is accepted."""
        title = "Your answer was accepted! 🎉"
        message = f"{asker_name} accepted your answer to: '{doubt_title[:50]}...'"
        action_url = f"/community/{discussion_id}"
        
        return await self.create_notification(
            user_id=answer_author_id,
            notification_type=NotificationType.ANSWER_ACCEPTED,
            title=title,
            message=message,
            action_url=action_url
        )
    
    async def notify_upvote_milestone(
        self,
        author_id: UUID,
        content_type: str,  # "doubt" or "reply"
        content_title: str,
        upvote_count: int,
        content_id: UUID,
        discussion_id: Optional[UUID] = None
    ) -> Optional[Notification]:
        """Send notification when content reaches upvote milestone (10)."""
        title = f"Your {content_type} is gaining traction! 🚀"
        message = f"Your {content_type} '{content_title[:50]}...' reached {upvote_count} upvotes!"
        
        if discussion_id:
            action_url = f"/community/{discussion_id}"
        else:
            action_url = None
        
        return await self.create_notification(
            user_id=author_id,
            notification_type=NotificationType.UPVOTE_MILESTONE,
            title=title,
            message=message,
            action_url=action_url
        )
    
    async def notify_badge_earned(
        self,
        user_id: UUID,
        badge_name: str,
        badge_id: UUID
    ) -> Optional[Notification]:
        """Send notification when user earns a badge."""
        title = f"Badge earned: {badge_name} 🏆"
        message = f"Congratulations! You earned the '{badge_name}' badge. Keep up the great work!"
        action_url = f"/profile/achievements"
        
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.BADGE_EARNED,
            title=title,
            message=message,
            action_url=action_url
        )
    
    async def notify_streak_reminder(
        self,
        user_id: UUID,
        current_streak: int
    ) -> Optional[Notification]:
        """Send notification to remind user about their streak."""
        if current_streak > 0:
            title = "Don't break your streak! 🔥"
            message = f"You have a {current_streak}-day streak. Complete a lesson today to keep it going!"
        else:
            title = "Start a new streak today! 💪"
            message = "You haven't studied today. Complete a lesson to start a new streak!"
        
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.STREAK_REMINDER,
            title=title,
            message=message,
            action_url="/dashboard"
        )
    
    async def notify_announcement(
        self,
        user_ids: List[UUID],
        title: str,
        message: str,
        action_url: Optional[str] = None
    ) -> List[Notification]:
        """Send announcement notification to multiple users."""
        notifications = []
        for user_id in user_ids:
            notification = await self.create_notification(
                user_id=user_id,
                notification_type=NotificationType.ANNOUNCEMENT,
                title=title,
                message=message,
                action_url=action_url
            )
            if notification:
                notifications.append(notification)
        return notifications
    
    # ========================================================================
    # Notification Preferences
    # ========================================================================
    
    async def get_preferences(self, user_id: UUID) -> NotificationPreferenceResponse:
        """Get notification preferences for a user."""
        preferences = await self.repo.get_or_create_preferences(user_id)
        return NotificationPreferenceResponse.model_validate(preferences)
    
    async def update_preferences(
        self,
        user_id: UUID,
        preferences: NotificationPreferenceUpdate
    ) -> NotificationPreferenceResponse:
        """Update notification preferences for a user."""
        # Ensure preferences exist
        await self.repo.get_or_create_preferences(user_id)
        
        # Update preferences
        updated = await self.repo.update_preferences(
            user_id=user_id,
            replies_enabled=preferences.replies_enabled,
            answer_accepted_enabled=preferences.answer_accepted_enabled,
            upvote_milestone_enabled=preferences.upvote_milestone_enabled,
            badge_earned_enabled=preferences.badge_earned_enabled,
            streak_reminder_enabled=preferences.streak_reminder_enabled,
            announcement_enabled=preferences.announcement_enabled
        )
        
        return NotificationPreferenceResponse.model_validate(updated)
