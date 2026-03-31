"""
Repository layer for physical training module.

Handles database operations for physical plans and progress logs.
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from .models import PhysicalPlan, PhysicalProgressLog


class PhysicalRepository:
    """Repository for physical training database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all_plans(
        self,
        target_gender: Optional[str] = None,
        plan_type: Optional[str] = None,
        active_only: bool = True
    ) -> List[PhysicalPlan]:
        """Get all physical plans with optional filters."""
        query = select(PhysicalPlan)
        
        if active_only:
            query = query.where(PhysicalPlan.is_active == True)
        
        if target_gender:
            query = query.where(
                (PhysicalPlan.target_gender == target_gender) |
                (PhysicalPlan.target_gender == "all")
            )
        
        if plan_type:
            query = query.where(PhysicalPlan.plan_type == plan_type)
        
        query = query.order_by(PhysicalPlan.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_plan_by_id(self, plan_id: UUID) -> Optional[PhysicalPlan]:
        """Get a physical plan by ID."""
        result = await self.db.execute(
            select(PhysicalPlan).where(PhysicalPlan.id == plan_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_progress_logs(
        self,
        user_id: UUID,
        activity_type: Optional[str] = None,
        days: Optional[int] = None
    ) -> List[PhysicalProgressLog]:
        """Get user's progress logs with optional filters."""
        query = (
            select(PhysicalProgressLog)
            .options(selectinload(PhysicalProgressLog.physical_plan))
            .where(PhysicalProgressLog.user_id == user_id)
        )
        
        if activity_type:
            query = query.where(PhysicalProgressLog.activity_type == activity_type)
        
        if days:
            from datetime import datetime, timedelta
            start_date = datetime.utcnow() - timedelta(days=days)
            query = query.where(PhysicalProgressLog.date >= start_date)
        
        query = query.order_by(PhysicalProgressLog.date.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create_progress_log(
        self,
        log: PhysicalProgressLog
    ) -> PhysicalProgressLog:
        """Create a new progress log."""
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log
    
    async def count_user_progress(
        self,
        user_id: UUID
    ) -> int:
        """Count total progress logs for a user."""
        result = await self.db.execute(
            select(func.count(PhysicalProgressLog.id))
            .where(
                and_(
                    PhysicalProgressLog.user_id == user_id,
                    PhysicalProgressLog.is_completed == True
                )
            )
        )
        return result.scalar() or 0
