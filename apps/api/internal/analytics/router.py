"""
Router for analytics API endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from datetime import datetime

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from .schemas import (
    AnalyticsResponse,
    WeakChapterDrilldown,
    DateRangeFilter,
    ExportFormat,
    AnalyticsExportResponse,
    PercentileRankResponse,
    ExamReadinessResponse,
    StageReadinessResponse,
    CohortComparisonResponse,
    ComprehensiveReportResponse,
)
from .service import AnalyticsService
from ..shared.exceptions import UnauthorizedException


router = APIRouter(prefix="/users/me/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_user_analytics(
    date_range: DateRangeFilter = Query(
        DateRangeFilter.LAST_30_DAYS, 
        description="Date range filter"
    ),
    custom_start: Optional[datetime] = Query(
        None, 
        description="Custom start date (required if date_range is CUSTOM)"
    ),
    custom_end: Optional[datetime] = Query(
        None, 
        description="Custom end date (required if date_range is CUSTOM)"
    ),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get comprehensive analytics for the current user.
    
    Returns:
    - Overall score trend (last 10 mocks)
    - Date range filter: last 30 days, last 90 days, custom range
    - Subject-wise accuracy: per-subject accuracy % with trend chart
    - Chapter-wise weakness map: sorted by error rate, top 5 highlighted
    - Mock comparison: user's score vs platform average per mock
    - Time per question analytics: avg time by subject/topic
    - Revision recommendations: chapters with <60% accuracy, prioritized
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_user_analytics(
        user_id=UUID(current_user.user_id),
        date_filter=date_range,
        custom_start=custom_start,
        custom_end=custom_end,
    )


@router.get("/weak-topics/{topic_id}", response_model=WeakChapterDrilldown)
async def get_weak_topic_drilldown(
    topic_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get drill-down data for a weak chapter.
    
    Returns specific topics and questions that need attention within the chapter.
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_weak_chapter_drilldown(
        user_id=UUID(current_user.user_id),
        topic_id=topic_id,
    )


@router.get("/export")
async def export_analytics(
    format: ExportFormat = Query(ExportFormat.CSV, description="Export format"),
    date_range: DateRangeFilter = Query(
        DateRangeFilter.LAST_30_DAYS,
        description="Date range filter"
    ),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export analytics as PDF or CSV.
    
    Returns a download URL for the exported analytics file.
    """
    if not current_user:
        raise UnauthorizedException()
    
    # For now, return a placeholder response
    # In production, this would generate the actual file
    from datetime import timedelta
    
    return AnalyticsExportResponse(
        download_url=f"/exports/analytics_{current_user.user_id}.{format.value}",
        format=format,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )


# ============ Advanced Analytics Endpoints ============

@router.get("/percentile-rank", response_model=PercentileRankResponse)
async def get_percentile_rank(
    test_series_id: Optional[UUID] = Query(
        None, 
        description="Optional test series ID to filter by specific test"
    ),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get estimated percentile rank based on mock scores vs all test-takers.
    
    Returns:
    - estimated_percentile: 0-100 based on user's score vs all test-takers
    - total_test_takers: Total number of test-takers in the cohort
    - user_score: User's average/latest score
    - cohort_scores: Distribution of scores for visualization
    - rank_category: top_10, top_25, top_50, above_avg, below_avg
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_percentile_rank(
        user_id=UUID(current_user.user_id),
        test_series_id=test_series_id,
    )


@router.get("/exam-readiness", response_model=ExamReadinessResponse)
async def get_exam_readiness(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get exam readiness score combining academic (70%) and physical (30%) readiness.
    
    Returns:
    - overall_readiness: 0-100 combined score
    - academic_readiness: 0-100 academic score component (70% weight)
    - physical_readiness: 0-100 physical score component (30% weight)
    - readiness_label: highly_ready, ready, moderately_ready, needs_improvement
    - recommendations: List of recommendations to improve readiness
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_exam_readiness(
        user_id=UUID(current_user.user_id),
    )


@router.get("/stage-readiness", response_model=StageReadinessResponse)
async def get_stage_readiness(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get stage-wise readiness percentages (PST, PET, Document).
    
    Returns:
    - pst_readiness: 0-100 percentage for Physical Standard Test
    - pet_readiness: 0-100 percentage for Physical Efficiency Test
    - document_readiness: 0-100 percentage for Document Verification
    - overall_readiness: Combined 0-100
    - stage_status: ready, in_progress, not_started for each stage
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_stage_readiness(
        user_id=UUID(current_user.user_id),
    )


@router.get("/cohort-comparison", response_model=CohortComparisonResponse)
async def get_cohort_comparison(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Compare user's progress vs peers who started same date.
    
    Returns:
    - cohort_name: e.g., "Started January 2024"
    - cohort_size: Number of users in the cohort
    - user_progress: User's progress percentage (0-100)
    - cohort_average_progress: Average progress of the cohort
    - user_percentile: User's percentile within cohort
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_cohort_comparison(
        user_id=UUID(current_user.user_id),
    )


@router.get("/comprehensive-report", response_model=ComprehensiveReportResponse)
async def get_comprehensive_report(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get comprehensive analytics report for export.
    
    Combines all advanced analytics into a single exportable report:
    - Percentile rank
    - Exam readiness (academic + physical)
    - Stage readiness (PST, PET, Document)
    - Cohort comparison
    - Subject performance
    - Weak areas
    - Recent trends
    
    Report expires in 7 days.
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    return await service.get_comprehensive_report(
        user_id=UUID(current_user.user_id),
    )


@router.get("/comprehensive-report/export")
async def export_comprehensive_report(
    format: ExportFormat = Query(ExportFormat.PDF, description="Export format"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export comprehensive analytics report as PDF or CSV.
    
    Returns a download URL for the exported comprehensive report.
    """
    if not current_user:
        raise UnauthorizedException()
    
    service = AnalyticsService(db)
    
    # Get the comprehensive report
    report = await service.get_comprehensive_report(
        user_id=UUID(current_user.user_id),
    )
    
    # Generate download URL
    from datetime import timedelta
    
    return {
        "report_id": report.report_id,
        "download_url": f"/exports/comprehensive_report_{current_user.user_id}.{format.value}",
        "format": format.value,
        "generated_at": report.generated_at,
        "valid_until": report.valid_until,
        "status": "ready"
    }
