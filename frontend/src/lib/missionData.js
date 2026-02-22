/**
 * Mission Control — Structured data models
 *
 * Every navigable item has a `drillTo` field:
 *   - Top-level route:           '/financials'
 *   - Route + tab query param:   '/projects/1?tab=cos'
 *
 * ProjectDetail reads ?tab= on mount.
 * Financials reads ?tab= on mount.
 */

// ── Mission Cards ────────────────────────────────────────────────────────────
export const missionCards = [
  {
    id: 'margin',
    label: 'Margin Performance',
    value: '14.2%',
    rawValue: 14.2,
    subvalue: 'Blended across 6 active jobs',
    delta: '+1.4%',
    deltaDir: 'up',
    deltaDetail: 'vs prior 30-day period',
    context: 'Target 16% | Trailing avg 13.1%',
    iconKey: 'TrendingUp',
    drillTo: '/financials?tab=overview',
    severity: 'warning',
  },
  {
    id: 'cash',
    label: 'Cash Velocity',
    value: '$1.8M',
    rawValue: 1800000,
    subvalue: 'Avg 12-day collection cycle',
    delta: '−2 days',
    deltaDir: 'up',
    deltaDetail: 'cycle improvement this period',
    context: '8-week cash forecast: positive',
    iconKey: 'Zap',
    drillTo: '/financials?tab=ar',
    severity: 'profit',
  },
  {
    id: 'co_conversion',
    label: 'CO Conversion Rate',
    value: '67%',
    rawValue: 67,
    subvalue: '8 of 12 submitted COs approved',
    delta: '3 pending',
    deltaDir: 'warn',
    deltaDetail: 'awaiting owner review',
    context: '$94K revenue at risk in open COs',
    iconKey: 'GitMerge',
    drillTo: '/projects/1?tab=cos',
    severity: 'warning',
  },
];

// ── Command Narratives ───────────────────────────────────────────────────────
// Each narrative is a 4-step causal chain. Each step has a drillTo so the user
// can jump directly to the relevant surface by clicking that step card.
export const commandNarratives = [
  {
    id: 'n1',
    signal: {
      label: 'Budget Variance Detected',
      detail: '$47K overage in framing phase — Elm Street project',
      job: 'PRJ-042 Elm St',
      severity: 'warning',
      drillTo: '/projects/1?tab=costs',
    },
    drilldown: {
      label: 'Phase 4 Cost Analysis',
      detail: 'Framing labor $31K over; LVL beam upgrade added $16K in materials',
      drillTo: '/projects/1?tab=actuals',
    },
    decision: {
      label: 'Approve CO #008',
      detail: 'Owner review requested by Connor; deadline Thursday',
      drillTo: '/projects/1?tab=cos',
    },
    outcome: {
      label: '$47K Absorbed via CO',
      detail: 'CO approved Nov 14 — margin intact at 13.8%',
      status: 'complete',
      drillTo: '/projects/1?tab=cos',
    },
  },
  {
    id: 'n2',
    signal: {
      label: 'AR Aging Alert',
      detail: '2 invoices 45+ days past due — Whitmore LLC',
      job: 'PRJ-039 Whitmore',
      severity: 'loss',
      drillTo: '/financials?tab=ar',
    },
    drilldown: {
      label: 'AR Drill — Whitmore LLC',
      detail: 'Invoice #2241: $24,500 (52 days) | Invoice #2208: $11,200 (48 days)',
      drillTo: '/financials?tab=ar',
    },
    decision: {
      label: 'Escalate to Finance',
      detail: 'Samuel to issue demand letter; lien rights notice drafted by Friday',
      drillTo: '/payments',
    },
    outcome: {
      label: 'Pending Response',
      detail: 'Demand letter sent Feb 18 — partial payment expected by Feb 28',
      status: 'pending',
      drillTo: '/financials?tab=ar',
    },
  },
  {
    id: 'n3',
    signal: {
      label: 'Insurance Expiry Warning',
      detail: 'Apex HVAC — COI expires in 8 days (Feb 28)',
      job: 'Portfolio-wide',
      severity: 'info',
      drillTo: '/vendors',
    },
    drilldown: {
      label: 'Vendor File — Apex HVAC',
      detail: 'GL policy #APX-1234: expires Feb 28 | Workers Comp valid Aug 2026',
      drillTo: '/vendors',
    },
    decision: {
      label: 'Issue Renewal Notice',
      detail: 'Abi to contact Apex HVAC, require certificate by Feb 26',
      drillTo: '/vendors',
    },
    outcome: {
      label: 'COI Renewed',
      detail: 'New certificate received Feb 25 — valid through Feb 2027',
      status: 'complete',
      drillTo: '/vendors',
    },
  },
];

// ── Weekly Objectives ────────────────────────────────────────────────────────
export const weeklyObjectives = [
  {
    id: 'obj1',
    text: 'Close Elm Street draw application by Friday',
    owner: 'Samuel', ownerInitials: 'SL',
    priority: 'high', done: false,
    drillTo: '/projects/1?tab=draws',
  },
  {
    id: 'obj2',
    text: 'Resolve 3 open change orders (PRJ-042, PRJ-038)',
    owner: 'Connor', ownerInitials: 'CJ',
    priority: 'high', done: false,
    drillTo: '/projects/1?tab=cos',
  },
  {
    id: 'obj3',
    text: 'COI renewal — Apex HVAC (deadline Feb 26)',
    owner: 'Abi', ownerInitials: 'AB',
    priority: 'medium', done: true,
    drillTo: '/vendors',
  },
  {
    id: 'obj4',
    text: 'Collect bids for open structural scope items',
    owner: 'Cole', ownerInitials: 'CO',
    priority: 'medium', done: false,
    drillTo: '/projects/1?tab=bids',
  },
  {
    id: 'obj5',
    text: 'Finalize multifamily framing subcontract',
    owner: 'Alex', ownerInitials: 'AH',
    priority: 'high', done: false,
    drillTo: '/projects/1?tab=commitments',
  },
  {
    id: 'obj6',
    text: 'Submit Q4 payroll tax deposit by Wednesday',
    owner: 'Samuel', ownerInitials: 'SL',
    priority: 'high', done: true,
    drillTo: '/team',
  },
];

// ── Mission Scores ───────────────────────────────────────────────────────────
export const missionScores = [
  {
    id: 'delivery',
    domain: 'Delivery Health',
    score: 81,
    detail: '5 of 6 jobs on schedule; 1 at-risk (Whitmore framing delay)',
    color: 'profit',
    drillTo: '/projects',
  },
  {
    id: 'finance',
    domain: 'Finance Velocity',
    score: 64,
    detail: 'AR aging and 1 overdue draw dragging the score',
    color: 'warning',
    drillTo: '/financials',
  },
  {
    id: 'ops',
    domain: 'Ops Risk Index',
    score: 79,
    detail: 'COI gap (Apex) resolved; crew allocation fully staffed',
    color: 'profit',
    drillTo: '/vendors',
  },
  {
    id: 'pipeline',
    domain: 'Pipeline Confidence',
    score: 62,
    detail: '2 late-stage leads; proposal conversion slower than target',
    color: 'warning',
    drillTo: '/crm',
  },
];

// ── Weekly Cadence Table ─────────────────────────────────────────────────────
export const cadenceItems = [
  { id: 'c1', cadence: 'Mon', item: 'Job status review — all PMs',         owner: 'Cole',   status: 'complete',    drillTo: '/projects' },
  { id: 'c2', cadence: 'Tue', item: 'Cash flow projection update',         owner: 'Samuel', status: 'complete',    drillTo: '/financials?tab=overview' },
  { id: 'c3', cadence: 'Wed', item: 'Vendor invoice processing cutoff',    owner: 'Abi',    status: 'in_progress', drillTo: '/payments' },
  { id: 'c4', cadence: 'Thu', item: 'Bid deadline — open structural scope', owner: 'Cole',  status: 'pending',     drillTo: '/projects/1?tab=bids' },
  { id: 'c5', cadence: 'Fri', item: 'Draw submission — Elm Street',        owner: 'Samuel', status: 'pending',     drillTo: '/projects/1?tab=draws' },
  { id: 'c6', cadence: 'Fri', item: 'Owner call — Whitmore project',       owner: 'Matt',   status: 'pending',     drillTo: '/projects/1' },
];
