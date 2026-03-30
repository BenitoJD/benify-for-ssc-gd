"""
Pydantic schemas for question bank module.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class QuestionType(str, Enum):
    """Question type enumeration."""
    MCQ = "mcq"
    TRUE_FALSE = "true_false"


class Difficulty(str, Enum):
    """Question difficulty enumeration."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# ============ Question Schemas ============

class QuestionBase(BaseModel):
    """Base question schema."""
    topic_id: UUID
    question_text: str = Field(..., min_length=1)
    question_type: QuestionType = QuestionType.MCQ
    options: List[str] = Field(..., min_length=2, max_length=6)  # List of option strings
    correct_answer: str = Field(..., pattern=r'^[A-D]$')  # A, B, C, or D
    explanation: Optional[str] = None
    difficulty: Difficulty = Difficulty.MEDIUM
    marks: float = 1.0
    negative_marks: float = 0.25
    is_premium: bool = False
    source: Optional[str] = None
    exam_year: Optional[int] = None


class QuestionCreate(QuestionBase):
    """Schema for creating a question."""
    pass


class QuestionUpdate(BaseModel):
    """Schema for updating a question."""
    topic_id: Optional[UUID] = None
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    marks: Optional[float] = None
    negative_marks: Optional[float] = None
    is_premium: Optional[bool] = None
    source: Optional[str] = None
    exam_year: Optional[int] = None


class QuestionResponse(BaseModel):
    """Response schema for a question."""
    id: UUID
    topic_id: UUID
    topic_name: Optional[str] = None
    subject_name: Optional[str] = None
    question_text: str
    question_type: QuestionType
    options: List[str]  # Will be parsed from JSON
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: Difficulty
    marks: float
    negative_marks: float
    is_premium: bool
    source: Optional[str] = None
    exam_year: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    """Response schema for listing questions."""
    id: str
    topic_id: str
    topic_name: Optional[str] = None
    subject_name: Optional[str] = None
    question_text: str
    question_type: QuestionType
    difficulty: Difficulty
    marks: float
    is_premium: bool
    source: Optional[str] = None
    exam_year: Optional[int] = None
    
    class Config:
        from_attributes = True


class QuestionBankFilter(BaseModel):
    """Filter schema for question bank queries."""
    topic_id: Optional[UUID] = None
    subject_id: Optional[UUID] = None
    difficulty: Optional[Difficulty] = None
    is_premium: Optional[bool] = None
    source: Optional[str] = None
    exam_year: Optional[int] = None
    search: Optional[str] = None


class QuestionWithAnswerResponse(QuestionResponse):
    """Response schema for question with correct answer (for solutions/review)."""
    pass


class PYQResponse(BaseModel):
    """Response schema for Previous Year Question."""
    id: str
    topic_id: str
    topic_name: str
    subject_id: str
    subject_name: str
    question_text: str
    question_type: QuestionType
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    source: str
    exam_year: int
    created_at: datetime
    
    class Config:
        from_attributes = True
