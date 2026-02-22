from datetime import datetime, timezone
from typing import Callable

from sqlalchemy.orm import Session

from backend.models.extended import ExceptionItem, SystemEvent


def sync_with_error_handling(
    db: Session,
    *,
    tenant_id: int,
    integration_id: int | None,
    sync_name: str,
    sync_function: Callable[[], int],
) -> dict:
    """Run a sync function and normalize failure handling.

    sync_function should return number of processed records.
    """
    started_at = datetime.now(tz=timezone.utc)
    try:
        records_processed = sync_function()
        db.add(
            SystemEvent(
                tenant_id=tenant_id,
                event_type="integration.sync_succeeded",
                source_type="integration",
                source_id=integration_id or 0,
                payload=(
                    f'{{"sync_name":"{sync_name}","records_processed":{records_processed},'
                    f'"started_at":"{started_at.isoformat()}"}}'
                ),
                processed=False,
            )
        )
        db.commit()
        return {"status": "success", "records_processed": records_processed}
    except Exception as exc:  # noqa: BLE001 - centralized failure handling path
        db.add(
            ExceptionItem(
                tenant_id=tenant_id,
                exception_type="sync_failure",
                severity="critical",
                description=f"Sync failed for {sync_name}: {exc}",
                source_type="integration",
                source_id=integration_id,
                status="open",
            )
        )
        db.add(
            SystemEvent(
                tenant_id=tenant_id,
                event_type="integration.sync_failed",
                source_type="integration",
                source_id=integration_id or 0,
                payload=f'{{"sync_name":"{sync_name}","error":"{str(exc)}"}}',
                processed=False,
            )
        )
        db.commit()
        return {"status": "failed", "error": str(exc)}
