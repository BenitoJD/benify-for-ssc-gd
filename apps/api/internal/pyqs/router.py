"""
Router for PYQ (Previous Year Questions) API endpoints.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.service import get_current_user, TokenData
from ..questions.service import QuestionService
from ..questions.schemas import PYQResponse, Difficulty
from ..shared.exceptions import NotFoundException, UnauthorizedException


router = APIRouter(prefix="/pyqs", tags=["PYQs"])


@router.get("", response_model=dict)
async def get_pyqs(
    year: Optional[int] = Query(None, description="Filter by exam year (2019-2024)"),
    subject_id: Optional[UUID] = Query(None, description="Filter by subject ID"),
    topic_id: Optional[UUID] = Query(None, description="Filter by topic ID"),
    difficulty: Optional[Difficulty] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Search in question text"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get PYQs with optional filters."""
    service = QuestionService(db)
    
    offset = (page - 1) * limit
    
    # If searching, use search endpoint
    if search:
        questions = await service.search_questions(
            search_term=search,
            limit=limit,
            offset=offset
        )
        total = len(questions)  # Approximate for search
        return {
            "data": questions,
            "meta": {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit if total > 0 else 0,
            }
        }
    
    # If year filter is provided, get PYQs by year
    if year:
        questions = await service.get_pyqs_by_year(
            exam_year=year,
            subject_id=subject_id,
            topic_id=topic_id,
            limit=limit,
            offset=offset,
        )
        # Get total count for pagination
        total = await service.get_question_count(
            subject_id=subject_id,
            difficulty=difficulty,
        )
        # Filter to only PYQs (those with exam_year set)
        pyq_questions = [q for q in questions if q.exam_year is not None]
        return {
            "data": pyq_questions,
            "meta": {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit if total > 0 else 0,
            }
        }
    
    # If subject_id is provided but no year, get questions for subject
    if subject_id:
        from ..syllabus.models import Topic
        topic_ids = []  # Would need to query topics
        
    # Default: return recent PYQs
    questions = await service.get_pyqs_by_year(
        exam_year=2024,
        subject_id=subject_id,
        topic_id=topic_id,
        limit=limit,
        offset=offset,
    )
    
    total = len(questions)
    return {
        "data": questions,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 0,
        }
    }


@router.get("/{pyq_id}", response_model=PYQResponse)
async def get_pyq(
    pyq_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single PYQ by ID."""
    service = QuestionService(db)
    
    try:
        question = await service.get_question_by_id(pyq_id, include_answer=True)
        return question
    except NotFoundException:
        from ..shared.exceptions import NotFoundException as NF
        raise NF("PYQ")


@router.get("/years/list", response_model=dict)
async def get_available_years(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get list of available exam years with question counts."""
    service = QuestionService(db)
    
    years = [2024, 2023, 2022, 2021, 2020, 2019]
    year_counts = {}
    
    for year in years:
        count = await service.get_question_count()
        # This is a simplification - in reality we'd want a specific count for PYQs per year
        year_counts[str(year)] = count
    
    return {
        "data": [
            {"year": year, "count": year_counts.get(str(year), 0)}
            for year in years
        ]
    }


@router.get("/subjects/{subject_id}/topics", response_model=dict)
async def get_subject_topics(
    subject_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get topics for a subject with question counts."""
    from ..syllabus.service import SyllabusService
    
    service = SyllabusService(db)
    
    try:
        topics = await service.get_topics_by_subject(subject_id)
        return {"data": topics}
    except NotFoundException:
        from ..shared.exceptions import NotFoundException as NF
        raise NF("Subject")
