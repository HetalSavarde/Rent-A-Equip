from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class RentalRequest(BaseModel):
    listing_id: str
    quantity: int
    start_date: date
    due_date: date


class RentalOut(BaseModel):
    id: str
    listing_id: str
    listing_name: Optional[str] = None
    borrower_id: str
    borrower_name: Optional[str] = None
    lister_id: str
    lister_name: Optional[str] = None
    quantity: int
    start_date: date
    due_date: date
    returned_date: Optional[date] = None
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RentalBorrowingOut(BaseModel):
    id: str
    listing_name: Optional[str] = None
    lister_name: Optional[str] = None
    quantity: int
    start_date: date
    due_date: date
    returned_date: Optional[date] = None
    status: str
    fine: Optional[dict] = None

    class Config:
        from_attributes = True


class RentalListingRequestOut(BaseModel):
    id: str
    listing_name: Optional[str] = None
    borrower_name: Optional[str] = None
    borrower_id: str
    quantity: int
    start_date: date
    due_date: date
    status: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class RentalRejectRequest(BaseModel):
    reason: Optional[str] = None


class RentalReturnResponse(BaseModel):
    id: str
    status: str
    returned_date: date
    fine_created: bool
    fine_amount: Optional[float] = None


class RentalListResponse(BaseModel):
    rentals: list[RentalOut]