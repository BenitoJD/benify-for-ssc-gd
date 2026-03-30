import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from internal.main import app
from internal.database import Base, get_db
from internal.redis import get_redis, get_cache, CacheService
from internal.config import settings


# Test database URL - use SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


# Configure pytest-asyncio
def pytest_configure(config):
    config.addinivalue_line("markers", "asyncio: mark test as an asyncio test")


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def mock_cache() -> CacheService:
    """Create mock cache service for testing."""
    cache_store = {}
    
    class MockCacheService:
        async def get(self, key: str):
            return cache_store.get(key)
        
        async def set(self, key: str, value: str, ttl: int = None):
            cache_store[key] = value
        
        async def delete(self, key: str):
            cache_store.pop(key, None)
        
        async def exists(self, key: str):
            return key in cache_store
        
        async def get_json(self, key: str):
            import json
            value = cache_store.get(key)
            if value:
                return json.loads(value)
            return None
        
        async def set_json(self, key: str, value: dict, ttl: int = None):
            import json
            cache_store[key] = json.dumps(value)
    
    return MockCacheService()


@pytest.fixture(scope="function")
async def client(test_db: AsyncSession, mock_cache: CacheService) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with overridden dependencies."""
    
    async def override_get_db():
        yield test_db
    
    async def override_get_cache():
        return mock_cache
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_cache] = override_get_cache
    
    # Clear rate limiters before each test
    from internal.auth.service import auth_rate_limiter, otp_rate_limiter
    auth_rate_limiter.attempts.clear()
    otp_rate_limiter.attempts.clear()
    
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()
