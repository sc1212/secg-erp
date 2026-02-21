# VISUAL MOCKUPS (Low-fidelity)

These are reference visuals for major ERP surfaces so we can align quickly before full UI implementation.

## 1) Executive command center
```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header: Org Switcher | Global Search | Alerts | User                        │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ Sidebar       │ KPI Ribbon: Cash | Backlog | Margin | AR Aging | Overage    │
│ - Dashboard   ├──────────────────────────────────────────────────────────────┤
│ - Projects    │ Trend Charts (Cash/Revenue/Burn)                            │
│ - Financials  ├───────────────────────────────┬──────────────────────────────┤
│ - Vendors     │ Risk Feed (Overruns/Delays)  │ Approval Queue               │
│ - CRM         ├───────────────────────────────┴──────────────────────────────┤
│ - Admin       │ Drill-through table (transactions with saved views)         │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

## 2) Project financial control
```text
┌ Project: Oak Ridge #2473 ─ Status: Active ─ PM: J. Doe ─ GM: 18.4% ┐
│ Tabs: Overview | Cost Codes | Budget | Change Orders | Draws | Docs │
├───────────────────────────────────────────────────────────────────────┤
│ Filters: [Division] [Phase] [Over budget only] [Saved View ▼]       │
├───────────────────────────────────────────────────────────────────────┤
│ Cost Code Grid: Code | Budget | Committed | Actual | Variance | Risk│
│ 03-300: Concrete | 210k | 198k | 154k | +56k | Low                  │
│ 06-100: Framing  | 165k | 182k | 144k | -17k | High                 │
├───────────────────────────────────────────────────────────────────────┤
│ Right rail: Variance reasons | Pending approvals | Required actions  │
└───────────────────────────────────────────────────────────────────────┘
```

## 3) AP invoice workflow
```text
┌ AP Invoice Intake ─ Vendor: ABC Concrete ─ Project: Oak Ridge ┐
│ Upload invoice | OCR fields | Coding checks | Waiver required  │
├─────────────────────────────────────────────────────────────────┤
│ Invoice #: 55319    Amount: $24,450.00    Due: 2026-03-10      │
│ Cost code: 03-300   Commitment: PO-3321   Retainage: 10%       │
├─────────────────────────────────────────────────────────────────┤
│ Approval timeline: PM Review → Finance Review → Payment Queue  │
└─────────────────────────────────────────────────────────────────┘
```

## 4) Billing and subscriptions experience
```text
┌ Billing Settings ─ Organization: SECG ─ Plan: Finance + Ops ┐
│ Current plan card | next renewal | seats used | payment status│
├───────────────────────────────────────────────────────────────┤
│ Actions: [Upgrade Plan] [Open Customer Portal] [Update Card] │
├───────────────────────────────────────────────────────────────┤
│ Invoices table: Date | Amount | Status | Download PDF        │
│ Event timeline: subscription_updated, payment_failed, retry   │
└───────────────────────────────────────────────────────────────┘
```
