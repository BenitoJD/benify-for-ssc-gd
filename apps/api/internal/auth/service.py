from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..config import settings
from ..database import get_db
from .schemas import TokenData, UserRole

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    import uuid
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access", "iat": now, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token."""
    import uuid
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh", "iat": now, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role", "student")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return TokenData(user_id=user_id, email=email, role=UserRole(role))
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> TokenData:
    """Get the current authenticated user from the JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    token = credentials.credentials
    token_data = decode_token(token)
    
    if token_data.user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    return token_data


async def get_current_active_user(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """Get the current active user."""
    return current_user


def require_roles(*roles: UserRole):
    """Dependency factory for requiring specific roles."""
    async def role_checker(current_user: TokenData = Depends(get_current_user)) -> TokenData:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return current_user
    return role_checker


# Pre-built role dependencies
require_admin = require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
require_super_admin = require_roles(UserRole.SUPER_ADMIN)


async def require_admin_or_opencloud(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    opencloud_api_key: Optional[str] = Header(default=None, alias="X-OpenCloud-Api-Key"),
) -> TokenData:
    """Allow access through an admin JWT or the configured OpenCloud API key."""
    configured_api_key = settings.OPENCLOUD_ADMIN_API_KEY

    if configured_api_key:
        if opencloud_api_key == configured_api_key:
            return TokenData(
                user_id="opencloud-agent",
                email="opencloud@system.local",
                role=UserRole.ADMIN,
            )

        if opencloud_api_key is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OpenCloud API key",
            )

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token_data = decode_token(credentials.credentials)
    if token_data.role not in {UserRole.ADMIN, UserRole.SUPER_ADMIN}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )

    return token_data


class RateLimiter:
    """Simple in-memory rate limiter for auth endpoints."""
    
    def __init__(self):
        self.attempts: dict[str, list[datetime]] = {}
    
    def is_rate_limited(self, key: str, max_attempts: int = 5, window_seconds: int = 60) -> bool:
        """Check if a key is rate limited."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)
        
        if key not in self.attempts:
            self.attempts[key] = []
        
        # Clean old attempts
        self.attempts[key] = [t for t in self.attempts[key] if t > window_start]
        
        if len(self.attempts[key]) >= max_attempts:
            return True
        
        self.attempts[key].append(now)
        return False


# Global rate limiter instance
auth_rate_limiter = RateLimiter()

# OTP Rate limiter (3 attempts per phone per hour)
otp_rate_limiter = RateLimiter()


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    import random
    return str(random.randint(100000, 999999))


async def send_otp_mock(phone: str, otp: str) -> None:
    """
    Mock SMS sending function.
    In production, this would integrate with Twilio, MSG91, etc.
    For now, just log the OTP.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[MOCK SMS] To: {phone}, OTP: {otp}")


async def store_otp(cache, phone: str, otp: str, expiry_seconds: int = 300) -> None:
    """Store OTP in cache with expiration."""
    # OTP is valid for 5 minutes
    await cache.set(f"otp:{phone}", otp, ttl=expiry_seconds)


async def verify_stored_otp(cache, phone: str, otp: str) -> bool:
    """Verify the OTP from cache."""
    stored_otp = await cache.get(f"otp:{phone}")
    if stored_otp and stored_otp == otp:
        # Delete OTP after successful verification
        await cache.delete(f"otp:{phone}")
        return True
    return False


async def invalidate_otp(cache, phone: str) -> None:
    """Invalidate OTP for a phone number."""
    await cache.delete(f"otp:{phone}")
