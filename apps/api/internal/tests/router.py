"""
Router for test series API endpoints.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from .schemas import (
    TestSeriesCreate,
    TestSeriesUpdate,
    TestSeriesResponse,
    TestSeriesListResponse,
    TestSeriesDetailResponse,
    AttemptStartResponse,
    QuestionInAttemptResponse,
    AnswerSaveRequest,
    AnswerSaveResponse,
    AttemptSubmitRequest,
    AttemptSubmitResponse,
    AttemptResultsResponse,
    SolutionsResponse,
    AttemptAnalysisResponse,
    AttemptHistoryResponse,
    TestType,
)
from .service import TestSeriesService, AttemptService
from ..shared.pagination import get_pagination_meta, paginate


router = APIRouter(prefix="/test-series", tags=["Test Series"])
attempt_router = APIRouter(prefix="/attempts", tags=["Attempts"])


# ============ Test Series Endpoints ============

@router.get("", response_model=dict)
async def get_test_series_list(
    test_type: Optional[TestType] = Query(None, description="Filter by test type"),
    is_premium: Optional[bool] = Query(None, description="Filter by premium status"),
    search: Optional[str] = Query(None, description="Search by title"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of test series with optional filters."""
    service = TestSeriesService(db)
    
    try:
        user_id = UUID(current_user.user_id) if current_user else None
    except ValueError:
        user_id = None
    
    test_list, total = await service.get_test_series_list(
        test_type=test_type,
        is_premium=is_premium,
        search=search,
        page=page,
        limit=limit,
        user_id=user_id,
    )
    
    meta = get_pagination_meta(total, page, limit)
    
    return {
        "data": test_list,
        "meta": meta,
    }


@router.get("/{test_series_id}", response_model=TestSeriesDetailResponse)
async def get_test_series(
    test_series_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get test series by ID."""
    service = TestSeriesService(db)
    
    try:
        user_id = UUID(current_user.user_id) if current_user else None
    except ValueError:
        user_id = None
    
    return await service.get_test_series_by_id(test_series_id, user_id)


@router.post("", response_model=TestSeriesDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_test_series(
    data: TestSeriesCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new test series (admin only)."""
    # TODO: Add admin role check
    service = TestSeriesService(db)
    return await service.create_test_series(data)


@router.patch("/{test_series_id}", response_model=TestSeriesDetailResponse)
async def update_test_series(
    test_series_id: UUID,
    data: TestSeriesUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a test series (admin only)."""
    # TODO: Add admin role check
    service = TestSeriesService(db)
    return await service.update_test_series(test_series_id, data)


# ============ Attempt Endpoints ============

@router.post("/{test_series_id}/start", response_model=AttemptStartResponse)
async def start_test_attempt(
    test_series_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new attempt for a test series."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    return await service.start_attempt(
        test_series_id=test_series_id,
        user_id=UUID(current_user.user_id),
    )


@router.get("/{test_series_id}/attempts")
async def get_test_attempts(
    test_series_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's attempts for a specific test series."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    # This would return attempt history
    return {"data": []}


# ============ Direct Attempt Endpoints ============

@attempt_router.get("/{attempt_id}/questions")
async def get_attempt_questions(
    attempt_id: UUID,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated questions for an attempt."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    questions, total, current_page = await service.get_attempt_questions(
        attempt_id=attempt_id,
        user_id=UUID(current_user.user_id),
        page=page,
        limit=limit,
    )
    
    return {
        "data": questions,
        "total": total,
        "page": current_page,
        "limit": limit,
    }


@attempt_router.patch("/{attempt_id}/answers/{question_id}", response_model=AnswerSaveResponse)
async def save_answer(
    attempt_id: UUID,
    question_id: UUID,
    data: AnswerSaveRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save or update an answer for a question."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    return await service.save_answer(
        attempt_id=attempt_id,
        question_id=question_id,
        user_id=UUID(current_user.user_id),
        data=data,
    )


@attempt_router.post("/{attempt_id}/submit", response_model=AttemptSubmitResponse)
async def submit_attempt(
    attempt_id: UUID,
    data: AttemptSubmitRequest = AttemptSubmitRequest(),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit an attempt and get scores."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    return await service.submit_attempt(
        attempt_id=attempt_id,
        user_id=UUID(current_user.user_id),
    )


@attempt_router.get("/{attempt_id}/results", response_model=AttemptResultsResponse)
async def get_attempt_results(
    attempt_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed results for an attempt."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    return await service.get_attempt_results(
        attempt_id=attempt_id,
        user_id=UUID(current_user.user_id),
    )


@attempt_router.get("/{attempt_id}/solutions", response_model=SolutionsResponse)
async def get_attempt_solutions(
    attempt_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get solutions for all questions in an attempt."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    return await service.get_attempt_solutions(
        attempt_id=attempt_id,
        user_id=UUID(current_user.user_id),
    )


@attempt_router.get("/{attempt_id}/analysis", response_model=AttemptAnalysisResponse)
async def get_attempt_analysis(
    attempt_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI analysis of attempt with weak topics and recommendations."""
    if not current_user:
        from ..shared.exceptions import UnauthorizedException
        raise UnauthorizedException()
    
    service = AttemptService(db)
    return await service.get_attempt_analysis(
        attempt_id=attempt_id,
        user_id=UUID(current_user.user_id),
    )
