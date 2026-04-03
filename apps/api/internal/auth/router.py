from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
import re
from datetime import datetime

from ..database import get_db
from ..redis import get_cache, CacheService
from ..config import settings
from .schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
    GoogleAuthRequest,
    OTPRequest,
    OTPRequestResponse,
    OTPVerify,
    OTPVerifyResponse,
)
from .service import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    is_rate_limited,
    generate_otp,
    send_otp_mock,
    store_otp,
    verify_stored_otp,
    invalidate_otp,
    TokenData,
)
from .models import User
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookies(response: Response, *, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=15 * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="access_token", httponly=True, secure=settings.COOKIE_SECURE, samesite="lax")
    response.delete_cookie(key="refresh_token", httponly=True, secure=settings.COOKIE_SECURE, samesite="lax")


def validate_password_strength(password: str) -> bool:
    """Validate password has at least 1 uppercase and 1 number."""
    has_uppercase = bool(re.search(r'[A-Z]', password))
    has_number = bool(re.search(r'\d', password))
    return has_uppercase and has_number


def create_tokens(user: User) -> TokenResponse:
    """Create access and refresh tokens for a user."""
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value,
    }
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        expires_in=15 * 60,  # 15 minutes in seconds
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: UserRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    # Validate password strength
    if not validate_password_strength(request.password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must contain at least 1 uppercase letter and 1 number",
        )
    
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create new user
    user = User(
        id=uuid.uuid4(),
        email=request.email,
        name=request.name,
        password_hash=get_password_hash(request.password),
    )
    
    db.add(user)
    await db.flush()
    await db.refresh(user)
    
    # Create tokens
    tokens = create_tokens(user)
    
    # Set refresh token in httpOnly cookie
    set_auth_cookies(response, access_token=tokens.access_token, refresh_token=tokens.refresh_token)
    
    # Track referral if code was provided
    if request.referral_code:
        try:
            from ..referral.service import ReferralService
            referral_service = ReferralService(db)
            await referral_service.track_referral(
                referred_user_id=user.id,
                referral_code=request.referral_code
            )
        except Exception as e:
            # Log but don't fail registration if referral tracking fails
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to track referral for user {user.id}: {e}")
    
    # Generate a referral code for the new user
    try:
        from ..referral.service import ReferralService
        referral_service = ReferralService(db)
        await referral_service.get_or_create_referral_code(user.id)
    except Exception as e:
        # Log but don't fail registration if code generation fails
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to generate referral code for user {user.id}: {e}")
    
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(
    request: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Login with email and password."""
    # Rate limiting
    rate_key = f"login:{request.email}"
    if await is_rate_limited(cache, rate_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
        )
    
    # Find user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Create tokens
    tokens = create_tokens(user)
    
    # Store refresh token family for rotation
    await cache.set(f"refresh_family:{user.id}", tokens.refresh_token, ttl=7 * 24 * 60 * 60)
    
    # Set refresh token in httpOnly cookie
    set_auth_cookies(response, access_token=tokens.access_token, refresh_token=tokens.refresh_token)
    
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    request: Optional[RefreshTokenRequest] = None,
    refresh_token_cookie: Optional[str] = Cookie(default=None, alias="refresh_token"),
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Refresh access token using refresh token."""
    refresh_token = request.refresh_token if request and request.refresh_token else refresh_token_cookie

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )
    
    # Decode the refresh token to get user info
    try:
        token_data = decode_token(refresh_token, expected_type="refresh")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    # Find user
    result = await db.execute(select(User).where(User.id == uuid.UUID(token_data.user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    # Check if refresh token is the latest one (for reuse detection)
    stored_refresh_token = await cache.get(f"refresh_family:{user.id}")
    if stored_refresh_token is None or stored_refresh_token != refresh_token:
        # Token family invalid - either expired or reused
        # Invalidate the entire family
        await cache.delete(f"refresh_family:{user.id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been invalidated. Please login again.",
        )
    
    # Create new tokens
    tokens = create_tokens(user)
    
    # Update refresh token family (rotation)
    await cache.set(f"refresh_family:{user.id}", tokens.refresh_token, ttl=7 * 24 * 60 * 60)
    
    # Set new refresh token in cookie
    set_auth_cookies(response, access_token=tokens.access_token, refresh_token=tokens.refresh_token)
    
    return tokens


@router.post("/logout")
async def logout(
    response: Response,
    current_user: TokenData = Depends(get_current_user),
    cache: CacheService = Depends(get_cache),
):
    """Logout and invalidate tokens."""
    # Delete refresh token family
    await cache.delete(f"refresh_family:{current_user.user_id}")
    
    clear_auth_cookies(response)
    
    return {"success": True, "data": {"success": True}}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user information."""
    result = await db.execute(select(User).where(User.id == uuid.UUID(current_user.user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Convert SQLAlchemy model to dict with proper UUID conversion
    user_dict = {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "language_preference": user.language_preference,
        "avatar_url": user.avatar_url,
        "subscription_status": user.subscription_status,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
    return UserResponse.model_validate(user_dict)


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Authenticate with Google OAuth.
    
    Accepts a Google ID token (credential), verifies it against Google's servers,
    and creates/links a user account. Returns JWT tokens on success.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Check if Google OAuth is configured
    if not settings.GOOGLE_CLIENT_ID:
        logger.error("Google OAuth not configured: GOOGLE_CLIENT_ID is not set")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on this server",
        )
    
    try:
        # Verify the Google ID token
        import google.auth
        import google.auth.transport.requests
        from google.oauth2 import id_token
        
        # Specify the CLIENT_ID of the app that accesses the backend
        # Or use None to allow any client - but for security, we should verify
        id_info = id_token.verify_oauth2_token(
            request.credential,
            google.auth.transport.requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # id_info contains the claims from the Google ID token
        # See: https://developers.google.com/identity/gsi/web/reference/js reference#credential
        google_id = id_info.get("sub")
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")
        
        if not google_id or not email:
            logger.warning(f"Google token missing required claims: google_id={google_id}, email={email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token: missing required claims",
            )
        
        logger.info(f"Google OAuth: Successfully verified token for {email}")
        
    except google.auth.exceptions.GoogleAuthError as e:
        logger.warning(f"Google OAuth authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )
    except ValueError as e:
        # This can happen if the token is malformed
        logger.warning(f"Google OAuth token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token format",
        )
    
    # Find or create user by google_id
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()
    
    if not user:
        # Check if user exists with same email but no google_id (account linking)
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            # Link existing account to Google
            user.google_id = google_id
            if not user.avatar_url and picture:
                user.avatar_url = picture
            if not user.name and name:
                user.name = name
            await db.flush()
            logger.info(f"Google OAuth: Linked existing account {email} to Google")
        else:
            # Create new user
            user = User(
                id=uuid.uuid4(),
                email=email,
                name=name,
                avatar_url=picture,
                google_id=google_id,
                password_hash=None,  # OAuth users don't have password
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)
            logger.info(f"Google OAuth: Created new user {email}")
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    await db.flush()
    
    # Create tokens
    tokens = create_tokens(user)
    
    # Store refresh token family for rotation
    await cache.set(f"refresh_family:{user.id}", tokens.refresh_token, ttl=7 * 24 * 60 * 60)
    
    # Set refresh token in httpOnly cookie
    set_auth_cookies(response, access_token=tokens.access_token, refresh_token=tokens.refresh_token)
    
    logger.info(f"Google OAuth: Successfully authenticated user {email}")
    
    return tokens


@router.post("/otp/request", response_model=OTPRequestResponse)
async def request_otp(
    request: OTPRequest,
    cache: CacheService = Depends(get_cache),
):
    """Request OTP for phone verification."""
    # Rate limiting - 3 OTP attempts per phone per hour
    rate_key = f"otp:{request.phone}"
    if await is_rate_limited(cache, rate_key, max_attempts=3, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please try again later.",
        )
    
    # Generate OTP
    otp = generate_otp()
    
    # Store OTP in cache (valid for 5 minutes)
    await store_otp(cache, request.phone, otp, expiry_seconds=300)
    
    # Send OTP via SMS (mock)
    await send_otp_mock(request.phone, otp)
    
    # Return mock OTP in response for testing
    return OTPRequestResponse(
        message="OTP sent successfully",
        otp=otp,  # Include OTP in response for mock/testing purposes
    )


@router.post("/otp/verify", response_model=OTPVerifyResponse)
async def verify_otp(
    request: OTPVerify,
    response: Response,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache),
):
    """Verify OTP and create session."""
    # Verify the OTP
    is_valid = await verify_stored_otp(cache, request.phone, request.otp)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP",
        )
    
    # Find user by phone or create new user
    result = await db.execute(select(User).where(User.phone == request.phone))
    user = result.scalar_one_or_none()
    
    if not user:
        # For OTP verification, we need an existing user
        # If user doesn't exist, they should register first
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this phone number. Please register first.",
        )
    
    # Create tokens
    tokens = create_tokens(user)
    
    # Store refresh token family for rotation
    await cache.set(f"refresh_family:{user.id}", tokens.refresh_token, ttl=7 * 24 * 60 * 60)
    
    # Set refresh token in httpOnly cookie
    set_auth_cookies(response, access_token=tokens.access_token, refresh_token=tokens.refresh_token)
    
    return OTPVerifyResponse(
        message="OTP verified successfully",
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        expires_in=15 * 60,
    )
