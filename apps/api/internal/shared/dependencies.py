"""
Shared dependencies for feature gating and premium access.
"""
from fastapi import Depends

from ..auth.service import get_current_user, TokenData


async def require_premium_access(
    current_user: TokenData = Depends(get_current_user),
):
    """
    Premium checks are disabled while the app is free for all users.
    """
    return current_user


async def get_subscription_status(
    current_user: TokenData = Depends(get_current_user),
):
    """
    Return a stable free-access status while subscriptions are disabled.
    """
    return {
        "is_active": True,
        "is_premium": True,
        "plan": None,
        "subscription": None,
        "access_expires_at": None,
        "days_remaining": None,
    }
