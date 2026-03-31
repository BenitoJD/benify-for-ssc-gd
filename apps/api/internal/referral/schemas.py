"""
Referral system Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class ReferralStatus(str, Enum):
    """Status of a referral."""
    PENDING = "pending"
    COMPLETED = "completed"
    REWARDED = "rewarded"


class RewardType(str, Enum):
    """Type of reward."""
    FREE_MONTH = "free_month"
    DISCOUNT = "discount"


# Request schemas
class ApplyReferralCodeRequest(BaseModel):
    """Request to apply a referral code (during subscription)."""
    code: str = Field(..., min_length=6, max_length=50, description="The referral code to apply")


class TrackReferralRequest(BaseModel):
    """Request to track a referral from URL parameters."""
    referral_code: Optional[str] = Field(None, max_length=50, description="Referral code from URL")
    utm_source: Optional[str] = Field(None, max_length=100)
    utm_medium: Optional[str] = Field(None, max_length=100)
    utm_campaign: Optional[str] = Field(None, max_length=100)


# Response schemas
class ReferralCodeResponse(BaseModel):
    """Response containing user's referral code."""
    code: str
    share_url: str
    total_referrals: int
    completed_referrals: int
    pending_referrals: int
    
    model_config = {"from_attributes": True}


class ReferralInfo(BaseModel):
    """Information about a single referral."""
    id: UUID
    referred_user_id: UUID
    referred_user_email: Optional[str] = None
    referred_user_name: Optional[str] = None
    status: ReferralStatus
    subscribed_at: Optional[datetime] = None
    reward_given_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ReferralRewardInfo(BaseModel):
    """Information about a referral reward."""
    id: UUID
    reward_type: RewardType
    reward_value: int
    is_applied: bool
    applied_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ReferralDashboardResponse(BaseModel):
    """Complete referral dashboard data."""
    referral_code: str
    share_url: str
    total_referrals: int = 0
    completed_referrals: int = 0
    pending_referrals: int = 0
    total_earned_rewards: int = 0
    referrals: List[ReferralInfo] = []
    rewards: List[ReferralRewardInfo] = []
    # Rewards the user can claim (as referred user)
    pending_discount: Optional[int] = None  # Discount percentage for first subscription
    discount_available: bool = False


class ReferralCodeValidation(BaseModel):
    """Validation result for a referral code."""
    is_valid: bool
    error_message: Optional[str] = None
    referrer_name: Optional[str] = None


class ApplyReferralCodeResponse(BaseModel):
    """Response after applying a referral code."""
    success: bool
    discount_percent: Optional[int] = None
    discount_amount: Optional[int] = None  # In paise
    message: str
    referrer_reward_months: Optional[int] = None  # Months the referrer will get


class ReferralTrackingResponse(BaseModel):
    """Response after tracking a referral link."""
    tracked: bool
    referral_code: Optional[str] = None
    message: str
