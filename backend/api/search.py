"""Global Search API — cross-entity search across the ERP.

GET  /api/search?q={query}  → grouped results from projects, vendors, employees,
                               invoices, and documents
"""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.core.database import engine
from backend.models.core import Document, Employee, Invoice, Project, Vendor
from backend.models.document_vault import VaultDocument

router = APIRouter(prefix="/search", tags=["Search"])

# Maximum results returned per entity type
_PER_ENTITY_LIMIT = 5


def _table_exists(table_name: str) -> bool:
    """Check whether a table exists in the database."""
    inspector = sa_inspect(engine)
    return table_name in inspector.get_table_names()


def _search_projects(db: Session, term: str) -> List[Dict[str, Any]]:
    """Search projects by name or code."""
    if not _table_exists("projects"):
        return []
    rows = (
        db.query(Project)
        .filter(Project.name.ilike(f"%{term}%") | Project.code.ilike(f"%{term}%"))
        .order_by(Project.code)
        .limit(_PER_ENTITY_LIMIT)
        .all()
    )
    return [{"id": r.id, "name": r.name, "code": r.code} for r in rows]


def _search_vendors(db: Session, term: str) -> List[Dict[str, Any]]:
    """Search vendors by name or trade."""
    if not _table_exists("vendors"):
        return []
    rows = (
        db.query(Vendor)
        .filter(Vendor.name.ilike(f"%{term}%") | Vendor.trade.ilike(f"%{term}%"))
        .order_by(Vendor.name)
        .limit(_PER_ENTITY_LIMIT)
        .all()
    )
    return [{"id": r.id, "name": r.name, "trade": r.trade} for r in rows]


def _search_employees(db: Session, term: str) -> List[Dict[str, Any]]:
    """Search employees by first name, last name, or role."""
    if not _table_exists("employees"):
        return []
    rows = (
        db.query(Employee)
        .filter(
            Employee.first_name.ilike(f"%{term}%")
            | Employee.last_name.ilike(f"%{term}%")
            | Employee.role.ilike(f"%{term}%")
        )
        .order_by(Employee.last_name, Employee.first_name)
        .limit(_PER_ENTITY_LIMIT)
        .all()
    )
    return [
        {
            "id": r.id,
            "name": f"{r.first_name} {r.last_name}",
            "role": r.role,
        }
        for r in rows
    ]


def _search_invoices(db: Session, term: str) -> List[Dict[str, Any]]:
    """Search invoices by invoice number."""
    if not _table_exists("invoices"):
        return []
    rows = (
        db.query(Invoice)
        .filter(Invoice.invoice_number.ilike(f"%{term}%"))
        .order_by(Invoice.invoice_number)
        .limit(_PER_ENTITY_LIMIT)
        .all()
    )
    return [
        {"id": r.id, "number": r.invoice_number, "amount": float(r.amount or 0)}
        for r in rows
    ]


def _search_documents(db: Session, term: str) -> List[Dict[str, Any]]:
    """Search vault documents by title or doc_type, falling back to the
    core documents table if the vault table does not exist yet."""
    if _table_exists("vault_documents"):
        rows = (
            db.query(VaultDocument)
            .filter(
                VaultDocument.title.ilike(f"%{term}%")
                | VaultDocument.doc_type.ilike(f"%{term}%")
            )
            .order_by(VaultDocument.title)
            .limit(_PER_ENTITY_LIMIT)
            .all()
        )
        return [{"id": r.id, "title": r.title, "doc_type": r.doc_type} for r in rows]

    if _table_exists("documents"):
        rows = (
            db.query(Document)
            .filter(
                Document.title.ilike(f"%{term}%")
                | Document.file_type.ilike(f"%{term}%")
            )
            .order_by(Document.title)
            .limit(_PER_ENTITY_LIMIT)
            .all()
        )
        return [
            {"id": r.id, "title": r.title, "doc_type": r.file_type} for r in rows
        ]

    return []


@router.get("")
def global_search(
    q: str = Query(..., min_length=2, description="Search term (min 2 characters)"),
    db: Session = Depends(get_db),
):
    """Search across projects, vendors, employees, invoices, and documents.

    Returns grouped results with up to 5 matches per entity type.
    """
    projects = _search_projects(db, q)
    vendors = _search_vendors(db, q)
    employees = _search_employees(db, q)
    invoices = _search_invoices(db, q)
    documents = _search_documents(db, q)

    total_count = (
        len(projects) + len(vendors) + len(employees)
        + len(invoices) + len(documents)
    )

    return {
        "query": q,
        "results": {
            "projects": projects,
            "vendors": vendors,
            "employees": employees,
            "invoices": invoices,
            "documents": documents,
        },
        "total_count": total_count,
    }
