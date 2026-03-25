from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.models.rental import Rental
from app.schemas.rental import (
    RentalRequest, RentalOut, RentalBorrowingOut,
    RentalListingRequestOut, RentalRejectRequest,
    RentalReturnResponse,
)
from app.services.rental_service import (
    create_rental_request, accept_rental, reject_rental,
    cancel_rental, return_rental, get_borrower_rentals,
    get_lister_rentals, get_rental_by_id
)

router = APIRouter()


@router.post("", response_model=RentalOut, status_code=201)
async def request_rental(
    data: RentalRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_rental_request(db, data, current_user.id)


@router.get("/my/borrowing", response_model=list[RentalBorrowingOut])
async def my_borrowing_rentals(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_borrower_rentals(db, current_user.id, status)


@router.get("/my/listing-requests", response_model=list[RentalListingRequestOut])
async def my_listing_requests(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_lister_rentals(db, current_user.id, status)


@router.get("/all", response_model=list[RentalOut])
async def all_rentals(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Rental).options(
            selectinload(Rental.listing),
            selectinload(Rental.borrower),
            selectinload(Rental.lister),
            selectinload(Rental.fine),
        )
    )
    return result.scalars().all()


@router.get("/{rental_id}", response_model=RentalOut)
async def get_rental(
    rental_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_rental_by_id(db, rental_id)


@router.patch("/{rental_id}/accept", response_model=RentalOut)
async def accept_rental_request(
    rental_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await accept_rental(db, rental_id, current_user.id)


@router.patch("/{rental_id}/reject", response_model=RentalOut)
async def reject_rental_request(
    rental_id: str,
    data: RentalRejectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await reject_rental(db, rental_id, current_user.id, data.reason)


@router.patch("/{rental_id}/cancel", response_model=RentalOut)
async def cancel_rental_request(
    rental_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await cancel_rental(db, rental_id, current_user.id)


@router.patch("/{rental_id}/return", response_model=RentalReturnResponse)
async def return_rental_request(
    rental_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await return_rental(db, rental_id, current_user.id)