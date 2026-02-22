/**
 * Draws — Draw Request Builder & Tracker
 * Lists all draw requests across projects with status tracking.
 */
import { useState, useEffect } from 'react';
import { Building2, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

const DEMO_DRAWS = [
  {
    id: 1, project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood',
    draw_number: 1, amount_requested: 38500, amount_approved: 38500,
    status: 'funded', submitted_date: '2026-01-15', funded_date: '2026-01-22', lender: 'First Bank Construction',
  },
  {
    id: 2, project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood',
    draw_number: 2, amount_requested: 42100, amount_approved: 41800,
    status: 'funded', submitted_date: '2026-02-05', funded_date: '2026-02-12', lender: 'First Bank Construction',
  },
  {
    id: 3, project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood',
    draw_number: 3, amount_requested: 45200, amount_approved: null,
    status: 'submitted', submitted_date: '2026-02-20', funded_date: null, lender: 'First Bank Construction',
  },
  {
    id: 4, project_id: 2, project_code: 'PRJ-038', project_name: 'Spec Home — Franklin',
    draw_number: 1, amount_requested: 31000, amount_approved: 31000,
    status: 'funded', submitted_date: '2026-01-28', funded_date: '2026-02-04', lender: 'Southeast Capital',
  },
  {
    id: 5, project_id: 3, project_code: 'PRJ-051', project_name: 'Remodel — Green Hills',
    draw_number: 1, amount_requested: 18500, amount_approved: null,
    status: 'draft', submitted_date: null, funded_date: null, lender: 'Cash / Owner-funded',
  },
];

const STATUS_STYLES = {
  draft:     { bg: 'var(--bg-elevated)', color: 'var(--text-muted)',    label: 'Draft' },
  submitted: { bg: 'var(--status-warning-bg, var(--accent-bg))', color: 'var(--status-warning)', label: 'Submitted' },
  funded:    { bg: 'var(--status-profit-bg, var(--accent-bg))', color: 'var(--status-profit)',  label: 'Funded' },
  rejected:  { bg: 'var(--status-loss-bg, var(--accent-bg))',   color: 'var(--status-loss)',    label: 'Rejected' },
};

function fmt(n) {
  if (n == null) return '—';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Draws() {
  const [draws, setDraws] = useState(DEMO_DRAWS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.drawRequests()
      .then(data => { if (data && data.length > 0) setDraws(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? draws : draws.filter(d => d.status === filter);

  const totalFunded   = draws.filter(d => d.status === 'funded').reduce((s, d) => s + (d.amount_approved || 0), 0);
  const totalPending  = draws.filter(d => d.status === 'submitted').reduce((s, d) => s + (d.amount_requested || 0), 0);
  const draftCount    = draws.filter(d => d.status === 'draft').length;

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Draws</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Construction loan draw requests across all active projects
          </p>
        </div>
        <button
          className="px-4 py-2 rounded text-sm font-medium"
          style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
        >
          + New Draw Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Funded', value: fmt(totalFunded), icon: CheckCircle, color: 'var(--status-profit)' },
          { label: 'Pending Review', value: fmt(totalPending), icon: Clock, color: 'var(--status-warning)' },
          { label: 'Total Draws', value: draws.length, icon: Building2, color: 'var(--accent)' },
          { label: 'Draft', value: draftCount, icon: AlertTriangle, color: 'var(--text-muted)' },
        ].map(card => (
          <div
            key={card.label}
            className="rounded-lg p-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} style={{ color: card.color }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{card.label}</span>
            </div>
            <div className="text-xl font-bold num" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4">
        {['all', 'draft', 'submitted', 'funded'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded text-xs font-medium capitalize"
            style={{
              background: filter === s ? 'var(--accent)' : 'var(--bg-elevated)',
              color: filter === s ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {s === 'all' ? 'All' : (STATUS_STYLES[s]?.label || s)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <table className="mc-table w-full">
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Project</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Draw #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Lender</th>
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Requested</th>
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Approved</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Funded</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const st = STATUS_STYLES[d.status] || STATUS_STYLES.draft;
              return (
                <tr
                  key={d.id}
                  style={{
                    background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{d.project_code}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.project_name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">Draw #{d.draw_number}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{d.lender || '—'}</td>
                  <td className="px-4 py-3 text-sm num text-right font-medium">{fmt(d.amount_requested)}</td>
                  <td className="px-4 py-3 text-sm num text-right" style={{ color: d.amount_approved ? 'var(--status-profit)' : 'var(--text-muted)' }}>
                    {fmt(d.amount_approved)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{d.submitted_date || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: d.funded_date ? 'var(--status-profit)' : 'var(--text-muted)' }}>
                    {d.funded_date || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No draws found
          </div>
        )}
      </div>
    </div>
  );
}
