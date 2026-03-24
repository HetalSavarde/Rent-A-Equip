from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.user import User
from app.services.damage_service import (
    create_damage_report, get_all_damage_reports, resolve_damage_report
)

router = APIRouter()


class DamageReportCreate(BaseModel):
    rental_id: str
    description: str


class DamageReportOut(BaseModel):
    id: str
    rental_id: str
    description: str
    status: str

    class Config:
        from_attributes = True


@router.post("", response_model=DamageReportOut, status_code=201)
async def file_damage_report(
    data: DamageReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await create_damage_report(
        db, data.rental_id, data.description, current_user.id
    )


@router.get("/all", response_model=list[DamageReportOut])
async def all_damage_reports(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await get_all_damage_reports(db)


@router.patch("/{report_id}/resolve", response_model=DamageReportOut)
async def resolve_report(
    report_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    return await resolve_damage_report(db, report_id)