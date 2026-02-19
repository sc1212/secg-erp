"""Importer for the BuilderTrend schedule export (PDF parsed to text).

Since the schedule PDF is rendered as a Gantt chart, we extract task names,
project assignments, and approximate date ranges from the calendar text.
Creates: ProjectMilestone records.

NOTE: This importer works with the text content already extracted from the
PDF by the pipeline. For production, consider using a PDF parsing library
or having BuilderTrend export to CSV/iCal instead.
"""

import re
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from backend.importers.base import BaseImporter, ImportResult
from backend.models.core import Project, ProjectStatus
from backend.models.extended import ProjectMilestone, MilestoneStatus


# Known project name patterns from the schedule
SCHEDULE_PROJECT_MAP = {
    "Walnut Grove - LOT 3 (WG3)": "WG3",
    "Walnut Grove - LOT 2 (WG2)": "WG2",
    "Walnut Grove - Lot 1 (WG1)": "WG1",
    "CS2 - 2147 Cason Lane": "CS2",
    "CS1 - 2145 Cason Lane": "CS1",
    "Rockvale Rd": "RV1",
    "205 Kerr Ave - Spec": "KA2",
    "203 Kerr Ave - Remodel": "KA1",
    "Miller Rd - Remodel": "MR1",
    "Veterans Lot 1": "VET1",
    "Legens - Fire Insurance Claim": "LEG1",
}


# Task entries parsed from the schedule PDF content
# Format: (task_name, project_pattern, month, start_day, end_day)
SCHEDULE_DATA = [
    # ── January ──────────────────────────────────────────────────────────
    ("Cabinet Install", "CS1", 1, 29, 10),
    ("Cabinet Install", "CS2", 1, 29, 10),
    ("Demolition", "RV1", 1, 29, 10),
    ("Dig Utilities", "KA1", 1, 31, 31),
    ("Drywall", "WG2", 1, 29, 10),
    ("Drywall Take Off", "KA2", 1, 2, 2),
    ("Electrical Trim Out", "CS2", 1, 1, 24),
    ("Electrical Trim Out", "CS1", 1, 1, 24),
    ("Final touch up punchout clean", "MR1", 1, 1, 17),
    ("Flooring Install", "VET1", 1, 1, 3),
    ("Insulation Take Off", "KA2", 1, 2, 3),
    ("Countertop Install", "CS2", 1, 8, 10),
    ("Countertop Install", "CS1", 1, 8, 10),
    ("Electrical Rough-In", "KA1", 1, 6, 8),
    ("Electrical Rough-In", "KA2", 1, 9, 17),
    ("Interior/Ext Paint", "WG3", 1, 7, 8),
    ("Gutters & Downspouts", "WG3", 1, 8, 8),
    ("Install Cabinets/Countertops", "WG3", 1, 9, 15),
    ("Install Gutters", "VET1", 1, 8, 8),
    ("Plumbing Rough In", "KA2", 1, 9, 9),
    ("Rough Inspection", "LEG1", 1, 9, 9),
    ("Pre-Build Selections", "RV1", 1, 10, 24),
    ("Cabinet Install", "VET1", 1, 12, 12),
    ("Cabinet Install", "WG2", 1, 14, 21),
    ("Completion/Final Walkthrough", "MR1", 1, 15, 15),
    ("Dig/Run Utilities", "WG3", 1, 13, 28),
    ("Exterior Masonry/Siding", "KA2", 1, 13, 23),
    ("HVAC Trim Out", "WG3", 1, 17, 17),
    ("Install Trim and Doors", "WG2", 1, 15, 22),
    ("Order Trim/Interior Doors", "WG2", 1, 12, 13),
    ("Plumbing Trim Out", "CS2", 1, 14, 14),
    ("Plumbing Trim Out", "CS1", 1, 14, 14),
    ("Plumbing Trim Out", "WG3", 1, 16, 16),
    ("Prime Walls", "WG2", 1, 13, 14),
    ("Tile Install", "WG2", 1, 14, 17),
    ("Countertop Install", "WG2", 1, 21, 28),
    ("Appliance Installation", "CS1", 1, 22, 22),
    ("Appliance Installation", "CS2", 1, 22, 22),
    ("Electrical Trim Out", "WG3", 1, 19, 20),
    ("Final Grade Seed Straw", "WG3", 1, 20, 22),
    ("Install Garage Doors", "WG2", 1, 23, 23),
    ("Mirrors and Glasswork", "CS1", 1, 21, 22),
    ("Mirrors and Glasswork", "CS2", 1, 21, 22),
    ("Painting-Interior", "WG2", 1, 21, 22),
    ("Permits", "RV1", 1, 24, 28),
    ("Walk Through Punch List", "WG3", 1, 23, 24),
    ("Cabinet Install", "WG1", 1, 30, 4),
    ("Electrical Trim Out", "WG2", 1, 27, 30),
    ("Final Touch Up", "CS2", 1, 27, 11),
    ("Final Touch Up", "CS1", 1, 27, 11),
    ("Flooring Install", "WG2", 1, 27, 30),
    ("HVAC Rough In", "KA2", 1, 28, 29),
    ("Framing/Rough-In Inspection", "KA2", 1, 29, 30),
    ("Install Fascia and Soffit", "KA2", 1, 31, 3),
    ("Install Gutters", "WG2", 1, 31, 31),
    ("HVAC Trim Out", "WG2", 1, 28, 29),
    ("Install Siding", "KA1", 1, 30, 3),
    ("Rough Punchout", "CS1", 1, 26, 26),
    ("Rough Punchout", "CS2", 1, 26, 26),
    ("Interior Hardware Install", "WG2", 1, 30, 30),
    ("Plumbing Trim Out", "WG2", 1, 28, 30),
    ("Submit Lumber/Roof Takeoffs", "RV1", 1, 29, 16),
    ("Submit Window/Ext Door Takeoff", "RV1", 1, 29, 16),

    # ── February ─────────────────────────────────────────────────────────
    ("Appliance Installation", "WG2", 2, 7, 10),
    ("Countertop Install", "VET1", 2, 3, 3),
    ("Countertop Install", "WG1", 2, 5, 10),
    ("Drywall", "KA2", 2, 5, 18),
    ("Insulation Install", "KA2", 2, 3, 5),
    ("Insulation Inspection", "KA2", 2, 5, 5),
    ("Painting-Interior", "WG1", 2, 6, 10),
    ("Mirrors and Glasswork", "WG2", 2, 6, 6),
    ("Completion/Final Walkthrough", "CS1", 2, 14, 14),
    ("Completion/Final Walkthrough", "CS2", 2, 14, 14),
    ("Electrical Trim Out", "VET1", 2, 9, 12),
    ("Electrical Trim Out", "WG1", 2, 11, 13),
    ("Flooring Install", "WG1", 2, 10, 11),
    ("HVAC Trim Out", "WG1", 2, 11, 12),
    ("Insulation Install", "KA1", 2, 14, 14),
    ("Final Touch Up", "WG2", 2, 13, 20),
    ("Interior Hardware Install", "VET1", 2, 12, 12),
    ("Interior Hardware Install", "WG1", 2, 14, 17),
    ("Landscaping/Finish Grade", "WG2", 2, 13, 26),
    ("Plumbing Trim Out", "VET1", 2, 10, 12),
    ("Plumbing Trim Out", "WG1", 2, 12, 13),
    ("Rough Punchout", "WG2", 2, 12, 12),
    ("Drywall", "KA1", 2, 16, 25),
    ("Excavation", "RV1", 2, 18, 18),
    ("Exterior Concrete/Flatwork", "WG3", 2, 18, 20),
    ("Install Gutters", "WG1", 2, 16, 16),
    ("Mirrors and Glasswork", "VET1", 2, 18, 19),
    ("Mirrors and Glasswork", "WG1", 2, 19, 20),
    ("Order Trim/Interior Doors", "KA2", 2, 21, 21),
    ("Prime Walls", "KA2", 2, 21, 21),
    ("Tile Install", "KA2", 2, 21, 21),
    ("Appliance Installation", "VET1", 2, 20, 23),
    ("Appliance Installation", "WG1", 2, 23, 25),
    ("Cabinet Install", "KA2", 2, 26, 3),
    ("Install Garage Doors", "KA2", 2, 24, 24),
    ("Foundation", "RV1", 2, 25, 26),
    ("Install Trim and Doors", "KA2", 2, 24, 4),
    ("Pour Footers", "RV1", 2, 26, 26),
    ("Landscaping/Finish Grade", "VET1", 2, 27, 7),
    ("Landscaping/Finish Grade", "WG1", 2, 27, 7),
    ("Prime Walls", "KA1", 2, 25, 5),
    ("Final Touch Up", "VET1", 2, 24, 7),
    ("Final Touch Up", "WG1", 2, 24, 14),
    ("Rough Punchout", "VET1", 2, 27, 27),
    ("Rough Punchout", "WG1", 2, 27, 27),

    # ── March ────────────────────────────────────────────────────────────
    ("Completion/Final Walkthrough", "WG2", 3, 3, 4),
    ("Cabinet Install", "KA1", 3, 5, 10),
    ("Countertop Install", "KA2", 3, 4, 5),
    ("Framing", "RV1", 3, 5, 12),
    ("Install Windows", "RV1", 3, 6, 10),
    ("Interior Millwork", "KA1", 3, 5, 12),
    ("Painting-Interior", "KA2", 3, 4, 10),
    ("Electrical Trim Out", "KA2", 3, 9, 13),
    ("Dig Utilities", "KA2", 3, 9, 18),
    ("Drywall Take Off", "RV1", 3, 9, 9),
    ("Electrical Rough-In", "RV1", 3, 10, 12),
    ("Exterior Take Off", "RV1", 3, 10, 10),
    ("Flooring Install", "KA2", 3, 12, 18),
    ("HVAC Rough In", "RV1", 3, 10, 12),
    ("HVAC Trim Out", "KA2", 3, 11, 12),
    ("Install Gutters", "KA2", 3, 12, 12),
    ("Install Roof", "RV1", 3, 13, 13),
    ("Insulation Take Off", "RV1", 3, 13, 13),
    ("Interior Hardware Install", "KA2", 3, 11, 13),
    ("Painting-Interior", "KA1", 3, 11, 24),
    ("Plumbing Rough In", "RV1", 3, 12, 13),
    ("Plumbing Trim Out", "KA2", 3, 12, 13),
    ("Completion/Final Walkthrough", "VET1", 3, 16, 17),
    ("Completion/Final Walkthrough", "WG1", 3, 16, 17),
    ("Appliance Installation", "KA2", 3, 18, 23),
    ("Drywall", "RV1", 3, 17, 4),
    ("Dig Utilities", "RV1", 3, 17, 18),
    ("Exterior Masonry/Siding", "RV1", 3, 19, 26),
    ("Framing/Rough-In Inspection", "RV1", 3, 18, 19),
    ("Insulation Install", "RV1", 3, 19, 19),
    ("Insulation Inspection", "RV1", 3, 20, 20),
    ("Install Fascia and Soffit", "RV1", 3, 19, 20),
    ("Mirrors and Glasswork", "KA2", 3, 19, 19),
    ("Final Touch Up", "KA2", 3, 25, 8),
    ("Flooring Install", "KA1", 3, 24, 31),
    ("Landscaping/Finish Grade", "KA2", 3, 26, 2),
    ("Painting-Exterior", "RV1", 3, 25, 26),
    ("Rough Punchout", "KA2", 3, 24, 24),

    # ── April ────────────────────────────────────────────────────────────
    ("Install Garage Doors", "RV1", 4, 1, 1),
    ("Cabinet Install", "RV1", 4, 7, 14),
    ("Countertop Install", "KA1", 4, 8, 8),
    ("Flooring Install", "KA1", 4, 6, 10),
    ("Order Trim/Interior Doors", "RV1", 4, 9, 9),
    ("Install Trim and Doors", "RV1", 4, 10, 15),
    ("Prime Walls", "RV1", 4, 9, 10),
    ("Tile Install", "RV1", 4, 9, 10),
    ("Countertop Install", "RV1", 4, 14, 22),
    ("Completion/Final Walkthrough", "KA2", 4, 15, 15),
    ("HVAC Finish", "KA1", 4, 14, 14),
    ("Interior Hardware Install", "KA1", 4, 14, 20),
    ("Light Fixture Install", "KA1", 4, 15, 15),
    ("Painting-Interior", "RV1", 4, 14, 22),
    ("Plumbing Fixtures Install", "KA1", 4, 15, 15),
    ("Electrical Trim Out", "RV1", 4, 21, 22),
    ("Finish Trim", "KA1", 4, 22, 28),
    ("HVAC Trim Out", "RV1", 4, 22, 23),
    ("Interior Hardware Install", "RV1", 4, 23, 28),
    ("Landscaping/Finish Grade", "KA1", 4, 23, 1),
    ("Mirrors and Glasswork", "KA1", 4, 23, 23),
    ("Plumbing Trim Out", "RV1", 4, 23, 24),
    ("Flooring Install", "RV1", 4, 28, 1),
    ("Install Gutters", "RV1", 4, 28, 28),
    ("Mirrors and Glasswork", "RV1", 4, 29, 29),

    # ── May ──────────────────────────────────────────────────────────────
    ("Appliance Installation", "RV1", 5, 5, 5),
    ("Appliance Installation", "KA1", 5, 5, 5),
    ("Decks Porches Railings", "KA1", 5, 7, 12),
    ("Fences and Gates", "KA1", 5, 7, 7),
    ("Rough Punchout", "KA1", 5, 6, 6),
    ("Final Touch Up", "RV1", 5, 7, 26),
    ("Final Touch Up", "KA1", 5, 7, 26),
    ("Rough Punchout", "RV1", 5, 8, 8),
    ("Landscaping/Finish Grade", "RV1", 5, 8, 22),
    ("Flatwork", "KA1", 5, 12, 22),
    ("Completion/Final Walkthrough", "RV1", 5, 27, 27),
    ("Completion/Final Walkthrough", "KA1", 5, 28, 28),
]


class ScheduleImporter(BaseImporter):
    """Imports the project schedule into project_milestones."""

    source_name = "schedule"
    source_type = "buildertrend_import"

    def __init__(self, session: Session, batch_id: Optional[str] = None):
        super().__init__(session, batch_id)

    def run(self) -> ImportResult:
        year = 2025  # The schedule starts in January (2025 or 2026)
        # The schedule PDF references "January" starting with date 28 Dec,
        # and budget files are dated 02112026, so this is 2025-2026
        year = 2025

        for task_name, proj_code, month, start_day, end_day in SCHEDULE_DATA:
            try:
                self._import_milestone(task_name, proj_code, year, month,
                                        start_day, end_day)
            except Exception as e:
                self.result.errors.append(
                    f"'{task_name}' ({proj_code}): {e}"
                )

        self.session.commit()
        self.log_data_source(self.result.total_processed)
        self.session.commit()
        self.result.finish()
        return self.result

    def _import_milestone(self, task_name: str, proj_code: str,
                           year: int, month: int,
                           start_day: int, end_day: int):
        """Create a single milestone record."""
        # Resolve project
        project = self.session.query(Project).filter(
            Project.code == proj_code
        ).first()

        if not project:
            project = Project(
                code=proj_code,
                name=proj_code,
                status=ProjectStatus.active,
            )
            self.session.add(project)
            self.session.flush()

        # Calculate dates — handle month rollovers
        start_year = year if month <= 12 else year + 1
        start_month = month
        if month > 5:
            # Schedule only covers Jan-May realistically
            start_year = year + 1
            start_month = month

        # Use 2026 for all dates since budget files are dated 2026
        start_year = 2026

        try:
            planned_start = datetime(start_year, start_month, start_day).date()
        except ValueError:
            planned_start = datetime(start_year, start_month, 1).date()

        # If end_day < start_day, it rolls into next month
        if end_day < start_day:
            end_month = start_month + 1
            end_year = start_year
            if end_month > 12:
                end_month = 1
                end_year += 1
        else:
            end_month = start_month
            end_year = start_year

        try:
            planned_end = datetime(end_year, end_month, end_day).date()
        except ValueError:
            planned_end = planned_start + timedelta(days=3)

        # Determine status based on today's date
        today = datetime.now().date()
        if planned_end < today:
            status = MilestoneStatus.completed
        elif planned_start <= today:
            status = MilestoneStatus.in_progress
        else:
            status = MilestoneStatus.not_started

        # Dedup
        existing = self.session.query(ProjectMilestone).filter(
            ProjectMilestone.project_id == project.id,
            ProjectMilestone.task_name == task_name,
            ProjectMilestone.planned_start == planned_start,
        ).first()

        if existing:
            self.result.skipped += 1
            return

        milestone = ProjectMilestone(
            project_id=project.id,
            task_name=task_name,
            status=status,
            planned_start=planned_start,
            planned_end=planned_end,
        )
        self.session.add(milestone)
        self.result.created += 1
