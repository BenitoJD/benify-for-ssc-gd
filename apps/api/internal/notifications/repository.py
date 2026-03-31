"""
Repository for notification database operations.
"""
from typing import List, Optional, Tuple
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Notification, NotificationPreference, NotificationType


class NotificationRepository:
    """Repository for notification database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ========================================================================
    # Notifications
    # ========================================================================
    
    async def create(self, notification: Notification) -> Notification:
        """Create a new notification."""
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)
        return notification
    
    async def get_by_id(self, notification_id: UUID) -> Optional[Notification]:
        """Get notification by ID."""
        result = await self.db.execute(
            select(Notification)
            .where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id_and_user(
        self, 
        notification_id: UUID, 
        user_id: UUID
    ) -> Optional[Notification]:
        """Get notification by ID for a specific user."""
        result = await self.db.execute(
            select(Notification)
            .where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def get_paginated(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 20,
        unread_only: bool = False
    ) -> Tuple[List[Notification], int]:
        """Get paginated notifications for a user."""
        # Base query
        query = select(Notification).where(Notification.user_id == user_id)
        count_query = select(func.count(Notification.id)).where(Notification.user_id == user_id)
        
        # Filter unread only if requested
        if unread_only:
            query = query.where(Notification.is_read == False)
            count_query = count_query.where(Notification.is_read == False)
        
        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Get paginated results
        offset = (page - 1) * limit
        query = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        notifications = result.scalars().all()
        
        return list(notifications), total
    
    async def get_unread_count(self, user_id: UUID) -> int:
        """Get unread notification count for a user."""
        result = await self.db.execute(
            select(func.count(Notification.id))
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        return result.scalar()
    
    async def mark_as_read(self, notification_id: UUID, user_id: UUID) -> bool:
        """Mark a notification as read. Returns True if successful."""
        result = await self.db.execute(
            update(Notification)
            .where(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            .values(is_read=True, updated_at=datetime.utcnow())
        )
        return result.rowcount > 0
    
    async def mark_all_as_read(self, user_id: UUID) -> int:
        """Mark all notifications as read for a user. Returns count of updated rows."""
        result = await self.db.execute(
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
            .values(is_read=True, updated_at=datetime.utcnow())
        )
        return result.rowcount
    
    async def delete_old_notifications(
        self, 
        user_id: UUID, 
        days_old: int = 30
    ) -> int:
        """Delete notifications older than specified days. Returns count of deleted rows."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        result = await self.db.execute(
            delete(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.created_at < cutoff_date
            )
        )
        return result.rowcount
    
    # ========================================================================
    # Notification Preferences
    # ========================================================================
    
    async def get_preferences(self, user_id: UUID) -> Optional[NotificationPreference]:
        """Get notification preferences for a user."""
        result = await self.db.execute(
            select(NotificationPreference)
            .where(NotificationPreference.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_preferences(
        self, 
        preferences: NotificationPreference
    ) -> NotificationPreference:
        """Create notification preferences for a user."""
        self.db.add(preferences)
        await self.db.flush()
        await self.db.refresh(preferences)
        return preferences
    
    async def update_preferences(
        self,
        user_id: UUID,
        replies_enabled: Optional[bool] = None,
        answer_accepted_enabled: Optional[bool] = None,
        upvote_milestone_enabled: Optional[bool] = None,
        badge_earned_enabled: Optional[bool] = None,
        streak_reminder_enabled: Optional[bool] = None,
        announcement_enabled: Optional[bool] = None
    ) -> Optional[NotificationPreference]:
        """Update notification preferences for a user."""
        # Build update values
        update_values = {"updated_at": datetime.utcnow()}
        if replies_enabled is not None:
            update_values["replies_enabled"] = replies_enabled
        if answer_accepted_enabled is not None:
            update_values["answer_accepted_enabled"] = answer_accepted_enabled
        if upvote_milestone_enabled is not None:
            update_values["upvote_milestone_enabled"] = upvote_milestone_enabled
        if badge_earned_enabled is not None:
            update_values["badge_earned_enabled"] = badge_earned_enabled
        if streak_reminder_enabled is not None:
            update_values["streak_reminder_enabled"] = streak_reminder_enabled
        if announcement_enabled is not None:
            update_values["announcement_enabled"] = announcement_enabled
        
        result = await self.db.execute(
            update(NotificationPreference)
            .where(NotificationPreference.user_id == user_id)
            .values(**update_values)
        )
        
        if result.rowcount > 0:
            return await self.get_preferences(user_id)
        return None
    
    async def get_or_create_preferences(
        self, 
        user_id: UUID
    ) -> NotificationPreference:
        """Get or create notification preferences for a user."""
        preferences = await self.get_preferences(user_id)
        if preferences is None:
            preferences = NotificationPreference(user_id=user_id)
            preferences = await self.create_preferences(preferences)
        return preferences
    
    async def is_notification_enabled(
        self,
        user_id: UUID,
        notification_type: NotificationType
    ) -> bool:
        """Check if a specific notification type is enabled for a user."""
        preferences = await self.get_or_create_preferences(user_id)
        
        type_to_field = {
            NotificationType.REPLY: preferences.replies_enabled,
            NotificationType.ANSWER_ACCEPTED: preferences.answer_accepted_enabled,
            NotificationType.UPVOTE_MILESTONE: preferences.upvote_milestone_enabled,
            NotificationType.BADGE_EARNED: preferences.badge_earned_enabled,
            NotificationType.STREAK_REMINDER: preferences.streak_reminder_enabled,
            NotificationType.ANNOUNCEMENT: preferences.announcement_enabled,
        }
        
        return type_to_field.get(notification_type, True)


from datetime import timedelta
