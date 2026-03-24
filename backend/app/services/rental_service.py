from datetime import date, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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
    # Get the listing
    listing_result = await db.execute(
        select(Listing).where(Listing.id == data.listing_id)
    )
    listing = listing_result.scalar_one_or_none()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    # Block self-rental
    if listing.lister_id == borrower_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You cannot rent your own listing",
        )

    # Check listing is active and not paused
    if listing.status != "active" or listing.is_paused:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing is not available for rental",
        )

    # Check availability
    if listing.available_qty < data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available",
        )

    # Check dates
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
    return rental


async def get_rental_by_id(db: AsyncSession, rental_id: str) -> Rental:
    result = await db.execute(
        select(Rental).where(Rental.id == rental_id)
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

    # Decrement available quantity
    listing_result = await db.execute(
        select(Listing).where(Listing.id == rental.listing_id)
    )
    listing = listing_result.scalar_one_or_none()
    listing.available_qty -= rental.quantity

    rental.status = "active"
    db.add(rental)
    db.add(listing)
    await db.flush()
    return rental


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
    return rental


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
    return rental


async def return_rental(
    db: AsyncSession,
    rental_id: str,
    borrower_id: str
) -> dict:
    rental = await get_rental_by_id(db, rental_id)

    if rental.borrower_id != borrower_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only return your own rentals",
        )

    if rental.status not in ["active", "overdue"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active or overdue rentals can be returned",
        )

    today = date.today()
    rental.returned_date = today
    rental.status = "returned"

    # Increment available quantity back
    listing_result = await db.execute(
        select(Listing).where(Listing.id == rental.listing_id)
    )
    listing = listing_result.scalar_one_or_none()
    listing.available_qty += rental.quantity

    # Check if overdue and create fine
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
    query = select(Rental).where(Rental.borrower_id == borrower_id)
    if status_filter:
        query = query.where(Rental.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


async def get_lister_rentals(
    db: AsyncSession,
    lister_id: str,
    status_filter: str | None = None
) -> list:
    query = select(Rental).where(Rental.lister_id == lister_id)
    if status_filter:
        query = query.where(Rental.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()