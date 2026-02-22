"""Profit Fade Early Warning API (Phase 4 / M-15)."""

from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.core.deps import get_db
from backend.models.intelligence import ProfitFadeSnapshot
from backend.models.core import Project

router = APIRouter(prefix="/profit-fade", tags=["Profit Fade"])

# Demo data for when no real snapshots exist
DEMO_SNAPSHOTS = [
    {
        "project_id": 1, "project_code": "PRJ-042", "project_name": "Custom Home — Brentwood",
        "snapshot_date": "2026-02-22",
        "original_contract": 485000, "approved_changes": 12750, "revised_contract": 497750,
        "costs_to_date": 284200, "estimated_cost_at_completion": 418000,
        "percent_complete": 62.5,
        "earned_value": 311094, "cost_performance_index": 1.095, "schedule_performance_index": 0.98,
        "original_margin_pct": 18.5, "current_margin_pct": 16.1, "projected_margin_pct": 16.0,
        "margin_fade_pct": 2.4,
        "fade_severity": "watch",
        "unbilled_costs": 8400, "pending_change_orders": 8750, "unapproved_extras": 2200,
    },
    {
        "project_id": 2, "project_code": "PRJ-038", "project_name": "Spec Home — Franklin",
        "snapshot_date": "2026-02-22",
        "original_contract": 342000, "approved_changes": 0, "revised_contract": 342000,
        "costs_to_date": 187400, "estimated_cost_at_completion": 305000,
        "percent_complete": 58.0,
        "earned_value": 198360, "cost_performance_index": 1.058, "schedule_performance_index": 1.02,
        "original_margin_pct": 14.2, "current_margin_pct": 10.8, "projected_margin_pct": 10.8,
        "margin_fade_pct": 3.4,
        "fade_severity": "watch",
        "unbilled_costs": 14200, "pending_change_orders": 0, "unapproved_extras": 4800,
    },
    {
        "project_id": 3, "project_code": "PRJ-051", "project_name": "Remodel — Green Hills",
        "snapshot_date": "2026-02-22",
        "original_contract": 128000, "approved_changes": 0, "revised_contract": 128000,
        "costs_to_date": 42800, "estimated_cost_at_completion": 138500,
        "percent_complete": 22.0,
        "earned_value": 28160, "cost_performance_index": 0.658, "schedule_performance_index": 0.95,
        "original_margin_pct": 12.0, "current_margin_pct": 7.6, "projected_margin_pct": -8.2,
        "margin_fade_pct": 20.2,
        "fade_severity": "critical",
        "unbilled_costs": 6200, "pending_change_orders": 0, "unapproved_extras": 8100,
    },
]

DEMO_DRIVERS = {
    3: [
        {"cost_code": "03-100", "description": "Concrete & Foundations", "budget": 18000, "actual": 28400, "variance": -10400, "overage_pct": 57.8},
        {"cost_code": "06-100", "description": "Rough Carpentry", "budget": 12000, "actual": 9800, "variance": 2200, "overage_pct": -18.3},
        {"cost_code": "09-200", "description": "Tile & Flooring", "budget": 14000, "actual": 4600, "variance": 9400, "overage_pct": -67.1},
    ],
    1: [
        {"cost_code": "22-100", "description": "Plumbing Rough-In", "budget": 32000, "actual": 34800, "variance": -2800, "overage_pct": 8.75},
        {"cost_code": "15-100", "description": "HVAC", "budget": 28000, "actual": 29400, "variance": -1400, "overage_pct": 5.0},
    ],
    2: [
        {"cost_code": "06-100", "description": "Rough Carpentry", "budget": 28000, "actual": 34200, "variance": -6200, "overage_pct": 22.1},
    ],
}


@router.get("/dashboard")
def profit_fade_dashboard(db: Session = Depends(get_db)):
    """All active projects ranked by fade severity."""
    snapshots = (
        db.query(ProfitFadeSnapshot)
        .order_by(ProfitFadeSnapshot.snapshot_date.desc())
        .limit(50)
        .all()
    )
    if not snapshots:
        # Return demo sorted by severity (critical first)
        order = {"critical": 0, "warning": 1, "watch": 2, "none": 3}
        return sorted(DEMO_SNAPSHOTS, key=lambda x: order.get(x["fade_severity"], 4))

    seen = set()
    results = []
    for s in snapshots:
        if s.project_id not in seen:
            seen.add(s.project_id)
            results.append(s)
    return results


@router.get("/projects/{project_id}")
def project_fade_history(
    project_id: int,
    limit: int = Query(12, ge=1, le=52),
    db: Session = Depends(get_db),
):
    """Fade history for a single project (last N snapshots)."""
    items = (
        db.query(ProfitFadeSnapshot)
        .filter(ProfitFadeSnapshot.project_id == project_id)
        .order_by(ProfitFadeSnapshot.snapshot_date.desc())
        .limit(limit)
        .all()
    )
    if not items:
        demo = [s for s in DEMO_SNAPSHOTS if s["project_id"] == project_id]
        return demo
    return items


@router.get("/projects/{project_id}/drivers")
def fade_drivers(project_id: int, db: Session = Depends(get_db)):
    """Cost codes driving the margin fade for a project."""
    return DEMO_DRIVERS.get(project_id, [])


@router.post("/generate")
def generate_snapshots(db: Session = Depends(get_db)):
    """Trigger snapshot generation for all active projects."""
    # In production: pull cost events by project, compute CPI, margin, etc.
    return {"ok": True, "message": "Snapshot generation queued (demo mode)"}
