"""Employee Scorecard & Incentive Tracker API."""

from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from backend.core.deps import get_db
from backend.models.scorecard import IncentiveProgram, IncentiveMetric, EmployeeScore
from backend.models.core import Employee
from backend.schemas.scorecard import (
    IncentiveProgramOut, IncentiveProgramCreate,
    EmployeeScoreOut, LeaderboardEntry,
)

router = APIRouter(prefix="/scorecard", tags=["Scorecard"])


@router.get("/programs", response_model=list[IncentiveProgramOut])
def list_programs(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(IncentiveProgram).options(joinedload(IncentiveProgram.metrics))
    if status:
        q = q.filter(IncentiveProgram.status == status)
    return [IncentiveProgramOut.model_validate(p) for p in q.order_by(IncentiveProgram.start_date.desc()).all()]


@router.post("/programs", response_model=IncentiveProgramOut, status_code=201)
def create_program(payload: IncentiveProgramCreate, db: Session = Depends(get_db)):
    program = IncentiveProgram(**payload.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return IncentiveProgramOut.model_validate(program)


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(program_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get the leaderboard for an incentive program."""
    # Find active program
    if program_id:
        program = db.query(IncentiveProgram).filter(IncentiveProgram.id == program_id).first()
    else:
        program = db.query(IncentiveProgram).filter(IncentiveProgram.status == "active").first()

    if not program:
        # Return demo leaderboard
        return _demo_leaderboard()

    scores = (
        db.query(EmployeeScore)
        .filter(EmployeeScore.program_id == program.id)
        .all()
    )

    # Group scores by employee
    employee_scores = {}
    for s in scores:
        if s.employee_id not in employee_scores:
            employee_scores[s.employee_id] = {"scores": [], "total": Decimal("0")}
        employee_scores[s.employee_id]["scores"].append(s)
        employee_scores[s.employee_id]["total"] += s.score or Decimal("0")

    # Build leaderboard
    employees = {e.id: e for e in db.query(Employee).filter(Employee.id.in_(employee_scores.keys())).all()}
    entries = []
    for emp_id, data in employee_scores.items():
        emp = employees.get(emp_id)
        if not emp:
            continue
        total = data["total"]
        bonus = (total / Decimal("100") * program.total_pool) if program.total_pool else Decimal("0")
        entries.append(LeaderboardEntry(
            employee_id=emp_id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            role=emp.role,
            total_score=total,
            estimated_bonus=bonus,
        ))

    entries.sort(key=lambda e: e.total_score, reverse=True)
    return entries


def _demo_leaderboard():
    return [
        LeaderboardEntry(employee_id=2, employee_name="Connor M.", role="PM", total_score=Decimal("82"), estimated_bonus=Decimal("3280"), metrics={"margin": "18.2%", "logs": "95%", "on_time": "100%"}),
        LeaderboardEntry(employee_id=3, employee_name="Joseph K.", role="PM", total_score=Decimal("74"), estimated_bonus=Decimal("2960"), metrics={"margin": "15.8%", "logs": "88%", "on_time": "90%"}),
        LeaderboardEntry(employee_id=4, employee_name="Jake R.", role="Lead", total_score=Decimal("68"), estimated_bonus=Decimal("2720"), metrics={"margin": "14.1%", "logs": "92%", "on_time": "85%"}),
        LeaderboardEntry(employee_id=6, employee_name="Zach P.", role="HVAC", total_score=Decimal("55"), estimated_bonus=Decimal("1040"), metrics={"margin": "22.4%", "logs": "60%", "on_time": "—"}),
    ]


@router.get("/scores", response_model=list[EmployeeScoreOut])
def list_scores(
    program_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(EmployeeScore)
    if program_id:
        q = q.filter(EmployeeScore.program_id == program_id)
    if employee_id:
        q = q.filter(EmployeeScore.employee_id == employee_id)
    return [EmployeeScoreOut.model_validate(s) for s in q.all()]
