"""QuickBooks one-time migration scaffold.

Usage:
  python scripts/migrate_quickbooks.py --tenant-id 1 --dry-run
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.models.core import Project, Vendor
from backend.models.extended import CostEvent


class QuickBooksMigrator:
    def __init__(self, db: Session, tenant_id: int, dry_run: bool = False):
        self.db = db
        self.tenant_id = tenant_id
        self.dry_run = dry_run

        self.vendor_map: dict[str, int] = {}
        self.project_map: dict[str, int] = {}
        self.account_map: dict[str, str] = {}

    def run_full_migration(self, customer_map_path: Path, account_map_path: Path) -> None:
        self.load_mapping_files(customer_map_path, account_map_path)
        self.migrate_vendors()
        self.migrate_customers_to_projects()
        self.migrate_sample_cost_events()
        if self.dry_run:
            self.db.rollback()
            return
        self.db.commit()

    def load_mapping_files(self, customer_map_path: Path, account_map_path: Path) -> None:
        customer_map = json.loads(customer_map_path.read_text())
        account_map = json.loads(account_map_path.read_text())

        self.project_map = {
            qbo_id: payload["project_name"]
            for qbo_id, payload in customer_map.get("customer_to_project", {}).items()
        }
        self.account_map = {
            account_id: payload["cost_code"]
            for account_id, payload in account_map.get("account_to_cost_code", {}).items()
        }

    def migrate_vendors(self) -> None:
        # Placeholder until QBO OAuth client is wired.
        for name in ["Miller Concrete", "Carolina Framing"]:
            row = Vendor(name=name)
            self.db.add(row)
            self.db.flush()
            self.vendor_map[name] = row.id

    def migrate_customers_to_projects(self) -> None:
        for _, project_name in self.project_map.items():
            row = Project(code=f"MIG-{project_name[:6].upper()}", name=project_name)
            self.db.add(row)
            self.db.flush()

    def migrate_sample_cost_events(self) -> None:
        # Cost event pathway validation scaffold.
        project = self.db.query(Project).first()
        if not project:
            return
        self.db.add(
            CostEvent(
                tenant_id=self.tenant_id,
                project_id=project.id,
                cost_code_id=1,
                event_type="actual_cost",
                event_date=date(2026, 1, 1),
                amount=0,
                description="QBO migration scaffold record",
                source_type="migration",
                source_id=0,
                status="pending",
            )
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tenant-id", type=int, required=True)
    parser.add_argument("--customer-map", default="config/qb_customer_mapping.example.json")
    parser.add_argument("--account-map", default="config/qb_account_mapping.example.json")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    db = SessionLocal()
    try:
        migrator = QuickBooksMigrator(db=db, tenant_id=args.tenant_id, dry_run=args.dry_run)
        migrator.run_full_migration(Path(args.customer_map), Path(args.account_map))
        print("migration scaffold completed", {"dry_run": args.dry_run})
    finally:
        db.close()


if __name__ == "__main__":
    main()
