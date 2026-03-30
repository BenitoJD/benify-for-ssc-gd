from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid

from ..database import get_db
from ..auth.dependencies import get_current_user, TokenData, require_admin
from .schemas import (
    ProfileUpdate,
    ProfileResponse,
    UserStats,
    OnboardingRequest,
    UsersListResponse,
    UserDetailResponse,
)
from .service import UserService
from ..shared.pagination import get_pagination_meta, PaginatedResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile."""
    service = UserService(db)
    return await service.get_user(uuid.UUID(current_user.user_id))


@router.patch("/me", response_model=ProfileResponse)
async def update_current_user_profile(
    data: ProfileUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    service = UserService(db)
    return await service.update_profile(uuid.UUID(current_user.user_id), data)


@router.post("/onboarding", response_model=ProfileResponse)
async def complete_onboarding(
    data: OnboardingRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Complete user onboarding."""
    service = UserService(db)
    return await service.complete_onboarding(uuid.UUID(current_user.user_id), data)


@router.get("/me/stats", response_model=UserStats)
async def get_current_user_stats(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's statistics."""
    service = UserService(db)
    return await service.get_user_stats(uuid.UUID(current_user.user_id))


# Admin routes
@router.get("/admin/users", response_model=PaginatedResponse[UsersListResponse])
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    _: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    service = UserService(db)
    users, total = await service.list_users(page, limit, search, role)
    
    return PaginatedResponse(
        data=users,
        meta=get_pagination_meta(total, page, limit),
    )


@router.get("/admin/users/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(
    user_id: str,
    _: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed user information (admin only)."""
    service = UserService(db)
    try:
        return await service.get_user(uuid.UUID(user_id))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )


@router.patch("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    _: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update user active status (admin only)."""
    # TODO: Implement user status update
    return {"message": "User status updated"}
