from celery import shared_task
from celery_worker import celery_app


@celery_app.task(name="app.tasks.fine_tasks.calculate_overdue_fines_task")
def calculate_overdue_fines_task():
    import asyncio
    from app.core.database import AsyncSessionLocal
    from app.services.fine_service import calculate_overdue_fines

    async def run():
        async with AsyncSessionLocal() as db:
            try:
                fines_created = await calculate_overdue_fines(db)
                await db.commit()
                print(f"Fine check complete — {fines_created} fines created")
                return fines_created
            except Exception as e:
                await db.rollback()
                print(f"Fine check failed: {e}")
                raise

    return asyncio.run(run())