"""
Repository layer for subscription database operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from .models import Plan, Subscription, Coupon, Payment, SubscriptionStatus, PaymentStatus
from ..auth.models import User
from ..users.models import Profile


class PlanRepository:
    """Repository for Plan operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_active(self) -> List[Plan]:
        """Get all active plans ordered by display_order."""
        result = await self.db.execute(
            select(Plan)
            .where(Plan.is_active == True)
            .order_by(Plan.display_order)
        )
        return list(result.scalars().all())
    
    async def get_by_id(self, plan_id: UUID) -> Optional[Plan]:
        """Get plan by ID."""
        result = await self.db.execute(
            select(Plan).where(Plan.id == plan_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_type(self, plan_type: str) -> Optional[Plan]:
        """Get plan by type (free, monthly, quarterly, yearly)."""
        result = await self.db.execute(
            select(Plan).where(Plan.plan_type == plan_type)
        )
        return result.scalar_one_or_none()
    
    async def create(self, plan_data: dict) -> Plan:
        """Create a new plan."""
        plan = Plan(**plan_data)
        self.db.add(plan)
        await self.db.flush()
        await self.db.refresh(plan)
        return plan


class SubscriptionRepository:
    """Repository for Subscription operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_active(self, user_id: UUID) -> Optional[Subscription]:
        """Get user's active subscription with plan."""
        result = await self.db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan))
            .where(
                and_(
                    Subscription.user_id == user_id,
                    Subscription.status == SubscriptionStatus.ACTIVE
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_subscription(self, user_id: UUID) -> Optional[Subscription]:
        """Get user's current/most recent subscription with plan."""
        result = await self.db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan))
            .where(Subscription.user_id == user_id)
            .order_by(Subscription.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, subscription_id: UUID) -> Optional[Subscription]:
        """Get subscription by ID."""
        result = await self.db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan))
            .where(Subscription.id == subscription_id)
        )
        return result.scalar_one_or_none()
    
    async def create(self, subscription_data: dict) -> Subscription:
        """Create a new subscription."""
        subscription = Subscription(**subscription_data)
        self.db.add(subscription)
        await self.db.flush()
        await self.db.refresh(subscription)
        return subscription
    
    async def update(self, subscription_id: UUID, update_data: dict) -> Optional[Subscription]:
        """Update a subscription."""
        await self.db.execute(
            update(Subscription)
            .where(Subscription.id == subscription_id)
            .values(**update_data)
        )
        await self.db.flush()
        return await self.get_by_id(subscription_id)
    
    async def cancel(self, subscription_id: UUID) -> Optional[Subscription]:
        """Cancel a subscription (keeps access until expiry)."""
        return await self.update(subscription_id, {
            "status": SubscriptionStatus.CANCELLED,
            "cancelled_at": datetime.utcnow(),
            "auto_renew": False
        })
    
    async def activate(self, subscription_id: UUID, started_at: datetime, expires_at: datetime) -> Optional[Subscription]:
        """Activate a subscription with dates."""
        return await self.update(subscription_id, {
            "status": SubscriptionStatus.ACTIVE,
            "started_at": started_at,
            "expires_at": expires_at
        })


class CouponRepository:
    """Repository for Coupon operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_code(self, code: str) -> Optional[Coupon]:
        """Get coupon by code."""
        result = await self.db.execute(
            select(Coupon).where(Coupon.code == code.upper())
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, coupon_id: UUID) -> Optional[Coupon]:
        """Get coupon by ID."""
        result = await self.db.execute(
            select(Coupon).where(Coupon.id == coupon_id)
        )
        return result.scalar_one_or_none()
    
    async def validate(self, code: str, plan_id: Optional[UUID] = None) -> tuple[Optional[Coupon], str]:
        """
        Validate a coupon code.
        Returns (coupon, error_message).
        """
        coupon = await self.get_by_code(code)
        
        if not coupon:
            return None, "Invalid coupon code"
        
        if not coupon.is_active:
            return None, "Coupon is no longer active"
        
        now = datetime.utcnow()
        if now < coupon.valid_from:
            return None, "Coupon is not yet valid"
        
        if now > coupon.valid_until:
            return None, "Coupon has expired"
        
        if coupon.max_uses is not None and coupon.current_uses >= coupon.max_uses:
            return None, "Coupon usage limit reached"
        
        # Check plan restriction
        if coupon.applicable_plan_id and plan_id:
            if coupon.applicable_plan_id != plan_id:
                return None, "Coupon not applicable for this plan"
        
        return coupon, ""
    
    async def increment_usage(self, coupon_id: UUID) -> None:
        """Increment coupon usage count."""
        await self.db.execute(
            update(Coupon)
            .where(Coupon.id == coupon_id)
            .values(current_uses=Coupon.current_uses + 1)
        )
        await self.db.flush()
    
    async def create(self, coupon_data: dict) -> Coupon:
        """Create a new coupon."""
        coupon = Coupon(**coupon_data)
        self.db.add(coupon)
        await self.db.flush()
        await self.db.refresh(coupon)
        return coupon


class PaymentRepository:
    """Repository for Payment operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, payment_data: dict) -> Payment:
        """Create a new payment record."""
        payment = Payment(**payment_data)
        self.db.add(payment)
        await self.db.flush()
        await self.db.refresh(payment)
        return payment
    
    async def get_by_id(self, payment_id: UUID) -> Optional[Payment]:
        """Get payment by ID."""
        result = await self.db.execute(
            select(Payment).where(Payment.id == payment_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_subscription_id(self, subscription_id: UUID) -> Optional[Payment]:
        """Get payment by subscription ID (most recent pending)."""
        result = await self.db.execute(
            select(Payment)
            .where(Payment.subscription_id == subscription_id)
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_user_payments(self, user_id: UUID, limit: int = 20) -> List[Payment]:
        """Get user's payment history."""
        result = await self.db.execute(
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def update_status(self, payment_id: UUID, status: str, **kwargs) -> Optional[Payment]:
        """Update payment status and additional fields."""
        update_data = {"status": status, **kwargs}
        await self.db.execute(
            update(Payment)
            .where(Payment.id == payment_id)
            .values(**update_data)
        )
        await self.db.flush()
        return await self.get_by_id(payment_id)
    
    async def mark_success(self, payment_id: UUID, transaction_id: str) -> Optional[Payment]:
        """Mark payment as successful."""
        return await self.update_status(
            payment_id,
            PaymentStatus.SUCCESS,
            transaction_id=transaction_id
        )
    
    async def mark_failed(self, payment_id: UUID, error_code: str, error_message: str) -> Optional[Payment]:
        """Mark payment as failed."""
        return await self.update_status(
            payment_id,
            PaymentStatus.FAILED,
            error_code=error_code,
            error_message=error_message
        )
