from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
from uuid import UUID

from ..database import get_db
from ..redis import get_cache, CacheService
from ..config import settings
from ..auth.dependencies import get_current_user, TokenData, require_admin
from ..auth.schemas import TokenResponse, UserResponse, UserRole
from .schemas import (
    AdminLoginRequest,
    AdminDashboardResponse,
    AdminDashboardStats,
    UserStatusUpdateRequest,
    UserStatusUpdateResponse,
    PaginatedUsersResponse,
    AdminUserDetail,
)
from .service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


def set_admin_auth_cookies(response: Response, *, access_token: str, refresh_token: str, expires_in: int) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=expires_in,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )


@router.post("/login")
async def admin_login(
    request: AdminLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Admin login with email and password.
    
    Returns JWT tokens with admin role. The access token expires in 30 minutes
    to enforce admin session timeout policy.
    """
    service = AdminService(db)
    tokens = await service.admin_login(request.email, request.password, cache)
    
    # Set refresh token in httpOnly cookie
    set_admin_auth_cookies(
        response,
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"],
    )
    
    # Remove refresh_token from response body (it's in the cookie)
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": tokens["token_type"],
        "expires_in": tokens["expires_in"],
        "user": tokens["user"],
    }


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard with platform statistics.
    
    Returns total users, active subscriptions, daily active users,
    and recent registrations.
    """
    service = AdminService(db)
    
    stats = await service.get_dashboard_stats()
    recent_registrations = await service.get_recent_registrations()
    
    return AdminDashboardResponse(
        stats=stats,
        recent_registrations=recent_registrations,
        recent_activity=[],  # Placeholder for activity feed
    )


@router.get("/me")
async def get_admin_me(
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return the currently authenticated admin user."""
    service = AdminService(db)
    return await service.get_admin_user(UUID(current_user.user_id))


@router.patch("/users/{user_id}/status", response_model=UserStatusUpdateResponse)
async def update_user_status(
    user_id: str,
    request: UserStatusUpdateRequest,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update user status (suspend/activate).
    
    Use is_active=false to suspend a user (prevents login).
    Use is_active=true to activate a suspended user.
    """
    service = AdminService(db)
    
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    # Prevent admin from suspending themselves
    if target_uuid == uuid.UUID(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own account status",
        )
    
    result = await service.update_user_status(target_uuid, request.is_active)
    return UserStatusUpdateResponse(**result)


@router.get("/users", response_model=PaginatedUsersResponse)
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by email or name"),
    role: Optional[str] = Query(None, description="Filter by role (student, instructor, admin, super_admin)"),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of users for admin.
    
    Supports searching by email or name, and filtering by role.
    Returns users with their basic information including subscription status.
    """
    service = AdminService(db)
    users, meta = await service.get_users(page, limit, search, role)
    
    return PaginatedUsersResponse(
        data=users,
        meta=meta,
    )


@router.get("/users/{user_id}", response_model=AdminUserDetail)
async def get_user_detail(
    user_id: str,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed user information for admin.
    
    Returns complete user profile including personal information,
    onboarding status, and user statistics.
    """
    service = AdminService(db)
    
    try:
        target_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )
    
    return await service.get_user_detail(target_uuid)


# Re-export require_admin for convenience
admin_router = router
