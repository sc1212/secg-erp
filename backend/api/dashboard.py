"""Dashboard API — aggregated KPIs, cash position, alerts.

GET /api/dashboard  → full command center summary
"""

from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.models.core import (
    ChangeOrder, ChangeOrderStatus, Invoice, InvoiceStatus,
    PayApp, Project, ProjectStatus, Vendor,
)
from backend.models.extended import (
    BidPipeline, BidStatus, CashSnapshot, Debt, DebtType,
    LienWaiver, PayrollCalendar, PayrollEntry, RecurringExpense,
    RetainageEntry,
)
from backend.schemas import (
    AlertOut, CashPositionOut, DashboardOut, DebtSummaryOut,
    PipelineSummaryOut, PayrollSummaryOut, ProjectSummaryOut,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    """Executive command center — all KPIs in one call."""

    # ── Cash Position ────────────────────────────────────────────────
    latest_snap = db.query(CashSnapshot).order_by(
        CashSnapshot.snapshot_date.desc()).first()
    cash_on_hand = latest_snap.balance if latest_snap else Decimal("0")

    ar = db.query(func.coalesce(func.sum(Invoice.balance), 0)).filter(
        Invoice.status.in_([InvoiceStatus.sent, InvoiceStatus.overdue, InvoiceStatus.partial])
    ).scalar()

    # AP = vendor notes with AP amounts (simplified — real AP would be separate table)
    ap = db.query(func.coalesce(func.sum(Debt.current_balance), 0)).filter(
        Debt.is_active == True, Debt.debt_type == DebtType.other
    ).scalar()

    remaining_draws = db.query(
        func.coalesce(func.sum(Project.budget_total - Project.contract_amount), 0)
    ).filter(Project.status == ProjectStatus.active).scalar()

    ret_recv = db.query(func.coalesce(func.sum(RetainageEntry.balance), 0)).filter(
        RetainageEntry.vendor_id.is_(None)
    ).scalar()
    ret_pay = db.query(func.coalesce(func.sum(RetainageEntry.balance), 0)).filter(
        RetainageEntry.vendor_id.isnot(None)
    ).scalar()

    cash = CashPositionOut(
        cash_on_hand=cash_on_hand, ar_outstanding=ar or Decimal("0"),
        ap_outstanding=ap or Decimal("0"),
        remaining_draws=remaining_draws or Decimal("0"),
        retainage_receivable=ret_recv or Decimal("0"),
        retainage_payable=ret_pay or Decimal("0"),
    )

    # ── Debt Summary ─────────────────────────────────────────────────
    debt_q = db.query(
        func.count(Debt.id),
        func.coalesce(func.sum(Debt.current_balance), 0),
        func.coalesce(func.sum(case(
            (Debt.debt_type == DebtType.construction_loan, Debt.current_balance),
            else_=0
        )), 0),
        func.coalesce(func.sum(case(
            (Debt.debt_type == DebtType.credit_card, Debt.current_balance),
            else_=0
        )), 0),
    ).filter(Debt.is_active == True).first()

    debt_count, total_debt, const_loans, cc_debt = debt_q
    debt = DebtSummaryOut(
        total_debt=total_debt, construction_loans=const_loans,
        credit_cards=cc_debt, other_debt=total_debt - const_loans - cc_debt,
        active_count=debt_count,
    )

    # ── Project Summary ──────────────────────────────────────────────
    proj_q = db.query(
        func.count(Project.id),
        func.coalesce(func.sum(Project.budget_total), 0),
        func.coalesce(func.sum(Project.contract_amount), 0),
    ).filter(Project.status == ProjectStatus.active).first()

    active_count, total_budget, total_released = proj_q
    projects = ProjectSummaryOut(
        active_projects=active_count, total_budget=total_budget,
        total_spent=total_released,
        total_remaining=total_budget - total_released,
        avg_percent_complete=Decimal(str(
            round(float(total_released) / float(total_budget) * 100, 1)
        )) if total_budget > 0 else Decimal("0"),
    )

    # ── Pipeline ─────────────────────────────────────────────────────
    pipe_q = db.query(
        func.count(BidPipeline.id),
        func.coalesce(func.sum(BidPipeline.estimated_value), 0),
        func.coalesce(func.sum(case(
            (BidPipeline.status == BidStatus.won, BidPipeline.estimated_value),
            else_=0
        )), 0),
        func.count(case((BidPipeline.status == BidStatus.won, 1))),
    ).first()

    pipe_count, pipe_val, won_val, won_count = pipe_q
    pipeline = PipelineSummaryOut(
        total_opportunities=pipe_count, total_value=pipe_val,
        won_count=won_count, won_value=won_val,
    )

    # ── Payroll ──────────────────────────────────────────────────────
    from backend.models.core import Employee
    emp_count = db.query(func.count(Employee.id)).filter(Employee.is_active == True).scalar()
    annual_salary = db.query(func.coalesce(func.sum(Employee.salary), 0)).filter(
        Employee.is_active == True).scalar()

    next_pay = db.query(PayrollCalendar.pay_date).filter(
        PayrollCalendar.pay_date >= date.today()
    ).order_by(PayrollCalendar.pay_date).first()

    payroll = PayrollSummaryOut(
        employee_count=emp_count or 0,
        biweekly_cost=Decimal(str(round(float(annual_salary or 0) / 26, 2))),
        annual_cost=annual_salary or Decimal("0"),
        next_pay_date=next_pay[0] if next_pay else None,
    )

    # ── Alerts ───────────────────────────────────────────────────────
    alerts = _generate_alerts(db)

    return DashboardOut(
        cash=cash, debt=debt, projects=projects,
        pipeline=pipeline, payroll=payroll, alerts=alerts,
    )


def _generate_alerts(db: Session) -> list[AlertOut]:
    """Generate real-time alerts from current data state."""
    alerts = []
    today = date.today()

    # Overdue invoices
    overdue = db.query(func.count(Invoice.id), func.coalesce(func.sum(Invoice.balance), 0)).filter(
        Invoice.status == InvoiceStatus.overdue).first()
    if overdue[0] > 0:
        alerts.append(AlertOut(
            level="critical", category="AR",
            message=f"{overdue[0]} overdue invoices totaling ${overdue[1]:,.0f}",
            link="/financials/ar",
        ))

    # Expiring vendor insurance
    thirty_days = today + timedelta(days=30)
    exp_vendors = db.query(func.count(Vendor.id)).filter(
        Vendor.insurance_expiry.isnot(None),
        Vendor.insurance_expiry <= thirty_days,
        Vendor.insurance_expiry >= today,
    ).scalar()
    if exp_vendors > 0:
        alerts.append(AlertOut(
            level="warning", category="Compliance",
            message=f"{exp_vendors} vendor insurance expiring within 30 days",
            link="/vendors",
        ))

    # Missing lien waivers (high-value vendors without recent waivers)
    waiver_count = db.query(func.count(LienWaiver.id)).filter(
        LienWaiver.waiver_type.is_(None)).scalar()
    if waiver_count > 0:
        alerts.append(AlertOut(
            level="warning", category="Lien Risk",
            message=f"{waiver_count} vendors missing lien waiver documentation",
            link="/lien-waivers",
        ))

    # Upcoming payroll
    next_pay = db.query(PayrollCalendar).filter(
        PayrollCalendar.pay_date >= today,
        PayrollCalendar.pay_date <= today + timedelta(days=7),
    ).first()
    if next_pay:
        alerts.append(AlertOut(
            level="info", category="Payroll",
            message=f"Payroll due {next_pay.pay_date.strftime('%b %d')}",
            link="/payroll",
        ))

    # Budget overages
    from backend.models.core import CostCode
    overages = db.query(func.count(CostCode.id)).filter(
        CostCode.variance < 0).scalar()
    if overages > 0:
        alerts.append(AlertOut(
            level="warning", category="Budget",
            message=f"{overages} cost codes over budget",
            link="/projects",
        ))

    return alerts
