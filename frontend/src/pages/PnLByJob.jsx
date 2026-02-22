import { useState } from 'react';
import { PROJECTS } from '../lib/demoData';
import { money, pct } from '../lib/format';
import { X } from 'lucide-react';

// Per-project P&L data
const JOB_PL = {
  1: { // Riverside Custom
    revenue: [
      { label: 'Original Contract',           amount: 497500 },
      { label: 'Approved Change Orders (3)',   amount: 12400 },
      { label: 'Revenue Recognized to Date',   amount: 0, derived: true, calc: (r) => r.slice(0,2).reduce((s,x)=>s+x.amount,0) * 0.72 },
    ],
    direct: [
      { label: 'Concrete / Foundation',        amount: 42800, code: '03-xxx' },
      { label: 'Rough Framing Labor',          amount: 68400, code: '06-100' },
      { label: 'Framing Materials',            amount: 48200, code: '06-110' },
      { label: 'Roofing',                      amount: 0,     code: '07-300', note: 'Not yet started' },
      { label: 'Windows & Doors',              amount: 24800, code: '08-xxx' },
      { label: 'HVAC / Mechanical',            amount: 22400, code: '15-200' },
      { label: 'Plumbing Rough-In',            amount: 18400, code: '15-100' },
      { label: 'Electrical Rough-In',          amount: 0,     code: '16-100', note: 'Scheduled Mar' },
      { label: 'Supervision / PM Labor',       amount: 18200, code: '01-300' },
      { label: 'Equipment Rental',             amount: 8400,  code: '01-400' },
      { label: 'Permits & Inspections',        amount: 7580,  code: '01-100' },
      { label: 'Miscellaneous Materials',      amount: 18240, code: 'Various' },
    ],
    overhead: [
      { label: 'Company OH Allocation (8%)',   amount: 28726 },
    ],
    budgetedMargin: 16.2,
    notes: 'On schedule. 3 change orders approved (+$12,400). Draw #3 pending at 75% framing.',
  },
  6: { // Elm St Multifamily
    revenue: [
      { label: 'Original Contract',           amount: 1200000 },
      { label: 'Approved Change Orders (2)',   amount: 48000 },
      { label: 'Revenue Recognized to Date',   amount: 0, derived: true, calc: (r) => r.slice(0,2).reduce((s,x)=>s+x.amount,0) * 0.38 },
    ],
    direct: [
      { label: 'Site Work / Excavation',       amount: 48200, code: '02-xxx' },
      { label: 'Concrete Foundation',          amount: 124000,code: '03-xxx' },
      { label: 'Rough Framing Labor',          amount: 138000,code: '06-100' },
      { label: 'Framing Materials',            amount: 82400, code: '06-110' },
      { label: 'Supervision / PM Labor',       amount: 42000, code: '01-300' },
      { label: 'Equipment Rental',             amount: 22400, code: '01-400' },
      { label: 'Permits & Inspections',        amount: 21600, code: '01-100' },
      { label: 'Miscellaneous',                amount: 18200, code: 'Various' },
    ],
    overhead: [
      { label: 'Company OH Allocation (8%)',   amount: 99878 },
    ],
    budgetedMargin: 12.2,
    notes: 'Level 2 framing in progress. Cost trending on schedule. Phase 2 permit pending.',
  },
  5: { // Johnson Office TI
    revenue: [
      { label: 'Original Contract',           amount: 180000 },
      { label: 'Approved Change Orders (1)',   amount: 8400 },
      { label: 'Revenue Recognized to Date',   amount: 0, derived: true, calc: (r) => r.slice(0,2).reduce((s,x)=>s+x.amount,0) * 0.95 },
    ],
    direct: [
      { label: 'Demo & Disconnect',             amount: 8400,  code: '02-xxx' },
      { label: 'Electrical (complete)',         amount: 32600, code: '16-xxx' },
      { label: 'Mechanical Rough-In',           amount: 0,     code: '15-xxx', note: 'Permit pending' },
      { label: 'Flooring (complete)',           amount: 18400, code: '09-600' },
      { label: 'Drywall & Paint (complete)',    amount: 22200, code: '09-xxx' },
      { label: 'Millwork / Cabinets',          amount: 24800, code: '06-400', note: 'Delayed — ETA Mar 1' },
      { label: 'Supervision / PM Labor',       amount: 14400, code: '01-300' },
      { label: 'Permits & Inspections',        amount: 3800,  code: '01-100' },
      { label: 'Miscellaneous',                amount: 8400,  code: 'Various' },
    ],
    overhead: [
      { label: 'Company OH Allocation (8%)',   amount: 15076 },
    ],
    budgetedMargin: 1.0,
    notes: 'Over budget — cabinet delay adding cost. CO pending ($8,400). Final payment $18K held pending CO.',
  },
};

function DrillModal({ drill, onClose }) {
  if (!drill) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{drill.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={16} /></button>
        </div>
        {drill.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < drill.rows.length - 1 ? '1px solid var(--color-brand-border)' : 'none' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.highlight ? 'var(--status-warning)' : 'var(--text-primary)' }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PLLine({ label, amount, indent = false, bold = false, color, note, onClick, code }) {
  const isNeg = amount < 0;
  return (
    <div onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: indent ? 12 : 13, color: 'var(--text-secondary)', paddingLeft: indent ? 20 : 0, fontWeight: bold ? 700 : 400 }}>{label}</span>
        {code && <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{code}</span>}
        {note && <span style={{ fontSize: 10, color: 'var(--status-warning)' }}>{note}</span>}
      </div>
      <span style={{ fontSize: bold ? 14 : 12, fontFamily: 'monospace', fontWeight: bold ? 700 : 600, color: color || (isNeg ? 'var(--status-loss)' : 'var(--text-primary)'), textDecoration: onClick ? 'underline dotted' : 'none' }}>
        {amount === 0 ? '—' : isNeg ? `(${money(Math.abs(amount))})` : money(amount)}
      </span>
    </div>
  );
}

function JobPL({ project, pl, onDrill }) {
  const totalRevenue    = pl.revenue.reduce((s, r) => s + (r.derived ? r.calc(pl.revenue) : r.amount), 0);
  const totalDirect     = pl.direct.reduce((s, c) => s + c.amount, 0);
  const grossProfit     = totalRevenue - totalDirect;
  const totalOverhead   = pl.overhead.reduce((s, o) => s + o.amount, 0);
  const netProfit       = grossProfit - totalOverhead;
  const grossMarginPct  = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;
  const netMarginPct    = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
  const budgetVariance  = netMarginPct - pl.budgetedMargin;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Revenue */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', padding: '10px 0 6px' }}>Revenue</div>
      {pl.revenue.map((r, i) => {
        const amt = r.derived ? r.calc(pl.revenue) : r.amount;
        return <PLLine key={i} label={r.label} amount={amt} indent={!r.derived}
          onClick={r.derived ? null : () => onDrill({ title: r.label, rows: [{ label: 'Amount', value: money(amt) }, { label: '% of contract', value: pct((amt / pl.revenue[0].amount) * 100) }] })} />;
      })}
      <PLLine label="Total Revenue" amount={totalRevenue} bold color="var(--text-primary)"
        onClick={() => onDrill({ title: 'Revenue Detail', rows: pl.revenue.map(r => ({ label: r.label, value: money(r.derived ? r.calc(pl.revenue) : r.amount) })) })} />

      {/* Direct Costs */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', padding: '14px 0 6px' }}>Direct Job Costs</div>
      {pl.direct.map((c, i) => (
        <PLLine key={i} label={c.label} amount={c.amount} indent code={c.code} note={c.note}
          onClick={() => onDrill({ title: `${c.label} (${c.code})`, rows: [{ label: 'Actual to date', value: money(c.amount) }, { label: 'Cost code', value: c.code }] })} />
      ))}
      <PLLine label="Total Direct Costs" amount={totalDirect} bold color="var(--text-primary)"
        onClick={() => onDrill({ title: 'Direct Cost Breakdown', rows: pl.direct.map(c => ({ label: c.label, value: money(c.amount) })) })} />

      {/* Gross Profit */}
      <div style={{ margin: '10px 0', padding: '10px 14px', background: grossProfit >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)', borderRadius: 7, border: `1px solid ${grossProfit >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}`, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: grossProfit >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>Gross Profit</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: grossProfit >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>{money(grossProfit)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{grossMarginPct.toFixed(1)}% gross margin</div>
        </div>
      </div>

      {/* Overhead */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', padding: '8px 0 6px' }}>Overhead Allocation</div>
      {pl.overhead.map((o, i) => (
        <PLLine key={i} label={o.label} amount={o.amount} indent
          onClick={() => onDrill({ title: o.label, rows: [{ label: 'Allocated', value: money(o.amount) }, { label: 'Rate', value: '8% of revenue' }] })} />
      ))}

      {/* Net Profit */}
      <div style={{ margin: '10px 0', padding: '12px 14px', background: netProfit >= 0 ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)', borderRadius: 8, border: `1px solid ${netProfit >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.25)'}`, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: netProfit >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>Net Profit (Job)</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            Budgeted: {pl.budgetedMargin}% · Actual: {netMarginPct.toFixed(1)}%
            <span style={{ marginLeft: 8, color: budgetVariance < -1 ? 'var(--status-warning)' : 'var(--status-profit)', fontWeight: 600 }}>
              ({budgetVariance >= 0 ? '+' : ''}{budgetVariance.toFixed(1)}% vs budget)
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: netProfit >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>{money(netProfit)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{netMarginPct.toFixed(1)}%</div>
        </div>
      </div>

      {/* Notes */}
      {pl.notes && (
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid var(--color-brand-border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PM Notes</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pl.notes}</div>
        </div>
      )}
    </div>
  );
}

export default function PnLByJob() {
  const [selectedProject, setSelected] = useState(1);
  const [compareProject, setCompare]   = useState(null);
  const [drill, setDrill]              = useState(null);

  const availableProjects = PROJECTS.filter(p => JOB_PL[p.id]);
  const proj = PROJECTS.find(p => p.id === selectedProject);
  const pl   = JOB_PL[selectedProject];
  const compProj = compareProject ? PROJECTS.find(p => p.id === compareProject) : null;
  const compPL   = compareProject ? JOB_PL[compareProject] : null;

  return (
    <div className="space-y-5">
      <DrillModal drill={drill} onClose={() => setDrill(null)} />

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Profit & Loss by Job</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Click any line item to drill into transactions. As of February 22, 2026.</p>
      </div>

      {/* Project selector */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px', maxWidth: 300 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary Project</div>
          <select value={selectedProject} onChange={e => setSelected(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px', maxWidth: 300 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Compare With (optional)</div>
          <select value={compareProject || ''} onChange={e => setCompare(e.target.value ? Number(e.target.value) : null)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="">— No comparison —</option>
            {availableProjects.filter(p => p.id !== selectedProject).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: compareProject ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Primary P&L */}
        {proj && pl && (
          <div>
            <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{proj.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{proj.code} · {proj.type} · PM: {proj.pm} · Phase: {proj.phase}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                  {[['Contract', money(proj.contract, true)], ['Spent', money(proj.spent, true)], ['Progress', proj.pct + '%'], ['Budget Margin', proj.margin_pct + '%']].map(([l, v]) => (
                    <div key={l}><span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{l}: </span><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span></div>
                  ))}
                </div>
              </div>
              <JobPL project={proj} pl={pl} onDrill={setDrill} />
            </div>
          </div>
        )}

        {/* Comparison P&L */}
        {compProj && compPL && (
          <div>
            <div style={{ background: 'var(--color-brand-card)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{compProj.name} <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 400 }}>comparison</span></div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{compProj.code} · {compProj.type} · PM: {compProj.pm}</div>
              </div>
              <JobPL project={compProj} pl={compPL} onDrill={setDrill} />
            </div>
          </div>
        )}
      </div>

      {/* Summary table across all available jobs */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>All Jobs — Margin Summary</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {['Project', 'Contract', 'Costs to Date', 'Revenue Recognized', 'Gross Profit', 'Gross Margin', 'Budgeted', 'Variance'].map(h => (
              <th key={h} style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: h === 'Project' ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {availableProjects.map((p, i) => {
              const pl = JOB_PL[p.id];
              const rev = pl.revenue.reduce((s, r) => s + (r.derived ? r.calc(pl.revenue) : r.amount), 0);
              const costs = pl.direct.reduce((s, c) => s + c.amount, 0);
              const gp = rev - costs;
              const gm = rev > 0 ? (gp / rev * 100) : 0;
              const variance = gm - pl.budgetedMargin;
              return (
                <tr key={p.id} onClick={() => setSelected(p.id)} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', background: selectedProject === p.id ? 'rgba(59,130,246,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: selectedProject === p.id ? '#3b82f6' : 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(p.contract, true)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(costs, true)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: '#3b82f6' }}>{money(rev, true)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: gp >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>{money(gp, true)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: gm >= pl.budgetedMargin ? 'var(--status-profit)' : 'var(--status-warning)' }}>{gm.toFixed(1)}%</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-tertiary)' }}>{pl.budgetedMargin}%</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: variance >= 0 ? 'var(--status-profit)' : 'var(--status-warning)' }}>
                    {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
