"""Calendar API — events, attendees, crew board data."""

from datetime import datetime, date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from backend.core.deps import get_db
from backend.models.calendar import CalendarEvent, CalendarAttendee
from backend.models.core import Project, Employee
from backend.schemas.calendar import (
    CalendarEventOut, CalendarEventCreate, CalendarEventUpdate,
)

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("", response_model=list[CalendarEventOut])
def list_events(
    start: Optional[str] = Query(None, description="ISO date start range"),
    end: Optional[str] = Query(None, description="ISO date end range"),
    project_id: Optional[int] = None,
    event_type: Optional[str] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List calendar events with optional filters."""
    q = db.query(CalendarEvent).options(joinedload(CalendarEvent.attendees))

    if start:
        q = q.filter(CalendarEvent.start_datetime >= datetime.fromisoformat(start))
    if end:
        q = q.filter(CalendarEvent.start_datetime <= datetime.fromisoformat(end + "T23:59:59"))
    if project_id:
        q = q.filter(CalendarEvent.project_id == project_id)
    if event_type:
        q = q.filter(CalendarEvent.event_type == event_type)
    if employee_id:
        q = q.filter(
            CalendarEvent.attendees.any(CalendarAttendee.employee_id == employee_id)
            | (CalendarEvent.created_by == employee_id)
        )

    events = q.order_by(CalendarEvent.start_datetime).all()
    return [CalendarEventOut.model_validate(e) for e in events]


@router.get("/{event_id}", response_model=CalendarEventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a single calendar event."""
    event = (
        db.query(CalendarEvent)
        .options(joinedload(CalendarEvent.attendees))
        .filter(CalendarEvent.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(404, "Event not found")
    return CalendarEventOut.model_validate(event)


@router.post("", response_model=CalendarEventOut, status_code=201)
def create_event(payload: CalendarEventCreate, db: Session = Depends(get_db)):
    """Create a new calendar event."""
    event = CalendarEvent(
        title=payload.title,
        description=payload.description,
        event_type=payload.event_type,
        start_datetime=payload.start_datetime,
        end_datetime=payload.end_datetime,
        all_day=payload.all_day,
        project_id=payload.project_id,
        location=payload.location,
        created_by=payload.created_by,
        color=payload.color,
        is_recurring=payload.is_recurring,
        recurrence_rule=payload.recurrence_rule,
        reminder_minutes=payload.reminder_minutes,
        visibility=payload.visibility,
        source="manual",
    )
    for att in payload.attendees:
        event.attendees.append(
            CalendarAttendee(employee_id=att.employee_id, response=att.response)
        )
    db.add(event)
    db.commit()
    db.refresh(event)
    return CalendarEventOut.model_validate(event)


@router.patch("/{event_id}", response_model=CalendarEventOut)
def update_event(event_id: int, payload: CalendarEventUpdate, db: Session = Depends(get_db)):
    """Update an existing calendar event."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    if event.source and event.source != "manual":
        raise HTTPException(400, "Cannot edit auto-generated events")

    update_data = payload.model_dump(exclude_unset=True)
    attendees_data = update_data.pop("attendees", None)

    for field, value in update_data.items():
        setattr(event, field, value)

    if attendees_data is not None:
        # Replace attendees
        db.query(CalendarAttendee).filter(CalendarAttendee.event_id == event_id).delete()
        for att in attendees_data:
            event.attendees.append(
                CalendarAttendee(employee_id=att["employee_id"], response=att.get("response", "pending"))
            )

    db.commit()
    db.refresh(event)
    return CalendarEventOut.model_validate(event)


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete a calendar event."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    if event.source and event.source != "manual":
        raise HTTPException(400, "Cannot delete auto-generated events")
    db.delete(event)
    db.commit()


@router.get("/crew-board", response_model=list)
def crew_board(
    week: Optional[str] = Query(None, description="ISO date for week start (Monday)"),
    db: Session = Depends(get_db),
):
    """Get crew board data — who's where each day of the week."""
    if week:
        week_start = date.fromisoformat(week)
    else:
        today = date.today()
        week_start = today - __import__("datetime").timedelta(days=today.weekday())

    week_end = week_start + __import__("datetime").timedelta(days=6)

    employees = db.query(Employee).filter(Employee.is_active == True).order_by(Employee.first_name).all()
    events = (
        db.query(CalendarEvent)
        .filter(
            CalendarEvent.start_datetime >= datetime.combine(week_start, datetime.min.time()),
            CalendarEvent.start_datetime <= datetime.combine(week_end, datetime.max.time()),
        )
        .all()
    )

    result = []
    for emp in employees:
        days = {}
        for i in range(7):
            day = week_start + __import__("datetime").timedelta(days=i)
            day_events = [
                {
                    "id": e.id,
                    "title": e.title,
                    "event_type": e.event_type,
                    "project_id": e.project_id,
                    "color": e.color,
                }
                for e in events
                if e.start_datetime.date() == day
                and (
                    e.created_by == emp.id
                    or any(a.employee_id == emp.id for a in e.attendees)
                )
            ]
            days[day.isoformat()] = day_events

        result.append({
            "employee_id": emp.id,
            "name": f"{emp.first_name} {emp.last_name}",
            "role": emp.role,
            "days": days,
        })

    return result
