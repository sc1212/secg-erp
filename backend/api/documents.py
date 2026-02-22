"""Document Vault API — CRUD, search, expiry alerts."""

from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.document_vault import VaultDocument
from backend.schemas.document_vault import (
    VaultDocumentOut, VaultDocumentCreate, VaultDocumentUpdate, DocTypeCount,
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=list[VaultDocumentOut])
def list_documents(
    project_id: Optional[int] = None,
    vendor_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    doc_type: Optional[str] = None,
    search: Optional[str] = None,
    status: str = "active",
    db: Session = Depends(get_db),
):
    """List documents with filters."""
    q = db.query(VaultDocument).filter(VaultDocument.status == status)

    if project_id:
        q = q.filter(VaultDocument.project_id == project_id)
    if vendor_id:
        q = q.filter(VaultDocument.vendor_id == vendor_id)
    if employee_id:
        q = q.filter(VaultDocument.employee_id == employee_id)
    if doc_type:
        q = q.filter(VaultDocument.doc_type == doc_type)
    if search:
        q = q.filter(
            VaultDocument.title.ilike(f"%{search}%")
            | VaultDocument.tags.ilike(f"%{search}%")
        )

    docs = q.order_by(VaultDocument.created_at.desc()).limit(200).all()
    return [VaultDocumentOut.model_validate(d) for d in docs]


@router.get("/types", response_model=list[DocTypeCount])
def document_type_counts(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Get document counts per type (for folder view)."""
    q = db.query(
        VaultDocument.doc_type,
        func.count(VaultDocument.id).label("count"),
    ).filter(VaultDocument.status == "active")

    if project_id:
        q = q.filter(VaultDocument.project_id == project_id)

    q = q.group_by(VaultDocument.doc_type).order_by(VaultDocument.doc_type)
    return [DocTypeCount(doc_type=row[0], count=row[1]) for row in q.all()]


@router.get("/expiring")
def expiring_documents(
    days: int = Query(30, ge=1, le=180),
    db: Session = Depends(get_db),
):
    """Documents with expiry dates coming up."""
    cutoff = date.today() + timedelta(days=days)
    docs = (
        db.query(VaultDocument)
        .filter(
            VaultDocument.expiry_date != None,
            VaultDocument.expiry_date <= cutoff,
            VaultDocument.status == "active",
        )
        .order_by(VaultDocument.expiry_date)
        .all()
    )
    return [VaultDocumentOut.model_validate(d) for d in docs]


@router.get("/{doc_id}", response_model=VaultDocumentOut)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    """Get a single document."""
    doc = db.query(VaultDocument).filter(VaultDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    return VaultDocumentOut.model_validate(doc)


@router.post("", response_model=VaultDocumentOut, status_code=201)
def create_document(payload: VaultDocumentCreate, db: Session = Depends(get_db)):
    """Upload/register a new document."""
    doc = VaultDocument(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return VaultDocumentOut.model_validate(doc)


@router.patch("/{doc_id}", response_model=VaultDocumentOut)
def update_document(doc_id: int, payload: VaultDocumentUpdate, db: Session = Depends(get_db)):
    """Update document metadata."""
    doc = db.query(VaultDocument).filter(VaultDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)

    db.commit()
    db.refresh(doc)
    return VaultDocumentOut.model_validate(doc)


@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    """Soft-delete (archive) a document."""
    doc = db.query(VaultDocument).filter(VaultDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    doc.status = "archived"
    db.commit()
