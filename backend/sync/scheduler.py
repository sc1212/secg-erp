from apscheduler.schedulers.background import BackgroundScheduler


scheduler = BackgroundScheduler(timezone="UTC")


def register_sync_jobs() -> None:
    """Register recurring integration sync jobs.

    Concrete sync functions are wired in follow-up slices.
    """
    scheduler.add_job(lambda: None, "interval", hours=4, id="qbo_vendors")
    scheduler.add_job(lambda: None, "interval", hours=2, id="qbo_bills")
    scheduler.add_job(lambda: None, "interval", hours=2, id="qbo_invoices")
    scheduler.add_job(lambda: None, "interval", hours=2, id="qbo_payments")

    scheduler.add_job(lambda: None, "cron", hour=0, id="gusto_employees")
    scheduler.add_job(lambda: None, "cron", hour=6, id="gusto_payroll")

    scheduler.add_job(lambda: None, "interval", hours=6, id="plaid_transactions")
    scheduler.add_job(lambda: None, "interval", hours=2, id="plaid_balance")

    scheduler.add_job(lambda: None, "cron", hour=5, id="weather")
    scheduler.add_job(lambda: None, "cron", hour=23, minute=59, id="daily_snapshot")
    scheduler.add_job(lambda: None, "cron", day_of_week="fri", hour=18, id="weekly_snapshot")


def start_scheduler() -> None:
    if not scheduler.running:
        register_sync_jobs()
        scheduler.start()
