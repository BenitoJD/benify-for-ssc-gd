from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
import os
from pathlib import Path


def _resolve_root_env_file(config_path: Path) -> Path:
    resolved_path = config_path.resolve()

    for parent in resolved_path.parents:
        candidate = parent / ".env"
        if candidate.exists():
            return candidate

    return resolved_path.parents[1] / ".env"


ROOT_ENV_FILE = _resolve_root_env_file(Path(__file__))
API_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(ROOT_ENV_FILE), str(API_ENV_FILE)),
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "OLLI Academy(SSC GD) API"
    APP_VERSION: str = "1.0.0"
    APP_URL: str = "http://localhost:3101"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 3100
    
    # Database
    DB_USER: str = "your_db_user"
    DB_PASSWORD: str = "your_db_password"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "olli_academy_ssc_gd"
    DATABASE_URL: Optional[str] = None  # Set via DATABASE_URL env var or constructed from DB_* vars
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 300  # 5 minutes
    
    # MinIO/S3
    MINIO_ENDPOINT: str = "localhost:3102"
    MINIO_ACCESS_KEY: str = "your_minio_access_key"
    MINIO_SECRET_KEY: str = "your_minio_secret_key"
    MINIO_BUCKET: str = "olli-academy-ssc-gd"
    MINIO_SECURE: bool = False
    
    # JWT
    JWT_SECRET_KEY: str = "your_super_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3101", "http://localhost:3000"]
    
    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Agent automation
    OPENCLOUD_ADMIN_API_KEY: Optional[str] = None
    
    @property
    def computed_database_url(self) -> str:
        """Construct DATABASE_URL from individual DB settings if not explicitly set."""
        # Use os.environ.get to ensure we get the actual env var value at runtime
        db_url = os.environ.get("DATABASE_URL")
        if db_url:
            return db_url
        
        db_user = os.environ.get("DB_USER", self.DB_USER)
        db_password = os.environ.get("DB_PASSWORD", self.DB_PASSWORD)
        db_host = os.environ.get("DB_HOST", self.DB_HOST)
        db_port = os.environ.get("DB_PORT", self.DB_PORT)
        db_name = os.environ.get("DB_NAME", self.DB_NAME)
        
        # Build connection string using string concatenation
        result = "postgresql"
        result += "+asyncpg://"
        result += db_user + ":" + db_password
        result += "@" + db_host + ":" + db_port
        result += "/" + db_name
        return result


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
