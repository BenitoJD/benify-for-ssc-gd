from typing import Literal, Optional

from pydantic import BaseModel, Field

from ..questions.schemas import Difficulty, QuestionType
from ..tests.schemas import TestType


class SubjectSyncItem(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    icon_url: Optional[str] = None
    order_index: int = 0


class TopicSyncItem(BaseModel):
    subject_code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    order_index: int = 0
    estimated_hours: Optional[float] = None


class LessonSyncItem(BaseModel):
    subject_code: str = Field(..., min_length=1, max_length=50)
    topic_name: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int = 0
    estimated_minutes: Optional[int] = None
    is_premium: bool = False


class QuestionSyncItem(BaseModel):
    subject_code: str = Field(..., min_length=1, max_length=50)
    topic_name: str = Field(..., min_length=1, max_length=255)
    question_text: str = Field(..., min_length=1)
    question_type: QuestionType = QuestionType.MCQ
    options: list[str] = Field(..., min_length=2, max_length=6)
    correct_answer: str = Field(..., pattern=r"^[A-D]$")
    explanation: Optional[str] = None
    difficulty: Difficulty = Difficulty.MEDIUM
    marks: float = 1.0
    negative_marks: float = 0.25
    is_premium: bool = False
    source: Optional[str] = None
    exam_year: Optional[int] = None


class TopicReference(BaseModel):
    subject_code: str = Field(..., min_length=1, max_length=50)
    topic_name: str = Field(..., min_length=1, max_length=255)


class TestSeriesSyncItem(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    test_type: TestType
    duration_minutes: int = 90
    total_questions: int = 100
    marks_per_question: float = 1.0
    negative_marking: bool = True
    negative_marks_per_question: float = 0.25
    is_premium: bool = False
    is_active: bool = True
    subject_codes: Optional[list[str]] = None
    topic_refs: Optional[list[TopicReference]] = None
    instructions: Optional[str] = None
    passing_percentage: float = 35.0


class ContentSyncRequest(BaseModel):
    dry_run: bool = False
    subjects: list[SubjectSyncItem] = []
    topics: list[TopicSyncItem] = []
    lessons: list[LessonSyncItem] = []
    questions: list[QuestionSyncItem] = []
    test_series: list[TestSeriesSyncItem] = []


class SyncActionResult(BaseModel):
    action: Literal["created", "updated", "skipped", "error"]
    identifier: str
    detail: Optional[str] = None


class ResourceSyncSummary(BaseModel):
    processed: int = 0
    created: int = 0
    updated: int = 0
    skipped: int = 0
    errors: int = 0
    items: list[SyncActionResult] = []


class ContentSyncResponse(BaseModel):
    dry_run: bool
    subjects: ResourceSyncSummary
    topics: ResourceSyncSummary
    lessons: ResourceSyncSummary
    questions: ResourceSyncSummary
    test_series: ResourceSyncSummary


class OpenCloudCapabilitiesResponse(BaseModel):
    opencloud_api_key_enabled: bool
    auth_modes: list[str]
    bulk_sync_endpoint: str
    supported_resources: list[str]


class ContentSyncAuditLogResponse(BaseModel):
    id: str
    actor_id: str
    actor_email: Optional[str] = None
    dry_run: bool
    status: str
    error_message: Optional[str] = None
    created_at: str


class ContentSyncAuditLogListResponse(BaseModel):
    data: list[ContentSyncAuditLogResponse]
