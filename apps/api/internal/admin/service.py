from datetime import datetime, timedelta
from typing import Optional, List, Tuple
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
from ..shared.exceptions import NotFoundException
from .schemas import (
    AdminDashboardStats,
    AdminUserListItem,
    AdminUserDetail,
    ProfileInfo,
    UserStatsInfo,
    PaginationMeta,
    PaginatedUsersResponse,
)


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

    async def get_admin_user(self, user_id: UUID) -> dict:
        """Return the authenticated admin user payload."""
        result = await self.db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin user not found",
            )

        if user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required.",
            )

        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
        }
    
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
    
    async def get_users(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        role: Optional[str] = None,
    ) -> Tuple[List[AdminUserListItem], PaginationMeta]:
        """Get paginated list of users for admin.
        
        Args:
            page: Page number (1-indexed)
            limit: Items per page
            search: Optional search term for email/name
            role: Optional role filter
            
        Returns:
            Tuple of (list of AdminUserListItem, pagination metadata)
        """
        # Build base query
        query = select(User).where(User.deleted_at.is_(None))
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    User.email.ilike(search_term),
                    User.name.ilike(search_term)
                )
            )
        
        # Apply role filter
        if role:
            try:
                role_enum = UserRole(role)
                query = query.where(User.role == role_enum)
            except ValueError:
                pass  # Ignore invalid role values
        
        # Get total count
        user_subquery = query.subquery()
        count_query = select(func.count()).select_from(user_subquery)
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination and ordering
        offset = (page - 1) * limit
        query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        # Convert to response models
        user_items = [
            AdminUserListItem(
                id=str(u.id),
                email=u.email,
                name=u.name,
                role=u.role,
                subscription_status=u.subscription_status,
                created_at=u.created_at,
                last_login_at=u.last_login_at,
                is_active=u.deleted_at is None,
            )
            for u in users
        ]
        
        # Calculate pagination metadata
        pages = (total + limit - 1) // limit if total > 0 else 0
        pagination_meta = PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            pages=pages,
        )
        
        return user_items, pagination_meta
    
    async def get_user_detail(self, user_id: UUID) -> AdminUserDetail:
        """Get detailed user information for admin.
        
        Args:
            user_id: User UUID
            
        Returns:
            AdminUserDetail with profile and stats
            
        Raises:
            NotFoundException: If user not found
        """
        # Get user
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise NotFoundException("User")
        
        # Get user profile separately
        from ..users.models import Profile
        profile_result = await self.db.execute(
            select(Profile).where(Profile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        # Get user stats
        from ..users.models import UserStats
        stats_result = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user_id)
        )
        stats = stats_result.scalar_one_or_none()
        
        # Build profile info if profile exists
        profile_info = None
        if profile:
            profile_info = ProfileInfo(
                first_name=profile.first_name,
                last_name=profile.last_name,
                avatar_url=profile.avatar_url,
                language_preference=profile.language_preference,
                target_exam_year=profile.target_exam_year,
                current_level=profile.current_level.value if profile.current_level else None,
                daily_study_hours=profile.daily_study_hours,
                onboarding_complete=profile.onboarding_complete,
                phone=profile.phone,
                phone_verified=profile.phone_verified,
                gender=profile.gender,
                height_cm=profile.height_cm,
                weight_kg=profile.weight_kg,
                physical_fitness_baseline=profile.physical_fitness_baseline,
            )
        
        # Build stats info if stats exist
        stats_info = None
        if stats:
            stats_info = UserStatsInfo(
                total_lessons_completed=stats.total_lessons_completed,
                total_tests_taken=stats.total_tests_taken,
                total_study_hours=stats.total_study_hours,
                total_focus_minutes=stats.total_focus_minutes,
                current_streak=stats.current_streak,
                longest_streak=stats.longest_streak,
                overall_progress=stats.overall_progress,
            )
        
        return AdminUserDetail(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role,
            subscription_status=user.subscription_status,
            created_at=user.created_at,
            last_login_at=user.last_login_at,
            is_active=user.deleted_at is None,
            profile=profile_info,
            stats=stats_info,
        )
