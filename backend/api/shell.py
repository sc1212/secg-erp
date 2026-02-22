from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import Employee, Project, Vendor
from backend.models.extended import Document, Notification

router = APIRouter(tags=["Shell"])


@router.get("/search")
def global_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=5, ge=1, le=25),
    types: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    wanted = set((types or "projects,vendors,employees,documents").split(","))
    query = f"%{q}%"
    results: dict[str, list[dict]] = {}

    if "projects" in wanted:
        rows = (
            db.query(Project)
            .filter(or_(Project.name.ilike(query), Project.code.ilike(query), Project.address.ilike(query)))
            .limit(limit)
            .all()
        )
        results["projects"] = [
            {
                "id": r.id,
                "type": "project",
                "title": r.name,
                "subtitle": f"{r.code} · {r.status.value if r.status else 'unknown'}",
                "url": f"/projects/{r.id}",
            }
            for r in rows
        ]

    if "vendors" in wanted:
        rows = db.query(Vendor).filter(Vendor.name.ilike(query)).limit(limit).all()
        results["vendors"] = [
            {
                "id": r.id,
                "type": "vendor",
                "title": r.name,
                "subtitle": r.trade or "Vendor",
                "url": f"/vendors?vendor_id={r.id}",
            }
            for r in rows
        ]

    if "employees" in wanted:
        rows = (
            db.query(Employee)
            .filter(or_(Employee.first_name.ilike(query), Employee.last_name.ilike(query), Employee.email.ilike(query)))
            .limit(limit)
            .all()
        )
        results["employees"] = [
            {
                "id": r.id,
                "type": "employee",
                "title": f"{r.first_name} {r.last_name}",
                "subtitle": r.role or "Team",
                "url": "/team",
            }
            for r in rows
        ]

    if "documents" in wanted:
        rows = db.query(Document).filter(Document.title.ilike(query)).limit(limit).all()
        results["documents"] = [
            {
                "id": r.id,
                "type": "document",
                "title": r.title,
                "subtitle": r.doc_type,
                "url": f"/documents?document_id={r.id}",
            }
            for r in rows
        ]

    total = sum(len(v) for v in results.values())
    return {"query": q, "total": total, "results": results}


@router.get("/notifications")
def get_notifications(
    status: str = Query(default="all"),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Notification)
    if status == "unread":
        q = q.filter(Notification.is_read.is_(False))
    rows = q.order_by(Notification.created_at.desc()).limit(limit).all()
    unread_count = db.query(Notification).filter(Notification.is_read.is_(False)).count()
    return {
        "unread_count": unread_count,
        "items": [
            {
                "id": r.id,
                "title": r.title,
                "body": r.body,
                "priority": r.priority,
                "category": r.category,
                "action_url": r.action_url,
                "is_read": r.is_read,
                "created_at": r.created_at,
            }
            for r in rows
        ],
    }


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    row = db.query(Notification).filter(Notification.id == notification_id).first()
    if not row:
        return {"ok": False}
    row.is_read = True
    db.commit()
    return {"ok": True}


@router.patch("/notifications/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()
    return {"ok": True}
