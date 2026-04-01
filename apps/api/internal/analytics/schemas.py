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


# ============ Advanced Analytics Schemas ============

class PercentileRankResponse(BaseModel):
    """Percentile rank estimation response."""
    estimated_percentile: float  # 0-100 based on user's score vs all test-takers
    total_test_takers: int  # Total number of test-takers in the cohort
    user_score: float  # User's average/latest score
    cohort_scores: List[float]  # Distribution of scores for visualization
    percentile_breakdown: List[dict]  # Score ranges with percentile labels
    rank_category: str  # "top_10", "top_25", "top_50", "above_avg", "below_avg"


class ExamReadinessResponse(BaseModel):
    """Exam readiness score combining academic and physical readiness."""
    overall_readiness: float  # 0-100 combined score
    academic_readiness: float  # 0-100 academic score component (70% weight)
    physical_readiness: float  # 0-100 physical score component (30% weight)
    academic_breakdown: dict  # Breakdown of academic factors
    physical_breakdown: dict  # Breakdown of physical factors
    readiness_label: str  # "highly_ready", "ready", "moderately_ready", "needs_improvement"
    recommendations: List[str]  # Recommendations to improve readiness


class StageReadinessResponse(BaseModel):
    """Stage-wise readiness percentages (PST, PET, Document)."""
    pst_readiness: float  # 0-100 percentage
    pet_readiness: float  # 0-100 percentage
    document_readiness: float  # 0-100 percentage
    overall_readiness: float  # Combined 0-100
    pst_details: dict  # Details of PST completion
    pet_details: dict  # Details of PET completion
    document_details: dict  # Details of document completion
    stage_status: dict  # Status of each stage: "ready", "in_progress", "not_started"


class CohortComparisonResponse(BaseModel):
    """Cohort comparison: user's progress vs peers who started same date."""
    cohort_name: str  # e.g., "Started Jan 2024"
    cohort_size: int  # Number of users in the cohort
    cohort_start_date: datetime  # When this cohort started
    user_progress: float  # User's progress percentage (0-100)
    cohort_average_progress: float  # Average progress of the cohort
    user_percentile: float  # User's percentile within cohort
    progress_comparison: dict  # Detailed comparison metrics
    user_averages: dict  # User's average scores vs cohort
    cohort_distribution: dict  # Distribution of progress in cohort


class ComprehensiveReportResponse(BaseModel):
    """Comprehensive analytics report for export."""
    report_id: str
    generated_at: datetime
    user_id: UUID
    user_name: Optional[str] = None
    
    # Performance summary
    percentile_rank: PercentileRankResponse
    exam_readiness: ExamReadinessResponse
    stage_readiness: StageReadinessResponse
    cohort_comparison: CohortComparisonResponse
    
    # Detailed breakdowns
    subject_performance: List[SubjectAccuracy]
    weak_areas: List[ChapterWeakness]
    recent_trends: List[ScoreTrendItem]
    
    # Metadata
    report_type: str = "comprehensive"
    valid_until: datetime  # Report expiration
    download_url: Optional[str] = None
