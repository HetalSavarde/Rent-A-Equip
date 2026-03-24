from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserLogin, TokenResponse
from app.services.auth_service import register_user, login_user

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=201)
async def register(
    data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await register_user(db, data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    return await login_user(db, data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.core.security import create_access_token
    access_token = create_access_token(
        data={"sub": current_user.id, "role": current_user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": current_user.role,
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    return {"message": "Successfully logged out"}