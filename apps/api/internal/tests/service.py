"""
Service layer for test series module.

Handles business logic for test series and attempts.
"""
from typing import Optional, List, Tuple
from uuid import UUID
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from .repository import TestSeriesRepository, AttemptRepository
from .schemas import (
    TestSeriesCreate,
    TestSeriesUpdate,
    TestSeriesResponse,
    TestSeriesListResponse,
    TestSeriesDetailResponse,
    AttemptStartResponse,
    QuestionInAttemptResponse,
    AnswerSaveRequest,
    AnswerSaveResponse,
    AttemptSubmitResponse,
    AttemptResultsResponse,
    SectionBreakdown,
    QuestionResultDetail,
    SolutionsResponse,
    SolutionResponse,
    AttemptAnalysisResponse,
    WeakTopic,
    AIRecommendation,
    TestType,
)
from .models import TestSeries, MockAttempt, AttemptAnswer
from ..questions.repository import QuestionRepository
from ..questions.schemas import QuestionWithAnswerResponse
from ..shared.exceptions import NotFoundException, ForbiddenException, ValidationException
from ..syllabus.models import Subject, Topic
from sqlalchemy import select


class TestSeriesService:
    """Service layer for test series operations."""
    __test__ = False
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TestSeriesRepository(db)
        self.attempt_repo = AttemptRepository(db)
        self.question_repo = QuestionRepository(db)
    
    def _parse_json_field(self, value, expected_type=list):
        """Parse JSON field safely."""
        if value is None:
            return expected_type() if expected_type == list else None
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, expected_type) else expected_type()
            except json.JSONDecodeError:
                return expected_type() if expected_type == list else None
        return value
    
    def _test_series_to_response(
        self,
        test_series: TestSeries,
        user_id: Optional[UUID] = None
    ) -> TestSeriesResponse:
        """Convert TestSeries model to response schema."""
        attempt_count = 0
        best_score = None
        last_attempt_at = None
        
        if user_id:
            attempt_count = self.attempt_repo.get_user_attempt_count(
                user_id, test_series.id
            )
            # Note: These are sync calls in the sync context but we're in async
            # Will be properly awaited in the router
        
        return TestSeriesResponse(
            id=test_series.id,
            title=test_series.title,
            description=test_series.description,
            test_type=test_series.test_type,
            duration_minutes=test_series.duration_minutes,
            total_questions=test_series.total_questions,
            marks_per_question=test_series.marks_per_question,
            negative_marking=test_series.negative_marking,
            negative_marks_per_question=test_series.negative_marks_per_question,
            is_premium=test_series.is_premium,
            is_active=test_series.is_active,
            instructions=test_series.instructions,
            passing_percentage=test_series.passing_percentage,
            attempt_count=attempt_count,
            best_score=best_score,
            last_attempt_at=last_attempt_at,
        )
    
    async def get_test_series_list(
        self,
        test_type: Optional[TestType] = None,
        is_premium: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        user_id: Optional[UUID] = None
    ) -> Tuple[List[TestSeriesListResponse], int]:
        """Get paginated list of test series."""
        offset = (page - 1) * limit
        
        if search:
            test_series_list = await self.repo.search_test_series(
                search, test_type, limit, offset
            )
            total = len(test_series_list)  # Approximate for search
        else:
            test_series_list = await self.repo.get_active_test_series(
                test_type, is_premium, limit, offset
            )
            total = await self.repo.get_test_series_count(test_type, is_premium)
        
        result = []
        for ts in test_series_list:
            attempt_count = 0
            best_score = None
            
            if user_id:
                attempt_count = await self.attempt_repo.get_user_attempt_count(
                    user_id, ts.id
                )
                best_score = await self.attempt_repo.get_user_best_score(
                    user_id, ts.id
                )
            
            result.append(TestSeriesListResponse(
                id=str(ts.id),
                title=ts.title,
                description=ts.description,
                test_type=ts.test_type,
                duration_minutes=ts.duration_minutes,
                total_questions=ts.total_questions,
                is_premium=ts.is_premium,
                attempt_count=attempt_count,
                best_score=best_score,
            ))
        
        return result, total
    
    async def get_test_series_by_id(
        self,
        test_series_id: UUID,
        user_id: Optional[UUID] = None
    ) -> TestSeriesDetailResponse:
        """Get test series by ID with details."""
        test_series = await self.repo.get_test_series_by_id(test_series_id)
        if not test_series:
            raise NotFoundException("Test Series")
        
        attempt_count = 0
        best_score = None
        last_attempt = None
        
        if user_id:
            attempt_count = await self.attempt_repo.get_user_attempt_count(
                user_id, test_series.id
            )
            best_score = await self.attempt_repo.get_user_best_score(
                user_id, test_series.id
            )
            last_attempt = await self.attempt_repo.get_user_last_attempt(
                user_id, test_series.id
            )
        
        subject_ids = self._parse_json_field(test_series.subject_ids)
        topic_ids = self._parse_json_field(test_series.topic_ids)
        
        return TestSeriesDetailResponse(
            id=test_series.id,
            title=test_series.title,
            description=test_series.description,
            test_type=test_series.test_type,
            duration_minutes=test_series.duration_minutes,
            total_questions=test_series.total_questions,
            marks_per_question=test_series.marks_per_question,
            negative_marking=test_series.negative_marking,
            negative_marks_per_question=test_series.negative_marks_per_question,
            is_premium=test_series.is_premium,
            is_active=test_series.is_active,
            instructions=test_series.instructions,
            passing_percentage=test_series.passing_percentage,
            attempt_count=attempt_count,
            best_score=best_score,
            last_attempt_at=last_attempt.completed_at if last_attempt else None,
            subject_ids=[str(s) for s in subject_ids] if subject_ids else None,
            topic_ids=[str(t) for t in topic_ids] if topic_ids else None,
            created_at=test_series.created_at,
        )
    
    async def create_test_series(
        self,
        data: TestSeriesCreate
    ) -> TestSeriesDetailResponse:
        """Create a new test series."""
        ts_data = data.model_dump()
        test_series = await self.repo.create_test_series(ts_data)
        return await self.get_test_series_by_id(test_series.id)
    
    async def update_test_series(
        self,
        test_series_id: UUID,
        data: TestSeriesUpdate
    ) -> TestSeriesDetailResponse:
        """Update an existing test series."""
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise ValidationException("No fields to update")
        
        test_series = await self.repo.update_test_series(test_series_id, update_data)
        if not test_series:
            raise NotFoundException("Test Series")
        
        return await self.get_test_series_by_id(test_series.id)


class AttemptService:
    """Service layer for attempt operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.test_series_repo = TestSeriesRepository(db)
        self.attempt_repo = AttemptRepository(db)
        self.question_repo = QuestionRepository(db)
    
    def _parse_json_field(self, value, expected_type=list):
        """Parse JSON field safely."""
        if value is None:
            return expected_type() if expected_type == list else None
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, expected_type) else expected_type()
            except json.JSONDecodeError:
                return expected_type() if expected_type == list else None
        return value
    
    async def start_attempt(
        self,
        test_series_id: UUID,
        user_id: UUID
    ) -> AttemptStartResponse:
        """Start a new attempt for a test series."""
        # Get test series
        test_series = await self.test_series_repo.get_test_series_by_id(test_series_id)
        if not test_series:
            raise NotFoundException("Test Series")
        
        if not test_series.is_active:
            raise ValidationException("This test is not currently active")
        
        # Get question IDs based on test type
        subject_ids = self._parse_json_field(test_series.subject_ids)
        topic_ids = self._parse_json_field(test_series.topic_ids)
        
        # Get questions for this test
        if test_series.test_type.value == "chapter" and topic_ids:
            # Chapter test - get questions from specific topics
            questions = await self.question_repo.get_random_questions(
                test_series.total_questions,
                topic_ids=[UUID(t) for t in topic_ids]
            )
        elif test_series.test_type.value == "sectional" and subject_ids:
            # Sectional test - get questions from specific subjects
            questions = await self.question_repo.get_questions_by_subjects(
                [UUID(s) for s in subject_ids],
                limit=test_series.total_questions
            )
        elif test_series.test_type.value == "quiz":
            # Quiz - get random questions
            questions = await self.question_repo.get_random_questions(
                test_series.total_questions
            )
        else:
            # Full length - get random questions from all topics
            questions = await self.question_repo.get_random_questions(
                test_series.total_questions
            )
        
        if len(questions) < test_series.total_questions:
            raise ValidationException(
                f"Not enough questions in the question bank. "
                f"Required: {test_series.total_questions}, Available: {len(questions)}"
            )
        
        # Create attempt
        question_ids = [q.id for q in questions]
        attempt = await self.attempt_repo.create_attempt(
            user_id, test_series_id, question_ids
        )
        
        # Get first question with full details
        first_question = questions[0]
        options = self._parse_json_field(first_question.options, list)
        
        return AttemptStartResponse(
            attempt_id=attempt.id,
            test_series_id=test_series_id,
            started_at=attempt.started_at,
            duration_minutes=test_series.duration_minutes,
            total_questions=test_series.total_questions,
            first_question=QuestionInAttemptResponse(
                id=first_question.id,
                question_text=first_question.question_text,
                options=options,
                order_index=0,
                is_flagged=False,
                selected_option=None,
            )
        )
    
    async def get_attempt_questions(
        self,
        attempt_id: UUID,
        user_id: UUID,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[QuestionInAttemptResponse], int, int]:
        """Get questions for an attempt with pagination.
        
        Returns: (questions, total_questions, current_page)
        """
        attempt = await self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise NotFoundException("Attempt")
        
        if str(attempt.user_id) != str(user_id):
            raise ForbiddenException("You don't have access to this attempt")
        
        if attempt.is_completed:
            raise ValidationException("This attempt has already been submitted")
        
        question_ids = self._parse_json_field(attempt.question_ids, list)
        total_questions = len(question_ids)
        
        # Paginate
        offset = (page - 1) * limit
        page_question_ids = question_ids[offset:offset + limit]
        
        questions = []
        for i, q_id in enumerate(page_question_ids):
            question = await self.question_repo.get_question_by_id(UUID(q_id))
            if question:
                # Get answer if exists
                answer = await self.attempt_repo.get_answer_by_attempt_question(
                    attempt_id, question.id
                )
                options = self._parse_json_field(question.options, list)
                
                questions.append(QuestionInAttemptResponse(
                    id=question.id,
                    question_text=question.question_text,
                    options=options,
                    order_index=offset + i,
                    is_flagged=answer.is_flagged if answer else False,
                    selected_option=answer.selected_option if answer else None,
                ))
        
        return questions, total_questions, page
    
    async def save_answer(
        self,
        attempt_id: UUID,
        question_id: UUID,
        user_id: UUID,
        data: AnswerSaveRequest
    ) -> AnswerSaveResponse:
        """Save or update an answer for a question."""
        attempt = await self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise NotFoundException("Attempt")
        
        if str(attempt.user_id) != str(user_id):
            raise ForbiddenException("You don't have access to this attempt")
        
        if attempt.is_completed:
            raise ValidationException("This attempt has already been submitted")
        
        # Get question to find order index
        question_ids = self._parse_json_field(attempt.question_ids, list)
        try:
            order_index = question_ids.index(str(question_id))
        except ValueError:
            raise NotFoundException("Question not found in this attempt")
        
        # Save answer
        answer = await self.attempt_repo.create_or_update_answer(
            attempt_id=attempt_id,
            question_id=question_id,
            selected_option=data.selected_option if data.selected_option else None,
            is_flagged=data.is_flagged or False,
            order_index=order_index,
        )
        
        return AnswerSaveResponse(
            question_id=question_id,
            saved=True,
            selected_option=answer.selected_option,
            is_flagged=answer.is_flagged,
        )
    
    async def submit_attempt(
        self,
        attempt_id: UUID,
        user_id: UUID
    ) -> AttemptSubmitResponse:
        """Submit an attempt and calculate scores."""
        attempt = await self.attempt_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            raise NotFoundException("Attempt")
        
        if str(attempt.user_id) != str(user_id):
            raise ForbiddenException("You don't have access to this attempt")
        
        if attempt.is_completed:
            raise ValidationException("This attempt has already been submitted")
        
        test_series = attempt.test_series
        question_ids = self._parse_json_field(attempt.question_ids, list)
        
        # Calculate scores
        total_score = 0.0
        max_score = 0.0
        correct_count = 0
        incorrect_count = 0
        unattempted_count = 0
        
        # Get all answers
        answers = await self.attempt_repo.get_answers_by_attempt(attempt_id)
        answer_map = {str(a.question_id): a for a in answers}
        
        for i, q_id in enumerate(question_ids):
            question = await self.question_repo.get_question_by_id(UUID(q_id))
            if not question:
                continue
            
            max_score += question.marks
            answer = answer_map.get(str(q_id))
            
            if answer and answer.selected_option:
                if answer.selected_option == question.correct_answer:
                    correct_count += 1
                    total_score += question.marks
                else:
                    incorrect_count += 1
                    if test_series.negative_marking:
                        total_score -= question.negative_marks
                    # Mark answer as correct/incorrect
                    answer.is_correct = answer.selected_option == question.correct_answer
                    answer.marks_obtained = (
                        question.marks if answer.is_correct 
                        else (-question.negative_marks if test_series.negative_marking else 0)
                    )
            else:
                unattempted_count += 1
            
            # Update answer if exists
            if answer:
                await self.db.flush()
        
        # Ensure score doesn't go below 0
        total_score = max(0, total_score)
        
        # Calculate time spent
        time_spent = 0
        if attempt.started_at:
            time_spent = int((datetime.utcnow() - attempt.started_at).total_seconds())
        
        # Get rank and percentile
        rank, percentile = await self.attempt_repo.get_attempt_rank(
            test_series.id, total_score
        )
        
        # Update attempt with scores
        attempt = await self.attempt_repo.update_attempt_score(
            attempt_id=attempt_id,
            total_score=total_score,
            max_score=max_score,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unattempted_count=unattempted_count,
            time_spent_seconds=time_spent,
            rank_percentile=percentile,
            rank=rank,
        )
        
        # Calculate if passed
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        is_passed = percentage >= test_series.passing_percentage
        
        return AttemptSubmitResponse(
            attempt_id=attempt.id,
            submitted_at=attempt.completed_at or datetime.utcnow(),
            total_score=round(total_score, 2),
            max_score=max_score,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unattempted_count=unattempted_count,
            time_spent_seconds=time_spent,
            is_passed=is_passed,
        )
    
    async def get_attempt_results(
        self,
        attempt_id: UUID,
        user_id: UUID
    ) -> AttemptResultsResponse:
        """Get detailed results for an attempt."""
        attempt = await self.attempt_repo.get_attempt_with_answers(attempt_id)
        if not attempt:
            raise NotFoundException("Attempt")
        
        if str(attempt.user_id) != str(user_id):
            raise ForbiddenException("You don't have access to this attempt")
        
        if not attempt.is_completed:
            raise ValidationException("This attempt has not been submitted yet")
        
        test_series = attempt.test_series
        
        # Calculate percentage
        percentage = (
            (attempt.total_score / attempt.max_score * 100) 
            if attempt.max_score > 0 else 0
        )
        
        # Build section breakdown
        section_breakdown = []
        
        # Get subject-wise breakdown
        question_ids = self._parse_json_field(attempt.question_ids, list)
        subject_stats = {}
        
        for q_id in question_ids:
            question = await self.question_repo.get_question_by_id(UUID(q_id))
            if question and question.topic:
                subject_id = str(question.topic.subject_id)
                subject_name = question.topic.subject.name if question.topic.subject else "Unknown"
                
                if subject_id not in subject_stats:
                    subject_stats[subject_id] = {
                        "subject_name": subject_name,
                        "total": 0,
                        "correct": 0,
                        "incorrect": 0,
                        "unattempted": 0,
                        "marks_obtained": 0.0,
                        "max_marks": 0.0,
                    }
                
                subject_stats[subject_id]["total"] += 1
                subject_stats[subject_id]["max_marks"] += question.marks
                
                # Find answer
                answer = next(
                    (a for a in attempt.answers if str(a.question_id) == str(q_id)),
                    None
                )
                
                if answer and answer.selected_option:
                    if answer.selected_option == question.correct_answer:
                        subject_stats[subject_id]["correct"] += 1
                        subject_stats[subject_id]["marks_obtained"] += question.marks
                    else:
                        subject_stats[subject_id]["incorrect"] += 1
                        if test_series.negative_marking:
                            subject_stats[subject_id]["marks_obtained"] -= question.negative_marks
                else:
                    subject_stats[subject_id]["unattempted"] += 1
        
        for subject_id, stats in subject_stats.items():
            section_breakdown.append(SectionBreakdown(
                subject_id=subject_id,
                subject_name=stats["subject_name"],
                total_questions=stats["total"],
                correct=stats["correct"],
                incorrect=stats["incorrect"],
                unattempted=stats["unattempted"],
                marks_obtained=round(max(0, stats["marks_obtained"]), 2),
                max_marks=stats["max_marks"],
            ))
        
        return AttemptResultsResponse(
            attempt_id=attempt.id,
            test_series_id=test_series.id,
            test_title=test_series.title,
            completed_at=attempt.completed_at or datetime.utcnow(),
            total_score=attempt.total_score,
            max_score=attempt.max_score,
            percentage=round(percentage, 2),
            correct_count=attempt.correct_count,
            incorrect_count=attempt.incorrect_count,
            unattempted_count=attempt.unattempted_count,
            time_spent_seconds=attempt.time_spent_seconds,
            rank_percentile=attempt.rank_percentile,
            rank=attempt.rank,
            is_passed=percentage >= test_series.passing_percentage,
            passing_percentage=test_series.passing_percentage,
            section_breakdown=section_breakdown,
        )
    
    async def get_attempt_solutions(
        self,
        attempt_id: UUID,
        user_id: UUID
    ) -> SolutionsResponse:
        """Get solutions for all questions in an attempt."""
        attempt = await self.attempt_repo.get_attempt_with_answers(attempt_id)
        if not attempt:
            raise NotFoundException("Attempt")
        
        if str(attempt.user_id) != str(user_id):
            raise ForbiddenException("You don't have access to this attempt")
        
        if not attempt.is_completed:
            raise ValidationException("This attempt has not been submitted yet")
        
        question_ids = self._parse_json_field(attempt.question_ids, list)
        answer_map = {
            str(a.question_id): a 
            for a in attempt.answers
        }
        
        solutions = []
        for i, q_id in enumerate(question_ids):
            question = await self.question_repo.get_question_by_id(UUID(q_id))
            if question:
                answer = answer_map.get(str(q_id))
                options = self._parse_json_field(question.options, list)
                
                solutions.append(SolutionResponse(
                    question_id=question.id,
                    order_index=i,
                    question_text=question.question_text,
                    options=options,
                    selected_option=answer.selected_option if answer else None,
                    correct_option=question.correct_answer,
                    is_correct=answer.selected_option == question.correct_answer if answer else False,
                    explanation=question.explanation,
                    topic_name=question.topic.name if question.topic else None,
                    difficulty=question.difficulty.value if hasattr(question.difficulty, 'value') else question.difficulty,
                ))
        
        return SolutionsResponse(
            attempt_id=attempt.id,
            test_title=attempt.test_series.title,
            solutions=solutions,
        )
    
    async def get_attempt_analysis(
        self,
        attempt_id: UUID,
        user_id: UUID
    ) -> AttemptAnalysisResponse:
        """Get AI analysis of attempt with weak topics and recommendations."""
        attempt = await self.attempt_repo.get_attempt_with_answers(attempt_id)
        if not attempt:
            raise NotFoundException("Attempt")
        
        if str(attempt.user_id) != str(user_id):
            raise ForbiddenException("You don't have access to this attempt")
        
        if not attempt.is_completed:
            raise ValidationException("This attempt has not been submitted yet")
        
        question_ids = self._parse_json_field(attempt.question_ids, list)
        answer_map = {str(a.question_id): a for a in attempt.answers}
        
        # Analyze topics
        topic_stats = {}
        total_questions = 0
        total_correct = 0
        
        for q_id in question_ids:
            question = await self.question_repo.get_question_by_id(UUID(q_id))
            if question and question.topic:
                topic_id = str(question.topic.id)
                topic_name = question.topic.name
                subject_id = str(question.topic.subject_id)
                subject_name = question.topic.subject.name if question.topic.subject else "Unknown"
                
                if topic_id not in topic_stats:
                    topic_stats[topic_id] = {
                        "topic_name": topic_name,
                        "subject_id": subject_id,
                        "subject_name": subject_name,
                        "attempted": 0,
                        "correct": 0,
                        "incorrect": 0,
                    }
                
                answer = answer_map.get(str(q_id))
                total_questions += 1
                
                if answer and answer.selected_option:
                    topic_stats[topic_id]["attempted"] += 1
                    if answer.selected_option == question.correct_answer:
                        topic_stats[topic_id]["correct"] += 1
                        total_correct += 1
                    else:
                        topic_stats[topic_id]["incorrect"] += 1
        
        # Calculate weak topics (error rate > 40%)
        weak_topics = []
        for topic_id, stats in topic_stats.items():
            if stats["attempted"] > 0:
                error_rate = stats["incorrect"] / stats["attempted"]
                if error_rate > 0.4:
                    weak_topics.append(WeakTopic(
                        topic_id=topic_id,
                        topic_name=stats["topic_name"],
                        subject_id=stats["subject_id"],
                        subject_name=stats["subject_name"],
                        error_rate=round(error_rate * 100, 1),
                        questions_attempted=stats["attempted"],
                        questions_incorrect=stats["incorrect"],
                    ))
        
        # Sort by error rate
        weak_topics.sort(key=lambda x: x.error_rate, reverse=True)
        
        # Calculate strength index
        overall_accuracy = (
            (total_correct / total_questions * 100) 
            if total_questions > 0 else 0
        )
        strength_index = overall_accuracy
        
        # Generate improvement tips
        improvement_tips = []
        if weak_topics:
            improvement_tips.append(
                f"Focus on improving {weak_topics[0].topic_name} - "
                f"you have {weak_topics[0].error_rate}% error rate"
            )
        if overall_accuracy < 50:
            improvement_tips.append(
                "Your overall accuracy is low. Consider revising basic concepts "
                "before attempting more tests."
            )
        if attempt.unattempted_count > attempt.total_questions * 0.2:
            improvement_tips.append(
                "You have many unattempted questions. Try to attempt all questions "
                "even if you're unsure - there's no negative marking for unattempted."
            )
        
        # Generate recommended tests (mock AI recommendations)
        recommended_tests = []
        for i, weak in enumerate(weak_topics[:3]):
            recommended_tests.append(AIRecommendation(
                type="test",
                title=f"Practice {weak.topic_name}",
                description=f"Take a chapter test on {weak.topic_name} to improve",
                priority=i + 1,
                topic_id=weak.topic_id,
            ))
        
        # Estimated cutoff (simplified calculation)
        estimated_cutoff = None
        if attempt.test_series:
            estimated_cutoff = attempt.max_score * 0.35  # 35% passing
        
        return AttemptAnalysisResponse(
            attempt_id=attempt.id,
            overall_accuracy=round(overall_accuracy, 1),
            strength_index=round(strength_index, 1),
            weak_topics=weak_topics[:5],  # Top 5 weak topics
            recommended_tests=recommended_tests,
            improvement_tips=improvement_tips,
            estimated_cutoff=round(estimated_cutoff, 2) if estimated_cutoff else None,
        )
    
    async def get_user_attempt_history(
        self,
        user_id: UUID,
        test_series_id: Optional[UUID] = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List, int]:
        """Get user's attempt history."""
        # This would need a more complex query in production
        # For now, return empty list
        return [], 0
