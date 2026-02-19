"""Admin API — database setup, file upload import, status.

POST /api/admin/setup           → create all tables
POST /api/admin/import/masterfile → upload XLSX, run full import
POST /api/admin/import/budgets   → upload budget CSVs
POST /api/admin/import/leads     → upload BuilderTrend leads XLSX
POST /api/admin/import/proposals → upload BuilderTrend proposals XLSX
POST /api/admin/import/jobs      → upload Open Jobs workbook
GET  /api/admin/status           → database row counts
POST /api/admin/reset            → drop and recreate all tables (careful!)
"""

import os
import shutil
import tempfile
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from backend.core.database import Base, engine
from backend.core.deps import get_db

router = APIRouter(prefix="/admin", tags=["Admin & Import"])


@router.post("/setup")
def setup_database():
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return {"status": "ok", "tables_created": len(tables), "tables": sorted(tables)}


@router.post("/reset")
def reset_database(confirm: str = ""):
    if confirm != "yes-delete-everything":
        raise HTTPException(
            status_code=400,
            detail="Pass ?confirm=yes-delete-everything to confirm. This deletes ALL data.",
        )
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    return {"status": "reset complete", "tables": sorted(inspector.get_table_names())}


@router.get("/status")
def database_status(db: Session = Depends(get_db)):
    inspector = inspect(engine)
    tables = sorted(inspector.get_table_names())
    counts = {}
    total = 0
    for t in tables:
        try:
            n = db.execute(text(f'SELECT COUNT(*) FROM "{t}"')).scalar()
            if n > 0:
                counts[t] = n
                total += n
        except Exception:
            counts[t] = "error"
    return {"total_rows": total, "tables_with_data": len(counts), "counts": counts}


def _save_upload(upload: UploadFile, suffix: str = "") -> str:
    tmp = tempfile.mkdtemp(prefix="secg_import_")
    ext = os.path.splitext(upload.filename or "file")[1] or suffix
    path = os.path.join(tmp, f"upload{ext}")
    with open(path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return path


def _result_to_dict(result):
    out = {"created": 0, "updated": 0, "skipped": 0, "errors": []}
    if hasattr(result, "created"):
        out["created"] = result.created
    if hasattr(result, "updated"):
        out["updated"] = result.updated
    if hasattr(result, "skipped"):
        out["skipped"] = result.skipped
    if hasattr(result, "errors"):
        out["errors"] = result.errors[:20] if result.
