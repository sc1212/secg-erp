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


# ── Database Setup ───────────────────────────────────────────────────────

@router.post("/setup")
def setup_database():
    """Create all tables. Safe to call multiple times — only creates missing tables."""
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return {"status": "ok", "tables_created": len(tables), "tables": sorted(tables)}


@router.post("/reset")
def reset_database(confirm: str = ""):
    """Drop ALL tables and recreate. Requires confirm='yes-delete-everything'."""
    if confirm != "yes-delete-everything":
        raise HTTPException(
            status_code=400,
            detail="Pass ?confirm=yes-delete-everything to confirm. This deletes ALL data.",
        )
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    return {"status": "reset complete", "tables": sorted(inspector.get_table_names())}


# ── Status ───────────────────────────────────────────────────────────────

@router.get("/status")
def database_status(db: Session = Depends(get_db)):
    """Row counts for every table — quick health check."""
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


# ── File Upload + Import ─────────────────────────────────────────────────

def _save_upload(upload: UploadFile, suffix: str = "") -> str:
    """Save uploaded file to temp directory, return path."""
    tmp = tempfile.mkdtemp(prefix="secg_import_")
    ext = os.path.splitext(upload.filename or "file")[1] or suffix
    path = os.path.join(tmp, f"upload{ext}")
    with open(path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return path


@router.post("/import/masterfile")
def import_masterfile(
    file: UploadFile = File(..., description="SECG_Ultimate_Masterfile.xlsx"),
    db: Session = Depends(get_db),
):
    """Upload the masterfile XLSX and import all 28 tabs into the database.

    This is the primary import — run this first, then layer on budget CSVs,
    leads, proposals, and jobs.
    """
    if not file.filename or not file.filename.endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="File must be .xlsx or .xlsm")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.masterfile import MasterfileImporter
        importer = MasterfileImporter(db, path)
        result = importer.run()
        return {
            "status": "complete",
            "file": file.filename,
            "created": result.created,
            "updated": result.updated,
            "skipped": result.skipped,
            "errors": result.errors[:20],  # cap at 20
            "duration_seconds": result.duration,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)


@router.post("/import/budgets")
def import_budgets(
    files: List[UploadFile] = File(..., description="Budget CSV files (one per project)"),
    db: Session = Depends(get_db),
):
    """Upload one or more budget CSV files (construction loan draw schedules)."""
    Base.metadata.create_all(bind=engine)
    tmp_dir = tempfile.mkdtemp(prefix="secg_budgets_")

    try:
        for f in files:
            if not f.filename:
                continue
            dest = os.path.join(tmp_dir, f.filename)
            with open(dest, "wb") as out:
                shutil.copyfileobj(f.file, out)

        from backend.importers.budgets import BudgetCSVBatchImporter
        importer = BudgetCSVBatchImporter(db, tmp_dir)
        result = importer.run()
        return {
            "status": "complete",
            "files_uploaded": len(files),
            "created": result.created,
            "updated": result.updated,
            "skipped": result.skipped,
            "errors": result.errors[:20],
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.post("/import/leads")
def import_leads(
    file: UploadFile = File(..., description="Leads__1_.xlsx from BuilderTrend"),
    db: Session = Depends(get_db),
):
    """Upload BuilderTrend leads export."""
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.leads import LeadsImporter
        importer = LeadsImporter(db, path)
        result = importer.run()
        return {
            "status": "complete",
            "created": result.created,
            "skipped": result.skipped,
            "errors": result.errors[:20],
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)


@router.post("/import/proposals")
def import_proposals(
    file: UploadFile = File(..., description="LeadProposals__9_.xlsx from BuilderTrend"),
    db: Session = Depends(get_db),
):
    """Upload BuilderTrend proposals export."""
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.leads import ProposalsImporter
        importer = ProposalsImporter(db, path)
        result = importer.run()
        return {
            "status": "complete",
            "created": result.created,
            "skipped": result.skipped,
            "errors": result.errors[:20],
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)


@router.post("/import/jobs")
def import_jobs(
    file: UploadFile = File(..., description="Open_Jobs_Next_Steps_Quotes.xlsx"),
    db: Session = Depends(get_db),
):
    """Upload open jobs and quotes workbook."""
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.jobs import OpenJobsImporter
        importer = OpenJobsImporter(db, path)
        result = importer.run()
        return {
            "status": "complete",
            "created": result.created,
            "updated": result.updated,
            "skipped": result.skipped,
            "errors": result.errors[:20],
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)
