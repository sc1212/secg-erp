"""Daily Field Log API — CRUD, submit, review, feed."""

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.core.deps import get_db
from backend.models.daily_log import DailyLog, DailyLogCrewEntry, DailyLogPhoto
from backend.models.core import Project, Employee
from backend.schemas.daily_log import (
    DailyLogOut, DailyLogListOut, DailyLogCreate, DailyLogUpdate, DailyLogFeedItem,
)

router = APIRouter(prefix="/daily-logs", tags=["Daily Logs"])


def _build_list_item(log: DailyLog) -> dict:
    """Build a DailyLogListOut dict with computed counts."""
    return {
        **{c.key: getattr(log, c.key) for c in log.__table__.columns},
        "photo_count": len(log.photos) if log.photos else 0,
        "crew_count": len(log.crew_entries) if log.crew_entries else 0,
    }


@router.get("/feed", response_model=list[DailyLogFeedItem])
def daily_log_feed(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
):
    """Recent logs across all projects — for Matt's dashboard overview."""
    cutoff = date.today() - __import__("datetime").timedelta(days=days)
    logs = (
        db.query(DailyLog)
        .options(joinedload(DailyLog.photos))
        .filter(DailyLog.log_date >= cutoff)
        .order_by(DailyLog.log_date.desc(), DailyLog.created_at.desc())
        .limit(50)
        .all()
    )

    # Batch load project and employee names
    project_ids = {l.project_id for l in logs}
    author_ids = {l.author_id for l in logs}
    projects = {p.id: p for p in db.query(Project).filter(Project.id.in_(project_ids)).all()} if project_ids else {}
    employees = {e.id: e for e in db.query(Employee).filter(Employee.id.in_(author_ids)).all()} if author_ids else {}

    result = []
    for log in logs:
        proj = projects.get(log.project_id)
        author = employees.get(log.author_id)
        result.append(DailyLogFeedItem(
            id=log.id,
            project_id=log.project_id,
            project_code=proj.code if proj else None,
            project_name=proj.name if proj else None,
            log_date=log.log_date,
            author_id=log.author_id,
            author_name=f"{author.first_name} {author.last_name}" if author else None,
            work_performed=log.work_performed,
            status=log.status or "draft",
            submitted_at=log.submitted_at,
            photo_count=len(log.photos) if log.photos else 0,
        ))
    return result


@router.get("/today-status")
def today_status(db: Session = Depends(get_db)):
    """Which projects have submitted today's logs and which haven't."""
    today = date.today()

    # Get all active projects
    active_projects = (
        db.query(Project)
        .filter(Project.status.in_(["active", "pre_construction"]))
        .order_by(Project.code)
        .all()
    )

    # Get today's logs
    todays_logs = (
        db.query(DailyLog)
        .options(joinedload(DailyLog.photos))
        .filter(DailyLog.log_date == today)
        .all()
    )
    logs_by_project = {l.project_id: l for l in todays_logs}

    # Get employee names
    author_ids = {l.author_id for l in todays_logs}
    employees = {e.id: e for e in db.query(Employee).filter(Employee.id.in_(author_ids)).all()} if author_ids else {}

    result = []
    for proj in active_projects:
        log = logs_by_project.get(proj.id)
        author = employees.get(log.author_id) if log else None
        result.append({
            "project_id": proj.id,
            "project_code": proj.code,
            "project_name": proj.name,
            "has_log": log is not None,
            "log_id": log.id if log else None,
            "status": log.status if log else None,
            "author_name": f"{author.first_name} {author.last_name}" if author else None,
            "submitted_at": log.submitted_at.isoformat() if log and log.submitted_at else None,
            "work_performed": log.work_performed if log else None,
            "photo_count": len(log.photos) if log and log.photos else 0,
        })

    submitted = sum(1 for r in result if r["has_log"])
    return {
        "date": today.isoformat(),
        "total_projects": len(result),
        "submitted_count": submitted,
        "projects": result,
    }


@router.get("/project/{project_id}", response_model=list[DailyLogListOut])
def list_project_logs(
    project_id: int,
    start: Optional[str] = None,
    end: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List daily logs for a specific project."""
    q = (
        db.query(DailyLog)
        .options(joinedload(DailyLog.photos), joinedload(DailyLog.crew_entries))
        .filter(DailyLog.project_id == project_id)
    )
    if start:
        q = q.filter(DailyLog.log_date >= date.fromisoformat(start))
    if end:
        q = q.filter(DailyLog.log_date <= date.fromisoformat(end))

    logs = q.order_by(DailyLog.log_date.desc()).all()
    return [DailyLogListOut(**_build_list_item(l)) for l in logs]


@router.get("/{log_id}", response_model=DailyLogOut)
def get_daily_log(log_id: int, db: Session = Depends(get_db)):
    """Get a single daily log with crew and photos."""
    log = (
        db.query(DailyLog)
        .options(joinedload(DailyLog.crew_entries), joinedload(DailyLog.photos))
        .filter(DailyLog.id == log_id)
        .first()
    )
    if not log:
        raise HTTPException(404, "Daily log not found")
    return DailyLogOut.model_validate(log)


@router.post("", response_model=DailyLogOut, status_code=201)
def create_daily_log(payload: DailyLogCreate, db: Session = Depends(get_db)):
    """Create a new daily log — auto-populates weather if available."""
    # Check for duplicate
    existing = (
        db.query(DailyLog)
        .filter(
            DailyLog.project_id == payload.project_id,
            DailyLog.log_date == payload.log_date,
        )
        .first()
    )
    if existing:
        raise HTTPException(409, f"A daily log already exists for this project on {payload.log_date}")

    log = DailyLog(
        project_id=payload.project_id,
        log_date=payload.log_date,
        author_id=payload.author_id,
        weather_summary=payload.weather_summary,
        temp_high=payload.temp_high,
        temp_low=payload.temp_low,
        conditions=payload.conditions,
        work_performed=payload.work_performed,
        delays_issues=payload.delays_issues,
        delay_severity=payload.delay_severity,
        visitors=payload.visitors,
        safety_notes=payload.safety_notes,
        material_deliveries=payload.material_deliveries,
        equipment_on_site=payload.equipment_on_site,
        status="draft",
    )

    for crew in payload.crew_entries:
        log.crew_entries.append(DailyLogCrewEntry(
            entity_type=crew.entity_type,
            entity_id=crew.entity_id,
            entity_name=crew.entity_name,
            headcount=crew.headcount,
            hours=crew.hours,
            trade=crew.trade,
        ))

    db.add(log)
    db.commit()
    db.refresh(log)
    return DailyLogOut.model_validate(log)


@router.patch("/{log_id}", response_model=DailyLogOut)
def update_daily_log(log_id: int, payload: DailyLogUpdate, db: Session = Depends(get_db)):
    """Update a draft daily log."""
    log = (
        db.query(DailyLog)
        .options(joinedload(DailyLog.crew_entries), joinedload(DailyLog.photos))
        .filter(DailyLog.id == log_id)
        .first()
    )
    if not log:
        raise HTTPException(404, "Daily log not found")
    if log.status != "draft":
        raise HTTPException(400, "Cannot edit a submitted or reviewed log")

    update_data = payload.model_dump(exclude_unset=True)
    crew_data = update_data.pop("crew_entries", None)

    for field, value in update_data.items():
        setattr(log, field, value)

    if crew_data is not None:
        db.query(DailyLogCrewEntry).filter(DailyLogCrewEntry.daily_log_id == log_id).delete()
        for crew in crew_data:
            log.crew_entries.append(DailyLogCrewEntry(**crew))

    db.commit()
    db.refresh(log)
    return DailyLogOut.model_validate(log)


@router.post("/{log_id}/submit", response_model=DailyLogOut)
def submit_daily_log(log_id: int, db: Session = Depends(get_db)):
    """Submit a daily log — locks editing."""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(404, "Daily log not found")
    if log.status != "draft":
        raise HTTPException(400, "Log is already submitted")

    log.status = "submitted"
    log.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(log)
    return DailyLogOut.model_validate(log)


@router.post("/{log_id}/review", response_model=DailyLogOut)
def review_daily_log(
    log_id: int,
    reviewer_id: int = Query(..., description="Employee ID of reviewer"),
    db: Session = Depends(get_db),
):
    """Mark a submitted log as reviewed."""
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(404, "Daily log not found")
    if log.status != "submitted":
        raise HTTPException(400, "Log must be submitted before review")

    log.status = "reviewed"
    log.reviewed_by = reviewer_id
    log.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(log)
    return DailyLogOut.model_validate(log)
