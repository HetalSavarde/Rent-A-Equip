from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.fine import FineOut
from app.services.fine_service import (
    get_my_fines, pay_fine, get_all_fines, get_lister_fines
)

router = APIRouter()


@router.get("/my", response_model=list[FineOut])
async def my_fines_as_borrower(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_my_fines(db, current_user.id)


@router.get("/my/listing-fines", response_model=list[FineOut])
async def my_listing_fines(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_lister_fines(db, current_user.id)


@router.patch("/{fine_id}/pay", response_model=FineOut)
async def pay_my_fine(
    fine_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await pay_fine(db, fine_id, current_user.id)


@router.get("/all", response_model=list[FineOut])
async def all_fines(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await get_all_fines(db)