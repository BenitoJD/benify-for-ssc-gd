"""
Repository for gamification database operations.
"""
from typing import List, Optional, Tuple
from uuid import UUID
from datetime import datetime, timedelta, date
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import (
    Badge, UserBadge, Achievement, UserAchievement,
    PomodoroSession, DailyMission, StreakFreeze,
    UserGamificationStats, BadgeType, AchievementType,
    PomodoroStatus, MissionStatus, MissionType
)


class GamificationRepository:
    """Repository for gamification database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ========================================================================
    # Badge Operations
    # ========================================================================
    
    async def get_badge_by_type(self, badge_type: BadgeType) -> Optional[Badge]:
        """Get a badge by its type."""
        result = await self.db.execute(
            select(Badge).where(Badge.badge_type == badge_type)
        )
        return result.scalar_one_or_none()
    
    async def get_all_active_badges(self) -> List[Badge]:
        """Get all active badges."""
        result = await self.db.execute(
            select(Badge).where(Badge.is_active)
        )
        return list(result.scalars().all())
    
    async def get_user_badge(
        self, user_id: UUID, badge_id: UUID
    ) -> Optional[UserBadge]:
        """Get a specific user badge."""
        result = await self.db.execute(
            select(UserBadge).where(
                and_(
                    UserBadge.user_id == user_id,
                    UserBadge.badge_id == badge_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_badge_by_type(
        self, user_id: UUID, badge_type: BadgeType
    ) -> Optional[UserBadge]:
        """Get a user's badge by badge type."""
        result = await self.db.execute(
            select(UserBadge)
            .join(Badge)
            .where(
                and_(
                    UserBadge.user_id == user_id,
                    Badge.badge_type == badge_type
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def create_user_badge(
        self, user_id: UUID, badge_id: UUID
    ) -> UserBadge:
        """Create a user badge record."""
        user_badge = UserBadge(user_id=user_id, badge_id=badge_id)
        self.db.add(user_badge)
        await self.db.flush()
        await self.db.refresh(user_badge)
        return user_badge
    
    async def get_user_badges(
        self, user_id: UUID
    ) -> List[UserBadge]:
        """Get all badges earned by a user."""
        result = await self.db.execute(
            select(UserBadge)
            .join(Badge)
            .where(UserBadge.user_id == user_id)
            .options(selectinload(UserBadge.badge))
            .order_by(UserBadge.earned_at.desc())
        )
        return list(result.scalars().all())
    
    async def count_user_badges(self, user_id: UUID) -> int:
        """Count total badges earned by a user."""
        result = await self.db.execute(
            select(func.count(UserBadge.id))
            .where(UserBadge.user_id == user_id)
        )
        return result.scalar()
    
    async def has_user_badge_type(
        self, user_id: UUID, badge_type: BadgeType
    ) -> bool:
        """Check if user already has a specific badge type."""
        result = await self.db.execute(
            select(func.count(UserBadge.id))
            .join(Badge)
            .where(
                and_(
                    UserBadge.user_id == user_id,
                    Badge.badge_type == badge_type
                )
            )
        )
        return result.scalar() > 0
    
    # ========================================================================
    # Achievement Operations
    # ========================================================================
    
    async def get_achievement_by_type(
        self, achievement_type: AchievementType
    ) -> Optional[Achievement]:
        """Get an achievement by its type."""
        result = await self.db.execute(
            select(Achievement).where(Achievement.achievement_type == achievement_type)
        )
        return result.scalar_one_or_none()
    
    async def get_all_active_achievements(self) -> List[Achievement]:
        """Get all active achievements."""
        result = await self.db.execute(
            select(Achievement).where(Achievement.is_active)
        )
        return list(result.scalars().all())
    
    async def get_user_achievement(
        self, user_id: UUID, achievement_id: UUID
    ) -> Optional[UserAchievement]:
        """Get a specific user achievement."""
        result = await self.db.execute(
            select(UserAchievement).where(
                and_(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == achievement_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_achievement_by_type(
        self, user_id: UUID, achievement_type: AchievementType
    ) -> Optional[UserAchievement]:
        """Get a user's achievement by achievement type."""
        result = await self.db.execute(
            select(UserAchievement)
            .join(Achievement)
            .where(
                and_(
                    UserAchievement.user_id == user_id,
                    Achievement.achievement_type == achievement_type
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def create_user_achievement(
        self, user_id: UUID, achievement_id: UUID
    ) -> UserAchievement:
        """Create a user achievement record."""
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id
        )
        self.db.add(user_achievement)
        await self.db.flush()
        await self.db.refresh(user_achievement)
        return user_achievement
    
    async def get_user_achievements(
        self, user_id: UUID
    ) -> List[UserAchievement]:
        """Get all achievements unlocked by a user."""
        result = await self.db.execute(
            select(UserAchievement)
            .join(Achievement)
            .where(UserAchievement.user_id == user_id)
            .options(selectinload(UserAchievement.achievement))
            .order_by(UserAchievement.unlocked_at.desc())
        )
        return list(result.scalars().all())
    
    async def count_user_achievements(self, user_id: UUID) -> int:
        """Count total achievements unlocked by a user."""
        result = await self.db.execute(
            select(func.count(UserAchievement.id))
            .where(UserAchievement.user_id == user_id)
        )
        return result.scalar()
    
    async def has_user_achievement_type(
        self, user_id: UUID, achievement_type: AchievementType
    ) -> bool:
        """Check if user already has a specific achievement type."""
        result = await self.db.execute(
            select(func.count(UserAchievement.id))
            .join(Achievement)
            .where(
                and_(
                    UserAchievement.user_id == user_id,
                    Achievement.achievement_type == achievement_type
                )
            )
        )
        return result.scalar() > 0
    
    # ========================================================================
    # Pomodoro Session Operations
    # ========================================================================
    
    async def create_pomodoro_session(
        self,
        user_id: UUID,
        duration_minutes: int = 25,
        study_type: Optional[str] = None,
        study_reference_id: Optional[UUID] = None
    ) -> PomodoroSession:
        """Create a new Pomodoro session."""
        session = PomodoroSession(
            user_id=user_id,
            duration_minutes=duration_minutes,
            started_at=datetime.utcnow(),
            status=PomodoroStatus.ACTIVE,
            study_type=study_type,
            study_reference_id=study_reference_id
        )
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        return session
    
    async def get_active_pomodoro_session(
        self, user_id: UUID
    ) -> Optional[PomodoroSession]:
        """Get the current active Pomodoro session for a user."""
        result = await self.db.execute(
            select(PomodoroSession)
            .where(
                and_(
                    PomodoroSession.user_id == user_id,
                    PomodoroSession.status == PomodoroStatus.ACTIVE
                )
            )
            .order_by(PomodoroSession.started_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_pomodoro_session_by_id(
        self, session_id: UUID, user_id: UUID
    ) -> Optional[PomodoroSession]:
        """Get a Pomodoro session by ID for a specific user."""
        result = await self.db.execute(
            select(PomodoroSession)
            .where(
                and_(
                    PomodoroSession.id == session_id,
                    PomodoroSession.user_id == user_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def complete_pomodoro_session(
        self, session_id: UUID, user_id: UUID
    ) -> Optional[PomodoroSession]:
        """Mark a Pomodoro session as completed."""
        session = await self.get_pomodoro_session_by_id(session_id, user_id)
        if session:
            session.status = PomodoroStatus.COMPLETED
            session.completed_at = datetime.utcnow()
            session.focus_minutes = session.duration_minutes
            session.updated_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(session)
        return session
    
    async def cancel_pomodoro_session(
        self, session_id: UUID, user_id: UUID
    ) -> Optional[PomodoroSession]:
        """Cancel a Pomodoro session."""
        session = await self.get_pomodoro_session_by_id(session_id, user_id)
        if session:
            session.status = PomodoroStatus.CANCELLED
            session.completed_at = datetime.utcnow()
            # Calculate partial focus time
            elapsed = (datetime.utcnow() - session.started_at).total_seconds() / 60
            session.focus_minutes = int(min(elapsed, session.duration_minutes))
            session.updated_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(session)
        return session
    
    async def get_user_pomodoro_stats(
        self, user_id: UUID
    ) -> Tuple[int, int, float]:
        """Get total pomodoro sessions, minutes, and hours for a user."""
        result = await self.db.execute(
            select(
                func.count(PomodoroSession.id),
                func.sum(PomodoroSession.focus_minutes),
                func.sum(PomodoroSession.focus_minutes) / 60.0
            )
            .where(
                and_(
                    PomodoroSession.user_id == user_id,
                    PomodoroSession.status == PomodoroStatus.COMPLETED
                )
            )
        )
        row = result.one()
        sessions = row[0] or 0
        minutes = row[1] or 0
        hours = float(row[2] or 0)
        return sessions, minutes, hours
    
    async def get_today_pomodoro_stats(
        self, user_id: UUID
    ) -> Tuple[int, int]:
        """Get today's pomodoro session count and minutes."""
        today_start = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        result = await self.db.execute(
            select(
                func.count(PomodoroSession.id),
                func.sum(PomodoroSession.focus_minutes)
            )
            .where(
                and_(
                    PomodoroSession.user_id == user_id,
                    PomodoroSession.status == PomodoroStatus.COMPLETED,
                    PomodoroSession.completed_at >= today_start
                )
            )
        )
        row = result.one()
        sessions = row[0] or 0
        minutes = row[1] or 0
        return sessions, minutes
    
    # ========================================================================
    # Daily Mission Operations
    # ========================================================================
    
    async def get_daily_missions(
        self, user_id: UUID, date: datetime
    ) -> List[DailyMission]:
        """Get daily missions for a user for a specific date."""
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        result = await self.db.execute(
            select(DailyMission)
            .where(
                and_(
                    DailyMission.user_id == user_id,
                    DailyMission.date >= day_start,
                    DailyMission.date < day_end
                )
            )
            .order_by(DailyMission.created_at)
        )
        return list(result.scalars().all())
    
    async def create_daily_mission(
        self,
        user_id: UUID,
        mission_type: MissionType,
        title: str,
        description: Optional[str],
        target_value: int,
        reference_id: Optional[UUID],
        bonus_streak_points: int,
        date: datetime
    ) -> DailyMission:
        """Create a daily mission."""
        mission = DailyMission(
            user_id=user_id,
            mission_type=mission_type,
            title=title,
            description=description,
            target_value=target_value,
            current_value=0,
            status=MissionStatus.PENDING,
            reference_id=reference_id,
            bonus_streak_points=bonus_streak_points,
            date=date
        )
        self.db.add(mission)
        await self.db.flush()
        await self.db.refresh(mission)
        return mission
    
    async def get_mission_by_id(
        self, mission_id: UUID, user_id: UUID
    ) -> Optional[DailyMission]:
        """Get a daily mission by ID for a specific user."""
        result = await self.db.execute(
            select(DailyMission)
            .where(
                and_(
                    DailyMission.id == mission_id,
                    DailyMission.user_id == user_id
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def complete_daily_mission(
        self, mission_id: UUID, user_id: UUID
    ) -> Optional[DailyMission]:
        """Mark a daily mission as completed."""
        mission = await self.get_mission_by_id(mission_id, user_id)
        if mission and mission.status == MissionStatus.PENDING:
            mission.status = MissionStatus.COMPLETED
            mission.current_value = mission.target_value
            mission.completed_at = datetime.utcnow()
            mission.updated_at = datetime.utcnow()
            await self.db.flush()
            await self.db.refresh(mission)
        return mission
    
    async def count_completed_missions_today(
        self, user_id: UUID
    ) -> int:
        """Count completed missions for today."""
        today_start = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        result = await self.db.execute(
            select(func.count(DailyMission.id))
            .where(
                and_(
                    DailyMission.user_id == user_id,
                    DailyMission.status == MissionStatus.COMPLETED,
                    DailyMission.completed_at >= today_start
                )
            )
        )
        return result.scalar()
    
    # ========================================================================
    # Streak Operations
    # ========================================================================
    
    async def get_or_create_gamification_stats(
        self, user_id: UUID
    ) -> UserGamificationStats:
        """Get or create gamification stats for a user."""
        result = await self.db.execute(
            select(UserGamificationStats)
            .where(UserGamificationStats.user_id == user_id)
        )
        stats = result.scalar_one_or_none()
        
        if stats is None:
            stats = UserGamificationStats(user_id=user_id)
            self.db.add(stats)
            await self.db.flush()
            await self.db.refresh(stats)
        
        return stats
    
    async def update_streak_on_activity(
        self, user_id: UUID, bonus_points: int = 0
    ) -> Tuple[UserGamificationStats, bool]:
        """Update streak based on activity.
        
        Returns:
            Tuple of (stats, streak_updated) where streak_updated indicates if streak was incremented
        """
        stats = await self.get_or_create_gamification_stats(user_id)
        today = datetime.utcnow().date()
        now = datetime.utcnow()
        
        # Get the current week start (Monday)
        current_week_start = today - timedelta(days=today.weekday())
        week_start_dt = datetime.combine(current_week_start, datetime.min.time())
        
        # Initialize current_week_start if needed
        if stats.current_week_start is None:
            stats.current_week_start = week_start_dt
        
        # Reset weekly freeze counter if new week
        if stats.current_week_start < week_start_dt:
            stats.streak_freezes_used_this_week = 0
            stats.current_week_start = week_start_dt
        
        # Check if we should update streak
        streak_updated = False
        
        if stats.last_activity_date is None:
            # First activity ever
            stats.current_streak = 1 + bonus_points
            stats.longest_streak = max(stats.longest_streak, stats.current_streak)
            stats.last_activity_date = now
            streak_updated = True
        else:
            last_date = stats.last_activity_date.date()
            days_diff = (today - last_date).days
            
            if days_diff == 0:
                # Same day, no streak change but add bonus points
                stats.current_streak += bonus_points
                stats.last_activity_date = now
                streak_updated = bonus_points > 0
            elif days_diff == 1:
                # Consecutive day - increment streak
                stats.current_streak = 1 + bonus_points + (1 if bonus_points == 0 else 0)
                # If completing mission, add bonus points to streak
                if bonus_points > 0:
                    stats.current_streak += bonus_points
                stats.last_activity_date = now
                stats.longest_streak = max(stats.longest_streak, stats.current_streak)
                streak_updated = True
            elif days_diff == 2:
                # Check if streak freeze was used
                freeze = await self.get_streak_freeze_for_date(user_id, last_date + timedelta(days=1))
                if freeze:
                    # Freeze was used, maintain streak
                    stats.current_streak = 1 + bonus_points
                    stats.last_activity_date = now
                    streak_updated = True
                else:
                    # Gap too large, reset streak
                    stats.current_streak = 1
                    stats.last_activity_date = now
                    streak_updated = True
            else:
                # Gap too large, reset streak
                stats.current_streak = 1
                stats.last_activity_date = now
                streak_updated = True
        
        stats.updated_at = now
        await self.db.flush()
        await self.db.refresh(stats)
        
        return stats, streak_updated
    
    async def add_focus_minutes(
        self, user_id: UUID, minutes: int
    ) -> UserGamificationStats:
        """Add focus minutes to user's gamification stats."""
        stats = await self.get_or_create_gamification_stats(user_id)
        stats.total_focus_minutes += minutes
        stats.total_pomodoro_sessions += 1
        stats.total_pomodoro_hours = stats.total_focus_minutes / 60.0
        stats.updated_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(stats)
        return stats
    
    async def increment_badges_count(self, user_id: UUID) -> UserGamificationStats:
        """Increment total badges earned count."""
        stats = await self.get_or_create_gamification_stats(user_id)
        stats.total_badges_earned += 1
        stats.updated_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(stats)
        return stats
    
    async def increment_achievements_count(
        self, user_id: UUID
    ) -> UserGamificationStats:
        """Increment total achievements unlocked count."""
        stats = await self.get_or_create_gamification_stats(user_id)
        stats.total_achievements_unlocked += 1
        stats.updated_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(stats)
        return stats
    
    # ========================================================================
    # Streak Freeze Operations
    # ========================================================================
    
    async def get_streak_freeze_for_date(
        self, user_id: UUID, freeze_date: date
    ) -> Optional[StreakFreeze]:
        """Get streak freeze for a specific date."""
        date_start = datetime.combine(freeze_date, datetime.min.time())
        date_end = date_start + timedelta(days=1)
        
        result = await self.db.execute(
            select(StreakFreeze)
            .where(
                and_(
                    StreakFreeze.user_id == user_id,
                    StreakFreeze.freeze_date >= date_start,
                    StreakFreeze.freeze_date < date_end
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_streak_freezes_this_week(
        self, user_id: UUID
    ) -> List[StreakFreeze]:
        """Get all streak freezes used this week."""
        today = datetime.utcnow().date()
        week_start = today - timedelta(days=today.weekday())
        week_start_dt = datetime.combine(week_start, datetime.min.time())
        
        result = await self.db.execute(
            select(StreakFreeze)
            .where(
                and_(
                    StreakFreeze.user_id == user_id,
                    StreakFreeze.week_start >= week_start_dt
                )
            )
        )
        return list(result.scalars().all())
    
    async def create_streak_freeze(
        self,
        user_id: UUID,
        freeze_date: datetime,
        week_start: datetime
    ) -> StreakFreeze:
        """Create a streak freeze record."""
        freeze = StreakFreeze(
            user_id=user_id,
            freeze_date=freeze_date,
            used_at=datetime.utcnow(),
            week_start=week_start
        )
        self.db.add(freeze)
        await self.db.flush()
        await self.db.refresh(freeze)
        return freeze
    
    async def use_streak_freeze(self, user_id: UUID) -> Optional[StreakFreeze]:
        """Use a streak freeze for the current week.
        
        Returns the freeze if successful, None if already used this week.
        """
        # Get current week start
        today = datetime.utcnow().date()
        week_start = today - timedelta(days=today.weekday())
        week_start_dt = datetime.combine(week_start, datetime.min.time())
        
        # Check if already used this week
        freezes = await self.get_streak_freezes_this_week(user_id)
        if len(freezes) >= 1:
            return None
        
        # Create the freeze
        return await self.create_streak_freeze(
            user_id=user_id,
            freeze_date=datetime.utcnow(),
            week_start=week_start_dt
        )
    
    async def is_streak_freeze_available(self, user_id: UUID) -> bool:
        """Check if streak freeze is available for this week."""
        freezes = await self.get_streak_freezes_this_week(user_id)
        return len(freezes) < 1
