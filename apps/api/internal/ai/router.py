"""
Router for AI advanced features endpoints.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..database import get_db
from ..auth.dependencies import get_current_user
from ..auth.schemas import TokenData
from ..notifications.service import NotificationService
from .service import AIService
from .schemas import (
    AIMockAnalysisRequest,
    AIMockAnalysisResponse,
    RevisionPlanResponse,
    SM2ReviewRequest,
    SM2ReviewResponse,
    FullRevisionScheduleResponse,
    HabitNudgeGenerateRequest,
    HabitNudgeMarkReadRequest,
    HabitNudgesListResponse,
    DoubtAssistantQueryRequest,
    DoubtAssistantQueryResponse,
    DoubtAssistantFeedbackRequest,
    DailySummaryResponse,
    AISuccessResponse,
)


router = APIRouter(prefix="/ai", tags=["ai"])


def get_notification_service(
    db: AsyncSession = Depends(get_db)
) -> NotificationService:
    """Dependency to get notification service."""
    return NotificationService(db)


def get_ai_service(
    db: AsyncSession = Depends(get_db),
    notification_service: NotificationService = Depends(get_notification_service)
) -> AIService:
    """Dependency to get AI service."""
    service = AIService(db, notification_service)
    service._set_notification_service(notification_service)
    return service


# ========================================================================
# AI Mock Analysis Endpoints
# ========================================================================

@router.post("/mock-analysis", response_model=AIMockAnalysisResponse)
async def generate_mock_analysis(
    request: AIMockAnalysisRequest,
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Generate AI-powered analysis summary for a mock test attempt.
    
    Returns detailed performance analysis with improvement tips per topic.
    """
    try:
        return await service.generate_mock_analysis(
            user_id=UUID(current_user.user_id),
            request=request
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ========================================================================
# AI Revision Planner (SM-2 Spaced Repetition) Endpoints
# ========================================================================

@router.get("/revision-plan", response_model=RevisionPlanResponse)
async def get_revision_plan(
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Get AI-powered revision plan with spaced repetition schedule.
    
    Returns topics due for revision, prioritized by the SM-2 algorithm.
    """
    return await service.get_revision_plan(UUID(current_user.user_id))


@router.post("/revision-review", response_model=SM2ReviewResponse)
async def submit_revision_review(
    request: SM2ReviewRequest,
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Submit a revision review result for SM-2 algorithm.
    
    The quality rating (0-5) determines the next review interval:
    - 0-2: Failed recall, reset repetitions
    - 3-5: Successful recall, increase interval
    
    Returns updated spaced repetition parameters.
    """
    return await service.submit_review(
        user_id=UUID(current_user.user_id),
        request=request
    )


@router.get("/revision-schedule", response_model=FullRevisionScheduleResponse)
async def get_revision_schedule(
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Get full revision schedule for the next 7 days.
    
    Shows which topics to review each day based on spaced repetition.
    """
    return await service.get_full_revision_schedule(UUID(current_user.user_id))


# ========================================================================
# AI Habit Nudges Endpoints
# ========================================================================

@router.get("/nudge", response_model=HabitNudgesListResponse)
async def get_recent_nudges(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Get recent habit nudges for the current user."""
    return await service.get_recent_nudges(
        user_id=UUID(current_user.user_id),
        limit=limit
    )


@router.post("/nudge/generate")
async def generate_habit_nudge(
    request: Optional[HabitNudgeGenerateRequest] = Body(default=None),
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Generate a personalized habit nudge.
    
    If no nudge type is specified, the system determines the best type
    based on user context (streak, activity, upcoming exams, etc.).
    """
    return await service.generate_habit_nudge(
        user_id=UUID(current_user.user_id),
        request=request
    )


@router.post("/nudge/mark-read", response_model=AISuccessResponse)
async def mark_nudge_read(
    request: HabitNudgeMarkReadRequest,
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Mark a nudge as read (and optionally clicked)."""
    return await service.mark_nudge_read(
        user_id=UUID(current_user.user_id),
        request=request
    )


# ========================================================================
# AI Doubt Assistant Endpoints
# ========================================================================

@router.post("/doubt/query", response_model=DoubtAssistantQueryResponse)
async def query_doubt_assistant(
    request: DoubtAssistantQueryRequest,
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Query the AI doubt assistant.
    
    Searches the knowledge base for answers to SSC GD related questions.
    Returns the best match with confidence score and suggestions.
    """
    return await service.query_doubt_assistant(
        user_id=UUID(current_user.user_id),
        request=request
    )


@router.post("/doubt/feedback", response_model=AISuccessResponse)
async def submit_doubt_feedback(
    request: DoubtAssistantFeedbackRequest,
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Submit feedback on a doubt assistant answer.
    
    Helps improve the knowledge base over time.
    """
    return await service.submit_doubt_feedback(
        user_id=UUID(current_user.user_id),
        request=request
    )


# ========================================================================
# Daily Summary Endpoints
# ========================================================================

@router.get("/daily-summary", response_model=DailySummaryResponse)
async def get_daily_summary(
    current_user: TokenData = Depends(get_current_user),
    service: AIService = Depends(get_ai_service)
):
    """Get today's daily summary.
    
    Includes tasks, progress stats, weak topics, and a motivational quote.
    A new summary is generated if one doesn't exist for today.
    """
    return await service.get_daily_summary(UUID(current_user.user_id))
