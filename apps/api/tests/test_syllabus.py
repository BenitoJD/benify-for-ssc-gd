"""
Tests for syllabus module endpoints.

Tests subjects, topics, lessons, bookmarks, notes, and progress tracking.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from internal.auth.schemas import UserRole


class TestSubjects:
    """Tests for subject endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_subjects_requires_auth(self, client: AsyncClient):
        """Test that getting subjects requires authentication."""
        response = await client.get("/api/v1/subjects")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_subjects_returns_list(
        self, client: AsyncClient, test_db: AsyncSession
    ):
        """Test getting subjects returns a list."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/subjects",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestSubjectTopics:
    """Tests for subject topics endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_subject_topics_invalid_id(self, client: AsyncClient):
        """Test getting topics with invalid subject ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/subjects/invalid-uuid/topics",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid subject ID format" in response.json()["detail"]


class TestTopicLessons:
    """Tests for topic lessons endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_topic_lessons_invalid_id(self, client: AsyncClient):
        """Test getting lessons with invalid topic ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/topics/invalid-uuid/lessons",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid topic ID format" in response.json()["detail"]


class TestLessonComplete:
    """Tests for lesson completion endpoints."""
    
    @pytest.mark.asyncio
    async def test_mark_lesson_complete_invalid_id(self, client: AsyncClient):
        """Test marking lesson complete with invalid ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.post(
            "/api/v1/lessons/invalid-uuid/complete",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid lesson ID format" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_unmark_lesson_complete_invalid_id(self, client: AsyncClient):
        """Test unmarking lesson complete with invalid ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.delete(
            "/api/v1/lessons/invalid-uuid/complete",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid lesson ID format" in response.json()["detail"]


class TestLessonBookmark:
    """Tests for lesson bookmark endpoints."""
    
    @pytest.mark.asyncio
    async def test_toggle_bookmark_invalid_id(self, client: AsyncClient):
        """Test toggling bookmark with invalid ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.post(
            "/api/v1/lessons/invalid-uuid/bookmark",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid lesson ID format" in response.json()["detail"]


class TestLessonNotes:
    """Tests for lesson notes endpoints."""
    
    @pytest.mark.asyncio
    async def test_create_note_invalid_lesson_id(self, client: AsyncClient):
        """Test creating note with invalid lesson ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        # Note: lesson_id from path is used, not from body
        # So we just send personal_notes
        response = await client.post(
            "/api/v1/lessons/invalid-uuid/notes",
            headers={"Authorization": f"Bearer {token}"},
            json={"personal_notes": "Test note"}
        )
        assert response.status_code == 400
        assert "Invalid lesson ID format" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_delete_note_invalid_lesson_id(self, client: AsyncClient):
        """Test deleting note with invalid lesson ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.delete(
            "/api/v1/lessons/invalid-uuid/notes",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid lesson ID format" in response.json()["detail"]


class TestUserBookmarks:
    """Tests for user bookmarks endpoint."""
    
    @pytest.mark.asyncio
    async def test_get_user_bookmarks_requires_auth(self, client: AsyncClient):
        """Test that getting bookmarks requires authentication."""
        response = await client.get("/api/v1/users/me/bookmarks")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_user_bookmarks_returns_list(self, client: AsyncClient):
        """Test getting bookmarks returns a list grouped by subject."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/users/me/bookmarks",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestUserNotes:
    """Tests for user notes endpoint."""
    
    @pytest.mark.asyncio
    async def test_get_user_notes_requires_auth(self, client: AsyncClient):
        """Test that getting notes requires authentication."""
        response = await client.get("/api/v1/users/me/notes")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_user_notes_returns_list(self, client: AsyncClient):
        """Test getting notes returns a list grouped by subject."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/users/me/notes",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestProgressEndpoints:
    """Tests for progress endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_topic_progress_invalid_id(self, client: AsyncClient):
        """Test getting topic progress with invalid ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/topics/invalid-uuid/progress",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid topic ID format" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_get_subject_progress_invalid_id(self, client: AsyncClient):
        """Test getting subject progress with invalid ID returns 400."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test1234"}
        )
        token = login_resp.json()["access_token"]
        
        response = await client.get(
            "/api/v1/subjects/invalid-uuid/progress",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid subject ID format" in response.json()["detail"]
