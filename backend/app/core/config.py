from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "Rent-A-Equip"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    SUPPORT_EMAIL: str = "support@rentaequip.com"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()