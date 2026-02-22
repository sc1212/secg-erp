"""Financials API — debts, P&L, AR/AP aging, cash flow, retainage, properties.

GET  /api/financials/debts          → debt schedule
GET  /api/financials/pl             → P&L entries (filterable by division, period)
GET  /api/financials/ar             → accounts receivable (invoices)
GET  /api/financials/cash-forecast  → 13-week cash forecast
GET  /api/financials/retainage      → retainage tracker
GET  /api/financials/recurring      → recurring expenses
GET  /api/financials/properties     → property portfolio
GET  /api/financials/transactions   → cost events (all, paginated)
"""

from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import CostEvent, Invoice, InvoiceStatus
from backend.models.extended import (
    CashForecastLine, Debt, PLEntry, Property,
    RecurringExpense, RetainageEntry,
)
from backend.schemas import (
    CashForecastOut, CostEventOut, DebtOut, InvoiceOut,
    PLEntryOut, PaginatedResponse, PropertyOut,
    RecurringExpenseOut, RetainageOut,
)

router = APIRouter(prefix="/financials", tags=["Financials"])


@router.get("/debts", response_model=List[DebtOut])
def list_debts(
    active_only: bool = True,
    db: Session = Depends(get_db),
):
    """Debt schedule — all outstanding obligations."""
    q = db.query(Debt)
    if active_only:
        q = q.filter(Debt.is_active == True)
    debts = q.order_by(Debt.current_balance.desc()).all()
    return [DebtOut.model_validate(d) for d in debts]


@router.get("/pl", response_model=List[PLEntryOut])
def get_pl(
    division: Optional[str] = None,
    year: Optional[int] = Query(default=None),
    month: Optional[int] = Query(default=None, ge=1, le=12),
    db: Session = Depends(get_db),
):
    """P&L entries filterable by division and period."""
    year = year or date.today().year
    q = db.query(PLEntry).filter(PLEntry.period_year == year)
    if division:
        q = q.filter(PLEntry.division == division)
    if month:
        q = q.filter(PLEntry.period_month == month)
    entries = q.order_by(PLEntry.period_month, PLEntry.account_name).all()
    return [PLEntryOut.model_validate(e) for e in entries]


@router.get("/pl/summary")
def get_pl_summary(
    division: Optional[str] = None,
    year: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Summarized P&L by month — revenue, expenses, and net for charting."""
    year = year or date.today().year
    q = db.query(
        PLEntry.period_month,
        PLEntry.account_name,
        func.sum(PLEntry.amount),
    ).filter(PLEntry.period_year == year)

    if division:
        q = q.filter(PLEntry.division == division)

    rows = q.group_by(PLEntry.period_month, PLEntry.account_name).all()

    by_month: dict = {}
    for month, acct, total in rows:
        if month not in by_month:
            by_month[month] = {"month": month, "revenue": Decimal("0"),
                               "expenses": Decimal("0"), "net": Decimal("0")}
        amt = total or Decimal("0")
        acct_lower = (acct or "").lower()
        if "revenue" in acct_lower or "income" in acct_lower or amt > 0:
            by_month[month]["revenue"] += abs(amt)
        else:
            by_month[month]["expenses"] += abs(amt)

    for m in by_month.values():
        m["net"] = m["revenue"] - m["expenses"]

    return sorted(by_month.values(), key=lambda x: x["month"])


@router.get("/ar", response_model=List[InvoiceOut])
def get_ar(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Accounts receivable — outstanding invoices."""
    q = db.query(Invoice).filter(Invoice.balance > 0)
    if status:
        try:
            q = q.filter(Invoice.status == InvoiceStatus(status))
        except ValueError:
            pass
    invoices = q.order_by(Invoice.date_due.asc().nullslast()).all()
    return [InvoiceOut.model_validate(inv) for inv in invoices]


@router.get("/cash-forecast", response_model=List[CashForecastOut])
def get_cash_forecast(db: Session = Depends(get_db)):
    """13-week cash flow forecast."""
    lines = db.query(CashForecastLine).order_by(
        CashForecastLine.week_starting, CashForecastLine.category
    ).all()
    return [CashForecastOut.model_validate(l) for l in lines]


@router.get("/cash-forecast/weekly")
def get_cash_forecast_weekly(db: Session = Depends(get_db)):
    """Aggregated weekly cash forecast for charting."""
    rows = db.query(
        CashForecastLine.week_starting,
        func.sum(CashForecastLine.amount_in),
        func.sum(CashForecastLine.amount_out),
        func.sum(CashForecastLine.net),
    ).group_by(CashForecastLine.week_starting).order_by(
        CashForecastLine.week_starting
    ).all()

    return [
        {"week": str(w) if w else None, "inflows": float(i or 0),
         "outflows": float(o or 0), "net": float(n or 0)}
        for w, i, o, n in rows
    ]


@router.get("/retainage", response_model=List[RetainageOut])
def get_retainage(db: Session = Depends(get_db)):
    """Retainage tracker — lender-held and sub-owed."""
    entries = db.query(RetainageEntry).order_by(RetainageEntry.balance.desc()).all()
    return [RetainageOut.model_validate(e) for e in entries]


@router.get("/recurring", response_model=List[RecurringExpenseOut])
def get_recurring(
    active_only: bool = True,
    db: Session = Depends(get_db),
):
    """Recurring monthly expenses."""
    q = db.query(RecurringExpense)
    if active_only:
        q = q.filter(RecurringExpense.is_active == True)
    expenses = q.order_by(RecurringExpense.amount.desc()).all()
    return [RecurringExpenseOut.model_validate(e) for e in expenses]


@router.get("/properties", response_model=List[PropertyOut])
def get_properties(db: Session = Depends(get_db)):
    """Property portfolio."""
    props = db.query(Property).order_by(Property.address).all()
    return [PropertyOut.model_validate(p) for p in props]


@router.get("/transactions", response_model=PaginatedResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    source: Optional[str] = None,
    vendor_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """Paginated transaction log (all cost events)."""
    q = db.query(CostEvent)
    if source:
        q = q.filter(CostEvent.source == source)
    if vendor_id:
        q = q.filter(CostEvent.vendor_id == vendor_id)
    if start_date:
        q = q.filter(CostEvent.date >= start_date)
    if end_date:
        q = q.filter(CostEvent.date <= end_date)

    total = q.count()
    items = q.order_by(CostEvent.date.desc().nullslast()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return PaginatedResponse(
        total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
        items=[CostEventOut.model_validate(e) for e in items],
    )
