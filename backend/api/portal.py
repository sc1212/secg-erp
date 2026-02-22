"""Client Portal API — client-facing project views, shared content, selections."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import Project

router = APIRouter(prefix="/portal", tags=["Client Portal"])


@router.get("/clients")
def list_portal_clients(db: Session = Depends(get_db)):
    """List all clients with portal access and their project summaries."""
    # Demo data — real implementation would pull from a ClientPortalUser model
    return [
        {
            "id": 1, "name": "Thompson Family",
            "project": "Custom Home — Brentwood", "project_code": "PRJ-042", "project_id": 1,
            "status": "active", "last_login": "2026-02-21", "portal_enabled": True,
            "shared_photos": 47, "shared_documents": 12, "pending_selections": 3,
            "milestones_visible": 8, "milestones_complete": 5,
            "next_milestone": "Cabinet Installation — Mar 5",
            "unread_messages": 2,
        },
        {
            "id": 2, "name": "Rivera Family",
            "project": "Spec Home — Franklin", "project_code": "PRJ-038", "project_id": 2,
            "status": "active", "last_login": "2026-02-19", "portal_enabled": True,
            "shared_photos": 23, "shared_documents": 8, "pending_selections": 0,
            "milestones_visible": 6, "milestones_complete": 4,
            "next_milestone": "Drywall Finish — Feb 28",
            "unread_messages": 0,
        },
        {
            "id": 3, "name": "Johnson",
            "project": "Remodel — Green Hills", "project_code": "PRJ-051", "project_id": 3,
            "status": "active", "last_login": "2026-02-14", "portal_enabled": False,
            "shared_photos": 0, "shared_documents": 0, "pending_selections": 5,
            "milestones_visible": 4, "milestones_complete": 1,
            "next_milestone": "Demo Complete — Feb 25",
            "unread_messages": 1,
        },
    ]


@router.get("/clients/{client_id}")
def get_portal_client(client_id: int, db: Session = Depends(get_db)):
    """Get detailed portal view for a specific client."""
    clients = list_portal_clients(db)
    for c in clients:
        if c["id"] == client_id:
            return c
    raise HTTPException(404, "Client not found")
