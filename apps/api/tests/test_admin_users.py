"""
Tests for admin user management endpoints.
"""
import pytest
from httpx import AsyncClient
from internal.main import app


class TestAdminUserEndpoints:
    """Tests for admin user list and detail endpoints."""
    
    @pytest.fixture
    async def admin_user_token(self, client: AsyncClient):
        """Create an admin user and return access token."""
        from internal.auth.service import get_password_hash
        from internal.database import AsyncSessionLocal
        from internal.auth.models import User
        from internal.auth.schemas import UserRole
        
        # Create admin user directly in DB
        async with AsyncSessionLocal() as db:
            admin = User(
                email="admin@example.com",
                password_hash=get_password_hash("Admin123"),
                name="Admin User",
                role=UserRole.ADMIN,
            )
            db.add(admin)
            await db.commit()
        
        # Login as admin
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@example.com",
                "password": "Admin123"
            }
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture
    async def regular_user_token(self, client: AsyncClient):
        """Create a regular user and return access token."""
        # Register regular user
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "user@example.com",
                "password": "User1234",
                "name": "Regular User"
            }
        )
        assert response.status_code == 201
        return response.json()["access_token"]
    
    @pytest.mark.asyncio
    async def test_list_users_as_admin(self, client: AsyncClient, admin_user_token: str):
        """Test admin can list users."""
        response = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "meta" in data
        assert "page" in data["meta"]
        assert "limit" in data["meta"]
        assert "total" in data["meta"]
        assert "pages" in data["meta"]
        # data should be a list
        assert isinstance(data["data"], list)
    
    @pytest.mark.asyncio
    async def test_list_users_with_pagination(self, client: AsyncClient, admin_user_token: str):
        """Test admin can list users with pagination."""
        response = await client.get(
            "/api/v1/admin/users?page=1&limit=10",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["meta"]["page"] == 1
        assert data["meta"]["limit"] == 10
    
    @pytest.mark.asyncio
    async def test_list_users_with_search(self, client: AsyncClient, admin_user_token: str):
        """Test admin can search users by email or name."""
        response = await client.get(
            "/api/v1/admin/users?search=admin",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
    
    @pytest.mark.asyncio
    async def test_list_users_unauthenticated(self, client: AsyncClient):
        """Test unauthenticated request to list users fails."""
        response = await client.get("/api/v1/admin/users")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_list_users_as_regular_user(self, client: AsyncClient, regular_user_token: str):
        """Test regular user cannot list users."""
        response = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {regular_user_token}"}
        )
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_get_user_detail_as_admin(self, client: AsyncClient, admin_user_token: str):
        """Test admin can get user detail."""
        # First get the admin's own ID from the users list
        list_response = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert list_response.status_code == 200
        users = list_response.json()["data"]
        assert len(users) > 0
        admin_user_id = users[0]["id"]
        
        # Get admin user detail
        response = await client.get(
            f"/api/v1/admin/users/{admin_user_id}",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == admin_user_id
        assert "email" in data
        assert "role" in data
        assert "subscription_status" in data
        assert "created_at" in data
        assert "is_active" in data
    
    @pytest.mark.asyncio
    async def test_get_user_detail_with_profile_and_stats(self, client: AsyncClient, admin_user_token: str):
        """Test admin can get user detail with profile and stats."""
        # Get admin user detail
        list_response = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        users = list_response.json()["data"]
        admin_user_id = users[0]["id"]
        
        response = await client.get(
            f"/api/v1/admin/users/{admin_user_id}",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Profile and stats should be present (even if None for new users)
        assert "profile" in data
        assert "stats" in data
    
    @pytest.mark.asyncio
    async def test_get_user_detail_unauthenticated(self, client: AsyncClient):
        """Test unauthenticated request to get user detail fails."""
        response = await client.get("/api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_user_detail_as_regular_user(self, client: AsyncClient, regular_user_token: str):
        """Test regular user cannot get user detail."""
        response = await client.get(
            "/api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000",
            headers={"Authorization": f"Bearer {regular_user_token}"}
        )
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_get_user_detail_invalid_uuid(self, client: AsyncClient, admin_user_token: str):
        """Test invalid UUID format returns 400."""
        response = await client.get(
            "/api/v1/admin/users/invalid-uuid",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 400
        assert "Invalid user ID format" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_get_user_detail_not_found(self, client: AsyncClient, admin_user_token: str):
        """Test non-existent user returns 404."""
        fake_uuid = "123e4567-e89b-12d3-a456-426614174000"
        response = await client.get(
            f"/api/v1/admin/users/{fake_uuid}",
            headers={"Authorization": f"Bearer {admin_user_token}"}
        )
        assert response.status_code == 404
