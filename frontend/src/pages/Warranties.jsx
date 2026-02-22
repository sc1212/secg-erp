import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PROJECTS } from '../lib/demoData';
import { money } from '../lib/format';

const WARRANTIES = [
  { id: 1, project: 1, date: '2026-01-15', category: 'Plumbing',    desc: 'Slow drain in master bath — partial clog', severity: 'normal', status: 'scheduled',   assigned: 'Zach Monroe',   scheduledDate: '2026-02-28', cost: 180,  chargedTo: 'Warranty Reserve' },
  { id: 2, project: 1, date: '2026-02-01', category: 'HVAC',         desc: 'Thermostat not reaching set temp in upstairs bedroom', severity: 'urgent', status: 'in_progress', assigned: 'Zach Monroe', scheduledDate: '2026-02-22', cost: 450, chargedTo: 'Subcontractor' },
  { id: 3, project: 2, date: '2026-02-10', category: 'Drywall',      desc: 'Nail pops in living room ceiling — cosmetic', severity: 'cosmetic', status: 'reported', assigned: null, scheduledDate: null, cost: null, chargedTo: null },
  { id: 4, project: 1, date: '2025-11-20', category: 'Exterior',     desc: 'Gutter pulling away from fascia at rear corner', severity: 'normal', status: 'completed', assigned: 'Connor Webb',  scheduledDate: null, cost: 275,  chargedTo: 'Warranty Reserve' },
  { id: 5, project: 3, date: '2026-02-18', category: 'Electrical',   desc: 'Kitchen island outlet not working — GFI trip', severity: 'urgent', status: 'assessed', assigned: null, scheduledDate: null, cost: null, chargedTo: null },
  { id: 6, project: 4, date: '2026-02-05', category: 'Millwork',     desc: 'Cabinet doors not aligning after humidity shift', severity: 'cosmetic', status: 'scheduled', assigned: 'Joseph Hall', scheduledDate: '2026-03-05', cost: 320, chargedTo: 'Owner' },
  { id: 7, project: 2, date: '2025-12-10', category: 'Foundation',   desc: 'Hairline crack in foundation wall — monitoring', severity: 'normal', status: 'completed', assigned: 'Connor Webb', scheduledDate: null, cost: 0, chargedTo: 'Warranty Reserve' },
];

const STATUS_COLOR = {
  reported:    { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)',  label: 'Reported' },
  assessed:    { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)',  label: 'Assessed' },
  scheduled:   { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)',  label: 'Scheduled' },
  in_progress: { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'In Progress' },
  completed:   { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)', label: 'Completed' },
};

const SEVERITY_COLOR = {
  urgent:   { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)' },
  normal:   { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.06)' },
  cosmetic: { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.04)' },
};

export default function Warranties() {
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Open', 'Completed'];
  const filtered = WARRANTIES.filter(w => {
    if (statusFilter === 'Open') return w.status !== 'completed';
    if (statusFilter === 'Completed') return w.status === 'completed';
    return true;
  });

  const open = WARRANTIES.filter(w => w.status !== 'completed').length;
  const urgent = WARRANTIES.filter(w => w.severity === 'urgent' && w.status !== 'completed').length;
  const totalCost = WARRANTIES.filter(w => w.cost != null).reduce((s, w) => s + w.cost, 0);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Warranty &amp; Callbacks</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{WARRANTIES.length} items tracked &middot; {open} open</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          ['Open Items', open, open > 0 ? 'var(--status-warning)' : 'var(--status-profit)'],
          ['Urgent Items', urgent, urgent > 0 ? 'var(--status-loss)' : 'var(--status-profit)'],
          ['Total Resolution Cost', money(totalCost, true), 'var(--text-primary)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {urgent > 0 && (
        <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: 'var(--status-loss)', flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--status-loss)' }}>{urgent} urgent item{urgent > 1 ? 's' : ''}</strong> — requires immediate scheduling and response to owner.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${statusFilter === s ? '#3b82f6' : 'var(--color-brand-border)'}`,
            background: statusFilter === s ? 'rgba(59,130,246,0.14)' : 'transparent',
            color: statusFilter === s ? '#3b82f6' : 'var(--text-secondary)',
          }}>{s}</button>
        ))}
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Date','Project','Category','Description','Severity','Status','Assigned','Cost','Charged To'].map((h, i) => (
              <th key={h} style={{ ...thBase, textAlign: i === 7 ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(w => {
              const sc = STATUS_COLOR[w.status] || STATUS_COLOR.reported;
              const sev = SEVERITY_COLOR[w.severity] || SEVERITY_COLOR.normal;
              const proj = PROJECTS.find(p => p.id === w.project);
              return (
                <tr key={w.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{w.date}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{proj?.name?.split(' ').slice(0, 2).join(' ')}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{w.category}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', maxWidth: 240 }}>{w.desc}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sev.bg, color: sev.color, textTransform: 'capitalize' }}>{w.severity}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{w.assigned || '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{w.cost != null ? money(w.cost) : '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: 11, color: 'var(--text-tertiary)' }}>{w.chargedTo || '—'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No items match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
