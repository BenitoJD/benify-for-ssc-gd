from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class SubscriptionStatus(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    CANCELLED = "cancelled"


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    language_preference: str = "en"


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    subscription_status: SubscriptionStatus = SubscriptionStatus.FREE
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class GoogleAuthRequest(BaseModel):
    credential: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class OTPRequest(BaseModel):
    """Request OTP for phone verification."""
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{6,14}$')


class OTPRequestResponse(BaseModel):
    """Response for OTP request."""
    message: str
    otp: Optional[str] = None  # Only in mock/development mode


class OTPVerify(BaseModel):
    """Verify OTP for phone verification."""
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{6,14}$')
    otp: str = Field(..., min_length=6, max_length=6)


class OTPVerifyResponse(BaseModel):
    """Response for OTP verification."""
    message: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
