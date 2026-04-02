"""
Pydantic schemas for subscription API.
"""
from pydantic import ConfigDict, BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class PlanBase(BaseModel):
    name: str
    plan_type: str
    price: int
    duration_days: int
    features: Optional[List[str]] = []
    is_premium: bool = False
    trial_days: int = 0


class PlanResponse(PlanBase):
    id: UUID
    currency: str = "INR"
    is_active: bool
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlanWithSavings(PlanResponse):
    """Plan with calculated savings compared to monthly."""
    monthly_equivalent: Optional[int] = None
    savings_percent: Optional[int] = None
    savings_label: Optional[str] = None


class SubscriptionBase(BaseModel):
    plan_id: UUID


class SubscriptionCreate(SubscriptionBase):
    coupon_code: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: UUID
    user_id: UUID
    plan_id: UUID
    plan: Optional[PlanResponse] = None
    status: str
    price_paid: Optional[int] = None
    discount_applied: int = 0
    coupon_id: Optional[UUID] = None
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    auto_renew: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionStatusResponse(BaseModel):
    """Current subscription status for a user."""
    is_active: bool
    is_premium: bool
    plan: Optional[PlanResponse] = None
    subscription: Optional[SubscriptionResponse] = None
    access_expires_at: Optional[datetime] = None
    days_remaining: Optional[int] = None


class CouponApplyRequest(BaseModel):
    coupon_code: str
    plan_id: UUID


class CouponResponse(BaseModel):
    id: UUID
    code: str
    discount_type: str
    discount_value: int
    discount_display: str  # e.g., "20% off" or "₹200 off"
    min_order_amount: Optional[int] = None
    valid_until: datetime
    is_valid: bool
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CouponValidationResult(BaseModel):
    """Result of coupon validation."""
    is_valid: bool
    coupon: Optional[CouponResponse] = None
    error_message: Optional[str] = None
    final_price: Optional[int] = None


class PaymentMockRequest(BaseModel):
    subscription_id: UUID
    payment_method: str = "mock_card"
    card_number: Optional[str] = "4111111111111111"
    card_expiry: Optional[str] = "12/28"
    card_cvv: Optional[str] = "123"
    success: bool = True


class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    subscription_id: Optional[UUID] = None
    amount: int
    currency: str
    payment_method: Optional[str] = None
    status: str
    transaction_id: Optional[str] = None
    is_mock: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentWithReceipt(PaymentResponse):
    """Payment with receipt details."""
    plan_name: Optional[str] = None
    coupon_code: Optional[str] = None
    discount_amount: int = 0


class SubscribeRequest(BaseModel):
    """Request to subscribe to a plan."""
    plan_id: UUID
    coupon_code: Optional[str] = None
    payment_method: str = "mock"
    referral_code: Optional[str] = Field(None, max_length=50, description="Referral code to apply discount")


class SubscribeResponse(BaseModel):
    """Response after initiating subscription."""
    subscription_id: UUID
    plan_id: UUID
    plan_name: str
    original_price: int
    final_price: int
    discount_amount: int
    coupon_applied: Optional[str] = None
    payment: Optional[PaymentResponse] = None
    requires_payment: bool = True
    client_secret: Optional[str] = None  # For Razorpay integration


class CancelSubscriptionResponse(BaseModel):
    """Response after cancelling subscription."""
    success: bool
    subscription_id: UUID
    status: str
    access_expires_at: datetime
    message: str


class FeatureGatingInfo(BaseModel):
    """Information about feature access for a user."""
    is_premium: bool
    locked_features: List[str] = []
    upgrade_plan: Optional[str] = None
    upgrade_url: Optional[str] = "/pricing"
