import pytest
import pytest_asyncio
import warnings
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from internal.main import app
from internal.database import Base, get_db
from internal.redis import get_redis, get_cache, CacheService
from internal.config import settings

warnings.filterwarnings(
    "ignore",
    category=DeprecationWarning,
    module=r"asyncio\.events",
)
warnings.filterwarnings(
    "ignore",
    category=DeprecationWarning,
    module=r"asyncio\.events",
)
warnings.filterwarnings(
    "ignore",
    category=DeprecationWarning,
    module=r"anyio\._backends\._asyncio",
)


# Test database URL - use SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
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

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
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

        async def increment(self, key: str, ttl: int):
            current = int(cache_store.get(key, 0)) + 1
            cache_store[key] = current
            return current
        
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


@pytest_asyncio.fixture(scope="function")
async def client(test_db: AsyncSession, mock_cache: CacheService) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with overridden dependencies."""
    
    async def override_get_db():
        yield test_db
    
    async def override_get_cache():
        return mock_cache
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_cache] = override_get_cache
    
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()
