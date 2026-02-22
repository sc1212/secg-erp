"""Cash Flow Forecasting API (Phase 4 / M-16)."""

from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.core.deps import get_db
from backend.models.intelligence import CashFlowForecast


router = APIRouter(prefix="/cash-flow", tags=["Cash Flow"])


def _generate_demo_forecast(scenario: str = "expected"):
    """Generate 13-week demo forecast from today."""
    today = date.today()
    # Start on next Monday
    days_to_monday = (7 - today.weekday()) % 7 or 7
    week_start = today + timedelta(days=days_to_monday)

    # Scenario multipliers
    mult = {"expected": 1.0, "best": 1.15, "worst": 0.75}[scenario]

    starting_cash = 142800
    weeks = []

    weekly_templates = [
        {"draws": 0,     "ar": 12000, "payroll": 18400, "vendors": 22000, "materials": 8400, "debt": 3200, "other_out": 1800},
        {"draws": 45200, "ar": 0,     "payroll": 18400, "vendors": 14000, "materials": 6200, "debt": 0,    "other_out": 800},
        {"draws": 0,     "ar": 38500, "payroll": 18400, "vendors": 31500, "materials": 12000,"debt": 3200, "other_out": 2200},
        {"draws": 0,     "ar": 0,     "payroll": 18400, "vendors": 8400,  "materials": 4800, "debt": 0,    "other_out": 600},
        {"draws": 0,     "ar": 28700, "payroll": 18400, "vendors": 18200, "materials": 9200, "debt": 3200, "other_out": 1400},
        {"draws": 38000, "ar": 0,     "payroll": 18400, "vendors": 22000, "materials": 7800, "debt": 0,    "other_out": 900},
        {"draws": 0,     "ar": 15000, "payroll": 18400, "vendors": 12400, "materials": 5600, "debt": 3200, "other_out": 1100},
        {"draws": 0,     "ar": 0,     "payroll": 18400, "vendors": 28000, "materials": 11200,"debt": 0,    "other_out": 700},
        {"draws": 42000, "ar": 22000, "payroll": 18400, "vendors": 16800, "materials": 6400, "debt": 3200, "other_out": 2600},
        {"draws": 0,     "ar": 0,     "payroll": 18400, "vendors": 9200,  "materials": 4200, "debt": 0,    "other_out": 500},
        {"draws": 0,     "ar": 35000, "payroll": 18400, "vendors": 24400, "materials": 8800, "debt": 3200, "other_out": 1300},
        {"draws": 28500, "ar": 0,     "payroll": 18400, "vendors": 18600, "materials": 7200, "debt": 0,    "other_out": 800},
        {"draws": 0,     "ar": 12000, "payroll": 18400, "vendors": 11400, "materials": 5000, "debt": 3200, "other_out": 600},
    ]

    current_cash = starting_cash
    for i, t in enumerate(weekly_templates[:13]):
        inflows = (t["draws"] + t["ar"]) * mult
        outflows = (t["payroll"] + t["vendors"] + t["materials"] + t["debt"] + t["other_out"]) * (2 - mult)
        net = inflows - outflows
        ending = current_cash + net

        weeks.append({
            "week": i + 1,
            "forecast_date": (week_start + timedelta(weeks=i)).isoformat(),
            "scenario": scenario,
            "expected_draws": round(t["draws"] * mult, 2),
            "expected_ar_collections": round(t["ar"] * mult, 2),
            "other_inflows": 0,
            "total_inflows": round(inflows, 2),
            "scheduled_payroll": round(t["payroll"] * (2 - mult), 2),
            "committed_vendor_payments": round(t["vendors"] * (2 - mult), 2),
            "debt_service": round(t["debt"] * (2 - mult), 2),
            "expected_material_orders": round(t["materials"] * (2 - mult), 2),
            "other_outflows": round(t["other_out"] * (2 - mult), 2),
            "total_outflows": round(outflows, 2),
            "starting_cash": round(current_cash, 2),
            "net_flow": round(net, 2),
            "ending_cash": round(ending, 2),
        })
        current_cash = ending

    return weeks


@router.get("/forecast")
def get_forecast(
    scenario: str = Query("expected", description="expected, best, or worst"),
    db: Session = Depends(get_db),
):
    """Get 13-week rolling cash flow forecast."""
    items = (
        db.query(CashFlowForecast)
        .filter(CashFlowForecast.scenario == scenario)
        .order_by(CashFlowForecast.forecast_date)
        .limit(13)
        .all()
    )
    if not items:
        return _generate_demo_forecast(scenario)
    return items


@router.get("/runway")
def cash_runway(db: Session = Depends(get_db)):
    """Cash runway calculation based on current forecast."""
    forecast = _generate_demo_forecast("expected")
    min_threshold = 50000  # $50K minimum cash floor

    current_cash = 142800
    weeks_until_threshold = None
    for i, week in enumerate(forecast):
        if week["ending_cash"] < min_threshold:
            weeks_until_threshold = i + 1
            break

    return {
        "current_cash": current_cash,
        "min_threshold": min_threshold,
        "runway_weeks": weeks_until_threshold or len(forecast),
        "is_alarm": weeks_until_threshold is not None and weeks_until_threshold <= 8,
        "lowest_projected": min(w["ending_cash"] for w in forecast),
    }


@router.post("/generate")
def generate_forecast(db: Session = Depends(get_db)):
    """Generate fresh 13-week forecast for all 3 scenarios."""
    return {"ok": True, "message": "Forecast generation queued (demo mode)"}
