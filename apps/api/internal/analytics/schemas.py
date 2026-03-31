"""
Pydantic schemas for analytics API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class DateRangeFilter(str, Enum):
    """Date range filter options."""
    LAST_30_DAYS = "last_30_days"
    LAST_90_DAYS = "last_90_days"
    LAST_6_MONTHS = "last_6_months"
    ALL_TIME = "all_time"
    CUSTOM = "custom"


class ScoreTrendItem(BaseModel):
    """Score trend data point."""
    attempt_id: UUID
    test_title: str
    completed_at: datetime
    total_score: float
    max_score: float
    percentage: float
    rank_percentile: Optional[float] = None
    subject_breakdown: Optional[dict] = None


class SubjectAccuracy(BaseModel):
    """Subject-wise accuracy data."""
    subject_id: UUID
    subject_name: str
    accuracy: float
    total_questions: int
    correct_answers: int
    avg_time_per_question: float
    trend: Optional[str] = None  # "up", "down", "stable"
    trend_percentage: Optional[float] = None


class ChapterWeakness(BaseModel):
    """Chapter/topic weakness data."""
    topic_id: UUID
    topic_name: str
    subject_id: UUID
    subject_name: str
    accuracy: float
    error_rate: float
    total_attempts: int
    questions_attempted: int
    questions_incorrect: int
    is_highlighted: bool = False  # Top 5 weakest


class MockComparison(BaseModel):
    """Mock comparison data."""
    attempt_id: UUID
    test_title: str
    completed_at: datetime
    user_score: float
    user_percentage: float
    platform_average: float
    difference: float  # Positive = above average, negative = below
    is_above_average: bool


class TimeAnalytics(BaseModel):
    """Time per question analytics."""
    subject_id: UUID
    subject_name: str
    avg_time_seconds: float
    total_questions: int
    topic_breakdown: Optional[List[dict]] = None


class RevisionRecommendationItem(BaseModel):
    """Revision recommendation item."""
    topic_id: UUID
    topic_name: str
    subject_id: UUID
    subject_name: str
    priority: int
    current_accuracy: float
    questions_to_practice: int
    pyq_filter_url: str
    study_material_url: Optional[str] = None
    status: str = "pending"


class WeakChapterDrilldown(BaseModel):
    """Drill-down data for a weak chapter."""
    topic_id: UUID
    topic_name: str
    subject_id: UUID
    subject_name: str
    accuracy: float
    weak_questions: List[dict]  # List of question IDs and texts that were answered incorrectly


# Main Analytics Response Models

class OverallAnalytics(BaseModel):
    """Overall analytics summary."""
    total_mocks_taken: int
    total_questions_attempted: int
    total_correct_answers: int
    overall_accuracy: float
    best_score: Optional[float] = None
    best_score_date: Optional[datetime] = None
    avg_score: Optional[float] = None
    avg_time_per_question: Optional[float] = None
    current_streak: int = 0
    longest_streak: int = 0
    avg_rank_percentile: Optional[float] = None
    improvement_percentage: Optional[float] = None  # Compared to previous period


class AnalyticsResponse(BaseModel):
    """Main analytics response."""
    # Date range info
    date_range: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # Overall summary
    overall: OverallAnalytics
    
    # Score trend
    score_trend: List[ScoreTrendItem]
    
    # Subject-wise accuracy
    subject_accuracy: List[SubjectAccuracy]
    
    # Weakness map
    weak_chapters: List[ChapterWeakness]
    
    # Mock comparison
    mock_comparison: List[MockComparison]
    
    # Time analytics
    time_analytics: List[TimeAnalytics]
    
    # Revision recommendations
    recommendations: List[RevisionRecommendationItem]
    
    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class ExportFormat(str, Enum):
    """Export format options."""
    PDF = "pdf"
    CSV = "csv"


class AnalyticsExportResponse(BaseModel):
    """Analytics export response."""
    download_url: str
    format: ExportFormat
    expires_at: datetime
