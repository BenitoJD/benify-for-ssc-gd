from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    limit: int
    total: int
    pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""
    data: List[T]
    meta: PaginationMeta


def paginate(query, page: int = 1, limit: int = 20) -> tuple:
    """
    Calculate pagination parameters.
    
    Returns:
        tuple: (offset, limit)
    """
    if page < 1:
        page = 1
    if limit < 1:
        limit = 1
    if limit > 100:
        limit = 100
    
    offset = (page - 1) * limit
    return offset, limit


def get_pagination_meta(total: int, page: int, limit: int) -> PaginationMeta:
    """Create pagination metadata."""
    pages = (total + limit - 1) // limit if total > 0 else 0
    return PaginationMeta(
        page=page,
        limit=limit,
        total=total,
        pages=pages,
    )
