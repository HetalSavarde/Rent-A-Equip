from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut, ReviewListResponse
from app.services.review_service import (
    create_review, get_listing_reviews, get_user_reviews
)

router = APIRouter()


@router.post("", response_model=ReviewOut, status_code=201)
async def post_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_review(db, data, current_user.id)


@router.get("/listing/{listing_id}", response_model=ReviewListResponse)
async def listing_reviews(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_listing_reviews(db, listing_id)


@router.get("/user/{user_id}", response_model=ReviewListResponse)
async def user_reviews(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_user_reviews(db, user_id)