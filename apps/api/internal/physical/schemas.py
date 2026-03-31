"""
Pydantic schemas for physical training module.

Includes request/response schemas for physical plans,
progress logging, and mock physical tests.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class PhysicalPlanType(str, Enum):
    """Physical plan type enumeration."""
    RUNNING = "running"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    MIXED = "mixed"


class PhysicalGoalGender(str, Enum):
    """Target gender for physical plans."""
    MALE = "male"
    FEMALE = "female"
    ALL = "all"


# ============ Physical Plan Schemas ============

class PhysicalPlanBase(BaseModel):
    """Base physical plan schema."""
    title: str
    description: Optional[str] = None
    plan_type: PhysicalPlanType
    target_gender: PhysicalGoalGender = PhysicalGoalGender.ALL
    duration_weeks: int = 8
    difficulty_level: Optional[str] = None
    is_premium: bool = False


class PhysicalPlanResponse(PhysicalPlanBase):
    """Response schema for a physical plan."""
    id: UUID
    exercises: Optional[str] = None  # JSON string
    schedule: Optional[str] = None  # JSON string
    targets: Optional[str] = None  # JSON string
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class PhysicalPlanListResponse(BaseModel):
    """Response schema for listing physical plans."""
    id: str
    title: str
    description: Optional[str] = None
    plan_type: str
    target_gender: str
    duration_weeks: int
    difficulty_level: Optional[str] = None
    is_premium: bool
    is_active: bool
    
    class Config:
        from_attributes = True


class ExerciseItem(BaseModel):
    """Schema for an exercise item."""
    day: Optional[str] = None
    activity: str
    duration: Optional[int] = None  # in minutes
    sets: Optional[int] = None
    reps: Optional[str] = None  # e.g., "8-10"
    description: Optional[str] = None


class PhysicalPlanDetailResponse(BaseModel):
    """Response schema for physical plan detail."""
    id: str
    title: str
    description: Optional[str] = None
    plan_type: str
    target_gender: str
    duration_weeks: int
    difficulty_level: Optional[str] = None
    is_premium: bool
    exercises: List[ExerciseItem] = []
    schedule: Optional[dict] = None
    targets: Optional[dict] = None
    
    class Config:
        from_attributes = True


# ============ Physical Progress Schemas ============

class PhysicalProgressLogBase(BaseModel):
    """Base schema for physical progress log."""
    date: Optional[datetime] = None
    activity_type: str = Field(..., description="running, strength, flexibility")
    duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    pace_min_per_km: Optional[float] = None
    sets_reps: Optional[str] = None  # JSON string
    weight_kg: Optional[float] = None
    performance_rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


class PhysicalProgressLogCreate(PhysicalProgressLogBase):
    """Schema for creating a physical progress log."""
    physical_plan_id: Optional[str] = None


class PhysicalProgressLogResponse(PhysicalProgressLogBase):
    """Response schema for a physical progress log entry."""
    id: UUID
    user_id: UUID
    physical_plan_id: Optional[UUID] = None
    date: datetime
    is_completed: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class PhysicalProgressLogWithPlanResponse(PhysicalProgressLogResponse):
    """Response schema for progress log with plan details."""
    plan_title: Optional[str] = None


# ============ Progress Summary Schemas ============

class EnduranceProgressResponse(BaseModel):
    """Response schema for endurance tracking data."""
    date: str
    distance_km: float
    duration_minutes: int
    pace_min_per_km: float


class WeeklyProgressSummary(BaseModel):
    """Response schema for weekly progress summary."""
    week_start: str
    total_runs: int
    total_distance_km: float
    total_duration_minutes: int
    average_pace: float
    longest_run_km: float


class PhysicalReadinessResponse(BaseModel):
    """Response schema for overall physical readiness."""
    pst_complete: bool
    pet_complete: bool
    height_measured: bool
    chest_measured: Optional[bool] = None  # Male only
    weight_measured: bool
    overall_percentage: float


# ============ Mock Physical Test Schemas ============

class MockPETStation(BaseModel):
    """Schema for a PET station in mock test."""
    station_name: str
    requirement: str
    unit: str
    passing_standard: str
    user_value: Optional[float] = None
    passed: Optional[bool] = None


class MockPETRequest(BaseModel):
    """Request schema for starting mock PET."""
    height_cm: Optional[float] = None
    chest_cm: Optional[float] = None  # Male only
    weight_kg: Optional[float] = None
    run_time_seconds: Optional[int] = None  # 1.5km for male, 800m for female
    long_jump_m: Optional[float] = None
    high_jump_m: Optional[float] = None


class MockPETResponse(BaseModel):
    """Response schema for mock PET result."""
    overall_passed: bool
    score: float  # 0-100
    stations: List[MockPETStation]
    recommendations: List[str]


# ============ Gender-specific Requirements Schemas ============

class PSTRequirementsResponse(BaseModel):
    """Response schema for PST requirements by gender."""
    gender: str
    height_cm_min: float
    chest_cm_min: Optional[float] = None
    chest_expansion_cm: Optional[float] = None
    weight_kg_note: Optional[str] = None


class PETRequirementsResponse(BaseModel):
    """Response schema for PET requirements by gender."""
    gender: str
    run_distance_km: float
    run_time_seconds_max: int
    long_jump_m_min: float
    high_jump_m_min: float


# ============ Admin Physical Plan Schemas ============

class AdminPhysicalPlanCreate(BaseModel):
    """Schema for creating a physical plan (admin)."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    plan_type: PhysicalPlanType
    target_gender: PhysicalGoalGender = PhysicalGoalGender.ALL
    duration_weeks: int = Field(default=8, ge=1, le=52)
    difficulty_level: Optional[str] = None
    exercises: Optional[List[ExerciseItem]] = []
    schedule: Optional[dict] = None
    targets: Optional[dict] = None
    is_premium: bool = False
    is_active: bool = True


class AdminPhysicalPlanUpdate(BaseModel):
    """Schema for updating a physical plan (admin)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    plan_type: Optional[PhysicalPlanType] = None
    target_gender: Optional[PhysicalGoalGender] = None
    duration_weeks: Optional[int] = Field(None, ge=1, le=52)
    difficulty_level: Optional[str] = None
    exercises: Optional[List[ExerciseItem]] = None
    schedule: Optional[dict] = None
    targets: Optional[dict] = None
    is_premium: Optional[bool] = None
    is_active: Optional[bool] = None


class AdminPhysicalPlanResponse(PhysicalPlanBase):
    """Response schema for admin physical plan."""
    id: UUID
    exercises: Optional[List[ExerciseItem]] = []
    schedule: Optional[dict] = None
    targets: Optional[dict] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AdminPhysicalPlanListItem(BaseModel):
    """List item for admin physical plans."""
    id: str
    title: str
    description: Optional[str] = None
    plan_type: str
    target_gender: str
    duration_weeks: int
    difficulty_level: Optional[str] = None
    is_premium: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Admin Compliance & Statistics Schemas ============

class PhysicalComplianceStats(BaseModel):
    """Statistics for physical compliance monitoring."""
    total_users: int
    pst_ready_count: int
    pet_ready_count: int
    fully_ready_count: int
    pst_ready_percentage: float
    pet_ready_percentage: float
    fully_ready_percentage: float


class PhysicalComplianceByGender(BaseModel):
    """Compliance breakdown by gender."""
    gender: str
    total_users: int
    pst_ready_count: int
    pet_ready_count: int
    fully_ready_count: int
    pst_ready_percentage: float
    pet_ready_percentage: float
    fully_ready_percentage: float
