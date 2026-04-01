from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from .models import Profile, UserStats
from ..auth.models import User


class UserRepository:
    """Repository for user-related database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_with_profile(self, user_id: UUID) -> Optional[tuple[User, Profile]]:
        """Get user with profile."""
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user:
            return user, user.profile
        return None, None
    
    async def get_profile(self, user_id: UUID) -> Optional[Profile]:
        """Get user profile."""
        result = await self.db.execute(
            select(Profile).where(Profile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_profile_by_user_id(self, user_id: UUID) -> Optional[Profile]:
        """Backward-compatible alias for getting a user's profile."""
        return await self.get_profile(user_id)
    
    async def create_profile(self, user_id: UUID) -> Profile:
        """Create a new profile for a user."""
        profile = Profile(user_id=user_id)
        self.db.add(profile)
        await self.db.flush()
        await self.db.refresh(profile)
        return profile
    
    async def update_profile(self, user_id: UUID, data: dict) -> Optional[Profile]:
        """Update user profile."""
        profile = await self.get_profile(user_id)
        if not profile:
            profile = await self.create_profile(user_id)
        
        for key, value in data.items():
            if hasattr(profile, key) and value is not None:
                setattr(profile, key, value)
        
        await self.db.flush()
        await self.db.refresh(profile)
        return profile
    
    async def get_or_create_stats(self, user_id: UUID) -> UserStats:
        """Get or create user stats."""
        result = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user_id)
        )
        stats = result.scalar_one_or_none()
        
        if not stats:
            stats = UserStats(user_id=user_id)
            self.db.add(stats)
            await self.db.flush()
            await self.db.refresh(stats)
        
        return stats
    
    async def get_all_users(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        role: Optional[str] = None,
    ) -> tuple[List[User], int]:
        """Get all users with pagination."""
        query = select(User)
        
        if search:
            query = query.where(
                User.email.ilike(f"%{search}%") |
                User.name.ilike(f"%{search}%")
            )
        
        if role:
            query = query.where(User.role == role)
        
        # Get total count
        count_result = await self.db.execute(
            select(User.id).filter(query.whereclause) if query.whereclause is not None else select(User.id)
        )
        total = len(count_result.all())
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit).order_by(User.created_at.desc())
        
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        return list(users), total
