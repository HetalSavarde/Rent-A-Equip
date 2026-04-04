from pydantic import BaseModel, model_validator
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

    @model_validator(mode='before')
    @classmethod
    def extract_related(cls, v):
        if not hasattr(v, '__dict__'):
            return v
        try:
            reviewer = v.__dict__.get('reviewer') or getattr(v, 'reviewer', None)
            if reviewer is not None:
                v.__dict__['reviewer_name'] = reviewer.name
        except Exception:
            pass
        return v

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    reviews: list[ReviewOut]
    avg_rating: Optional[float] = None
    total_reviews: int = 0