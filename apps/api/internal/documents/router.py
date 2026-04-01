"""
API router for document checklist module.

Provides endpoints for:
- GET /api/v1/documents/checklists - List document checklists
- GET /api/v1/documents/me - Get user's document status
- PUT /api/v1/documents/checklists/{itemId}/status - Update document status
- GET /api/v1/documents/medical/guidelines - Get medical guidelines
- Admin: CRUD for document checklists, medical guidelines, compliance monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from ..database import get_db
from ..auth.dependencies import get_current_user, TokenData, require_admin
from .schemas import (
    DocumentChecklistListResponse,
    UserDocumentStatusResponse,
    DocumentReadinessSummary,
    UserDocumentsResponse,
    MedicalGuidelineListResponse,
    AdminDocumentChecklistCreate,
    AdminDocumentChecklistUpdate,
    AdminDocumentChecklistResponse,
    AdminDocumentChecklistListItem,
    AdminMedicalGuidelineCreate,
    AdminMedicalGuidelineUpdate,
    AdminMedicalGuidelineResponse,
    DocumentComplianceStats,
    DocumentComplianceByGender,
    AdminAnnouncementCreate,
    AdminAnnouncementUpdate,
    AdminAnnouncementResponse,
    AdminAnnouncementListItem,
    AnnouncementPriority,
    AnnouncementTarget,
)
from .service import DocumentService

router = APIRouter(tags=["Documents"])


# ============ Student Document Endpoints ============

@router.get("/documents/checklists", response_model=List[DocumentChecklistListResponse])
async def get_document_checklists(
    stage: Optional[str] = Query(None, description="Filter by stage (pst, pet, medical, document_verification)"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all document checklists, optionally filtered by stage."""
    service = DocumentService(db)
    return await service.get_checklists(stage=stage)


@router.get("/documents/me", response_model=UserDocumentsResponse)
async def get_my_documents(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's document status for all items."""
    service = DocumentService(db)
    user_id = UUID(current_user.user_id)
    documents = await service.get_user_documents(user_id)
    readiness_summary = await service.get_user_readiness(user_id)
    return UserDocumentsResponse(
        documents=documents,
        readiness_summary=readiness_summary,
    )


@router.get("/documents/readiness", response_model=List[DocumentReadinessSummary])
async def get_document_readiness(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get document readiness summary by stage."""
    service = DocumentService(db)
    return await service.get_user_readiness(UUID(current_user.user_id))


@router.put("/documents/checklists/{item_id}/status")
async def update_document_status(
    item_id: str,
    status: str = Query(..., description="New status (pending, uploaded, under_verification, verified, rejected)"),
    rejection_reason: Optional[str] = Query(None, description="Reason if rejected"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update document status (admin or user for their own documents)."""
    service = DocumentService(db)
    
    try:
        item_uuid = UUID(item_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    return await service.update_user_document_status(
        user_id=UUID(current_user.user_id),
        checklist_item_id=item_uuid,
        new_status=status,
        rejection_reason=rejection_reason
    )


# ============ Medical Guidelines Endpoints ============

@router.get("/documents/medical/guidelines", response_model=List[MedicalGuidelineListResponse])
async def get_medical_guidelines(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all medical guidelines."""
    service = DocumentService(db)
    return await service.get_medical_guidelines()


# ============ Admin Document Checklist Management ============

@router.get("/admin/documents/checklists", response_model=List[AdminDocumentChecklistListItem])
async def admin_list_document_checklists(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    stage: Optional[str] = Query(None, description="Filter by stage"),
    is_required: Optional[bool] = Query(None, description="Filter by required status"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by title"),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all document checklists for admin management."""
    service = DocumentService(db)
    return await service.admin_get_checklists(
        page=page,
        limit=limit,
        stage=stage,
        is_required=is_required,
        is_active=is_active,
        search=search
    )


@router.post("/admin/documents/checklists", response_model=AdminDocumentChecklistResponse)
async def admin_create_document_checklist(
    data: AdminDocumentChecklistCreate,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new document checklist item (admin only)."""
    service = DocumentService(db)
    return await service.admin_create_checklist(data)


@router.get("/admin/documents/checklists/{item_id}", response_model=AdminDocumentChecklistResponse)
async def admin_get_document_checklist(
    item_id: str,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific document checklist item for admin."""
    service = DocumentService(db)
    
    try:
        item_uuid = UUID(item_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    item = await service.admin_get_checklist_by_id(item_uuid)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document checklist item not found"
        )
    
    return item


@router.put("/admin/documents/checklists/{item_id}", response_model=AdminDocumentChecklistResponse)
async def admin_update_document_checklist(
    item_id: str,
    data: AdminDocumentChecklistUpdate,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a document checklist item (admin only)."""
    service = DocumentService(db)
    
    try:
        item_uuid = UUID(item_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    item = await service.admin_update_checklist(item_uuid, data)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document checklist item not found"
        )
    
    return item


@router.delete("/admin/documents/checklists/{item_id}")
async def admin_delete_document_checklist(
    item_id: str,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document checklist item (admin only)."""
    service = DocumentService(db)
    
    try:
        item_uuid = UUID(item_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    success = await service.admin_delete_checklist(item_uuid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document checklist item not found"
        )
    
    return {"message": "Document checklist item deleted successfully"}


# ============ Admin Medical Guidelines Management ============

@router.get("/admin/documents/medical/guidelines", response_model=List[MedicalGuidelineListResponse])
async def admin_list_medical_guidelines(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all medical guidelines for admin."""
    service = DocumentService(db)
    return await service.admin_get_medical_guidelines(page=page, limit=limit, category=category)


@router.post("/admin/documents/medical/guidelines", response_model=AdminMedicalGuidelineResponse)
async def admin_create_medical_guideline(
    data: AdminMedicalGuidelineCreate,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new medical guideline (admin only)."""
    service = DocumentService(db)
    return await service.admin_create_medical_guideline(data, UUID(current_user.user_id))


@router.put("/admin/documents/medical/guidelines/{guideline_id}", response_model=AdminMedicalGuidelineResponse)
async def admin_update_medical_guideline(
    guideline_id: str,
    data: AdminMedicalGuidelineUpdate,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a medical guideline (admin only)."""
    service = DocumentService(db)
    
    try:
        guideline_uuid = UUID(guideline_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid guideline ID format"
        )
    
    guideline = await service.admin_update_medical_guideline(guideline_uuid, data)
    if not guideline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical guideline not found"
        )
    
    return guideline


@router.delete("/admin/documents/medical/guidelines/{guideline_id}")
async def admin_delete_medical_guideline(
    guideline_id: str,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a medical guideline (admin only)."""
    service = DocumentService(db)
    
    try:
        guideline_uuid = UUID(guideline_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid guideline ID format"
        )
    
    success = await service.admin_delete_medical_guideline(guideline_uuid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical guideline not found"
        )
    
    return {"message": "Medical guideline deleted successfully"}


# ============ Admin Compliance Monitoring ============

@router.get("/admin/documents/compliance", response_model=DocumentComplianceStats)
async def admin_get_document_compliance(
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get document compliance statistics for all users (admin only)."""
    service = DocumentService(db)
    return await service.admin_get_compliance_stats()


@router.get("/admin/documents/compliance/by-gender", response_model=List[DocumentComplianceByGender])
async def admin_get_document_compliance_by_gender(
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get document compliance statistics broken down by gender (admin only)."""
    service = DocumentService(db)
    return await service.admin_get_compliance_by_gender()


# ============ Admin Announcement Management ============

@router.get("/admin/announcements", response_model=List[AdminAnnouncementListItem])
async def admin_list_announcements(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    target: Optional[str] = Query(None, description="Filter by target audience"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all announcements for admin."""
    service = DocumentService(db)
    return await service.admin_get_announcements(
        page=page,
        limit=limit,
        priority=priority,
        target=target,
        is_active=is_active
    )


@router.post("/admin/announcements", response_model=AdminAnnouncementResponse)
async def admin_create_announcement(
    data: AdminAnnouncementCreate,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new announcement (admin only)."""
    service = DocumentService(db)
    announcement = await service.admin_create_announcement(data, UUID(current_user.user_id))
    
    # Create notifications for target users
    await service.broadcast_announcement(announcement)
    
    return announcement


@router.put("/admin/announcements/{announcement_id}", response_model=AdminAnnouncementResponse)
async def admin_update_announcement(
    announcement_id: str,
    data: AdminAnnouncementUpdate,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update an announcement (admin only)."""
    service = DocumentService(db)
    
    try:
        announcement_uuid = UUID(announcement_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid announcement ID format"
        )
    
    announcement = await service.admin_update_announcement(announcement_uuid, data)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return announcement


@router.delete("/admin/announcements/{announcement_id}")
async def admin_delete_announcement(
    announcement_id: str,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete an announcement (admin only)."""
    service = DocumentService(db)
    
    try:
        announcement_uuid = UUID(announcement_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid announcement ID format"
        )
    
    success = await service.admin_delete_announcement(announcement_uuid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return {"message": "Announcement deleted successfully"}
