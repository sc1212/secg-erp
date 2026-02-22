"""Safety & Compliance API — incidents, toolbox talks, certifications."""

from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.safety import SafetyIncident, ToolboxTalk, Certification
from backend.models.core import Employee
from backend.schemas.safety import (
    SafetyIncidentOut, SafetyIncidentCreate,
    ToolboxTalkOut, ToolboxTalkCreate,
    CertificationOut, CertificationCreate,
)

router = APIRouter(prefix="/safety", tags=["Safety"])


@router.get("/dashboard")
def safety_dashboard(db: Session = Depends(get_db)):
    """Safety overview — days since last incident, totals, cert status."""
    last_incident = (
        db.query(SafetyIncident)
        .filter(SafetyIncident.incident_type != "near_miss")
        .order_by(SafetyIncident.incident_date.desc())
        .first()
    )
    days_since = (date.today() - last_incident.incident_date).days if last_incident else 365

    open_incidents = db.query(func.count(SafetyIncident.id)).filter(SafetyIncident.status.in_(["open", "investigating"])).scalar() or 0
    total_incidents_ytd = db.query(func.count(SafetyIncident.id)).filter(SafetyIncident.incident_date >= date(date.today().year, 1, 1)).scalar() or 0
    talks_this_month = db.query(func.count(ToolboxTalk.id)).filter(ToolboxTalk.conducted_date >= date.today().replace(day=1)).scalar() or 0

    expiring_certs = db.query(func.count(Certification.id)).filter(
        Certification.expiry_date != None,
        Certification.expiry_date <= date.today() + timedelta(days=30),
        Certification.status == "active",
    ).scalar() or 0

    return {
        "days_since_incident": days_since,
        "open_incidents": open_incidents,
        "total_incidents_ytd": total_incidents_ytd,
        "toolbox_talks_this_month": talks_this_month,
        "expiring_certifications": expiring_certs,
    }


@router.get("/incidents", response_model=list[SafetyIncidentOut])
def list_incidents(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(SafetyIncident)
    if project_id:
        q = q.filter(SafetyIncident.project_id == project_id)
    if status:
        q = q.filter(SafetyIncident.status == status)
    return [SafetyIncidentOut.model_validate(i) for i in q.order_by(SafetyIncident.incident_date.desc()).limit(100).all()]


@router.post("/incidents", response_model=SafetyIncidentOut, status_code=201)
def create_incident(payload: SafetyIncidentCreate, db: Session = Depends(get_db)):
    incident = SafetyIncident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return SafetyIncidentOut.model_validate(incident)


@router.patch("/incidents/{incident_id}", response_model=SafetyIncidentOut)
def update_incident(incident_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    incident = db.query(SafetyIncident).filter(SafetyIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(404, "Incident not found")
    incident.status = status
    db.commit()
    db.refresh(incident)
    return SafetyIncidentOut.model_validate(incident)


@router.get("/toolbox-talks", response_model=list[ToolboxTalkOut])
def list_toolbox_talks(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(ToolboxTalk)
    if project_id:
        q = q.filter(ToolboxTalk.project_id == project_id)
    return [ToolboxTalkOut.model_validate(t) for t in q.order_by(ToolboxTalk.conducted_date.desc()).limit(50).all()]


@router.post("/toolbox-talks", response_model=ToolboxTalkOut, status_code=201)
def create_toolbox_talk(payload: ToolboxTalkCreate, db: Session = Depends(get_db)):
    talk = ToolboxTalk(**payload.model_dump())
    db.add(talk)
    db.commit()
    db.refresh(talk)
    return ToolboxTalkOut.model_validate(talk)


@router.get("/certifications", response_model=list[CertificationOut])
def list_certifications(
    employee_id: Optional[int] = None,
    expiring_days: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Certification)
    if employee_id:
        q = q.filter(Certification.employee_id == employee_id)
    if expiring_days:
        q = q.filter(
            Certification.expiry_date != None,
            Certification.expiry_date <= date.today() + timedelta(days=expiring_days),
        )
    return [CertificationOut.model_validate(c) for c in q.order_by(Certification.expiry_date).all()]


@router.post("/certifications", response_model=CertificationOut, status_code=201)
def create_certification(payload: CertificationCreate, db: Session = Depends(get_db)):
    cert = Certification(**payload.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return CertificationOut.model_validate(cert)
