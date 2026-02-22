"""Pydantic schemas for Document Vault endpoints."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class VaultDocumentOut(OrmBase):
    id: int
    project_id: Optional[int] = None
    vendor_id: Optional[int] = None
    employee_id: Optional[int] = None
    title: str
    doc_type: str
    file_url: str
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_by: Optional[int] = None
    expiry_date: Optional[date] = None
    tags: Optional[str] = None
    version: int = 1
    parent_id: Optional[int] = None
    status: str = "active"
    created_at: Optional[datetime] = None


class VaultDocumentCreate(BaseModel):
    project_id: Optional[int] = None
    vendor_id: Optional[int] = None
    employee_id: Optional[int] = None
    title: str
    doc_type: str
    file_url: str
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_by: Optional[int] = None
    expiry_date: Optional[date] = None
    tags: Optional[str] = None


class VaultDocumentUpdate(BaseModel):
    title: Optional[str] = None
    doc_type: Optional[str] = None
    expiry_date: Optional[date] = None
    tags: Optional[str] = None
    status: Optional[str] = None


class DocTypeCount(BaseModel):
    doc_type: str
    count: int
