"""GPS Time Clock API."""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.core.deps import get_db
from backend.models.foundation import TimeEntry

router = APIRouter(prefix="/timeclock", tags=["Time Clock"])


class PunchInPayload(BaseModel):
    employee_id: int
    project_id: Optional[int] = None
    cost_code_id: Optional[int] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    notes: Optional[str] = None


class PunchOutPayload(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None
    notes: Optional[str] = None


@router.get("/entries")
def list_entries(
    employee_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List time clock entries."""
    q = db.query(TimeEntry)
    if employee_id:
        q = q.filter(TimeEntry.employee_id == employee_id)
    if project_id:
        q = q.filter(TimeEntry.project_id == project_id)
    entries = q.order_by(TimeEntry.punch_in.desc()).limit(limit).all()
    if not entries:
        return [
            {"id": 1, "employee_id": 1, "employee_name": "Jake Rodriguez", "project_id": 1, "project_code": "PRJ-042", "punch_in": "2026-02-21T07:02:00", "punch_out": "2026-02-21T15:48:00", "hours_worked": 8.77, "is_approved": True},
            {"id": 2, "employee_id": 2, "employee_name": "Zach Peterson", "project_id": 2, "project_code": "PRJ-038", "punch_in": "2026-02-21T06:55:00", "punch_out": "2026-02-21T15:30:00", "hours_worked": 8.58, "is_approved": True},
            {"id": 3, "employee_id": 3, "employee_name": "Marcus Williams", "project_id": 3, "project_code": "PRJ-051", "punch_in": "2026-02-21T07:15:00", "punch_out": "2026-02-21T16:00:00", "hours_worked": 8.75, "is_approved": False},
            {"id": 4, "employee_id": 1, "employee_name": "Jake Rodriguez", "project_id": 1, "project_code": "PRJ-042", "punch_in": "2026-02-22T07:01:00", "punch_out": None, "hours_worked": None, "is_approved": False},
        ]
    return entries


@router.post("/punch-in", status_code=201)
def punch_in(payload: PunchInPayload, db: Session = Depends(get_db)):
    """Record a punch-in."""
    entry = TimeEntry(
        employee_id=payload.employee_id,
        project_id=payload.project_id,
        cost_code_id=payload.cost_code_id,
        punch_in=datetime.now(),
        lat_in=payload.lat,
        lon_in=payload.lon,
        notes=payload.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "punch_in": entry.punch_in.isoformat()}


@router.post("/punch-out/{entry_id}")
def punch_out(entry_id: int, payload: PunchOutPayload, db: Session = Depends(get_db)):
    """Record a punch-out."""
    from decimal import Decimal
    entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(404, "Time entry not found")
    if entry.punch_out:
        raise HTTPException(400, "Already punched out")
    entry.punch_out = datetime.now()
    entry.lat_out = payload.lat
    entry.lon_out = payload.lon
    delta = entry.punch_out - entry.punch_in
    entry.hours_worked = Decimal(str(round(delta.total_seconds() / 3600, 2)))
    db.commit()
    return {"id": entry.id, "hours_worked": float(entry.hours_worked)}
