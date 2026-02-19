"""Importer for construction loan budget CSVs (draw schedule format).

Reads files like: 1363_walnut_grove_tract_1_christiana_tn_37037_budget_02112026.csv
Creates: Project → CostCodes → SOVLines → PayApps + PayAppLines
"""

import csv
import os
import re
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from backend.importers.base import BaseImporter, ImportResult
from backend.models.core import (
    CostCode, PayApp, PayAppLine, Project, ProjectStatus, ProjectType, SOVLine,
)


# Map filename patterns to project codes and metadata
PROJECT_MAP = {
    "walnut_grove_tract_1": {
        "code": "WG1",
        "name": "Walnut Grove - Lot 1",
        "address": "1363 Walnut Grove Rd, Tract 1",
        "city": "Christiana",
        "state": "TN",
        "zip": "37037",
        "type": ProjectType.custom_home,
    },
    "walnut_grove_rd_tract_2": {
        "code": "WG2",
        "name": "Walnut Grove - LOT 2",
        "address": "1363 Walnut Grove Rd, Tract 2",
        "city": "Christiana",
        "state": "TN",
        "zip": "37037",
        "type": ProjectType.custom_home,
    },
    "walnut_grove_tract_3": {
        "code": "WG3",
        "name": "Walnut Grove - LOT 3",
        "address": "1363 Walnut Grove Rd, Tract 3",
        "city": "Christiana",
        "state": "TN",
        "zip": "37037",
        "type": ProjectType.custom_home,
    },
    "205_kerr_ave": {
        "code": "KA2",
        "name": "205 Kerr Ave - Spec",
        "address": "205 Kerr Ave",
        "city": "Murfreesboro",
        "state": "TN",
        "zip": "37130",
        "type": ProjectType.spec_home,
    },
    "203_kerr_ave": {
        "code": "KA1",
        "name": "203 Kerr Ave - Remodel",
        "address": "203 Kerr Ave",
        "city": "Murfreesboro",
        "state": "TN",
        "zip": "37130",
        "type": ProjectType.remodel,
    },
    "9906_rockvale": {
        "code": "RV1",
        "name": "Rockvale Rd",
        "address": "9906 Rockvale Rd",
        "city": "Rockvale",
        "state": "TN",
        "zip": "37153",
        "type": ProjectType.remodel,
    },
}


class BudgetCSVImporter(BaseImporter):
    """Imports a single construction loan budget CSV into the database."""

    source_name = "budget_csv"
    source_type = "csv_import"

    def __init__(self, session: Session, file_path: str,
                 batch_id: Optional[str] = None):
        super().__init__(session, batch_id)
        self.file_path = file_path
        self.filename = os.path.basename(file_path)

    def _identify_project(self) -> dict:
        """Match filename to project metadata."""
        fname_lower = self.filename.lower()
        for pattern, meta in PROJECT_MAP.items():
            if pattern in fname_lower:
                return meta
        # Fallback: derive from filename
        parts = self.filename.replace("_budget_", "_").split("_")
        address = " ".join(p.title() for p in parts[:4] if not p.isdigit() or len(p) < 5)
        return {
            "code": parts[0][:10].upper(),
            "name": address,
            "address": address,
            "city": "",
            "state": "TN",
            "zip": "",
            "type": ProjectType.custom_home,
        }

    def _find_draw_columns(self, header: list[str]) -> tuple[list[int], int, int, int]:
        """Identify draw column indices and Approved/Released/Balance columns."""
        draw_cols = []
        approved_idx = released_idx = balance_idx = -1

        for i, col in enumerate(header):
            col_lower = col.strip().lower()
            if col_lower.startswith("draw"):
                draw_cols.append(i)
            elif col_lower == "approved":
                approved_idx = i
            elif col_lower == "released":
                released_idx = i
            elif col_lower == "balance":
                balance_idx = i

        return draw_cols, approved_idx, released_idx, balance_idx

    def run(self) -> ImportResult:
        meta = self._identify_project()

        # ── Create or find project ───────────────────────────────────────
        project = self.session.query(Project).filter(
            Project.code == meta["code"]
        ).first()

        if not project:
            project = Project(
                code=meta["code"],
                name=meta["name"],
                status=ProjectStatus.active,
                project_type=meta["type"],
                address=meta["address"],
                city=meta["city"],
                state=meta["state"],
                zip_code=meta["zip"],
            )
            self.session.add(project)
            self.session.flush()

        # ── Read CSV ─────────────────────────────────────────────────────
        rows = []
        with open(self.file_path, "r") as f:
            reader = csv.reader(f)
            header = next(reader)
            for row in reader:
                rows.append(row)

        draw_cols, approved_idx, released_idx, balance_idx = \
            self._find_draw_columns(header)

        # ── Parse totals row ─────────────────────────────────────────────
        totals_row = None
        line_items = []
        for row in rows:
            if len(row) > 1 and row[1].strip().lower() == "total":
                totals_row = row
            elif len(row) > 1 and row[0].strip().isdigit():
                line_items.append(row)

        if totals_row:
            project.budget_total = self.clean_currency(totals_row[2])
            if approved_idx >= 0:
                project.contract_amount = self.clean_currency(totals_row[approved_idx])
            self.session.flush()

        # ── Create cost codes for each budget line item ──────────────────
        sort_order = 0
        for row in line_items:
            line_num = self.clean_int(row[0])
            description = self.clean_string(row[1])
            budget_amount = self.clean_currency(row[2])

            if not description or description.lower().endswith("photo") or \
               description.lower().startswith("street view") or \
               description.lower().startswith("interior video"):
                # Skip photo/video documentation lines (budget = $0)
                if budget_amount == 0:
                    self.result.skipped += 1
                    continue

            sort_order += 1
            code_str = f"{line_num:03d}"

            # Check for existing cost code
            existing_cc = self.session.query(CostCode).filter(
                CostCode.project_id == project.id,
                CostCode.code == code_str,
            ).first()

            if existing_cc:
                existing_cc.budget_amount = budget_amount
                existing_cc.description = description
                self.result.updated += 1
                cost_code = existing_cc
            else:
                cost_code = CostCode(
                    project_id=project.id,
                    code=code_str,
                    description=description,
                    budget_amount=budget_amount,
                    category=self._categorize_cost_code(description),
                    sort_order=sort_order,
                )
                self.session.add(cost_code)
                self.result.created += 1

            self.session.flush()

            # ── Create SOV line ──────────────────────────────────────────
            existing_sov = self.session.query(SOVLine).filter(
                SOVLine.project_id == project.id,
                SOVLine.line_number == line_num,
            ).first()

            # Calculate totals from draw columns
            total_drawn = Decimal("0")
            for di in draw_cols:
                if di < len(row):
                    total_drawn += self.clean_currency(row[di])

            approved_val = self.clean_currency(row[approved_idx]) if approved_idx >= 0 and approved_idx < len(row) else total_drawn
            balance_val = self.clean_currency(row[balance_idx]) if balance_idx >= 0 and balance_idx < len(row) else (budget_amount - approved_val)

            pct = (approved_val / budget_amount * 100) if budget_amount > 0 else Decimal("0")

            if not existing_sov:
                sov = SOVLine(
                    project_id=project.id,
                    cost_code_id=cost_code.id,
                    line_number=line_num,
                    description=description,
                    scheduled_value=budget_amount,
                    total_completed=approved_val,
                    percent_complete=min(pct, Decimal("100")),
                    balance_to_finish=balance_val,
                )
                self.session.add(sov)
            else:
                existing_sov.scheduled_value = budget_amount
                existing_sov.total_completed = approved_val
                existing_sov.percent_complete = min(pct, Decimal("100"))
                existing_sov.balance_to_finish = balance_val

            # ── Create individual draw records as PayApps ────────────────
            for draw_idx, col_idx in enumerate(draw_cols, start=1):
                if col_idx >= len(row):
                    continue
                draw_amount = self.clean_currency(row[col_idx])
                if draw_amount == 0:
                    continue

                # We create PayAppLines; the PayApp (draw) itself is
                # created once per draw number at the project level.
                # This is handled in a second pass below.

        # ── Create PayApps (draws) at the project level ──────────────────
        if totals_row:
            for draw_idx, col_idx in enumerate(draw_cols, start=1):
                if col_idx >= len(totals_row):
                    continue
                draw_total = self.clean_currency(totals_row[col_idx])
                if draw_total == 0:
                    continue

                existing_pa = self.session.query(PayApp).filter(
                    PayApp.project_id == project.id,
                    PayApp.pay_app_number == draw_idx,
                ).first()

                if not existing_pa:
                    pa = PayApp(
                        project_id=project.id,
                        pay_app_number=draw_idx,
                        amount_requested=draw_total,
                        amount_approved=draw_total,
                        net_payment=draw_total,
                        status="paid",
                    )
                    self.session.add(pa)

        self.session.commit()
        self.log_data_source(self.result.total_processed)
        self.session.commit()
        self.result.finish()
        return self.result

    @staticmethod
    def _categorize_cost_code(description: str) -> str:
        """Assign a high-level category based on line item description."""
        desc = description.lower()
        if any(w in desc for w in ["architect", "permit", "survey", "impact"]):
            return "Pre-Construction"
        if any(w in desc for w in ["clearing", "grading", "excavat", "demolit", "dumpster"]):
            return "Site Work"
        if any(w in desc for w in ["foundation", "lumber", "framing", "roof", "window",
                                    "siding", "gutter", "fascia", "soffit", "door"]):
            return "Structure"
        if any(w in desc for w in ["plumbing", "hvac", "electric", "insulation",
                                    "water heater", "septic", "sewer", "utility"]):
            return "MEP"
        if any(w in desc for w in ["sheetrock", "drywall", "tape"]):
            return "Drywall"
        if any(w in desc for w in ["cabinet", "vanit", "countertop", "appliance",
                                    "toilet", "sink", "bathtub", "shower"]):
            return "Fixtures & Finishes"
        if any(w in desc for w in ["flooring", "tile", "lvp", "wood floor"]):
            return "Flooring"
        if any(w in desc for w in ["paint", "millwork", "moulding", "trim",
                                    "stair", "railing", "door"]):
            return "Interior Finishes"
        if any(w in desc for w in ["sidewalk", "driveway", "landscap", "fence",
                                    "porch", "deck", "pool", "front finish", "concrete"]):
            return "Exterior & Site"
        if any(w in desc for w in ["fireplace", "fire place"]):
            return "Specialty"
        return "General"


class BudgetCSVBatchImporter(BaseImporter):
    """Imports all budget CSV files from a directory."""

    source_name = "budget_csv_batch"

    def __init__(self, session: Session, directory: str,
                 batch_id: Optional[str] = None):
        super().__init__(session, batch_id)
        self.directory = directory

    def run(self) -> ImportResult:
        csv_files = sorted(
            f for f in os.listdir(self.directory)
            if f.endswith(".csv") and "budget" in f.lower()
        )

        for fname in csv_files:
            fpath = os.path.join(self.directory, fname)
            importer = BudgetCSVImporter(
                self.session, fpath, batch_id=self.batch_id
            )
            sub_result = importer.run()
            self.result.created += sub_result.created
            self.result.updated += sub_result.updated
            self.result.skipped += sub_result.skipped
            self.result.errors.extend(sub_result.errors)
            print(sub_result.summary())

        self.result.finish()
        return self.result
