from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional


class FineOut(BaseModel):
    id: str
    rental_id: str
    listing_name: Optional[str] = None
    days_overdue: int
    amount: float
    status: str
    created_at: datetime

    @model_validator(mode='before')
    @classmethod
    def extract_related(cls, v):
        if not hasattr(v, '__dict__'):
            return v
        try:
            rental = v.__dict__.get('rental') or getattr(v, 'rental', None)
            if rental is not None:
                listing = rental.__dict__.get('listing')
                if listing is not None:
                    v.__dict__['listing_name'] = listing.name
        except Exception:
            pass
        return v

    class Config:
        from_attributes = True


class FineListResponse(BaseModel):
    fines: list[FineOut]