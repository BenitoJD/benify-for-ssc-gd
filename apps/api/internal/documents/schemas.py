"""
Pydantic schemas for document checklist module.

Includes request/response schemas for document checklists,
user document status, and medical guidelines.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class DocumentStage(str, Enum):
    """Document stage enumeration for SSC GD process."""
    PST = "pst"
    PET = "pet"
    MEDICAL = "medical"
    DOCUMENT_VERIFICATION = "document_verification"


class DocumentStatus(str, Enum):
    """Document verification status."""
    PENDING = "pending"
    UPLOADED = "uploaded"
    UNDER_VERIFICATION = "under_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"


# ============ Document Checklist Schemas ============

class DocumentChecklistBase(BaseModel):
    """Base document checklist schema."""
    title: str
    description: Optional[str] = None
    stage: DocumentStage
    document_type: Optional[str] = None
    is_required: bool = True
    is_required_for_all: bool = True
    is_required_for_gender: Optional[str] = None  # male, female, or null for all
    accepted_formats: str = "PDF,JPG,PNG,JPEG"
    max_file_size_mb: int = 5
    instructions: Optional[str] = None
    order_index: int = 0


class DocumentChecklistResponse(DocumentChecklistBase):
    """Response schema for document checklist item."""
    id: UUID
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentChecklistListResponse(BaseModel):
    """Response schema for listing document checklist items."""
    id: str
    title: str
    description: Optional[str] = None
    stage: str
    document_type: Optional[str] = None
    is_required: bool
    is_required_for_all: bool
    is_required_for_gender: Optional[str] = None
    accepted_formats: str
    max_file_size_mb: int
    instructions: Optional[str] = None
    order_index: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ User Document Status Schemas ============

class UserDocumentStatusResponse(BaseModel):
    """Response schema for user's document status."""
    id: str
    checklist_item_id: str
    status: str
    uploaded_file_url: Optional[str] = None
    original_filename: Optional[str] = None
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None
    deadline: Optional[datetime] = None
    updated_at: datetime
    checklist_item: DocumentChecklistListResponse
    
    class Config:
        from_attributes = True


class DocumentReadinessSummary(BaseModel):
    """Response schema for document readiness summary."""
    stage: str
    total_required: int
    total_uploaded: int
    total_verified: int
    total_rejected: int
    pending_count: int
    completion_percentage: float


# ============ Medical Guidelines Schemas ============

class MedicalGuidelineCategory(str, Enum):
    """Medical guideline category."""
    VISION = "vision"
    PHYSICAL = "physical"
    COMMON_REJECTIONS = "common_rejections"


class MedicalGuidelineBase(BaseModel):
    """Base medical guideline schema."""
    title: str
    category: MedicalGuidelineCategory
    content: str
    order_index: int = 0


class MedicalGuidelineResponse(MedicalGuidelineBase):
    """Response schema for medical guideline."""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class MedicalGuidelineListResponse(BaseModel):
    """Response schema for listing medical guidelines."""
    id: str
    title: str
    category: str
    content: str
    order_index: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Admin Document Schemas ============

class AdminDocumentChecklistCreate(BaseModel):
    """Schema for creating a document checklist item (admin)."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    stage: DocumentStage
    document_type: Optional[str] = None
    is_required: bool = True
    is_required_for_all: bool = True
    is_required_for_gender: Optional[str] = None
    accepted_formats: str = "PDF,JPG,PNG,JPEG"
    max_file_size_mb: int = Field(default=5, ge=1, le=50)
    instructions: Optional[str] = None
    order_index: int = 0
    is_active: bool = True


class AdminDocumentChecklistUpdate(BaseModel):
    """Schema for updating a document checklist item (admin)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    stage: Optional[DocumentStage] = None
    document_type: Optional[str] = None
    is_required: Optional[bool] = None
    is_required_for_all: Optional[bool] = None
    is_required_for_gender: Optional[str] = None
    accepted_formats: Optional[str] = None
    max_file_size_mb: Optional[int] = Field(None, ge=1, le=50)
    instructions: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class AdminDocumentChecklistResponse(DocumentChecklistBase):
    """Response schema for admin document checklist."""
    id: UUID
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AdminDocumentChecklistListItem(BaseModel):
    """List item for admin document checklists."""
    id: str
    title: str
    description: Optional[str] = None
    stage: str
    document_type: Optional[str] = None
    is_required: bool
    is_required_for_all: bool
    is_required_for_gender: Optional[str] = None
    accepted_formats: str
    max_file_size_mb: int
    instructions: Optional[str] = None
    order_index: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Admin Medical Guideline Schemas ============

class AdminMedicalGuidelineCreate(BaseModel):
    """Schema for creating a medical guideline (admin)."""
    title: str = Field(..., min_length=1, max_length=255)
    category: MedicalGuidelineCategory
    content: str = Field(..., min_length=1)
    order_index: int = 0


class AdminMedicalGuidelineUpdate(BaseModel):
    """Schema for updating a medical guideline (admin)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[MedicalGuidelineCategory] = None
    content: Optional[str] = Field(None, min_length=1)
    order_index: Optional[int] = None


class AdminMedicalGuidelineResponse(MedicalGuidelineBase):
    """Response schema for admin medical guideline."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============ Admin Document Compliance Schemas ============

class DocumentComplianceStats(BaseModel):
    """Statistics for document compliance monitoring."""
    total_users: int
    pst_complete_count: int
    pet_complete_count: int
    medical_complete_count: int
    dv_complete_count: int
    fully_complete_count: int
    pst_complete_percentage: float
    pet_complete_percentage: float
    medical_complete_percentage: float
    dv_complete_percentage: float
    fully_complete_percentage: float


class DocumentComplianceByGender(BaseModel):
    """Compliance breakdown by gender for documents."""
    gender: str
    total_users: int
    pst_complete_count: int
    pet_complete_count: int
    medical_complete_count: int
    dv_complete_count: int
    fully_complete_count: int
    pst_complete_percentage: float
    pet_complete_percentage: float
    medical_complete_percentage: float
    dv_complete_percentage: float
    fully_complete_percentage: float


# ============ Announcement Schemas ============

class AnnouncementPriority(str, Enum):
    """Announcement priority level."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class AnnouncementTarget(str, Enum):
    """Announcement target audience."""
    ALL = "all"
    MALE = "male"
    FEMALE = "female"
    PREMIUM = "premium"
    FREE = "free"


class AnnouncementBase(BaseModel):
    """Base announcement schema."""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    priority: AnnouncementPriority = AnnouncementPriority.NORMAL
    target: AnnouncementTarget = AnnouncementTarget.ALL
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AnnouncementResponse(AnnouncementBase):
    """Response schema for announcement."""
    id: UUID
    admin_id: UUID
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminAnnouncementCreate(AnnouncementBase):
    """Schema for creating an announcement (admin)."""
    pass


class AdminAnnouncementUpdate(BaseModel):
    """Schema for updating an announcement (admin)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    priority: Optional[AnnouncementPriority] = None
    target: Optional[AnnouncementTarget] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class AdminAnnouncementResponse(AnnouncementBase):
    """Response schema for admin announcement."""
    id: UUID
    admin_id: str
    admin_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AdminAnnouncementListItem(BaseModel):
    """List item for admin announcements."""
    id: str
    title: str
    content: str
    priority: str
    target: str
    admin_id: str
    admin_name: Optional[str] = None
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
