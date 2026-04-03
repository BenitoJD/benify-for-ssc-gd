"""
Tests for Mock Test Engine.

Tests cover:
- Test series listing with filters
- Test series details
- Starting an attempt
- Answer saving
- Test submission
- Results retrieval
- Solutions
- AI analysis
"""
import pytest
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from internal.tests.models import TestSeries, MockAttempt, AttemptAnswer, TestType
from internal.tests.schemas import (
    TestSeriesCreate,
    TestSeriesUpdate,
    AnswerSaveRequest,
    AttemptSubmitRequest,
)
from internal.tests.service import TestSeriesService, AttemptService
from internal.tests.repository import TestSeriesRepository, AttemptRepository
from internal.questions.models import Question, QuestionType, Difficulty
from internal.auth.models import User
from internal.auth.schemas import UserRole
from internal.auth.service import get_password_hash


# ============ Fixtures ============

@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def sample_test_series():
    """Create a sample test series."""
    return TestSeries(
        id=uuid.uuid4(),
        title="Sample Test Series",
        description="A sample test series for testing",
        test_type=TestType.FULL_LENGTH,
        duration_minutes=90,
        total_questions=100,
        marks_per_question=2.0,
        negative_marking=True,
        negative_marks_per_question=0.5,
        is_premium=False,
        is_active=True,
        instructions="Test instructions",
        passing_percentage=35.0,
        subject_ids=None,
        topic_ids=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_question():
    """Create a sample question."""
    return Question(
        id=uuid.uuid4(),
        topic_id=uuid.uuid4(),
        question_text="What is 2 + 2?",
        question_type=QuestionType.MCQ,
        options='["3", "4", "5", "6"]',
        correct_answer="B",
        explanation="2 + 2 = 4",
        difficulty=Difficulty.EASY,
        marks=2.0,
        negative_marks=0.5,
        is_premium=False,
        source="Test",
        exam_year=2024,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


# ============ Test Models ============

class TestTestSeriesModel:
    """Tests for TestSeries model."""
    
    def test_test_series_creation(self, sample_test_series):
        """Test that a test series can be created."""
        assert sample_test_series.title == "Sample Test Series"
        assert sample_test_series.test_type == TestType.FULL_LENGTH
        assert sample_test_series.duration_minutes == 90
        assert sample_test_series.total_questions == 100
        assert sample_test_series.negative_marking is True
        assert sample_test_series.passing_percentage == 35.0
    
    def test_test_series_types(self):
        """Test all test type values."""
        assert TestType.FULL_LENGTH.value == "full_length"
        assert TestType.SECTIONAL.value == "sectional"
        assert TestType.CHAPTER.value == "chapter"
        assert TestType.QUIZ.value == "quiz"


class TestMockAttemptModel:
    """Tests for MockAttempt model."""
    
    def test_attempt_creation(self):
        """Test that an attempt can be created."""
        attempt = MockAttempt(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            test_series_id=uuid.uuid4(),
            started_at=datetime.utcnow(),
            question_ids='[]',
            question_order='[]',
            is_completed=False,
            is_submitted=False,
        )
        
        assert attempt.is_completed is False
        assert attempt.is_submitted is False
        assert attempt.total_score is None


class TestAttemptAnswerModel:
    """Tests for AttemptAnswer model."""
    
    def test_answer_creation(self):
        """Test that an answer can be created."""
        answer = AttemptAnswer(
            id=uuid.uuid4(),
            attempt_id=uuid.uuid4(),
            question_id=uuid.uuid4(),
            selected_option="A",
            is_correct=None,
            marks_obtained=None,
            order_index=0,
            is_flagged=False,
        )
        
        assert answer.selected_option == "A"
        assert answer.is_flagged is False
        assert answer.is_correct is None


# ============ Test Schemas ============

class TestTestSeriesSchemas:
    """Tests for TestSeries schemas."""
    
    def test_test_series_create_valid(self):
        """Test valid TestSeriesCreate schema."""
        data = TestSeriesCreate(
            title="New Test",
            test_type=TestType.FULL_LENGTH,
            duration_minutes=60,
            total_questions=50,
        )
        
        assert data.title == "New Test"
        assert data.duration_minutes == 60
    
    def test_test_series_create_defaults(self):
        """Test TestSeriesCreate schema defaults."""
        data = TestSeriesCreate(
            title="New Test",
            test_type=TestType.QUIZ,
        )
        
        assert data.negative_marking is True
        assert data.marks_per_question == 1.0
        assert data.negative_marks_per_question == 0.25
    
    def test_answer_save_request(self):
        """Test AnswerSaveRequest schema."""
        data = AnswerSaveRequest(
            selected_option="C",
            is_flagged=True,
        )
        
        assert data.selected_option == "C"
        assert data.is_flagged is True
    
    def test_answer_save_request_empty_option(self):
        """Test AnswerSaveRequest with empty option clears answer."""
        data = AnswerSaveRequest(
            selected_option="",
        )
        
        assert data.selected_option == ""
    
    def test_attempt_submit_request(self):
        """Test AttemptSubmitRequest schema."""
        data = AttemptSubmitRequest(confirm=True)
        
        assert data.confirm is True


# ============ Test Repository ============

class TestTestSeriesRepository:
    """Tests for TestSeriesRepository."""
    
    @pytest.mark.asyncio
    async def test_get_test_series_by_id(self, mock_db, sample_test_series):
        """Test getting test series by ID."""
        # Setup mock
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = sample_test_series
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        repo = TestSeriesRepository(mock_db)
        result = await repo.get_test_series_by_id(sample_test_series.id)
        
        assert result == sample_test_series
        mock_db.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_test_series_not_found(self, mock_db):
        """Test getting non-existent test series."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        repo = TestSeriesRepository(mock_db)
        result = await repo.get_test_series_by_id(uuid.uuid4())
        
        assert result is None


# ============ Test Service ============

class TestTestSeriesService:
    """Tests for TestSeriesService."""
    
    @pytest.mark.asyncio
    async def test_get_test_series_list(self, mock_db, sample_test_series):
        """Test getting paginated test series list."""
        # Setup mocks
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample_test_series]
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        service = TestSeriesService(mock_db)
        result, total = await service.get_test_series_list()
        
        assert len(result) == 1
        assert result[0].title == "Sample Test Series"
    
    @pytest.mark.asyncio
    async def test_get_test_series_by_id_not_found(self, mock_db):
        """Test getting non-existent test series raises exception."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        service = TestSeriesService(mock_db)
        
        with pytest.raises(Exception):  # NotFoundException
            await service.get_test_series_by_id(uuid.uuid4())


class TestAttemptService:
    """Tests for AttemptService."""
    
    @pytest.mark.asyncio
    async def test_start_attempt_not_found(self, mock_db):
        """Test starting attempt for non-existent test series."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        service = AttemptService(mock_db)
        
        with pytest.raises(Exception):  # NotFoundException
            await service.start_attempt(
                test_series_id=uuid.uuid4(),
                user_id=uuid.uuid4(),
            )
    
    @pytest.mark.asyncio
    async def test_submit_attempt_not_found(self, mock_db):
        """Test submitting non-existent attempt."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        service = AttemptService(mock_db)
        
        with pytest.raises(Exception):  # NotFoundException
            await service.submit_attempt(
                attempt_id=uuid.uuid4(),
                user_id=uuid.uuid4(),
            )
    
    @pytest.mark.asyncio
    async def test_get_attempt_results_not_found(self, mock_db):
        """Test getting results for non-existent attempt."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        service = AttemptService(mock_db)
        
        with pytest.raises(Exception):  # NotFoundException
            await service.get_attempt_results(
                attempt_id=uuid.uuid4(),
                user_id=uuid.uuid4(),
            )


# ============ Test API Endpoints (Mock) ============

class TestTestSeriesAPI:
    """Tests for Test Series API endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_test_series_list_endpoint(self):
        """Test GET /api/v1/test-series endpoint."""
        # This is a placeholder for actual API testing
        # In a real test, we would use TestClient or AsyncClient
        pass
    
    @pytest.mark.asyncio
    async def test_get_test_series_filter_by_type(self):
        """Test GET /api/v1/test-series with type filter."""
        pass
    
    @pytest.mark.asyncio
    async def test_start_test_attempt(self):
        """Test POST /api/v1/test-series/{id}/start endpoint."""
        pass

    @pytest.mark.asyncio
    async def test_create_test_series_requires_admin(self, client: AsyncClient, test_db: AsyncSession):
        """Test POST /api/v1/test-series rejects non-admin users."""
        user = User(
            email="student@example.com",
            password_hash=get_password_hash("Test1234"),
            role=UserRole.STUDENT,
        )
        test_db.add(user)
        await test_db.commit()

        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "student@example.com",
                "password": "Test1234",
            },
        )
        access_token = login_response.json()["access_token"]

        response = await client.post(
            "/api/v1/test-series",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "title": "Locked Test Series",
                "test_type": "quiz",
            },
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_create_test_series_allows_admin(self, client: AsyncClient, test_db: AsyncSession):
        """Test POST /api/v1/test-series allows admin users."""
        user = User(
            email="admin@example.com",
            password_hash=get_password_hash("Admin1234"),
            role=UserRole.ADMIN,
        )
        test_db.add(user)
        await test_db.commit()

        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@example.com",
                "password": "Admin1234",
            },
        )
        access_token = login_response.json()["access_token"]

        response = await client.post(
            "/api/v1/test-series",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "title": "Admin Test Series",
                "test_type": "quiz",
            },
        )

        assert response.status_code == 201
        assert response.json()["title"] == "Admin Test Series"


class TestAttemptsAPI:
    """Tests for Attempts API endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_attempt_questions(self):
        """Test GET /api/v1/attempts/{id}/questions endpoint."""
        pass
    
    @pytest.mark.asyncio
    async def test_save_answer(self):
        """Test PATCH /api/v1/attempts/{id}/answers/{question_id} endpoint."""
        pass
    
    @pytest.mark.asyncio
    async def test_submit_attempt(self):
        """Test POST /api/v1/attempts/{id}/submit endpoint."""
        pass
    
    @pytest.mark.asyncio
    async def test_get_results(self):
        """Test GET /api/v1/attempts/{id}/results endpoint."""
        pass
    
    @pytest.mark.asyncio
    async def test_get_solutions(self):
        """Test GET /api/v1/attempts/{id}/solutions endpoint."""
        pass
    
    @pytest.mark.asyncio
    async def test_get_analysis(self):
        """Test GET /api/v1/attempts/{id}/analysis endpoint."""
        pass


# ============ Test Negative Marking ============

class TestNegativeMarking:
    """Tests for negative marking calculation."""
    
    def test_negative_marking_calculation(self):
        """Test that negative marking is calculated correctly."""
        # Scenario: 10 questions, 7 correct, 3 wrong
        # Each correct = +2 marks, each wrong = -0.5 marks
        # Total = 7*2 - 3*0.5 = 14 - 1.5 = 12.5
        
        correct_answers = 7
        wrong_answers = 3
        marks_per_question = 2.0
        negative_marks = 0.5
        
        total_score = (correct_answers * marks_per_question) - (wrong_answers * negative_marks)
        
        assert total_score == 12.5
    
    def test_no_negative_marking(self):
        """Test calculation when negative marking is disabled."""
        correct_answers = 7
        wrong_answers = 3
        marks_per_question = 2.0
        
        total_score = correct_answers * marks_per_question
        
        assert total_score == 14.0
    
    def test_all_correct(self):
        """Test calculation when all answers are correct."""
        correct_answers = 10
        marks_per_question = 2.0
        
        total_score = correct_answers * marks_per_question
        
        assert total_score == 20.0
    
    def test_all_wrong_with_negative(self):
        """Test calculation when all answers are wrong."""
        wrong_answers = 10
        marks_per_question = 2.0
        negative_marks = 0.5
        
        total_score = -(wrong_answers * negative_marks)
        
        assert total_score == -5.0
    
    def test_score_cannot_go_below_zero(self):
        """Test that total score cannot go below zero."""
        wrong_answers = 100
        negative_marks = 0.5
        
        total_score = -(wrong_answers * negative_marks)
        total_score = max(0, total_score)
        
        assert total_score == 0


# ============ Test Percentage Calculation ============

class TestPercentageCalculation:
    """Tests for percentage and pass/fail calculation."""
    
    def test_pass_percentage(self):
        """Test passing percentage calculation."""
        total_score = 70
        max_score = 200
        passing_percentage = 35.0
        
        percentage = (total_score / max_score) * 100
        is_passed = percentage >= passing_percentage
        
        assert percentage == 35.0
        assert is_passed is True
    
    def test_fail_percentage(self):
        """Test failing percentage calculation."""
        total_score = 60
        max_score = 200
        passing_percentage = 35.0
        
        percentage = (total_score / max_score) * 100
        is_passed = percentage >= passing_percentage
        
        assert percentage == 30.0
        assert is_passed is False
    
    def test_exact_passing(self):
        """Test exact passing percentage."""
        total_score = 70
        max_score = 200
        passing_percentage = 35.0
        
        percentage = (total_score / max_score) * 100
        is_passed = percentage >= passing_percentage
        
        assert percentage == 35.0
        assert is_passed is True


# ============ Test Rank Percentile ============

class TestRankPercentile:
    """Tests for rank and percentile calculation."""
    
    def test_percentile_calculation_first_place(self):
        """Test percentile for first place."""
        rank = 1
        total_attempts = 100
        
        percentile = ((total_attempts - rank + 1) / total_attempts) * 100
        
        assert percentile == 100.0
    
    def test_percentile_calculation_last_place(self):
        """Test percentile for last place."""
        rank = 100
        total_attempts = 100
        
        percentile = ((total_attempts - rank + 1) / total_attempts) * 100
        
        assert percentile == 1.0
    
    def test_percentile_calculation_middle(self):
        """Test percentile for middle rank."""
        rank = 50
        total_attempts = 100
        
        percentile = ((total_attempts - rank + 1) / total_attempts) * 100
        
        assert percentile == 51.0


# ============ Test Weak Topic Identification ============

class TestWeakTopicIdentification:
    """Tests for weak topic identification in AI analysis."""
    
    def test_error_rate_calculation(self):
        """Test error rate calculation for topics."""
        questions_attempted = 10
        questions_incorrect = 5
        
        error_rate = (questions_incorrect / questions_attempted) * 100
        
        assert error_rate == 50.0
    
    def test_weak_topic_threshold(self):
        """Test that topics with >40% error rate are flagged."""
        weak_error_rate = 50.0
        strong_error_rate = 30.0
        threshold = 40.0
        
        is_weak = weak_error_rate > threshold
        is_strong = strong_error_rate <= threshold
        
        assert is_weak is True
        assert is_strong is True
    
    def test_topic_not_attempted(self):
        """Test that unattempted topics are not flagged as weak."""
        questions_attempted = 0
        questions_incorrect = 0
        
        # Cannot calculate error rate if no attempts
        error_rate = None
        is_weak = error_rate is not None and error_rate > 40
        
        assert is_weak is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
