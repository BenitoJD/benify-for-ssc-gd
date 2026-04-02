from datetime import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from ..database import Base


class ContentSyncAuditLog(Base):
    """Persistent audit log for OpenCloud/admin content sync runs."""

    __tablename__ = "content_sync_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(String(255), nullable=False)
    actor_email = Column(String(255), nullable=True)
    dry_run = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), nullable=False, default="completed")
    request_payload = Column(Text, nullable=False)
    result_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ContentSyncAuditLog {self.id} status={self.status}>"
