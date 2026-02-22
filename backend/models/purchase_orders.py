"""Purchase Orders, Draw Requests models."""

from datetime import date
from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Integer,
    Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship
from backend.core.database import Base


class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class PurchaseOrder(TimestampMixin, Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True)
    po_number = Column(String(50), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    description = Column(Text)
    status = Column(String(20), default="draft")  # draft, issued, partial, received, closed, voided
    subtotal = Column(Numeric(14, 2), default=0)
    tax = Column(Numeric(14, 2), default=0)
    shipping = Column(Numeric(14, 2), default=0)
    total = Column(Numeric(14, 2), default=0)
    issued_date = Column(Date)
    expected_date = Column(Date)
    received_date = Column(Date)
    approval_request_id = Column(Integer, ForeignKey("approval_requests.id"))
    created_by = Column(String(100))
    notes = Column(Text)

    project = relationship("Project")
    vendor = relationship("Vendor")
    lines = relationship("PurchaseOrderLine", back_populates="purchase_order")


class PurchaseOrderLine(TimestampMixin, Base):
    __tablename__ = "purchase_order_lines"

    id = Column(Integer, primary_key=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    line_number = Column(Integer, nullable=False, default=1)
    description = Column(String(500))
    quantity = Column(Numeric(10, 3), default=1)
    unit = Column(String(50))
    unit_cost = Column(Numeric(14, 2), default=0)
    total_cost = Column(Numeric(14, 2), default=0)
    notes = Column(Text)

    purchase_order = relationship("PurchaseOrder", back_populates="lines")


class DrawRequest(TimestampMixin, Base):
    __tablename__ = "draw_requests"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    draw_number = Column(Integer, nullable=False)
    requested_by = Column(String(100))
    amount_requested = Column(Numeric(14, 2), default=0)
    amount_approved = Column(Numeric(14, 2), default=0)
    status = Column(String(20), default="draft")  # draft, submitted, approved, funded, rejected
    submitted_date = Column(Date)
    approved_date = Column(Date)
    funded_date = Column(Date)
    lender = Column(String(200))
    approval_request_id = Column(Integer, ForeignKey("approval_requests.id"))
    notes = Column(Text)

    project = relationship("Project")
    line_items = relationship("DrawLineItem", back_populates="draw_request")


class DrawLineItem(TimestampMixin, Base):
    __tablename__ = "draw_line_items"

    id = Column(Integer, primary_key=True)
    draw_request_id = Column(Integer, ForeignKey("draw_requests.id"), nullable=False)
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    description = Column(String(500))
    amount = Column(Numeric(14, 2), default=0)
    notes = Column(Text)

    draw_request = relationship("DrawRequest", back_populates="line_items")
