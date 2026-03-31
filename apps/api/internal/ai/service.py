"""
Service layer for AI advanced features.

Provides:
- AI mock analysis summary generation
- AI revision planner with SM-2 spaced repetition
- AI habit nudges
- AI doubt assistant
- Daily summary generation
"""
import random
from typing import List, Optional, Tuple, Dict
from uuid import UUID
from datetime import datetime, timedelta, date, time
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import AIRepository
from .models import (
    HabitNudgeRecord,
    DailySummaryRecord,
    SpacedRepetitionData,
)
from .schemas import (
    AIMockAnalysisResponse,
    AIMockAnalysisRequest,
    TopicImprovementTip,
    RevisionPlanResponse,
    SpacedRepetitionTopic,
    SM2ReviewRequest,
    SM2ReviewResponse,
    FullRevisionScheduleResponse,
    RevisionScheduleResponse,
    HabitNudgeResponse,
    HabitNudgesListResponse,
    HabitNudgeGenerateRequest,
    HabitNudgeMarkReadRequest,
    DoubtAssistantQueryRequest,
    DoubtAssistantQueryResponse,
    DoubtAssistantAnswer,
    DoubtAssistantFeedbackRequest,
    DailySummaryResponse,
    DailyTaskSummary,
    AISuccessResponse,
    NudgeType,
    TaskType,
    TaskStatus,
)
from .models import HabitNudgeType
from ..notifications.service import NotificationService
from ..analytics.repository import AnalyticsRepository
from ..study_plans.repository import StudyPlanRepository
from ..tests.repository import TestSeriesRepository, AttemptRepository


# SM-2 Algorithm constants
INITIAL_EASE_FACTOR = 2.5
MIN_EASE_FACTOR = 1.3
EASE_BONUS = 0.1
EASE_PENALTY = 0.2


# Motivational quotes
MOTIVATIONAL_QUOTES = [
    "Success is the sum of small efforts, repeated day in and day out. Keep going! 💪",
    "The expert in anything was once a beginner. You're on your way! 🚀",
    "Don't stop when you're tired. Stop when you're done. 🔥",
    "Every day you study is a day closer to your dream. Keep pushing! ⭐",
    "Small progress is still progress. Celebrate every step! 🎯",
    "Your future self will thank you for studying today. 📚",
    "Consistency is the key to success. You're doing great! 🌟",
    "Focus on the process, not just the result. You've got this! 💯",
    "The only way to do great work is to practice. Keep practicing! 🏆",
    "Believe in yourself and your abilities. You're stronger than you think! 💪",
]


class AIService:
    """Service for AI advanced features."""
    
    def __init__(
        self,
        db: AsyncSession,
        notification_service: Optional[NotificationService] = None
    ):
        self.db = db
        self.repo = AIRepository(db)
        self.notification_service = notification_service
        self.analytics_repo = AnalyticsRepository(db)
        self.study_plan_repo = StudyPlanRepository(db)
        self.attempt_repo = AttemptRepository(db)
        self.test_series_repo = TestSeriesRepository(db)
    
    def _set_notification_service(self, notification_service: NotificationService):
        """Set notification service if not injected."""
        if self.notification_service is None:
            self.notification_service = notification_service
    
    # ========================================================================
    # AI Mock Analysis Summary
    # ========================================================================
    
    async def generate_mock_analysis(
        self,
        user_id: UUID,
        request: AIMockAnalysisRequest
    ) -> AIMockAnalysisResponse:
        """Generate AI-powered analysis summary for a mock test attempt."""
        # Get the attempt with full details
        attempt = await self.attempt_repo.get_attempt_by_id(request.attempt_id)
        if not attempt:
            raise ValueError("Attempt not found")
        
        if attempt.user_id != user_id:
            raise ValueError("Not authorized to view this analysis")
        
        # Get topic-wise performance
        topic_stats = await self._get_topic_performance(user_id, request.attempt_id)
        
        # Get previous attempt for comparison
        previous_attempt = await self.attempt_repo.get_user_last_attempt(
            user_id, attempt.test_series_id
        )
        
        # Calculate overall accuracy
        total_q = attempt.total_questions or 1
        correct = attempt.correct_count or 0
        overall_accuracy = (correct / total_q) * 100
        
        # Generate improvement tips per topic
        improvement_tips = []
        key_strengths = []
        priority_improvements = []
        
        for topic_id, stats in topic_stats.items():
            topic_name = stats["topic_name"]
            subject_name = stats["subject_name"]
            accuracy = stats["accuracy"]
            
            # Generate tip based on accuracy
            if accuracy < 40:
                tip = f"Focus on {topic_name} fundamentals. Practice 10+ questions daily."
                priority_improvements.append(topic_name)
            elif accuracy < 60:
                tip = f"Review {topic_name} concepts and practice mixed questions."
                priority_improvements.append(topic_name)
            elif accuracy < 80:
                tip = f"Good progress in {topic_name}. Focus on speed and accuracy."
            else:
                tip = f"Excellent in {topic_name}! Keep maintaining with light revision."
                key_strengths.append(topic_name)
            
            improvement_tips.append(TopicImprovementTip(
                topic_id=topic_id,
                topic_name=topic_name,
                subject_name=subject_name,
                current_accuracy=accuracy,
                tip_text=tip,
                priority=1 if accuracy < 50 else 2
            ))
        
        # Sort tips by priority
        improvement_tips.sort(key=lambda x: x.priority)
        
        # Generate main summary text
        summary_text = self._generate_summary_text(
            overall_accuracy,
            attempt.total_score or 0,
            attempt.total_questions or 0,
            key_strengths,
            priority_improvements,
            attempt.correct_count or 0,
            attempt.incorrect_count or 0,
        )
        
        # Calculate improvement vs previous
        improvement_vs_previous = None
        if previous_attempt and previous_attempt.total_questions > 0:
            prev_accuracy = (previous_attempt.correct_count / previous_attempt.total_questions) * 100
            improvement_vs_previous = overall_accuracy - prev_accuracy
        
        # Estimate cutoff (simplified - based on historical data)
        estimated_cutoff = self._estimate_cutoff(attempt)
        
        # Save analysis record
        await self.repo.create_mock_analysis(
            user_id=user_id,
            attempt_id=request.attempt_id,
            summary_text=summary_text,
            improvement_tips=[t.model_dump() for t in improvement_tips],
            topic_analysis=topic_stats,
            overall_accuracy=overall_accuracy,
            estimated_cutoff=estimated_cutoff,
            improvement_vs_previous=improvement_vs_previous,
        )
        
        return AIMockAnalysisResponse(
            attempt_id=request.attempt_id,
            summary_text=summary_text,
            overall_accuracy=round(overall_accuracy, 2),
            topic_improvement_tips=improvement_tips,
            estimated_cutoff=estimated_cutoff,
            improvement_vs_previous=round(improvement_vs_previous, 2) if improvement_vs_previous else None,
            key_strengths=key_strengths,
            priority_improvements=priority_improvements,
            generated_at=datetime.utcnow(),
        )
    
    async def _get_topic_performance(
        self,
        user_id: UUID,
        attempt_id: UUID
    ) -> Dict[UUID, dict]:
        """Get topic-wise performance from an attempt."""
        topic_stats = {}
        
        # Get attempt answers
        answers = await self.attempt_repo.get_answers_by_attempt(attempt_id)
        
        for answer in answers:
            if not answer.question or not answer.question.topic:
                continue
            
            topic = answer.question.topic
            topic_id = topic.id
            
            if topic_id not in topic_stats:
                topic_stats[topic_id] = {
                    "topic_name": topic.name,
                    "subject_name": topic.subject.name if topic.subject else "Unknown",
                    "total": 0,
                    "correct": 0,
                }
            
            topic_stats[topic_id]["total"] += 1
            if answer.is_correct:
                topic_stats[topic_id]["correct"] += 1
        
        # Calculate accuracy
        for topic_id in topic_stats:
            total = topic_stats[topic_id]["total"]
            correct = topic_stats[topic_id]["correct"]
            topic_stats[topic_id]["accuracy"] = (correct / total * 100) if total > 0 else 0
        
        return topic_stats
    
    def _generate_summary_text(
        self,
        overall_accuracy: float,
        total_score: int,
        total_questions: int,
        key_strengths: List[str],
        priority_improvements: List[str],
        correct_count: int,
        incorrect_count: int,
    ) -> str:
        """Generate the main analysis summary text."""
        # Determine performance level
        if overall_accuracy >= 80:
            level = "excellent"
            intro = "Outstanding performance! You're demonstrating strong preparation."
        elif overall_accuracy >= 60:
            level = "good"
            intro = "Good effort! With some targeted practice, you can improve significantly."
        elif overall_accuracy >= 40:
            level = "moderate"
            intro = "You're making progress. Focus on weak areas to boost your score."
        else:
            level = "needs_work"
            intro = "This test reveals significant gaps. Prioritize your weak topics."
        
        # Build summary
        summary = f"{intro}\n\n"
        summary += f"**Score:** {correct_count}/{total_questions} ({overall_accuracy:.1f}%)\n"
        
        if key_strengths:
            summary += f"\n**Strengths:** {', '.join(key_strengths)}\n"
        
        if priority_improvements:
            summary += f"\n**Priority Improvements:** {', '.join(priority_improvements)}\n"
        
        if incorrect_count > 0:
            summary += f"\nYou answered {incorrect_count} questions incorrectly. Review the explanations and practice similar questions."
        
        summary += "\n\nKeep studying consistently and track your progress over time!"
        
        return summary
    
    def _estimate_cutoff(self, attempt) -> float:
        """Estimate the probable cutoff for this test."""
        # Simplified estimation - in production would use historical data
        if attempt.total_questions > 0:
            return (attempt.total_questions * 0.35)  # ~35% is typical cutoff
        return 0.0
    
    # ========================================================================
    # AI Revision Planner (SM-2 Spaced Repetition)
    # ========================================================================
    
    async def get_revision_plan(
        self,
        user_id: UUID
    ) -> RevisionPlanResponse:
        """Get AI-powered revision plan with spaced repetition schedule."""
        # Get all topics due for review
        due_topics = await self.repo.get_topics_due_for_review(user_id, limit=50)
        
        # Get topic details
        topics_to_revise = []
        priority_order = []
        
        for sr_data in due_topics:
            topic = sr_data.topic
            if not topic:
                continue
            
            subject_name = topic.subject.name if topic.subject else "Unknown"
            
            topics_to_revise.append(SpacedRepetitionTopic(
                topic_id=topic.id,
                topic_name=topic.name,
                subject_name=subject_name,
                ease_factor=sr_data.ease_factor,
                interval=sr_data.interval,
                repetitions=sr_data.repetitions,
                current_accuracy=sr_data.current_accuracy,
                last_review_date=sr_data.last_review_date,
                next_review_date=sr_data.next_review_date,
                is_mastered=sr_data.is_mastered,
            ))
            priority_order.append(topic.id)
        
        # Also include weak topics that don't have SR data yet
        weak_topics = await self._get_weak_topics_without_sr(user_id)
        for topic_id, topic_name, subject_name, accuracy in weak_topics:
            if topic_id not in priority_order:
                topics_to_revise.append(SpacedRepetitionTopic(
                    topic_id=topic_id,
                    topic_name=topic_name,
                    subject_name=subject_name,
                    ease_factor=INITIAL_EASE_FACTOR,
                    interval=1,
                    repetitions=0,
                    current_accuracy=accuracy,
                    last_review_date=None,
                    next_review_date=None,
                    is_mastered=False,
                ))
                priority_order.append(topic_id)
        
        estimated_minutes = len(topics_to_revise) * 20  # 20 min per topic
        
        return RevisionPlanResponse(
            topics_to_revise=topics_to_revise,
            total_topics=len(topics_to_revise),
            estimated_minutes=estimated_minutes,
            priority_order=priority_order,
            upcoming_reviews=await self._get_upcoming_reviews_data(user_id),
        )
    
    async def _get_weak_topics_without_sr(
        self,
        user_id: UUID
    ) -> List[Tuple[UUID, str, str, float]]:
        """Get weak topics that don't have spaced repetition data yet."""
        weak_topics = []
        
        # Get all topics from study plan repo
        all_topics = await self.study_plan_repo.get_all_topics()
        
        for topic in all_topics:
            if not topic.subject:
                continue
            
            # Check if SR data exists
            sr_data = await self.repo.get_spaced_rep_data(user_id, topic.id)
            if sr_data:
                continue
            
            # Get topic stats
            stats = await self.analytics_repo.get_topic_stats_for_attempts(
                user_id, topic.id, None, None
            )
            
            # If weak (< 60%) and has enough attempts
            if stats["total_questions"] >= 3 and stats["accuracy"] < 60:
                weak_topics.append((
                    topic.id,
                    topic.name,
                    topic.subject.name,
                    stats["accuracy"]
                ))
        
        return weak_topics
    
    async def _get_upcoming_reviews_data(
        self,
        user_id: UUID
    ) -> List[dict]:
        """Get upcoming reviews for the next 7 days."""
        upcoming = await self.repo.get_upcoming_reviews(user_id, days=7)
        
        result = []
        for day, items in upcoming:
            result.append({
                "date": day.isoformat(),
                "count": len(items),
                "topics": [
                    {
                        "topic_id": str(item.topic_id),
                        "topic_name": item.topic.name if item.topic else "Unknown"
                    }
                    for item in items
                ]
            })
        
        return result
    
    async def submit_review(
        self,
        user_id: UUID,
        request: SM2ReviewRequest
    ) -> SM2ReviewResponse:
        """Submit a review result and get updated SM-2 parameters."""
        # Get current SR data
        sr_data = await self.repo.get_spaced_rep_data(user_id, request.topic_id)
        
        if not sr_data:
            # Create new SR data
            sr_data = await self.repo.create_or_update_spaced_rep(
                user_id=user_id,
                topic_id=request.topic_id,
            )
        
        # Apply SM-2 algorithm
        quality = request.quality  # 0-5
        
        if quality >= 3:
            # Successful recall
            if sr_data.repetitions == 0:
                new_interval = 1
            elif sr_data.repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(sr_data.interval * sr_data.ease_factor)
            
            new_repetitions = sr_data.repetitions + 1
            new_ease_factor = max(
                MIN_EASE_FACTOR,
                sr_data.ease_factor + (EASE_BONUS - 0.8 + (0.2 - 0.8) * (5 - quality) / 5)
            )
        else:
            # Failed recall - reset
            new_interval = 1
            new_repetitions = 0
            new_ease_factor = max(MIN_EASE_FACTOR, sr_data.ease_factor - EASE_PENALTY)
        
        # Cap interval at 30 days
        new_interval = min(new_interval, 30)
        
        # Calculate next review date
        next_review_date = datetime.utcnow() + timedelta(days=new_interval)
        
        # Update accuracy based on recent performance
        new_total_attempts = sr_data.total_attempts + 1
        # Simple rolling accuracy
        if new_total_attempts > 0:
            old_weight = (new_total_attempts - 1) / new_total_attempts
            new_weight = 1 / new_total_attempts
            new_accuracy = (sr_data.current_accuracy * old_weight) + (quality / 5 * 100 * new_weight)
        else:
            new_accuracy = 0.0
        
        # Check if mastered (accuracy > 85% for 5+ reps)
        is_mastered = new_repetitions >= 5 and new_accuracy > 85
        
        # Update SR data
        await self.repo.create_or_update_spaced_rep(
            user_id=user_id,
            topic_id=request.topic_id,
            ease_factor=new_ease_factor,
            interval=new_interval,
            repetitions=new_repetitions,
            last_quality=quality,
            last_review_date=datetime.utcnow(),
            next_review_date=next_review_date,
            current_accuracy=new_accuracy,
            total_attempts=new_total_attempts,
        )
        
        # Generate message
        if quality >= 4:
            message = "Excellent recall! Keep up the great work! 🌟"
        elif quality >= 3:
            message = "Good job! You're making progress. 📚"
        else:
            message = "Keep practicing! Regular revision will help you improve. 💪"
        
        return SM2ReviewResponse(
            topic_id=request.topic_id,
            new_ease_factor=round(new_ease_factor, 2),
            new_interval=new_interval,
            new_repetitions=new_repetitions,
            next_review_date=next_review_date,
            message=message,
        )
    
    async def get_full_revision_schedule(
        self,
        user_id: UUID
    ) -> FullRevisionScheduleResponse:
        """Get full revision schedule for the next 7 days."""
        upcoming = await self.repo.get_upcoming_reviews(user_id, days=7)
        
        schedules = []
        total_today = 0
        total_this_week = 0
        
        for day, items in upcoming:
            day_date = day if isinstance(day, date) else day.date()
            
            if day_date == datetime.utcnow().date():
                total_today = len(items)
            
            total_this_week += len(items)
            
            topics = []
            for item in items:
                topic = item.topic
                topics.append(SpacedRepetitionTopic(
                    topic_id=item.topic_id,
                    topic_name=topic.name if topic else "Unknown",
                    subject_name=topic.subject.name if topic and topic.subject else "Unknown",
                    ease_factor=item.ease_factor,
                    interval=item.interval,
                    repetitions=item.repetitions,
                    current_accuracy=item.current_accuracy,
                    last_review_date=item.last_review_date,
                    next_review_date=item.next_review_date,
                    is_mastered=item.is_mastered,
                ))
            
            schedules.append(RevisionScheduleResponse(
                date=day_date,
                topics=topics,
                estimated_minutes=len(topics) * 20,
            ))
        
        return FullRevisionScheduleResponse(
            schedules=schedules,
            total_reviews_today=total_today,
            total_reviews_this_week=total_this_week,
        )
    
    # ========================================================================
    # AI Habit Nudges
    # ========================================================================
    
    async def generate_habit_nudge(
        self,
        user_id: UUID,
        request: Optional[HabitNudgeGenerateRequest] = None
    ) -> HabitNudgeResponse:
        """Generate a personalized habit nudge for the user."""
        nudge_type = request.nudge_type if request else None
        
        # If no specific type, determine based on context
        if not nudge_type:
            nudge_type = await self._determine_nudge_type(user_id)
        
        # Check if we already sent this type today
        existing = await self.repo.get_today_nudge_for_type(user_id, nudge_type.value)
        if existing:
            return HabitNudgeResponse(
                id=existing.id,
                nudge_type=NudgeType(existing.nudge_type),
                title=existing.title,
                message=existing.message,
                motivational_quote=existing.motivational_quote,
                context_data=existing.context_data,
                created_at=existing.created_at,
            )
        
        # Get user context
        context = await self._get_user_context(user_id)
        
        # Generate nudge based on type
        title, message, motivational_quote, context_data = await self._generate_nudge_content(
            user_id, nudge_type, context
        )
        
        # Create nudge record
        nudge = await self.repo.create_habit_nudge(
            user_id=user_id,
            nudge_type=nudge_type.value,
            title=title,
            message=message,
            motivational_quote=motivational_quote,
            context_data=context_data,
        )
        
        # Send notification if service available
        if self.notification_service:
            await self.notification_service.create_notification(
                user_id=user_id,
                notification_type="habit_nudge",  # Would need to add this type
                title=title,
                message=message,
                action_url="/dashboard",
            )
        
        return HabitNudgeResponse(
            id=nudge.id,
            nudge_type=NudgeType(nudge.nudge_type),
            title=nudge.title,
            message=nudge.message,
            motivational_quote=nudge.motivational_quote,
            context_data=nudge.context_data,
            created_at=nudge.created_at,
        )
    
    async def _determine_nudge_type(self, user_id: UUID) -> NudgeType:
        """Determine the best type of nudge based on user context."""
        context = await self._get_user_context(user_id)
        
        # Check streak
        if context["current_streak"] == 0:
            return NudgeType.STREAK_NUDGE
        
        # Check if studying today
        if not context["studied_today"]:
            return NudgeType.STUDY_REMINDER
        
        # Check if exam coming up
        if context["days_until_exam"] and context["days_until_exam"] <= 30:
            return NudgeType.EXAM_COUNTDOWN
        
        # Check for weak topics
        if context["weak_topics_count"] > 0:
            return NudgeType.WEAK_TOPIC_ALERT
        
        # Default to streak reminder
        return NudgeType.STREAK_REMINDER
    
    async def _get_user_context(self, user_id: UUID) -> dict:
        """Get user context for nudge generation."""
        # Get streak
        streak_record = await self.repo.get_streak_record(user_id)
        current_streak = streak_record.current_streak if streak_record else 0
        
        # Check if studied today (simplified - would check actual activity)
        studied_today = False  # Would check DailyTask completion
        
        # Get exam date from profile (would need user repo)
        days_until_exam = None  # Would get from user profile
        
        # Get weak topics count
        weak_topics = await self._get_weak_topics_without_sr(user_id)
        weak_topics_count = len(weak_topics)
        
        return {
            "current_streak": current_streak,
            "studied_today": studied_today,
            "days_until_exam": days_until_exam,
            "weak_topics_count": weak_topics_count,
        }
    
    async def _generate_nudge_content(
        self,
        user_id: UUID,
        nudge_type: NudgeType,
        context: dict
    ) -> Tuple[str, str, Optional[str], dict]:
        """Generate nudge content based on type and context."""
        quote = random.choice(MOTIVATIONAL_QUOTES)
        
        if nudge_type == NudgeType.STREAK_REMINDER:
            title = "🔥 Keep Your Streak Going!"
            message = f"You have a {context['current_streak']}-day streak! Complete a lesson today to keep it alive."
            context_data = {"streak": context["current_streak"]}
        
        elif nudge_type == NudgeType.STUDY_REMINDER:
            title = "📚 Time to Study!"
            message = "You haven't studied today yet. Spend at least 30 minutes on your weak areas."
            context_data = {}
        
        elif nudge_type == NudgeType.EXAM_COUNTDOWN:
            title = "⏰ Exam Alert!"
            message = f"Only {context.get('days_until_exam', '?')} days until your exam! Stay focused and keep practicing."
            context_data = {"days_until_exam": context.get("days_until_exam")}
        
        elif nudge_type == NudgeType.WEAK_TOPIC_ALERT:
            title = "📝 Focus on Weak Areas"
            message = f"You have {context['weak_topics_count']} topics that need attention. Let's work on them today!"
            context_data = {"weak_topics_count": context["weak_topics_count"]}
        
        elif nudge_type == NudgeType.MILESTONE_CELEBRATION:
            title = "🎉 Milestone Achieved!"
            message = "Congratulations on reaching this milestone! Your hard work is paying off."
            context_data = {}
        
        elif nudge_type == NudgeType.WEEKLY_PROGRESS:
            title = "📊 Weekly Progress Report"
            message = "Here's your weekly summary. Keep tracking your progress and aim for improvement!"
            context_data = {}
        
        elif nudge_type == NudgeType.STREAK_NUDGE:
            title = "🔥 Start a New Streak!"
            message = "Your streak was reset, but that means a fresh start! Begin again today and build momentum."
            context_data = {"previous_streak": context["current_streak"]}
        
        else:
            title = "💪 Keep Going!"
            message = "Every day is an opportunity to learn. Make the most of it!"
            context_data = {}
        
        return title, message, quote, context_data
    
    async def get_recent_nudges(
        self,
        user_id: UUID,
        limit: int = 10
    ) -> HabitNudgesListResponse:
        """Get recent nudges for the user."""
        nudges = await self.repo.get_recent_nudges(user_id, limit)
        
        return HabitNudgesListResponse(
            nudges=[
                HabitNudgeResponse(
                    id=n.id,
                    nudge_type=NudgeType(n.nudge_type),
                    title=n.title,
                    message=n.message,
                    motivational_quote=n.motivational_quote,
                    context_data=n.context_data,
                    created_at=n.created_at,
                )
                for n in nudges
            ],
            total_count=len(nudges),
        )
    
    async def mark_nudge_read(
        self,
        user_id: UUID,
        request: HabitNudgeMarkReadRequest
    ) -> AISuccessResponse:
        """Mark a nudge as read."""
        success = await self.repo.mark_nudge_read(
            request.nudge_id,
            request.was_clicked
        )
        
        return AISuccessResponse(
            success=success,
            message="Nudge marked as read" if success else "Nudge not found",
        )
    
    # ========================================================================
    # AI Doubt Assistant
    # ========================================================================
    
    async def query_doubt_assistant(
        self,
        user_id: UUID,
        request: DoubtAssistantQueryRequest
    ) -> DoubtAssistantQueryResponse:
        """Query the AI doubt assistant."""
        # Search knowledge base
        results = await self.repo.search_knowledge_base(
            request.question,
            request.category,
            limit=5
        )
        
        if not results:
            return DoubtAssistantQueryResponse(
                query=request.question,
                answer=DoubtAssistantAnswer(
                    question=request.question,
                    answer="I don't have a specific answer for that question in my knowledge base yet. Try asking about specific SSC GD topics like reasoning, general knowledge, mathematics, or English.",
                    category="general",
                    confidence=0.0,
                    related_topics=["reasoning", "general_knowledge", "mathematics", "english"],
                ),
                found_knowledge_id=None,
                suggestions=self._get_default_suggestions(),
            )
        
        # Use best match
        best_match = results[0]
        
        # Increment query count
        await self.repo.increment_knowledge_query_count(best_match.id)
        
        # Generate suggestions
        suggestions = [r.question for r in results[1:4]] if len(results) > 1 else []
        
        return DoubtAssistantQueryResponse(
            query=request.question,
            answer=DoubtAssistantAnswer(
                question=best_match.question,
                answer=best_match.answer,
                answer_detailed=best_match.answer_detailed,
                category=best_match.category,
                subcategory=best_match.subcategory,
                source=best_match.source,
                confidence=min(0.9, 0.5 + (best_match.times_found_helpful / 10) * 0.4),
                related_topics=None,
            ),
            found_knowledge_id=best_match.id,
            suggestions=suggestions,
        )
    
    def _get_default_suggestions(self) -> List[str]:
        """Get default question suggestions."""
        return [
            "What is the syllabus for SSC GD constable?",
            "How to prepare for reasoning section?",
            "What is the physical test pattern?",
        ]
    
    async def submit_doubt_feedback(
        self,
        user_id: UUID,
        request: DoubtAssistantFeedbackRequest
    ) -> AISuccessResponse:
        """Submit feedback on a doubt assistant answer."""
        await self.repo.record_knowledge_feedback(
            request.knowledge_id,
            request.is_helpful
        )
        
        return AISuccessResponse(
            success=True,
            message="Thank you for your feedback!",
        )
    
    # ========================================================================
    # Daily Summary
    # ========================================================================
    
    async def get_daily_summary(
        self,
        user_id: UUID
    ) -> DailySummaryResponse:
        """Get or generate daily summary for the user."""
        today = date.today()
        
        # Check if summary exists
        existing = await self.repo.get_daily_summary_for_date(user_id, today)
        
        if existing:
            return await self._build_summary_response(existing)
        
        # Generate new summary
        summary = await self._generate_daily_summary(user_id, today)
        return await self._build_summary_response(summary)
    
    async def _generate_daily_summary(
        self,
        user_id: UUID,
        summary_date: date
    ) -> DailySummaryRecord:
        """Generate a new daily summary."""
        # Get user context
        context = await self._get_user_context(user_id)
        
        # Get today's tasks from study plan
        today_tasks = await self._get_today_tasks(user_id)
        
        # Build summary content
        title = f"📋 Your Daily Summary for {summary_date.strftime('%B %d')}"
        
        completed = [t for t in today_tasks if t["status"] == "completed"]
        pending = [t for t in today_tasks if t["status"] == "pending"]
        
        message_parts = []
        if completed:
            message_parts.append(f"You've completed {len(completed)} tasks today!")
        if pending:
            message_parts.append(f"You have {len(pending)} tasks remaining.")
        
        message_parts.append(f"Your current streak is {context['current_streak']} days.")
        
        if context.get("weak_topics_count", 0) > 0:
            message_parts.append(f"Focus on your {context['weak_topics_count']} weak topics.")
        
        message = " ".join(message_parts)
        
        quote = random.choice(MOTIVATIONAL_QUOTES)
        
        # Create summary
        summary = await self.repo.create_daily_summary(
            user_id=user_id,
            summary_date=datetime.combine(summary_date, datetime.min.time()),
            title=title,
            message=message,
            motivational_quote=quote,
            tasks_summary=today_tasks,
            completed_tasks_count=len(completed),
            pending_tasks_count=len(pending),
            stats_data={
                "current_streak": context["current_streak"],
                "overall_accuracy": context.get("overall_accuracy", 0),
                "weak_topics_count": context.get("weak_topics_count", 0),
            },
        )
        
        # Send notification
        if self.notification_service:
            await self.notification_service.create_notification(
                user_id=user_id,
                notification_type="daily_summary",  # Would need to add this type
                title=title,
                message=message,
                action_url="/dashboard",
            )
        
        return summary
    
    async def _get_today_tasks(self, user_id: UUID) -> List[dict]:
        """Get today's tasks from study plan."""
        # This would integrate with the study plan service
        # For now, return empty list
        return []
    
    async def _build_summary_response(
        self,
        summary: DailySummaryRecord
    ) -> DailySummaryResponse:
        """Build response from summary record."""
        tasks = []
        if summary.tasks_summary:
            for i, t in enumerate(summary.tasks_summary):
                tasks.append(DailyTaskSummary(
                    task_id=UUID(int=i),  # Placeholder
                    title=t.get("title", "Task"),
                    task_type=TaskType(t.get("type", "lesson")),
                    status=TaskStatus(t.get("status", "pending")),
                    completed_at=None,
                ))
        
        stats = summary.stats_data or {}
        
        return DailySummaryResponse(
            date=summary.summary_date.date(),
            title=summary.title,
            message=summary.message,
            motivational_quote=summary.motivational_quote,
            tasks=tasks,
            completed_tasks_count=summary.completed_tasks_count,
            pending_tasks_count=summary.pending_tasks_count,
            current_streak=stats.get("current_streak", 0),
            overall_accuracy=stats.get("overall_accuracy", 0.0),
            weak_topics_count=stats.get("weak_topics_count", 0),
            next_exam_days=None,
            upcoming_reviews_count=0,
            was_sent=summary.was_sent,
            sent_at=summary.sent_at,
        )
