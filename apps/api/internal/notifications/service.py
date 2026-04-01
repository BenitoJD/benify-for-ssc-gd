"""
Service layer for notification business logic.
"""
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
import json

from .models import Notification, NotificationPreference, NotificationType, PushToken
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
    PushTokenCreate,
    PushTokenResponse,
    PushTokenDeleteResponse,
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
    
    async def notify_study_reminder(
        self,
        user_id: UUID,
        task_title: str,
        task_type: str,
        due_date: Optional[str] = None
    ) -> Optional[Notification]:
        """Send notification for study reminders."""
        title = f"Time to study: {task_title}"
        if due_date:
            message = f"Your {task_type} '{task_title}' is due soon. Don't forget to complete it!"
        else:
            message = f"Time to work on your {task_type}: {task_title}"
        
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.STUDY_REMINDER,
            title=title,
            message=message,
            action_url="/study-plan/today"
        )
    
    async def notify_exam_alert(
        self,
        user_id: UUID,
        exam_name: str,
        exam_date: str,
        days_remaining: int
    ) -> Optional[Notification]:
        """Send notification for exam alerts."""
        title = f"Exam in {days_remaining} days: {exam_name}"
        message = f"Your {exam_name} is scheduled for {exam_date}. Keep preparing!"
        
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EXAM_ALERT,
            title=title,
            message=message,
            action_url="/dashboard"
        )
    
    async def notify_document_deadline(
        self,
        user_id: UUID,
        document_name: str,
        deadline_date: str,
        days_remaining: int
    ) -> Optional[Notification]:
        """Send notification for document deadlines."""
        title = f"Document deadline in {days_remaining} days"
        message = f"Remember to upload your {document_name} by {deadline_date}."
        
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.DOCUMENT_DEADLINE,
            title=title,
            message=message,
            action_url="/documents"
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
        response = NotificationPreferenceResponse.model_validate(preferences)
        # Return with mapped preferences for frontend compatibility
        return response
    
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
            study_reminder_enabled=preferences.study_reminder_enabled,
            exam_alert_enabled=preferences.exam_alert_enabled,
            document_deadline_enabled=preferences.document_deadline_enabled,
            announcement_enabled=preferences.announcement_enabled
        )
        
        response = NotificationPreferenceResponse.model_validate(updated)
        return response
    
    # ========================================================================
    # Push Tokens
    # ========================================================================
    
    async def store_push_token(
        self,
        user_id: UUID,
        fcm_token: str,
        subscription_info: Optional[dict] = None
    ) -> PushTokenResponse:
        """Store or update a push token for a user."""
        push_token = PushToken(
            user_id=user_id,
            token=fcm_token,
            device_type="web",
            subscription_info=json.dumps(subscription_info) if subscription_info else None
        )
        
        stored = await self.repo.create_push_token(push_token)
        
        return PushTokenResponse(
            success=True,
            message="Push token stored successfully",
            token_id=stored.id
        )
    
    async def remove_push_token(
        self,
        user_id: UUID,
        fcm_token: str
    ) -> PushTokenDeleteResponse:
        """Remove (deactivate) a push token for a user."""
        success = await self.repo.deactivate_push_token(fcm_token, user_id)
        
        if success:
            return PushTokenDeleteResponse(
                success=True,
                message="Push token removed successfully"
            )
        else:
            return PushTokenDeleteResponse(
                success=False,
                message="Push token not found"
            )
    
    async def remove_all_push_tokens(
        self,
        user_id: UUID
    ) -> PushTokenDeleteResponse:
        """Remove (deactivate) all push tokens for a user."""
        count = await self.repo.deactivate_all_push_tokens(user_id)
        
        return PushTokenDeleteResponse(
            success=True,
            message=f"Removed {count} push token(s)"
        )
    
    async def get_user_push_tokens(
        self,
        user_id: UUID
    ) -> List[PushToken]:
        """Get all active push tokens for a user."""
        return await self.repo.get_push_tokens_for_user(user_id)
