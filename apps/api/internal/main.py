from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .database import init_db, close_db
from .redis import get_redis, close_redis
from .shared.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from .auth.router import router as auth_router
from .users.router import router as users_router
from .syllabus.router import router as syllabus_router
from .tests.router import router as tests_router, attempt_router as attempts_router
from .admin.router import router as admin_router
from .pyqs.router import router as pyqs_router
from .analytics.router import router as analytics_router
from .study_plans.router import router as study_plans_router
from .notifications.router import router as notifications_router
from .community.router import router as community_router, reports_router as community_reports_router
from .physical.router import router as physical_router
from .documents.router import router as documents_router
from .gamification.router import router as gamification_router
from .ai.router import router as ai_router
from .referral.router import router as referral_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    # Startup
    logger.info("Starting up OLLI Academy(SSC GD) API...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}. API will start but database features may not work.")
    
    try:
        # Initialize Redis
        await get_redis()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Cache features may not work.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down OLLI Academy(SSC GD) API...")
    
    try:
        await close_redis()
        await close_db()
        logger.info("Cleanup complete")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SSC GD Complete EdTech Platform API",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(syllabus_router, prefix="/api/v1")
app.include_router(tests_router, prefix="/api/v1")
app.include_router(attempts_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(pyqs_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(study_plans_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(community_router, prefix="/api/v1")
app.include_router(community_reports_router, prefix="/api/v1")
app.include_router(physical_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(gamification_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(referral_router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to OLLI Academy(SSC GD) API",
        "docs": "/docs" if settings.DEBUG else "Disabled in production",
    }
