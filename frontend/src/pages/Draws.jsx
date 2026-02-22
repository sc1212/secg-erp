import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { money } from '../lib/format';

const DRAWS = [
  {
    id: 'DRW-007', project: 'Riverside Custom',   draw: 'Draw #2', amount: 58000, submitted: '2026-02-10', status: 'outstanding', age_days: 12,
    line_items: [
      { desc: 'Framing — 75% complete',     scheduled: 95000, prev: 0,     this_period: 71250, balance: 23750 },
      { desc: 'Concrete — 100% complete',   scheduled: 42000, prev: 21000, this_period: 21000, balance: 0 },
      { desc: 'Rough Plumbing — 50%',       scheduled: 38000, prev: 0,     this_period: 19000, balance: 19000 },
    ],
  },
  {
    id: 'DRW-006', project: 'Magnolia Spec',       draw: 'Draw #2', amount: 58000, submitted: '2026-01-31', status: 'outstanding', age_days: 22,
    line_items: [
      { desc: 'Roofing — 100% complete',    scheduled: 22000, prev: 11000, this_period: 11000, balance: 0 },
      { desc: 'HVAC — 80% complete',        scheduled: 26000, prev: 0,     this_period: 20800, balance: 5200 },
      { desc: 'Drywall — 70% complete',     scheduled: 20000, prev: 0,     this_period: 14000, balance: 6000 },
      { desc: 'Finishes — 40%',             scheduled: 30000, prev: 0,     this_period: 12000, balance: 18000 },
    ],
  },
  {
    id: 'DRW-005', project: 'Elm St Multifamily',  draw: 'Draw #3', amount: 120000, submitted: '2026-01-28', status: 'outstanding', age_days: 25,
    line_items: [
      { desc: 'Sitework — 100%',            scheduled: 48000, prev: 48000, this_period: 0,      balance: 0 },
      { desc: 'Concrete — 80%',             scheduled: 96000, prev: 40000, this_period: 36800,  balance: 19200 },
      { desc: 'Framing Level 1 — 100%',     scheduled: 140000, prev: 0,   this_period: 140000, balance: 0 },
    ],
  },
  {
    id: 'DRW-004', project: 'Elm St Multifamily',  draw: 'Draw #2', amount: 85000, submitted: '2025-12-15', status: 'paid', age_days: 0,
    line_items: [
      { desc: 'Sitework — 80%',             scheduled: 48000, prev: 0,    this_period: 38400, balance: 9600 },
      { desc: 'Foundation — complete',       scheduled: 64000, prev: 0,   this_period: 64000, balance: 0 },
    ],
  },
  {
    id: 'DRW-003', project: 'Riverside Custom',   draw: 'Draw #1', amount: 58000, submitted: '2025-12-20', status: 'paid', age_days: 0,
    line_items: [
      { desc: 'Sitework — 100%',            scheduled: 18000, prev: 0,  this_period: 18000, balance: 0 },
      { desc: 'Foundation — 100%',          scheduled: 42000, prev: 0,  this_period: 42000, balance: 0 },
    ],
  },
  {
    id: 'DRW-002', project: 'Johnson Office TI',   draw: 'Draw #4', amount: 48000, submitted: '2026-01-20', status: 'paid', age_days: 0,
    line_items: [
      { desc: 'Electrical — 90%',           scheduled: 22000, prev: 11000, this_period: 9800, balance: 1200 },
      { desc: 'HVAC — 100%',               scheduled: 16000, prev: 8000,  this_period: 8000, balance: 0 },
      { desc: 'Drywall — 95%',             scheduled: 14000, prev: 0,     this_period: 13300, balance: 700 },
    ],
  },
];

const STATUS_COLOR = {
  outstanding: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Outstanding' },
  paid:        { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Paid' },
  draft:       { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.05)', label: 'Draft' },
};

const FILTERS = ['All', 'Outstanding', 'Paid'];

export default function Draws() {
  const navigate = useNavigate();
  const [filter, setFilter]       = useState('All');
  const [expandedId, setExpanded] = useState(null);

  const rows = DRAWS.filter(d => filter === 'All' || (filter === 'Outstanding' && d.status === 'outstanding') || (filter === 'Paid' && d.status === 'paid'));
  const totalOutstanding = DRAWS.filter(d => d.status === 'outstanding').reduce((s,d)=>s+d.amount,0);

  const thBase = { padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Draw Requests</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {DRAWS.filter(d=>d.status==='outstanding').length} outstanding  ·  {money(totalOutstanding)} pending payment
          </p>
        </div>
        <button onClick={() => alert('New draw wizard — select project, enter line items, and submit to lender.')} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + New Draw Request
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${filter === f ? '#3b82f6' : 'var(--color-brand-border)'}`, background: filter === f ? 'rgba(59,130,246,0.14)' : 'transparent', color: filter === f ? '#3b82f6' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(draw => {
          const sc = STATUS_COLOR[draw.status];
          const isExpanded = expandedId === draw.id;
          return (
            <div key={draw.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
              <div
                onClick={() => setExpanded(isExpanded ? null : draw.id)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{draw.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{draw.project}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{draw.draw}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{money(draw.amount)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Submitted: {draw.submitted}</span>
                  {draw.status === 'outstanding' && draw.age_days > 14 && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--status-warning)', padding: '2px 7px', borderRadius: 4, background: 'rgba(251,191,36,0.1)' }}>{draw.age_days} days outstanding</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--color-brand-border)' }}>
                  <div style={{ paddingTop: 14, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Line Item','Scheduled Value','Prev Billed','This Period','Balance to Bill'].map((h,i) => (
                            <th key={h} style={{ ...thBase, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {draw.line_items.map((li, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                            <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-primary)' }}>{li.desc}</td>
                            <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(li.scheduled)}</td>
                            <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(li.prev)}</td>
                            <td style={{ padding: '9px 12px', fontSize: 12, color: '#3b82f6', fontFamily: 'monospace', textAlign: 'right', fontWeight: 600 }}>{money(li.this_period)}</td>
                            <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(li.balance)}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>TOTAL</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(draw.line_items.reduce((s,l)=>s+l.scheduled,0))}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(draw.line_items.reduce((s,l)=>s+l.prev,0))}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: '#3b82f6' }}>{money(draw.amount)}</td>
                          <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(draw.line_items.reduce((s,l)=>s+l.balance,0))}</td>
                        </tr>
                      </tbody>
                    </table>
                    {draw.status === 'outstanding' && (
                      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                        <button onClick={() => alert(`Following up on ${draw.id} with lender...`)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Send Reminder</button>
                        <button onClick={() => navigate(`/projects/${draw.id.slice(-1)}`)} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>View Project</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
