from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    rental_id: str
    target_type: str
    rating: int
    comment: Optional[str] = None


class ReviewOut(BaseModel):
    id: str
    rental_id: str
    reviewer_id: str
    reviewer_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    target_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    reviews: list[ReviewOut]
    avg_rating: Optional[float] = None
    total_reviews: int = 0