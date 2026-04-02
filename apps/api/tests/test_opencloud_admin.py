import json

import pytest
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from internal.config import settings
from internal.content_admin.models import ContentSyncAuditLog
from internal.questions.models import Question
from internal.syllabus.models import Lesson, Subject, Topic
from internal.tests.models import TestSeries as TestSeriesModel


@pytest.fixture
def opencloud_api_key(monkeypatch: pytest.MonkeyPatch) -> str:
    key = "opencloud-test-key"
    monkeypatch.setattr(settings, "OPENCLOUD_ADMIN_API_KEY", key)
    return key


@pytest.mark.asyncio
async def test_opencloud_capabilities_requires_valid_api_key(
    client: AsyncClient,
    opencloud_api_key: str,
):
    response = await client.get(
        "/api/v1/admin/opencloud/capabilities",
        headers={"X-OpenCloud-Api-Key": opencloud_api_key},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["opencloud_api_key_enabled"] is True
    assert "x-opencloud-api-key" in data["auth_modes"]
    assert data["bulk_sync_endpoint"] == "/api/v1/admin/opencloud/content/sync"


@pytest.mark.asyncio
async def test_opencloud_content_sync_upserts_resources(
    client: AsyncClient,
    test_db: AsyncSession,
    opencloud_api_key: str,
):
    payload = {
        "subjects": [
            {
                "code": "GK",
                "name": "General Knowledge",
                "description": "Static and current general awareness",
                "order_index": 1,
            }
        ],
        "topics": [
            {
                "subject_code": "GK",
                "name": "Indian History",
                "description": "Ancient to modern history",
                "order_index": 1,
                "estimated_hours": 6,
            }
        ],
        "lessons": [
            {
                "subject_code": "GK",
                "topic_name": "Indian History",
                "title": "Revolt of 1857",
                "content": "Detailed lesson content",
                "order_index": 1,
                "estimated_minutes": 25,
                "is_premium": False,
            }
        ],
        "questions": [
            {
                "subject_code": "GK",
                "topic_name": "Indian History",
                "question_text": "Who was the last Mughal emperor of India?",
                "options": ["Bahadur Shah Zafar", "Akbar", "Aurangzeb", "Humayun"],
                "correct_answer": "A",
                "explanation": "Bahadur Shah Zafar was the last Mughal emperor.",
                "difficulty": "easy",
                "source": "OpenCloud",
                "exam_year": 2024,
            }
        ],
        "test_series": [
            {
                "title": "History Sprint",
                "description": "Quick chapter test",
                "test_type": "chapter",
                "duration_minutes": 15,
                "total_questions": 10,
                "topic_refs": [
                    {
                        "subject_code": "GK",
                        "topic_name": "Indian History",
                    }
                ],
                "instructions": "Attempt all questions.",
            }
        ],
    }

    response = await client.post(
        "/api/v1/admin/opencloud/content/sync",
        headers={"X-OpenCloud-Api-Key": opencloud_api_key},
        json=payload,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["subjects"]["created"] == 1
    assert data["topics"]["created"] == 1
    assert data["lessons"]["created"] == 1
    assert data["questions"]["created"] == 1
    assert data["test_series"]["created"] == 1

    subject = (await test_db.execute(select(Subject))).scalar_one()
    topic = (await test_db.execute(select(Topic))).scalar_one()
    lesson = (await test_db.execute(select(Lesson))).scalar_one()
    question = (await test_db.execute(select(Question))).scalar_one()
    test_series = (await test_db.execute(select(TestSeriesModel))).scalar_one()

    assert subject.code == "GK"
    assert topic.subject_id == subject.id
    assert lesson.topic_id == topic.id
    assert question.topic_id == topic.id
    assert json.loads(question.options) == [
        "Bahadur Shah Zafar",
        "Akbar",
        "Aurangzeb",
        "Humayun",
    ]
    assert json.loads(test_series.topic_ids) == [str(topic.id)]

    updated_payload = {
        "subjects": [
            {
                "code": "GK",
                "name": "General Knowledge and Awareness",
                "description": "Updated description",
                "order_index": 2,
            }
        ],
        "topics": payload["topics"],
        "lessons": [
            {
                "subject_code": "GK",
                "topic_name": "Indian History",
                "title": "Revolt of 1857",
                "content": "Updated lesson content",
                "order_index": 1,
                "estimated_minutes": 30,
                "is_premium": True,
            }
        ],
        "questions": payload["questions"],
        "test_series": payload["test_series"],
    }

    second_response = await client.post(
        "/api/v1/admin/opencloud/content/sync",
        headers={"X-OpenCloud-Api-Key": opencloud_api_key},
        json=updated_payload,
    )

    assert second_response.status_code == 200
    second_data = second_response.json()
    assert second_data["subjects"]["updated"] == 1
    assert second_data["topics"]["skipped"] == 1
    assert second_data["lessons"]["updated"] == 1
    assert second_data["questions"]["skipped"] == 1
    assert second_data["test_series"]["skipped"] == 1

    subject_count = await test_db.scalar(select(func.count()).select_from(Subject))
    topic_count = await test_db.scalar(select(func.count()).select_from(Topic))
    lesson_count = await test_db.scalar(select(func.count()).select_from(Lesson))
    question_count = await test_db.scalar(select(func.count()).select_from(Question))
    test_series_count = await test_db.scalar(select(func.count()).select_from(TestSeriesModel))

    assert subject_count == 1
    assert topic_count == 1
    assert lesson_count == 1
    assert question_count == 1
    assert test_series_count == 1

    refreshed_subject = (await test_db.execute(select(Subject))).scalar_one()
    refreshed_lesson = (await test_db.execute(select(Lesson))).scalar_one()
    assert refreshed_subject.name == "General Knowledge and Awareness"
    assert refreshed_lesson.content == "Updated lesson content"
    assert refreshed_lesson.is_premium is True

    audit_logs = (await test_db.execute(select(ContentSyncAuditLog))).scalars().all()
    assert len(audit_logs) == 2
    assert all(log.actor_id == "opencloud-agent" for log in audit_logs)
    assert all(log.status == "completed" for log in audit_logs)


@pytest.mark.asyncio
async def test_opencloud_content_sync_rejects_invalid_api_key(
    client: AsyncClient,
    opencloud_api_key: str,
):
    response = await client.post(
        "/api/v1/admin/opencloud/content/sync",
        headers={"X-OpenCloud-Api-Key": f"{opencloud_api_key}-wrong"},
        json={},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid OpenCloud API key"


@pytest.mark.asyncio
async def test_opencloud_audit_logs_endpoint_returns_recent_runs(
    client: AsyncClient,
    opencloud_api_key: str,
):
    await client.post(
        "/api/v1/admin/opencloud/content/sync",
        headers={"X-OpenCloud-Api-Key": opencloud_api_key},
        json={"dry_run": True},
    )

    response = await client.get(
        "/api/v1/admin/opencloud/audit-logs",
        headers={"X-OpenCloud-Api-Key": opencloud_api_key},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["actor_id"] == "opencloud-agent"
    assert data[0]["dry_run"] is True
    assert data[0]["status"] == "completed"
