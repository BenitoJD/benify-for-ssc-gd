"""
Referral system repository for database operations.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from .models import Referral, ReferralCode, ReferralReward, ReferralStatus, RewardType


class ReferralRepository:
    """Repository for referral operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # Referral Code operations
    
    async def get_referral_code_by_user(self, user_id: UUID) -> Optional[ReferralCode]:
        """Get referral code for a user."""
        result = await self.db.execute(
            select(ReferralCode).where(ReferralCode.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_referral_code_by_code(self, code: str) -> Optional[ReferralCode]:
        """Get referral code by its value."""
        result = await self.db.execute(
            select(ReferralCode).where(ReferralCode.code == code)
        )
        return result.scalar_one_or_none()
    
    async def create_referral_code(self, user_id: UUID, code: str) -> ReferralCode:
        """Create a new referral code for a user."""
        referral_code = ReferralCode(
            user_id=user_id,
            code=code,
            is_active=True
        )
        self.db.add(referral_code)
        await self.db.flush()
        await self.db.refresh(referral_code)
        return referral_code
    
    async def increment_code_usage(self, code_id: UUID) -> None:
        """Increment the usage count of a referral code."""
        result = await self.db.execute(
            select(ReferralCode).where(ReferralCode.id == code_id)
        )
        code = result.scalar_one_or_none()
        if code:
            code.use_count += 1
            code.is_used = True
            await self.db.flush()
    
    # Referral operations
    
    async def create_referral(
        self,
        referrer_id: UUID,
        referred_id: UUID,
        referral_code_id: Optional[UUID] = None,
        utm_source: Optional[str] = None,
        utm_medium: Optional[str] = None,
        utm_campaign: Optional[str] = None
    ) -> Referral:
        """Create a new referral record."""
        referral = Referral(
            referrer_id=referrer_id,
            referred_id=referred_id,
            referral_code_id=referral_code_id,
            status=ReferralStatus.PENDING,
            utm_source=utm_source,
            utm_medium=utm_medium,
            utm_campaign=utm_campaign
        )
        self.db.add(referral)
        await self.db.flush()
        await self.db.refresh(referral)
        return referral
    
    async def get_referral_by_id(self, referral_id: UUID) -> Optional[Referral]:
        """Get referral by ID."""
        result = await self.db.execute(
            select(Referral).where(Referral.id == referral_id)
        )
        return result.scalar_one_or_none()
    
    async def get_referral_by_users(self, referrer_id: UUID, referred_id: UUID) -> Optional[Referral]:
        """Get referral between two users."""
        result = await self.db.execute(
            select(Referral).where(
                and_(
                    Referral.referrer_id == referrer_id,
                    Referral.referred_id == referred_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_referrals_for_user(self, user_id: UUID) -> List[Referral]:
        """Get all referrals made by a user with relationships loaded."""
        result = await self.db.execute(
            select(Referral)
            .options(selectinload(Referral.referred))
            .where(Referral.referrer_id == user_id)
            .order_by(Referral.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_pending_referrals_for_user(self, user_id: UUID) -> List[Referral]:
        """Get pending referrals made by a user."""
        result = await self.db.execute(
            select(Referral)
            .where(
                and_(
                    Referral.referrer_id == user_id,
                    Referral.status == ReferralStatus.PENDING
                )
            )
        )
        return list(result.scalars().all())
    
    async def get_completed_referrals_for_user(self, user_id: UUID) -> List[Referral]:
        """Get completed referrals made by a user."""
        result = await self.db.execute(
            select(Referral)
            .where(
                and_(
                    Referral.referrer_id == user_id,
                    Referral.status == ReferralStatus.COMPLETED
                )
            )
        )
        return list(result.scalars().all())
    
    async def count_referrals_by_status(self, user_id: UUID) -> dict:
        """Count referrals by status for a user."""
        result = await self.db.execute(
            select(Referral.status, func.count(Referral.id))
            .where(Referral.referrer_id == user_id)
            .group_by(Referral.status)
        )
        counts = {status: 0 for status in ReferralStatus}
        for status, count in result.all():
            counts[status] = count
        return counts
    
    async def update_referral_status(self, referral_id: UUID, status: ReferralStatus) -> Optional[Referral]:
        """Update the status of a referral."""
        result = await self.db.execute(
            select(Referral).where(Referral.id == referral_id)
        )
        referral = result.scalar_one_or_none()
        if referral:
            referral.status = status
            if status == ReferralStatus.COMPLETED:
                referral.subscribed_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(referral)
        return referral
    
    async def mark_referral_rewarded(self, referral_id: UUID) -> Optional[Referral]:
        """Mark a referral as rewarded."""
        result = await self.db.execute(
            select(Referral).where(Referral.id == referral_id)
        )
        referral = result.scalar_one_or_none()
        if referral:
            referral.status = ReferralStatus.REWARDED
            referral.reward_given_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(referral)
        return referral
    
    async def get_referrals_received_by_user(self, user_id: UUID) -> List[Referral]:
        """Get all referrals received by a user (as the referred user)."""
        result = await self.db.execute(
            select(Referral)
            .options(selectinload(Referral.referrer))
            .where(Referral.referred_id == user_id)
            .order_by(Referral.created_at.desc())
        )
        return list(result.scalars().all())
    
    # Referral Reward operations
    
    async def create_reward(
        self,
        referral_id: UUID,
        user_id: UUID,
        reward_type: RewardType,
        reward_value: int,
        notes: Optional[str] = None
    ) -> ReferralReward:
        """Create a new referral reward record."""
        reward = ReferralReward(
            referral_id=referral_id,
            user_id=user_id,
            reward_type=reward_type,
            reward_value=reward_value,
            is_applied=False,
            notes=notes
        )
        self.db.add(reward)
        await self.db.flush()
        await self.db.refresh(reward)
        return reward
    
    async def get_rewards_for_user(self, user_id: UUID) -> List[ReferralReward]:
        """Get all rewards for a user."""
        result = await self.db.execute(
            select(ReferralReward)
            .where(ReferralReward.user_id == user_id)
            .order_by(ReferralReward.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_pending_discount_for_user(self, user_id: UUID) -> Optional[ReferralReward]:
        """Get pending discount reward for a user (from being referred)."""
        result = await self.db.execute(
            select(ReferralReward)
            .where(
                and_(
                    ReferralReward.user_id == user_id,
                    ReferralReward.reward_type == RewardType.DISCOUNT,
                    ReferralReward.is_applied == False
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def apply_reward(self, reward_id: UUID) -> Optional[ReferralReward]:
        """Mark a reward as applied."""
        result = await self.db.execute(
            select(ReferralReward).where(ReferralReward.id == reward_id)
        )
        reward = result.scalar_one_or_none()
        if reward:
            reward.is_applied = True
            reward.applied_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(reward)
        return reward
    
    async def get_total_earned_rewards(self, user_id: UUID) -> int:
        """Get total number of rewards earned by a user."""
        result = await self.db.execute(
            select(func.count(ReferralReward.id))
            .where(
                and_(
                    ReferralReward.user_id == user_id,
                    ReferralReward.is_applied == True
                )
            )
        )
        count = result.scalar_one_or_none()
        return count or 0
