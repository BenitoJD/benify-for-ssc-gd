"""
Router for study plans API endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user
from .schemas import (
    StudyPlanCreate,
    StudyPlanResponse,
    TaskUpdate,
    TaskResponse,
    TodayTasksResponse,
    WeeklyGoalsResponse,
    BacklogRecoveryResponse,
    RevisionPlanResponse,
)
from .service import StudyPlanService
from ..shared.exceptions import UnauthorizedException, NotFoundException


router = APIRouter(prefix="/study-plans", tags=["Study Plans"])


def get_study_plan_service(db: AsyncSession = Depends(get_db)) -> StudyPlanService:
    """Dependency to get study plan service."""
    return StudyPlanService(db)


@router.post("/generate", response_model=StudyPlanResponse)
async def generate_study_plan(
    plan_data: StudyPlanCreate,
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Generate an AI-powered personalized study plan.
    
    Creates a new study plan based on:
    - User's exam date (if provided)
    - User's current level (from profile)
    - Weak areas identified from performance analytics
    - Spaced repetition scheduling for revision
    
    Returns the generated study plan with daily tasks.
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.generate_study_plan(
        user_id=UUID(current_user.user_id),
        plan_data=plan_data,
    )


@router.get("/me", response_model=StudyPlanResponse)
async def get_my_study_plan(
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get the current user's active study plan.
    
    Returns the active study plan with all tasks if exists.
    """
    if not current_user:
        raise UnauthorizedException()
    
    plan = await service.get_user_study_plan(UUID(current_user.user_id))
    if not plan:
        raise NotFoundException("Study plan not found. Generate a new plan first.")
    
    return plan


@router.get("/me/today", response_model=TodayTasksResponse)
async def get_today_tasks(
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get today's study tasks.
    
    Returns tasks scheduled for today along with:
    - Total/completed/pending task counts
    - Current streak information
    - Motivational message if all tasks completed
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.get_today_tasks(UUID(current_user.user_id))


@router.get("/me/weekly", response_model=WeeklyGoalsResponse)
async def get_weekly_goals(
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get weekly goals with progress tracking.
    
    Returns the current week's daily goals with completion percentages.
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.get_weekly_goals(UUID(current_user.user_id))


@router.get("/me/backlog", response_model=BacklogRecoveryResponse)
async def get_backlog_recovery(
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get backlog recovery - reschedule missed tasks.
    
    Identifies all missed/overdue tasks and reschedules them
    with increased priority to ensure completion.
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.get_backlog_recovery(UUID(current_user.user_id))


@router.get("/me/revision-plan", response_model=RevisionPlanResponse)
async def get_revision_plan(
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get AI-powered spaced repetition revision plan.
    
    Returns topics that need revision based on spaced repetition
    algorithm (SM-2), ordered by priority and next review date.
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.get_revision_plan(UUID(current_user.user_id))


@router.get("/me/streaks")
async def get_streaks(
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get user's streak information.
    
    Returns:
    - Current streak count
    - Longest streak achieved
    - Last activity date
    - Available/used streak freezes
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.get_user_streaks(UUID(current_user.user_id))


@router.get("/{plan_id}", response_model=StudyPlanResponse)
async def get_study_plan(
    plan_id: UUID,
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Get a specific study plan by ID.
    
    Returns the full study plan with all tasks.
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.get_study_plan_by_id(
        plan_id=plan_id,
        user_id=UUID(current_user.user_id),
    )


@router.put("/{plan_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    plan_id: UUID,
    task_id: UUID,
    update_data: TaskUpdate,
    current_user = Depends(get_current_user),
    service: StudyPlanService = Depends(get_study_plan_service),
):
    """Update a task's status.
    
    Allows updating task status to:
    - completed: Marks task as done, updates streak
    - skipped: Skips the task
    - missed: Marks task as missed (triggers backlog recovery)
    
    When a task is completed:
    - If it's a revision task, spaced repetition is updated
    - Streak is incremented
    - Plan completion percentage is updated
    """
    if not current_user:
        raise UnauthorizedException()
    
    return await service.update_task_status(
        plan_id=plan_id,
        task_id=task_id,
        user_id=UUID(current_user.user_id),
        update_data=update_data,
    )
