"""
Service layer for physical training module.

Handles business logic for physical plans, progress logging,
endurance tracking, and mock physical tests.
"""
import json
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from .models import PhysicalPlan, PhysicalProgressLog, PhysicalPlanType, PhysicalGoalGender
from .schemas import (
    PhysicalPlanResponse,
    PhysicalPlanListResponse,
    PhysicalPlanDetailResponse,
    ExerciseItem,
    PhysicalProgressLogCreate,
    PhysicalProgressLogResponse,
    PhysicalProgressLogWithPlanResponse,
    EnduranceProgressResponse,
    WeeklyProgressSummary,
    PhysicalReadinessResponse,
    MockPETRequest,
    MockPETResponse,
    MockPETStation,
    PSTRequirementsResponse,
    PETRequirementsResponse,
)
from ..users.repository import UserRepository
from ..shared.exceptions import NotFoundException


class PhysicalService:
    """Service layer for physical training operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ============ Physical Plan Operations ============
    
    async def get_plans(
        self,
        user_id: UUID,
        target_gender: Optional[str] = None,
        plan_type: Optional[str] = None
    ) -> List[PhysicalPlanListResponse]:
        """Get all physical plans filtered by gender and type."""
        query = select(PhysicalPlan).where(PhysicalPlan.is_active == True)
        
        # Filter by gender: show plans matching user's gender or 'all'
        if target_gender:
            query = query.where(
                (PhysicalPlan.target_gender == PhysicalGoalGender.ALL) |
                (PhysicalPlan.target_gender == target_gender.upper())
            )
        
        # Filter by plan type
        if plan_type:
            query = query.where(PhysicalPlan.plan_type == plan_type.upper())
        
        query = query.order_by(PhysicalPlan.created_at.desc())
        
        result = await self.db.execute(query)
        plans = result.scalars().all()
        
        return [
            PhysicalPlanListResponse(
                id=str(plan.id),
                title=plan.title,
                description=plan.description,
                plan_type=plan.plan_type.value,
                target_gender=plan.target_gender.value,
                duration_weeks=plan.duration_weeks,
                difficulty_level=plan.difficulty_level,
                is_premium=plan.is_premium,
                is_active=plan.is_active
            )
            for plan in plans
        ]
    
    async def get_plan_by_id(self, plan_id: UUID) -> Optional[PhysicalPlanDetailResponse]:
        """Get a physical plan by ID with full details."""
        result = await self.db.execute(
            select(PhysicalPlan).where(PhysicalPlan.id == plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            return None
        
        # Parse exercises JSON
        exercises = []
        if plan.exercises:
            try:
                exercises_data = json.loads(plan.exercises)
                for ex in exercises_data:
                    exercises.append(ExerciseItem(**ex))
            except (json.JSONDecodeError, ValueError):
                pass
        
        # Parse schedule JSON
        schedule = None
        if plan.schedule:
            try:
                schedule = json.loads(plan.schedule)
            except json.JSONDecodeError:
                pass
        
        # Parse targets JSON
        targets = None
        if plan.targets:
            try:
                targets = json.loads(plan.targets)
            except json.JSONDecodeError:
                pass
        
        return PhysicalPlanDetailResponse(
            id=str(plan.id),
            title=plan.title,
            description=plan.description,
            plan_type=plan.plan_type.value,
            target_gender=plan.target_gender.value,
            duration_weeks=plan.duration_weeks,
            difficulty_level=plan.difficulty_level,
            is_premium=plan.is_premium,
            exercises=exercises,
            schedule=schedule,
            targets=targets
        )
    
    # ============ Progress Log Operations ============
    
    async def log_progress(
        self,
        user_id: UUID,
        data: PhysicalProgressLogCreate
    ) -> PhysicalProgressLogResponse:
        """Log a physical training session."""
        plan_id = UUID(data.physical_plan_id) if data.physical_plan_id else None
        
        log = PhysicalProgressLog(
            user_id=user_id,
            physical_plan_id=plan_id,
            date=data.date or datetime.utcnow(),
            activity_type=data.activity_type,
            duration_minutes=data.duration_minutes,
            distance_km=data.distance_km,
            pace_min_per_km=data.pace_min_per_km,
            sets_reps=data.sets_reps,
            weight_kg=data.weight_kg,
            performance_rating=data.performance_rating,
            notes=data.notes,
            is_completed=True
        )
        
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        
        return PhysicalProgressLogResponse(
            id=log.id,
            user_id=log.user_id,
            physical_plan_id=log.physical_plan_id,
            date=log.date,
            activity_type=log.activity_type,
            duration_minutes=log.duration_minutes,
            distance_km=log.distance_km,
            pace_min_per_km=log.pace_min_per_km,
            sets_reps=log.sets_reps,
            weight_kg=log.weight_kg,
            performance_rating=log.performance_rating,
            notes=log.notes,
            is_completed=log.is_completed,
            created_at=log.created_at
        )
    
    async def get_user_progress(
        self,
        user_id: UUID,
        activity_type: Optional[str] = None,
        days: int = 30
    ) -> List[PhysicalProgressLogWithPlanResponse]:
        """Get user's progress logs for endurance tracking."""
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = (
            select(PhysicalProgressLog)
            .options(selectinload(PhysicalProgressLog.physical_plan))
            .where(
                and_(
                    PhysicalProgressLog.user_id == user_id,
                    PhysicalProgressLog.date >= start_date,
                    PhysicalProgressLog.is_completed == True
                )
            )
            .order_by(PhysicalProgressLog.date.desc())
        )
        
        if activity_type:
            query = query.where(PhysicalProgressLog.activity_type == activity_type)
        
        result = await self.db.execute(query)
        logs = result.scalars().all()
        
        return [
            PhysicalProgressLogWithPlanResponse(
                id=log.id,
                user_id=log.user_id,
                physical_plan_id=log.physical_plan_id,
                date=log.date,
                activity_type=log.activity_type,
                duration_minutes=log.duration_minutes,
                distance_km=log.distance_km,
                pace_min_per_km=log.pace_min_per_km,
                sets_reps=log.sets_reps,
                weight_kg=log.weight_kg,
                performance_rating=log.performance_rating,
                notes=log.notes,
                is_completed=log.is_completed,
                created_at=log.created_at,
                plan_title=log.physical_plan.title if log.physical_plan else None
            )
            for log in logs
        ]
    
    async def get_endurance_data(
        self,
        user_id: UUID,
        days: int = 30
    ) -> List[EnduranceProgressResponse]:
        """Get endurance tracking data for charts."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        result = await self.db.execute(
            select(PhysicalProgressLog)
            .where(
                and_(
                    PhysicalProgressLog.user_id == user_id,
                    PhysicalProgressLog.activity_type == "running",
                    PhysicalProgressLog.date >= start_date,
                    PhysicalProgressLog.is_completed == True,
                    PhysicalProgressLog.distance_km.isnot(None)
                )
            )
            .order_by(PhysicalProgressLog.date.asc())
        )
        logs = result.scalars().all()
        
        return [
            EnduranceProgressResponse(
                date=log.date.strftime("%Y-%m-%d"),
                distance_km=log.distance_km or 0,
                duration_minutes=log.duration_minutes or 0,
                pace_min_per_km=log.pace_min_per_km or 0
            )
            for log in logs
        ]
    
    async def get_weekly_summary(
        self,
        user_id: UUID,
        weeks: int = 4
    ) -> List[WeeklyProgressSummary]:
        """Get weekly progress summaries."""
        summaries = []
        
        for week in range(weeks):
            week_end = datetime.utcnow() - timedelta(weeks=week)
            week_start = week_end - timedelta(days=7)
            
            result = await self.db.execute(
                select(PhysicalProgressLog)
                .where(
                    and_(
                        PhysicalProgressLog.user_id == user_id,
                        PhysicalProgressLog.activity_type == "running",
                        PhysicalProgressLog.date >= week_start,
                        PhysicalProgressLog.date < week_end,
                        PhysicalProgressLog.is_completed == True
                    )
                )
            )
            logs = result.scalars().all()
            
            total_runs = len(logs)
            total_distance = sum(log.distance_km or 0 for log in logs)
            total_duration = sum(log.duration_minutes or 0 for log in logs)
            avg_pace = (
                total_duration / total_distance if total_distance > 0 else 0
            )
            longest_run = max((log.distance_km or 0 for log in logs), default=0)
            
            summaries.append(WeeklyProgressSummary(
                week_start=week_start.strftime("%Y-%m-%d"),
                total_runs=total_runs,
                total_distance_km=round(total_distance, 2),
                total_duration_minutes=total_duration,
                average_pace=round(avg_pace, 2),
                longest_run_km=round(longest_run, 2)
            ))
        
        return summaries
    
    # ============ Readiness & Requirements ============
    
    async def get_physical_readiness(
        self,
        user_id: UUID
    ) -> PhysicalReadinessResponse:
        """Get overall physical readiness status."""
        # Get user profile
        user_repo = UserRepository(self.db)
        profile = await user_repo.get_profile_by_user_id(user_id)
        
        pst_complete = True
        pet_complete = True
        height_measured = profile.height_cm is not None if profile else False
        chest_measured = None
        weight_measured = profile.weight_kg is not None if profile else False
        
        # Check PST completion (height, chest, weight measured)
        if profile:
            if not profile.height_cm or profile.height_cm == 0:
                pst_complete = False
            if profile.gender == "male":
                chest_measured = True  # We don't store chest measurement yet
                if not chest_measured:
                    pst_complete = False
            if not profile.weight_kg or profile.weight_kg == 0:
                pst_complete = False
        
        # Check PET completion (at least some progress logged)
        result = await self.db.execute(
            select(func.count(PhysicalProgressLog.id))
            .where(
                and_(
                    PhysicalProgressLog.user_id == user_id,
                    PhysicalProgressLog.is_completed == True
                )
            )
        )
        progress_count = result.scalar() or 0
        pet_complete = progress_count > 0
        
        # Calculate overall percentage
        factors = 4 if profile and profile.gender == "male" else 3
        completed = sum([
            height_measured,
            chest_measured if profile and profile.gender == "male" else True,
            weight_measured,
            pet_complete
        ])
        overall_percentage = (completed / factors) * 100 if factors > 0 else 0
        
        return PhysicalReadinessResponse(
            pst_complete=pst_complete,
            pet_complete=pet_complete,
            height_measured=height_measured,
            chest_measured=chest_measured,
            weight_measured=weight_measured,
            overall_percentage=round(overall_percentage, 1)
        )
    
    async def get_pst_requirements(self, gender: str) -> PSTRequirementsResponse:
        """Get PST requirements for a gender."""
        if gender.lower() == "male":
            return PSTRequirementsResponse(
                gender="male",
                height_cm_min=170.0,
                chest_cm_min=80.0,
                chest_expansion_cm=5.0,
                weight_kg_note="Proportionate to height"
            )
        else:
            return PSTRequirementsResponse(
                gender="female",
                height_cm_min=157.0,
                weight_kg_note="Proportionate to height"
            )
    
    async def get_pet_requirements(self, gender: str) -> PETRequirementsResponse:
        """Get PET requirements for a gender."""
        if gender.lower() == "male":
            return PETRequirementsResponse(
                gender="male",
                run_distance_km=1.5,
                run_time_seconds_max=420,  # 7 minutes
                long_jump_m_min=2.65,
                high_jump_m_min=1.20
            )
        else:
            return PETRequirementsResponse(
                gender="female",
                run_distance_km=0.8,
                run_time_seconds_max=240,  # 4 minutes
                long_jump_m_min=2.35,
                high_jump_m_min=1.00
            )
    
    # ============ Mock Physical Test ============
    
    async def calculate_mock_pet(
        self,
        user_id: UUID,
        data: MockPETRequest
    ) -> MockPETResponse:
        """Calculate mock PET results based on user's input."""
        # Get user gender
        user_repo = UserRepository(self.db)
        profile = await user_repo.get_profile_by_user_id(user_id)
        gender = profile.gender if profile and profile.gender else "male"
        
        stations = []
        recommendations = []
        passed_count = 0
        total_stations = 5 if gender.lower() == "male" else 4
        
        # Get requirements
        pst_req = await self.get_pst_requirements(gender)
        pet_req = await self.get_pet_requirements(gender)
        
        # Height check
        if data.height_cm is not None:
            height_passed = data.height_cm >= pst_req.height_cm_min
            stations.append(MockPETStation(
                station_name="Height",
                requirement=f"Minimum {pst_req.height_cm_min} cm",
                unit="cm",
                passing_standard=f"{pst_req.height_cm_min} cm",
                user_value=data.height_cm,
                passed=height_passed
            ))
            if not height_passed:
                recommendations.append(f"Height training: Focus on stretching exercises. Target: reach {pst_req.height_cm_min} cm minimum.")
            passed_count += 1 if height_passed else 0
        
        # Chest check (Male only)
        if gender.lower() == "male" and data.chest_cm is not None:
            chest_passed = data.chest_cm >= pst_req.chest_cm_min
            stations.append(MockPETStation(
                station_name="Chest (Unexpanded)",
                requirement=f"Minimum {pst_req.chest_cm_min} cm",
                unit="cm",
                passing_standard=f"{pst_req.chest_cm_min} cm",
                user_value=data.chest_cm,
                passed=chest_passed
            ))
            if not chest_passed:
                recommendations.append(f"Chest exercises: Focus on push-ups and deep breathing exercises to expand chest capacity.")
            passed_count += 1 if chest_passed else 0
        
        # Weight check
        if data.weight_kg is not None:
            # Simple weight check - proportionate (no strict standard)
            stations.append(MockPETStation(
                station_name="Weight",
                requirement="Proportionate to height",
                unit="kg",
                passing_standard="Within healthy BMI range",
                user_value=data.weight_kg,
                passed=True  # No strict passing criteria
            ))
            passed_count += 1
        
        # Run check
        if data.run_time_seconds is not None and data.run_time_seconds > 0:
            if gender.lower() == "male":
                run_passed = data.run_time_seconds <= pet_req.run_time_seconds_max
                stations.append(MockPETStation(
                    station_name="1.5km Run",
                    requirement=f"Complete in {pet_req.run_time_seconds_max // 60} minutes",
                    unit="seconds",
                    passing_standard=f"≤ {pet_req.run_time_seconds_max} seconds",
                    user_value=data.run_time_seconds,
                    passed=run_passed
                ))
                if not run_passed:
                    recommendations.append(f"Running training: Follow the 5K running plan to improve your 1.5km time to under {pet_req.run_time_seconds_max // 60} minutes.")
                passed_count += 1 if run_passed else 0
            else:
                run_passed = data.run_time_seconds <= pet_req.run_time_seconds_max
                stations.append(MockPETStation(
                    station_name="800m Run",
                    requirement=f"Complete in {pet_req.run_time_seconds_max // 60} minutes",
                    unit="seconds",
                    passing_standard=f"≤ {pet_req.run_time_seconds_max} seconds",
                    user_value=data.run_time_seconds,
                    passed=run_passed
                ))
                if not run_passed:
                    recommendations.append(f"Running training: Follow the 800m running plan to improve your time to under {pet_req.run_time_seconds_max // 60} minutes.")
                passed_count += 1 if run_passed else 0
        
        # Long Jump check
        if data.long_jump_m is not None:
            long_jump_passed = data.long_jump_m >= pet_req.long_jump_m_min
            stations.append(MockPETStation(
                station_name="Long Jump",
                requirement=f"Minimum {pet_req.long_jump_m_min} m",
                unit="meters",
                passing_standard=f"≥ {pet_req.long_jump_m_min} m",
                user_value=data.long_jump_m,
                passed=long_jump_passed
            ))
            if not long_jump_passed:
                recommendations.append(f"Long jump training: Focus on explosive power exercises like squats and plyometrics. Target: {pet_req.long_jump_m_min} m.")
            passed_count += 1 if long_jump_passed else 0
        
        # High Jump check
        if data.high_jump_m is not None:
            high_jump_passed = data.high_jump_m >= pet_req.high_jump_m_min
            stations.append(MockPETStation(
                station_name="High Jump",
                requirement=f"Minimum {pet_req.high_jump_m_min} m",
                unit="meters",
                passing_standard=f"≥ {pet_req.high_jump_m_min} m",
                user_value=data.high_jump_m,
                passed=high_jump_passed
            ))
            if not high_jump_passed:
                recommendations.append(f"High jump training: Focus on box jumps and flexibility exercises. Target: {pet_req.high_jump_m_min} m.")
            passed_count += 1 if high_jump_passed else 0
        
        # Calculate score
        score = (passed_count / total_stations) * 100 if total_stations > 0 else 0
        overall_passed = passed_count == total_stations
        
        return MockPETResponse(
            overall_passed=overall_passed,
            score=round(score, 1),
            stations=stations,
            recommendations=recommendations
        )
