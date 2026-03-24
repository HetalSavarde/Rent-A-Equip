from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.fine import Fine
from app.models.rental import Rental


async def get_my_fines(
    db: AsyncSession,
    borrower_id: str
) -> list:
    result = await db.execute(
        select(Fine).where(Fine.borrower_id == borrower_id)
    )
    return result.scalars().all()


async def get_fine_by_id(
    db: AsyncSession,
    fine_id: str
) -> Fine:
    result = await db.execute(
        select(Fine).where(Fine.id == fine_id)
    )
    fine = result.scalar_one_or_none()

    if not fine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fine not found",
        )
    return fine


async def pay_fine(
    db: AsyncSession,
    fine_id: str,
    borrower_id: str
) -> Fine:
    fine = await get_fine_by_id(db, fine_id)

    if fine.borrower_id != borrower_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only pay your own fines",
        )

    if fine.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This fine has already been paid",
        )

    fine.status = "paid"
    db.add(fine)
    await db.flush()
    return fine


async def get_all_fines(db: AsyncSession) -> list:
    result = await db.execute(select(Fine))
    return result.scalars().all()


async def calculate_overdue_fines(db: AsyncSession) -> int:
    from datetime import date
    from app.models.listing import Listing

    # Find all active rentals past due date with no fine yet
    result = await db.execute(
        select(Rental).where(
            Rental.status == "active",
            Rental.due_date < date.today()
        )
    )
    overdue_rentals = result.scalars().all()

    fines_created = 0

    for rental in overdue_rentals:
        # Check fine doesn't already exist
        existing_fine = await db.execute(
            select(Fine).where(Fine.rental_id == rental.id)
        )
        if existing_fine.scalar_one_or_none():
            continue

        # Get listing for daily rate
        listing_result = await db.execute(
            select(Listing).where(Listing.id == rental.listing_id)
        )
        listing = listing_result.scalar_one_or_none()
        if not listing:
            continue

        days_overdue = (date.today() - rental.due_date).days
        amount = days_overdue * float(listing.daily_rate)

        fine = Fine(
            rental_id=rental.id,
            borrower_id=rental.borrower_id,
            amount=amount,
            days_overdue=days_overdue,
            status="unpaid",
        )

        rental.status = "overdue"
        db.add(fine)
        db.add(rental)
        fines_created += 1

    await db.flush()
    return fines_created