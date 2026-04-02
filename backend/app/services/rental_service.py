from datetime import date, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.rental import Rental
from app.models.listing import Listing
from app.models.fine import Fine
from app.schemas.rental import RentalRequest


async def create_rental_request(
    db: AsyncSession,
    data: RentalRequest,
    borrower_id: str
) -> Rental:
    listing_result = await db.execute(
        select(Listing).where(Listing.id == data.listing_id)
    )
    listing = listing_result.scalar_one_or_none()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    if listing.lister_id == borrower_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You cannot rent your own listing",
        )

    if listing.status != "active" or listing.is_paused:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing is not available for rental",
        )

    if listing.available_qty < data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available",
        )

    if data.due_date <= data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date must be after start date",
        )

    rental = Rental(
        listing_id=data.listing_id,
        borrower_id=borrower_id,
        lister_id=listing.lister_id,
        quantity=data.quantity,
        start_date=data.start_date,
        due_date=data.due_date,
        status="pending",
    )

    db.add(rental)
    await db.flush()

    result = await db.execute(
        select(Rental)
        .options(
            selectinload(Rental.listing),
            selectinload(Rental.borrower),
            selectinload(Rental.lister),
            selectinload(Rental.fine),
        )
        .where(Rental.id == rental.id)
    )
    return result.scalar_one()


async def get_rental_by_id(db: AsyncSession, rental_id: str) -> Rental:
    result = await db.execute(
        select(Rental)
        .options(
            selectinload(Rental.listing),
            selectinload(Rental.borrower),
            selectinload(Rental.lister),
            selectinload(Rental.fine),
        )
        .where(Rental.id == rental_id)
    )
    rental = result.scalar_one_or_none()

    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found",
        )
    return rental


async def accept_rental(
    db: AsyncSession,
    rental_id: str,
    lister_id: str
) -> Rental:
    rental = await get_rental_by_id(db, rental_id)

    if rental.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only accept requests on your own listings",
        )

    if rental.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending rentals can be accepted",
        )

    listing_result = await db.execute(
        select(Listing).where(Listing.id == rental.listing_id)
    )
    listing = listing_result.scalar_one_or_none()
    listing.available_qty -= rental.quantity

    rental.status = "active"
    db.add(rental)
    db.add(listing)
    await db.flush()

    return await get_rental_by_id(db, rental_id)


async def reject_rental(
    db: AsyncSession,
    rental_id: str,
    lister_id: str,
    reason: str | None = None
) -> Rental:
    rental = await get_rental_by_id(db, rental_id)

    if rental.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject requests on your own listings",
        )

    if rental.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending rentals can be rejected",
        )

    rental.status = "cancelled"
    rental.rejection_reason = reason
    db.add(rental)
    await db.flush()

    return await get_rental_by_id(db, rental_id)


async def cancel_rental(
    db: AsyncSession,
    rental_id: str,
    borrower_id: str
) -> Rental:
    rental = await get_rental_by_id(db, rental_id)

    if rental.borrower_id != borrower_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own rental requests",
        )

    if rental.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending rentals can be cancelled",
        )

    rental.status = "cancelled"
    db.add(rental)
    await db.flush()
    # ✅ removed the wrong 'await db.refresh(listing)' line

    return await get_rental_by_id(db, rental_id)


async def return_rental(
    db: AsyncSession,
    rental_id: str,
    lister_id: str        
) -> dict:
    rental = await get_rental_by_id(db, rental_id)

    # Lister marks return — not borrower
    if rental.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the lister can mark equipment as returned",
        )

    if rental.status not in ["active", "overdue"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active or overdue rentals can be returned",
        )

    today = date.today()
    rental.returned_date = today
    rental.status = "returned"

    listing_result = await db.execute(
        select(Listing).where(Listing.id == rental.listing_id)
    )
    listing = listing_result.scalar_one_or_none()
    listing.available_qty += rental.quantity

    fine_created = False
    fine_amount = None

    if today > rental.due_date:
        days_overdue = (today - rental.due_date).days
        amount = days_overdue * float(listing.daily_rate)

        fine = Fine(
            rental_id=rental.id,
            borrower_id=rental.borrower_id,
            amount=amount,
            days_overdue=days_overdue,
            status="unpaid",
        )
        db.add(fine)
        fine_created = True
        fine_amount = amount

    db.add(rental)
    db.add(listing)
    await db.flush()
    await db.refresh(listing)

    return {
        "id": rental.id,
        "status": rental.status,
        "returned_date": rental.returned_date,
        "fine_created": fine_created,
        "fine_amount": fine_amount,
    }


async def get_borrower_rentals(
    db: AsyncSession,
    borrower_id: str,
    status_filter: str | None = None
) -> list:
    query = (
        select(Rental)
        .options(
            selectinload(Rental.listing),
            selectinload(Rental.borrower),
            selectinload(Rental.lister),
            selectinload(Rental.fine),
        )
        .where(Rental.borrower_id == borrower_id)
    )
    if status_filter:
        query = query.where(Rental.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


async def get_lister_rentals(
    db: AsyncSession,
    lister_id: str,
    status_filter: str | None = None
) -> list:
    query = (
        select(Rental)
        .options(
            selectinload(Rental.listing),
            selectinload(Rental.borrower),
            selectinload(Rental.lister),
            selectinload(Rental.fine),
        )
        .where(Rental.lister_id == lister_id)
    )
    if status_filter:
        query = query.where(Rental.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()