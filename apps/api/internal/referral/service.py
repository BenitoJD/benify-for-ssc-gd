"""
Referral system service for business logic.
"""
import uuid
import random
import string
import logging
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from .models import Referral, ReferralCode, ReferralReward, ReferralStatus, RewardType
from .repository import ReferralRepository
from .schemas import (
    ReferralDashboardResponse, ReferralInfo, ReferralRewardInfo,
    ReferralCodeValidation, ApplyReferralCodeResponse,
    ReferralTrackingResponse, ReferralCodeResponse, ReferralStatus as ReferralStatusEnum
)
from ..subscriptions.service import SubscriptionService
from ..subscriptions.repository import SubscriptionRepository
from ..auth.models import User
from ..config import settings

logger = logging.getLogger(__name__)

# Referral configuration
REFERRAL_DISCOUNT_PERCENT = 10  # 10% discount for referred user
REFERRER_FREE_MONTHS = 1  # 1 free month for referrer when referred user subscribes
MAX_REFERRAL_CODE_LENGTH = 12


def generate_referral_code(user_id: UUID) -> str:
    """Generate a unique referral code for a user."""
    # Format: OLLI + random alphanumeric
    prefix = "OLLI"
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}{random_part}"


class ReferralService:
    """Service for referral operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReferralRepository(db)
    
    async def get_or_create_referral_code(self, user_id: UUID) -> str:
        """Get existing referral code or create a new one for a user."""
        existing = await self.repo.get_referral_code_by_user(user_id)
        if existing:
            return existing.code
        
        # Generate unique code
        code = generate_referral_code(user_id)
        
        # Ensure uniqueness (regenerate if collision)
        max_attempts = 10
        for _ in range(max_attempts):
            existing = await self.repo.get_referral_code_by_code(code)
            if not existing:
                break
            code = generate_referral_code(user_id)
        
        # Create the code
        referral_code = await self.repo.create_referral_code(user_id, code)
        logger.info(f"Created referral code {code} for user {user_id}")
        return referral_code.code
    
    async def validate_referral_code(self, code: str) -> ReferralCodeValidation:
        """Validate a referral code and return information."""
        if not code:
            return ReferralCodeValidation(
                is_valid=False,
                error_message="Referral code is required"
            )
        
        referral_code = await self.repo.get_referral_code_by_code(code.upper())
        
        if not referral_code:
            return ReferralCodeValidation(
                is_valid=False,
                error_message="Invalid referral code"
            )
        
        if not referral_code.is_active:
            return ReferralCodeValidation(
                is_valid=False,
                error_message="This referral code is no longer active"
            )
        
        # Get referrer name
        from sqlalchemy import select
        from ..auth.models import User
        result = await self.db.execute(select(User.name).where(User.id == referral_code.user_id))
        referrer_name = result.scalar_one_or_none()
        
        return ReferralCodeValidation(
            is_valid=True,
            referrer_name=referrer_name
        )
    
    async def track_referral(
        self,
        referred_user_id: UUID,
        referral_code: Optional[str] = None,
        utm_source: Optional[str] = None,
        utm_medium: Optional[str] = None,
        utm_campaign: Optional[str] = None
    ) -> ReferralTrackingResponse:
        """
        Track a referral when a new user signs up via a referral link.
        Creates a referral record linking the referrer to the new user.
        """
        if not referral_code:
            return ReferralTrackingResponse(
                tracked=False,
                message="No referral code provided"
            )
        
        # Validate the code
        code_obj = await self.repo.get_referral_code_by_code(referral_code.upper())
        if not code_obj:
            return ReferralTrackingResponse(
                tracked=False,
                message="Invalid referral code"
            )
        
        # Don't allow self-referral
        if code_obj.user_id == referred_user_id:
            return ReferralTrackingResponse(
                tracked=False,
                message="Cannot refer yourself"
            )
        
        # Check if referral already exists
        existing = await self.repo.get_referral_by_users(code_obj.user_id, referred_user_id)
        if existing:
            return ReferralTrackingResponse(
                tracked=True,
                referral_code=code_obj.code,
                message="Referral already tracked"
            )
        
        # Create referral record
        referral = await self.repo.create_referral(
            referrer_id=code_obj.user_id,
            referred_id=referred_user_id,
            referral_code_id=code_obj.id,
            utm_source=utm_source,
            utm_medium=utm_medium,
            utm_campaign=utm_campaign
        )
        
        logger.info(f"Tracked referral: user {code_obj.user_id} referred user {referred_user_id}")
        
        return ReferralTrackingResponse(
            tracked=True,
            referral_code=code_obj.code,
            message="Referral tracked successfully"
        )
    
    async def apply_referral_code(
        self,
        user_id: UUID,
        code: str
    ) -> ApplyReferralCodeResponse:
        """
        Apply a referral code when the referred user subscribes.
        Creates discount reward for the referred user.
        """
        # Validate code
        code_obj = await self.repo.get_referral_code_by_code(code.upper())
        if not code_obj:
            return ApplyReferralCodeResponse(
                success=False,
                message="Invalid referral code"
            )
        
        if not code_obj.is_active:
            return ApplyReferralCodeResponse(
                success=False,
                message="This referral code is no longer active"
            )
        
        # Don't allow self-referral
        if code_obj.user_id == user_id:
            return ApplyReferralCodeResponse(
                success=False,
                message="Cannot use your own referral code"
            )
        
        # Check if there's a pending referral for this user
        referral = await self.repo.get_referral_by_users(code_obj.user_id, user_id)
        if not referral:
            return ApplyReferralCodeResponse(
                success=False,
                message="No referral found for this code. Please ensure you signed up using the referral link."
            )
        
        # Calculate discount amount (we'll calculate actual amount at subscription time)
        # For now, just return the percentage
        discount_percent = REFERRAL_DISCOUNT_PERCENT
        
        # Create discount reward for referred user (to be applied at subscription)
        reward = await self.repo.create_reward(
            referral_id=referral.id,
            user_id=user_id,
            reward_type=RewardType.DISCOUNT,
            reward_value=discount_percent,
            notes=f"Welcome discount: {discount_percent}% off first subscription"
        )
        
        logger.info(f"Created discount reward of {discount_percent}% for user {user_id} (referred by {code_obj.user_id})")
        
        return ApplyReferralCodeResponse(
            success=True,
            discount_percent=discount_percent,
            message=f"Referral code applied! You get {discount_percent}% discount on your first subscription."
        )
    
    async def on_referred_user_subscribed(
        self,
        referred_user_id: UUID,
        subscription_id: UUID
    ) -> Tuple[bool, str]:
        """
        Called when a referred user subscribes to premium.
        - Updates referral status to COMPLETED
        - Gives referrer a free month reward
        """
        # Find the referral where this user was referred
        from sqlalchemy import select
        result = await self.db.execute(
            select(Referral).where(Referral.referred_id == referred_user_id)
        )
        referral = result.scalar_one_or_none()
        
        if not referral:
            logger.warning(f"No referral found for user {referred_user_id}")
            return False, "No referral found"
        
        if referral.status != ReferralStatus.PENDING:
            logger.info(f"Referral {referral.id} already {referral.status}")
            return False, f"Referral already {referral.status}"
        
        # Update referral status
        referral = await self.repo.update_referral_status(referral.id, ReferralStatus.COMPLETED)
        
        # Create reward for referrer (free month extension)
        reward = await self.repo.create_reward(
            referral_id=referral.id,
            user_id=referral.referrer_id,
            reward_type=RewardType.FREE_MONTH,
            reward_value=REFERRER_FREE_MONTHS * 30,  # Value in days
            notes=f"Free month for referring {referred_user_id}"
        )
        
        # Increment the referral code usage
        if referral.referral_code_id:
            await self.repo.increment_code_usage(referral.referral_code_id)
        
        logger.info(f"Referral {referral.id} completed. Referrer {referral.referrer_id} earned {REFERRER_FREE_MONTHS} free month(s)")
        
        return True, f"Referral completed. Referrer earned {REFERRER_FREE_MONTHS} free month(s)"
    
    async def apply_free_month_reward(self, user_id: UUID) -> Tuple[bool, str]:
        """
        Apply free month reward to a user's active subscription.
        Extends their subscription by 30 days.
        """
        # Check if user has an active subscription
        from ..subscriptions.service import SubscriptionService
        from ..subscriptions.repository import SubscriptionRepository
        
        sub_repo = SubscriptionRepository(self.db)
        sub_service = SubscriptionService(self.db)
        
        subscription = await sub_repo.get_user_active(user_id)
        if not subscription:
            return False, "No active subscription to extend"
        
        # Extend the subscription
        from datetime import timedelta
        new_expires_at = subscription.expires_at + timedelta(days=30) if subscription.expires_at else None
        
        subscription.expires_at = new_expires_at
        await self.db.flush()
        
        # Mark reward as applied
        # Find the pending free month reward for this user
        rewards = await self.repo.get_rewards_for_user(user_id)
        for reward in rewards:
            if reward.reward_type == RewardType.FREE_MONTH and not reward.is_applied:
                await self.repo.apply_reward(reward.id)
                break
        
        logger.info(f"Extended subscription for user {user_id} by 30 days")
        return True, "Subscription extended by 30 days"
    
    async def get_referral_dashboard(self, user_id: UUID, base_url: Optional[str] = None) -> ReferralDashboardResponse:
        """Get complete referral dashboard data for a user."""
        resolved_base_url = base_url or settings.APP_URL
        # Get or create referral code
        code = await self.get_or_create_referral_code(user_id)
        
        # Get referrals
        referrals = await self.repo.get_referrals_for_user(user_id)
        referral_infos = []
        
        for ref in referrals:
            referred_email = None
            referred_name = None
            if ref.referred:
                referred_email = ref.referred.email
                referred_name = ref.referred.name
            
            referral_infos.append(ReferralInfo(
                id=ref.id,
                referred_user_id=ref.referred_id,
                referred_user_email=referred_email,
                referred_user_name=referred_name,
                status=ReferralStatusEnum(ref.status.value if hasattr(ref.status, 'value') else ref.status),
                subscribed_at=ref.subscribed_at,
                reward_given_at=ref.reward_given_at,
                created_at=ref.created_at
            ))
        
        # Get rewards
        rewards = await self.repo.get_rewards_for_user(user_id)
        reward_infos = []
        for reward in rewards:
            reward_infos.append(ReferralRewardInfo(
                id=reward.id,
                reward_type=RewardType(reward.reward_type.value if hasattr(reward.reward_type, 'value') else reward.reward_type),
                reward_value=reward.reward_value,
                is_applied=reward.is_applied,
                applied_at=reward.applied_at,
                notes=reward.notes,
                created_at=reward.created_at
            ))
        
        # Get counts
        counts = await self.repo.count_referrals_by_status(user_id)
        total_referrals = sum(counts.values())
        completed = counts.get(ReferralStatus.COMPLETED, 0) + counts.get(ReferralStatus.REWARDED, 0)
        pending = counts.get(ReferralStatus.PENDING, 0)
        
        # Get total earned rewards (applied)
        total_earned = await self.repo.get_total_earned_rewards(user_id)
        
        # Check for pending discount for this user (if they were referred)
        pending_discount = None
        discount_available = False
        pending_reward = await self.repo.get_pending_discount_for_user(user_id)
        if pending_reward:
            pending_discount = pending_reward.reward_value
            discount_available = True
        
        # Generate share URL
        share_url = f"{resolved_base_url}/signup?ref={code}"
        
        return ReferralDashboardResponse(
            referral_code=code,
            share_url=share_url,
            total_referrals=total_referrals,
            completed_referrals=completed,
            pending_referrals=pending,
            total_earned_rewards=total_earned,
            referrals=referral_infos,
            rewards=reward_infos,
            pending_discount=pending_discount,
            discount_available=discount_available
        )
    
    async def get_pending_discount(self, user_id: UUID) -> Tuple[Optional[int], bool]:
        """
        Get pending discount for a user if they were referred.
        Returns (discount_percent, has_discount).
        """
        pending_reward = await self.repo.get_pending_discount_for_user(user_id)
        if pending_reward:
            return pending_reward.reward_value, True
        return None, False
