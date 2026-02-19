"""Base importer with shared utilities for logging, dedup, and batch ops."""

import hashlib
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Optional

from sqlalchemy.orm import Session

from backend.models.core import AuditLog
from backend.models.extended import DataSource


logger = logging.getLogger("secg.import")


class ImportResult:
    """Tracks the outcome of an import run."""

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.created = 0
        self.updated = 0
        self.skipped = 0
        self.errors: list[str] = []
        self.started_at = datetime.utcnow()
        self.finished_at: Optional[datetime] = None

    def finish(self):
        self.finished_at = datetime.utcnow()

    @property
    def total_processed(self) -> int:
        return self.created + self.updated + self.skipped

    def summary(self) -> str:
        elapsed = ""
        if self.finished_at:
            secs = (self.finished_at - self.started_at).total_seconds()
            elapsed = f" in {secs:.1f}s"
        lines = [
            f"[{self.source_name}] Import complete{elapsed}",
            f"  Created: {self.created}",
            f"  Updated: {self.updated}",
            f"  Skipped: {self.skipped}",
            f"  Errors:  {len(self.errors)}",
        ]
        if self.errors:
            for e in self.errors[:10]:
                lines.append(f"    ⚠ {e}")
            if len(self.errors) > 10:
                lines.append(f"    ... and {len(self.errors) - 10} more")
        return "\n".join(lines)


class BaseImporter:
    """Common import functionality. Subclass and implement `run()`."""

    source_name: str = "unknown"
    source_type: str = "csv_import"

    def __init__(self, session: Session, batch_id: Optional[str] = None):
        self.session = session
        self.batch_id = batch_id or self._generate_batch_id()
        self.result = ImportResult(self.source_name)

    def run(self) -> ImportResult:
        """Override in subclass. Should call self.result.finish() when done."""
        raise NotImplementedError

    # ── Utilities ────────────────────────────────────────────────────────

    def _generate_batch_id(self) -> str:
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        return f"{self.source_name}_{ts}"

    @staticmethod
    def clean_currency(value: Any) -> Decimal:
        """Parse a currency string like '$1,234.56' into a Decimal."""
        if value is None or value == "":
            return Decimal("0")
        if isinstance(value, (int, float)):
            return Decimal(str(value))
        if isinstance(value, Decimal):
            return value
        s = str(value).strip().replace("$", "").replace(",", "").replace(" ", "")
        if s == "" or s == "-":
            return Decimal("0")
        try:
            return Decimal(s)
        except InvalidOperation:
            return Decimal("0")

    @staticmethod
    def clean_string(value: Any, max_length: int = 300) -> Optional[str]:
        """Clean and truncate a string value."""
        if value is None:
            return None
        s = str(value).strip()
        if s == "" or s.lower() == "none":
            return None
        return s[:max_length]

    @staticmethod
    def clean_int(value: Any) -> int:
        """Parse a value into an integer, defaulting to 0."""
        if value is None or value == "":
            return 0
        try:
            return int(float(str(value).strip().replace(",", "")))
        except (ValueError, TypeError):
            return 0

    @staticmethod
    def clean_date(value: Any) -> Optional[datetime]:
        """Attempt to parse various date formats."""
        if value is None or value == "":
            return None
        if isinstance(value, datetime):
            return value.date() if hasattr(value, "date") else value
        s = str(value).strip()
        for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m-%d-%Y", "%m/%d/%y", "%Y-%m-%dT%H:%M:%S"):
            try:
                return datetime.strptime(s, fmt).date()
            except ValueError:
                continue
        return None

    @staticmethod
    def clean_bool(value: Any) -> bool:
        """Parse yes/no/true/false into boolean."""
        if value is None:
            return False
        s = str(value).strip().lower()
        return s in ("yes", "true", "1", "y", "x")

    def log_data_source(self, record_count: int, status: str = "completed"):
        """Record this import run in the data_sources table."""
        ds = DataSource(
            name=self.batch_id,
            source_type=self.source_type,
            last_sync_at=datetime.utcnow(),
            record_count=record_count,
            status=status,
        )
        self.session.add(ds)

    def log_audit(self, table_name: str, record_id: int, action: str = "INSERT",
                  field_name: str = None, old_value: str = None,
                  new_value: str = None, changed_by: str = "import_pipeline"):
        """Write an audit log entry."""
        entry = AuditLog(
            table_name=table_name,
            record_id=record_id,
            action=action,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            changed_by=changed_by,
        )
        self.session.add(entry)

    def get_or_create_vendor(self, name: str) -> int:
        """Find a vendor by name or create a stub. Returns vendor ID."""
        from backend.models.core import Vendor
        name_clean = self.clean_string(name)
        if not name_clean:
            return None
        existing = self.session.query(Vendor).filter(
            Vendor.name == name_clean
        ).first()
        if existing:
            return existing.id
        vendor = Vendor(name=name_clean)
        self.session.add(vendor)
        self.session.flush()
        return vendor.id

    def get_or_create_project(self, code: str, name: str = None,
                               **kwargs) -> int:
        """Find a project by code or create a stub. Returns project ID."""
        from backend.models.core import Project
        code_clean = self.clean_string(code, 20)
        if not code_clean:
            return None
        existing = self.session.query(Project).filter(
            Project.code == code_clean
        ).first()
        if existing:
            return existing.id
        project = Project(
            code=code_clean,
            name=name or code_clean,
            **kwargs,
        )
        self.session.add(project)
        self.session.flush()
        return project.id
