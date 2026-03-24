from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.user import User
from app.models.listing import Listing
from app.models.review import Review
from app.schemas.user import UserUpdate


async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


async def update_user(
    db: AsyncSession,
    user: User,
    data: UserUpdate
) -> User:
    if data.name is not None:
        user.name = data.name.strip()
    if data.phone is not None:
        user.phone = data.phone.strip()

    db.add(user)
    await db.flush()
    return user


async def get_public_profile(db: AsyncSession, user_id: str) -> dict:
    user = await get_user_by_id(db, user_id)

    # Count listings
    listings_result = await db.execute(
        select(func.count(Listing.id)).where(
            Listing.lister_id == user_id,
            Listing.status == "active",
            Listing.is_paused == False
        )
    )
    listings_count = listings_result.scalar() or 0

    # Calculate average rating and total reviews
    reviews_result = await db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id)
        ).where(
            Review.reviewee_id == user_id,
            Review.target_type == "user"
        )
    )
    avg_rating, total_reviews = reviews_result.one()

    return {
        "id": user.id,
        "name": user.name,
        "avg_rating": round(float(avg_rating), 1) if avg_rating else None,
        "total_reviews": total_reviews or 0,
        "listings_count": listings_count,
    }