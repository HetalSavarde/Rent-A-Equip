from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FineOut(BaseModel):
    id: str
    rental_id: str
    listing_name: Optional[str] = None
    amount: float
    days_overdue: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class FineListResponse(BaseModel):
    fines: list[FineOut]