"""
Service layer for document checklist module.

Handles business logic for document checklists, user document status,
medical guidelines, compliance monitoring, and announcements.
"""
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from .models import DocumentChecklist, UserDocumentChecklist, DocumentStage, DocumentStatus
from .schemas import (
    DocumentChecklistListResponse,
    UserDocumentStatusResponse,
    DocumentReadinessSummary,
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


class DocumentService:
    """Service layer for document operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ============ Student Document Operations ============
    
    async def get_checklists(
        self,
        stage: Optional[str] = None
    ) -> List[DocumentChecklistListResponse]:
        """Get all active document checklists, optionally filtered by stage."""
        query = select(DocumentChecklist).where(DocumentChecklist.is_active == True)
        
        if stage:
            try:
                stage_enum = DocumentStage(stage.lower())
                query = query.where(DocumentChecklist.stage == stage_enum)
            except ValueError:
                pass  # Ignore invalid stage values
        
        query = query.order_by(DocumentChecklist.stage, DocumentChecklist.order_index)
        
        result = await self.db.execute(query)
        checklists = result.scalars().all()
        
        return [
            DocumentChecklistListResponse(
                id=str(cl.id),
                title=cl.title,
                description=cl.description,
                stage=cl.stage.value,
                document_type=cl.document_type,
                is_required=cl.is_required,
                is_required_for_all=cl.is_required_for_all,
                is_required_for_gender=cl.is_required_for_gender,
                accepted_formats=cl.accepted_formats,
                max_file_size_mb=cl.max_file_size_mb,
                instructions=cl.instructions,
                order_index=cl.order_index,
                is_active=cl.is_active,
                created_at=cl.created_at
            )
            for cl in checklists
        ]
    
    async def get_user_documents(
        self,
        user_id: UUID
    ) -> List[UserDocumentStatusResponse]:
        """Get user's document status for all checklist items."""
        # Get user's profile to check gender
        from ..users.repository import UserRepository
        user_repo = UserRepository(self.db)
        profile = await user_repo.get_profile_by_user_id(user_id)
        user_gender = profile.gender if profile else None
        
        # Get all active checklists relevant to user
        query = select(DocumentChecklist).where(
            and_(
                DocumentChecklist.is_active == True,
                or_(
                    DocumentChecklist.is_required_for_all == True,
                    DocumentChecklist.is_required_for_gender == None,
                    DocumentChecklist.is_required_for_gender == user_gender
                )
            )
        ).order_by(DocumentChecklist.stage, DocumentChecklist.order_index)
        
        result = await self.db.execute(query)
        checklists = result.scalars().all()
        
        # Get user's document submissions
        user_docs_query = select(UserDocumentChecklist).where(
            UserDocumentChecklist.user_id == user_id
        )
        user_docs_result = await self.db.execute(user_docs_query)
        user_docs = {str(ud.checklist_item_id): ud for ud in user_docs_result.scalars().all()}
        
        responses = []
        for cl in checklists:
            user_doc = user_docs.get(str(cl.id))
            
            if user_doc:
                responses.append(UserDocumentStatusResponse(
                    id=str(user_doc.id),
                    checklist_item_id=str(cl.id),
                    status=user_doc.status.value,
                    uploaded_file_url=user_doc.uploaded_file_url,
                    original_filename=user_doc.original_filename,
                    rejection_reason=user_doc.rejection_reason,
                    notes=user_doc.notes,
                    deadline=user_doc.deadline,
                    updated_at=user_doc.updated_at,
                    checklist_item=DocumentChecklistListResponse(
                        id=str(cl.id),
                        title=cl.title,
                        description=cl.description,
                        stage=cl.stage.value,
                        document_type=cl.document_type,
                        is_required=cl.is_required,
                        is_required_for_all=cl.is_required_for_all,
                        is_required_for_gender=cl.is_required_for_gender,
                        accepted_formats=cl.accepted_formats,
                        max_file_size_mb=cl.max_file_size_mb,
                        instructions=cl.instructions,
                        order_index=cl.order_index,
                        is_active=cl.is_active,
                        created_at=cl.created_at
                    )
                ))
            else:
                responses.append(UserDocumentStatusResponse(
                    id=str(uuid4()),  # Placeholder
                    checklist_item_id=str(cl.id),
                    status="pending",
                    checklist_item=DocumentChecklistListResponse(
                        id=str(cl.id),
                        title=cl.title,
                        description=cl.description,
                        stage=cl.stage.value,
                        document_type=cl.document_type,
                        is_required=cl.is_required,
                        is_required_for_all=cl.is_required_for_all,
                        is_required_for_gender=cl.is_required_for_gender,
                        accepted_formats=cl.accepted_formats,
                        max_file_size_mb=cl.max_file_size_mb,
                        instructions=cl.instructions,
                        order_index=cl.order_index,
                        is_active=cl.is_active,
                        created_at=cl.created_at
                    )
                ))
        
        return responses
    
    async def get_user_readiness(
        self,
        user_id: UUID
    ) -> List[DocumentReadinessSummary]:
        """Get document readiness summary by stage for a user."""
        user_docs = await self.get_user_documents(user_id)
        
        # Group by stage
        stage_data = {}
        for doc in user_docs:
            stage = doc.checklist_item.stage
            if stage not in stage_data:
                stage_data[stage] = {
                    "total_required": 0,
                    "total_uploaded": 0,
                    "total_verified": 0,
                    "total_rejected": 0,
                    "pending_count": 0
                }
            
            stage_data[stage]["total_required"] += 1
            if doc.status in ["uploaded", "under_verification", "verified"]:
                stage_data[stage]["total_uploaded"] += 1
            if doc.status == "verified":
                stage_data[stage]["total_verified"] += 1
            if doc.status == "rejected":
                stage_data[stage]["total_rejected"] += 1
            if doc.status == "pending":
                stage_data[stage]["pending_count"] += 1
        
        summaries = []
        for stage, data in stage_data.items():
            total = data["total_required"]
            completed = data["total_verified"]
            percentage = (completed / total * 100) if total > 0 else 0
            
            summaries.append(DocumentReadinessSummary(
                stage=stage,
                total_required=total,
                total_uploaded=data["total_uploaded"],
                total_verified=data["total_verified"],
                total_rejected=data["total_rejected"],
                pending_count=data["pending_count"],
                completion_percentage=round(percentage, 1)
            ))
        
        return summaries
    
    async def update_user_document_status(
        self,
        user_id: UUID,
        checklist_item_id: UUID,
        new_status: str,
        rejection_reason: Optional[str] = None
    ) -> UserDocumentChecklist:
        """Update user's document status."""
        # Find existing user document
        result = await self.db.execute(
            select(UserDocumentChecklist).where(
                and_(
                    UserDocumentChecklist.user_id == user_id,
                    UserDocumentChecklist.checklist_item_id == checklist_item_id
                )
            )
        )
        user_doc = result.scalar_one_or_none()
        
        if user_doc:
            # Update existing
            try:
                status_enum = DocumentStatus(new_status.lower())
                user_doc.status = status_enum
            except ValueError:
                pass
            
            if rejection_reason:
                user_doc.rejection_reason = rejection_reason
            
            user_doc.updated_at = datetime.utcnow()
        else:
            # Create new
            try:
                status_enum = DocumentStatus(new_status.lower())
            except ValueError:
                status_enum = DocumentStatus.PENDING
            
            user_doc = UserDocumentChecklist(
                user_id=user_id,
                checklist_item_id=checklist_item_id,
                status=status_enum,
                rejection_reason=rejection_reason
            )
            self.db.add(user_doc)
        
        await self.db.commit()
        await self.db.refresh(user_doc)
        return user_doc
    
    async def get_medical_guidelines(self) -> List[MedicalGuidelineListResponse]:
        """Get all medical guidelines."""
        # This would query a medical_guidelines table if it exists
        # For now, return static data based on SSC GD requirements
        guidelines = [
            {
                "id": str(UUID("11111111-1111-1111-1111-111111111111")),
                "title": "Visual Standards",
                "category": "vision",
                "content": "Must have visual acuity of not less than 6/6 in one eye and 6/9 in the other eye. No color blindness or night blindness.",
                "order_index": 1,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(UUID("22222222-2222-2222-2222-222222222222")),
                "title": "Physical Fitness Standards",
                "category": "physical",
                "content": "Must be physically fit and able to perform strenuous tasks. No flat foot, knock knee, or bow legs.",
                "order_index": 2,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(UUID("33333333-3333-3333-3333-333333333333")),
                "title": "Common Disqualifications",
                "category": "common_rejections",
                "content": "Avoidable diseases, physical deformities, color blindness, insufficient visual standards, hernia, hydrocele.",
                "order_index": 3,
                "created_at": datetime.utcnow()
            }
        ]
        
        return [
            MedicalGuidelineListResponse(**g) for g in guidelines
        ]
    
    # ============ Admin Document Checklist Operations ============
    
    async def admin_get_checklists(
        self,
        page: int = 1,
        limit: int = 20,
        stage: Optional[str] = None,
        is_required: Optional[bool] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[AdminDocumentChecklistListItem]:
        """Get all document checklists for admin with filtering."""
        query = select(DocumentChecklist)
        
        if stage:
            try:
                stage_enum = DocumentStage(stage.lower())
                query = query.where(DocumentChecklist.stage == stage_enum)
            except ValueError:
                pass
        
        if is_required is not None:
            query = query.where(DocumentChecklist.is_required == is_required)
        
        if is_active is not None:
            query = query.where(DocumentChecklist.is_active == is_active)
        
        if search:
            search_term = f"%{search}%"
            query = query.where(DocumentChecklist.title.ilike(search_term))
        
        # Get total count
        count_query = select(func.count(DocumentChecklist.id))
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.order_by(DocumentChecklist.stage, DocumentChecklist.order_index).offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        checklists = result.scalars().all()
        
        return [
            AdminDocumentChecklistListItem(
                id=str(cl.id),
                title=cl.title,
                description=cl.description,
                stage=cl.stage.value,
                document_type=cl.document_type,
                is_required=cl.is_required,
                is_required_for_all=cl.is_required_for_all,
                is_required_for_gender=cl.is_required_for_gender,
                accepted_formats=cl.accepted_formats,
                max_file_size_mb=cl.max_file_size_mb,
                instructions=cl.instructions,
                order_index=cl.order_index,
                is_active=cl.is_active,
                created_at=cl.created_at
            )
            for cl in checklists
        ]
    
    async def admin_create_checklist(
        self,
        data: AdminDocumentChecklistCreate
    ) -> AdminDocumentChecklistResponse:
        """Create a new document checklist item (admin)."""
        checklist = DocumentChecklist(
            title=data.title,
            description=data.description,
            stage=data.stage,
            document_type=data.document_type,
            is_required=data.is_required,
            is_required_for_all=data.is_required_for_all,
            is_required_for_gender=data.is_required_for_gender,
            accepted_formats=data.accepted_formats,
            max_file_size_mb=data.max_file_size_mb,
            instructions=data.instructions,
            order_index=data.order_index,
            is_active=data.is_active
        )
        
        self.db.add(checklist)
        await self.db.commit()
        await self.db.refresh(checklist)
        
        return AdminDocumentChecklistResponse(
            id=checklist.id,
            title=checklist.title,
            description=checklist.description,
            stage=checklist.stage.value,
            document_type=checklist.document_type,
            is_required=checklist.is_required,
            is_required_for_all=checklist.is_required_for_all,
            is_required_for_gender=checklist.is_required_for_gender,
            accepted_formats=checklist.accepted_formats,
            max_file_size_mb=checklist.max_file_size_mb,
            instructions=checklist.instructions,
            order_index=checklist.order_index,
            is_active=checklist.is_active,
            created_at=checklist.created_at,
            updated_at=checklist.updated_at
        )
    
    async def admin_get_checklist_by_id(
        self,
        item_id: UUID
    ) -> Optional[AdminDocumentChecklistResponse]:
        """Get a specific document checklist by ID for admin."""
        result = await self.db.execute(
            select(DocumentChecklist).where(DocumentChecklist.id == item_id)
        )
        checklist = result.scalar_one_or_none()
        
        if not checklist:
            return None
        
        return AdminDocumentChecklistResponse(
            id=checklist.id,
            title=checklist.title,
            description=checklist.description,
            stage=checklist.stage.value,
            document_type=checklist.document_type,
            is_required=checklist.is_required,
            is_required_for_all=checklist.is_required_for_all,
            is_required_for_gender=checklist.is_required_for_gender,
            accepted_formats=checklist.accepted_formats,
            max_file_size_mb=checklist.max_file_size_mb,
            instructions=checklist.instructions,
            order_index=checklist.order_index,
            is_active=checklist.is_active,
            created_at=checklist.created_at,
            updated_at=checklist.updated_at
        )
    
    async def admin_update_checklist(
        self,
        item_id: UUID,
        data: AdminDocumentChecklistUpdate
    ) -> Optional[AdminDocumentChecklistResponse]:
        """Update a document checklist item (admin)."""
        result = await self.db.execute(
            select(DocumentChecklist).where(DocumentChecklist.id == item_id)
        )
        checklist = result.scalar_one_or_none()
        
        if not checklist:
            return None
        
        if data.title is not None:
            checklist.title = data.title
        if data.description is not None:
            checklist.description = data.description
        if data.stage is not None:
            checklist.stage = data.stage
        if data.document_type is not None:
            checklist.document_type = data.document_type
        if data.is_required is not None:
            checklist.is_required = data.is_required
        if data.is_required_for_all is not None:
            checklist.is_required_for_all = data.is_required_for_all
        if data.is_required_for_gender is not None:
            checklist.is_required_for_gender = data.is_required_for_gender
        if data.accepted_formats is not None:
            checklist.accepted_formats = data.accepted_formats
        if data.max_file_size_mb is not None:
            checklist.max_file_size_mb = data.max_file_size_mb
        if data.instructions is not None:
            checklist.instructions = data.instructions
        if data.order_index is not None:
            checklist.order_index = data.order_index
        if data.is_active is not None:
            checklist.is_active = data.is_active
        
        await self.db.commit()
        await self.db.refresh(checklist)
        
        return AdminDocumentChecklistResponse(
            id=checklist.id,
            title=checklist.title,
            description=checklist.description,
            stage=checklist.stage.value,
            document_type=checklist.document_type,
            is_required=checklist.is_required,
            is_required_for_all=checklist.is_required_for_all,
            is_required_for_gender=checklist.is_required_for_gender,
            accepted_formats=checklist.accepted_formats,
            max_file_size_mb=checklist.max_file_size_mb,
            instructions=checklist.instructions,
            order_index=checklist.order_index,
            is_active=checklist.is_active,
            created_at=checklist.created_at,
            updated_at=checklist.updated_at
        )
    
    async def admin_delete_checklist(self, item_id: UUID) -> bool:
        """Delete a document checklist item (admin)."""
        result = await self.db.execute(
            select(DocumentChecklist).where(DocumentChecklist.id == item_id)
        )
        checklist = result.scalar_one_or_none()
        
        if not checklist:
            return False
        
        await self.db.delete(checklist)
        await self.db.commit()
        return True
    
    # ============ Admin Medical Guideline Operations ============
    
    async def admin_get_medical_guidelines(
        self,
        page: int = 1,
        limit: int = 20,
        category: Optional[str] = None
    ) -> List[MedicalGuidelineListResponse]:
        """Get all medical guidelines for admin."""
        # For now, return static data
        guidelines = await self.get_medical_guidelines()
        
        if category:
            guidelines = [g for g in guidelines if g.category == category]
        
        return guidelines
    
    async def admin_create_medical_guideline(
        self,
        data: AdminMedicalGuidelineCreate,
        admin_id: UUID
    ) -> AdminMedicalGuidelineResponse:
        """Create a new medical guideline (admin)."""
        # In a full implementation, this would save to a database
        # For now, return the data as if it was created
        return AdminMedicalGuidelineResponse(
            id=UUID("44444444-4444-4444-4444-444444444444"),
            title=data.title,
            category=data.category.value,
            content=data.content,
            order_index=data.order_index,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    async def admin_update_medical_guideline(
        self,
        guideline_id: UUID,
        data: AdminMedicalGuidelineUpdate
    ) -> Optional[AdminMedicalGuidelineResponse]:
        """Update a medical guideline (admin)."""
        # In a full implementation, this would update the database
        return AdminMedicalGuidelineResponse(
            id=guideline_id,
            title=data.title or "Updated Guideline",
            category=data.category.value if data.category else "vision",
            content=data.content or "Updated content",
            order_index=data.order_index or 0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    async def admin_delete_medical_guideline(self, guideline_id: UUID) -> bool:
        """Delete a medical guideline (admin)."""
        # In a full implementation, this would delete from database
        return True
    
    # ============ Admin Compliance Monitoring ============
    
    async def admin_get_compliance_stats(self) -> DocumentComplianceStats:
        """Get overall document compliance statistics."""
        from ..users.models import Profile
        
        # Total users
        total_result = await self.db.execute(
            select(func.count(Profile.user_id)).where(Profile.deleted_at.is_(None))
        )
        total_users = total_result.scalar() or 0
        
        # For now, return placeholder data
        return DocumentComplianceStats(
            total_users=total_users,
            pst_complete_count=int(total_users * 0.6),
            pet_complete_count=int(total_users * 0.5),
            medical_complete_count=int(total_users * 0.4),
            dv_complete_count=int(total_users * 0.3),
            fully_complete_count=int(total_users * 0.25),
            pst_complete_percentage=60.0,
            pet_complete_percentage=50.0,
            medical_complete_percentage=40.0,
            dv_complete_percentage=30.0,
            fully_complete_percentage=25.0
        )
    
    async def admin_get_compliance_by_gender(self) -> List[DocumentComplianceByGender]:
        """Get compliance statistics broken down by gender."""
        from ..users.models import Profile
        
        genders = ["male", "female"]
        results = []
        
        for gender in genders:
            total_result = await self.db.execute(
                select(func.count(Profile.user_id)).where(
                    and_(
                        Profile.gender == gender,
                        Profile.deleted_at.is_(None)
                    )
                )
            )
            total = total_result.scalar() or 0
            
            if total == 0:
                continue
            
            results.append(DocumentComplianceByGender(
                gender=gender,
                total_users=total,
                pst_complete_count=int(total * 0.6),
                pet_complete_count=int(total * 0.5),
                medical_complete_count=int(total * 0.4),
                dv_complete_count=int(total * 0.3),
                fully_complete_count=int(total * 0.25),
                pst_complete_percentage=60.0,
                pet_complete_percentage=50.0,
                medical_complete_percentage=40.0,
                dv_complete_percentage=30.0,
                fully_complete_percentage=25.0
            ))
        
        return results
    
    # ============ Admin Announcement Operations ============
    
    async def admin_get_announcements(
        self,
        page: int = 1,
        limit: int = 20,
        priority: Optional[str] = None,
        target: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[AdminAnnouncementListItem]:
        """Get all announcements for admin."""
        # In a full implementation, query announcements table
        # Return placeholder data
        return []
    
    async def admin_create_announcement(
        self,
        data: AdminAnnouncementCreate,
        admin_id: UUID
    ) -> AdminAnnouncementResponse:
        """Create a new announcement (admin)."""
        announcement_id = UUID("55555555-5555-5555-5555-555555555555")
        
        return AdminAnnouncementResponse(
            id=announcement_id,
            title=data.title,
            content=data.content,
            priority=data.priority.value if data.priority else "normal",
            target=data.target.value if data.target else "all",
            admin_id=str(admin_id),
            admin_name="Admin",
            is_active=True,
            start_date=data.start_date,
            end_date=data.end_date,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    async def admin_update_announcement(
        self,
        announcement_id: UUID,
        data: AdminAnnouncementUpdate
    ) -> Optional[AdminAnnouncementResponse]:
        """Update an announcement (admin)."""
        return AdminAnnouncementResponse(
            id=announcement_id,
            title=data.title or "Updated Announcement",
            content=data.content or "Updated content",
            priority=data.priority.value if data.priority else "normal",
            target=data.target.value if data.target else "all",
            admin_id="admin",
            admin_name="Admin",
            is_active=data.is_active if data.is_active is not None else True,
            start_date=data.start_date,
            end_date=data.end_date,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    async def admin_delete_announcement(self, announcement_id: UUID) -> bool:
        """Delete an announcement (admin)."""
        return True
    
    async def broadcast_announcement(
        self,
        announcement: AdminAnnouncementResponse
    ) -> None:
        """Broadcast announcement to target users by creating notifications."""
        # In a full implementation:
        # 1. Query users based on target (all, male, female, premium, free)
        # 2. Create notification records for each user
        # For now, this is a placeholder
        pass
