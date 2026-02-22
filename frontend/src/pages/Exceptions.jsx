import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import {
  AlertOctagon, AlertTriangle, Info,
  Hash, Copy, ShieldOff, FileQuestion, FileX, TrendingDown,
  Users, CheckCircle, TriangleAlert, Layers,
} from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const DEMO_DATA = [
  {
    id: 1,
    type: 'unmapped_cost_code',
    description: 'Cost code 09-220 not found in master chart — PRJ-042 lumber invoice #7714',
    priority: 'high',
    status: 'open',
    assigned_to: null,
    created_at: '2026-02-20T10:00:00Z',
    age_days: 2,
  },
  {
    id: 2,
    type: 'duplicate_invoice',
    description: 'Invoice INV-8843 from ABC Plumbing appears to match INV-8801 — same amount $4,200',
    priority: 'critical',
    status: 'open',
    assigned_to: null,
    created_at: '2026-02-21T08:30:00Z',
    age_days: 1,
  },
  {
    id: 3,
    type: 'expired_coi',
    description: 'Certificate of Insurance for Williams Electric expired 2026-02-15 — active on PRJ-038',
    priority: 'critical',
    status: 'assigned',
    assigned_to: 'Sarah M.',
    created_at: '2026-02-16T07:00:00Z',
    age_days: 6,
  },
  {
    id: 4,
    type: 'low_confidence_ocr',
    description: 'OCR confidence 38% on vendor invoice scan — PRJ-051 HVAC materials receipt',
    priority: 'normal',
    status: 'open',
    assigned_to: null,
    created_at: '2026-02-21T14:00:00Z',
    age_days: 1,
  },
  {
    id: 5,
    type: 'missing_lien_waiver',
    description: 'No lien waiver on file for Jensen Concrete — payment of $18,500 pending release',
    priority: 'high',
    status: 'open',
    assigned_to: null,
    created_at: '2026-02-19T11:00:00Z',
    age_days: 3,
  },
  {
    id: 6,
    type: 'budget_overrun',
    description: 'PRJ-051 framing budget exceeded by $6,200 (108% consumed) — 3 weeks remaining',
    priority: 'critical',
    status: 'assigned',
    assigned_to: 'Jake R.',
    created_at: '2026-02-18T09:00:00Z',
    age_days: 4,
  },
];

/* ── Config Maps ───────────────────────────────────────────────────────── */

const TYPE_CONFIG = {
  unmapped_cost_code:  { label: 'Unmapped Cost Code',  Icon: Hash,         color: 'var(--accent)' },
  duplicate_invoice:   { label: 'Duplicate Invoice',   Icon: Copy,         color: 'var(--status-warning)' },
  expired_coi:         { label: 'Expired COI',         Icon: ShieldOff,    color: 'var(--status-loss)' },
  low_confidence_ocr:  { label: 'Low Confidence OCR',  Icon: FileQuestion, color: 'var(--text-secondary)' },
  missing_lien_waiver: { label: 'Missing Lien Waiver', Icon: FileX,        color: 'var(--status-warning)' },
  budget_overrun:      { label: 'Budget Overrun',      Icon: TrendingDown, color: 'var(--status-loss)' },
};

const PRIORITY_CONFIG = {
  critical: {
    Icon: AlertOctagon,
    color: 'var(--status-loss)',
    bg: 'color-mix(in srgb, var(--status-loss) 12%, transparent)',
    border: 'color-mix(in srgb, var(--status-loss) 25%, transparent)',
    label: 'Critical',
  },
  high: {
    Icon: AlertTriangle,
    color: 'var(--status-warning)',
    bg: 'color-mix(in srgb, var(--status-warning) 12%, transparent)',
    border: 'color-mix(in srgb, var(--status-warning) 25%, transparent)',
    label: 'High',
  },
  normal: {
    Icon: Info,
    color: 'var(--status-neutral)',
    bg: 'color-mix(in srgb, var(--status-neutral) 12%, transparent)',
    border: 'color-mix(in srgb, var(--status-neutral) 25%, transparent)',
    label: 'Normal',
  },
};

const STATUS_CONFIG = {
  open: {
    color: 'var(--text-secondary)',
    bg: 'var(--bg-elevated)',
    border: 'var(--border-medium)',
    label: 'Open',
  },
  assigned: {
    color: 'var(--accent)',
    bg: 'var(--accent-bg)',
    border: 'var(--accent-border)',
    label: 'Assigned',
  },
  resolved: {
    color: 'var(--status-profit)',
    bg: 'color-mix(in srgb, var(--status-profit) 12%, transparent)',
    border: 'color-mix(in srgb, var(--status-profit) 25%, transparent)',
    label: 'Resolved',
  },
};

const STATUS_TABS = ['all', 'open', 'assigned', 'resolved'];
const TYPE_TABS   = ['all', ...Object.keys(TYPE_CONFIG)];

function PriorityBadge({ priority }) {
  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
      style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
    >
      <p.Icon size={11} />
      {p.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function TypeCell({ type }) {
  const cfg = TYPE_CONFIG[type];
  if (!cfg) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{type}</span>;
  const { Icon, color, label } = cfg;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <Icon size={13} />
      {label}
    </span>
  );
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function Exceptions() {
  const [items, setItems]         = useState(DEMO_DATA);
  const [loading, setLoading]     = useState(true);
  const [isDemo, setIsDemo]       = useState(false);
  const [statusTab, setStatusTab] = useState('all');
  const [typeTab, setTypeTab]     = useState('all');
  const [resolved, setResolved]   = useState({});  // id → true
  const [assigned, setAssigned]   = useState({});  // id → name
  const [working, setWorking]     = useState({});

  useEffect(() => {
    api.exceptions()
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          setIsDemo(
            data.length > 0 &&
            data[0]?.created_at === DEMO_DATA[0].created_at
          );
        } else {
          setIsDemo(true);
        }
      })
      .catch(() => setIsDemo(true))
      .finally(() => setLoading(false));
  }, []);

  const openCount     = items.filter((i) => !resolved[i.id] && i.status !== 'resolved').length;
  const criticalCount = items.filter((i) => i.priority === 'critical' && !resolved[i.id]).length;
  const assignedCount = items.filter((i) => (assigned[i.id] || i.assigned_to) && !resolved[i.id]).length;
  const resolvedToday = Object.keys(resolved).length;

  const filtered = items.filter((item) => {
    const statusMatch =
      statusTab === 'all' ||
      (statusTab === 'resolved' && (resolved[item.id] || item.status === 'resolved')) ||
      (statusTab !== 'resolved' && !resolved[item.id] && item.status === statusTab);
    const typeMatch = typeTab === 'all' || item.type === typeTab;
    return statusMatch && typeMatch;
  });

  function effectiveStatus(item) {
    if (resolved[item.id] || item.status === 'resolved') return 'resolved';
    if (assigned[item.id] || item.status === 'assigned')  return 'assigned';
    return 'open';
  }

  async function handleResolve(id) {
    setWorking((w) => ({ ...w, [id]: true }));
    try { await api.resolveException(id); } catch (_) { /* optimistic */ }
    setResolved((r) => ({ ...r, [id]: true }));
    setWorking((w) => ({ ...w, [id]: false }));
  }

  async function handleAssign(id) {
    const to = 'Me'; // In production, open a picker modal
    setWorking((w) => ({ ...w, [id]: true }));
    try { await api.assignException(id, to); } catch (_) { /* optimistic */ }
    setAssigned((a) => ({ ...a, [id]: to }));
    setWorking((w) => ({ ...w, [id]: false }));
  }

  const SkeletonRow = () => (
    <tr>
      {[1,2,3,4,5,6,7].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-elevated)', width: i === 2 ? '85%' : '55%' }} />
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
          Exception Queue
        </h1>
        {openCount > 0 && (
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
            style={{ background: 'var(--status-loss)', color: '#fff' }}
          >
            {openCount}
          </span>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Open Exceptions" value={openCount}     icon={TriangleAlert} sub="awaiting triage" />
        <KPICard label="Critical"        value={criticalCount} icon={AlertOctagon}  sub="requires immediate action" />
        <KPICard label="Assigned"        value={assignedCount} icon={Users}         sub="in progress" />
        <KPICard label="Resolved Today"  value={resolvedToday} icon={CheckCircle}   sub="this session" />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Status tabs */}
        <div
          className="flex gap-1 overflow-x-auto flex-1"
          style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1px' }}
        >
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className="px-4 py-2.5 text-sm font-medium whitespace-nowrap capitalize transition-colors"
              style={{
                borderBottom: statusTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                color: statusTab === t ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {t === 'all' ? 'All Statuses' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => {
          const cfg = TYPE_CONFIG[t];
          const active = typeTab === t;
          return (
            <button
              key={t}
              onClick={() => setTypeTab(t)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: active ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              }}
            >
              {cfg && <cfg.Icon size={11} />}
              {t === 'all' ? 'All Types' : cfg?.label ?? t}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        {!loading && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle size={40} style={{ color: 'var(--status-profit)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              No exceptions match the current filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mc-table w-full">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((item) => {
                      const status = effectiveStatus(item);
                      const assignee = assigned[item.id] || item.assigned_to;
                      const isResolved = status === 'resolved';
                      const busy = working[item.id];
                      return (
                        <tr key={item.id} style={{ opacity: isResolved ? 0.55 : 1 }}>
                          <td style={{ minWidth: 160 }}><TypeCell type={item.type} /></td>
                          <td style={{ maxWidth: 340 }}>
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {item.description}
                            </span>
                          </td>
                          <td><PriorityBadge priority={item.priority} /></td>
                          <td><StatusBadge status={status} /></td>
                          <td style={{ color: assignee ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                            {assignee || '—'}
                          </td>
                          <td>
                            <span
                              className="num font-medium"
                              style={{
                                color: (item.age_days ?? 0) >= 5
                                  ? 'var(--status-loss)'
                                  : (item.age_days ?? 0) >= 2
                                    ? 'var(--status-warning)'
                                    : 'var(--text-secondary)',
                              }}
                            >
                              {item.age_days ?? 0}d
                            </span>
                          </td>
                          <td>
                            {isResolved ? (
                              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--status-profit)' }}>
                                <CheckCircle size={13} /> Resolved
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                {!assignee && (
                                  <button
                                    onClick={() => handleAssign(item.id)}
                                    disabled={busy}
                                    className="px-3 py-1 rounded text-xs font-semibold transition-opacity disabled:opacity-50"
                                    style={{
                                      background: 'var(--accent-bg)',
                                      color: 'var(--accent)',
                                      border: '1px solid var(--accent-border)',
                                    }}
                                  >
                                    Assign
                                  </button>
                                )}
                                <button
                                  onClick={() => handleResolve(item.id)}
                                  disabled={busy}
                                  className="px-3 py-1 rounded text-xs font-semibold transition-opacity disabled:opacity-50"
                                  style={{
                                    background: 'color-mix(in srgb, var(--status-profit) 12%, transparent)',
                                    color: 'var(--status-profit)',
                                    border: '1px solid color-mix(in srgb, var(--status-profit) 25%, transparent)',
                                  }}
                                >
                                  Resolve
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

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Layers size={13} />
          <span>{filtered.length} exception{filtered.length !== 1 ? 's' : ''} shown</span>
        </div>
      )}
    </div>
  );
}
