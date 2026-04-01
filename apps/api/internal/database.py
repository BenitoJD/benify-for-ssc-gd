from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator

from .config import settings

# Create async engine - SQLite doesn't support pool_size/max_overflow
db_url = settings.computed_database_url
if "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=settings.DEBUG,
    )
else:
    engine = create_async_engine(
        db_url,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DEBUG,
    )

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database - creates all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    await engine.dispose()
