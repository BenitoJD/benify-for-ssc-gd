"""
Router for gamification API endpoints.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..auth.dependencies import get_current_user
from ..auth.schemas import TokenData
from .service import GamificationService
from .schemas import (
    BadgeResponse, UserBadgesResponse,
    UserAchievementsResponse,
    StreakStatsResponse, StreakFreezeResponse,
    PomodoroStartRequest, PomodoroStartResponse,
    PomodoroCompleteResponse, PomodoroCancelRequest, PomodoroCancelResponse,
    PomodoroActiveResponse, PomodoroStatsResponse,
    DailyMissionCompleteRequest, DailyMissionCompleteResponse,
    GamificationDashboardResponse
)

router = APIRouter(prefix="/gamification", tags=["gamification"])


def get_gamification_service(
    db: AsyncSession = Depends(get_db)
) -> GamificationService:
    """Dependency to get gamification service."""
    return GamificationService(db)


@router.get("/dashboard", response_model=GamificationDashboardResponse)
async def get_gamification_dashboard(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get complete gamification dashboard for the current user."""
    return await service.get_dashboard(UUID(current_user.user_id))


# ========================================================================
# Badge Endpoints
# ========================================================================

@router.get("/badges", response_model=UserBadgesResponse)
async def get_user_badges(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get all badges earned by the current user."""
    return await service.get_user_badges(UUID(current_user.user_id))


@router.get("/badges/all", response_model=list[BadgeResponse])
async def get_all_badges(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get all available badges."""
    return await service.get_all_badges()


# ========================================================================
# Achievement Endpoints
# ========================================================================

@router.get("/achievements", response_model=UserAchievementsResponse)
async def get_user_achievements(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get all achievements unlocked by the current user."""
    return await service.get_user_achievements(UUID(current_user.user_id))


# ========================================================================
# Streak Endpoints
# ========================================================================

@router.get("/streaks/me", response_model=StreakStatsResponse)
async def get_my_streak(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get streak statistics for the current user."""
    return await service.get_streak_stats(UUID(current_user.user_id))


@router.post("/streaks/freeze", response_model=StreakFreezeResponse)
async def use_streak_freeze(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Use a streak freeze to preserve streak for a missed day.
    
    One free freeze is available per week.
    """
    success = await service.use_streak_freeze(UUID(current_user.user_id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Streak freeze not available. You can only use one per week."
        )
    
    # Return the freeze record (we need to get it from repo)
    # For now return a simple success response
    return {
        "success": True,
        "message": "Streak freeze used successfully"
    }


# ========================================================================
# Pomodoro Endpoints
# ========================================================================

@router.post("/pomodoro/start", response_model=PomodoroStartResponse)
async def start_pomodoro(
    request: PomodoroStartRequest,
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Start a new Pomodoro study session.
    
    Default duration is 25 minutes.
    """
    return await service.start_pomodoro(
        user_id=UUID(current_user.user_id),
        duration_minutes=request.duration_minutes,
        study_type=request.study_type,
        study_reference_id=request.study_reference_id
    )


@router.post("/pomodoro/complete", response_model=PomodoroCompleteResponse)
async def complete_pomodoro(
    session_id: UUID = Query(..., description="The Pomodoro session ID to complete"),
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Complete a Pomodoro session and record focus time."""
    try:
        return await service.complete_pomodoro(UUID(current_user.user_id), session_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/pomodoro/cancel", response_model=PomodoroCancelResponse)
async def cancel_pomodoro(
    request: PomodoroCancelRequest,
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Cancel an active Pomodoro session."""
    try:
        return await service.cancel_pomodoro(UUID(current_user.user_id), request.session_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/pomodoro/active", response_model=PomodoroActiveResponse)
async def get_active_pomodoro(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get the current active Pomodoro session if any."""
    return await service.get_active_pomodoro(UUID(current_user.user_id))


@router.get("/pomodoro/stats", response_model=PomodoroStatsResponse)
async def get_pomodoro_stats(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get Pomodoro statistics for the current user."""
    return await service.get_pomodoro_stats(UUID(current_user.user_id))


# ========================================================================
# Daily Mission Endpoints
# ========================================================================

@router.get("/missions/today")
async def get_today_missions(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Get today's daily missions for the current user.
    
    Missions are randomly assigned and generated if none exist for today.
    """
    return await service.get_or_generate_daily_missions(UUID(current_user.user_id))


@router.post("/missions/complete", response_model=DailyMissionCompleteResponse)
async def complete_mission(
    request: DailyMissionCompleteRequest,
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Mark a daily mission as complete and earn bonus streak points."""
    try:
        return await service.complete_mission(UUID(current_user.user_id), request.mission_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ========================================================================
# Activity Recording Endpoints
# ========================================================================

@router.post("/activity/record")
async def record_activity(
    current_user: TokenData = Depends(get_current_user),
    service: GamificationService = Depends(get_gamification_service)
):
    """Record a learning activity to update streak.
    
    This should be called when a user completes a learning activity
    (lesson, test, etc.) to increment their streak.
    """
    return await service.record_activity(UUID(current_user.user_id))


# ========================================================================
# Badge Awarding Endpoints (for internal/system use)
# ========================================================================

@router.post("/badges/award/first-accepted-answer")
async def award_first_accepted_answer_badge(
    user_id: UUID = Query(..., description="User ID to award badge to"),
    service: GamificationService = Depends(get_gamification_service)
):
    """Award 'First Accepted Answer' badge to a user.
    
    This should be called when a user's reply is marked as accepted.
    """
    badge = await service.award_first_accepted_answer_badge(user_id)
    if badge is None:
        return {"message": "Badge already earned or not available"}
    return {"message": "Badge awarded successfully", "badge_id": str(badge.id)}


@router.post("/badges/award/first-mock")
async def award_first_mock_badge(
    user_id: UUID = Query(..., description="User ID to award badge to"),
    service: GamificationService = Depends(get_gamification_service)
):
    """Award 'First Mock' badge to a user.
    
    This should be called when a user completes their first mock test.
    """
    badge = await service.award_first_mock_badge(user_id)
    if badge is None:
        return {"message": "Badge already earned or not available"}
    return {"message": "Badge awarded successfully", "badge_id": str(badge.id)}


@router.post("/badges/award/first-lesson")
async def award_first_lesson_badge(
    user_id: UUID = Query(..., description="User ID to award badge to"),
    service: GamificationService = Depends(get_gamification_service)
):
    """Award 'First Lesson' badge to a user.
    
    This should be called when a user completes their first lesson.
    """
    badge = await service.award_first_lesson_badge(user_id)
    if badge is None:
        return {"message": "Badge already earned or not available"}
    return {"message": "Badge awarded successfully", "badge_id": str(badge.id)}
