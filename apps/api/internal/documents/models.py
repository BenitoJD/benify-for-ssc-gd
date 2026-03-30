"""
SQLAlchemy models for document checklist module.

Includes: DocumentChecklist, UserDocumentChecklist models.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base
import enum


class DocumentStage(str, enum.Enum):
    """Document stage enumeration for SSC GD process."""
    PST = "pst"  # Physical Standard Test
    PET = "pet"  # Physical Efficiency Test
    MEDICAL = "medical"  # Medical Examination
    DOCUMENT_VERIFICATION = "document_verification"  # Document Verification


class DocumentStatus(str, enum.Enum):
    """Document verification status."""
    PENDING = "pending"
    UPLOADED = "uploaded"
    UNDER_VERIFICATION = "under_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"


class DocumentChecklist(Base):
    """Document checklist item model."""
    
    __tablename__ = "document_checklists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Stage this document belongs to
    stage = Column(SQLEnum(DocumentStage), nullable=False)
    
    # Document requirements
    document_type = Column(String(100), nullable=True)  # e.g., "marksheet", "certificate", "id_proof"
    is_required = Column(Boolean, default=True, nullable=False)
    is_required_for_all = Column(Boolean, default=True, nullable=False)
    is_required_for_gender = Column(String(10), nullable=True)  # male, female, or null for all
    
    # File requirements
    accepted_formats = Column(String(100), default="PDF,JPG,PNG,JPEG", nullable=False)
    max_file_size_mb = Column(Integer, default=5, nullable=False)
    
    # Content
    instructions = Column(Text, nullable=True)  # Specific instructions for this document
    
    # Metadata
    order_index = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<DocumentChecklist {self.id}: {self.title}>"


class UserDocumentChecklist(Base):
    """Model for tracking user's document submission status."""
    
    __tablename__ = "user_document_checklists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    checklist_item_id = Column(UUID(as_uuid=True), ForeignKey("document_checklists.id"), nullable=False)
    
    # Status tracking
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING, nullable=False)
    
    # Document file
    uploaded_file_url = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    
    # Review info
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Deadline
    deadline = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="selectin")
    checklist_item = relationship("DocumentChecklist", lazy="selectin")
    reviewer = relationship("User", foreign_keys=[reviewed_by], lazy="selectin")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<UserDocumentChecklist {self.id}: user={self.user_id} item={self.checklist_item_id}>"
