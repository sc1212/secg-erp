from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import Employee, Project
from backend.models.extended import CalendarEvent, DailyLog, SystemEvent

router = APIRouter(prefix="/operations", tags=["Operations"])


class CalendarEventIn(BaseModel):
    title: str
    event_type: str
    start_datetime: datetime
    end_datetime: datetime | None = None
    all_day: bool = False
    project_id: int | None = None
    location: str | None = None
    description: str | None = None


class DailyLogIn(BaseModel):
    log_date: date
    author_id: int
    work_performed: str | None = None
    delays_issues: str | None = None
    visitors: str | None = None
    safety_notes: str | None = None
    material_deliveries: str | None = None
    equipment_on_site: str | None = None


def _resolve_tenant_id(x_tenant_id: int | None) -> int:
    return x_tenant_id or 1


def _publish_event(
    db: Session,
    *,
    tenant_id: int,
    event_type: str,
    source_type: str,
    source_id: int,
    payload: str | None = None,
) -> None:
    db.add(
        SystemEvent(
            tenant_id=tenant_id,
            event_type=event_type,
            source_type=source_type,
            source_id=source_id,
            payload=payload,
            processed=False,
        )
    )


@router.get("/calendar")
def calendar_events(
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(CalendarEvent)
    if start:
        q = q.filter(CalendarEvent.start_datetime >= datetime.combine(start, datetime.min.time()))
    if end:
        q = q.filter(CalendarEvent.start_datetime <= datetime.combine(end, datetime.max.time()))

    rows = q.order_by(CalendarEvent.start_datetime.asc()).all()
    return {
        "items": [
            {
                "id": r.id,
                "title": r.title,
                "event_type": r.event_type,
                "start_datetime": r.start_datetime,
                "end_datetime": r.end_datetime,
                "all_day": r.all_day,
                "project_id": r.project_id,
                "location": r.location,
                "description": r.description,
            }
            for r in rows
        ]
    }


@router.post("/calendar")
def create_calendar_event(
    payload: CalendarEventIn,
    db: Session = Depends(get_db),
    x_tenant_id: int | None = Header(default=None),
):
    created_by = db.query(Employee).filter(Employee.is_active.is_(True)).first()
    if not created_by:
        raise HTTPException(status_code=400, detail="No active employee found to attribute event")

    tenant_id = _resolve_tenant_id(x_tenant_id)
    row = CalendarEvent(
        tenant_id=tenant_id,
        title=payload.title,
        event_type=payload.event_type,
        start_datetime=payload.start_datetime,
        end_datetime=payload.end_datetime,
        all_day=payload.all_day,
        project_id=payload.project_id,
        location=payload.location,
        description=payload.description,
        created_by=created_by.id,
    )
    db.add(row)
    db.flush()
    _publish_event(
        db,
        tenant_id=tenant_id,
        event_type="calendar.event.created",
        source_type="calendar_event",
        source_id=row.id,
    )
    db.commit()
    db.refresh(row)
    return {"id": row.id, "title": row.title}


@router.get("/projects/{project_id}/daily-logs")
def project_daily_logs(
    project_id: int,
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(DailyLog).filter(DailyLog.project_id == project_id)
    if start:
        q = q.filter(DailyLog.log_date >= start)
    if end:
        q = q.filter(DailyLog.log_date <= end)
    rows = q.order_by(DailyLog.log_date.desc()).all()
    return {"items": _logs(rows)}


@router.get("/daily-logs/feed")
def daily_log_feed(days: int = Query(default=7, ge=1, le=31), db: Session = Depends(get_db)):
    cutoff = date.fromordinal(date.today().toordinal() - days + 1)
    rows = db.query(DailyLog).filter(DailyLog.log_date >= cutoff).order_by(DailyLog.log_date.desc()).all()
    return {"items": _logs(rows)}


@router.get("/daily-logs/{log_id}")
def get_daily_log(log_id: int, db: Session = Depends(get_db)):
    row = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Daily log not found")
    return _log(row)


@router.post("/projects/{project_id}/daily-logs")
def create_daily_log(
    project_id: int,
    payload: DailyLogIn,
    db: Session = Depends(get_db),
    x_tenant_id: int | None = Header(default=None),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    author = db.query(Employee).filter(Employee.id == payload.author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author employee not found")

    tenant_id = _resolve_tenant_id(x_tenant_id)
    row = DailyLog(
        tenant_id=tenant_id,
        project_id=project_id,
        log_date=payload.log_date,
        author_id=payload.author_id,
        weather_summary="Auto weather snapshot pending integration",
        work_performed=payload.work_performed,
        delays_issues=payload.delays_issues,
        visitors=payload.visitors,
        safety_notes=payload.safety_notes,
        material_deliveries=payload.material_deliveries,
        equipment_on_site=payload.equipment_on_site,
        status="draft",
    )
    db.add(row)
    db.flush()
    _publish_event(
        db,
        tenant_id=tenant_id,
        event_type="daily_log.created",
        source_type="daily_log",
        source_id=row.id,
    )
    db.commit()
    db.refresh(row)
    return _log(row)


@router.patch("/daily-logs/{log_id}")
def update_daily_log(log_id: int, payload: DailyLogIn, db: Session = Depends(get_db)):
    row = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Daily log not found")
    if row.status == "submitted":
        raise HTTPException(status_code=400, detail="Submitted logs are locked")

    for f in [
        "log_date",
        "author_id",
        "work_performed",
        "delays_issues",
        "visitors",
        "safety_notes",
        "material_deliveries",
        "equipment_on_site",
    ]:
        setattr(row, f, getattr(payload, f))

    db.commit()
    db.refresh(row)
    return _log(row)


@router.post("/daily-logs/{log_id}/submit")
def submit_daily_log(log_id: int, db: Session = Depends(get_db)):
    row = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Daily log not found")
    row.status = "submitted"
    row.submitted_at = datetime.now(tz=timezone.utc)
    _publish_event(
        db,
        tenant_id=row.tenant_id,
        event_type="daily_log.submitted",
        source_type="daily_log",
        source_id=row.id,
    )
    db.commit()
    db.refresh(row)
    return _log(row)


def _log(row: DailyLog):
    return {
        "id": row.id,
        "project_id": row.project_id,
        "log_date": row.log_date,
        "author_id": row.author_id,
        "weather_summary": row.weather_summary,
        "work_performed": row.work_performed,
        "delays_issues": row.delays_issues,
        "visitors": row.visitors,
        "safety_notes": row.safety_notes,
        "material_deliveries": row.material_deliveries,
        "equipment_on_site": row.equipment_on_site,
        "status": row.status,
        "submitted_at": row.submitted_at,
    }


def _logs(rows: list[DailyLog]):
    return [_log(r) for r in rows]
