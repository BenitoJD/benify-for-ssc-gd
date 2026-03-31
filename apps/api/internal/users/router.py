from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
import uuid

from ..database import get_db
from ..auth.dependencies import get_current_user, TokenData, require_admin
from .schemas import (
    ProfileUpdate,
    ProfileResponse,
    UserStats,
    OnboardingRequest,
    UsersListResponse,
    UserDetailResponse,
)
from .service import UserService
from ..shared.pagination import get_pagination_meta, PaginatedResponse

router = APIRouter(prefix="/users", tags=["Users"])


class AssessmentAnswer(BaseModel):
    """Single assessment answer."""
    question_id: str
    answer: str


class AssessmentSubmitRequest(BaseModel):
    """Request body for submitting assessment answers."""
    answers: dict[str, str]  # question_id -> answer


class AssessmentResult(BaseModel):
    """Assessment result with calculated level."""
    level: str
    score: int
    total_questions: int


# Diagnostic questions with correct answers (for server-side calculation)
DIAGNOSTIC_QUESTIONS = {
    "q1": "a",  # APPLE -> ELPPA, MANGO -> OGNAM
    "q2": "b",  # Pattern: n*(n+1), 6*7=42
    "q3": "a",  # 15% of x = 45, x = 300
    "q4": "a",  # Average of first 10 naturals = 5.5
    "q5": "c",  # Dr. B.R. Ambedkar
    "q6": "b",  # Mars
    "q7": "b",  # Abundant = Plentiful
    "q8": "a",  # "has made its decision"
    "q9": "a",  # Guru = teacher
    "q10": "a", # First option has correct spelling
}


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's profile."""
    service = UserService(db)
    return await service.get_user(uuid.UUID(current_user.user_id))


@router.patch("/me", response_model=ProfileResponse)
async def update_current_user_profile(
    data: ProfileUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    service = UserService(db)
    return await service.update_profile(uuid.UUID(current_user.user_id), data)


@router.post("/onboarding/assessment", response_model=AssessmentResult)
async def submit_assessment(
    data: AssessmentSubmitRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit diagnostic quiz answers and get calculated level."""
    # Calculate score server-side
    correct_count = 0
    total_questions = len(DIAGNOSTIC_QUESTIONS)
    
    for question_id, correct_answer in DIAGNOSTIC_QUESTIONS.items():
        if data.answers.get(question_id) == correct_answer:
            correct_count += 1
    
    percentage = (correct_count / total_questions) * 100
    
    # Determine level based on score
    if percentage >= 70:
        level = "advanced"
    elif percentage >= 40:
        level = "intermediate"
    else:
        level = "beginner"
    
    return AssessmentResult(
        level=level,
        score=correct_count,
        total_questions=total_questions,
    )


@router.post("/onboarding", response_model=ProfileResponse)
async def complete_onboarding(
    data: OnboardingRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Complete user onboarding."""
    service = UserService(db)
    return await service.complete_onboarding(uuid.UUID(current_user.user_id), data)


@router.get("/me/stats", response_model=UserStats)
async def get_current_user_stats(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's statistics."""
    service = UserService(db)
    return await service.get_user_stats(uuid.UUID(current_user.user_id))


# Admin routes
@router.get("/admin/users", response_model=PaginatedResponse[UsersListResponse])
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    _: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    service = UserService(db)
    users, total = await service.list_users(page, limit, search, role)
    
    return PaginatedResponse(
        data=users,
        meta=get_pagination_meta(total, page, limit),
    )


@router.get("/admin/users/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(
    user_id: str,
    _: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed user information (admin only)."""
    service = UserService(db)
    try:
        return await service.get_user(uuid.UUID(user_id))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )


@router.patch("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    _: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update user active status (admin only)."""
    # TODO: Implement user status update
    return {"message": "User status updated"}
