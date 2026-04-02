import json
from typing import Any, Iterable, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..questions.models import Question
from ..syllabus.models import Lesson, Subject, Topic
from ..tests.models import TestSeries
from .models import ContentSyncAuditLog
from .schemas import (
    ContentSyncRequest,
    ContentSyncAuditLogResponse,
    ContentSyncResponse,
    LessonSyncItem,
    QuestionSyncItem,
    ResourceSyncSummary,
    SubjectSyncItem,
    SyncActionResult,
    TestSeriesSyncItem,
    TopicReference,
    TopicSyncItem,
)


class ContentSyncError(Exception):
    pass


class ContentAdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync_content(
        self,
        payload: ContentSyncRequest,
        *,
        actor_id: str,
        actor_email: Optional[str],
    ) -> ContentSyncResponse:
        status = "completed"
        error_message: Optional[str] = None
        response: Optional[ContentSyncResponse] = None

        try:
            response = ContentSyncResponse(
                dry_run=payload.dry_run,
                subjects=await self._sync_subjects(payload.subjects, payload.dry_run),
                topics=await self._sync_topics(payload.topics, payload.dry_run),
                lessons=await self._sync_lessons(payload.lessons, payload.dry_run),
                questions=await self._sync_questions(payload.questions, payload.dry_run),
                test_series=await self._sync_test_series(payload.test_series, payload.dry_run),
            )
            return response
        except Exception as exc:
            status = "failed"
            error_message = str(exc)
            raise
        finally:
            await self._create_audit_log(
                actor_id=actor_id,
                actor_email=actor_email,
                payload=payload,
                response=response,
                status=status,
                error_message=error_message,
            )

    async def list_audit_logs(self, limit: int = 20) -> list[ContentSyncAuditLogResponse]:
        result = await self.db.execute(
            select(ContentSyncAuditLog)
            .order_by(ContentSyncAuditLog.created_at.desc())
            .limit(limit)
        )
        logs = result.scalars().all()
        return [
            ContentSyncAuditLogResponse(
                id=str(log.id),
                actor_id=log.actor_id,
                actor_email=log.actor_email,
                dry_run=log.dry_run,
                status=log.status,
                error_message=log.error_message,
                created_at=log.created_at.isoformat(),
            )
            for log in logs
        ]

    async def _sync_subjects(self, items: list[SubjectSyncItem], dry_run: bool) -> ResourceSyncSummary:
        summary = ResourceSyncSummary(processed=len(items))
        for item in items:
            identifier = f"subject:{item.code}"
            try:
                existing = await self._get_subject_by_code(item.code)
                payload = {
                    "name": item.name.strip(),
                    "description": item.description,
                    "icon_url": item.icon_url,
                    "order_index": item.order_index,
                }
                await self._upsert_model(
                    existing=existing,
                    model=Subject,
                    create_values={"code": item.code.strip(), **payload},
                    update_values=payload,
                    summary=summary,
                    identifier=identifier,
                    dry_run=dry_run,
                )
            except Exception as exc:
                self._append_error(summary, identifier, str(exc))
        return summary

    async def _sync_topics(self, items: list[TopicSyncItem], dry_run: bool) -> ResourceSyncSummary:
        summary = ResourceSyncSummary(processed=len(items))
        for item in items:
            identifier = f"topic:{item.subject_code}/{item.name}"
            try:
                subject = await self._require_subject(item.subject_code)
                existing = await self._get_topic(subject.id, item.name)
                payload = {
                    "subject_id": subject.id,
                    "name": item.name.strip(),
                    "description": item.description,
                    "order_index": item.order_index,
                    "estimated_hours": item.estimated_hours,
                }
                await self._upsert_model(
                    existing=existing,
                    model=Topic,
                    create_values=payload,
                    update_values=payload,
                    summary=summary,
                    identifier=identifier,
                    dry_run=dry_run,
                )
            except Exception as exc:
                self._append_error(summary, identifier, str(exc))
        return summary

    async def _sync_lessons(self, items: list[LessonSyncItem], dry_run: bool) -> ResourceSyncSummary:
        summary = ResourceSyncSummary(processed=len(items))
        for item in items:
            identifier = f"lesson:{item.subject_code}/{item.topic_name}/{item.title}"
            try:
                topic = await self._require_topic(item.subject_code, item.topic_name)
                existing = await self._get_lesson(topic.id, item.title)
                payload = {
                    "topic_id": topic.id,
                    "title": item.title.strip(),
                    "content": item.content,
                    "video_url": item.video_url,
                    "order_index": item.order_index,
                    "estimated_minutes": item.estimated_minutes,
                    "is_premium": item.is_premium,
                }
                await self._upsert_model(
                    existing=existing,
                    model=Lesson,
                    create_values=payload,
                    update_values=payload,
                    summary=summary,
                    identifier=identifier,
                    dry_run=dry_run,
                )
            except Exception as exc:
                self._append_error(summary, identifier, str(exc))
        return summary

    async def _sync_questions(self, items: list[QuestionSyncItem], dry_run: bool) -> ResourceSyncSummary:
        summary = ResourceSyncSummary(processed=len(items))
        for item in items:
            identifier = f"question:{item.subject_code}/{item.topic_name}/{item.question_text[:50]}"
            try:
                topic = await self._require_topic(item.subject_code, item.topic_name)
                existing = await self._get_question(topic.id, item.question_text, item.source, item.exam_year)
                payload = {
                    "topic_id": topic.id,
                    "question_text": item.question_text.strip(),
                    "question_type": item.question_type,
                    "options": self._json_dump(item.options),
                    "correct_answer": item.correct_answer,
                    "explanation": item.explanation,
                    "difficulty": item.difficulty,
                    "marks": item.marks,
                    "negative_marks": item.negative_marks,
                    "is_premium": item.is_premium,
                    "source": item.source,
                    "exam_year": item.exam_year,
                }
                await self._upsert_model(
                    existing=existing,
                    model=Question,
                    create_values=payload,
                    update_values=payload,
                    summary=summary,
                    identifier=identifier,
                    dry_run=dry_run,
                )
            except Exception as exc:
                self._append_error(summary, identifier, str(exc))
        return summary

    async def _sync_test_series(self, items: list[TestSeriesSyncItem], dry_run: bool) -> ResourceSyncSummary:
        summary = ResourceSyncSummary(processed=len(items))
        for item in items:
            identifier = f"test-series:{item.test_type}/{item.title}"
            try:
                subject_ids = await self._resolve_subject_ids(item.subject_codes or [])
                topic_ids = await self._resolve_topic_ids(item.topic_refs or [])
                existing = await self._get_test_series(item.title, item.test_type.value)
                payload = {
                    "title": item.title.strip(),
                    "description": item.description,
                    "test_type": item.test_type,
                    "duration_minutes": item.duration_minutes,
                    "total_questions": item.total_questions,
                    "marks_per_question": item.marks_per_question,
                    "negative_marking": item.negative_marking,
                    "negative_marks_per_question": item.negative_marks_per_question,
                    "is_premium": item.is_premium,
                    "is_active": item.is_active,
                    "subject_ids": self._json_dump(subject_ids) if subject_ids else None,
                    "topic_ids": self._json_dump(topic_ids) if topic_ids else None,
                    "instructions": item.instructions,
                    "passing_percentage": item.passing_percentage,
                }
                await self._upsert_model(
                    existing=existing,
                    model=TestSeries,
                    create_values=payload,
                    update_values=payload,
                    summary=summary,
                    identifier=identifier,
                    dry_run=dry_run,
                )
            except Exception as exc:
                self._append_error(summary, identifier, str(exc))
        return summary

    async def _upsert_model(
        self,
        *,
        existing: Optional[Any],
        model: type[Any],
        create_values: dict[str, Any],
        update_values: dict[str, Any],
        summary: ResourceSyncSummary,
        identifier: str,
        dry_run: bool,
    ) -> None:
        if existing is None:
            summary.created += 1
            summary.items.append(SyncActionResult(action="created", identifier=identifier))
            if not dry_run:
                self.db.add(model(**create_values))
                await self.db.flush()
            return

        changed = self._apply_changes(existing, update_values)
        if not changed:
            summary.skipped += 1
            summary.items.append(SyncActionResult(action="skipped", identifier=identifier))
            return

        summary.updated += 1
        summary.items.append(SyncActionResult(action="updated", identifier=identifier))
        if not dry_run:
            await self.db.flush()

    def _apply_changes(self, existing: Any, values: dict[str, Any]) -> bool:
        changed = False
        for field, new_value in values.items():
            current_value = getattr(existing, field)
            if current_value != new_value:
                setattr(existing, field, new_value)
                changed = True
        return changed

    async def _get_subject_by_code(self, code: str) -> Optional[Subject]:
        result = await self.db.execute(
            select(Subject).where(func.lower(Subject.code) == code.strip().lower())
        )
        return result.scalar_one_or_none()

    async def _get_topic(self, subject_id: Any, name: str) -> Optional[Topic]:
        result = await self.db.execute(
            select(Topic).where(
                Topic.subject_id == subject_id,
                func.lower(Topic.name) == name.strip().lower(),
            )
        )
        return result.scalar_one_or_none()

    async def _get_lesson(self, topic_id: Any, title: str) -> Optional[Lesson]:
        result = await self.db.execute(
            select(Lesson).where(
                Lesson.topic_id == topic_id,
                func.lower(Lesson.title) == title.strip().lower(),
            )
        )
        return result.scalar_one_or_none()

    async def _get_question(
        self,
        topic_id: Any,
        question_text: str,
        source: Optional[str],
        exam_year: Optional[int],
    ) -> Optional[Question]:
        stmt = select(Question).where(
            Question.topic_id == topic_id,
            func.lower(Question.question_text) == question_text.strip().lower(),
        )
        stmt = stmt.where(Question.source == source)
        stmt = stmt.where(Question.exam_year == exam_year)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def _get_test_series(self, title: str, test_type: str) -> Optional[TestSeries]:
        result = await self.db.execute(
            select(TestSeries).where(
                func.lower(TestSeries.title) == title.strip().lower(),
                TestSeries.test_type == test_type,
            )
        )
        return result.scalar_one_or_none()

    async def _require_subject(self, subject_code: str) -> Subject:
        subject = await self._get_subject_by_code(subject_code)
        if subject is None:
            raise ContentSyncError(f"Subject not found for code '{subject_code}'")
        return subject

    async def _require_topic(self, subject_code: str, topic_name: str) -> Topic:
        subject = await self._require_subject(subject_code)
        topic = await self._get_topic(subject.id, topic_name)
        if topic is None:
            raise ContentSyncError(
                f"Topic '{topic_name}' not found under subject '{subject_code}'"
            )
        return topic

    async def _resolve_subject_ids(self, subject_codes: Iterable[str]) -> list[str]:
        subject_ids: list[str] = []
        for subject_code in subject_codes:
            subject = await self._require_subject(subject_code)
            subject_ids.append(str(subject.id))
        return subject_ids

    async def _resolve_topic_ids(self, topic_refs: Iterable[TopicReference]) -> list[str]:
        topic_ids: list[str] = []
        for topic_ref in topic_refs:
            topic = await self._require_topic(topic_ref.subject_code, topic_ref.topic_name)
            topic_ids.append(str(topic.id))
        return topic_ids

    def _append_error(self, summary: ResourceSyncSummary, identifier: str, detail: str) -> None:
        summary.errors += 1
        summary.items.append(SyncActionResult(action="error", identifier=identifier, detail=detail))

    def _json_dump(self, value: Any) -> str:
        return json.dumps(value, separators=(",", ":"), sort_keys=True)

    async def _create_audit_log(
        self,
        *,
        actor_id: str,
        actor_email: Optional[str],
        payload: ContentSyncRequest,
        response: Optional[ContentSyncResponse],
        status: str,
        error_message: Optional[str],
    ) -> None:
        audit_log = ContentSyncAuditLog(
            actor_id=actor_id,
            actor_email=actor_email,
            dry_run=payload.dry_run,
            status=status,
            request_payload=self._json_dump(payload.model_dump(mode="json")),
            result_summary=self._json_dump(response.model_dump(mode="json")) if response else None,
            error_message=error_message,
        )
        self.db.add(audit_log)
        await self.db.flush()
