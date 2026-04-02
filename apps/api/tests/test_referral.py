"""
Tests for referral system.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from internal.referral.models import Referral, ReferralCode, ReferralReward, ReferralStatus, RewardType
from internal.referral.service import ReferralService, generate_referral_code
from internal.referral.repository import ReferralRepository


class TestReferralCodeGeneration:
    """Tests for referral code generation."""
    
    def test_generate_referral_code_format(self):
        """Test that referral code follows expected format."""
        user_id = uuid4()
        code = generate_referral_code(user_id)
        
        # Should start with OLLI prefix
        assert code.startswith("OLLI")
        # Should be 10 characters total (4 prefix + 6 random)
        assert len(code) == 10
        # Should be uppercase
        assert code.isupper()
    
    def test_generate_referral_code_unique(self):
        """Test that generated codes are unique."""
        codes = [generate_referral_code(uuid4()) for _ in range(100)]
        assert len(codes) == len(set(codes))


class TestReferralService:
    """Tests for referral service."""
    
    @pytest.mark.asyncio
    async def test_create_referral_code_for_new_user(self, test_db: AsyncSession):
        """Test creating referral code for a new user."""
        service = ReferralService(test_db)
        user_id = uuid4()
        
        code = await service.get_or_create_referral_code(user_id)
        
        assert code is not None
        assert code.startswith("OLLI")
        assert len(code) == 10
        
        # Verify code was created in database
        repo = ReferralRepository(test_db)
        db_code = await repo.get_referral_code_by_user(user_id)
        assert db_code is not None
        assert db_code.code == code
    
    @pytest.mark.asyncio
    async def test_get_existing_referral_code(self, test_db: AsyncSession):
        """Test getting existing referral code doesn't create duplicate."""
        service = ReferralService(test_db)
        user_id = uuid4()
        
        code1 = await service.get_or_create_referral_code(user_id)
        code2 = await service.get_or_create_referral_code(user_id)
        
        assert code1 == code2
    
    @pytest.mark.asyncio
    async def test_validate_valid_referral_code(self, test_db: AsyncSession):
        """Test validating a valid referral code."""
        service = ReferralService(test_db)
        user_id = uuid4()
        
        code = await service.get_or_create_referral_code(user_id)
        validation = await service.validate_referral_code(code)
        
        assert validation.is_valid is True
        assert validation.error_message is None
    
    @pytest.mark.asyncio
    async def test_validate_invalid_referral_code(self, test_db: AsyncSession):
        """Test validating an invalid referral code."""
        service = ReferralService(test_db)
        
        validation = await service.validate_referral_code("INVALID123")
        
        assert validation.is_valid is False
        assert validation.error_message == "Invalid referral code"
    
    @pytest.mark.asyncio
    async def test_track_referral(self, test_db: AsyncSession):
        """Test tracking a referral."""
        service = ReferralService(test_db)
        referrer_id = uuid4()
        referred_id = uuid4()
        
        # Create referral code for referrer
        code = await service.get_or_create_referral_code(referrer_id)
        
        # Track referral
        result = await service.track_referral(
            referred_user_id=referred_id,
            referral_code=code
        )
        
        assert result.tracked is True
        assert result.referral_code == code
        assert result.message == "Referral tracked successfully"
        
        # Verify referral was created
        repo = ReferralRepository(test_db)
        referrals = await repo.get_referrals_for_user(referrer_id)
        assert len(referrals) == 1
        assert referrals[0].referred_id == referred_id
        assert referrals[0].status == ReferralStatus.PENDING
    
    @pytest.mark.asyncio
    async def test_track_self_referral_fails(self, test_db: AsyncSession):
        """Test that self-referral is rejected."""
        service = ReferralService(test_db)
        user_id = uuid4()
        
        code = await service.get_or_create_referral_code(user_id)
        result = await service.track_referral(
            referred_user_id=user_id,
            referral_code=code
        )
        
        assert result.tracked is False
        assert result.message == "Cannot refer yourself"
    
    @pytest.mark.asyncio
    async def test_track_duplicate_referral_fails(self, test_db: AsyncSession):
        """Test that duplicate referral is rejected."""
        service = ReferralService(test_db)
        referrer_id = uuid4()
        referred_id = uuid4()
        
        code = await service.get_or_create_referral_code(referrer_id)
        
        # First referral
        result1 = await service.track_referral(
            referred_user_id=referred_id,
            referral_code=code
        )
        assert result1.tracked is True
        
        # Duplicate referral
        result2 = await service.track_referral(
            referred_user_id=referred_id,
            referral_code=code
        )
        assert result2.tracked is True  # Already tracked
        assert result2.message == "Referral already tracked"


class TestReferralDiscount:
    """Tests for referral discount application."""
    
    @pytest.mark.asyncio
    async def test_apply_referral_code(self, test_db: AsyncSession):
        """Test applying a referral code creates discount reward."""
        service = ReferralService(test_db)
        referrer_id = uuid4()
        referred_id = uuid4()
        
        # Create referral
        code = await service.get_or_create_referral_code(referrer_id)
        await service.track_referral(referred_user_id=referred_id, referral_code=code)
        
        # Apply referral code
        result = await service.apply_referral_code(referred_id, code)
        
        assert result.success is True
        assert result.discount_percent == 10
        assert "10% discount" in result.message


class TestReferralRewards:
    """Tests for referral reward mechanisms."""
    
    @pytest.mark.asyncio
    async def test_on_referred_user_subscribed(self, test_db: AsyncSession):
        """Test that referring user gets reward when referred subscribes."""
        service = ReferralService(test_db)
        referrer_id = uuid4()
        referred_id = uuid4()
        subscription_id = uuid4()
        
        # Create referral
        code = await service.get_or_create_referral_code(referrer_id)
        await service.track_referral(referred_user_id=referred_id, referral_code=code)
        
        # Simulate referred user subscribing
        success, message = await service.on_referred_user_subscribed(referred_id, subscription_id)
        
        assert success is True
        assert "1 free month" in message
        
        # Verify referral status updated
        repo = ReferralRepository(test_db)
        referral = await repo.get_referral_by_users(referrer_id, referred_id)
        assert referral.status == ReferralStatus.COMPLETED
        
        # Verify reward was created for referrer
        rewards = await repo.get_rewards_for_user(referrer_id)
        assert len(rewards) == 1
        assert rewards[0].reward_type == RewardType.FREE_MONTH
        assert rewards[0].reward_value == 30  # 1 month = 30 days


class TestReferralDashboard:
    """Tests for referral dashboard."""
    
    @pytest.mark.asyncio
    async def test_get_referral_dashboard(self, test_db: AsyncSession):
        """Test getting referral dashboard."""
        service = ReferralService(test_db)
        user_id = uuid4()
        
        dashboard = await service.get_referral_dashboard(user_id)
        
        assert dashboard.referral_code.startswith("OLLI")
        assert dashboard.share_url.endswith(dashboard.referral_code)
        assert dashboard.total_referrals == 0
        assert dashboard.pending_referrals == 0
        assert dashboard.completed_referrals == 0
    
    @pytest.mark.asyncio
    async def test_dashboard_with_referrals(self, test_db: AsyncSession):
        """Test dashboard shows referral stats."""
        service = ReferralService(test_db)
        referrer_id = uuid4()
        referred_id = uuid4()
        
        # Create referral
        code = await service.get_or_create_referral_code(referrer_id)
        await service.track_referral(referred_user_id=referred_id, referral_code=code)
        
        # Get dashboard
        dashboard = await service.get_referral_dashboard(referrer_id)
        
        assert dashboard.total_referrals == 1
        assert dashboard.pending_referrals == 1
        assert dashboard.completed_referrals == 0
        assert len(dashboard.referrals) == 1


class TestReferralAPI:
    """Tests for referral API endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_my_referrals_unauthorized(self, client: AsyncClient):
        """Test that getting referrals without auth fails."""
        response = await client.get("/api/v1/referrals/me")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_validate_referral_code_endpoint(self, client: AsyncClient):
        """Test validating a referral code via API."""
        # Valid code format but doesn't exist
        response = await client.post(
            "/api/v1/referrals/validate",
            params={"code": "BENIFYXXXXXX"}
        )
        # Should fail validation
        assert response.status_code == 400


# Integration tests would go here, requiring full app setup
