from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.listing import (
    ListingCreate, ListingOut, ListingUpdate,
    ListingPause, ListingListResponse
)
from app.services.listing_service import (
    create_listing, get_listing_by_id, get_all_listings,
    get_my_listings, update_listing, pause_listing,
    delete_listing, get_listing_avg_rating
)

router = APIRouter()


@router.get("", response_model=ListingListResponse)
async def browse_listings(
    category: Optional[str] = Query(None),
    available: Optional[bool] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_all_listings(db, category, available, location, search, page, limit)


@router.get("/my", response_model=list[ListingOut])
async def my_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_my_listings(db, current_user.id)


@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    listing = await get_listing_by_id(db, listing_id)
    rating_data = await get_listing_avg_rating(db, listing_id)
    listing.avg_rating = rating_data["avg_rating"]
    listing.total_reviews = rating_data["total_reviews"]
    return listing


@router.post("", response_model=ListingOut, status_code=201)
async def create_new_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_listing(db, data, current_user.id)


@router.put("/{listing_id}", response_model=ListingOut)
async def update_my_listing(
    listing_id: str,
    data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await update_listing(db, listing_id, data, current_user.id)


@router.patch("/{listing_id}/pause", response_model=ListingOut)
async def pause_my_listing(
    listing_id: str,
    data: ListingPause,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await pause_listing(db, listing_id, data.paused, current_user.id)


@router.delete("/{listing_id}", status_code=204)
async def delete_my_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await delete_listing(db, listing_id, current_user.id)


@router.get("/admin/all", response_model=list[ListingOut])
async def admin_all_listings(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await get_my_listings(db, current_user.id)


@router.delete("/admin/{listing_id}", status_code=204)
async def admin_delete_listing(
    listing_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    from app.services.listing_service import get_listing_by_id
    listing = await get_listing_by_id(db, listing_id)
    await db.delete(listing)