"""Materials & Inventory models — track materials, stock levels, and transactions."""

from sqlalchemy import (
    Column, Date, ForeignKey,
    Integer, Numeric, String, Text,
)
from sqlalchemy.orm import relationship

from backend.core.database import Base
from backend.models.core import TimestampMixin


# ── Material Items (catalog) ────────────────────────────────────────────

class MaterialItem(TimestampMixin, Base):
    __tablename__ = "material_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    sku = Column(String(100))
    category = Column(String(100))  # Lumber, Plumbing, Electrical, Hardware, Concrete
    unit = Column(String(50))  # each, board_ft, sq_ft, linear_ft, bag, box, pallet
    default_unit_cost = Column(Numeric(10, 2))
    min_stock_alert = Column(Integer)
    notes = Column(Text)

    inventory_entries = relationship("InventoryEntry", back_populates="material")
    transactions = relationship("MaterialTransaction", back_populates="material")


# ── Inventory Entries (stock at a location) ─────────────────────────────

class InventoryEntry(TimestampMixin, Base):
    __tablename__ = "inventory_entries"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    material_id = Column(Integer, ForeignKey("material_items.id"), nullable=False)
    location_type = Column(String(30))  # jobsite, warehouse, vehicle
    location_id = Column(Integer)
    location_name = Column(String(200))
    quantity = Column(Numeric(10, 2))
    unit_cost = Column(Numeric(10, 2))
    last_counted_date = Column(Date)
    last_counted_by = Column(Integer, ForeignKey("employees.id"))

    material = relationship("MaterialItem", back_populates="inventory_entries")


# ── Material Transactions (movement ledger) ─────────────────────────────

class MaterialTransaction(TimestampMixin, Base):
    __tablename__ = "material_transactions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    material_id = Column(Integer, ForeignKey("material_items.id"), nullable=False)
    transaction_type = Column(String(30))  # ordered, received, used, transferred, returned, damaged, stolen, adjustment
    quantity = Column(Numeric(10, 2))
    unit_cost = Column(Numeric(10, 2))
    total_cost = Column(Numeric(12, 2))
    from_location = Column(String(200))
    to_location = Column(String(200))
    project_id = Column(Integer, ForeignKey("projects.id"))
    cost_code_id = Column(Integer, ForeignKey("cost_codes.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    po_number = Column(String(100))
    receipt_url = Column(Text)
    notes = Column(Text)
    logged_by = Column(Integer, ForeignKey("employees.id"))
    transaction_date = Column(Date)

    material = relationship("MaterialItem", back_populates="transactions")
