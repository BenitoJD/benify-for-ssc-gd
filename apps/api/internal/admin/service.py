from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from fastapi import HTTPException, status

from ..config import settings
from ..auth.models import User
from ..auth.schemas import UserRole
from ..auth.service import verify_password, get_password_hash, create_access_token, create_refresh_token
from ..redis import get_cache, CacheService
from .schemas import AdminDashboardStats


class AdminService:
    """Service for admin operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def admin_login(self, email: str, password: str, cache: CacheService) -> dict:
        """Authenticate admin user and return tokens."""
        # Find user by email
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        
        # Verify user is admin
        if user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required.",
            )
        
        # Verify password
        if not user.password_hash or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        
        # Create tokens with admin role
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
        
        # Access token for admin expires in 30 minutes (for inactivity timeout)
        access_token = create_access_token(
            token_data,
            expires_delta=timedelta(minutes=30)
        )
        refresh_token = create_refresh_token(token_data)
        
        # Store refresh token family
        await cache.set(f"refresh_family:{user.id}", refresh_token, ttl=7 * 24 * 60 * 60)
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await self.db.flush()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 30 * 60,  # 30 minutes in seconds
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role.value,
            }
        }
    
    async def get_dashboard_stats(self) -> AdminDashboardStats:
        """Get dashboard statistics."""
        # Total users
        total_users_result = await self.db.execute(select(func.count(User.id)))
        total_users = total_users_result.scalar() or 0
        
        # Active subscriptions (non-free and not cancelled)
        from ..auth.schemas import SubscriptionStatus
        active_subs_result = await self.db.execute(
            select(func.count(User.id)).where(
                and_(
                    User.subscription_status == SubscriptionStatus.PREMIUM,
                    User.deleted_at.is_(None)
                )
            )
        )
        active_subscriptions = active_subs_result.scalar() or 0
        
        # Daily active users (users who logged in today)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_active_result = await self.db.execute(
            select(func.count(User.id)).where(
                and_(
                    User.last_login_at >= today_start,
                    User.deleted_at.is_(None)
                )
            )
        )
        daily_active_users = daily_active_result.scalar() or 0
        
        # Reports count (placeholder - would come from reports table)
        reports_count = 0
        
        # Total lessons completed (placeholder - would come from progress table)
        total_lessons_completed = 0
        
        # Total tests taken (placeholder - would come from attempts table)
        total_tests_taken = 0
        
        return AdminDashboardStats(
            total_users=total_users,
            active_subscriptions=active_subscriptions,
            daily_active_users=daily_active_users,
            reports_count=reports_count,
            total_lessons_completed=total_lessons_completed,
            total_tests_taken=total_tests_taken,
        )
    
    async def get_recent_registrations(self, limit: int = 5) -> list:
        """Get recent user registrations."""
        result = await self.db.execute(
            select(User)
            .where(User.deleted_at.is_(None))
            .order_by(User.created_at.desc())
            .limit(limit)
        )
        users = result.scalars().all()
        
        return [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "role": u.role.value,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    
    async def update_user_status(self, user_id: UUID, is_active: bool) -> dict:
        """Update user active status (suspend/activate)."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        if is_active:
            # Activating user - clear deleted_at
            user.deleted_at = None
        else:
            # Suspending user - set deleted_at to current time
            user.deleted_at = datetime.utcnow()
        
        await self.db.flush()
        
        return {
            "id": str(user.id),
            "is_active": user.deleted_at is None,
            "message": "User activated successfully" if is_active else "User suspended successfully",
        }
