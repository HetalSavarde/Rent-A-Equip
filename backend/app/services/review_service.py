from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.review import Review
from app.models.rental import Rental
from app.models.listing import Listing
from app.schemas.review import ReviewCreate


async def create_review(
    db: AsyncSession,
    data: ReviewCreate,
    reviewer_id: str
) -> Review:
    # Check rental exists
    rental_result = await db.execute(
        select(Rental).where(Rental.id == data.rental_id)
    )
    rental = rental_result.scalar_one_or_none()

    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found",
        )

    # Can only review returned rentals
    if rental.status != "returned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review after rental is returned",
        )

    # Validate reviewer is part of this rental
    if reviewer_id not in [rental.borrower_id, rental.lister_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not part of this rental",
        )

    # Validate target_type
    if data.target_type not in ["listing", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_type must be listing or user",
        )

    # Validate rating
    if not 1 <= data.rating <= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5",
        )

    # Check not already reviewed
    existing_result = await db.execute(
        select(Review).where(
            Review.rental_id == data.rental_id,
            Review.reviewer_id == reviewer_id,
            Review.target_type == data.target_type,
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this rental",
        )

    # Set reviewee and listing based on target_type
    if data.target_type == "listing":
        reviewee_id = rental.lister_id
        listing_id = rental.listing_id
    else:
        reviewee_id = rental.borrower_id
        listing_id = None

    review = Review(
        rental_id=data.rental_id,
        reviewer_id=reviewer_id,
        reviewee_id=reviewee_id,
        listing_id=listing_id,
        target_type=data.target_type,
        rating=data.rating,
        comment=data.comment,
    )

    db.add(review)
    await db.flush()
    return review


async def get_listing_reviews(
    db: AsyncSession,
    listing_id: str
) -> dict:
    result = await db.execute(
        select(Review).where(
            Review.listing_id == listing_id,
            Review.target_type == "listing"
        )
    )
    reviews = result.scalars().all()

    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(
            Review.listing_id == listing_id,
            Review.target_type == "listing"
        )
    )
    avg_rating = avg_result.scalar()

    return {
        "reviews": reviews,
        "avg_rating": round(float(avg_rating), 1) if avg_rating else None,
        "total_reviews": len(reviews),
    }


async def get_user_reviews(
    db: AsyncSession,
    user_id: str
) -> dict:
    result = await db.execute(
        select(Review).where(
            Review.reviewee_id == user_id,
            Review.target_type == "user"
        )
    )
    reviews = result.scalars().all()

    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(
            Review.reviewee_id == user_id,
            Review.target_type == "user"
        )
    )
    avg_rating = avg_result.scalar()

    return {
        "reviews": reviews,
        "avg_rating": round(float(avg_rating), 1) if avg_rating else None,
        "total_reviews": len(reviews),
    }