from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response wrapper."""
    success: bool = True
    data: T
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    code: Optional[str] = None
    details: Optional[dict] = None
