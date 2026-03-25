from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.listing import Listing
from app.models.rental import Rental
from app.models.review import Review
from app.schemas.listing import ListingCreate, ListingUpdate


async def create_listing(
    db: AsyncSession,
    data: ListingCreate,
    lister_id: str
) -> Listing:
    listing = Listing(
        lister_id=lister_id,
        name=data.name.strip(),
        category=data.category.lower().strip(),
        description=data.description,
        available_qty=data.available_qty,
        daily_rate=data.daily_rate,
        location=data.location.strip(),
        image_url=data.image_url,
        status="active",
        is_paused=False,
    )
    db.add(listing)
    await db.flush()
    await db.refresh(listing)
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.lister))
        .where(Listing.id == listing.id)
    )
    return result.scalar_one()


async def get_listing_by_id(db: AsyncSession, listing_id: str) -> Listing:
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.lister))
        .where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    return listing


async def get_all_listings(
    db: AsyncSession,
    category: str | None = None,
    available: bool | None = None,
    location: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> dict:
    query = select(Listing).options(selectinload(Listing.lister)).where(
        Listing.status == "active",
        Listing.is_paused == False,
    )

    if category:
        query = query.where(Listing.category == category.lower().strip())
    if available:
        query = query.where(Listing.available_qty > 0)
    if location:
        query = query.where(Listing.location.ilike(f"%{location}%"))
    if search:
        query = query.where(Listing.name.ilike(f"%{search}%"))

    count_result = await db.execute(
        select(func.count()).select_from(
            select(Listing).where(
                Listing.status == "active",
                Listing.is_paused == False,
            ).subquery()
        )
    )
    total = count_result.scalar() or 0

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    listings = result.scalars().all()

    return {
        "items": listings,
        "total": total,
        "page": page,
        "limit": limit,
    }


async def get_my_listings(db: AsyncSession, lister_id: str) -> list:
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.lister))
        .where(Listing.lister_id == lister_id)
    )
    return result.scalars().all()


async def update_listing(
    db: AsyncSession,
    listing_id: str,
    data: ListingUpdate,
    lister_id: str
) -> Listing:
    listing = await get_listing_by_id(db, listing_id)

    if listing.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own listings",
        )

    active_rentals = await db.execute(
        select(Rental).where(
            Rental.listing_id == listing_id,
            Rental.status.in_(["pending", "active"])
        )
    )
    if active_rentals.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot edit a listing with pending or active rentals",
        )

    if data.name is not None:
        listing.name = data.name.strip()
    if data.category is not None:
        listing.category = data.category.lower().strip()
    if data.description is not None:
        listing.description = data.description
    if data.available_qty is not None:
        listing.available_qty = data.available_qty
    if data.daily_rate is not None:
        listing.daily_rate = data.daily_rate
    if data.location is not None:
        listing.location = data.location.strip()
    if data.image_url is not None:
        listing.image_url = data.image_url

    db.add(listing)
    await db.flush()
    return await get_listing_by_id(db, listing_id)


async def pause_listing(
    db: AsyncSession,
    listing_id: str,
    paused: bool,
    lister_id: str
) -> Listing:
    listing = await get_listing_by_id(db, listing_id)

    if listing.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only pause your own listings",
        )

    listing.is_paused = paused
    db.add(listing)
    await db.flush()
    return await get_listing_by_id(db, listing_id)


async def delete_listing(
    db: AsyncSession,
    listing_id: str,
    lister_id: str
) -> None:
    listing = await get_listing_by_id(db, listing_id)

    if listing.lister_id != lister_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own listings",
        )

    active_result = await db.execute(
        select(Rental).where(
            Rental.listing_id == listing_id,
            Rental.status.in_(["pending", "active"])
        )
    )
    if active_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a listing with pending or active rentals",
        )

    await db.delete(listing)
    await db.flush()


async def get_listing_avg_rating(
    db: AsyncSession,
    listing_id: str
) -> dict:
    result = await db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id)
        ).where(
            Review.listing_id == listing_id,
            Review.target_type == "listing"
        )
    )
    avg_rating, total_reviews = result.one()

    return {
        "avg_rating": round(float(avg_rating), 1) if avg_rating else None,
        "total_reviews": total_reviews or 0,
    }