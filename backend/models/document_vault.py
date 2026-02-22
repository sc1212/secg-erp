"""Document Vault models — extends the existing Document model with vault features."""

from sqlalchemy import (
    Column, Date, ForeignKey,
    Integer, String, Text,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


class VaultDocument(TimestampMixin, Base):
    """Enhanced document model for the Document Vault module."""
    __tablename__ = "vault_documents"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))

    title = Column(String(300), nullable=False)
    doc_type = Column(String(50), nullable=False)  # contract, plans, permit, coi, lien_waiver,
    # inspection_report, photo, change_order, draw_package, proposal, w9, invoice,
    # warranty, punch_list, safety_report, other

    file_url = Column(Text, nullable=False)
    file_name = Column(String(300))
    file_size_bytes = Column(Integer)
    mime_type = Column(String(100))
    uploaded_by = Column(Integer, ForeignKey("employees.id"))

    expiry_date = Column(Date)  # For COIs, permits, licenses
    tags = Column(Text)         # Comma-separated tags for search

    version = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey("vault_documents.id"))  # Version chains
    status = Column(String(20), default="active")  # active, archived, superseded
