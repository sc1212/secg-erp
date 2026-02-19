"""Team API — employees, payroll calendar, crew allocation, lien waivers.

GET  /api/team/employees          → employee roster
GET  /api/team/payroll-calendar   → upcoming payroll dates
GET  /api/team/crew-allocation    → weekly crew deployment matrix
GET  /api/team/lien-waivers       → lien waiver tracker
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import Employee, Project, Vendor
from backend.models.extended import (
    CrewAllocation, LienWaiver, PayrollCalendar,
)
from backend.schemas import (
    CrewAllocationOut, EmployeeOut, LienWaiverOut,
)

router = APIRouter(prefix="/team", tags=["Team & HR"])


@router.get("/employees", response_model=List[EmployeeOut])
def list_employees(
    active_only: bool = True,
    db: Session = Depends(get_db),
):
    """Employee roster."""
    q = db.query(Employee)
    if active_only:
        q = q.filter(Employee.is_active == True)
    employees = q.order_by(Employee.last_name, Employee.first_name).all()
    return [EmployeeOut.model_validate(e) for e in employees]


@router.get("/payroll-calendar")
def get_payroll_calendar(
    upcoming_only: bool = True,
    db: Session = Depends(get_db),
):
    """Payroll calendar with pay dates and estimated costs."""
    from datetime import date
    q = db.query(PayrollCalendar)
    if upcoming_only:
        q = q.filter(PayrollCalendar.pay_date >= date.today())
    entries = q.order_by(PayrollCalendar.pay_date).all()
    return [
        {
            "id": e.id,
            "pay_date": str(e.pay_date) if e.pay_date else None,
            "status": e.status,
            "notes": e.notes,
        }
        for e in entries
    ]


@router.get("/crew-allocation")
def get_crew_allocation(
    week: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Crew allocation matrix — who is working where each week.

    Returns a matrix-style response: employees × weeks with project assignments.
    """
    q = db.query(CrewAllocation)
    if week:
        from datetime import date as d
        try:
            parsed = d.fromisoformat(week)
            q = q.filter(CrewAllocation.week_starting == parsed)
        except ValueError:
            pass

    allocs = q.order_by(
        CrewAllocation.week_starting, CrewAllocation.notes
    ).all()

    # Build matrix: employee → {week → project_code}
    matrix: dict = {}
    weeks_seen: set = set()
    for a in allocs:
        emp_key = a.notes or f"emp_{a.employee_id}"
        wk = str(a.week_starting) if a.week_starting else "unknown"
        weeks_seen.add(wk)

        if emp_key not in matrix:
            matrix[emp_key] = {
                "employee": emp_key,
                "role": a.role_on_project,
                "weeks": {},
            }

        # Look up project code
        if a.project_id:
            proj = db.query(Project.code).filter(Project.id == a.project_id).first()
            matrix[emp_key]["weeks"][wk] = proj[0] if proj else "?"
        else:
            matrix[emp_key]["weeks"][wk] = None

    return {
        "weeks": sorted(weeks_seen),
        "team": list(matrix.values()),
    }


@router.get("/lien-waivers", response_model=List[LienWaiverOut])
def list_lien_waivers(db: Session = Depends(get_db)):
    """Lien waiver tracker — all vendors, all projects."""
    waivers = db.query(LienWaiver).order_by(
        LienWaiver.amount.desc()
    ).all()
    return [LienWaiverOut.model_validate(w) for w in waivers]


@router.get("/lien-waivers/risk")
def lien_waiver_risk(db: Session = Depends(get_db)):
    """Lien waiver risk summary — vendors without proper waiver coverage."""
    waivers = db.query(LienWaiver).all()
    by_vendor: dict = {}
    for w in waivers:
        vid = w.vendor_id
        if vid not in by_vendor:
            vendor = db.query(Vendor.name).filter(Vendor.id == vid).first() if vid else None
            by_vendor[vid] = {
                "vendor_id": vid,
                "vendor_name": vendor[0] if vendor else "Unknown",
                "total_amount": 0,
                "has_conditional": False,
                "has_unconditional": False,
                "waiver_count": 0,
            }
        by_vendor[vid]["total_amount"] += float(w.amount or 0)
        by_vendor[vid]["waiver_count"] += 1
        if w.waiver_type == "conditional":
            by_vendor[vid]["has_conditional"] = True
        elif w.waiver_type == "unconditional":
            by_vendor[vid]["has_unconditional"] = True

    # Calculate risk level
    for v in by_vendor.values():
        if not v["has_conditional"] and not v["has_unconditional"]:
            v["risk"] = "VERY HIGH"
        elif v["has_conditional"] and not v["has_unconditional"]:
            v["risk"] = "HIGH"
        elif v["has_unconditional"]:
            v["risk"] = "LOW"
        else:
            v["risk"] = "MEDIUM"

    return sorted(by_vendor.values(), key=lambda x: x["total_amount"], reverse=True)
