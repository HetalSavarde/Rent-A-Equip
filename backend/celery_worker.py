from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "rent_a_equip",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.fine_tasks", "app.tasks.notification_tasks"]
)

celery_app.conf.timezone = "Asia/Kolkata"

celery_app.conf.beat_schedule = {
    "calculate-overdue-fines-daily": {
        "task": "app.tasks.fine_tasks.calculate_overdue_fines_task",
        "schedule": crontab(hour=0, minute=0),
    },
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
)