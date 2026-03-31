"""
Referral system API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from .service import ReferralService
from .schemas import (
    ReferralDashboardResponse,
    ApplyReferralCodeRequest,
    ApplyReferralCodeResponse,
    ReferralCodeValidation,
    ReferralTrackingResponse,
    ReferralCodeResponse
)


router = APIRouter(prefix="/referrals", tags=["Referrals"])


def get_referral_service(db: AsyncSession = Depends(get_db)) -> ReferralService:
    """Dependency for getting referral service."""
    return ReferralService(db)


@router.get("/me", response_model=ReferralDashboardResponse)
async def get_my_referrals(
    current_user: TokenData = Depends(get_current_user),
    service: ReferralService = Depends(get_referral_service),
):
    """
    Get current user's referral dashboard.
    Shows referral code, statistics, and history.
    """
    dashboard = await service.get_referral_dashboard(
        user_id=UUID(current_user.user_id)
    )
    return dashboard


@router.get("/code", response_model=ReferralCodeResponse)
async def get_my_referral_code(
    current_user: TokenData = Depends(get_current_user),
    service: ReferralService = Depends(get_referral_service),
):
    """
    Get just the current user's referral code and basic stats.
    """
    code = await service.get_or_create_referral_code(UUID(current_user.user_id))
    dashboard = await service.get_referral_dashboard(UUID(current_user.user_id))
    
    return ReferralCodeResponse(
        code=code,
        share_url=dashboard.share_url,
        total_referrals=dashboard.total_referrals,
        completed_referrals=dashboard.completed_referrals,
        pending_referrals=dashboard.pending_referrals
    )


@router.post("/validate", response_model=ReferralCodeValidation)
async def validate_referral_code(
    code: str = Query(..., min_length=6, max_length=50),
    service: ReferralService = Depends(get_referral_service),
):
    """
    Validate a referral code without applying it.
    Returns information about the code if valid.
    """
    result = await service.validate_referral_code(code)
    if not result.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error_message
        )
    return result


@router.post("/apply", response_model=ApplyReferralCodeResponse)
async def apply_referral_code(
    request: ApplyReferralCodeRequest,
    current_user: TokenData = Depends(get_current_user),
    service: ReferralService = Depends(get_referral_service),
):
    """
    Apply a referral code for discount on first subscription.
    The discount will be applied when the user subscribes.
    """
    result = await service.apply_referral_code(
        user_id=UUID(current_user.user_id),
        code=request.code
    )
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.message
        )
    
    return result


@router.post("/track", response_model=ReferralTrackingResponse)
async def track_referral_link(
    referral_code: str = Query(..., min_length=6, max_length=50),
    utm_source: Optional[str] = Query(None, max_length=100),
    utm_medium: Optional[str] = Query(None, max_length=100),
    utm_campaign: Optional[str] = Query(None, max_length=100),
    current_user: TokenData = Depends(get_current_user),
    service: ReferralService = Depends(get_referral_service),
):
    """
    Track that a user arrived via a referral link.
    Should be called when a new user signs up with a referral parameter.
    """
    result = await service.track_referral(
        referred_user_id=UUID(current_user.user_id),
        referral_code=referral_code,
        utm_source=utm_source,
        utm_medium=utm_medium,
        utm_campaign=utm_campaign
    )
    
    return result


@router.post("/claim-free-month")
async def claim_free_month_reward(
    current_user: TokenData = Depends(get_current_user),
    service: ReferralService = Depends(get_referral_service),
):
    """
    Claim free month reward earned from successful referrals.
    This extends the user's active subscription by 30 days.
    """
    success, message = await service.apply_free_month_reward(
        user_id=UUID(current_user.user_id)
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return {"success": True, "message": message}
