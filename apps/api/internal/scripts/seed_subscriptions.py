"""
Seed script for subscription plans and coupons.
Can be run standalone after the main seed.
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from apps.api.internal.database import AsyncSessionLocal, init_db
from apps.api.internal.seed import seed_subscription_plans, seed_coupons


async def main():
    """Seed subscription plans and coupons."""
    print("=" * 60)
    print("Seeding Subscription Plans and Coupons...")
    print("=" * 60)
    
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            plans_count = await seed_subscription_plans(db)
            coupons_count = await seed_coupons(db)
            
            print("\n" + "=" * 60)
            print("SEED SUMMARY")
            print("=" * 60)
            print(f"  Subscription Plans: {plans_count}")
            print(f"  Coupons: {coupons_count}")
            print("=" * 60)
            print("Seed completed successfully!")
            
        except Exception as e:
            print(f"Error during seed: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
