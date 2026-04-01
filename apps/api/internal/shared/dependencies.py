"""
Shared dependencies for feature gating and premium access.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from ..subscriptions.service import UserSubscriptionService


async def require_premium_access(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dependency that requires premium subscription access.
    Raises 403 if user does not have premium access.
    """
    service = UserSubscriptionService(db)
    has_access, upgrade_message = await service.has_access_to_premium_content(
        current_user.user_id
    )
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=upgrade_message or "This content requires a premium subscription",
            headers={
                "X-Upgrade-Required": "true",
                "X-Upgrade-URL": "/pricing"
            }
        )
    
    return current_user


async def get_subscription_status(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dependency that returns subscription status for the current user.
    Can be used to conditionally show/hide features.
    """
    from ..subscriptions.service import SubscriptionService
    service = SubscriptionService(db)
    return await service.get_user_status(current_user.user_id)
