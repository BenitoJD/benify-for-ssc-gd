from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import UserRepository
from .schemas import ProfileUpdate, ProfileResponse, UserStats, OnboardingRequest
from ..auth.dependencies import TokenData
from ..shared.exceptions import NotFoundException


class UserService:
    """Service layer for user operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)
    
    async def get_profile(self, user_id: UUID) -> ProfileResponse:
        """Get user profile."""
        profile = await self.repo.get_profile(user_id)
        if not profile:
            # Create default profile if doesn't exist
            profile = await self.repo.create_profile(user_id)
        return ProfileResponse.model_validate(profile)
    
    async def update_profile(
        self,
        user_id: UUID,
        data: ProfileUpdate,
    ) -> ProfileResponse:
        """Update user profile."""
        update_data = data.model_dump(exclude_unset=True)
        
        # Handle language_preference enum conversion
        if "language_preference" in update_data and update_data["language_preference"]:
            update_data["language_preference"] = update_data["language_preference"].value
        if "current_level" in update_data and update_data["current_level"]:
            update_data["current_level"] = update_data["current_level"].value
        if "fitness_level" in update_data and update_data["fitness_level"]:
            update_data["physical_fitness_baseline"] = update_data.pop("fitness_level").value
        
        profile = await self.repo.update_profile(user_id, update_data)
        if not profile:
            raise NotFoundException("Profile")
        
        return ProfileResponse.model_validate(profile)
    
    async def complete_onboarding(
        self,
        user_id: UUID,
        data: OnboardingRequest,
    ) -> ProfileResponse:
        """Complete user onboarding."""
        update_data = data.model_dump(exclude_unset=True)
        
        # Convert enums to values
        if "language_preference" in update_data and update_data["language_preference"]:
            update_data["language_preference"] = update_data["language_preference"].value
        if "current_level" in update_data and update_data["current_level"]:
            update_data["current_level"] = update_data["current_level"].value
        if "fitness_level" in update_data and update_data["fitness_level"]:
            update_data["physical_fitness_baseline"] = update_data.pop("fitness_level").value
        
        update_data["onboarding_complete"] = True
        
        profile = await self.repo.update_profile(user_id, update_data)
        if not profile:
            raise NotFoundException("Profile")
        
        return ProfileResponse.model_validate(profile)
    
    async def get_user_stats(self, user_id: UUID) -> UserStats:
        """Get user statistics."""
        stats = await self.repo.get_or_create_stats(user_id)
        return UserStats.model_validate(stats)
    
    async def get_user(self, user_id: UUID) -> dict:
        """Get user with profile and stats."""
        user, profile = await self.repo.get_user_with_profile(user_id)
        if not user:
            raise NotFoundException("User")
        
        stats = await self.repo.get_or_create_stats(user_id)
        
        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "subscription_status": user.subscription_status.value,
            "created_at": user.created_at,
            "last_login_at": user.last_login_at,
            "is_active": user.deleted_at is None,
            "profile": ProfileResponse.model_validate(profile) if profile else None,
            "stats": UserStats.model_validate(stats) if stats else None,
        }
    
    async def list_users(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        role: Optional[str] = None,
    ) -> tuple[List[dict], int]:
        """List all users (admin only)."""
        users, total = await self.repo.get_all_users(page, limit, search, role)
        
        return [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.name,
                "role": u.role.value,
                "subscription_status": u.subscription_status.value,
                "created_at": u.created_at,
                "last_login_at": u.last_login_at,
                "is_active": u.deleted_at is None,
            }
            for u in users
        ], total
