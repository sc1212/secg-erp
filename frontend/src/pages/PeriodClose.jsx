import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Lock, X } from 'lucide-react';
import { money } from '../lib/format';

const PERIODS = [
  { month: '2025-07', label: 'Jul 2025', status: 'locked',  revenue: 82400,  expense: 68200,  net: 14200 },
  { month: '2025-08', label: 'Aug 2025', status: 'locked',  revenue: 124800, expense: 104200, net: 20600 },
  { month: '2025-09', label: 'Sep 2025', status: 'locked',  revenue: 148200, expense: 128400, net: 19800 },
  { month: '2025-10', label: 'Oct 2025', status: 'locked',  revenue: 88400,  expense: 78200,  net: 10200, anomaly: 'Revenue $98K below 3-month avg — see note' },
  { month: '2025-11', label: 'Nov 2025', status: 'locked',  revenue: 186000, expense: 154800, net: 31200 },
  { month: '2025-12', label: 'Dec 2025', status: 'locked',  revenue: 212400, expense: 178400, net: 34000 },
  { month: '2026-01', label: 'Jan 2026', status: 'locked',  revenue: 198200, expense: 168400, net: 29800 },
  { month: '2026-02', label: 'Feb 2026', status: 'in_progress', revenue: 164800, expense: 138200, net: 26600 },
];

const CLOSE_STEPS = [
  { id: 1, name: 'All Transactions Posted',         category: 'AP/AR',    status: 'complete', completedBy: 'Samuel Carson', completedAt: '2026-02-22 08:00 AM', note: '47 transactions posted — QB sync confirmed' },
  { id: 2, name: 'Bank Statement Reconciliation',   category: 'Banking',  status: 'complete', completedBy: 'Samuel Carson', completedAt: '2026-02-22 09:15 AM', note: 'Checking x4821 reconciled. $284,420 ending balance.' },
  { id: 3, name: 'Payroll Reconciliation',          category: 'Payroll',  status: 'complete', completedBy: 'Samuel Carson', completedAt: '2026-02-22 09:30 AM', note: 'Gusto sync verified — $28,420 payroll + $3,248 taxes.' },
  { id: 4, name: 'Job Cost Review',                 category: 'Job Cost', status: 'in_progress', completedBy: null, completedAt: null, note: 'Reviewing Ramp card items — 3 items unallocated to projects.' },
  { id: 5, name: 'Accrue Unbilled Liabilities',     category: 'Accruals', status: 'pending', completedBy: null, completedAt: null, note: null },
  { id: 6, name: 'Revenue Recognition / WIP Sched',  category: 'Revenue',  status: 'pending', completedBy: null, completedAt: null, note: null },
  { id: 7, name: 'Generate Financial Statements',   category: 'Reporting', status: 'pending', completedBy: null, completedAt: null, note: null },
  { id: 8, name: 'Lock Period',                     category: 'Close',    status: 'pending', completedBy: null, completedAt: null, note: null },
];

// February 2026 WIP Schedule
const WIP_SCHEDULE = [
  { project: 'Riverside Custom',   contract: 497500, cOs: 12400, revised: 509900, cosToDate: 287400, estCostAtCompletion: 417900, pctComplete: 72, billedToDate: 322000, under_over_billed: -14800 },
  { project: 'Oak Creek',          contract: 328500, cOs: 0,     revised: 328500, cosToDate: 142000, estCostAtCompletion: 279900, pctComplete: 42, billedToDate: 118400, under_over_billed: -18600 },
  { project: 'Elm St Multifamily', contract: 1200000,cOs: 48000, revised: 1248000,cosToDate: 478000, estCostAtCompletion: 1054800,pctComplete: 38, billedToDate: 412000, under_over_billed: -62400 },
  { project: 'Walnut Spec',        contract: 275000, cOs: 0,     revised: 275000, cosToDate: 138200, estCostAtCompletion: 226900, pctComplete: 55, billedToDate: 142000, under_over_billed: 6800 },
  { project: 'Johnson Office TI',  contract: 180000, cOs: 8400,  revised: 188400, cosToDate: 178200, estCostAtCompletion: 162000, pctComplete: 95, billedToDate: 178000, under_over_billed: 0 },
];

// P&L Statement (February)
const PL_STATEMENT = {
  revenue: [
    { label: 'Contract Revenue Recognized',   amount: 164800 },
    { label: 'Change Order Revenue',           amount: 8400 },
    { label: 'Other Income',                   amount: 0 },
  ],
  directCosts: [
    { label: 'Direct Materials',               amount: 42200 },
    { label: 'Direct Labor (field)',            amount: 28420 },
    { label: 'Subcontractors',                  amount: 54800 },
    { label: 'Equipment & Rentals',             amount: 6800 },
    { label: 'Other Job Costs',                 amount: 5980 },
  ],
  overhead: [
    { label: 'Officer Compensation',            amount: 16200 },
    { label: 'Staff Salaries (non-field)',       amount: 14800 },
    { label: 'Vehicle & Equipment',             amount: 4200 },
    { label: 'Insurance & Bonds',               amount: 5400 },
    { label: 'General & Admin',                 amount: 3200 },
  ],
};

const STEP_STATUS = {
  complete:     { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.1)',   label: 'Complete',     icon: CheckCircle },
  in_progress:  { color: '#3b82f6',               bg: 'rgba(59,130,246,0.1)',  label: 'In Progress',  icon: Clock },
  pending:      { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.05)', label: 'Pending',      icon: Clock },
};

export default function PeriodClose() {
  const [tab, setTab]       = useState('workflow');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-02');

  const completedSteps = CLOSE_STEPS.filter(s => s.status === 'complete').length;
  const totalRevenue   = PL_STATEMENT.revenue.reduce((s, r) => s + r.amount, 0);
  const totalDirect    = PL_STATEMENT.directCosts.reduce((s, c) => s + c.amount, 0);
  const totalOverhead  = PL_STATEMENT.overhead.reduce((s, c) => s + c.amount, 0);
  const grossProfit    = totalRevenue - totalDirect;
  const netProfit      = grossProfit - totalOverhead;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;
  const netMarginPct   = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Period Close</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          February 2026 — {completedSteps}/{CLOSE_STEPS.length} steps complete · {CLOSE_STEPS.find(s => s.status === 'in_progress')?.name || 'All steps done'}
        </p>
      </div>

      {/* Period timeline */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Period History</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {PERIODS.map(p => (
            <div key={p.month} onClick={() => setSelectedPeriod(p.month)} style={{ flex: '0 0 auto', textAlign: 'center', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${selectedPeriod === p.month ? '#3b82f6' : p.anomaly ? 'rgba(251,191,36,0.4)' : 'var(--color-brand-border)'}`, background: selectedPeriod === p.month ? 'rgba(59,130,246,0.1)' : p.anomaly ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.02)', minWidth: 90 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: selectedPeriod === p.month ? '#3b82f6' : p.anomaly ? 'var(--status-warning)' : 'var(--text-tertiary)', marginBottom: 4 }}>{p.label}</div>
              {p.status === 'locked' ? <Lock size={12} style={{ color: 'var(--status-profit)', marginBottom: 4 }} /> : <Clock size={12} style={{ color: '#3b82f6', marginBottom: 4 }} />}
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: p.net >= 0 ? 'var(--status-profit)' : 'var(--status-loss)', fontWeight: 600 }}>{money(p.net, true)}</div>
              {p.anomaly && <div style={{ fontSize: 9, color: 'var(--status-warning)', marginTop: 2 }}>⚠ anomaly</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly detection */}
      {PERIODS.some(p => p.anomaly) && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '11px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-warning)' }}>Revenue Anomaly Detected — October 2025</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 24 }}>
            October revenue was $88,400 — approximately $98K below the 3-month average of $186,200. Possible causes: delayed CO approval on Johnson TI, no draws submitted in October. Samuel's note: "Verify all October draw requests were submitted."
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['workflow', 'Close Workflow'], ['pl', 'P&L Statement'], ['wip', 'WIP Schedule'], ['report', 'Reporting Package']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: '7px 7px 0 0', border: 'none', background: tab === t ? 'var(--color-brand-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── WORKFLOW ── */}
      {tab === 'workflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
            {[['Completed', completedSteps, 'var(--status-profit)'], ['In Progress', CLOSE_STEPS.filter(s => s.status === 'in_progress').length, '#3b82f6'], ['Remaining', CLOSE_STEPS.filter(s => s.status === 'pending').length, 'var(--text-tertiary)']].map(([l, v, c]) => (
              <div key={l} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '10px 16px', minWidth: 100 }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--color-brand-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(completedSteps / CLOSE_STEPS.length) * 100}%`, background: 'var(--status-profit)', borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{Math.round((completedSteps / CLOSE_STEPS.length) * 100)}%</span>
            </div>
          </div>

          {CLOSE_STEPS.map((step, i) => {
            const ss = STEP_STATUS[step.status];
            const Icon = ss.icon;
            return (
              <div key={step.id} style={{ background: 'var(--color-brand-card)', border: `1px solid ${step.status === 'in_progress' ? 'rgba(59,130,246,0.3)' : 'var(--color-brand-border)'}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: ss.bg, flexShrink: 0 }}>
                    <Icon size={14} style={{ color: ss.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Step {step.id}: {step.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{step.category}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: ss.color, marginLeft: 'auto' }}>{ss.label}</span>
                    </div>
                    {step.completedBy && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: step.note ? 4 : 0 }}>Completed by {step.completedBy} · {step.completedAt}</div>}
                    {step.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{step.note}</div>}
                    {step.status === 'in_progress' && (
                      <button style={{ marginTop: 8, padding: '6px 14px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Mark Complete</button>
                    )}
                    {step.status === 'pending' && i === CLOSE_STEPS.findIndex(s => s.status === 'pending') && (
                      <button style={{ marginTop: 8, padding: '6px 14px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Start Step</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── P&L STATEMENT ── */}
      {tab === 'pl' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden', maxWidth: 600 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Southeast Construction Group</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Profit & Loss — February 2026</div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {/* Revenue */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Revenue</div>
              {PL_STATEMENT.revenue.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--color-brand-border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16 }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(r.amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--color-brand-border)', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Total Revenue</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(totalRevenue)}</span>
              </div>
            </div>

            {/* Direct Costs */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Direct Job Costs</div>
              {PL_STATEMENT.directCosts.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--color-brand-border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16 }}>{c.label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(c.amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--color-brand-border)', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Total Direct Costs</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(totalDirect)}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(52,211,153,0.1)', borderRadius: 7, marginBottom: 16, border: '1px solid rgba(52,211,153,0.2)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--status-profit)' }}>Gross Profit</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{money(grossProfit)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{grossMarginPct.toFixed(1)}% margin</div>
              </div>
            </div>

            {/* Overhead */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Operating Overhead</div>
              {PL_STATEMENT.overhead.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--color-brand-border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16 }}>{c.label}</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(c.amount)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid var(--color-brand-border)', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Total Overhead</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(totalOverhead)}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: netProfit >= 0 ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)', borderRadius: 8, border: `1px solid ${netProfit >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.25)'}` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: netProfit >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>Net Profit</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: netProfit >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>{money(netProfit)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{netMarginPct.toFixed(1)}% net margin</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WIP SCHEDULE ── */}
      {tab === 'wip' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Work in Progress (WIP) Schedule — February 28, 2026</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Under-billed = revenue earned but not yet invoiced · Over-billed = invoiced ahead of completion</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead><tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Project', 'Contract', 'COs', 'Revised Contract', 'Cost to Date', 'Est @ Completion', '% Complete', 'Billed to Date', 'Under/(Over) Billed'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: h === 'Project' ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {WIP_SCHEDULE.map((w, i) => (
                  <tr key={w.project} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{w.project}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(w.contract)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: w.cOs > 0 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{w.cOs > 0 ? money(w.cOs) : '—'}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{money(w.revised)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(w.cosToDate)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(w.estCostAtCompletion)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{w.pctComplete}%</td>
                    <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(w.billedToDate)}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: w.under_over_billed < 0 ? 'var(--status-warning)' : 'var(--status-profit)' }}>
                      {w.under_over_billed < 0 ? `(${money(Math.abs(w.under_over_billed))})` : money(w.under_over_billed)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.03)', fontWeight: 700 }}>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(WIP_SCHEDULE.reduce((s, w) => s + w.contract, 0))}</td>
                  <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-warning)' }}>{money(WIP_SCHEDULE.reduce((s, w) => s + w.cOs, 0))}</td>
                  <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>{money(WIP_SCHEDULE.reduce((s, w) => s + w.revised, 0))}</td>
                  <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(WIP_SCHEDULE.reduce((s, w) => s + w.cosToDate, 0))}</td>
                  <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(WIP_SCHEDULE.reduce((s, w) => s + w.estCostAtCompletion, 0))}</td>
                  <td />
                  <td style={{ padding: '9px 12px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(WIP_SCHEDULE.reduce((s, w) => s + w.billedToDate, 0))}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: 'var(--status-warning)' }}>
                    ({money(Math.abs(WIP_SCHEDULE.reduce((s, w) => s + w.under_over_billed, 0)))})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REPORTING PACKAGE ── */}
      {tab === 'report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Standard reporting package for lenders, owners, and internal review. Available once period close is complete.</div>
          {[['Profit & Loss Statement', 'February 2026 — Revenue, costs, margins', true], ['Balance Sheet', 'February 28, 2026 snapshot', false], ['Cash Flow Statement', 'February 2026 operating / investing / financing', false], ['WIP Schedule', 'All active jobs — under/overbilling analysis', true], ['Job Cost Summary', 'Per-project budget vs actual', true], ['Accounts Receivable Aging', 'Outstanding invoices by age bucket', true], ['Accounts Payable Aging', 'Outstanding bills by age bucket', true], ['Draw Log', 'All draw requests and status YTD', true]].map(([name, desc, avail]) => (
            <div key={name} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{desc}</div>
              </div>
              <button disabled={!avail} style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${avail ? '#3b82f6' : 'var(--color-brand-border)'}`, background: avail ? 'rgba(59,130,246,0.12)' : 'transparent', color: avail ? '#3b82f6' : 'var(--text-tertiary)', fontSize: 12, cursor: avail ? 'pointer' : 'not-allowed' }}>
                {avail ? 'Download PDF' : 'Pending Close'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
