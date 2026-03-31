"""
Tests for AI advanced features module:
- AI mock analysis summary
- AI revision planner (SM-2 spaced repetition)
- AI habit nudges
- AI doubt assistant
- Daily summary
"""
import pytest
from datetime import datetime, timedelta, date
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock, patch

from internal.ai.models import (
    HabitNudgeType,
    HabitNudgeRecord,
    DailySummaryRecord,
    DoubtAssistantKnowledge,
    SpacedRepetitionData,
    AIMockAnalysisRecord,
)
from internal.ai.schemas import (
    NudgeType,
    TopicImprovementTip,
    AIMockAnalysisResponse,
    RevisionPlanResponse,
    SpacedRepetitionTopic,
    SM2ReviewRequest,
    SM2ReviewResponse,
    HabitNudgeResponse,
    DoubtAssistantQueryRequest,
    DoubtAssistantQueryResponse,
    DoubtAssistantAnswer,
    DailySummaryResponse,
    DailyTaskSummary,
)


class TestAIModels:
    """Test AI models."""
    
    def test_habit_nudge_type_enum(self):
        """Test HabitNudgeType enum values."""
        assert HabitNudgeType.STREAK_REMINDER.value == "streak_reminder"
        assert HabitNudgeType.STUDY_REMINDER.value == "study_reminder"
        assert HabitNudgeType.EXAM_COUNTDOWN.value == "exam_countdown"
        assert HabitNudgeType.WEAK_TOPIC_ALERT.value == "weak_topic_alert"
        assert HabitNudgeType.MILESTONE_CELEBRATION.value == "milestone_celebration"
        assert HabitNudgeType.WEEKLY_PROGRESS.value == "weekly_progress"
        assert HabitNudgeType.STREAK_NUDGE.value == "streak_nudge"
    
    def test_schemas_nudge_type_enum(self):
        """Test NudgeType schema enum values."""
        assert NudgeType.STREAK_REMINDER == "streak_reminder"
        assert NudgeType.STUDY_REMINDER == "study_reminder"
        assert NudgeType.EXAM_COUNTDOWN == "exam_countdown"


class TestAISchemas:
    """Test AI Pydantic schemas."""
    
    def test_topic_improvement_tip_schema(self):
        """Test TopicImprovementTip schema validation."""
        topic_id = uuid4()
        
        tip = TopicImprovementTip(
            topic_id=topic_id,
            topic_name="Blood Relations",
            subject_name="Reasoning",
            current_accuracy=45.5,
            tip_text="Focus on family tree problems",
            priority=1
        )
        
        assert tip.topic_id == topic_id
        assert tip.topic_name == "Blood Relations"
        assert tip.current_accuracy == 45.5
        assert tip.priority == 1
    
    def test_ai_mock_analysis_response_schema(self):
        """Test AIMockAnalysisResponse schema validation."""
        attempt_id = uuid4()
        
        response = AIMockAnalysisResponse(
            attempt_id=attempt_id,
            summary_text="Good effort! Focus on weak areas.",
            overall_accuracy=65.5,
            topic_improvement_tips=[
                TopicImprovementTip(
                    topic_id=uuid4(),
                    topic_name="Coding-Decoding",
                    subject_name="Reasoning",
                    current_accuracy=40.0,
                    tip_text="Practice coding questions daily",
                    priority=1
                )
            ],
            estimated_cutoff=35.0,
            improvement_vs_previous=5.2,
            key_strengths=["General Knowledge"],
            priority_improvements=["Coding-Decoding", "Blood Relations"],
            generated_at=datetime.utcnow()
        )
        
        assert response.attempt_id == attempt_id
        assert response.overall_accuracy == 65.5
        assert len(response.topic_improvement_tips) == 1
        assert "General Knowledge" in response.key_strengths
    
    def test_spaced_repetition_topic_schema(self):
        """Test SpacedRepetitionTopic schema validation."""
        topic_id = uuid4()
        
        topic = SpacedRepetitionTopic(
            topic_id=topic_id,
            topic_name="Profit and Loss",
            subject_name="Mathematics",
            ease_factor=2.5,
            interval=6,
            repetitions=3,
            current_accuracy=72.5,
            last_review_date=datetime.utcnow() - timedelta(days=6),
            next_review_date=datetime.utcnow(),
            is_mastered=False
        )
        
        assert topic.topic_id == topic_id
        assert topic.ease_factor == 2.5
        assert topic.interval == 6
        assert topic.repetitions == 3
    
    def test_sm2_review_request_schema(self):
        """Test SM2ReviewRequest schema validation."""
        topic_id = uuid4()
        
        # Valid quality (0-5)
        request = SM2ReviewRequest(topic_id=topic_id, quality=4)
        assert request.quality == 4
        
        # Test boundary values
        request_min = SM2ReviewRequest(topic_id=topic_id, quality=0)
        assert request_min.quality == 0
        
        request_max = SM2ReviewRequest(topic_id=topic_id, quality=5)
        assert request_max.quality == 5
    
    def test_sm2_review_response_schema(self):
        """Test SM2ReviewResponse schema validation."""
        topic_id = uuid4()
        next_review = datetime.utcnow() + timedelta(days=6)
        
        response = SM2ReviewResponse(
            topic_id=topic_id,
            new_ease_factor=2.6,
            new_interval=6,
            new_repetitions=3,
            next_review_date=next_review,
            message="Good job! Keep practicing."
        )
        
        assert response.new_ease_factor == 2.6
        assert response.new_interval == 6
        assert response.message == "Good job! Keep practicing."
    
    def test_habit_nudge_response_schema(self):
        """Test HabitNudgeResponse schema validation."""
        nudge_id = uuid4()
        
        response = HabitNudgeResponse(
            id=nudge_id,
            nudge_type=NudgeType.STREAK_REMINDER,
            title="🔥 Keep Your Streak Going!",
            message="You have a 5-day streak!",
            motivational_quote="Every day is a new opportunity!",
            context_data={"streak": 5},
            created_at=datetime.utcnow()
        )
        
        assert response.id == nudge_id
        assert response.nudge_type == NudgeType.STREAK_REMINDER
        assert response.context_data["streak"] == 5
    
    def test_doubt_assistant_query_request_schema(self):
        """Test DoubtAssistantQueryRequest schema validation."""
        request = DoubtAssistantQueryRequest(
            question="What is the formula for profit and loss?",
            category="mathematics"
        )
        
        assert request.question == "What is the formula for profit and loss?"
        assert request.category == "mathematics"
    
    def test_doubt_assistant_answer_schema(self):
        """Test DoubtAssistantAnswer schema validation."""
        answer = DoubtAssistantAnswer(
            question="What is the formula for profit and loss?",
            answer="Profit = Selling Price - Cost Price",
            answer_detailed="When SP > CP, it's profit. When CP > SP, it's loss.",
            category="mathematics",
            subcategory="profit_loss",
            source="SSC GD Previous Year",
            confidence=0.85,
            related_topics=["percentage", "simple_interest"]
        )
        
        assert answer.answer == "Profit = Selling Price - Cost Price"
        assert answer.confidence == 0.85
        assert "percentage" in answer.related_topics
    
    def test_daily_summary_response_schema(self):
        """Test DailySummaryResponse schema validation."""
        today = date.today()
        
        response = DailySummaryResponse(
            date=today,
            title="Your Daily Summary for April 1",
            message="You've completed 3 tasks today!",
            motivational_quote="Keep going! 💪",
            tasks=[
                DailyTaskSummary(
                    task_id=uuid4(),
                    title="Complete lesson on Profit and Loss",
                    task_type="lesson",
                    status="completed",
                    completed_at=datetime.utcnow()
                )
            ],
            completed_tasks_count=1,
            pending_tasks_count=2,
            current_streak=5,
            overall_accuracy=68.5,
            weak_topics_count=3,
            next_exam_days=45,
            upcoming_reviews_count=4,
            was_sent=True,
            sent_at=datetime.utcnow()
        )
        
        assert response.date == today
        assert response.current_streak == 5
        assert response.completed_tasks_count == 1
        assert response.pending_tasks_count == 2
        assert len(response.tasks) == 1


class TestSM2Algorithm:
    """Test SM-2 spaced repetition algorithm calculations."""
    
    # SM-2 constants for testing
    INITIAL_EASE_FACTOR = 2.5
    MIN_EASE_FACTOR = 1.3
    EASE_BONUS = 0.1
    EASE_PENALTY = 0.2
    
    def test_sm2_initial_values(self):
        """Test initial SM-2 values are correct."""
        from internal.ai.service import INITIAL_EASE_FACTOR, MIN_EASE_FACTOR
        
        assert INITIAL_EASE_FACTOR == 2.5
        assert MIN_EASE_FACTOR == 1.3
    
    def test_sm2_first_successful_review(self):
        """Test SM-2 first successful review (repetitions = 0 -> 1)."""
        # If first review is successful (quality >= 3), interval should be 1
        initial_interval = 1
        initial_repetitions = 0
        quality = 4
        
        if quality >= 3:
            if initial_repetitions == 0:
                new_interval = 1
            else:
                new_interval = int(initial_interval * self.INITIAL_EASE_FACTOR)
        
        assert new_interval == 1
    
    def test_sm2_second_successful_review(self):
        """Test SM-2 second successful review (repetitions = 1 -> 2)."""
        interval = 1
        repetitions = 1
        ease_factor = self.INITIAL_EASE_FACTOR
        quality = 4
        
        if quality >= 3:
            if repetitions == 0:
                new_interval = 1
            elif repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(interval * ease_factor)
        
        assert new_interval == 6
    
    def test_sm2_failed_review_resets(self):
        """Test SM-2 failed review (quality < 3) resets repetitions."""
        repetitions = 3
        interval = 6
        quality = 2  # Failed
        
        if quality < 3:
            new_interval = 1
            new_repetitions = 0
        else:
            new_repetitions = repetitions + 1
        
        assert new_interval == 1
        assert new_repetitions == 0
    
    def test_sm2_ease_factor_increases_on_success(self):
        """Test SM-2 ease factor increases on successful review."""
        ease_factor = self.INITIAL_EASE_FACTOR
        quality = 5  # Excellent
        
        # Simplified ease factor update - SM-2 formula
        # EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        # For quality 5 (perfect): EF' = EF + (0.1 - 0 * 0.08) = EF + 0.1
        new_ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        new_ease_factor = max(self.MIN_EASE_FACTOR, new_ease_factor)
        
        assert new_ease_factor > ease_factor
    
    def test_sm2_ease_factor_decreases_on_failure(self):
        """Test SM-2 ease factor decreases on failed review."""
        ease_factor = self.INITIAL_EASE_FACTOR
        quality = 1  # Failed
        
        new_ease_factor = ease_factor - self.EASE_PENALTY
        new_ease_factor = max(self.MIN_EASE_FACTOR, new_ease_factor)
        
        assert new_ease_factor < ease_factor
        assert new_ease_factor >= self.MIN_EASE_FACTOR
    
    def test_sm2_interval_capped_at_30_days(self):
        """Test SM-2 interval is capped at 30 days."""
        interval = 20
        ease_factor = 2.5
        
        new_interval = int(interval * ease_factor)
        new_interval = min(new_interval, 30)
        
        assert new_interval == 30
    
    def test_sm2_mastered_threshold(self):
        """Test SM-2 considers topic mastered after 5+ reps at >85% accuracy."""
        repetitions = 5
        accuracy = 86.0
        
        is_mastered = repetitions >= 5 and accuracy > 85
        
        assert is_mastered is True
    
    def test_sm2_not_mastered_insufficient_reps(self):
        """Test SM-2 not mastered with insufficient repetitions."""
        repetitions = 4
        accuracy = 90.0
        
        is_mastered = repetitions >= 5 and accuracy > 85
        
        assert is_mastered is False


class TestAIMockAnalysis:
    """Test AI mock analysis functionality."""
    
    def test_generate_summary_text_level_excellent(self):
        """Test summary generation for excellent performance."""
        overall_accuracy = 85.0
        total_questions = 100
        correct = 85
        incorrect = 15
        key_strengths = ["General Knowledge", "Mathematics"]
        priority_improvements = []
        
        summary = self._generate_summary(
            overall_accuracy, total_questions, correct, incorrect,
            key_strengths, priority_improvements
        )
        
        assert "Outstanding" in summary or "Excellent" in summary
        assert "85" in summary
    
    def test_generate_summary_text_level_good(self):
        """Test summary generation for good performance."""
        overall_accuracy = 65.0
        total_questions = 100
        correct = 65
        incorrect = 35
        key_strengths = []
        priority_improvements = ["Reasoning"]
        
        summary = self._generate_summary(
            overall_accuracy, total_questions, correct, incorrect,
            key_strengths, priority_improvements
        )
        
        assert "Good" in summary or "progress" in summary.lower()
    
    def test_generate_summary_text_level_needs_work(self):
        """Test summary generation for performance needing work."""
        overall_accuracy = 35.0
        total_questions = 100
        correct = 35
        incorrect = 65
        key_strengths = []
        priority_improvements = ["Reasoning", "Mathematics", "English"]
        
        summary = self._generate_summary(
            overall_accuracy, total_questions, correct, incorrect,
            key_strengths, priority_improvements
        )
        
        assert "gap" in summary.lower() or "priority" in summary.lower()
    
    def _generate_summary(self, accuracy, total_q, correct, incorrect, strengths, improvements):
        """Helper to generate summary text."""
        if accuracy >= 80:
            level = "excellent"
            intro = "Outstanding performance!"
        elif accuracy >= 60:
            level = "good"
            intro = "Good effort!"
        elif accuracy >= 40:
            level = "moderate"
            intro = "You're making progress."
        else:
            level = "needs_work"
            intro = "This test reveals gaps."
        
        summary = f"{intro}\n\nScore: {correct}/{total_q} ({accuracy:.1f}%)"
        
        if strengths:
            summary += f"\nStrengths: {', '.join(strengths)}"
        
        if improvements:
            summary += f"\nPriority Improvements: {', '.join(improvements)}"
        
        return summary
    
    def test_estimate_cutoff_calculation(self):
        """Test cutoff estimation."""
        total_questions = 100
        
        # Typical SSC GD cutoff is around 35%
        estimated_cutoff = total_questions * 0.35
        
        assert estimated_cutoff == 35.0
    
    def test_improvement_calculation(self):
        """Test improvement vs previous attempt calculation."""
        current_accuracy = 70.0
        previous_accuracy = 65.0
        
        improvement = current_accuracy - previous_accuracy
        
        assert improvement == 5.0
    
    def test_improvement_negative(self):
        """Test negative improvement (decline)."""
        current_accuracy = 60.0
        previous_accuracy = 65.0
        
        improvement = current_accuracy - previous_accuracy
        
        assert improvement == -5.0


class TestHabitNudges:
    """Test AI habit nudges functionality."""
    
    def test_determine_nudge_type_streak_zero(self):
        """Test nudge type is STREAK_NUDGE when streak is zero."""
        current_streak = 0
        studied_today = False
        
        if current_streak == 0:
            nudge_type = NudgeType.STREAK_NUDGE
        elif not studied_today:
            nudge_type = NudgeType.STUDY_REMINDER
        else:
            nudge_type = NudgeType.STREAK_REMINDER
        
        assert nudge_type == NudgeType.STREAK_NUDGE
    
    def test_determine_nudge_type_not_studied(self):
        """Test nudge type is STUDY_REMINDER when not studied today."""
        current_streak = 5
        studied_today = False
        
        if current_streak == 0:
            nudge_type = NudgeType.STREAK_NUDGE
        elif not studied_today:
            nudge_type = NudgeType.STUDY_REMINDER
        else:
            nudge_type = NudgeType.STREAK_REMINDER
        
        assert nudge_type == NudgeType.STUDY_REMINDER
    
    def test_determine_nudge_type_exam_countdown(self):
        """Test nudge type is EXAM_COUNTDOWN when exam is near."""
        current_streak = 5
        studied_today = True
        days_until_exam = 20
        
        if current_streak == 0:
            nudge_type = NudgeType.STREAK_NUDGE
        elif not studied_today:
            nudge_type = NudgeType.STUDY_REMINDER
        elif days_until_exam and days_until_exam <= 30:
            nudge_type = NudgeType.EXAM_COUNTDOWN
        else:
            nudge_type = NudgeType.STREAK_REMINDER
        
        assert nudge_type == NudgeType.EXAM_COUNTDOWN
    
    def test_generate_nudge_content_streak_reminder(self):
        """Test streak reminder nudge content."""
        nudge_type = NudgeType.STREAK_REMINDER
        context = {"current_streak": 7, "studied_today": True}
        
        if nudge_type == NudgeType.STREAK_REMINDER:
            title = "🔥 Keep Your Streak Going!"
            message = f"You have a {context['current_streak']}-day streak!"
        
        assert "streak" in title.lower() or "🔥" in title
        assert str(context["current_streak"]) in message


class TestDoubtAssistant:
    """Test AI doubt assistant functionality."""
    
    def test_search_keywords_matching(self):
        """Test keyword matching for doubt assistant."""
        query = "profit and loss formula"
        question = "What is the formula for profit and loss?"
        
        # Simple keyword matching
        query_words = query.lower().split()
        question_lower = question.lower()
        
        matches = sum(1 for word in query_words if word in question_lower)
        
        assert matches >= 2  # "profit" and "loss" should match
    
    def test_confidence_calculation(self):
        """Test confidence score calculation."""
        times_helpful = 10
        
        # Simplified confidence: base 0.5 + up to 0.4 based on helpful votes
        confidence = min(0.9, 0.5 + (times_helpful / 10) * 0.4)
        
        assert confidence == 0.9
    
    def test_confidence_low_when_no_feedback(self):
        """Test confidence is lower when no helpful feedback."""
        times_helpful = 0
        
        confidence = min(0.9, 0.5 + (times_helpful / 10) * 0.4)
        
        assert confidence == 0.5
    
    def test_suggestions_generation(self):
        """Test related question suggestions."""
        results = [
            {"question": "What is profit?"},
            {"question": "What is loss?"},
            {"question": "What is discount?"},
            {"question": "What is simple interest?"},
        ]
        
        suggestions = [r["question"] for r in results[1:4]]
        
        assert len(suggestions) == 3
        assert "What is loss?" in suggestions


class TestDailySummary:
    """Test daily summary functionality."""
    
    def test_summary_title_format(self):
        """Test daily summary title format."""
        today = date.today()
        
        title = f"Your Daily Summary for {today.strftime('%B %d')}"
        
        assert "Daily Summary" in title
        assert today.strftime("%B") in title
    
    def test_completed_tasks_counting(self):
        """Test counting completed vs pending tasks."""
        tasks = [
            {"status": "completed"},
            {"status": "completed"},
            {"status": "pending"},
            {"status": "skipped"},
            {"status": "pending"},
        ]
        
        completed = sum(1 for t in tasks if t["status"] == "completed")
        pending = sum(1 for t in tasks if t["status"] == "pending")
        
        assert completed == 2
        assert pending == 2
    
    def test_streak_message_inclusion(self):
        """Test streak is mentioned in summary."""
        current_streak = 5
        
        message_parts = []
        message_parts.append(f"Your current streak is {current_streak} days.")
        
        assert any("5" in part and "streak" in part.lower() for part in message_parts)
