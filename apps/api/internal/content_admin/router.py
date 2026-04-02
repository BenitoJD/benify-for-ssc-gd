from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.dependencies import TokenData, require_admin_or_opencloud
from ..config import settings
from ..database import get_db
from .schemas import (
    ContentSyncAuditLogListResponse,
    ContentSyncRequest,
    ContentSyncResponse,
    OpenCloudCapabilitiesResponse,
)
from .service import ContentAdminService

router = APIRouter(prefix="/admin/opencloud", tags=["Admin OpenCloud"])


@router.get("/capabilities", response_model=OpenCloudCapabilitiesResponse)
async def get_opencloud_capabilities(
    _: TokenData = Depends(require_admin_or_opencloud),
) -> OpenCloudCapabilitiesResponse:
    """Describe the agent-facing admin automation surface."""
    auth_modes = ["bearer_admin_jwt"]
    if settings.OPENCLOUD_ADMIN_API_KEY:
        auth_modes.append("x-opencloud-api-key")

    return OpenCloudCapabilitiesResponse(
        opencloud_api_key_enabled=bool(settings.OPENCLOUD_ADMIN_API_KEY),
        auth_modes=auth_modes,
        bulk_sync_endpoint="/api/v1/admin/opencloud/content/sync",
        supported_resources=["subjects", "topics", "lessons", "questions", "test_series"],
    )


@router.post("/content/sync", response_model=ContentSyncResponse)
async def sync_content(
    payload: ContentSyncRequest,
    current_user: TokenData = Depends(require_admin_or_opencloud),
    db: AsyncSession = Depends(get_db),
) -> ContentSyncResponse:
    """Bulk upsert content resources for agent-driven admin automation."""
    service = ContentAdminService(db)
    return await service.sync_content(
        payload,
        actor_id=current_user.user_id or "unknown",
        actor_email=current_user.email,
    )


@router.get("/audit-logs", response_model=ContentSyncAuditLogListResponse)
async def list_audit_logs(
    limit: int = 20,
    _: TokenData = Depends(require_admin_or_opencloud),
    db: AsyncSession = Depends(get_db),
) -> ContentSyncAuditLogListResponse:
    """Return recent content sync audit logs."""
    service = ContentAdminService(db)
    return ContentSyncAuditLogListResponse(data=await service.list_audit_logs(limit=limit))
