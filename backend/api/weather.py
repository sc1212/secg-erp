"""Weather Intelligence API — forecasts, impact rules, impact calculations."""

from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.weather import WeatherForecast, WeatherImpactRule, ProjectLocation
from backend.models.core import Project
from backend.schemas.weather import (
    WeatherForecastOut, WeatherImpactRuleOut, WeatherImpactRuleCreate,
    WeatherDayOut, WeatherImpact,
)

router = APIRouter(prefix="/weather", tags=["Weather"])

# ── Default rules (pre-seeded for Tennessee climate) ────────────────────

DEFAULT_RULES = [
    {"trade_or_activity": "Concrete Pour", "condition_field": "temp_low_f", "operator": "lt", "threshold_value": 40, "severity": "stop_work", "message_template": "Concrete pour not recommended — low of {temp_low_f}°F is below 40°F minimum"},
    {"trade_or_activity": "Concrete Pour", "condition_field": "temp_high_f", "operator": "gt", "threshold_value": 95, "severity": "stop_work", "message_template": "Concrete pour not recommended — high of {temp_high_f}°F exceeds 95°F maximum"},
    {"trade_or_activity": "Concrete Pour", "condition_field": "precipitation_pct", "operator": "gt", "threshold_value": 60, "severity": "warning", "message_template": "Concrete pour at risk — {precipitation_pct}% chance of precipitation"},
    {"trade_or_activity": "Roofing", "condition_field": "wind_speed_mph", "operator": "gt", "threshold_value": 25, "severity": "stop_work", "message_template": "Roofing unsafe — wind speed {wind_speed_mph} mph exceeds 25 mph limit"},
    {"trade_or_activity": "Roofing", "condition_field": "precipitation_pct", "operator": "gt", "threshold_value": 40, "severity": "stop_work", "message_template": "Roofing halted — {precipitation_pct}% chance of rain"},
    {"trade_or_activity": "Exterior Paint", "condition_field": "precipitation_pct", "operator": "gt", "threshold_value": 30, "severity": "stop_work", "message_template": "Exterior painting not recommended — {precipitation_pct}% chance of rain"},
    {"trade_or_activity": "Exterior Paint", "condition_field": "humidity_pct", "operator": "gt", "threshold_value": 85, "severity": "warning", "message_template": "High humidity ({humidity_pct}%) may affect paint adhesion"},
    {"trade_or_activity": "Exterior Paint", "condition_field": "temp_low_f", "operator": "lt", "threshold_value": 50, "severity": "warning", "message_template": "Temperature too low for exterior paint — low of {temp_low_f}°F"},
    {"trade_or_activity": "Excavation", "condition_field": "precipitation_inches", "operator": "gt", "threshold_value": 0.5, "severity": "warning", "message_template": "Excavation risk — {precipitation_inches}\" of rain expected, soil saturation possible"},
    {"trade_or_activity": "Excavation", "condition_field": "precipitation_inches", "operator": "gt", "threshold_value": 1.0, "severity": "stop_work", "message_template": "Excavation halted — {precipitation_inches}\" of rain expected"},
    {"trade_or_activity": "Framing", "condition_field": "wind_speed_mph", "operator": "gt", "threshold_value": 30, "severity": "stop_work", "message_template": "Framing unsafe — wind speed {wind_speed_mph} mph exceeds 30 mph limit"},
    {"trade_or_activity": "Framing", "condition_field": "precipitation_pct", "operator": "gt", "threshold_value": 70, "severity": "caution", "message_template": "Framing crew caution — {precipitation_pct}% chance of rain"},
    {"trade_or_activity": "Masonry/Brick", "condition_field": "temp_low_f", "operator": "lt", "threshold_value": 40, "severity": "stop_work", "message_template": "Masonry halted — low of {temp_low_f}°F below 40°F minimum for mortar"},
    {"trade_or_activity": "Drywall (exterior)", "condition_field": "humidity_pct", "operator": "gt", "threshold_value": 80, "severity": "warning", "message_template": "High humidity ({humidity_pct}%) may affect drywall installation"},
]

# ── Demo forecast data ──────────────────────────────────────────────────

def _demo_forecasts():
    """Generate 7 days of demo weather data."""
    today = date.today()
    data = [
        {"offset": 0, "temp_high_f": 72, "temp_low_f": 48, "precipitation_pct": 0, "precipitation_inches": 0, "wind_speed_mph": 8, "humidity_pct": 45, "conditions": "Sunny", "icon_code": "01d"},
        {"offset": 1, "temp_high_f": 68, "temp_low_f": 44, "precipitation_pct": 10, "precipitation_inches": 0, "wind_speed_mph": 12, "humidity_pct": 52, "conditions": "Partly Cloudy", "icon_code": "02d"},
        {"offset": 2, "temp_high_f": 55, "temp_low_f": 41, "precipitation_pct": 85, "precipitation_inches": 0.8, "wind_speed_mph": 22, "humidity_pct": 78, "conditions": "Rain", "icon_code": "10d"},
        {"offset": 3, "temp_high_f": 74, "temp_low_f": 52, "precipitation_pct": 5, "precipitation_inches": 0, "wind_speed_mph": 6, "humidity_pct": 40, "conditions": "Sunny", "icon_code": "01d"},
        {"offset": 4, "temp_high_f": 70, "temp_low_f": 50, "precipitation_pct": 15, "precipitation_inches": 0, "wind_speed_mph": 10, "humidity_pct": 55, "conditions": "Partly Cloudy", "icon_code": "02d"},
        {"offset": 5, "temp_high_f": 62, "temp_low_f": 38, "precipitation_pct": 40, "precipitation_inches": 0.3, "wind_speed_mph": 18, "humidity_pct": 65, "conditions": "Cloudy", "icon_code": "04d"},
        {"offset": 6, "temp_high_f": 58, "temp_low_f": 35, "precipitation_pct": 70, "precipitation_inches": 1.2, "wind_speed_mph": 15, "humidity_pct": 72, "conditions": "Rain", "icon_code": "10d"},
    ]
    result = []
    for d in data:
        result.append(WeatherForecastOut(
            id=d["offset"] + 1,
            forecast_date=today + timedelta(days=d["offset"]),
            **{k: v for k, v in d.items() if k != "offset"},
        ))
    return result


def _evaluate_rules(forecast: WeatherForecastOut, rules: list, projects: list) -> list:
    """Evaluate impact rules against a forecast day."""
    OPERATORS = {
        "lt": lambda a, b: a < b,
        "gt": lambda a, b: a > b,
        "lte": lambda a, b: a <= b,
        "gte": lambda a, b: a >= b,
        "eq": lambda a, b: a == b,
    }
    impacts = []
    forecast_dict = forecast.model_dump()

    for rule in rules:
        field = rule.condition_field if hasattr(rule, 'condition_field') else rule["condition_field"]
        op = rule.operator if hasattr(rule, 'operator') else rule["operator"]
        threshold = float(rule.threshold_value if hasattr(rule, 'threshold_value') else rule["threshold_value"])
        severity = rule.severity if hasattr(rule, 'severity') else rule["severity"]
        trade = rule.trade_or_activity if hasattr(rule, 'trade_or_activity') else rule["trade_or_activity"]
        template = rule.message_template if hasattr(rule, 'message_template') else rule.get("message_template", "")
        rule_id = rule.id if hasattr(rule, 'id') else 0

        actual = forecast_dict.get(field)
        if actual is None:
            continue

        actual_float = float(actual)
        op_fn = OPERATORS.get(op)
        if op_fn and op_fn(actual_float, threshold):
            message = (template or f"{trade}: {field} {op} {threshold}").format(**forecast_dict)
            for proj in projects:
                impacts.append(WeatherImpact(
                    project_id=proj["id"],
                    project_code=proj.get("code"),
                    project_name=proj.get("name"),
                    forecast_date=forecast.forecast_date,
                    rule_id=rule_id,
                    trade_or_activity=trade,
                    severity=severity,
                    message=message,
                    condition_field=field,
                    actual_value=Decimal(str(actual_float)),
                    threshold_value=Decimal(str(threshold)),
                ))
    return impacts


@router.get("/weekly", response_model=list[WeatherDayOut])
def weekly_forecast(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """7-day forecast with computed impacts."""
    today = date.today()

    # Try DB forecasts first
    forecasts_db = (
        db.query(WeatherForecast)
        .filter(WeatherForecast.forecast_date >= today, WeatherForecast.forecast_date <= today + timedelta(days=6))
        .order_by(WeatherForecast.forecast_date)
        .all()
    )

    if forecasts_db:
        forecasts = [WeatherForecastOut.model_validate(f) for f in forecasts_db]
    else:
        forecasts = _demo_forecasts()

    # Get rules
    rules_db = db.query(WeatherImpactRule).all()
    rules = rules_db if rules_db else DEFAULT_RULES

    # Get active projects
    projects_q = db.query(Project).filter(Project.status.in_(["active", "pre_construction"]))
    if project_id:
        projects_q = projects_q.filter(Project.id == project_id)
    projects = [{"id": p.id, "code": p.code, "name": p.name} for p in projects_q.all()]
    if not projects:
        projects = [
            {"id": 1, "code": "PRJ-042", "name": "Custom Home — Brentwood"},
            {"id": 2, "code": "PRJ-038", "name": "Spec Home — Franklin"},
            {"id": 3, "code": "PRJ-051", "name": "Remodel — Green Hills"},
            {"id": 4, "code": "PRJ-033", "name": "Insurance Rehab — Antioch"},
            {"id": 5, "code": "PRJ-027", "name": "Commercial — Berry Hill"},
        ]

    result = []
    for forecast in forecasts:
        impacts = _evaluate_rules(forecast, rules, projects)
        affected = len(set(i.project_id for i in impacts))
        result.append(WeatherDayOut(forecast=forecast, impacts=impacts, affected_projects=affected))

    return result


@router.get("/impacts")
def weather_impacts(
    days: int = Query(7, ge=1, le=14),
    db: Session = Depends(get_db),
):
    """All projects with weather impacts in the next N days."""
    weekly = weekly_forecast(db=db)
    all_impacts = []
    for day in weekly[:days]:
        all_impacts.extend(day.impacts)

    # Group by severity
    stop_work = [i for i in all_impacts if i.severity == "stop_work"]
    warning = [i for i in all_impacts if i.severity == "warning"]
    caution = [i for i in all_impacts if i.severity == "caution"]

    return {
        "total_impacts": len(all_impacts),
        "stop_work": [i.model_dump() for i in stop_work],
        "warning": [i.model_dump() for i in warning],
        "caution": [i.model_dump() for i in caution],
    }


@router.get("/rules", response_model=list[WeatherImpactRuleOut])
def list_rules(db: Session = Depends(get_db)):
    """List all weather impact rules."""
    rules = db.query(WeatherImpactRule).order_by(WeatherImpactRule.trade_or_activity).all()
    if not rules:
        # Return default rules with fake IDs
        return [WeatherImpactRuleOut(id=i + 1, **r) for i, r in enumerate(DEFAULT_RULES)]
    return [WeatherImpactRuleOut.model_validate(r) for r in rules]


@router.post("/rules", response_model=WeatherImpactRuleOut, status_code=201)
def create_rule(payload: WeatherImpactRuleCreate, db: Session = Depends(get_db)):
    """Create a new weather impact rule."""
    rule = WeatherImpactRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return WeatherImpactRuleOut.model_validate(rule)


@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    """Delete a weather impact rule."""
    rule = db.query(WeatherImpactRule).filter(WeatherImpactRule.id == rule_id).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    db.delete(rule)
    db.commit()


@router.post("/refresh")
def refresh_weather(db: Session = Depends(get_db)):
    """Force re-fetch weather data (placeholder — would call OpenWeatherMap API)."""
    return {"status": "ok", "message": "Weather refresh triggered. Demo mode — using cached data."}
