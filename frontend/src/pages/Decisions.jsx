import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { money, shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import { AlertTriangle, CheckCircle, CheckSquare, Clock, DollarSign, Filter, ListChecks, Table, XCircle } from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const DEMO_DATA = [
  {
    id: 1,
    type: 'PO',
    ref: 'PO-0047',
    description: 'Framing lumber — PRJ-042 Phase 2',
    entity: 'PRJ-042',
    amount: 12500,
    requested_by: 'Jake R.',
    submitted: '2026-02-20',
    created_at: '2026-02-20T08:00:00Z',
    status: 'pending',
  },
  {
    id: 2,
    type: 'CO',
    ref: 'CO-023',
    description: 'Foundation waterproofing scope addition — PRJ-038',
    entity: 'PRJ-038',
    amount: 8750,
    requested_by: 'Sarah M.',
    submitted: '2026-02-19',
    created_at: '2026-02-19T14:30:00Z',
    status: 'pending',
  },
  {
    id: 3,
    type: 'DR',
    ref: 'Draw #3',
    description: 'Progress draw — PRJ-042 50% complete',
    entity: 'PRJ-042',
    amount: 45200,
    requested_by: 'Mike S.',
    submitted: '2026-02-17',
    created_at: '2026-02-17T09:15:00Z',
    status: 'pending',
  },
  {
    id: 4,
    type: 'PO',
    ref: 'PO-0046',
    description: 'HVAC rough-in equipment — PRJ-051',
    entity: 'PRJ-051',
    amount: 3200,
    requested_by: 'Zach P.',
    submitted: '2026-02-21',
    created_at: '2026-02-21T11:00:00Z',
    status: 'pending',
  },
];

const TYPE_STYLES = {
  PO: { label: 'Purchase Order', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  CO: { label: 'Change Order',   color: 'var(--status-warning)', bg: 'color-mix(in srgb, var(--status-warning) 12%, transparent)', border: 'color-mix(in srgb, var(--status-warning) 25%, transparent)' },
  DR: { label: 'Draw Request',   color: 'var(--status-profit)',  bg: 'color-mix(in srgb, var(--status-profit) 12%, transparent)',  border: 'color-mix(in srgb, var(--status-profit) 25%, transparent)' },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'PO',  label: 'Purchase Orders' },
  { key: 'CO',  label: 'Change Orders' },
  { key: 'DR',  label: 'Draw Requests' },
];

function ageColor(days) {
  if (days >= 5) return 'var(--status-loss)';
  if (days >= 2) return 'var(--status-warning)';
  return 'var(--text-secondary)';
}

function daysSince(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86_400_000);
}

function TypeBadge({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.PO;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {type}
    </span>
  );
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function Decisions() {
  const [queue, setQueue]         = useState(DEMO_DATA);
  const [loading, setLoading]     = useState(true);
  const [isDemo, setIsDemo]       = useState(false);
  const [activeFilter, setFilter] = useState('all');
  const [decisions, setDecisions] = useState({}); // id → 'approved' | 'rejected'
  const [working, setWorking]     = useState({}); // id → true while in-flight

  useEffect(() => {
    api.approvalQueue()
      .then((data) => {
        setQueue(Array.isArray(data) ? data : DEMO_DATA);
        const demo =
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0]?.created_at === 'string' &&
          data[0].created_at === DEMO_DATA[0].created_at;
        setIsDemo(demo);
      })
      .catch(() => setIsDemo(true))
      .finally(() => setLoading(false));
  }, []);

  const pending = queue.filter((r) => !decisions[r.id]);
  const approvedToday = Object.values(decisions).filter((d) => d === 'approved').length;
  const totalPending  = pending.reduce((s, r) => s + (r.amount || 0), 0);
  const oldestAge     = pending.length
    ? Math.max(...pending.map((r) => daysSince(r.submitted || r.created_at)))
    : 0;

  const filtered = queue.filter((r) => activeFilter === 'all' || r.type === activeFilter);

  async function handleApprove(id) {
    setWorking((w) => ({ ...w, [id]: true }));
    try { await api.approveRequest(id); } catch (_) { /* optimistic */ }
    setDecisions((d) => ({ ...d, [id]: 'approved' }));
    setWorking((w) => ({ ...w, [id]: false }));
  }

  async function handleReject(id) {
    setWorking((w) => ({ ...w, [id]: true }));
    try { await api.rejectRequest(id); } catch (_) { /* optimistic */ }
    setDecisions((d) => ({ ...d, [id]: 'rejected' }));
    setWorking((w) => ({ ...w, [id]: false }));
  }

  /* skeleton row */
  const SkeletonRow = () => (
    <tr>
      {[1,2,3,4,5,6,7].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-elevated)', width: i === 3 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Decision Queue
        </h1>
        {pending.length > 0 && (
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
            style={{ background: 'var(--status-warning)', color: '#fff' }}
          >
            {pending.length}
          </span>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Pending Approvals" value={pending.length}      icon={Clock}       sub="awaiting decision" />
        <KPICard label="Total $ Pending"   value={money(totalPending)} icon={DollarSign}  sub="across all types" />
        <KPICard label="Oldest Item"       value={`${oldestAge}d`}     icon={AlertTriangle} sub={oldestAge >= 5 ? 'needs attention' : 'age in days'} />
        <KPICard label="Approved Today"    value={approvedToday}        icon={CheckSquare} sub="this session" />
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-1 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1px' }}
      >
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              borderBottom: activeFilter === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeFilter === t.key ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        {!loading && filtered.length === 0 && pending.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle size={40} style={{ color: 'var(--status-profit)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              All clear — no pending approvals
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mc-table w-full">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Ref / Description</th>
                  <th>Entity</th>
                  <th className="text-right">Amount</th>
                  <th>Requested By</th>
                  <th>Submitted</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((row) => {
                      const decision = decisions[row.id];
                      const age = daysSince(row.submitted || row.created_at);
                      const busy = working[row.id];
                      return (
                        <tr key={row.id} style={{ opacity: decision ? 0.6 : 1 }}>
                          <td><TypeBadge type={row.type} /></td>
                          <td>
                            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {row.ref}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {row.description}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{row.entity}</td>
                          <td className="num text-right font-bold" style={{ color: 'var(--text-primary)' }}>
                            {money(row.amount)}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{row.requested_by}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{shortDate(row.submitted)}</td>
                          <td>
                            <span className="num font-medium" style={{ color: ageColor(age) }}>
                              {age}d
                            </span>
                          </td>
                          <td>
                            {decision === 'approved' && (
                              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--status-profit)' }}>
                                <CheckCircle size={14} /> Approved
                              </span>
                            )}
                            {decision === 'rejected' && (
                              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--status-loss)' }}>
                                <XCircle size={14} /> Rejected
                              </span>
                            )}
                            {!decision && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(row.id)}
                                  disabled={busy}
                                  className="px-3 py-1 rounded text-xs font-semibold transition-opacity disabled:opacity-50"
                                  style={{
                                    background: 'color-mix(in srgb, var(--status-profit) 15%, transparent)',
                                    color: 'var(--status-profit)',
                                    border: '1px solid color-mix(in srgb, var(--status-profit) 30%, transparent)',
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(row.id)}
                                  disabled={busy}
                                  className="px-3 py-1 rounded text-xs font-semibold transition-opacity disabled:opacity-50"
                                  style={{
                                    background: 'color-mix(in srgb, var(--status-loss) 12%, transparent)',
                                    color: 'var(--status-loss)',
                                    border: '1px solid color-mix(in srgb, var(--status-loss) 25%, transparent)',
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary footer */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <ListChecks size={13} />
          <span>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} shown
            {activeFilter !== 'all' ? ` · filtered by ${TYPE_STYLES[activeFilter]?.label ?? activeFilter}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
