"""
Service layer for subscription business logic.
"""
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
import logging

from .models import Plan, Subscription, Coupon, Payment, SubscriptionStatus, PaymentStatus, PlanType
from .repository import PlanRepository, SubscriptionRepository, CouponRepository, PaymentRepository
from .schemas import (
    PlanResponse, PlanWithSavings, SubscriptionCreate, SubscriptionResponse, SubscriptionStatusResponse,
    CouponApplyRequest, CouponValidationResult, CouponResponse,
    PaymentMockRequest, PaymentResponse, PaymentWithReceipt,
    SubscribeRequest, SubscribeResponse, CancelSubscriptionResponse,
    FeatureGatingInfo
)
from ..auth.models import User
from ..auth.service import TokenData

logger = logging.getLogger(__name__)

# Default plan features
FREE_FEATURES = [
    "4 SSC GD Subjects",
    "100+ Lessons",
    "Basic Study Notes",
    "Limited Mock Tests (2/month)",
    "Community Access",
    "Email Support"
]

PREMIUM_FEATURES = [
    "All SSC GD Subjects",
    "500+ Premium Lessons",
    "Complete Study Materials",
    "Unlimited Mock Tests",
    "Previous Year Questions",
    "Physical Training Plans",
    "Document Checklist",
    "Priority Support",
    "AI Study Recommendations",
    "Progress Analytics"
]

LOCKED_FEATURES = [
    "Premium Lessons",
    "Unlimited Mock Tests",
    "Previous Year Questions",
    "Physical Training Plans",
    "Document Checklist",
    "AI Recommendations",
    "Priority Support"
]


class PlanService:
    """Service for plan operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PlanRepository(db)
    
    async def get_all_plans(self) -> List[PlanWithSavings]:
        """Get all active plans with savings calculations."""
        plans = await self.repo.get_all_active()
        
        # Get monthly plan for savings calculation
        monthly_plan = await self.repo.get_by_type(PlanType.MONTHLY)
        monthly_price = monthly_plan.price if monthly_plan else 49900  # Default ₹499
        
        result = []
        for plan in plans:
            plan_dict = {
                "id": plan.id,
                "name": plan.name,
                "plan_type": plan.plan_type,
                "price": plan.price,
                "currency": plan.currency,
                "duration_days": plan.duration_days,
                "features": json.loads(plan.features) if plan.features else [],
                "is_active": plan.is_active,
                "is_premium": plan.is_premium,
                "trial_days": plan.trial_days,
                "display_order": plan.display_order,
                "created_at": plan.created_at,
                "monthly_equivalent": None,
                "savings_percent": None,
                "savings_label": None
            }
            
            # Calculate savings vs monthly
            if plan.plan_type == PlanType.MONTHLY:
                plan_dict["monthly_equivalent"] = plan.price
            elif plan.plan_type == PlanType.QUARTERLY:
                monthly_equivalent = (plan.price // 3) if plan.duration_days >= 90 else plan.price
                plan_dict["monthly_equivalent"] = monthly_equivalent
                if monthly_price > 0:
                    savings = ((monthly_price - monthly_equivalent) / monthly_price) * 100
                    plan_dict["savings_percent"] = round(savings)
                    plan_dict["savings_label"] = f"Save {round(savings)}%"
            elif plan.plan_type == PlanType.YEARLY:
                monthly_equivalent = plan.price // 12 if plan.duration_days >= 365 else plan.price
                plan_dict["monthly_equivalent"] = monthly_equivalent
                if monthly_price > 0:
                    savings = ((monthly_price - monthly_equivalent) / monthly_price) * 100
                    plan_dict["savings_percent"] = round(savings)
                    plan_dict["savings_label"] = f"Save {round(savings)}%"
            
            result.append(PlanWithSavings(**plan_dict))
        
        return result
    
    async def get_plan(self, plan_id: UUID) -> Optional[Plan]:
        """Get plan by ID."""
        return await self.repo.get_by_id(plan_id)
    
    async def seed_default_plans(self) -> List[Plan]:
        """Seed default subscription plans if not exist."""
        default_plans = [
            {
                "name": "Free",
                "plan_type": PlanType.FREE,
                "price": 0,
                "duration_days": 0,
                "features": json.dumps(FREE_FEATURES),
                "is_active": True,
                "is_premium": False,
                "trial_days": 0,
                "display_order": 0
            },
            {
                "name": "Monthly",
                "plan_type": PlanType.MONTHLY,
                "price": 49900,  # ₹499 in paise
                "duration_days": 30,
                "features": json.dumps(PREMIUM_FEATURES),
                "is_active": True,
                "is_premium": True,
                "trial_days": 0,
                "display_order": 1
            },
            {
                "name": "Quarterly",
                "plan_type": PlanType.QUARTERLY,
                "price": 119900,  # ₹1199 in paise
                "duration_days": 90,
                "features": json.dumps(PREMIUM_FEATURES),
                "is_active": True,
                "is_premium": True,
                "trial_days": 0,
                "display_order": 2
            },
            {
                "name": "Yearly",
                "plan_type": PlanType.YEARLY,
                "price": 399900,  # ₹3999 in paise
                "duration_days": 365,
                "features": json.dumps(PREMIUM_FEATURES),
                "is_active": True,
                "is_premium": True,
                "trial_days": 0,
                "display_order": 3
            }
        ]
        
        created = []
        for plan_data in default_plans:
            existing = await self.repo.get_by_type(plan_data["plan_type"])
            if not existing:
                plan = await self.repo.create(plan_data)
                created.append(plan)
                logger.info(f"Created default plan: {plan.name}")
        
        return created


class SubscriptionService:
    """Service for subscription operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SubscriptionRepository(db)
        self.plan_service = PlanService(db)
        self.coupon_service = CouponService(db)
    
    async def get_user_status(self, user_id: UUID) -> SubscriptionStatusResponse:
        """Get current subscription status for a user."""
        subscription = await self.repo.get_user_active(user_id)
        
        if subscription:
            plan = await self.plan_service.get_plan(subscription.plan_id)
            days_remaining = 0
            if subscription.expires_at:
                delta = subscription.expires_at - datetime.utcnow()
                days_remaining = max(0, delta.days)
            
            # Create subscription response with properly converted plan
            subscription_resp = self._subscription_to_response(subscription, plan)
            
            return SubscriptionStatusResponse(
                is_active=subscription.status == SubscriptionStatus.ACTIVE,
                is_premium=plan.is_premium if plan else False,
                plan=self._plan_to_response(plan) if plan else None,
                subscription=subscription_resp,
                access_expires_at=subscription.expires_at,
                days_remaining=days_remaining
            )
        
        # Check for cancelled subscription with remaining access
        latest = await self.repo.get_user_subscription(user_id)
        if latest and latest.status == SubscriptionStatus.CANCELLED and latest.expires_at:
            if latest.expires_at > datetime.utcnow():
                plan = await self.plan_service.get_plan(latest.plan_id)
                delta = latest.expires_at - datetime.utcnow()
                subscription_resp = self._subscription_to_response(latest, plan)
                return SubscriptionStatusResponse(
                    is_active=True,  # Still has access until expiry
                    is_premium=plan.is_premium if plan else False,
                    plan=self._plan_to_response(plan) if plan else None,
                    subscription=subscription_resp,
                    access_expires_at=latest.expires_at,
                    days_remaining=delta.days
                )
        
        # No subscription or expired - return free
        free_plan = await self.plan_service.repo.get_by_type(PlanType.FREE)
        return SubscriptionStatusResponse(
            is_active=True,
            is_premium=False,
            plan=self._plan_to_response(free_plan) if free_plan else None,
            subscription=None,
            access_expires_at=None,
            days_remaining=None
        )
    
    def _subscription_to_response(self, subscription: Subscription, plan: Optional[Plan]) -> SubscriptionResponse:
        """Convert Subscription model to SubscriptionResponse with properly parsed plan."""
        return SubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            plan_id=subscription.plan_id,
            plan=self._plan_to_response(plan) if plan else None,
            status=subscription.status,
            price_paid=subscription.price_paid,
            discount_applied=subscription.discount_applied,
            coupon_id=subscription.coupon_id,
            started_at=subscription.started_at,
            expires_at=subscription.expires_at,
            cancelled_at=subscription.cancelled_at,
            auto_renew=subscription.auto_renew,
            created_at=subscription.created_at
        )
    
    def _plan_to_response(self, plan: Plan) -> PlanResponse:
        """Convert Plan model to PlanResponse with parsed features."""
        return PlanResponse(
            id=plan.id,
            name=plan.name,
            plan_type=plan.plan_type,
            price=plan.price,
            currency=plan.currency,
            duration_days=plan.duration_days,
            features=json.loads(plan.features) if plan.features else [],
            is_active=plan.is_active,
            is_premium=plan.is_premium,
            trial_days=plan.trial_days,
            display_order=plan.display_order,
            created_at=plan.created_at
        )
    
    async def subscribe(self, user_id: UUID, request: SubscribeRequest) -> SubscribeResponse:
        """Create a new subscription with payment."""
        plan = await self.plan_service.get_plan(request.plan_id)
        if not plan or not plan.is_active:
            raise ValueError("Invalid or inactive plan")
        
        original_price = plan.price
        final_price = plan.price
        discount_amount = 0
        coupon_applied = None
        referral_discount_percent = 0
        
        # Check for referral discount (applied first)
        try:
            from ..referral.service import ReferralService
            referral_service = ReferralService(self.db)
            pending_discount, has_discount = await referral_service.get_pending_discount(user_id)
            if has_discount and pending_discount:
                referral_discount_percent = pending_discount
                # Calculate referral discount
                referral_discount = (original_price * referral_discount_percent) // 100
                final_price = original_price - referral_discount
                discount_amount = referral_discount
                logger.info(f"Applied referral discount of {referral_discount_percent}% ({referral_discount} paise) for user {user_id}")
        except Exception as e:
            logger.warning(f"Could not apply referral discount for user {user_id}: {e}")
        
        # Apply coupon if provided (applied after referral discount)
        if request.coupon_code:
            validation = await self.coupon_service.validate_coupon(
                request.coupon_code, request.plan_id
            )
            if validation.is_valid and validation.final_price is not None:
                # Calculate additional discount from coupon on the already-discounted price
                coupon_discount = original_price - validation.final_price
                final_price = validation.final_price - referral_discount_percent  # Already discounted
                if final_price < 0:
                    final_price = 0
                discount_amount = original_price - final_price
                coupon_applied = request.coupon_code
        
        # Create subscription record (pending payment)
        subscription = await self.repo.create({
            "user_id": user_id,
            "plan_id": plan.id,
            "status": SubscriptionStatus.PENDING,
            "price_paid": final_price,
            "discount_applied": discount_amount,
            "coupon_id": None  # Will be set after coupon validation
        })
        
        # If price is 0 (free plan), activate immediately
        if final_price == 0:
            started_at = datetime.utcnow()
            expires_at = None if plan.duration_days == 0 else started_at + timedelta(days=plan.duration_days)
            subscription = await self.repo.activate(subscription.id, started_at, expires_at)
            
            # Mark referral reward as applied if there was a referral discount
            if referral_discount_percent > 0:
                try:
                    from ..referral.service import ReferralService
                    referral_service = ReferralService(self.db)
                    # Notify that referred user subscribed
                    await referral_service.on_referred_user_subscribed(user_id, subscription.id)
                except Exception as e:
                    logger.warning(f"Could not process referral subscription for user {user_id}: {e}")
            
            return SubscribeResponse(
                subscription_id=subscription.id,
                plan_id=plan.id,
                plan_name=plan.name,
                original_price=original_price,
                final_price=0,
                discount_amount=original_price,  # Full discount from referral
                coupon_applied=None,
                payment=None,
                requires_payment=False
            )
        
        # Create mock payment record
        payment_service = PaymentService(self.db)
        payment = await payment_service.create_mock_payment(
            user_id=user_id,
            subscription_id=subscription.id,
            amount=final_price,
            coupon_code=coupon_applied
        )
        
        return SubscribeResponse(
            subscription_id=subscription.id,
            plan_id=plan.id,
            plan_name=plan.name,
            original_price=original_price,
            final_price=final_price,
            discount_amount=discount_amount,
            coupon_applied=coupon_applied,
            payment=payment,
            requires_payment=True
        )
    
    async def cancel(self, user_id: UUID, subscription_id: UUID) -> CancelSubscriptionResponse:
        """Cancel a subscription (access continues until period end)."""
        subscription = await self.repo.get_by_id(subscription_id)
        
        if not subscription:
            raise ValueError("Subscription not found")
        
        if subscription.user_id != user_id:
            raise ValueError("Subscription does not belong to user")
        
        if subscription.status == SubscriptionStatus.CANCELLED:
            raise ValueError("Subscription is already cancelled")
        
        if subscription.status != SubscriptionStatus.ACTIVE:
            raise ValueError("Can only cancel active subscriptions")
        
        subscription = await self.repo.cancel(subscription_id)
        
        return CancelSubscriptionResponse(
            success=True,
            subscription_id=subscription.id,
            status=SubscriptionStatus.CANCELLED,
            access_expires_at=subscription.expires_at,
            message=f"Subscription cancelled. You have access until {subscription.expires_at.strftime('%d %b %Y')}."
        )
    
    async def get_feature_gating(self, user_id: UUID) -> FeatureGatingInfo:
        """Get feature gating information for a user."""
        status = await self.get_user_status(user_id)
        
        if status.is_premium:
            return FeatureGatingInfo(
                is_premium=True,
                locked_features=[],
                upgrade_plan=None,
                upgrade_url=None
            )
        
        return FeatureGatingInfo(
            is_premium=False,
            locked_features=LOCKED_FEATURES,
            upgrade_plan="Monthly",
            upgrade_url="/pricing"
        )


class CouponService:
    """Service for coupon operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CouponRepository(db)
    
    async def validate_coupon(self, code: str, plan_id: Optional[UUID] = None) -> CouponValidationResult:
        """Validate a coupon and calculate final price."""
        coupon, error = await self.repo.validate(code, plan_id)
        
        if error:
            return CouponValidationResult(
                is_valid=False,
                error_message=error
            )
        
        return CouponValidationResult(
            is_valid=True,
            coupon=self._format_coupon(coupon),
            error_message=None,
            final_price=None  # Final price calculated at subscription time
        )
    
    async def apply_coupon(self, code: str, plan_id: UUID, original_price: int) -> CouponValidationResult:
        """Apply coupon to get final price."""
        coupon, error = await self.repo.validate(code, plan_id)
        
        if error:
            return CouponValidationResult(
                is_valid=False,
                error_message=error
            )
        
        # Check minimum order amount
        if coupon.min_order_amount and original_price < coupon.min_order_amount:
            return CouponValidationResult(
                is_valid=False,
                error_message=f"Minimum order amount is ₹{coupon.min_order_amount // 100}"
            )
        
        # Calculate discount
        if coupon.discount_type == "percentage":
            discount = (original_price * coupon.discount_value) // 100
        else:  # fixed
            discount = coupon.discount_value
        
        # Ensure discount doesn't exceed original price
        discount = min(discount, original_price)
        final_price = original_price - discount
        
        return CouponValidationResult(
            is_valid=True,
            coupon=self._format_coupon(coupon),
            error_message=None,
            final_price=final_price
        )
    
    def _format_coupon(self, coupon: Coupon) -> CouponResponse:
        """Format coupon for response."""
        if coupon.discount_type == "percentage":
            discount_display = f"{coupon.discount_value}% off"
        else:
            discount_display = f"₹{coupon.discount_value // 100} off"
        
        return CouponResponse(
            id=coupon.id,
            code=coupon.code,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            discount_display=discount_display,
            min_order_amount=coupon.min_order_amount,
            valid_until=coupon.valid_until,
            is_valid=True,
            error_message=None
        )
    
    async def seed_sample_coupons(self) -> List[Coupon]:
        """Seed sample coupons for testing."""
        sample_coupons = [
            {
                "code": "WELCOME10",
                "discount_type": "percentage",
                "discount_value": 10,
                "max_uses": 100,
                "min_order_amount": None,
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=365),
                "is_active": True,
                "description": "10% off for new users"
            },
            {
                "code": "SAVE20",
                "discount_type": "percentage",
                "discount_value": 20,
                "max_uses": 50,
                "min_order_amount": 49900,  # ₹499
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=180),
                "is_active": True,
                "description": "20% off on all plans"
            },
            {
                "code": "FLAT100",
                "discount_type": "fixed",
                "discount_value": 10000,  # ₹100
                "max_uses": None,  # Unlimited
                "min_order_amount": 49900,
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=90),
                "is_active": True,
                "description": "₹100 off on Monthly and above"
            }
        ]
        
        created = []
        for coupon_data in sample_coupons:
            existing = await self.repo.get_by_code(coupon_data["code"])
            if not existing:
                coupon = await self.repo.create(coupon_data)
                created.append(coupon)
                logger.info(f"Created sample coupon: {coupon.code}")
        
        return created


class PaymentService:
    """Service for payment operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PaymentRepository(db)
        self.subscription_repo = SubscriptionRepository(db)
        self.coupon_repo = CouponRepository(db)
    
    async def create_mock_payment(
        self,
        user_id: UUID,
        subscription_id: UUID,
        amount: int,
        coupon_code: Optional[str] = None
    ) -> PaymentResponse:
        """Create a mock payment record."""
        coupon_id = None
        discount_amount = 0
        
        if coupon_code:
            coupon = await self.coupon_repo.get_by_code(coupon_code)
            if coupon:
                coupon_id = coupon.id
                if coupon.discount_type == "percentage":
                    discount_amount = (amount * coupon.discount_value) // 100
                else:
                    discount_amount = coupon.discount_value
        
        payment_data = {
            "user_id": user_id,
            "subscription_id": subscription_id,
            "amount": amount,
            "currency": "INR",
            "payment_method": "mock_card",
            "status": PaymentStatus.PENDING,
            "coupon_id": coupon_id,
            "discount_amount": discount_amount,
            "is_mock": True
        }
        
        payment = await self.repo.create(payment_data)
        return payment
    
    async def process_mock_payment(
        self,
        subscription_id: UUID,
        request: PaymentMockRequest
    ) -> PaymentWithReceipt:
        """Process a mock payment (success or failure)."""
        payment = await self.repo.get_by_subscription_id(subscription_id)
        if not payment:
            raise ValueError("Payment not found")
        
        subscription = await self.subscription_repo.get_by_id(payment.subscription_id)
        if not subscription:
            raise ValueError("Subscription not found")
        
        if request.success:
            # Mark payment as success
            transaction_id = f"MOCK_{uuid.uuid4().hex[:12].upper()}"
            payment = await self.repo.mark_success(payment.id, transaction_id)
            
            # Activate subscription
            plan_service = PlanService(self.db)
            plan = await plan_service.get_plan(subscription.plan_id)
            
            started_at = datetime.utcnow()
            expires_at = None
            if plan and plan.duration_days > 0:
                expires_at = started_at + timedelta(days=plan.duration_days)
            
            await self.subscription_repo.activate(subscription.id, started_at, expires_at)
            
            # Increment coupon usage
            if payment.coupon_id:
                coupon = await self.coupon_repo.get_by_id(payment.coupon_id)
                if coupon:
                    await self.coupon_repo.increment_usage(payment.coupon_id)
            
            # Notify referral system that referred user subscribed
            try:
                from ..referral.service import ReferralService
                referral_service = ReferralService(self.db)
                await referral_service.on_referred_user_subscribed(subscription.user_id, subscription.id)
            except Exception as e:
                logger.warning(f"Could not process referral subscription for user {subscription.user_id}: {e}")
        else:
            # Mark payment as failed
            payment = await self.repo.mark_failed(
                payment.id,
                "MOCK_DECLINED",
                "Mock payment was declined"
            )
        
        return payment
    
    async def get_payment_history(self, user_id: UUID) -> List[PaymentWithReceipt]:
        """Get user's payment history with receipt details."""
        payments = await self.repo.get_user_payments(user_id)
        result = []
        
        plan_service = PlanService(self.db)
        
        for payment in payments:
            plan_name = None
            coupon_code = None
            
            if payment.subscription_id:
                subscription = await self.subscription_repo.get_by_id(payment.subscription_id)
                if subscription:
                    plan = await plan_service.get_plan(subscription.plan_id)
                    if plan:
                        plan_name = plan.name
            
            if payment.coupon_id:
                coupon = await self.coupon_repo.get_by_id(payment.coupon_id)
                if coupon:
                    coupon_code = coupon.code
            
            payment_dict = {
                "id": payment.id,
                "user_id": payment.user_id,
                "subscription_id": payment.subscription_id,
                "amount": payment.amount,
                "currency": payment.currency,
                "payment_method": payment.payment_method,
                "status": payment.status,
                "transaction_id": payment.transaction_id,
                "is_mock": payment.is_mock,
                "created_at": payment.created_at,
                "plan_name": plan_name,
                "coupon_code": coupon_code,
                "discount_amount": payment.discount_amount
            }
            result.append(PaymentWithReceipt(**payment_dict))
        
        return result
    
    async def get_user_payments(self, user_id: UUID) -> List[Payment]:
        """Get user's payment history."""
        return await self.repo.get_user_payments(user_id)


class UserSubscriptionService:
    """High-level service for user subscription operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.subscription_service = SubscriptionService(db)
        self.plan_service = PlanService(db)
    
    async def check_premium_access(self, user_id: UUID) -> bool:
        """Check if user has premium access."""
        status = await self.subscription_service.get_user_status(user_id)
        return status.is_premium and status.is_active
    
    async def has_access_to_premium_content(self, user_id: UUID) -> Tuple[bool, Optional[str]]:
        """
        Check if user can access premium content.
        Returns (has_access, upgrade_message).
        """
        status = await self.subscription_service.get_user_status(user_id)
        
        if status.is_premium and status.is_active:
            return True, None
        
        if status.subscription and status.subscription.status == SubscriptionStatus.CANCELLED:
            # Still has access until expiry
            if status.access_expires_at and status.access_expires_at > datetime.utcnow():
                return True, None
        
        return False, "This content requires a premium subscription"
