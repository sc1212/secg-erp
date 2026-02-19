"""Import orchestrator — runs all importers in dependency order.

Usage:
    from backend.importers.orchestrator import run_full_import
    run_full_import(
        masterfile_path="/data/SECG_Ultimate_Masterfile.xlsx",
        budget_dir="/data/budgets/",
        leads_path="/data/Leads__1_.xlsx",
        proposals_path="/data/LeadProposals__9_.xlsx",
        jobs_path="/data/Open_Jobs_Next_Steps_Quotes.xlsx",
    )
"""

import os
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.importers.base import ImportResult


logger = logging.getLogger("secg.import")


def run_full_import(
    masterfile_path: Optional[str] = None,
    budget_dir: Optional[str] = None,
    leads_path: Optional[str] = None,
    proposals_path: Optional[str] = None,
    jobs_path: Optional[str] = None,
    include_schedule: bool = True,
) -> dict[str, ImportResult]:
    """Execute all import steps in dependency order.

    Order matters — projects and vendors must exist before cost events,
    quotes, or milestones can reference them.

    Returns a dict of source_name → ImportResult.
    """
    batch_id = f"full_import_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    results = {}
    session = SessionLocal()

    try:
        print("=" * 60)
        print(f"SECG ERP Import Pipeline — Batch: {batch_id}")
        print("=" * 60)

        # ── Step 1: Masterfile (creates projects, vendors, employees, etc.) ──
        if masterfile_path and os.path.exists(masterfile_path):
            print("\n▸ Step 1: Importing Masterfile...")
            from backend.importers.masterfile import MasterfileImporter
            importer = MasterfileImporter(session, masterfile_path, batch_id)
            results["masterfile"] = importer.run()
            print(results["masterfile"].summary())
        else:
            print("\n▸ Step 1: Skipping Masterfile (not provided)")

        # ── Step 2: Open Jobs + Quotes (creates/validates project stubs) ─────
        if jobs_path and os.path.exists(jobs_path):
            print("\n▸ Step 2: Importing Open Jobs & Quotes...")
            from backend.importers.jobs import OpenJobsImporter
            importer = OpenJobsImporter(session, jobs_path, batch_id)
            results["open_jobs"] = importer.run()
            print(results["open_jobs"].summary())
        else:
            print("\n▸ Step 2: Skipping Open Jobs (not provided)")

        # ── Step 3: Budget CSVs (cost codes, SOV lines, draws) ───────────────
        if budget_dir and os.path.exists(budget_dir):
            print("\n▸ Step 3: Importing Budget CSVs...")
            from backend.importers.budgets import BudgetCSVBatchImporter
            importer = BudgetCSVBatchImporter(session, budget_dir, batch_id)
            results["budgets"] = importer.run()
            print(results["budgets"].summary())
        else:
            print("\n▸ Step 3: Skipping Budget CSVs (not provided)")

        # ── Step 4: Leads ────────────────────────────────────────────────────
        if leads_path and os.path.exists(leads_path):
            print("\n▸ Step 4: Importing Leads...")
            from backend.importers.leads import LeadsImporter
            importer = LeadsImporter(session, leads_path, batch_id)
            results["leads"] = importer.run()
            print(results["leads"].summary())
        else:
            print("\n▸ Step 4: Skipping Leads (not provided)")

        # ── Step 5: Lead Proposals ───────────────────────────────────────────
        if proposals_path and os.path.exists(proposals_path):
            print("\n▸ Step 5: Importing Lead Proposals...")
            from backend.importers.leads import ProposalsImporter
            importer = ProposalsImporter(session, proposals_path, batch_id)
            results["proposals"] = importer.run()
            print(results["proposals"].summary())
        else:
            print("\n▸ Step 5: Skipping Proposals (not provided)")

        # ── Step 6: Schedule (milestones from PDF data) ──────────────────────
        if include_schedule:
            print("\n▸ Step 6: Importing Schedule Milestones...")
            from backend.importers.schedule import ScheduleImporter
            importer = ScheduleImporter(session, batch_id)
            results["schedule"] = importer.run()
            print(results["schedule"].summary())
        else:
            print("\n▸ Step 6: Skipping Schedule")

        # ── Summary ──────────────────────────────────────────────────────────
        print("\n" + "=" * 60)
        print("IMPORT SUMMARY")
        print("=" * 60)
        total_created = sum(r.created for r in results.values())
        total_updated = sum(r.updated for r in results.values())
        total_skipped = sum(r.skipped for r in results.values())
        total_errors = sum(len(r.errors) for r in results.values())

        print(f"  Total created:  {total_created}")
        print(f"  Total updated:  {total_updated}")
        print(f"  Total skipped:  {total_skipped}")
        print(f"  Total errors:   {total_errors}")
        print(f"  Sources run:    {len(results)}")
        print("=" * 60)

    except Exception as e:
        logger.error(f"Import pipeline failed: {e}")
        session.rollback()
        raise
    finally:
        session.close()

    return results


def run_single_import(
    source: str,
    file_path: str,
    batch_id: Optional[str] = None,
) -> ImportResult:
    """Run a single importer by name.

    Useful for ad-hoc imports (e.g., a new Lowe's CSV, a BuilderTrend export).

    Args:
        source: One of 'masterfile', 'budgets', 'leads', 'proposals',
                'jobs', 'schedule'
        file_path: Path to the import file
        batch_id: Optional batch identifier
    """
    session = SessionLocal()
    batch_id = batch_id or f"{source}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    try:
        if source == "masterfile":
            from backend.importers.masterfile import MasterfileImporter
            importer = MasterfileImporter(session, file_path, batch_id)
        elif source == "budgets":
            from backend.importers.budgets import BudgetCSVBatchImporter
            importer = BudgetCSVBatchImporter(session, file_path, batch_id)
        elif source == "budget_single":
            from backend.importers.budgets import BudgetCSVImporter
            importer = BudgetCSVImporter(session, file_path, batch_id)
        elif source == "leads":
            from backend.importers.leads import LeadsImporter
            importer = LeadsImporter(session, file_path, batch_id)
        elif source == "proposals":
            from backend.importers.leads import ProposalsImporter
            importer = ProposalsImporter(session, file_path, batch_id)
        elif source == "jobs":
            from backend.importers.jobs import OpenJobsImporter
            importer = OpenJobsImporter(session, file_path, batch_id)
        elif source == "schedule":
            from backend.importers.schedule import ScheduleImporter
            importer = ScheduleImporter(session, batch_id)
        else:
            raise ValueError(f"Unknown source: {source}")

        result = importer.run()
        print(result.summary())
        return result

    finally:
        session.close()
