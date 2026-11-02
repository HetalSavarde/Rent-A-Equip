from pydantic import BaseModel, model_validator
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


class FineOut(BaseModel):
    id: str
    amount: float
    days_overdue: int
    status: str

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
    fine: Optional[FineOut] = None  # ✅ was Optional[dict]

    @model_validator(mode='before')
    @classmethod
    def extract_related(cls, v):
        if hasattr(v, 'listing') and v.listing:
            v.__dict__['listing_name'] = v.listing.name
        if hasattr(v, 'lister') and v.lister:
            v.__dict__['lister_name'] = v.lister.name
        return v

    class Config:
        from_attributes = True


class FineInfo(BaseModel):
    id: str
    amount: float
    status: str

    class Config:
        from_attributes = True

class RentalListingRequestOut(BaseModel):
    id: str
    listing_name: Optional[str] = None
    borrower_name: Optional[str] = None
    borrower_id: str
    borrower_phone: Optional[str] = None
    quantity: int
    start_date: date
    due_date: date
    status: str
    rejection_reason: Optional[str] = None
    fine: Optional[FineInfo] = None  # ✅ add this

    @model_validator(mode='before')
    @classmethod
    def extract_related(cls, v):
        if hasattr(v, 'borrower') and v.borrower:
            v.__dict__['borrower_name'] = v.borrower.name
            v.__dict__['borrower_phone'] = v.borrower.phone
        if hasattr(v, 'listing') and v.listing:
            v.__dict__['listing_name'] = v.listing.name
        if hasattr(v, 'fine') and v.fine:
            v.__dict__['fine'] = v.fine
        return v

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