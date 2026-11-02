from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.fine import Fine
from app.models.rental import Rental


async def get_my_fines(
    db: AsyncSession,
    borrower_id: str
) -> list:
    result = await db.execute(
        select(Fine)
        .options(
            selectinload(Fine.rental).selectinload(Rental.listing),  # ✅ nested load
            selectinload(Fine.borrower),
        )
        .where(Fine.borrower_id == borrower_id)
    )
    return result.scalars().all()


async def get_fine_by_id(
    db: AsyncSession,
    fine_id: str
) -> Fine:
    result = await db.execute(
        select(Fine)
        .options(
            selectinload(Fine.rental),
            selectinload(Fine.borrower),
        )
        .where(Fine.id == fine_id)
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
    lister_id: str
) -> Fine:
    fine = await get_fine_by_id(db, fine_id)

    # Get the rental to verify the lister
    rental_result = await db.execute(
        select(Rental).where(Rental.id == fine.rental_id)
    )
    rental = rental_result.scalar_one_or_none()

    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated rental not found",
        )

    # Only lister can confirm fine is paid
    if rental.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the lister can mark a fine as paid",
        )

    if fine.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This fine has already been paid",
        )

    fine.status = "paid"
    db.add(fine)
    await db.flush()
    return await get_fine_by_id(db, fine_id)


async def get_lister_fines(
    db: AsyncSession,
    lister_id: str
) -> list:
    result = await db.execute(
        select(Fine)
        .options(
            selectinload(Fine.rental),
            selectinload(Fine.borrower),
        )
        .join(Rental, Fine.rental_id == Rental.id)
        .where(Rental.lister_id == lister_id)
    )
    return result.scalars().all()


async def get_all_fines(db: AsyncSession) -> list:
    result = await db.execute(
        select(Fine)
        .options(
            selectinload(Fine.rental),
            selectinload(Fine.borrower),
        )
    )
    return result.scalars().all()


async def calculate_overdue_fines(db: AsyncSession) -> int:
    from datetime import date
    from app.models.listing import Listing

    result = await db.execute(
        select(Rental)
        .options(
            selectinload(Rental.listing),
            selectinload(Rental.borrower),
            selectinload(Rental.lister),
            selectinload(Rental.fine),
        )
        .where(
            Rental.status == "active",
            Rental.due_date < date.today()
        )
    )
    overdue_rentals = result.scalars().all()

    fines_created = 0

    for rental in overdue_rentals:
        existing_fine = await db.execute(
            select(Fine).where(Fine.rental_id == rental.id)
        )
        if existing_fine.scalar_one_or_none():
            continue

        listing_result = await db.execute(
            select(Listing).where(Listing.id == rental.listing_id)
        )
        listing = listing_result.scalar_one_or_none()
        if not listing:
            continue

        days_overdue = (date.today() - rental.due_date).days
        amount = days_overdue * float(listing.daily_rate) * rental.quantity

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