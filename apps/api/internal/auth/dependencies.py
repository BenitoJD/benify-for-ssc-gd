from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..database import get_db
from .schemas import TokenData, UserRole
from .service import (
    get_current_user,
    decode_token,
    require_roles,
    require_admin,
    require_super_admin,
    require_admin_or_opencloud,
)

# Re-export for convenience
__all__ = [
    "get_current_user",
    "get_current_active_user",
    "require_roles",
    "require_admin",
    "require_super_admin",
    "require_admin_or_opencloud",
    "decode_token",
    "TokenData",
    "UserRole",
]
