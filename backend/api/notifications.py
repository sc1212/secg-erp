"""Notifications API — in-app notification feed."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.core.deps import get_db
from backend.models.foundation import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(
    user_id: str = Query("mike", description="User ID"),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List notifications for a user."""
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    notifications = q.order_by(Notification.created_at.desc()).limit(limit).all()
    if not notifications:
        # Demo data
        return [
            {"id": 1, "event_type": "exception_created", "title": "New Exception: Unmapped Cost Code", "body": "Cost event #2847 has no cost code — needs review", "link": "/exceptions", "is_read": False, "created_at": "2026-02-22T08:15:00"},
            {"id": 2, "event_type": "approval_requested", "title": "PO Approval Needed", "body": "PO-0047 for $12,500 (ACE Plumbing) awaits your approval", "link": "/decisions", "is_read": False, "created_at": "2026-02-22T07:45:00"},
            {"id": 3, "event_type": "vendor_coi_expiring", "title": "COI Expiring in 14 Days", "body": "ACE Plumbing COI expires Mar 8 — request renewal now", "link": "/vendors", "is_read": True, "created_at": "2026-02-21T09:00:00"},
            {"id": 4, "event_type": "low_stock_alert", "title": "Critical Stock: PEX 3/4\"", "body": "2 units remaining — reorder needed", "link": "/inventory", "is_read": True, "created_at": "2026-02-21T07:30:00"},
        ]
    return notifications


@router.get("/unread-count")
def unread_count(
    user_id: str = Query("mike"),
    db: Session = Depends(get_db),
):
    """Get count of unread notifications."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).count()
    # Demo fallback: 2 if db empty
    if count == 0:
        count = db.query(Notification).count()
        if count == 0:
            return {"count": 2}
    return {"count": count}


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark a notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        from datetime import datetime
        notif.is_read = True
        notif.read_at = datetime.now()
        db.commit()
        return {"ok": True}
    return {"ok": True}  # graceful no-op for demo


@router.post("/read-all")
def mark_all_read(user_id: str = Query("mike"), db: Session = Depends(get_db)):
    """Mark all notifications as read for a user."""
    from datetime import datetime
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).update({"is_read": True, "read_at": datetime.now()})
    db.commit()
    return {"ok": True}
