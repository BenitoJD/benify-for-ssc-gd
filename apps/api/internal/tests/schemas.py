"""
Pydantic schemas for test series module.
"""
from pydantic import ConfigDict, BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class TestType(str, Enum):
    """Test type enumeration."""
    __test__ = False

    FULL_LENGTH = "full_length"
    SECTIONAL = "sectional"
    CHAPTER = "chapter"
    QUIZ = "quiz"


# ============ Test Series Schemas ============

class TestSeriesBase(BaseModel):
    """Base test series schema."""
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    test_type: TestType
    duration_minutes: int = 90
    total_questions: int = 100
    marks_per_question: float = 1.0
    negative_marking: bool = True
    negative_marks_per_question: float = 0.25
    is_premium: bool = False
    is_active: bool = True
    subject_ids: Optional[List[UUID]] = None
    topic_ids: Optional[List[UUID]] = None
    instructions: Optional[str] = None
    passing_percentage: float = 35.0


class TestSeriesCreate(TestSeriesBase):
    """Schema for creating a test series."""
    __test__ = False

    pass


class TestSeriesUpdate(BaseModel):
    """Schema for updating a test series."""
    __test__ = False

    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    total_questions: Optional[int] = None
    marks_per_question: Optional[float] = None
    negative_marking: Optional[bool] = None
    negative_marks_per_question: Optional[float] = None
    is_premium: Optional[bool] = None
    is_active: Optional[bool] = None
    subject_ids: Optional[List[UUID]] = None
    topic_ids: Optional[List[UUID]] = None
    instructions: Optional[str] = None
    passing_percentage: Optional[float] = None


class TestSeriesResponse(BaseModel):
    """Response schema for a test series."""
    id: UUID
    title: str
    description: Optional[str] = None
    test_type: TestType
    duration_minutes: int
    total_questions: int
    marks_per_question: float
    negative_marking: bool
    negative_marks_per_question: float
    is_premium: bool
    is_active: bool
    instructions: Optional[str] = None
    passing_percentage: float
    attempt_count: int = 0  # Number of attempts by user
    best_score: Optional[float] = None  # User's best score
    last_attempt_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class TestSeriesListResponse(BaseModel):
    """Response schema for listing test series."""
    id: str
    title: str
    description: Optional[str] = None
    test_type: TestType
    duration_minutes: int
    total_questions: int
    is_premium: bool
    attempt_count: int = 0
    best_score: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)


class TestSeriesDetailResponse(TestSeriesResponse):
    """Response schema for test series detail."""
    subject_ids: Optional[List[str]] = None
    topic_ids: Optional[List[str]] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Attempt Schemas ============

class AttemptStartResponse(BaseModel):
    """Response schema for starting a test attempt."""
    attempt_id: UUID
    test_series_id: UUID
    started_at: datetime
    duration_minutes: int
    total_questions: int
    first_question: "QuestionInAttemptResponse"
    
    model_config = ConfigDict(from_attributes=True)


class QuestionInAttemptResponse(BaseModel):
    """Response schema for question during attempt."""
    id: UUID
    question_text: str
    options: List[str]
    order_index: int
    is_flagged: bool = False
    selected_option: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class AnswerSaveRequest(BaseModel):
    """Request schema for saving an answer."""
    selected_option: Optional[str] = Field(None, pattern=r'^[A-D]$|^$')  # A, B, C, D or empty to clear
    is_flagged: Optional[bool] = False


class AnswerSaveResponse(BaseModel):
    """Response schema for saving an answer."""
    question_id: UUID
    saved: bool
    selected_option: Optional[str] = None
    is_flagged: bool
    
    model_config = ConfigDict(from_attributes=True)


class AttemptSubmitRequest(BaseModel):
    """Request schema for submitting an attempt."""
    confirm: bool = Field(True, description="Confirmation flag")


class AttemptSubmitResponse(BaseModel):
    """Response schema for submitting an attempt."""
    attempt_id: UUID
    submitted_at: datetime
    total_score: float
    max_score: float
    correct_count: int
    incorrect_count: int
    unattempted_count: int
    time_spent_seconds: int
    is_passed: bool
    
    model_config = ConfigDict(from_attributes=True)


# ============ Result Schemas ============

class SectionBreakdown(BaseModel):
    """Section-wise score breakdown."""
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    total_questions: int
    correct: int
    incorrect: int
    unattempted: int
    marks_obtained: float
    max_marks: float


class QuestionResultDetail(BaseModel):
    """Detailed result for a single question."""
    question_id: UUID
    order_index: int
    question_text: str
    selected_option: Optional[str] = None
    correct_option: str
    is_correct: bool
    marks_obtained: float
    time_spent_seconds: int
    explanation: Optional[str] = None


class AttemptResultsResponse(BaseModel):
    """Response schema for attempt results."""
    attempt_id: UUID
    test_series_id: UUID
    test_title: str
    completed_at: datetime
    total_score: float
    max_score: float
    percentage: float
    correct_count: int
    incorrect_count: int
    unattempted_count: int
    time_spent_seconds: int
    rank_percentile: Optional[float] = None
    rank: Optional[int] = None
    is_passed: bool
    passing_percentage: float
    section_breakdown: List[SectionBreakdown] = []
    
    model_config = ConfigDict(from_attributes=True)


class AttemptHistoryResponse(BaseModel):
    """Response schema for attempt history."""
    attempt_id: str
    test_series_id: str
    test_title: str
    test_type: TestType
    completed_at: datetime
    total_score: float
    max_score: float
    percentage: float
    rank_percentile: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============ Solution Schemas ============

class SolutionResponse(BaseModel):
    """Response schema for question solution."""
    question_id: UUID
    order_index: int
    question_text: str
    options: List[str]
    selected_option: Optional[str] = None
    correct_option: str
    is_correct: bool
    explanation: Optional[str] = None
    topic_name: Optional[str] = None
    difficulty: str
    
    model_config = ConfigDict(from_attributes=True)


class SolutionsResponse(BaseModel):
    """Response schema for all solutions in an attempt."""
    attempt_id: UUID
    test_title: str
    solutions: List[SolutionResponse]


# ============ AI Analysis Schemas ============

class WeakTopic(BaseModel):
    """Weak topic identified from performance."""
    topic_id: str
    topic_name: str
    subject_id: str
    subject_name: str
    error_rate: float
    questions_attempted: int
    questions_incorrect: int


class AIRecommendation(BaseModel):
    """AI recommendation for next action."""
    type: str  # "test", "lesson", "revision"
    title: str
    description: str
    priority: int  # 1 = highest
    topic_id: Optional[str] = None
    test_id: Optional[str] = None
    lesson_id: Optional[str] = None


class AttemptAnalysisResponse(BaseModel):
    """Response schema for AI analysis of attempt."""
    attempt_id: UUID
    overall_accuracy: float
    strength_index: float
    weak_topics: List[WeakTopic]
    recommended_tests: List[AIRecommendation]
    improvement_tips: List[str]
    estimated_cutoff: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)


# Update forward references
AttemptStartResponse.model_rebuild()
