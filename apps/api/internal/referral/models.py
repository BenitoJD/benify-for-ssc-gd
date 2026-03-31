"""
Referral system database models.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class ReferralStatus(str, enum.Enum):
    """Status of a referral."""
    PENDING = "pending"  # Referred user registered but hasn't subscribed
    COMPLETED = "completed"  # Referred user subscribed to premium
    REWARDED = "rewarded"  # Referrer has received their reward


class RewardType(str, enum.Enum):
    """Type of reward."""
    FREE_MONTH = "free_month"  # Referrer gets free month extension
    DISCOUNT = "discount"  # Referred user gets discount


class Referral(Base):
    """Referral tracking model - tracks who referred whom."""
    
    __tablename__ = "referrals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # The user who made the referral
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # The user who was referred
    referred_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Referral code used (for tracking which code was shared)
    referral_code_id = Column(UUID(as_uuid=True), ForeignKey("referral_codes.id"), nullable=True)
    
    # Status
    status = Column(SQLEnum(ReferralStatus), default=ReferralStatus.PENDING, nullable=False)
    
    # When the referred user subscribed (if ever)
    subscribed_at = Column(DateTime, nullable=True)
    
    # When reward was given to referrer
    reward_given_at = Column(DateTime, nullable=True)
    
    # Referral source (UTM parameters for tracking)
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], backref="referrals_made")
    referred = relationship("User", foreign_keys=[referred_id], backref="referrals_received")
    referral_code = relationship("ReferralCode", backref="referrals")
    
    # Indexes for efficient queries
    __table_args__ = (
        Index('ix_referrals_referrer_status', 'referrer_id', 'status'),
        Index('ix_referrals_referred_status', 'referred_id', 'status'),
    )
    
    def __repr__(self):
        return f"<Referral referrer={self.referrer_id} referred={self.referred_id} status={self.status}>"


class ReferralCode(Base):
    """Unique referral code generated for each user."""
    
    __tablename__ = "referral_codes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # The actual code (e.g., "BENIFY2024XYZ123")
    code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Whether this code has been used at least once
    is_used = Column(Boolean, default=False, nullable=False)
    
    # Number of times this code has been used successfully
    use_count = Column(Integer, default=0, nullable=False)
    
    # Whether the code is active (user can share it)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<ReferralCode user={self.user_id} code={self.code}>"


class ReferralReward(Base):
    """Tracks rewards given to users for successful referrals."""
    
    __tablename__ = "referral_rewards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # The referral that triggered this reward
    referral_id = Column(UUID(as_uuid=True), ForeignKey("referrals.id"), nullable=False, index=True)
    
    # The user who received the reward
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Type of reward
    reward_type = Column(SQLEnum(RewardType), nullable=False)
    
    # Value of reward (e.g., 30 for free month, 100 for 100 rupees discount)
    reward_value = Column(Integer, nullable=False)
    
    # Whether the reward has been applied
    is_applied = Column(Boolean, default=False, nullable=False)
    
    # When the reward was applied
    applied_at = Column(DateTime, nullable=True)
    
    # Notes (e.g., "Extended subscription by 30 days")
    notes = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    referral = relationship("Referral", backref="rewards")
    user = relationship("User", backref="referral_rewards")
    
    def __repr__(self):
        return f"<ReferralReward user={self.user_id} type={self.reward_type} value={self.reward_value}>"
