from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserPublicProfile


class ListingCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    available_qty: int
    daily_rate: float
    location: str
    image_url: Optional[str] = None


class ListingUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    available_qty: Optional[int] = None
    daily_rate: Optional[float] = None
    location: Optional[str] = None
    image_url: Optional[str] = None


class ListingOut(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    available_qty: int
    daily_rate: float
    location: str
    image_url: Optional[str] = None
    status: str
    is_paused: bool
    lister: Optional[UserPublicProfile] = None
    avg_rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ListingPause(BaseModel):
    paused: bool


class ListingListResponse(BaseModel):
    items: list[ListingOut]
    total: int
    page: int
    limit: int