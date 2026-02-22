from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.extended import Document, SystemEvent
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


class DocumentCreateIn(BaseModel):
    title: str
    doc_type: str
    file_url: str
    project_id: int | None = None
    vendor_id: int | None = None
    employee_id: int | None = None
    file_size_bytes: int | None = None
    mime_type: str | None = None
    expiry_date: date | None = None
    tags: str | None = None
    uploaded_by: int | None = None
    notes: str | None = None


class DocumentUpdateIn(BaseModel):
    title: str | None = None
    doc_type: str | None = None
    file_url: str | None = None
    expiry_date: date | None = None
    tags: str | None = None
    status: str | None = None
    notes: str | None = None


def _resolve_tenant_id(x_tenant_id: int | None) -> int:
    return x_tenant_id or 1


def _infer_doc_type(filename: str) -> str:
    lower = filename.lower()
    if "coi" in lower or "insurance" in lower:
        return "coi"
    if "w9" in lower:
        return "w9"
    if "permit" in lower:
        return "permit"
    if any(lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif"]):
        return "photo"
    if "plan" in lower or "spec" in lower:
        return "plans"
    if "contract" in lower:
        return "contract"
    if "invoice" in lower:
        return "invoice"
    return "document"


def _publish_event(db: Session, *, tenant_id: int, event_type: str, source_id: int) -> None:
    db.add(
        SystemEvent(
            tenant_id=tenant_id,
            event_type=event_type,
            source_type="document",
            source_id=source_id,
            processed=False,
        )
    )


@router.get("")
def list_documents(
    project_id: int | None = Query(default=None),
    vendor_id: int | None = Query(default=None),
    employee_id: int | None = Query(default=None),
    doc_type: str | None = Query(default=None),
    status: str | None = Query(default=None),
    expiry_before: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(Document)
    if project_id:
        q = q.filter(Document.project_id == project_id)
    if vendor_id:
        q = q.filter(Document.vendor_id == vendor_id)
    if employee_id:
        q = q.filter(Document.employee_id == employee_id)
    if doc_type:
        q = q.filter(Document.doc_type == doc_type)
    if status:
        q = q.filter(Document.status == status)
    if expiry_before:
        q = q.filter(Document.expiry_date <= expiry_before)

    rows = q.order_by(Document.created_at.desc()).all()
    return {"items": [_serialize(r) for r in rows]}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_tenant_id: int | None = Header(default=None),
):
    tenant_id = _resolve_tenant_id(x_tenant_id)
    uploads = Path("frontend/public/uploads")
    uploads.mkdir(parents=True, exist_ok=True)
    target = uploads / file.filename
    content = await file.read()
    target.write_bytes(content)
    row = Document(
        tenant_id=tenant_id,
        title=file.filename,
        doc_type=_infer_doc_type(file.filename),
        file_url=f"/uploads/{file.filename}",
        file_size_bytes=len(content),
        mime_type=file.content_type,
        status="active",
    )
    db.add(row)
    db.flush()
    _publish_event(db, tenant_id=tenant_id, event_type="document.uploaded", source_id=row.id)
    db.commit()
    db.refresh(row)
    return _serialize(row)


@router.post("")
def create_document(
    payload: DocumentCreateIn,
    db: Session = Depends(get_db),
    x_tenant_id: int | None = Header(default=None),
):
    tenant_id = _resolve_tenant_id(x_tenant_id)
    row = Document(
        tenant_id=tenant_id,
        project_id=payload.project_id,
        vendor_id=payload.vendor_id,
        employee_id=payload.employee_id,
        title=payload.title,
        doc_type=payload.doc_type,
        file_url=payload.file_url,
        file_size_bytes=payload.file_size_bytes,
        mime_type=payload.mime_type,
        expiry_date=payload.expiry_date,
        tags=payload.tags,
        uploaded_by=payload.uploaded_by,
        notes=payload.notes,
    )
    db.add(row)
    db.flush()
    _publish_event(db, tenant_id=tenant_id, event_type="document.created", source_id=row.id)
    db.commit()
    db.refresh(row)
    return _serialize(row)


@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    row = db.query(Document).filter(Document.id == document_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return _serialize(row)


@router.patch("/{document_id}")
def update_document(document_id: int, payload: DocumentUpdateIn, db: Session = Depends(get_db)):
    row = db.query(Document).filter(Document.id == document_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")

    for field in ["title", "doc_type", "file_url", "expiry_date", "tags", "status", "notes"]:
        value = getattr(payload, field)
        if value is not None:
            setattr(row, field, value)

    db.flush()
    _publish_event(db, tenant_id=row.tenant_id, event_type="document.updated", source_id=row.id)
    db.commit()
    db.refresh(row)
    return _serialize(row)


def _serialize(row: Document) -> dict:
    return {
        "id": row.id,
        "tenant_id": row.tenant_id,
        "project_id": row.project_id,
        "vendor_id": row.vendor_id,
        "employee_id": row.employee_id,
        "title": row.title,
        "doc_type": row.doc_type,
        "file_url": row.file_url,
        "file_size_bytes": row.file_size_bytes,
        "mime_type": row.mime_type,
        "expiry_date": row.expiry_date,
        "tags": row.tags,
        "version": row.version,
        "parent_id": row.parent_id,
        "status": row.status,
        "uploaded_by": row.uploaded_by,
        "notes": row.notes,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }
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
