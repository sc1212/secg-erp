"""Pydantic schemas for Safety & Compliance endpoints."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SafetyIncidentOut(OrmBase):
    id: int
    project_id: int
    incident_date: date
    incident_type: str
    description: str
    reported_by: Optional[int] = None
    involved_parties: Optional[str] = None
    root_cause: Optional[str] = None
    corrective_action: Optional[str] = None
    severity: Optional[str] = None
    osha_recordable: bool = False
    days_lost: int = 0
    status: str = "open"
    created_at: Optional[datetime] = None


class SafetyIncidentCreate(BaseModel):
    project_id: int
    incident_date: date
    incident_type: str
    description: str
    reported_by: Optional[int] = None
    involved_parties: Optional[str] = None
    severity: Optional[str] = None


class ToolboxTalkOut(OrmBase):
    id: int
    project_id: int
    topic: str
    conducted_by: Optional[int] = None
    conducted_date: date
    attendees: Optional[str] = None
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None


class ToolboxTalkCreate(BaseModel):
    project_id: int
    topic: str
    conducted_by: Optional[int] = None
    conducted_date: date
    attendees: Optional[str] = None
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None


class CertificationOut(OrmBase):
    id: int
    employee_id: int
    cert_type: str
    cert_number: Optional[str] = None
    issued_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: str = "active"


class CertificationCreate(BaseModel):
    employee_id: int
    cert_type: str
    cert_number: Optional[str] = None
    issued_date: Optional[date] = None
    expiry_date: Optional[date] = None
