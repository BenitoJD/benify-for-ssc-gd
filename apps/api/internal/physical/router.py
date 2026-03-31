"""
API router for physical training module.

Provides endpoints for:
- GET /api/v1/physical/plans - List physical training plans
- GET /api/v1/physical/plans/{id} - Get plan details
- GET /api/v1/physical/progress/me - Get user's progress logs
- POST /api/v1/physical/progress/log - Log a training session
- GET /api/v1/physical/endurance - Get endurance tracking data
- GET /api/v1/physical/readiness - Get physical readiness status
- GET /api/v1/physical/requirements/pst - Get PST requirements
- GET /api/v1/physical/requirements/pet - Get PET requirements
- POST /api/v1/physical/mock-pet - Calculate mock PET results
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.dependencies import get_current_user, TokenData
from .schemas import (
    PhysicalPlanListResponse,
    PhysicalPlanDetailResponse,
    PhysicalProgressLogCreate,
    PhysicalProgressLogResponse,
    PhysicalProgressLogWithPlanResponse,
    EnduranceProgressResponse,
    WeeklyProgressSummary,
    PhysicalReadinessResponse,
    PSTRequirementsResponse,
    PETRequirementsResponse,
    MockPETRequest,
    MockPETResponse,
)
from .service import PhysicalService

router = APIRouter(tags=["Physical Training"])


# ============ Physical Plan Endpoints ============

@router.get("/physical/plans", response_model=List[PhysicalPlanListResponse])
async def get_physical_plans(
    target_gender: Optional[str] = Query(None, description="Filter by gender (male/female)"),
    plan_type: Optional[str] = Query(None, description="Filter by type (running/strength/flexibility/mixed)"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all physical training plans, filtered by gender and type."""
    service = PhysicalService(db)
    
    # Get user gender from profile if not specified
    user_gender = target_gender
    if not user_gender:
        from ..users.repository import UserRepository
        user_repo = UserRepository(db)
        profile = await user_repo.get_profile_by_user_id(UUID(current_user.user_id))
        if profile and profile.gender:
            user_gender = profile.gender
    
    return await service.get_plans(
        user_id=UUID(current_user.user_id),
        target_gender=user_gender,
        plan_type=plan_type
    )


@router.get("/physical/plans/{plan_id}", response_model=PhysicalPlanDetailResponse)
async def get_physical_plan(
    plan_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific physical training plan by ID."""
    service = PhysicalService(db)
    
    try:
        plan_uuid = UUID(plan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID format"
        )
    
    plan = await service.get_plan_by_id(plan_uuid)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical plan not found"
        )
    
    return plan


# ============ Progress Log Endpoints ============

@router.post("/physical/progress/log", response_model=PhysicalProgressLogResponse)
async def log_physical_progress(
    data: PhysicalProgressLogCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log a physical training session."""
    service = PhysicalService(db)
    
    # Validate activity type
    valid_activities = ["running", "strength", "flexibility"]
    if data.activity_type not in valid_activities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid activity type. Must be one of: {', '.join(valid_activities)}"
        )
    
    return await service.log_progress(
        user_id=UUID(current_user.user_id),
        data=data
    )


@router.get("/physical/progress/me", response_model=List[PhysicalProgressLogWithPlanResponse])
async def get_my_progress(
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's physical training progress logs."""
    service = PhysicalService(db)
    return await service.get_user_progress(
        user_id=UUID(current_user.user_id),
        activity_type=activity_type,
        days=days
    )


# ============ Endurance Tracking Endpoints ============

@router.get("/physical/endurance", response_model=List[EnduranceProgressResponse])
async def get_endurance_data(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get endurance tracking data for charts (running activities only)."""
    service = PhysicalService(db)
    return await service.get_endurance_data(
        user_id=UUID(current_user.user_id),
        days=days
    )


@router.get("/physical/weekly-summary", response_model=List[WeeklyProgressSummary])
async def get_weekly_summary(
    weeks: int = Query(4, ge=1, le=12, description="Number of weeks to look back"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get weekly progress summaries for running activities."""
    service = PhysicalService(db)
    return await service.get_weekly_summary(
        user_id=UUID(current_user.user_id),
        weeks=weeks
    )


# ============ Readiness & Requirements Endpoints ============

@router.get("/physical/readiness", response_model=PhysicalReadinessResponse)
async def get_physical_readiness(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get overall physical readiness status."""
    service = PhysicalService(db)
    return await service.get_physical_readiness(
        user_id=UUID(current_user.user_id)
    )


@router.get("/physical/requirements/pst", response_model=PSTRequirementsResponse)
async def get_pst_requirements(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get PST (Physical Standard Test) requirements for user's gender."""
    service = PhysicalService(db)
    
    # Get user gender
    from ..users.repository import UserRepository
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_user_id(UUID(current_user.user_id))
    gender = profile.gender if profile and profile.gender else "male"
    
    return await service.get_pst_requirements(gender)


@router.get("/physical/requirements/pet", response_model=PETRequirementsResponse)
async def get_pet_requirements(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get PET (Physical Efficiency Test) requirements for user's gender."""
    service = PhysicalService(db)
    
    # Get user gender
    from ..users.repository import UserRepository
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_user_id(UUID(current_user.user_id))
    gender = profile.gender if profile and profile.gender else "male"
    
    return await service.get_pet_requirements(gender)


# ============ Mock Physical Test Endpoints ============

@router.post("/physical/mock-pet", response_model=MockPETResponse)
async def calculate_mock_pet(
    data: MockPETRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Calculate mock PET results based on user's measurements and performance."""
    service = PhysicalService(db)
    
    # Require at least one measurement
    if all(v is None for v in [
        data.height_cm,
        data.chest_cm,
        data.weight_kg,
        data.run_time_seconds,
        data.long_jump_m,
        data.high_jump_m
    ]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one measurement or performance value is required"
        )
    
    return await service.calculate_mock_pet(
        user_id=UUID(current_user.user_id),
        data=data
    )
