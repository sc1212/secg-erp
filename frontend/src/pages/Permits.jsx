import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { money, shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import { AlertTriangle, Building, Building2, CalendarDays, CheckCircle, Clock, Droplets, FileCheck, Flame, HardHat, HelpCircle, Shovel, Table, XCircle, Zap } from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const DEMO_PERMITS = [
  {
    id: 1,
    project: 'PRJ-042',
    permit_number: 'BP-2025-0441',
    type: 'building',
    description: 'New residential construction — 3,200 sf single-family',
    authority: 'City of Charlotte',
    status: 'active',
    applied: '2025-09-15',
    issued: '2025-10-08',
    expires: '2026-10-08',
    fee: 4850,
  },
  {
    id: 2,
    project: 'PRJ-042',
    permit_number: 'EP-2025-0882',
    type: 'electrical',
    description: '200A service upgrade and rough-in wiring',
    authority: 'City of Charlotte',
    status: 'active',
    applied: '2025-10-01',
    issued: '2025-10-22',
    expires: '2026-10-22',
    fee: 1200,
  },
  {
    id: 3,
    project: 'PRJ-038',
    permit_number: 'PP-2025-0374',
    type: 'plumbing',
    description: 'Full plumbing rough-in and fixture installation',
    authority: 'Mecklenburg County',
    status: 'issued',
    applied: '2025-11-10',
    issued: '2025-12-01',
    expires: '2026-12-01',
    fee: 950,
  },
  {
    id: 4,
    project: 'PRJ-DEMO',
    permit_number: 'DP-2026-0021',
    type: 'demo',
    description: 'Interior demolition — commercial renovation',
    authority: 'City of Charlotte',
    status: 'pending',
    applied: '2026-01-28',
    issued: null,
    expires: null,
    fee: 750,
  },
  {
    id: 5,
    project: 'PRJ-051',
    permit_number: 'GP-2025-0198',
    type: 'grading',
    description: 'Site grading and erosion control — 1.4 acres',
    authority: 'NCDEQ',
    status: 'active',
    applied: '2025-08-20',
    issued: '2025-09-05',
    expires: '2026-03-10',
    fee: 2100,
  },
];

const DEMO_INSPECTIONS = [
  {
    id: 1,
    project: 'PRJ-042',
    type: 'Framing',
    permit_number: 'BP-2025-0441',
    scheduled: '2026-02-25',
    status: 'pending',
    inspector: 'Dept. of Inspections',
  },
  {
    id: 2,
    project: 'PRJ-042',
    type: 'Electrical Rough-In',
    permit_number: 'EP-2025-0882',
    scheduled: '2026-02-27',
    status: 'pending',
    inspector: 'Dept. of Inspections',
  },
  {
    id: 3,
    project: 'PRJ-038',
    type: 'Plumbing Final',
    permit_number: 'PP-2025-0374',
    scheduled: '2026-02-24',
    status: 'conditional',
    inspector: 'Mecklenburg County',
  },
  {
    id: 4,
    project: 'PRJ-051',
    type: 'Grading & Erosion',
    permit_number: 'GP-2025-0198',
    scheduled: '2026-03-03',
    status: 'pending',
    inspector: 'NCDEQ Field Office',
  },
];

/* ── Config Maps ───────────────────────────────────────────────────────── */

const PERMIT_STATUS = {
  active:  { color: 'var(--status-profit)',  bg: 'color-mix(in srgb, var(--status-profit) 12%, transparent)',  border: 'color-mix(in srgb, var(--status-profit) 25%, transparent)',  label: 'Active' },
  issued:  { color: 'var(--accent)',          bg: 'var(--accent-bg)',                                            border: 'var(--accent-border)',                                         label: 'Issued' },
  pending: { color: 'var(--status-warning)', bg: 'color-mix(in srgb, var(--status-warning) 12%, transparent)', border: 'color-mix(in srgb, var(--status-warning) 25%, transparent)', label: 'Pending' },
  expired: { color: 'var(--status-loss)',    bg: 'color-mix(in srgb, var(--status-loss) 12%, transparent)',    border: 'color-mix(in srgb, var(--status-loss) 25%, transparent)',    label: 'Expired' },
  closed:  { color: 'var(--status-neutral)', bg: 'color-mix(in srgb, var(--status-neutral) 12%, transparent)', border: 'color-mix(in srgb, var(--status-neutral) 25%, transparent)', label: 'Closed' },
};

const PERMIT_TYPE = {
  building:   { Icon: Building2, color: 'var(--accent)',          label: 'Building' },
  electrical: { Icon: Zap,       color: 'var(--status-warning)',  label: 'Electrical' },
  plumbing:   { Icon: Droplets,  color: 'var(--accent)',          label: 'Plumbing' },
  mechanical: { Icon: Flame,     color: 'var(--status-loss)',     label: 'Mechanical' },
  demo:       { Icon: HardHat,   color: 'var(--text-secondary)',  label: 'Demo' },
  grading:    { Icon: Shovel,    color: 'var(--status-profit)',   label: 'Grading' },
};

const INSP_STATUS = {
  pending:     { color: 'var(--status-warning)', bg: 'color-mix(in srgb, var(--status-warning) 12%, transparent)', border: 'color-mix(in srgb, var(--status-warning) 25%, transparent)', Icon: Clock,        label: 'Pending' },
  pass:        { color: 'var(--status-profit)',  bg: 'color-mix(in srgb, var(--status-profit) 12%, transparent)',  border: 'color-mix(in srgb, var(--status-profit) 25%, transparent)',  Icon: CheckCircle,  label: 'Passed' },
  fail:        { color: 'var(--status-loss)',    bg: 'color-mix(in srgb, var(--status-loss) 12%, transparent)',    border: 'color-mix(in srgb, var(--status-loss) 25%, transparent)',    Icon: XCircle,      label: 'Failed' },
  conditional: { color: 'var(--accent)',          bg: 'var(--accent-bg)',                                            border: 'var(--accent-border)',                                         Icon: HelpCircle,   label: 'Conditional' },
};

function PermitStatusBadge({ status }) {
  const s = PERMIT_STATUS[status] || PERMIT_STATUS.pending;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function PermitTypeBadge({ type }) {
  const t = PERMIT_TYPE[type];
  if (!t) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{type}</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: t.color }}>
      <t.Icon size={12} />
      {t.label}
    </span>
  );
}

function InspStatusBadge({ status }) {
  const s = INSP_STATUS[status] || INSP_STATUS.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <s.Icon size={11} />
      {s.label}
    </span>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function Permits() {
  const [permits, setPermits]         = useState(DEMO_PERMITS);
  const [inspections, setInspections] = useState(DEMO_INSPECTIONS);
  const [loading, setLoading]         = useState(true);
  const [isDemo, setIsDemo]           = useState(false);
  const [activeTab, setTab]           = useState('permits');

  useEffect(() => {
    let permitsLoaded = false;
    let inspLoaded    = false;

    function checkDone() {
      if (permitsLoaded && inspLoaded) setLoading(false);
    }

    api.permits()
      .then((data) => {
        if (Array.isArray(data)) {
          setPermits(data);
          if (data.length > 0 && data[0]?.issued === DEMO_PERMITS[0].issued) setIsDemo(true);
        } else {
          setIsDemo(true);
        }
      })
      .catch(() => setIsDemo(true))
      .finally(() => { permitsLoaded = true; checkDone(); });

    api.upcomingInspections()
      .then((data) => { if (Array.isArray(data)) setInspections(data); })
      .catch(() => {})
      .finally(() => { inspLoaded = true; checkDone(); });
  }, []);

  const activePermits    = permits.filter((p) => p.status === 'active' || p.status === 'issued').length;
  const pendingApps      = permits.filter((p) => p.status === 'pending').length;
  const upcomingCount    = inspections.filter((i) => i.status === 'pending').length;
  const expiringSoon     = permits.filter((p) => {
    const d = daysUntil(p.expires);
    return d !== null && d >= 0 && d <= 30;
  }).length;

  const SkeletonRow = ({ cols }) => (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-elevated)', width: i === 2 ? '80%' : '55%' }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Permits &amp; Inspections
      </h1>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Permits"       value={activePermits} icon={FileCheck}     sub="issued & active" />
        <KPICard label="Pending Applications" value={pendingApps}   icon={Clock}         sub="awaiting approval" />
        <KPICard label="Upcoming Inspections" value={upcomingCount} icon={CalendarDays}  sub="scheduled" />
        <KPICard label="Expiring Soon"        value={expiringSoon}  icon={AlertTriangle} sub="within 30 days" />
      </div>

      {/* Section Tabs */}
      <div
        className="flex gap-1"
        style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1px' }}
      >
        {[
          { key: 'permits',     label: 'Permits' },
          { key: 'inspections', label: 'Inspections Schedule' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Permits Table */}
      {activeTab === 'permits' && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="overflow-x-auto">
            <table className="mc-table w-full">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Permit #</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Authority</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th className="text-right">Fee</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
                  : permits.map((p) => {
                      const days = daysUntil(p.expires);
                      const expiryWarning = days !== null && days >= 0 && days <= 30;
                      return (
                        <tr key={p.id}>
                          <td>
                            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                              {p.project}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {p.permit_number}
                            </span>
                          </td>
                          <td><PermitTypeBadge type={p.type} /></td>
                          <td style={{ maxWidth: 260 }}>
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {p.description}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.authority}</td>
                          <td><PermitStatusBadge status={p.status} /></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{shortDate(p.applied)}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{p.issued ? shortDate(p.issued) : '—'}</td>
                          <td>
                            <span style={{ color: expiryWarning ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                              {p.expires ? shortDate(p.expires) : '—'}
                              {expiryWarning && (
                                <span className="ml-1 text-xs" style={{ color: 'var(--status-warning)' }}>
                                  ({days}d)
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="num text-right" style={{ color: 'var(--text-primary)' }}>
                            {money(p.fee)}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspections Table */}
      {activeTab === 'inspections' && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="overflow-x-auto">
            <table className="mc-table w-full">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Inspection Type</th>
                  <th>Permit #</th>
                  <th>Scheduled Date</th>
                  <th>Days Away</th>
                  <th>Inspector / Authority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  : inspections.length === 0
                    ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <CheckCircle size={36} style={{ color: 'var(--status-profit)' }} />
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              No upcoming inspections scheduled
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : inspections.map((insp) => {
                        const days = daysUntil(insp.scheduled);
                        return (
                          <tr key={insp.id}>
                            <td>
                              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                                {insp.project}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                              {insp.type}
                            </td>
                            <td>
                              <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {insp.permit_number}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{shortDate(insp.scheduled)}</td>
                            <td>
                              {days !== null ? (
                                <span
                                  className="num font-medium"
                                  style={{
                                    color: days <= 2
                                      ? 'var(--status-warning)'
                                      : 'var(--text-secondary)',
                                  }}
                                >
                                  {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                                </span>
                              ) : '—'}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                              {insp.inspector || '—'}
                            </td>
                            <td><InspStatusBadge status={insp.status} /></td>
                          </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permit totals footer */}
      {activeTab === 'permits' && !loading && permits.length > 0 && (
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{permits.length} permit{permits.length !== 1 ? 's' : ''} on record</span>
          <span>
            Total fees:{' '}
            <span className="num font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {money(permits.reduce((s, p) => s + (p.fee || 0), 0))}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
