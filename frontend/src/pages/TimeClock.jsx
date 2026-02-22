/**
 * Time Clock — GPS field clock-in/out tracking with project allocation.
 * Shows time entries, active crew on the clock, and weekly hour summaries.
 */
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, MapPin, Table, Users } from 'lucide-react';
import { api } from '../lib/api';

const DEMO_ENTRIES = [
  {
    id: 4, employee_id: 1, employee_name: 'Jake Rodriguez', project_id: 1, project_code: 'PRJ-042',
    punch_in: '2026-02-22T07:01:00', punch_out: null, hours_worked: null,
    is_approved: false, is_within_geofence: true,
  },
  {
    id: 5, employee_id: 2, employee_name: 'Zach Peterson', project_id: 2, project_code: 'PRJ-038',
    punch_in: '2026-02-22T06:52:00', punch_out: null, hours_worked: null,
    is_approved: false, is_within_geofence: true,
  },
  {
    id: 6, employee_id: 3, employee_name: 'Marcus Williams', project_id: 3, project_code: 'PRJ-051',
    punch_in: '2026-02-22T07:20:00', punch_out: null, hours_worked: null,
    is_approved: false, is_within_geofence: false,
  },
  {
    id: 3, employee_id: 3, employee_name: 'Marcus Williams', project_id: 3, project_code: 'PRJ-051',
    punch_in: '2026-02-21T07:15:00', punch_out: '2026-02-21T16:00:00', hours_worked: 8.75,
    is_approved: false, is_within_geofence: true,
  },
  {
    id: 2, employee_id: 2, employee_name: 'Zach Peterson', project_id: 2, project_code: 'PRJ-038',
    punch_in: '2026-02-21T06:55:00', punch_out: '2026-02-21T15:30:00', hours_worked: 8.58,
    is_approved: true, is_within_geofence: true,
  },
  {
    id: 1, employee_id: 1, employee_name: 'Jake Rodriguez', project_id: 1, project_code: 'PRJ-042',
    punch_in: '2026-02-21T07:02:00', punch_out: '2026-02-21T15:48:00', hours_worked: 8.77,
    is_approved: true, is_within_geofence: true,
  },
];

function formatTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function hoursActive(punchIn) {
  const diff = Date.now() - new Date(punchIn).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function TimeClock() {
  const [entries, setEntries] = useState(DEMO_ENTRIES);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');

  useEffect(() => {
    api.timeclockEntries({ limit: 100 })
      .then(data => { if (data && data.length > 0) setEntries(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCrew = entries.filter(e => !e.punch_out);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntries = entries.filter(e => e.punch_in?.slice(0, 10) === todayStr);
  const yesterdayEntries = entries.filter(e => {
    const d = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return e.punch_in?.slice(0, 10) === d;
  });

  const totalHoursToday = todayEntries
    .filter(e => e.hours_worked)
    .reduce((s, e) => s + Number(e.hours_worked), 0);

  const displayEntries = tab === 'today' ? todayEntries : tab === 'yesterday' ? yesterdayEntries : entries;

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Time Clock</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          GPS field clock-in/out — hours auto-allocated to projects and cost codes
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Currently On Clock', value: activeCrew.length, icon: Users, color: 'var(--status-profit)' },
          { label: "Today's Hours", value: totalHoursToday.toFixed(1), icon: Clock, color: 'var(--accent)' },
          { label: 'Geofence Verified', value: activeCrew.filter(e => e.is_within_geofence !== false).length, icon: MapPin, color: 'var(--status-profit)' },
          { label: 'Pending Approval', value: entries.filter(e => !e.is_approved && e.punch_out).length, icon: AlertCircle, color: 'var(--status-warning)' },
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

      {/* Active crew callout */}
      {activeCrew.length > 0 && (
        <div
          className="rounded-lg p-4 mb-6"
          style={{
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--status-profit)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              {activeCrew.length} crew member{activeCrew.length > 1 ? 's' : ''} currently on the clock
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCrew.map(e => (
              <div
                key={e.id}
                className="rounded p-3 flex items-center gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
                >
                  {(e.employee_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.employee_name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {e.project_code} · {hoursActive(e.punch_in)}
                  </div>
                  {e.is_within_geofence === false && (
                    <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--status-warning)' }}>
                      <MapPin size={10} /> Outside geofence
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'all', label: 'All Entries' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-3 py-1.5 rounded text-xs font-medium"
            style={{
              background: tab === t.key ? 'var(--accent)' : 'var(--bg-elevated)',
              color: tab === t.key ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Entries Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <table className="mc-table w-full">
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Project</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>In</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Out</th>
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>GPS</th>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((e, i) => (
              <tr
                key={e.id}
                style={{
                  background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <td className="px-4 py-3 text-sm font-medium">{e.employee_name || `EMP-${e.employee_id}`}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                  >
                    {e.project_code || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(e.punch_in)}
                </td>
                <td className="px-4 py-3 text-sm num">{formatTime(e.punch_in)}</td>
                <td className="px-4 py-3 text-sm num" style={{ color: e.punch_out ? 'var(--text-primary)' : 'var(--status-profit)' }}>
                  {e.punch_out ? formatTime(e.punch_out) : '● Active'}
                </td>
                <td className="px-4 py-3 text-sm num text-right font-medium">
                  {e.hours_worked
                    ? Number(e.hours_worked).toFixed(2)
                    : e.punch_out ? '—' : hoursActive(e.punch_in)}
                </td>
                <td className="px-4 py-3">
                  {e.is_within_geofence === false ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-warning)' }}>
                      <MapPin size={12} /> Outside
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-profit)' }}>
                      <MapPin size={12} /> Verified
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!e.punch_out ? (
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'var(--status-profit-bg, var(--accent-bg))', color: 'var(--status-profit)' }}>
                      On Clock
                    </span>
                  ) : e.is_approved ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-profit)' }}>
                      <CheckCircle size={12} /> Approved
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayEntries.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No time entries for this period
          </div>
        )}
      </div>
    </div>
  );
}
