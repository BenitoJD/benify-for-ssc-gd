"""
Gamification models for streaks, badges, achievements, Pomodoro timer, and daily missions.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Enum as SQLEnum, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class BadgeType(str, enum.Enum):
    """Types of badges."""
    FIRST_ACCEPTED_ANSWER = "first_accepted_answer"
    WEEK_WARRIOR = "week_warrior"
    MONTH_MASTER = "month_master"
    FIRST_MOCK = "first_mock"
    FIRST_LESSON = "first_lesson"
    PERFECT_SCORE = "perfect_score"
    STREAK_3_DAYS = "streak_3_days"
    STREAK_7_DAYS = "streak_7_days"
    STREAK_30_DAYS = "streak_30_days"
    FIRST_DISCUSSION = "first_discussion"
    HELPFUL_MEMBER = "helpful_member"


class AchievementType(str, enum.Enum):
    """Types of achievements."""
    FOCUS_10H = "focus_10h"
    FOCUS_50H = "focus_50h"
    FOCUS_100H = "focus_100h"
    FIRST_SUBJECT_COMPLETE = "first_subject_complete"
    ALL_SUBJECTS_COMPLETE = "all_subjects_complete"
    TESTS_10 = "tests_10"
    TESTS_50 = "tests_50"
    TESTS_100 = "tests_100"


class PomodoroStatus(str, enum.Enum):
    """Pomodoro session status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MissionType(str, enum.Enum):
    """Types of daily missions."""
    LESSON = "lesson"
    TEST = "test"
    REVISION = "revision"
    PHYSICAL = "physical"
    COMMUNITY = "community"
    POMODORO = "pomodoro"


class MissionStatus(str, enum.Enum):
    """Daily mission status."""
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class Badge(Base):
    """Badge definition model.
    
    Defines available badges that users can earn.
    """
    
    __tablename__ = "badges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=False)
    badge_type = Column(SQLEnum(BadgeType), nullable=False, unique=True)
    icon_url = Column(String(500), nullable=True)
    criteria = Column(JSON, nullable=True)  # JSON criteria for earning the badge
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Badge {self.name}>"


class UserBadge(Base):
    """User badge - tracks badges earned by users.
    
    When a user earns a badge, a record is created here.
    """
    
    __tablename__ = "user_badges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False, index=True)
    
    # Timestamps
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    badge = relationship("Badge", backref="user_badges")
    user = relationship("User", backref="earned_badges")
    
    # Indexes
    __table_args__ = (
        Index("ix_user_badges_user_badge", "user_id", "badge_id", unique=True),
    )
    
    def __repr__(self):
        return f"<UserBadge {self.user_id} - {self.badge_id}>"


class Achievement(Base):
    """Achievement definition model.
    
    Defines achievements users can unlock.
    """
    
    __tablename__ = "achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(500), nullable=False)
    achievement_type = Column(SQLEnum(AchievementType), nullable=False, unique=True)
    icon_url = Column(String(500), nullable=True)
    criteria = Column(JSON, nullable=False)  # JSON criteria for unlocking
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Achievement {self.name}>"


class UserAchievement(Base):
    """User achievement - tracks achievements unlocked by users.
    
    When a user unlocks an achievement, a record is created here.
    """
    
    __tablename__ = "user_achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False, index=True)
    
    # Timestamps
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    achievement = relationship("Achievement", backref="user_achievements")
    user = relationship("User", backref="unlocked_achievements")
    
    # Indexes
    __table_args__ = (
        Index("ix_user_achievements_user_achievement", "user_id", "achievement_id", unique=True),
    )
    
    def __repr__(self):
        return f"<UserAchievement {self.user_id} - {self.achievement_id}>"


class PomodoroSession(Base):
    """Pomodoro session model.
    
    Tracks individual Pomodoro study sessions.
    """
    
    __tablename__ = "pomodoro_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Session details
    duration_minutes = Column(Integer, default=25, nullable=False)
    status = Column(SQLEnum(PomodoroStatus), default=PomodoroStatus.ACTIVE, nullable=False)
    
    # Timing
    started_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Focus time actually spent (in minutes)
    focus_minutes = Column(Integer, default=0, nullable=False)
    
    # Optional: link to what was being studied
    study_type = Column(String(50), nullable=True)  # "lesson", "test", "pyq", "revision"
    study_reference_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="pomodoro_sessions")
    
    # Indexes
    __table_args__ = (
        Index("ix_pomodoro_sessions_user_started", "user_id", "started_at"),
    )
    
    def __repr__(self):
        return f"<PomodoroSession {self.id} - {self.status.value}>"


class DailyMission(Base):
    """Daily mission model.
    
    Randomly assigned daily tasks for users.
    """
    
    __tablename__ = "daily_missions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Mission details
    mission_type = Column(SQLEnum(MissionType), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    target_value = Column(Integer, default=1, nullable=False)  # e.g., complete 3 lessons
    current_value = Column(Integer, default=0, nullable=False)
    
    # Status
    status = Column(SQLEnum(MissionStatus), default=MissionStatus.PENDING, nullable=False)
    
    # Reference to related entity
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # lesson_id, test_id, etc.
    
    # Bonus streak points for completing
    bonus_streak_points = Column(Integer, default=1, nullable=False)
    
    # Date
    date = Column(DateTime, nullable=False, index=True)
    
    # Completion
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="daily_missions")
    
    # Indexes
    __table_args__ = (
        Index("ix_daily_missions_user_date", "user_id", "date"),
    )
    
    def __repr__(self):
        return f"<DailyMission {self.id} - {self.title[:30]}>"


class StreakFreeze(Base):
    """Streak freeze model.
    
    Tracks streak freezes used by users.
    """
    
    __tablename__ = "streak_freezes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Freeze details
    freeze_date = Column(DateTime, nullable=False)
    used_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Week this freeze belongs to (for tracking 1 per week limit)
    week_start = Column(DateTime, nullable=False)
    
    # Relationships
    user = relationship("User", backref="streak_freezes")
    
    # Indexes
    __table_args__ = (
        Index("ix_streak_freezes_user_week", "user_id", "week_start"),
    )
    
    def __repr__(self):
        return f"<StreakFreeze {self.user_id} - {self.freeze_date}>"


class UserGamificationStats(Base):
    """User gamification statistics summary.
    
    Cached/precomputed stats for quick access.
    """
    
    __tablename__ = "user_gamification_stats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Streak stats
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime, nullable=True)
    streak_freezes_used_this_week = Column(Integer, default=0, nullable=False)
    current_week_start = Column(DateTime, nullable=True)
    
    # Pomodoro stats
    total_pomodoro_sessions = Column(Integer, default=0, nullable=False)
    total_focus_minutes = Column(Integer, default=0, nullable=False)
    total_pomodoro_hours = Column(Float, default=0, nullable=False)
    
    # Badge/achievement counts
    total_badges_earned = Column(Integer, default=0, nullable=False)
    total_achievements_unlocked = Column(Integer, default=0, nullable=False)
    
    # Daily missions
    missions_completed_today = Column(Integer, default=0, nullable=False)
    last_mission_reset_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="gamification_stats")
    
    def __repr__(self):
        return f"<UserGamificationStats {self.user_id}>"
