"""
Router for analytics API endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
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
