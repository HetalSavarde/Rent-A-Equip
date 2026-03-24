import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Rental(Base):
    __tablename__ = "rentals"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    listing_id: Mapped[str] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    borrower_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lister_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    returned_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )
    rejection_reason: Mapped[str | None] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    listing = relationship("Listing", back_populates="rentals")
    borrower = relationship("User", foreign_keys=[borrower_id], back_populates="rentals_as_borrower")
    lister = relationship("User", foreign_keys=[lister_id], back_populates="rentals_as_lister")
    fine = relationship("Fine", back_populates="rental", uselist=False)
    damage_reports = relationship("DamageReport", back_populates="rental")
    reviews = relationship("Review", back_populates="rental")