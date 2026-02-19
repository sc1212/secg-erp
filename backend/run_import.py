#!/usr/bin/env python3
"""CLI entry point for the SECG ERP import pipeline.

Usage:
    # Full import (all sources)
    python -m backend.run_import --all \\
        --masterfile /data/SECG_Ultimate_Masterfile.xlsx \\
        --budgets /data/budgets/ \\
        --leads /data/Leads__1_.xlsx \\
        --proposals /data/LeadProposals__9_.xlsx \\
        --jobs /data/Open_Jobs_Next_Steps_Quotes.xlsx

    # Single source import
    python -m backend.run_import --source leads --file /data/Leads__1_.xlsx

    # Budget CSVs only
    python -m backend.run_import --source budgets --file /data/budgets/
"""

import argparse
import logging
import sys


def main():
    parser = argparse.ArgumentParser(
        description="SECG ERP Data Import Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    # Mode selection
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--all", action="store_true",
                       help="Run full import pipeline with all sources")
    mode.add_argument("--source", type=str,
                       choices=["masterfile", "budgets", "budget_single",
                                "leads", "proposals", "jobs", "schedule"],
                       help="Run a single importer")

    # File paths
    parser.add_argument("--masterfile", type=str, help="Path to masterfile XLSX")
    parser.add_argument("--budgets", type=str, help="Directory with budget CSVs")
    parser.add_argument("--leads", type=str, help="Path to Leads XLSX")
    parser.add_argument("--proposals", type=str, help="Path to LeadProposals XLSX")
    parser.add_argument("--jobs", type=str, help="Path to Open Jobs XLSX")
    parser.add_argument("--file", type=str, help="File path for --source mode")

    # Options
    parser.add_argument("--no-schedule", action="store_true",
                         help="Skip schedule import")
    parser.add_argument("--verbose", "-v", action="store_true",
                         help="Enable debug logging")

    args = parser.parse_args()

    # Configure logging
    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    if args.all:
        from backend.importers.orchestrator import run_full_import
        results = run_full_import(
            masterfile_path=args.masterfile,
            budget_dir=args.budgets,
            leads_path=args.leads,
            proposals_path=args.proposals,
            jobs_path=args.jobs,
            include_schedule=not args.no_schedule,
        )
        # Exit with error code if any import had errors
        total_errors = sum(len(r.errors) for r in results.values())
        sys.exit(1 if total_errors > 0 else 0)

    elif args.source:
        if not args.file and args.source != "schedule":
            parser.error("--file is required when using --source")

        from backend.importers.orchestrator import run_single_import
        result = run_single_import(args.source, args.file or "")
        sys.exit(1 if result.errors else 0)


if __name__ == "__main__":
    main()
