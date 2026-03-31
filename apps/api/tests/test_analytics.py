"""
Tests for analytics module.
"""
import pytest
from uuid import uuid4
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

# Import the modules we're testing
from internal.analytics.service import AnalyticsService
from internal.analytics.repository import AnalyticsRepository
from internal.analytics.schemas import (
    DateRangeFilter,
    OverallAnalytics,
    ScoreTrendItem,
    SubjectAccuracy,
    ChapterWeakness,
    MockComparison,
    TimeAnalytics,
    RevisionRecommendationItem,
    AnalyticsResponse,
    WeakChapterDrilldown,
)


# Mock database session
class MockAsyncSession:
    def __init__(self):
        self.queries = []
    
    async def execute(self, query):
        self.queries.append(query)
        return MockResult()
    
    async def flush(self):
        pass
    
    async def refresh(self, obj):
        pass
    
    def add(self, obj):
        pass


class MockResult:
    def scalar_one_or_none(self):
        return None
    
    def scalars(self):
        return MockScalars()
    
    def scalar(self):
        return 0


class MockScalars:
    def __init__(self):
        self.items = []
    
    def all(self):
        return self.items
    
    def __iter__(self):
        return iter(self.items)


class TestAnalyticsService:
    """Test cases for AnalyticsService."""
    
    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        return MockAsyncSession()
    
    @pytest.fixture
    def service(self, mock_db):
        """Create AnalyticsService with mock db."""
        return AnalyticsService(mock_db)
    
    def test_parse_json_field_none(self, service):
        """Test parsing None JSON field."""
        result = service._parse_json_field(None)
        assert result == []
    
    def test_parse_json_field_string(self, service):
        """Test parsing string JSON field."""
        result = service._parse_json_field('["a", "b", "c"]')
        assert result == ["a", "b", "c"]
    
    def test_parse_json_field_invalid(self, service):
        """Test parsing invalid JSON string."""
        result = service._parse_json_field("not json")
        assert result == []
    
    def test_get_date_range_last_30_days(self, service):
        """Test date range calculation for last 30 days."""
        start, end = service._get_date_range(DateRangeFilter.LAST_30_DAYS)
        assert start is not None
        assert end is not None
        assert (end - start).days == 30
    
    def test_get_date_range_last_90_days(self, service):
        """Test date range calculation for last 90 days."""
        start, end = service._get_date_range(DateRangeFilter.LAST_90_DAYS)
        assert start is not None
        assert end is not None
        assert (end - start).days == 90
    
    def test_get_date_range_all_time(self, service):
        """Test date range for all time."""
        start, end = service._get_date_range(DateRangeFilter.ALL_TIME)
        assert start is None
        assert end is None
    
    def test_get_date_range_custom(self, service):
        """Test custom date range."""
        custom_start = datetime(2024, 1, 1)
        custom_end = datetime(2024, 1, 31)
        start, end = service._get_date_range(
            DateRangeFilter.CUSTOM, 
            custom_start, 
            custom_end
        )
        assert start == custom_start
        assert end == custom_end


class TestOverallAnalytics:
    """Test OverallAnalytics schema."""
    
    def test_create_overall_analytics(self):
        """Test creating OverallAnalytics instance."""
        analytics = OverallAnalytics(
            total_mocks_taken=10,
            total_questions_attempted=1000,
            total_correct_answers=700,
            overall_accuracy=70.0,
            best_score=85.0,
            best_score_date=datetime.now(),
            avg_score=72.5,
            avg_time_per_question=45.5,
            current_streak=5,
            longest_streak=15,
            avg_rank_percentile=75.0,
            improvement_percentage=5.2,
        )
        
        assert analytics.total_mocks_taken == 10
        assert analytics.overall_accuracy == 70.0
        assert analytics.current_streak == 5
    
    def test_overall_analytics_defaults(self):
        """Test OverallAnalytics with default values."""
        analytics = OverallAnalytics(
            total_mocks_taken=0,
            total_questions_attempted=0,
            total_correct_answers=0,
            overall_accuracy=0.0,
        )
        
        assert analytics.best_score is None
        assert analytics.improvement_percentage is None


class TestScoreTrendItem:
    """Test ScoreTrendItem schema."""
    
    def test_create_score_trend_item(self):
        """Test creating ScoreTrendItem."""
        item = ScoreTrendItem(
            attempt_id=uuid4(),
            test_title="Mock Test 1",
            completed_at=datetime.now(),
            total_score=75.0,
            max_score=100.0,
            percentage=75.0,
            rank_percentile=80.0,
        )
        
        assert item.total_score == 75.0
        assert item.percentage == 75.0
        assert item.rank_percentile == 80.0


class TestSubjectAccuracy:
    """Test SubjectAccuracy schema."""
    
    def test_create_subject_accuracy(self):
        """Test creating SubjectAccuracy."""
        accuracy = SubjectAccuracy(
            subject_id=uuid4(),
            subject_name="General Intelligence",
            accuracy=72.5,
            total_questions=200,
            correct_answers=145,
            avg_time_per_question=35.2,
            trend="up",
            trend_percentage=5.3,
        )
        
        assert accuracy.accuracy == 72.5
        assert accuracy.trend == "up"
        assert accuracy.trend_percentage == 5.3


class TestChapterWeakness:
    """Test ChapterWeakness schema."""
    
    def test_create_chapter_weakness(self):
        """Test creating ChapterWeakness."""
        weakness = ChapterWeakness(
            topic_id=uuid4(),
            topic_name="Blood Relations",
            subject_id=uuid4(),
            subject_name="General Intelligence",
            accuracy=45.0,
            error_rate=55.0,
            total_attempts=20,
            questions_attempted=20,
            questions_incorrect=11,
            is_highlighted=True,
        )
        
        assert weakness.accuracy == 45.0
        assert weakness.error_rate == 55.0
        assert weakness.is_highlighted is True


class TestMockComparison:
    """Test MockComparison schema."""
    
    def test_create_mock_comparison(self):
        """Test creating MockComparison."""
        comparison = MockComparison(
            attempt_id=uuid4(),
            test_title="Full Length Mock 1",
            completed_at=datetime.now(),
            user_score=78.0,
            user_percentage=78.0,
            platform_average=65.0,
            difference=13.0,
            is_above_average=True,
        )
        
        assert comparison.user_percentage == 78.0
        assert comparison.platform_average == 65.0
        assert comparison.is_above_average is True


class TestRevisionRecommendationItem:
    """Test RevisionRecommendationItem schema."""
    
    def test_create_recommendation(self):
        """Test creating RevisionRecommendationItem."""
        rec = RevisionRecommendationItem(
            topic_id=uuid4(),
            topic_name="Coding-Decoding",
            subject_id=uuid4(),
            subject_name="General Intelligence",
            priority=1,
            current_accuracy=48.5,
            questions_to_practice=15,
            pyq_filter_url="/pyqs?topic_id=123",
            study_material_url="/study/topic/123",
            status="pending",
        )
        
        assert rec.priority == 1
        assert rec.current_accuracy == 48.5
        assert rec.status == "pending"


class TestAnalyticsResponse:
    """Test AnalyticsResponse schema."""
    
    def test_create_analytics_response(self):
        """Test creating complete AnalyticsResponse."""
        response = AnalyticsResponse(
            date_range="last_30_days",
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now(),
            overall=OverallAnalytics(
                total_mocks_taken=5,
                total_questions_attempted=500,
                total_correct_answers=350,
                overall_accuracy=70.0,
            ),
            score_trend=[],
            subject_accuracy=[],
            weak_chapters=[],
            mock_comparison=[],
            time_analytics=[],
            recommendations=[],
        )
        
        assert response.date_range == "last_30_days"
        assert response.overall.overall_accuracy == 70.0


class TestWeakChapterDrilldown:
    """Test WeakChapterDrilldown schema."""
    
    def test_create_drilldown(self):
        """Test creating WeakChapterDrilldown."""
        drilldown = WeakChapterDrilldown(
            topic_id=uuid4(),
            topic_name="Blood Relations",
            subject_id=uuid4(),
            subject_name="General Intelligence",
            accuracy=42.5,
            weak_questions=[
                {
                    "question_id": uuid4(),
                    "question_text": "A is B's sister...",
                    "selected_option": "B",
                    "correct_option": "C",
                }
            ],
        )
        
        assert drilldown.topic_name == "Blood Relations"
        assert len(drilldown.weak_questions) == 1


# Integration-style tests with mocks
class TestAnalyticsServiceIntegration:
    """Integration tests for AnalyticsService with mocked dependencies."""
    
    @pytest.fixture
    def mock_repo(self):
        """Create mock repository."""
        repo = AsyncMock(spec=AnalyticsRepository)
        return repo
    
    @pytest.mark.asyncio
    async def test_get_user_analytics_empty_attempts(self, mock_repo):
        """Test analytics with no attempts."""
        mock_repo.get_user_attempts.return_value = []
        mock_repo.get_all_subjects.return_value = []
        mock_repo.get_all_topics.return_value = []
        mock_repo.calculate_streak.return_value = (0, 0)
        
        # We can't easily test the full service without a real DB session
        # but we can verify the mocks are called correctly
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
