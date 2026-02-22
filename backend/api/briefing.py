"""Morning Briefing API — AI-generated daily digest for the owner."""

from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import Project

router = APIRouter(prefix="/briefing", tags=["Morning Briefing"])


@router.get("/today")
def morning_briefing(db: Session = Depends(get_db)):
    """Generate today's morning briefing digest.

    In production this would aggregate data from all modules and
    optionally call an LLM for natural-language summaries.
    For now, returns a structured demo briefing.
    """
    today = date.today()

    return {
        "generated_at": datetime.now().isoformat(),
        "date": today.isoformat(),
        "greeting": "Good morning, Mike.",
        "weather_summary": "Sunny, 72°F high — all clear for outdoor work today.",
        "sections": [
            {
                "title": "Cash Position",
                "icon": "DollarSign",
                "priority": "normal",
                "items": [
                    "Operating account: $142,800 (+$23,400 from Friday)",
                    "AR due this week: $67,200 across 3 invoices",
                    "AP due this week: $31,500 (2 vendor payments)",
                ],
            },
            {
                "title": "Project Updates",
                "icon": "FolderKanban",
                "priority": "normal",
                "items": [
                    "PRJ-042 Brentwood: Cabinet delivery confirmed for Monday",
                    "PRJ-038 Franklin: Drywall crew finishing today (on schedule)",
                    "PRJ-051 Green Hills: Demo 80% complete, on track for Wednesday",
                ],
            },
            {
                "title": "Team & Safety",
                "icon": "Users",
                "priority": "normal",
                "items": [
                    "14 days since last incident",
                    "Jake R.'s OSHA-30 expires in 12 days — renewal scheduled",
                    "All daily logs submitted for Friday",
                ],
            },
            {
                "title": "Action Items",
                "icon": "AlertTriangle",
                "priority": "high",
                "items": [
                    "URGENT: Thompson warranty callback — HVAC not reaching temp (assigned to Zach P.)",
                    "Review draw #3 for PRJ-042 ($45,200) — ready for submission",
                    "PEX 3/4\" stock critical — 2 units remaining, order needed",
                    "Schedule toolbox talk for this week (last one: Feb 14)",
                ],
            },
        ],
    }
