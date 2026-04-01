"""
API routes for subscription endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from .schemas import (
    PlanWithSavings, SubscribeRequest, SubscribeResponse,
    SubscriptionStatusResponse, CancelSubscriptionResponse,
    CouponApplyRequest, CouponValidationResult,
    PaymentMockRequest, PaymentResponse, PaymentWithReceipt,
    FeatureGatingInfo
)
from .service import (
    PlanService, SubscriptionService, CouponService, PaymentService, UserSubscriptionService
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ============================================================================
# Plans
# ============================================================================

@router.get("/plans", response_model=List[PlanWithSavings])
async def get_plans(db: AsyncSession = Depends(get_db)):
    """Get all active subscription plans with pricing and savings."""
    service = PlanService(db)
    return await service.get_all_plans()


# ============================================================================
# Subscribe
# ============================================================================

@router.post("/subscribe", response_model=SubscribeResponse, status_code=status.HTTP_201_CREATED)
async def subscribe(
    request: SubscribeRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Subscribe to a plan.
    
    Creates a subscription and payment record.
    For free plans, activates immediately.
    For paid plans, creates a pending payment that must be completed via /payments/mock.
    """
    service = SubscriptionService(db)
    
    try:
        result = await service.subscribe(current_user.user_id, request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ============================================================================
# Subscription Status
# ============================================================================

@router.get("/me", response_model=SubscriptionStatusResponse)
async def get_my_subscription(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's subscription status."""
    service = SubscriptionService(db)
    return await service.get_user_status(UUID(current_user.user_id))


@router.delete("/cancel", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    subscription_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel a subscription.
    
    Access continues until the end of the current billing period.
    """
    service = SubscriptionService(db)
    
    try:
        return await service.cancel(UUID(current_user.user_id), subscription_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ============================================================================
# Coupons
# ============================================================================

@router.post("/apply-coupon", response_model=CouponValidationResult)
async def apply_coupon(
    request: CouponApplyRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Validate and apply a coupon code to a plan."""
    service = CouponService(db)
    
    # Get plan to calculate final price
    plan_service = PlanService(db)
    plan = await plan_service.get_plan(request.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    return await service.apply_coupon(request.coupon_code, request.plan_id, plan.price)


# ============================================================================
# Feature Gating
# ============================================================================

@router.get("/features", response_model=FeatureGatingInfo)
async def get_feature_gating(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get feature gating information for the current user."""
    service = SubscriptionService(db)
    return await service.get_feature_gating(UUID(current_user.user_id))


# ============================================================================
# Payments
# ============================================================================

payments_router = APIRouter(prefix="/payments", tags=["Payments"])


@payments_router.post("/mock", response_model=PaymentWithReceipt)
async def mock_payment(
    request: PaymentMockRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Process a mock payment for testing.
    
    Set success=true for a successful payment, false for a declined payment.
    """
    service = PaymentService(db)
    
    # Get the payment record by subscription_id
    payment = await service.repo.get_by_subscription_id(request.subscription_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if str(payment.user_id) != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Payment does not belong to user"
        )
    
    # Process the mock payment
    try:
        result = await service.process_mock_payment(request.subscription_id, request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@payments_router.get("/history", response_model=List[PaymentWithReceipt])
async def get_payment_history(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's payment history."""
    service = PaymentService(db)
    return await service.get_payment_history(UUID(current_user.user_id))
