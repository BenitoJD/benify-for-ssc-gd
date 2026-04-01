"""
Service layer for analytics module.

Handles business logic for analytics.
"""
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .repository import AnalyticsRepository
from .schemas import (
    OverallAnalytics,
    ScoreTrendItem,
    SubjectAccuracy,
    ChapterWeakness,
    MockComparison,
    TimeAnalytics,
    RevisionRecommendationItem,
    WeakChapterDrilldown,
    AnalyticsResponse,
    DateRangeFilter,
)
from ..tests.models import MockAttempt
from ..syllabus.models import Topic


class AnalyticsService:
    """Service layer for analytics operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AnalyticsRepository(db)
    
    def _parse_json_field(self, value, expected_type=list):
        """Parse JSON field safely."""
        if value is None:
            return expected_type() if expected_type is list else None
        if isinstance(value, str):
            try:
                import json
                parsed = json.loads(value)
                return parsed if isinstance(parsed, expected_type) else expected_type()
            except (json.JSONDecodeError, ImportError):
                return expected_type() if expected_type is list else None
        return value
    
    def _get_date_range(
        self,
        date_filter: DateRangeFilter,
        custom_start: Optional[datetime] = None,
        custom_end: Optional[datetime] = None
    ) -> Tuple[Optional[datetime], Optional[datetime]]:
        """Calculate date range based on filter."""
        now = datetime.utcnow()
        
        if date_filter == DateRangeFilter.LAST_30_DAYS:
            return now - timedelta(days=30), now
        elif date_filter == DateRangeFilter.LAST_90_DAYS:
            return now - timedelta(days=90), now
        elif date_filter == DateRangeFilter.LAST_6_MONTHS:
            return now - timedelta(days=180), now
        elif date_filter == DateRangeFilter.ALL_TIME:
            return None, None
        elif date_filter == DateRangeFilter.CUSTOM:
            return custom_start, custom_end
        else:
            return None, None
    
    async def get_user_analytics(
        self,
        user_id: UUID,
        date_filter: DateRangeFilter = DateRangeFilter.LAST_30_DAYS,
        custom_start: Optional[datetime] = None,
        custom_end: Optional[datetime] = None
    ) -> AnalyticsResponse:
        """Get comprehensive analytics for a user."""
        
        start_date, end_date = self._get_date_range(date_filter, custom_start, custom_end)
        
        # Get user's attempts
        attempts = await self.repo.get_user_attempts(
            user_id, start_date, end_date, limit=10
        )
        
        # Calculate overall analytics
        overall = await self._calculate_overall_analytics(user_id, attempts, start_date, end_date)
        
        # Calculate score trend
        score_trend = await self._calculate_score_trend(attempts)
        
        # Calculate subject-wise accuracy
        subject_accuracy = await self._calculate_subject_accuracy(user_id, attempts, start_date, end_date)
        
        # Calculate weak chapters
        weak_chapters = await self._calculate_weak_chapters(user_id, attempts, start_date, end_date)
        
        # Calculate mock comparison
        mock_comparison = await self._calculate_mock_comparison(attempts)
        
        # Calculate time analytics
        time_analytics = await self._calculate_time_analytics(user_id, start_date, end_date)
        
        # Generate recommendations
        recommendations = await self._generate_recommendations(user_id, weak_chapters, subject_accuracy)
        
        return AnalyticsResponse(
            date_range=date_filter.value,
            start_date=start_date,
            end_date=end_date,
            overall=overall,
            score_trend=score_trend,
            subject_accuracy=subject_accuracy,
            weak_chapters=weak_chapters,
            mock_comparison=mock_comparison,
            time_analytics=time_analytics,
            recommendations=recommendations,
        )
    
    async def _calculate_overall_analytics(
        self,
        user_id: UUID,
        attempts: List[MockAttempt],
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> OverallAnalytics:
        """Calculate overall analytics."""
        total_mocks = len(attempts)
        total_questions = 0
        total_correct = 0
        total_time = 0
        best_score = 0
        best_score_date = None
        scores = []
        
        for attempt in attempts:
            total_questions += attempt.total_questions or 0
            total_correct += attempt.correct_count or 0
            total_time += attempt.time_spent_seconds or 0
            if attempt.total_score and attempt.total_score > best_score:
                best_score = attempt.total_score
                best_score_date = attempt.completed_at
            if attempt.total_score is not None:
                scores.append(attempt.total_score)
        
        overall_accuracy = (
            (total_correct / total_questions * 100) if total_questions > 0 else 0
        )
        avg_score = (sum(scores) / len(scores)) if scores else None
        avg_time = (
            (total_time / total_questions) if total_questions > 0 else None
        )
        
        # Calculate streak
        current_streak, longest_streak = await self.repo.calculate_streak(user_id)
        
        # Calculate rank percentile stats
        percentiles = [
            a.rank_percentile for a in attempts if a.rank_percentile is not None
        ]
        avg_percentile = (
            (sum(percentiles) / len(percentiles)) if percentiles else None
        )
        
        # Calculate improvement (comparing recent vs older attempts)
        improvement = None
        if len(scores) >= 2:
            recent_avg = sum(scores[:len(scores)//2]) / (len(scores)//2)
            older_avg = sum(scores[len(scores)//2:]) / (len(scores) - len(scores)//2)
            if older_avg > 0:
                improvement = ((recent_avg - older_avg) / older_avg) * 100
        
        return OverallAnalytics(
            total_mocks_taken=total_mocks,
            total_questions_attempted=total_questions,
            total_correct_answers=total_correct,
            overall_accuracy=round(overall_accuracy, 2),
            best_score=round(best_score, 2) if best_score else None,
            best_score_date=best_score_date,
            avg_score=round(avg_score, 2) if avg_score else None,
            avg_time_per_question=round(avg_time, 1) if avg_time else None,
            current_streak=current_streak,
            longest_streak=longest_streak,
            avg_rank_percentile=round(avg_percentile, 2) if avg_percentile else None,
            improvement_percentage=round(improvement, 2) if improvement else None,
        )
    
    async def _calculate_score_trend(
        self,
        attempts: List[MockAttempt]
    ) -> List[ScoreTrendItem]:
        """Calculate score trend from attempts."""
        trend = []
        
        # Reverse to show oldest first
        for attempt in reversed(attempts):
            percentage = 0
            if attempt.max_score and attempt.max_score > 0:
                percentage = (attempt.total_score / attempt.max_score) * 100
            
            trend.append(ScoreTrendItem(
                attempt_id=attempt.id,
                test_title=attempt.test_series.title if attempt.test_series else "Unknown",
                completed_at=attempt.completed_at or attempt.created_at,
                total_score=attempt.total_score or 0,
                max_score=attempt.max_score or 0,
                percentage=round(percentage, 2),
                rank_percentile=attempt.rank_percentile,
            ))
        
        return trend
    
    async def _calculate_subject_accuracy(
        self,
        user_id: UUID,
        attempts: List[MockAttempt],
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> List[SubjectAccuracy]:
        """Calculate subject-wise accuracy."""
        subjects = await self.repo.get_all_subjects()
        subject_accuracy = []
        
        for subject in subjects:
            stats = await self.repo.get_subject_stats_for_attempts(
                user_id, subject.id, start_date, end_date
            )
            
            # Calculate trend (comparing recent vs older attempts)
            recent_stats = await self.repo.get_subject_stats_for_attempts(
                user_id, subject.id, 
                start_date if start_date else datetime.utcnow() - timedelta(days=15),
                datetime.utcnow()
            )
            older_stats = await self.repo.get_subject_stats_for_attempts(
                user_id, subject.id,
                start_date,
                datetime.utcnow() - timedelta(days=15) if start_date is None else start_date
            )
            
            trend = None
            trend_pct = None
            if recent_stats["accuracy"] > 0 and older_stats["accuracy"] > 0:
                diff = recent_stats["accuracy"] - older_stats["accuracy"]
                if abs(diff) > 2:  # Only show trend if >2% change
                    trend = "up" if diff > 0 else "down"
                    trend_pct = round(diff, 2)
            
            subject_accuracy.append(SubjectAccuracy(
                subject_id=subject.id,
                subject_name=subject.name,
                accuracy=round(stats["accuracy"], 2),
                total_questions=stats["total_questions"],
                correct_answers=stats["correct_answers"],
                avg_time_per_question=round(stats["avg_time_per_question"], 1),
                trend=trend,
                trend_percentage=trend_pct,
            ))
        
        return subject_accuracy
    
    async def _calculate_weak_chapters(
        self,
        user_id: UUID,
        attempts: List[MockAttempt],
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> List[ChapterWeakness]:
        """Calculate weak chapters based on error rate."""
        topics = await self.repo.get_all_topics()
        weak_chapters = []
        
        for topic in topics:
            if not topic.subject:
                continue
                
            stats = await self.repo.get_topic_stats_for_attempts(
                user_id, topic.id, start_date, end_date
            )
            
            if stats["total_questions"] >= 3:  # Only include if attempted enough
                weak_chapters.append(ChapterWeakness(
                    topic_id=topic.id,
                    topic_name=topic.name,
                    subject_id=topic.subject_id,
                    subject_name=topic.subject.name,
                    accuracy=round(stats["accuracy"], 2),
                    error_rate=round(stats["error_rate"], 2),
                    total_attempts=stats["total_questions"],
                    questions_attempted=stats["total_questions"],
                    questions_incorrect=stats["incorrect_answers"],
                    is_highlighted=False,  # Will be set after sorting
                ))
        
        # Sort by error rate (highest first) and highlight top 5
        weak_chapters.sort(key=lambda x: x.error_rate, reverse=True)
        for i, chapter in enumerate(weak_chapters[:5]):
            chapter.is_highlighted = True
        
        return weak_chapters[:10]  # Return top 10 weak chapters
    
    async def _calculate_mock_comparison(
        self,
        attempts: List[MockAttempt]
    ) -> List[MockComparison]:
        """Calculate mock comparison vs platform average."""
        comparisons = []
        
        for attempt in attempts:
            if not attempt.test_series:
                continue
            
            platform_avg = await self.repo.get_platform_average_for_test(
                attempt.test_series_id
            )
            
            if platform_avg is None:
                platform_avg = 0
            
            user_percentage = 0
            if attempt.max_score and attempt.max_score > 0:
                user_percentage = (attempt.total_score / attempt.max_score) * 100
            
            platform_percentage = 0
            if attempt.test_series.total_questions > 0:
                platform_percentage = (
                    platform_avg / attempt.test_series.total_questions * 100
                )
            
            difference = user_percentage - platform_percentage
            
            comparisons.append(MockComparison(
                attempt_id=attempt.id,
                test_title=attempt.test_series.title,
                completed_at=attempt.completed_at or attempt.created_at,
                user_score=attempt.total_score or 0,
                user_percentage=round(user_percentage, 2),
                platform_average=round(platform_percentage, 2),
                difference=round(difference, 2),
                is_above_average=difference >= 0,
            ))
        
        return comparisons
    
    async def _calculate_time_analytics(
        self,
        user_id: UUID,
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> List[TimeAnalytics]:
        """Calculate time per question analytics."""
        subject_times = await self.repo.get_time_stats_by_subject(
            user_id, start_date, end_date
        )
        
        time_analytics = []
        for stats in subject_times:
            time_analytics.append(TimeAnalytics(
                subject_id=stats["subject_id"],
                subject_name=stats["subject_name"],
                avg_time_seconds=round(stats["avg_time_seconds"], 1),
                total_questions=stats["total_questions"],
            ))
        
        return time_analytics
    
    async def _generate_recommendations(
        self,
        user_id: UUID,
        weak_chapters: List[ChapterWeakness],
        subject_accuracy: List[SubjectAccuracy]
    ) -> List[RevisionRecommendationItem]:
        """Generate revision recommendations."""
        recommendations = []
        
        # Add recommendations for weak chapters (< 60% accuracy)
        for i, chapter in enumerate(weak_chapters[:5]):
            if chapter.accuracy < 60:
                recommendations.append(RevisionRecommendationItem(
                    topic_id=chapter.topic_id,
                    topic_name=chapter.topic_name,
                    subject_id=chapter.subject_id,
                    subject_name=chapter.subject_name,
                    priority=i + 1,
                    current_accuracy=chapter.accuracy,
                    questions_to_practice=chapter.questions_incorrect + 5,  # Some extra
                    pyq_filter_url=f"/pyqs?topic_id={chapter.topic_id}",
                    study_material_url=f"/study/topic/{chapter.topic_id}",
                    status="pending",
                ))
        
        return recommendations
    
    async def get_weak_chapter_drilldown(
        self,
        user_id: UUID,
        topic_id: UUID
    ) -> WeakChapterDrilldown:
        """Get drill-down data for a weak chapter."""
        # Get topic info
        from sqlalchemy import select
        result = await self.db.execute(
            select(Topic)
            .options(selectinload(Topic.subject))
            .where(Topic.id == topic_id)
        )
        topic = result.scalar_one_or_none()
        
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        
        # Get topic stats
        stats = await self.repo.get_topic_stats_for_attempts(user_id, topic_id)
        
        # Get weak questions
        weak_questions = await self.repo.get_weak_questions_for_topic(
            user_id, topic_id, limit=10
        )
        
        return WeakChapterDrilldown(
            topic_id=topic.id,
            topic_name=topic.name,
            subject_id=topic.subject_id,
            subject_name=topic.subject.name if topic.subject else "Unknown",
            accuracy=round(stats["accuracy"], 2),
            weak_questions=weak_questions,
        )
    
    # ============ Advanced Analytics Methods ============
    
    async def get_percentile_rank(
        self,
        user_id: UUID,
        test_series_id: Optional[UUID] = None
    ) -> dict:
        """Calculate estimated percentile rank based on mock scores vs all test-takers.
        
        Uses the user's average score compared to all test-takers to estimate percentile.
        """
        from .schemas import PercentileRankResponse
        
        # Get user's attempts
        attempts = await self.repo.get_user_attempts(user_id, limit=10)
        
        if not attempts:
            return PercentileRankResponse(
                estimated_percentile=50.0,
                total_test_takers=0,
                user_score=0.0,
                cohort_scores=[],
                percentile_breakdown=[],
                rank_category="below_avg"
            )
        
        # Calculate user's average score
        scores = [a.total_score for a in attempts if a.total_score is not None]
        if not scores:
            return PercentileRankResponse(
                estimated_percentile=50.0,
                total_test_takers=0,
                user_score=0.0,
                cohort_scores=[],
                percentile_breakdown=[],
                rank_category="below_avg"
            )
        
        user_avg_score = sum(scores) / len(scores)
        
        # Get percentile data
        percentile_data = await self.repo.calculate_percentile_rank(user_id, user_avg_score)
        
        # Generate percentile breakdown for visualization
        cohort_scores = percentile_data.get("cohort_scores", [])
        percentile_breakdown = self._generate_percentile_breakdown(cohort_scores)
        
        return PercentileRankResponse(
            estimated_percentile=percentile_data["estimated_percentile"],
            total_test_takers=percentile_data["total_test_takers"],
            user_score=round(user_avg_score, 2),
            cohort_scores=cohort_scores[-100:] if cohort_scores else [],  # Last 100 for viz
            percentile_breakdown=percentile_breakdown,
            rank_category=percentile_data["rank_category"]
        )
    
    def _generate_percentile_breakdown(self, scores: List[float]) -> List[dict]:
        """Generate percentile breakdown from score distribution."""
        if not scores:
            return []
        
        # Create score ranges
        ranges = [
            {"range": "0-10%", "min": 0, "max": 10, "count": 0},
            {"range": "10-25%", "min": 10, "max": 25, "count": 0},
            {"range": "25-50%", "min": 25, "max": 50, "count": 0},
            {"range": "50-75%", "min": 50, "max": 75, "count": 0},
            {"range": "75-90%", "min": 75, "max": 90, "count": 0},
            {"range": "90-100%", "min": 90, "max": 100, "count": 0},
        ]
        
        # Normalize scores to 0-100 range for percentile calculation
        max_score = max(scores) if scores else 100
        normalized_scores = [(s / max_score) * 100 for s in scores]
        
        # Count scores in each range
        for score in normalized_scores:
            for r in ranges:
                if r["min"] <= score < r["max"]:
                    r["count"] += 1
                    break
        
        return ranges
    
    async def get_exam_readiness(
        self,
        user_id: UUID
    ) -> dict:
        """Calculate exam readiness score combining academic (70%) and physical (30%).
        
        Returns:
        - overall_readiness: 0-100 combined score
        - academic_readiness: 0-100 academic score component (70% weight)
        - physical_readiness: 0-100 physical score component (30% weight)
        """
        from .schemas import ExamReadinessResponse
        
        # Get academic readiness (based on overall accuracy)
        attempts = await self.repo.get_user_attempts(user_id, limit=50)
        
        total_questions = 0
        total_correct = 0
        for attempt in attempts:
            total_questions += attempt.total_questions or 0
            total_correct += attempt.correct_count or 0
        
        academic_accuracy = (
            (total_correct / total_questions * 100) if total_questions > 0 else 0
        )
        
        # Get physical readiness
        physical_data = await self.repo.get_physical_readiness_data(user_id)
        
        # Physical readiness calculation
        physical_factors = 0
        physical_completed = 0
        
        if physical_data["height_measured"]:
            physical_completed += 1
        physical_factors += 1  # Height always counts
        
        if physical_data["weight_measured"]:
            physical_completed += 1
        
        if physical_data["pet_ready"]:
            physical_completed += 1
        
        physical_readiness = (physical_completed / 3) * 100 if physical_factors > 0 else 0
        
        # Combined readiness: academic (70%) + physical (30%)
        overall_readiness = (academic_accuracy * 0.7) + (physical_readiness * 0.3)
        
        # Determine readiness label
        if overall_readiness >= 80:
            readiness_label = "highly_ready"
        elif overall_readiness >= 65:
            readiness_label = "ready"
        elif overall_readiness >= 50:
            readiness_label = "moderately_ready"
        else:
            readiness_label = "needs_improvement"
        
        # Generate recommendations
        recommendations = []
        if academic_accuracy < 60:
            recommendations.append("Focus on improving your mock test scores. Aim for at least 60% accuracy.")
        if not physical_data["height_measured"]:
            recommendations.append("Complete your physical measurements in your profile.")
        if not physical_data["pet_ready"]:
            recommendations.append("Start logging your physical training progress to track PET readiness.")
        if overall_readiness < 50:
            recommendations.append("Consider following a structured study and physical plan to improve readiness.")
        
        return ExamReadinessResponse(
            overall_readiness=round(overall_readiness, 2),
            academic_readiness=round(academic_accuracy, 2),
            physical_readiness=round(physical_readiness, 2),
            academic_breakdown={
                "total_mocks": len(attempts),
                "total_questions": total_questions,
                "total_correct": total_correct,
                "accuracy": round(academic_accuracy, 2)
            },
            physical_breakdown={
                "height_measured": physical_data["height_measured"],
                "weight_measured": physical_data["weight_measured"],
                "pet_ready": physical_data["pet_ready"],
                "running_progress": physical_data["has_running_progress"]
            },
            readiness_label=readiness_label,
            recommendations=recommendations
        )
    
    async def get_stage_readiness(
        self,
        user_id: UUID
    ) -> dict:
        """Calculate stage-wise readiness percentages (PST, PET, Document).
        
        Returns:
        - pst_readiness: 0-100 percentage
        - pet_readiness: 0-100 percentage
        - document_readiness: 0-100 percentage
        """
        from .schemas import StageReadinessResponse
        
        # Get physical readiness data
        physical_data = await self.repo.get_physical_readiness_data(user_id)
        
        # PST readiness: height, weight, chest (males) measured
        pst_factors = 2  # height + weight minimum
        pst_completed = 0
        
        if physical_data["height_measured"]:
            pst_completed += 1
        if physical_data["weight_measured"]:
            pst_completed += 1
        
        pst_readiness = (pst_completed / pst_factors) * 100
        
        # PET readiness: running progress + other physical activities
        pet_factors = 3  # running progress, total sessions, consistency
        pet_completed = 0
        
        if physical_data["has_running_progress"]:
            pet_completed += 1
        if physical_data["total_progress_logs"] >= 5:
            pet_completed += 1
        if physical_data["running_sessions"] >= 3:
            pet_completed += 1
        
        pet_readiness = (pet_completed / pet_factors) * 100
        
        # Document readiness: based on verified documents
        doc_data = await self.repo.get_document_readiness_data(user_id)
        document_readiness = doc_data["completion_percentage"]
        
        # Overall readiness: average of the three stages
        overall_readiness = (pst_readiness + pet_readiness + document_readiness) / 3
        
        # Determine stage status
        def get_stage_status(percentage: float) -> str:
            if percentage >= 80:
                return "ready"
            elif percentage >= 30:
                return "in_progress"
            else:
                return "not_started"
        
        return StageReadinessResponse(
            pst_readiness=round(pst_readiness, 2),
            pet_readiness=round(pet_readiness, 2),
            document_readiness=round(document_readiness, 2),
            overall_readiness=round(overall_readiness, 2),
            pst_details={
                "height_measured": physical_data["height_measured"],
                "weight_measured": physical_data["weight_measured"],
                "chest_measured": physical_data.get("chest_measured", False),
                "gender": physical_data["gender"]
            },
            pet_details={
                "has_running_progress": physical_data["has_running_progress"],
                "total_progress_logs": physical_data["total_progress_logs"],
                "running_sessions": physical_data["running_sessions"]
            },
            document_details={
                "verified_count": doc_data["verified_count"],
                "uploaded_count": doc_data["uploaded_count"],
                "total_required": doc_data["total_required"]
            },
            stage_status={
                "pst": get_stage_status(pst_readiness),
                "pet": get_stage_status(pet_readiness),
                "documents": get_stage_status(document_readiness)
            }
        )
    
    async def get_cohort_comparison(
        self,
        user_id: UUID
    ) -> dict:
        """Compare user's progress vs peers who started same date.
        
        Returns detailed comparison metrics.
        """
        from .schemas import CohortComparisonResponse
        
        # Get user's creation date
        user_created = await self.repo.get_user_creation_date(user_id)
        if not user_created:
            return CohortComparisonResponse(
                cohort_name="Unknown",
                cohort_size=0,
                cohort_start_date=datetime.utcnow(),
                user_progress=0.0,
                cohort_average_progress=0.0,
                user_percentile=50.0,
                progress_comparison={},
                user_averages={},
                cohort_distribution={}
            )
        
        # Get cohort users
        cohort_user_ids = await self.repo.get_cohort_users(user_id)
        
        # Calculate cohort progress
        cohort_data = await self.repo.get_cohort_progress(cohort_user_ids)
        
        # Get user's attempts
        attempts = await self.repo.get_user_attempts(user_id, limit=50)
        
        # Calculate user's metrics
        user_total_questions = 0
        user_total_correct = 0
        for attempt in attempts:
            user_total_questions += attempt.total_questions or 0
            user_total_correct += attempt.correct_count or 0
        
        user_accuracy = (
            (user_total_correct / user_total_questions * 100) 
            if user_total_questions > 0 else 0
        )
        
        # Estimate user progress (based on attempts and accuracy)
        user_progress = min((len(attempts) / 10) * 100 * (user_accuracy / 100), 100)
        
        # Calculate cohort average progress
        cohort_avg_progress = 0
        if cohort_data["cohort_size"] > 0:
            cohort_avg_progress = (
                cohort_data["avg_mocks_taken"] / 10 * 100 * 
                (cohort_data["avg_accuracy"] / 100)
            )
        
        # Calculate user percentile in cohort
        if cohort_data["cohort_size"] > 0:
            # Estimate: user is above average if their progress > cohort average
            if user_progress >= cohort_avg_progress:
                user_percentile = 50 + min((user_progress - cohort_avg_progress), 50)
            else:
                user_percentile = max(50 - (cohort_avg_progress - user_progress), 10)
        else:
            user_percentile = 50.0
        
        # Cohort name based on start date
        cohort_name = f"Started {user_created.strftime('%B %Y')}"
        
        return CohortComparisonResponse(
            cohort_name=cohort_name,
            cohort_size=cohort_data["cohort_size"] + 1,  # +1 for the user
            cohort_start_date=user_created,
            user_progress=round(user_progress, 2),
            cohort_average_progress=round(min(cohort_avg_progress, 100), 2),
            user_percentile=round(user_percentile, 2),
            progress_comparison={
                "user_mocks_taken": len(attempts),
                "cohort_avg_mocks": round(cohort_data["avg_mocks_taken"], 1),
                "user_accuracy": round(user_accuracy, 2),
                "cohort_avg_accuracy": cohort_data["avg_accuracy"]
            },
            user_averages={
                "total_questions": user_total_questions,
                "total_correct": user_total_correct,
                "accuracy": round(user_accuracy, 2)
            },
            cohort_distribution={
                "top_10_percent": round(user_percentile >= 90, 2) if user_percentile else 0,
                "above_average": round(user_percentile >= 50, 2) if user_percentile else 0
            }
        )
    
    async def get_comprehensive_report(
        self,
        user_id: UUID,
        user_name: Optional[str] = None
    ) -> dict:
        """Generate comprehensive analytics report for export.
        
        Combines all advanced analytics into a single exportable report.
        """
        from .schemas import ComprehensiveReportResponse
        from uuid import uuid4
        
        # Get all the data
        percentile_rank = await self.get_percentile_rank(user_id)
        exam_readiness = await self.get_exam_readiness(user_id)
        stage_readiness = await self.get_stage_readiness(user_id)
        cohort_comparison = await self.get_cohort_comparison(user_id)
        
        # Get subject performance
        attempts = await self.repo.get_user_attempts(user_id, limit=10)
        subject_accuracy = await self._calculate_subject_accuracy(
            user_id, attempts, None, None
        )
        weak_areas = await self._calculate_weak_chapters(
            user_id, attempts, None, None
        )
        recent_trends = await self._calculate_score_trend(attempts)
        
        # Report expiration (7 days from now)
        valid_until = datetime.utcnow() + timedelta(days=7)
        
        return ComprehensiveReportResponse(
            report_id=str(uuid4()),
            generated_at=datetime.utcnow(),
            user_id=user_id,
            user_name=user_name,
            percentile_rank=percentile_rank,
            exam_readiness=exam_readiness,
            stage_readiness=stage_readiness,
            cohort_comparison=cohort_comparison,
            subject_performance=subject_accuracy,
            weak_areas=weak_areas,
            recent_trends=recent_trends,
            report_type="comprehensive",
            valid_until=valid_until,
            download_url=None  # Set by router if generating PDF
        )
