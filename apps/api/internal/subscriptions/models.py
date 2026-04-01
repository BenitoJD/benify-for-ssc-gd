"""
Subscription models for plans, subscriptions, coupons, and payments.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class PlanType(str):
    FREE = "free"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class Plan(Base):
    """Subscription plan model."""
    
    __tablename__ = "plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True)
    plan_type = Column(String(20), nullable=False, unique=True)  # free, monthly, quarterly, yearly
    price = Column(Integer, nullable=False)  # Price in paise (INR * 100)
    currency = Column(String(10), default="INR", nullable=False)
    duration_days = Column(Integer, nullable=False)  # Duration in days
    features = Column(Text, nullable=True)  # JSON string of features list
    is_active = Column(Boolean, default=True, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    trial_days = Column(Integer, default=0, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Plan {self.name}>"


class SubscriptionStatus(str):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"


class Subscription(Base):
    """User subscription model."""
    
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    
    # Subscription status
    status = Column(String(20), default=SubscriptionStatus.PENDING, nullable=False)  # active, cancelled, expired, pending
    
    # Pricing info at time of subscription
    price_paid = Column(Integer, nullable=True)  # Price actually paid in paise
    discount_applied = Column(Integer, default=0, nullable=False)  # Discount amount in paise
    
    # Coupon used
    coupon_id = Column(UUID(as_uuid=True), ForeignKey("coupons.id"), nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Auto renew
    auto_renew = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    user = relationship("User", backref="subscriptions")
    plan = relationship("Plan", backref="subscriptions")
    coupon = relationship("Coupon", backref="subscriptions")
    
    def __repr__(self):
        return f"<Subscription user={self.user_id} plan={self.plan_id} status={self.status}>"


class DiscountType(str):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class Coupon(Base):
    """Coupon/promocode model."""
    
    __tablename__ = "coupons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    discount_type = Column(String(20), nullable=False)  # percentage, fixed
    discount_value = Column(Integer, nullable=False)  # Percentage (1-100) or fixed amount in paise
    max_uses = Column(Integer, nullable=True)  # NULL means unlimited
    current_uses = Column(Integer, default=0, nullable=False)
    min_order_amount = Column(Integer, nullable=True)  # Minimum order amount in paise
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Plan restriction (NULL means applicable to all plans)
    applicable_plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Coupon {self.code}>"


class PaymentStatus(str):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base):
    """Payment record model."""
    
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=True)
    
    # Payment details
    amount = Column(Integer, nullable=False)  # Amount in paise
    currency = Column(String(10), default="INR", nullable=False)
    payment_method = Column(String(50), nullable=True)  # card, upi, netbanking, mock
    status = Column(String(20), default=PaymentStatus.PENDING, nullable=False)  # pending, success, failed, refunded
    
    # Transaction IDs
    transaction_id = Column(String(255), nullable=True)  # External transaction ID
    order_id = Column(String(255), nullable=True)  # Razorpay order ID
    
    # Coupon applied
    coupon_id = Column(UUID(as_uuid=True), ForeignKey("coupons.id"), nullable=True)
    discount_amount = Column(Integer, default=0, nullable=False)  # Discount applied in paise
    
    # Mock payment fields
    is_mock = Column(Boolean, default=False, nullable=False)
    mock_response = Column(Text, nullable=True)  # JSON string of mock response
    
    # Error info
    error_code = Column(String(50), nullable=True)
    error_message = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="payments")
    subscription = relationship("Subscription", backref="payments")
    coupon = relationship("Coupon", backref="payments")
    
    def __repr__(self):
        return f"<Payment {self.id} user={self.user_id} amount={self.amount} status={self.status}>"
