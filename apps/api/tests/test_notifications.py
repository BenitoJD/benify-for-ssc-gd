"""
Tests for notifications API.
"""
import pytest
from uuid import uuid4
from datetime import datetime, timedelta

from internal.notifications.models import Notification, NotificationPreference, NotificationType
from internal.notifications.service import NotificationService
from internal.notifications.repository import NotificationRepository
from internal.notifications.schemas import (
    NotificationPreferenceUpdate,
    NotificationType as SchemaNotificationType,
)


@pytest.fixture
async def notification_service(test_db):
    """Create notification service with test database."""
    return NotificationService(test_db)


@pytest.fixture
async def notification_repository(test_db):
    """Create notification repository with test database."""
    return NotificationRepository(test_db)


@pytest.fixture
async def test_user_id():
    """Generate a test user ID."""
    return uuid4()


@pytest.fixture
async def another_user_id():
    """Generate another test user ID."""
    return uuid4()


class TestNotificationRepository:
    """Tests for NotificationRepository."""
    
    async def test_create_notification(self, notification_repository, test_user_id):
        """Test creating a notification."""
        notification = Notification(
            user_id=test_user_id,
            type=NotificationType.REPLY,
            title="Test notification",
            message="This is a test notification",
            is_read=False
        )
        
        created = await notification_repository.create(notification)
        
        assert created.id is not None
        assert created.user_id == test_user_id
        assert created.type == NotificationType.REPLY
        assert created.title == "Test notification"
        assert created.is_read is False
    
    async def test_get_notification_by_id(self, notification_repository, test_user_id):
        """Test getting a notification by ID."""
        notification = Notification(
            user_id=test_user_id,
            type=NotificationType.ANNOUNCEMENT,
            title="Announcement",
            message="Important announcement",
            is_read=False
        )
        created = await notification_repository.create(notification)
        
        fetched = await notification_repository.get_by_id(created.id)
        
        assert fetched is not None
        assert fetched.id == created.id
        assert fetched.title == "Announcement"
    
    async def test_get_paginated_notifications(self, notification_repository, test_user_id):
        """Test getting paginated notifications."""
        # Create 25 notifications
        for i in range(25):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.REPLY,
                title=f"Notification {i}",
                message=f"Message {i}",
                is_read=False
            )
            await notification_repository.create(notification)
        
        # Get first page
        page1, total = await notification_repository.get_paginated(
            test_user_id, page=1, limit=10
        )
        assert len(page1) == 10
        assert total == 25
        
        # Get second page
        page2, total = await notification_repository.get_paginated(
            test_user_id, page=2, limit=10
        )
        assert len(page2) == 10
        assert total == 25
        
        # Get third page
        page3, total = await notification_repository.get_paginated(
            test_user_id, page=3, limit=10
        )
        assert len(page3) == 5
        assert total == 25
    
    async def test_get_unread_count(self, notification_repository, test_user_id):
        """Test getting unread notification count."""
        # Create 3 unread and 2 read notifications
        for i in range(3):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.REPLY,
                title=f"Unread {i}",
                message=f"Message {i}",
                is_read=False
            )
            await notification_repository.create(notification)
        
        for i in range(2):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.ANNOUNCEMENT,
                title=f"Read {i}",
                message=f"Message {i}",
                is_read=True
            )
            await notification_repository.create(notification)
        
        count = await notification_repository.get_unread_count(test_user_id)
        assert count == 3
    
    async def test_mark_notification_as_read(self, notification_repository, test_user_id):
        """Test marking a notification as read."""
        notification = Notification(
            user_id=test_user_id,
            type=NotificationType.REPLY,
            title="To be marked read",
            message="Will be marked read",
            is_read=False
        )
        created = await notification_repository.create(notification)
        
        success = await notification_repository.mark_as_read(created.id, test_user_id)
        assert success is True
        
        # Verify it's marked as read
        fetched = await notification_repository.get_by_id(created.id)
        assert fetched.is_read is True
    
    async def test_mark_all_as_read(self, notification_repository, test_user_id):
        """Test marking all notifications as read."""
        # Create 5 unread notifications
        for i in range(5):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.REPLY,
                title=f"Unread {i}",
                message=f"Message {i}",
                is_read=False
            )
            await notification_repository.create(notification)
        
        marked_count = await notification_repository.mark_all_as_read(test_user_id)
        assert marked_count == 5
        
        # Verify all are read
        count = await notification_repository.get_unread_count(test_user_id)
        assert count == 0


class TestNotificationService:
    """Tests for NotificationService."""
    
    async def test_create_notification(self, notification_service, test_user_id):
        """Test creating a notification through service."""
        notification = await notification_service.create_notification(
            user_id=test_user_id,
            notification_type=SchemaNotificationType.BADGE_EARNED,
            title="Badge earned!",
            message="You earned the Week Warrior badge",
            action_url="/profile/achievements"
        )
        
        assert notification is not None
        assert notification.user_id == test_user_id
        assert notification.type.value == "badge_earned"
        assert notification.title == "Badge earned!"
    
    async def test_get_notifications_paginated(self, notification_service, test_user_id):
        """Test getting paginated notifications."""
        # Create notifications
        for i in range(15):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.ANNOUNCEMENT,
                title=f"Announcement {i}",
                message=f"Message {i}",
                is_read=False
            )
            await notification_service.repo.create(notification)
        
        result = await notification_service.get_notifications(
            user_id=test_user_id,
            page=1,
            limit=10
        )
        
        assert len(result.items) == 10
        assert result.total == 15
        assert result.page == 1
        assert result.limit == 10
        assert result.pages == 2
    
    async def test_get_unread_count(self, notification_service, test_user_id):
        """Test getting unread count."""
        # Create 7 unread notifications
        for i in range(7):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.STREAK_REMINDER,
                title=f"Streak {i}",
                message=f"Message {i}",
                is_read=False
            )
            await notification_service.repo.create(notification)
        
        result = await notification_service.get_unread_count(test_user_id)
        assert result.unread_count == 7
    
    async def test_mark_as_read(self, notification_service, test_user_id):
        """Test marking a notification as read."""
        # Create notification
        notification = await notification_service.create_notification(
            user_id=test_user_id,
            notification_type=SchemaNotificationType.UPVOTE_MILESTONE,
            title="Upvote milestone",
            message="You reached 10 upvotes!"
        )
        
        result = await notification_service.mark_as_read(notification.id, test_user_id)
        
        assert result.success is True
        assert result.notification_id == notification.id
    
    async def test_mark_all_as_read(self, notification_service, test_user_id):
        """Test marking all as read."""
        # Create 4 unread notifications
        for i in range(4):
            notification = Notification(
                user_id=test_user_id,
                type=NotificationType.REPLY,
                title=f"Reply {i}",
                message=f"Message {i}",
                is_read=False
            )
            await notification_service.repo.create(notification)
        
        result = await notification_service.mark_all_as_read(test_user_id)
        
        assert result.success is True
        assert result.marked_count == 4


class TestNotificationTriggers:
    """Tests for notification trigger methods."""
    
    async def test_notify_reply(self, notification_service, test_user_id, another_user_id):
        """Test reply notification trigger."""
        notification = await notification_service.notify_reply(
            doubt_author_id=test_user_id,
            replier_name="John Doe",
            doubt_title="How to solve this problem?",
            reply_id=uuid4(),
            discussion_id=uuid4()
        )
        
        assert notification is not None
        assert notification.user_id == test_user_id
        assert notification.type.value == "reply"
        assert "John Doe" in notification.message
        assert "How to solve" in notification.message
    
    async def test_notify_answer_accepted(self, notification_service, test_user_id):
        """Test answer accepted notification trigger."""
        notification = await notification_service.notify_answer_accepted(
            answer_author_id=test_user_id,
            asker_name="Jane Smith",
            doubt_title="What is 2+2?",
            discussion_id=uuid4()
        )
        
        assert notification is not None
        assert notification.user_id == test_user_id
        assert notification.type.value == "answer_accepted"
        assert "Jane Smith" in notification.message
        assert "accepted your answer" in notification.message
    
    async def test_notify_upvote_milestone(self, notification_service, test_user_id):
        """Test upvote milestone notification trigger."""
        notification = await notification_service.notify_upvote_milestone(
            author_id=test_user_id,
            content_type="doubt",
            content_title="Need help with reasoning",
            upvote_count=10,
            content_id=uuid4(),
            discussion_id=uuid4()
        )
        
        assert notification is not None
        assert notification.user_id == test_user_id
        assert notification.type.value == "upvote_milestone"
        assert "10 upvotes" in notification.message
    
    async def test_notify_badge_earned(self, notification_service, test_user_id):
        """Test badge earned notification trigger."""
        notification = await notification_service.notify_badge_earned(
            user_id=test_user_id,
            badge_name="Week Warrior",
            badge_id=uuid4()
        )
        
        assert notification is not None
        assert notification.user_id == test_user_id
        assert notification.type.value == "badge_earned"
        assert "Week Warrior" in notification.title
    
    async def test_notify_streak_reminder(self, notification_service, test_user_id):
        """Test streak reminder notification trigger."""
        notification = await notification_service.notify_streak_reminder(
            user_id=test_user_id,
            current_streak=5
        )
        
        assert notification is not None
        assert notification.user_id == test_user_id
        assert notification.type.value == "streak_reminder"
        assert "5-day streak" in notification.message
    
    async def test_notify_streak_reminder_no_streak(self, notification_service, test_user_id):
        """Test streak reminder when user has no streak."""
        notification = await notification_service.notify_streak_reminder(
            user_id=test_user_id,
            current_streak=0
        )
        
        assert notification is not None
        assert notification.type.value == "streak_reminder"
        assert "new streak" in notification.message.lower()
    
    async def test_notify_announcement(self, notification_service, test_user_id, another_user_id):
        """Test announcement notification to multiple users."""
        notifications = await notification_service.notify_announcement(
            user_ids=[test_user_id, another_user_id],
            title="Platform Maintenance",
            message="System will be under maintenance on Sunday",
            action_url="/announcements/1"
        )
        
        assert len(notifications) == 2
        user_ids = [n.user_id for n in notifications]
        assert test_user_id in user_ids
        assert another_user_id in user_ids
        assert all(n.type.value == "announcement" for n in notifications)


class TestNotificationPreferences:
    """Tests for notification preferences."""
    
    async def test_get_preferences_default(self, notification_service, test_user_id):
        """Test getting default preferences for new user."""
        result = await notification_service.get_preferences(test_user_id)
        
        assert result.user_id == test_user_id
        assert result.replies_enabled is True
        assert result.answer_accepted_enabled is True
        assert result.upvote_milestone_enabled is True
        assert result.badge_earned_enabled is True
        assert result.streak_reminder_enabled is True
        assert result.announcement_enabled is True
    
    async def test_update_preferences(self, notification_service, test_user_id):
        """Test updating notification preferences."""
        # First get preferences to create them
        await notification_service.get_preferences(test_user_id)
        
        # Update preferences
        update_data = NotificationPreferenceUpdate(
            replies_enabled=False,
            badge_earned_enabled=False
        )
        result = await notification_service.update_preferences(test_user_id, update_data)
        
        assert result.replies_enabled is False
        assert result.badge_earned_enabled is False
        # Unchanged preferences should remain True
        assert result.answer_accepted_enabled is True
    
    async def test_notification_respects_preferences(self, notification_service, test_user_id):
        """Test that notifications respect user preferences."""
        # Disable reply notifications
        await notification_service.get_preferences(test_user_id)
        update_data = NotificationPreferenceUpdate(replies_enabled=False)
        await notification_service.update_preferences(test_user_id, update_data)
        
        # Try to create a reply notification
        notification = await notification_service.notify_reply(
            doubt_author_id=test_user_id,
            replier_name="Someone",
            doubt_title="Test doubt",
            reply_id=uuid4(),
            discussion_id=uuid4()
        )
        
        # Should return None because replies are disabled
        assert notification is None


class TestNotificationAPI:
    """Tests for notification API endpoints via client."""
    
    async def test_get_notifications_endpoint(self, client, test_db):
        """Test GET /api/v1/notifications endpoint."""
        # Import test fixtures
        from tests.conftest import test_db as db_fixture
        from internal.auth.service import create_access_token
        
        # Create test user and get token
        from internal.auth.models import User
        from internal.auth.schemas import UserRole, SubscriptionStatus
        
        user = User(
            email="notif_test@example.com",
            password_hash="hashedpassword",
            role=UserRole.STUDENT,
            subscription_status=SubscriptionStatus.FREE
        )
        test_db.add(user)
        await test_db.flush()
        await test_db.refresh(user)
        
        # Create some notifications
        for i in range(3):
            notification = Notification(
                user_id=user.id,
                type=NotificationType.ANNOUNCEMENT,
                title=f"Notification {i}",
                message=f"Message {i}",
                is_read=False
            )
            test_db.add(notification)
        await test_db.flush()
        
        # Call API
        token = create_access_token({"sub": str(user.id)})
        response = await client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) == 3
        assert data["total"] == 3
    
    async def test_get_unread_count_endpoint(self, client, test_db):
        """Test GET /api/v1/notifications/unread-count endpoint."""
        from internal.auth.models import User
        from internal.auth.schemas import UserRole, SubscriptionStatus
        from internal.auth.service import create_access_token
        
        user = User(
            email="count_test@example.com",
            password_hash="hashedpassword",
            role=UserRole.STUDENT,
            subscription_status=SubscriptionStatus.FREE
        )
        test_db.add(user)
        await test_db.flush()
        await test_db.refresh(user)
        
        token = create_access_token({"sub": str(user.id)})
        
        # Create 5 unread notifications
        for i in range(5):
            notification = Notification(
                user_id=user.id,
                type=NotificationType.STREAK_REMINDER,
                title=f"Streak {i}",
                message=f"Message {i}",
                is_read=False
            )
            test_db.add(notification)
        await test_db.flush()
        
        response = await client.get(
            "/api/v1/notifications/unread-count",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["unread_count"] == 5
    
    async def test_mark_notification_read_endpoint(self, client, test_db):
        """Test PATCH /api/v1/notifications/{id}/read endpoint."""
        from internal.auth.models import User
        from internal.auth.schemas import UserRole, SubscriptionStatus
        from internal.auth.service import create_access_token
        
        user = User(
            email="markread_test@example.com",
            password_hash="hashedpassword",
            role=UserRole.STUDENT,
            subscription_status=SubscriptionStatus.FREE
        )
        test_db.add(user)
        await test_db.flush()
        await test_db.refresh(user)
        
        token = create_access_token({"sub": str(user.id)})
        
        # Create notification
        notification = Notification(
            user_id=user.id,
            type=NotificationType.REPLY,
            title="Test reply",
            message="Test message",
            is_read=False
        )
        test_db.add(notification)
        await test_db.flush()
        await test_db.refresh(notification)
        
        response = await client.patch(
            f"/api/v1/notifications/{notification.id}/read",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["notification_id"] == str(notification.id)
    
    async def test_mark_all_read_endpoint(self, client, test_db):
        """Test POST /api/v1/notifications/read-all endpoint."""
        from internal.auth.models import User
        from internal.auth.schemas import UserRole, SubscriptionStatus
        from internal.auth.service import create_access_token
        
        user = User(
            email="markall_test@example.com",
            password_hash="hashedpassword",
            role=UserRole.STUDENT,
            subscription_status=SubscriptionStatus.FREE
        )
        test_db.add(user)
        await test_db.flush()
        await test_db.refresh(user)
        
        # Create 4 unread notifications
        for i in range(4):
            notification = Notification(
                user_id=user.id,
                type=NotificationType.ANNOUNCEMENT,
                title=f"Announcement {i}",
                message=f"Message {i}",
                is_read=False
            )
            test_db.add(notification)
        await test_db.flush()
        
        token = create_access_token({"sub": str(user.id)})
        response = await client.post(
            "/api/v1/notifications/read-all",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["marked_count"] == 4
    
    async def test_get_notification_preferences_endpoint(self, client, test_db):
        """Test GET /api/v1/users/{user_id}/notification-preferences endpoint."""
        from internal.auth.models import User
        from internal.auth.schemas import UserRole, SubscriptionStatus
        from internal.auth.service import create_access_token
        
        user = User(
            email="pref_test@example.com",
            password_hash="hashedpassword",
            role=UserRole.STUDENT,
            subscription_status=SubscriptionStatus.FREE
        )
        test_db.add(user)
        await test_db.flush()
        await test_db.refresh(user)
        
        token = create_access_token({"sub": str(user.id)})
        
        response = await client.get(
            f"/api/v1/users/{user.id}/notification-preferences",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == str(user.id)
        assert data["replies_enabled"] is True
    
    async def test_update_notification_preferences_endpoint(self, client, test_db):
        """Test PUT /api/v1/users/{user_id}/notification-preferences endpoint."""
        from internal.auth.models import User
        from internal.auth.schemas import UserRole, SubscriptionStatus
        from internal.auth.service import create_access_token
        
        user = User(
            email="update_pref_test@example.com",
            password_hash="hashedpassword",
            role=UserRole.STUDENT,
            subscription_status=SubscriptionStatus.FREE
        )
        test_db.add(user)
        await test_db.flush()
        await test_db.refresh(user)
        
        token = create_access_token({"sub": str(user.id)})
        
        response = await client.put(
            f"/api/v1/users/{user.id}/notification-preferences",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "replies_enabled": False,
                "streak_reminder_enabled": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["replies_enabled"] is False
        assert data["streak_reminder_enabled"] is False
        # Other preferences should remain True
        assert data["announcement_enabled"] is True
