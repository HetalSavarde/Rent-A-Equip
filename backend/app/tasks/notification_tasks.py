from celery_worker import celery_app


@celery_app.task(name="app.tasks.notification_tasks.notify_lister_new_request")
def notify_lister_new_request(lister_email: str, listing_name: str, borrower_name: str):
    print(f"NOTIFY: {lister_email} — new request on {listing_name} from {borrower_name}")


@celery_app.task(name="app.tasks.notification_tasks.notify_borrower_accepted")
def notify_borrower_accepted(borrower_email: str, listing_name: str):
    print(f"NOTIFY: {borrower_email} — your request for {listing_name} was accepted")


@celery_app.task(name="app.tasks.notification_tasks.notify_borrower_rejected")
def notify_borrower_rejected(borrower_email: str, listing_name: str, reason: str):
    print(f"NOTIFY: {borrower_email} — your request for {listing_name} was rejected. Reason: {reason}")