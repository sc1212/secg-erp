"""Admin API — database setup, file upload import, status."""

import os
import shutil
import tempfile
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
            detail="Pass ?confirm=yes-delete-everything to confirm.",
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


def _save_upload(upload, suffix=""):
    tmp = tempfile.mkdtemp(prefix="secg_import_")
    ext = os.path.splitext(upload.filename or "file")[1] or suffix
    path = os.path.join(tmp, "upload" + ext)
    with open(path, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return path


def _safe_result(result):
    d = {}
    d["created"] = getattr(result, "created", 0)
    d["updated"] = getattr(result, "updated", 0)
    d["skipped"] = getattr(result, "skipped", 0)
    errs = getattr(result, "errors", None)
    if errs:
        d["errors"] = list(errs[:20])
    else:
        d["errors"] = []
    return d


@router.post("/import/masterfile")
def import_masterfile(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="File must be .xlsx or .xlsm")
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.masterfile import MasterfileImporter
        importer = MasterfileImporter(db, path)
        result = importer.run()
        out = _safe_result(result)
        out["status"] = "complete"
        out["file"] = file.filename
        return out
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Import failed: " + str(e))
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)


@router.post("/import/budgets")
def import_budgets(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
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
        out = _safe_result(result)
        out["status"] = "complete"
        out["files_uploaded"] = len(files)
        return out
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Import failed: " + str(e))
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.post("/import/leads")
def import_leads(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.leads import LeadsImporter
        importer = LeadsImporter(db, path)
        result = importer.run()
        out = _safe_result(result)
        out["status"] = "complete"
        return out
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Import failed: " + str(e))
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)


@router.post("/import/proposals")
def import_proposals(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.leads import ProposalsImporter
        importer = ProposalsImporter(db, path)
        result = importer.run()
        out = _safe_result(result)
        out["status"] = "complete"
        return out
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Import failed: " + str(e))
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)


@router.post("/import/jobs")
def import_jobs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    Base.metadata.create_all(bind=engine)
    path = _save_upload(file, ".xlsx")
    try:
        from backend.importers.jobs import OpenJobsImporter
        importer = OpenJobsImporter(db, path)
        result = importer.run()
        out = _safe_result(result)
        out["status"] = "complete"
        return out
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Import failed: " + str(e))
    finally:
        shutil.rmtree(os.path.dirname(path), ignore_errors=True)
