"""
Service layer for gamification business logic.
"""
from typing import List, Optional, Tuple
from uuid import UUID
from datetime import datetime
import random

from sqlalchemy.ext.asyncio import AsyncSession

from .models import (
    BadgeType, AchievementType,
    MissionType, MissionStatus,
    DailyMission, UserBadge, UserAchievement
)
from .repository import GamificationRepository
from .schemas import (
    BadgeResponse, UserBadgeResponse, UserBadgesResponse,
    AchievementResponse, UserAchievementResponse, UserAchievementsResponse,
    StreakStatsResponse, PomodoroStartResponse, PomodoroCompleteResponse,
    PomodoroCancelResponse, PomodoroSessionResponse, PomodoroActiveResponse,
    PomodoroStatsResponse, DailyMissionResponse, DailyMissionsResponse,
    DailyMissionCompleteResponse, GamificationDashboardResponse
)
from ..notifications.service import NotificationService


class GamificationService:
    """Service for gamification operations."""
    
    def __init__(self, db: AsyncSession, notification_service: NotificationService = None):
        self.repo = GamificationRepository(db)
        self.notification_service = notification_service
    
    def _set_notification_service(self, notification_service: NotificationService):
        """Set notification service if not injected."""
        if self.notification_service is None:
            self.notification_service = notification_service
    
    # ========================================================================
    # Badge Operations
    # ========================================================================
    
    async def get_all_badges(self) -> List[BadgeResponse]:
        """Get all active badges."""
        badges = await self.repo.get_all_active_badges()
        return [BadgeResponse.model_validate(b) for b in badges]
    
    async def get_user_badges(
        self, user_id: UUID
    ) -> UserBadgesResponse:
        """Get all badges earned by a user."""
        user_badges = await self.repo.get_user_badges(user_id)
        total_count = await self.repo.count_user_badges(user_id)
        
        return UserBadgesResponse(
            badges=[
                UserBadgeResponse(
                    id=ub.id,
                    badge_id=ub.badge_id,
                    earned_at=ub.earned_at,
                    badge=BadgeResponse.model_validate(ub.badge)
                )
                for ub in user_badges
            ],
            total_count=total_count
        )
    
    async def check_and_award_badge(
        self, user_id: UUID, badge_type: BadgeType
    ) -> Optional[UserBadge]:
        """Check if user qualifies for a badge and award it if not already earned."""
        # Check if user already has this badge
        existing = await self.repo.get_user_badge_by_type(user_id, badge_type)
        if existing:
            return None
        
        # Get the badge definition
        badge = await self.repo.get_badge_by_type(badge_type)
        if badge is None or not badge.is_active:
            return None
        
        # Award the badge
        user_badge = await self.repo.create_user_badge(user_id, badge.id)
        await self.repo.increment_badges_count(user_id)
        
        # Send notification
        if self.notification_service:
            await self.notification_service.notify_badge_earned(
                user_id=user_id,
                badge_name=badge.name,
                badge_id=badge.id
            )
        
        return user_badge
    
    async def award_first_accepted_answer_badge(
        self, user_id: UUID
    ) -> Optional[UserBadge]:
        """Award badge when user gets their first accepted answer."""
        return await self.check_and_award_badge(user_id, BadgeType.FIRST_ACCEPTED_ANSWER)
    
    async def award_week_warrior_badge(
        self, user_id: UUID
    ) -> Optional[UserBadge]:
        """Award badge when user reaches 7-day streak."""
        return await self.check_and_award_badge(user_id, BadgeType.WEEK_WARRIOR)
    
    async def award_month_master_badge(
        self, user_id: UUID
    ) -> Optional[UserBadge]:
        """Award badge when user reaches 30-day streak."""
        return await self.check_and_award_badge(user_id, BadgeType.MONTH_MASTER)
    
    async def award_first_mock_badge(
        self, user_id: UUID
    ) -> Optional[UserBadge]:
        """Award badge when user completes their first mock test."""
        return await self.check_and_award_badge(user_id, BadgeType.FIRST_MOCK)
    
    async def award_first_lesson_badge(
        self, user_id: UUID
    ) -> Optional[UserBadge]:
        """Award badge when user completes their first lesson."""
        return await self.check_and_award_badge(user_id, BadgeType.FIRST_LESSON)
    
    async def award_streak_badges(
        self, user_id: UUID, current_streak: int
    ) -> List[UserBadge]:
        """Award appropriate streak badges based on current streak."""
        awarded = []
        
        # 3-day streak badge
        if current_streak >= 3:
            badge = await self.check_and_award_badge(user_id, BadgeType.STREAK_3_DAYS)
            if badge:
                awarded.append(badge)
        
        # 7-day streak badge (Week Warrior)
        if current_streak >= 7:
            badge = await self.check_and_award_badge(user_id, BadgeType.WEEK_WARRIOR)
            if badge:
                awarded.append(badge)
        
        # 30-day streak badge (Month Master)
        if current_streak >= 30:
            badge = await self.check_and_award_badge(user_id, BadgeType.MONTH_MASTER)
            if badge:
                awarded.append(badge)
        
        return awarded
    
    # ========================================================================
    # Achievement Operations
    # ========================================================================
    
    async def get_user_achievements(
        self, user_id: UUID
    ) -> UserAchievementsResponse:
        """Get all achievements unlocked by a user."""
        user_achievements = await self.repo.get_user_achievements(user_id)
        total_count = await self.repo.count_user_achievements(user_id)
        
        return UserAchievementsResponse(
            achievements=[
                UserAchievementResponse(
                    id=ua.id,
                    achievement_id=ua.achievement_id,
                    unlocked_at=ua.unlocked_at,
                    achievement=AchievementResponse.model_validate(ua.achievement)
                )
                for ua in user_achievements
            ],
            total_count=total_count
        )
    
    async def check_and_unlock_achievement(
        self, user_id: UUID, achievement_type: AchievementType
    ) -> Optional[UserAchievement]:
        """Check if user qualifies for an achievement and unlock it."""
        # Check if user already has this achievement
        existing = await self.repo.get_user_achievement_by_type(user_id, achievement_type)
        if existing:
            return None
        
        # Get the achievement definition
        achievement = await self.repo.get_achievement_by_type(achievement_type)
        if achievement is None or not achievement.is_active:
            return None
        
        # Unlock the achievement
        user_achievement = await self.repo.create_user_achievement(user_id, achievement.id)
        await self.repo.increment_achievements_count(user_id)
        
        # Send notification
        if self.notification_service:
            await self.notification_service.notify_badge_earned(
                user_id=user_id,
                badge_name=achievement.name,
                badge_id=achievement.id
            )
        
        return user_achievement
    
    async def check_focus_time_achievements(
        self, user_id: UUID, total_hours: float
    ) -> List[UserAchievement]:
        """Check and unlock focus time achievements."""
        unlocked = []
        
        if total_hours >= 10:
            achievement = await self.check_and_unlock_achievement(
                user_id, AchievementType.FOCUS_10H
            )
            if achievement:
                unlocked.append(achievement)
        
        if total_hours >= 50:
            achievement = await self.check_and_unlock_achievement(
                user_id, AchievementType.FOCUS_50H
            )
            if achievement:
                unlocked.append(achievement)
        
        if total_hours >= 100:
            achievement = await self.check_and_unlock_achievement(
                user_id, AchievementType.FOCUS_100H
            )
            if achievement:
                unlocked.append(achievement)
        
        return unlocked
    
    # ========================================================================
    # Streak Operations
    # ========================================================================
    
    async def get_streak_stats(self, user_id: UUID) -> StreakStatsResponse:
        """Get streak statistics for a user."""
        stats = await self.repo.get_or_create_gamification_stats(user_id)
        freeze_available = await self.repo.is_streak_freeze_available(user_id)
        
        return StreakStatsResponse(
            current_streak=stats.current_streak,
            longest_streak=stats.longest_streak,
            last_activity_date=stats.last_activity_date,
            streak_freezes_available=1 if freeze_available else 0,
            streak_freezes_used_this_week=stats.streak_freezes_used_this_week,
            total_focus_minutes=stats.total_focus_minutes,
            total_pomodoro_sessions=stats.total_pomodoro_sessions
        )
    
    async def record_activity(self, user_id: UUID) -> Tuple[StreakStatsResponse, List[UserBadge]]:
        """Record a learning activity and update streak.
        
        Returns tuple of (updated streak stats, new badges earned)
        """
        # Update streak
        stats, streak_updated = await self.repo.update_streak_on_activity(user_id)
        
        new_badges = []
        
        # Check streak badges if streak was updated
        if streak_updated:
            streak_badges = await self.award_streak_badges(
                user_id, stats.current_streak
            )
            new_badges.extend(streak_badges)
        
        # Get freeze availability
        freeze_available = await self.repo.is_streak_freeze_available(user_id)
        
        return StreakStatsResponse(
            current_streak=stats.current_streak,
            longest_streak=stats.longest_streak,
            last_activity_date=stats.last_activity_date,
            streak_freezes_available=1 if freeze_available else 0,
            streak_freezes_used_this_week=stats.streak_freezes_used_this_week,
            total_focus_minutes=stats.total_focus_minutes,
            total_pomodoro_sessions=stats.total_pomodoro_sessions
        ), new_badges
    
    async def use_streak_freeze(self, user_id: UUID) -> bool:
        """Use a streak freeze for the current week.
        
        Returns True if successful, False if already used.
        """
        freeze = await self.repo.use_streak_freeze(user_id)
        return freeze is not None
    
    # ========================================================================
    # Pomodoro Operations
    # ========================================================================
    
    async def start_pomodoro(
        self,
        user_id: UUID,
        duration_minutes: int = 25,
        study_type: Optional[str] = None,
        study_reference_id: Optional[UUID] = None
    ) -> PomodoroStartResponse:
        """Start a new Pomodoro session."""
        # Check if user already has an active session
        active = await self.repo.get_active_pomodoro_session(user_id)
        if active:
            # Cancel the existing session
            await self.repo.cancel_pomodoro_session(active.id, user_id)
        
        # Create new session
        session = await self.repo.create_pomodoro_session(
            user_id=user_id,
            duration_minutes=duration_minutes,
            study_type=study_type,
            study_reference_id=study_reference_id
        )
        
        return PomodoroStartResponse(
            session_id=session.id,
            started_at=session.started_at,
            duration_minutes=session.duration_minutes,
            status=session.status
        )
    
    async def complete_pomodoro(
        self, user_id: UUID, session_id: UUID
    ) -> PomodoroCompleteResponse:
        """Complete a Pomodoro session."""
        # Complete the session
        session = await self.repo.complete_pomodoro_session(session_id, user_id)
        if session is None:
            raise ValueError("Pomodoro session not found")
        
        # Add focus minutes to stats
        stats = await self.repo.add_focus_minutes(user_id, session.focus_minutes)
        
        # Record activity to update streak
        streak_stats, badges_earned = await self.record_activity(user_id)
        
        # Check focus time achievements
        achievements_unlocked = await self.check_focus_time_achievements(
            user_id, stats.total_pomodoro_hours
        )
        
        # Get badge/achievement details
        badge_responses = []
        for badge in badges_earned:
            badge_def = await self.repo.get_badge_by_type(
                BadgeType(badge.badge.badge_type.value)
            )
            if badge_def:
                badge_responses.append(BadgeResponse.model_validate(badge_def))
        
        achievement_responses = [
            AchievementResponse.model_validate(a.achievement)
            for a in achievements_unlocked
        ]
        
        return PomodoroCompleteResponse(
            session_id=session.id,
            completed_at=session.completed_at,
            focus_minutes=session.focus_minutes,
            status=session.status,
            new_total_focus_minutes=stats.total_focus_minutes,
            new_total_focus_hours=stats.total_pomodoro_hours,
            badges_earned=badge_responses,
            achievements_unlocked=achievement_responses
        )
    
    async def cancel_pomodoro(
        self, user_id: UUID, session_id: UUID
    ) -> PomodoroCancelResponse:
        """Cancel a Pomodoro session."""
        session = await self.repo.cancel_pomodoro_session(session_id, user_id)
        if session is None:
            raise ValueError("Pomodoro session not found")
        
        return PomodoroCancelResponse(
            session_id=session.id,
            cancelled_at=session.completed_at,
            status=session.status,
            partial_focus_minutes=session.focus_minutes
        )
    
    async def get_active_pomodoro(self, user_id: UUID) -> PomodoroActiveResponse:
        """Get the current active Pomodoro session for a user."""
        session = await self.repo.get_active_pomodoro_session(user_id)
        
        if session is None:
            return PomodoroActiveResponse(has_active_session=False, session=None)
        
        return PomodoroActiveResponse(
            has_active_session=True,
            session=PomodoroSessionResponse(
                id=session.id,
                duration_minutes=session.duration_minutes,
                status=session.status,
                started_at=session.started_at,
                completed_at=session.completed_at,
                focus_minutes=session.focus_minutes,
                study_type=session.study_type,
                study_reference_id=session.study_reference_id
            )
        )
    
    async def get_pomodoro_stats(self, user_id: UUID) -> PomodoroStatsResponse:
        """Get Pomodoro statistics for a user."""
        stats = await self.repo.get_or_create_gamification_stats(user_id)
        sessions_today, minutes_today = await self.repo.get_today_pomodoro_stats(user_id)
        
        return PomodoroStatsResponse(
            total_sessions=stats.total_pomodoro_sessions,
            total_focus_minutes=stats.total_focus_minutes,
            total_focus_hours=stats.total_pomodoro_hours,
            sessions_today=sessions_today,
            focus_minutes_today=minutes_today,
            current_streak=stats.current_streak
        )
    
    # ========================================================================
    # Daily Mission Operations
    # ========================================================================
    
    async def get_or_generate_daily_missions(
        self, user_id: UUID
    ) -> DailyMissionsResponse:
        """Get today's daily missions, generating if needed."""
        today = datetime.utcnow()
        missions = await self.repo.get_daily_missions(user_id, today)
        
        # Generate missions if none exist for today
        if not missions:
            missions = await self._generate_daily_missions(user_id, today)
        
        completed_count = sum(
            1 for m in missions if m.status == MissionStatus.COMPLETED
        )
        bonus_points_available = sum(
            m.bonus_streak_points
            for m in missions
            if m.status == MissionStatus.PENDING
        )
        
        return DailyMissionsResponse(
            missions=[DailyMissionResponse.model_validate(m) for m in missions],
            total_count=len(missions),
            completed_count=completed_count,
            bonus_streak_points_available=bonus_points_available
        )
    
    async def _generate_daily_missions(
        self, user_id: UUID, date: datetime
    ) -> List[DailyMission]:
        """Generate 3 random daily missions for a user."""
        mission_templates = [
            {
                "type": MissionType.LESSON,
                "title": "Complete a lesson",
                "description": "Watch and complete any lesson from your syllabus",
                "target": 1,
                "bonus": 1
            },
            {
                "type": MissionType.LESSON,
                "title": "Complete 3 lessons",
                "description": "Watch and complete three lessons from your syllabus",
                "target": 3,
                "bonus": 2
            },
            {
                "type": MissionType.TEST,
                "title": "Take a practice test",
                "description": "Complete any practice test or quiz",
                "target": 1,
                "bonus": 2
            },
            {
                "type": MissionType.REVISION,
                "title": "Revise weak topics",
                "description": "Review topics where you scored below 60%",
                "target": 1,
                "bonus": 1
            },
            {
                "type": MissionType.PHYSICAL,
                "title": "Physical training",
                "description": "Complete a physical training session",
                "target": 1,
                "bonus": 1
            },
            {
                "type": MissionType.COMMUNITY,
                "title": "Help a fellow student",
                "description": "Post an answer or reply to a doubt in the community",
                "target": 1,
                "bonus": 1
            },
            {
                "type": MissionType.POMODORO,
                "title": "Focus session",
                "description": "Complete a 25-minute Pomodoro study session",
                "target": 1,
                "bonus": 1
            },
        ]
        
        # Select 3 random missions
        selected_templates = random.sample(mission_templates, min(3, len(mission_templates)))
        
        missions = []
        for template in selected_templates:
            mission = await self.repo.create_daily_mission(
                user_id=user_id,
                mission_type=template["type"],
                title=template["title"],
                description=template["description"],
                target_value=template["target"],
                reference_id=None,
                bonus_streak_points=template["bonus"],
                date=date
            )
            missions.append(mission)
        
        return missions
    
    async def complete_mission(
        self, user_id: UUID, mission_id: UUID
    ) -> DailyMissionCompleteResponse:
        """Complete a daily mission and award bonus streak points."""
        # Complete the mission
        mission = await self.repo.complete_daily_mission(mission_id, user_id)
        if mission is None:
            raise ValueError("Daily mission not found")
        if mission.status != MissionStatus.COMPLETED:
            raise ValueError("Mission was not in pending state")
        
        # Award bonus streak points
        bonus_points = mission.bonus_streak_points
        stats, _ = await self.repo.update_streak_on_activity(user_id, bonus_points)
        
        return DailyMissionCompleteResponse(
            mission=DailyMissionCompleteResponse.model_validate(mission),
            bonus_streak_points_earned=bonus_points,
            new_current_streak=stats.current_streak
        )
    
    # ========================================================================
    # Dashboard
    # ========================================================================
    
    async def get_dashboard(self, user_id: UUID) -> GamificationDashboardResponse:
        """Get combined gamification dashboard data."""
        streak = await self.get_streak_stats(user_id)
        pomodoro = await self.get_pomodoro_stats(user_id)
        badges = await self.get_user_badges(user_id)
        achievements = await self.get_user_achievements(user_id)
        today_missions = await self.get_or_generate_daily_missions(user_id)
        active_pomodoro = await self.get_active_pomodoro(user_id)
        
        return GamificationDashboardResponse(
            streak=streak,
            pomodoro=pomodoro,
            badges=badges,
            achievements=achievements,
            today_missions=today_missions,
            active_pomodoro=active_pomodoro
        )
