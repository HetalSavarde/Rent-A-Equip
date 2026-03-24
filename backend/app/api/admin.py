from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.models.listing import Listing
from app.models.rental import Rental
from app.models.fine import Fine
from app.models.damage_report import DamageReport
from app.schemas.user import UserOut
from app.services.listing_service import get_listing_by_id
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class RoleUpdate(BaseModel):
    role: str


class SuspendUpdate(BaseModel):
    suspended: bool


@router.get("/dashboard")
async def dashboard(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = await db.execute(select(func.count(User.id)))
    total_listings = await db.execute(select(func.count(Listing.id)))
    active_rentals = await db.execute(
        select(func.count(Rental.id)).where(Rental.status == "active")
    )
    overdue_rentals = await db.execute(
        select(func.count(Rental.id)).where(Rental.status == "overdue")
    )
    unpaid_fines = await db.execute(
        select(func.sum(Fine.amount)).where(Fine.status == "unpaid")
    )
    pending_damage = await db.execute(
        select(func.count(DamageReport.id)).where(DamageReport.status == "pending")
    )

    return {
        "total_users": total_users.scalar() or 0,
        "total_listings": total_listings.scalar() or 0,
        "active_rentals": active_rentals.scalar() or 0,
        "overdue_rentals": overdue_rentals.scalar() or 0,
        "total_fines_unpaid": float(unpaid_fines.scalar() or 0),
        "damage_reports_pending": pending_damage.scalar() or 0,
    }


@router.get("/users", response_model=list[UserOut])
async def all_users(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
async def change_user_role(
    user_id: str,
    data: RoleUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if data.role not in ["user", "admin"]:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be user or admin")
    user.role = data.role
    db.add(user)
    return user


@router.patch("/users/{user_id}/suspend", response_model=UserOut)
async def suspend_user(
    user_id: str,
    data: SuspendUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_suspended = data.suspended
    db.add(user)
    return user


@router.get("/listings", response_model=list)
async def admin_all_listings(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Listing))
    return result.scalars().all()


@router.delete("/listings/{listing_id}", status_code=204)
async def admin_delete_listing(
    listing_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    listing = await get_listing_by_id(db, listing_id)
    await db.delete(listing)


from app.services.fine_service import calculate_overdue_fines

@router.post("/run-fine-check")
async def manual_fine_check(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    fines_created = await calculate_overdue_fines(db)
    return {
        "message": "Fine check completed",
        "fines_created": fines_created
    }