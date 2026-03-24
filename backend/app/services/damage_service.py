from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.damage_report import DamageReport
from app.models.rental import Rental


async def create_damage_report(
    db: AsyncSession,
    rental_id: str,
    description: str,
    reported_by: str
) -> DamageReport:
    # Check rental exists
    rental_result = await db.execute(
        select(Rental).where(Rental.id == rental_id)
    )
    rental = rental_result.scalar_one_or_none()

    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found",
        )

    # Only lister can file damage report
    if rental.lister_id != reported_by:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the lister can file a damage report",
        )

    # Can only report damage on returned rentals
    if rental.status != "returned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only file a damage report on returned rentals",
        )

    # Check report doesn't already exist for this rental
    existing_result = await db.execute(
        select(DamageReport).where(
            DamageReport.rental_id == rental_id
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A damage report already exists for this rental",
        )

    report = DamageReport(
        rental_id=rental_id,
        reported_by=reported_by,
        description=description,
        status="pending",
    )

    db.add(report)
    await db.flush()
    return report


async def get_all_damage_reports(db: AsyncSession) -> list:
    result = await db.execute(select(DamageReport))
    return result.scalars().all()


async def get_damage_report_by_id(
    db: AsyncSession,
    report_id: str
) -> DamageReport:
    result = await db.execute(
        select(DamageReport).where(DamageReport.id == report_id)
    )
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Damage report not found",
        )
    return report


async def resolve_damage_report(
    db: AsyncSession,
    report_id: str
) -> DamageReport:
    report = await get_damage_report_by_id(db, report_id)

    if report.status == "resolved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This damage report is already resolved",
        )

    report.status = "resolved"
    db.add(report)
    await db.flush()
    return report