import { useState, useEffect } from 'react';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import { money, pct, moneyClass } from '../lib/format';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Activity, AlertTriangle, Camera, ChevronDown, ChevronRight, Code, Table, TrendingDown } from 'lucide-react';

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PROJECTS = [
  {
    id: 'PRJ-042',
    name: 'Brentwood Renovation',
    severity: 'watch',
    contract_value: 485000,
    costs_to_date: 312400,
    pct_complete: 68.4,
    cpi: 0.97,
    margin_original: 18.5,
    margin_current: 16.1,
    margin_projected: 16.0,
    margin_fade: 2.4,
    unbilled: 28500,
  },
  {
    id: 'PRJ-038',
    name: 'Franklin Mixed-Use',
    severity: 'watch',
    contract_value: 1240000,
    costs_to_date: 892000,
    pct_complete: 74.2,
    cpi: 0.94,
    margin_original: 14.2,
    margin_current: 10.8,
    margin_projected: 10.8,
    margin_fade: 3.4,
    unbilled: 41200,
  },
  {
    id: 'PRJ-051',
    name: 'Green Hills Townhomes',
    severity: 'critical',
    contract_value: 2180000,
    costs_to_date: 1640000,
    pct_complete: 61.0,
    cpi: 0.82,
    margin_original: 12.0,
    margin_current: 7.6,
    margin_projected: -8.2,
    margin_fade: 20.2,
    unbilled: 94800,
  },
];

const DEMO_TREND = [
  { week: 'Jan 25', 'PRJ-042': 18.2, 'PRJ-038': 13.8, 'PRJ-051': 11.4 },
  { week: 'Feb 1',  'PRJ-042': 17.5, 'PRJ-038': 12.6, 'PRJ-051': 10.1 },
  { week: 'Feb 8',  'PRJ-042': 16.8, 'PRJ-038': 11.4, 'PRJ-051': 8.9  },
  { week: 'Feb 15', 'PRJ-042': 16.1, 'PRJ-038': 10.8, 'PRJ-051': 7.6  },
];

const DEMO_DRIVERS = {
  'PRJ-042': [
    { cost_code: '03-000', description: 'Concrete / Flatwork', budgeted: 42000, actual: 47800, variance: -5800 },
    { cost_code: '08-000', description: 'Doors & Windows', budgeted: 28000, actual: 30200, variance: -2200 },
  ],
  'PRJ-038': [
    { cost_code: '05-000', description: 'Structural Steel', budgeted: 185000, actual: 204000, variance: -19000 },
    { cost_code: '15-000', description: 'Mechanical', budgeted: 92000, actual: 108400, variance: -16400 },
    { cost_code: '16-000', description: 'Electrical', budgeted: 78000, actual: 89600, variance: -11600 },
  ],
  'PRJ-051': [
    { cost_code: '02-000', description: 'Sitework / Earthwork', budgeted: 140000, actual: 218000, variance: -78000 },
    { cost_code: '03-000', description: 'Concrete', budgeted: 210000, actual: 298000, variance: -88000 },
    { cost_code: '07-000', description: 'Thermal & Moisture', budgeted: 88000, actual: 124000, variance: -36000 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function severityStyles(sev) {
  switch (sev) {
    case 'critical': return { bg: 'var(--status-loss)', color: 'var(--bg-base)' };
    case 'warning':  return { bg: 'var(--status-warning)', color: 'var(--bg-base)' };
    case 'watch':    return { bg: 'var(--accent)', color: 'var(--bg-base)' };
    default:         return { bg: 'var(--status-profit)', color: 'var(--bg-base)' };
  }
}

function cpiColor(cpi) {
  if (cpi >= 1.0) return 'var(--status-profit)';
  if (cpi >= 0.9) return 'var(--status-warning)';
  return 'var(--status-loss)';
}

function marginColor(val) {
  if (val < 0) return 'var(--status-loss)';
  if (val < 5) return 'var(--status-warning)';
  return 'var(--text-primary)';
}

function fadeColor(fade) {
  if (fade > 10) return 'var(--status-loss)';
  if (fade > 2)  return 'var(--status-warning)';
  return 'var(--text-primary)';
}

function projectLineColor(sev) {
  switch (sev) {
    case 'critical': return 'var(--status-loss)';
    case 'warning':  return 'var(--status-warning)';
    case 'watch':    return 'var(--accent)';
    default:         return 'var(--status-profit)';
  }
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function FadeChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      color: 'var(--text-primary)',
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: {Number(p.value).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[...Array(11)].map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{
            height: 14,
            borderRadius: 4,
            background: 'var(--border-subtle)',
            width: i === 0 ? '80%' : '60%',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Expanded driver sub-table ────────────────────────────────────────────────
function DriverSubTable({ projectId, drivers, loading }) {
  if (loading) {
    return (
      <tr>
        <td colSpan={11} style={{ padding: '0 0 0 32px', background: 'var(--bg-base)' }}>
          <div style={{ padding: '12px 0' }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                height: 12,
                borderRadius: 4,
                background: 'var(--border-subtle)',
                marginBottom: 8,
                width: '60%',
              }} />
            ))}
          </div>
        </td>
      </tr>
    );
  }

  const rows = drivers || [];
  if (!rows.length) {
    return (
      <tr>
        <td colSpan={11} style={{ padding: '12px 32px', background: 'var(--bg-base)', color: 'var(--text-tertiary)', fontSize: 13 }}>
          No cost overruns detected for this project.
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={11} style={{ padding: 0, background: 'var(--bg-base)', borderBottom: '2px solid var(--border-medium)' }}>
        <div style={{ padding: '8px 32px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 8 }}>
            Fade Drivers — Cost Codes
          </p>
          <table className="mc-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Cost Code</th>
                <th>Description</th>
                <th className="num">Budgeted</th>
                <th className="num">Actual</th>
                <th className="num">Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.cost_code}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: 11 }}>{d.cost_code}</td>
                  <td>{d.description}</td>
                  <td className="num">{money(d.budgeted)}</td>
                  <td className="num">{money(d.actual)}</td>
                  <td className={moneyClass(d.variance)} style={{ color: d.variance < 0 ? 'var(--status-loss)' : 'var(--status-profit)' }}>
                    {d.variance < 0 ? `(${money(Math.abs(d.variance))})` : money(d.variance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProfitFade() {
  const tc = useThemeColors();
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [trendData]             = useState(DEMO_TREND);
  const [expandedRow, setExpandedRow] = useState(null);
  const [drivers, setDrivers]   = useState({});
  const [loadingDrivers, setLoadingDrivers] = useState({});
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotMsg, setSnapshotMsg] = useState('');
  const [sortKey, setSortKey]   = useState('severity');
  const [sortDir, setSortDir]   = useState('desc');

  // Load project list
  useEffect(() => {
    api.profitFadeDashboard?.()
      .then((d) => { if (d?.length) setProjects(d); })
      .catch(() => {});
  }, []);

  // Expand row and fetch drivers
  function toggleRow(projectId) {
    if (expandedRow === projectId) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(projectId);
    if (drivers[projectId] !== undefined) return;

    setLoadingDrivers((prev) => ({ ...prev, [projectId]: true }));
    const fallback = DEMO_DRIVERS[projectId] || [];

    api.fadeDrivers?.(projectId)
      .then((d) => setDrivers((prev) => ({ ...prev, [projectId]: d?.length ? d : fallback })))
      .catch(() => setDrivers((prev) => ({ ...prev, [projectId]: fallback })))
      .finally(() => setLoadingDrivers((prev) => ({ ...prev, [projectId]: false })));
  }

  // Snapshot button
  function handleSnapshot() {
    setSnapshotLoading(true);
    setSnapshotMsg('');
    api.generateFadeSnapshot?.()
      .then(() => setSnapshotMsg('Snapshot saved'))
      .catch(() => setSnapshotMsg('Snapshot saved (demo)'))
      .finally(() => setSnapshotLoading(false));
  }

  // Sorting
  const severityOrder = { critical: 3, warning: 2, watch: 1, none: 0 };
  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const sorted = [...projects].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === 'severity') { av = severityOrder[a.severity] ?? 0; bv = severityOrder[b.severity] ?? 0; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // KPI calculations
  const criticalCount  = projects.filter((p) => p.severity === 'critical').length;
  const watchCount     = projects.filter((p) => p.severity === 'watch' || p.severity === 'warning').length;
  const totalContract  = projects.reduce((s, p) => s + p.contract_value, 0);
  const portfolioCPI   = projects.reduce((s, p) => s + p.cpi * (p.contract_value / totalContract), 0);
  const cpiColor2      = portfolioCPI >= 1.0 ? 'var(--status-profit)' : portfolioCPI >= 0.9 ? 'var(--status-warning)' : 'var(--status-loss)';

  const thStyle = { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' };

  function SortIndicator({ col }) {
    if (sortKey !== col) return <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: 'var(--accent)', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
            Profit Fade Early Warning
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Weekly per-project margin health — CPI · EVM · Fade detection
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {snapshotMsg && (
            <span style={{ fontSize: 13, color: 'var(--status-profit)' }}>{snapshotMsg}</span>
          )}
          <button
            onClick={handleSnapshot}
            disabled={snapshotLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'var(--accent-bg)', color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
              opacity: snapshotLoading ? 0.6 : 1,
            }}
          >
            <Camera size={14} />
            {snapshotLoading ? 'Generating…' : 'Generate Snapshot'}
          </button>
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {/* Active Projects */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Active Projects
            </span>
            <Activity size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {projects.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>being tracked</div>
        </div>

        {/* Critical Projects */}
        <div style={{
          background: 'var(--bg-card)', border: `1px solid ${criticalCount > 0 ? 'var(--status-loss)' : 'var(--border-subtle)'}`,
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Critical Projects
            </span>
            <AlertTriangle size={15} style={{ color: criticalCount > 0 ? 'var(--status-loss)' : 'var(--text-tertiary)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: criticalCount > 0 ? 'var(--status-loss)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>fade &gt;10% or CPI &lt;0.85</div>
        </div>

        {/* Watch / Warning */}
        <div style={{
          background: 'var(--bg-card)', border: `1px solid ${watchCount > 0 ? 'var(--status-warning)' : 'var(--border-subtle)'}`,
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Watch / Warning
            </span>
            <TrendingDown size={15} style={{ color: watchCount > 0 ? 'var(--status-warning)' : 'var(--text-tertiary)' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: watchCount > 0 ? 'var(--status-warning)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {watchCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>fade &gt;2% or CPI &lt;0.90</div>
        </div>

        {/* Portfolio CPI */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Portfolio CPI
            </span>
            <Activity size={15} style={{ color: cpiColor2 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: cpiColor2, fontVariantNumeric: 'tabular-nums' }}>
            {portfolioCPI.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>weighted avg by contract value</div>
        </div>
      </div>

      {/* ── Project Health Table ────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Project Health Table</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Click any row to expand fade drivers</p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="mc-table">
            <thead>
              <tr>
                <th style={thStyle} onClick={() => handleSort('id')}>Project <SortIndicator col="id" /></th>
                <th style={thStyle} onClick={() => handleSort('severity')}>Severity <SortIndicator col="severity" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('contract_value')}>Contract <SortIndicator col="contract_value" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('costs_to_date')}>Costs to Date <SortIndicator col="costs_to_date" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('pct_complete')}>% Complete <SortIndicator col="pct_complete" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('cpi')}>CPI <SortIndicator col="cpi" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('margin_original')}>Orig Margin <SortIndicator col="margin_original" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('margin_current')}>Current <SortIndicator col="margin_current" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('margin_projected')}>Projected <SortIndicator col="margin_projected" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('margin_fade')}>Fade % <SortIndicator col="margin_fade" /></th>
                <th className="num" style={thStyle} onClick={() => handleSort('unbilled')}>Unbilled <SortIndicator col="unbilled" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((proj) => {
                const isExpanded = expandedRow === proj.id;
                const sev = severityStyles(proj.severity);
                return (
                  <>
                    <tr
                      key={proj.id}
                      onClick={() => toggleRow(proj.id)}
                      style={{
                        cursor: 'pointer',
                        background: isExpanded ? 'var(--accent-bg)' : undefined,
                        borderLeft: isExpanded ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Project */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isExpanded
                            ? <ChevronDown size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                            : <ChevronRight size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{proj.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{proj.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Severity badge */}
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          background: sev.bg,
                          color: sev.color,
                        }}>
                          {proj.severity}
                        </span>
                      </td>

                      {/* Financials */}
                      <td className="num">{money(proj.contract_value)}</td>
                      <td className="num">{money(proj.costs_to_date)}</td>
                      <td className="num">{pct(proj.pct_complete)}</td>

                      {/* CPI */}
                      <td className="num" style={{ fontWeight: 700, color: cpiColor(proj.cpi) }}>
                        {proj.cpi.toFixed(2)}
                      </td>

                      {/* Margins */}
                      <td className="num" style={{ color: marginColor(proj.margin_original) }}>
                        {pct(proj.margin_original)}
                      </td>
                      <td className="num" style={{ color: marginColor(proj.margin_current) }}>
                        {pct(proj.margin_current)}
                      </td>
                      <td className="num" style={{ color: marginColor(proj.margin_projected) }}>
                        {proj.margin_projected < 0
                          ? `(${pct(Math.abs(proj.margin_projected))})`
                          : pct(proj.margin_projected)}
                      </td>

                      {/* Fade */}
                      <td className="num" style={{ fontWeight: 700, color: fadeColor(proj.margin_fade) }}>
                        {pct(proj.margin_fade)}
                      </td>

                      {/* Unbilled */}
                      <td className="num">{money(proj.unbilled)}</td>
                    </tr>

                    {/* Expanded driver sub-table */}
                    {isExpanded && (
                      <DriverSubTable
                        key={`${proj.id}-drivers`}
                        projectId={proj.id}
                        drivers={drivers[proj.id]}
                        loading={!!loadingDrivers[proj.id]}
                      />
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Trend Chart ────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '20px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>4-Week Margin Trend</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Weekly margin % snapshots — color-coded by current severity
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
            <XAxis
              dataKey="week"
              stroke={tc.textSecondary}
              fontSize={11}
              tick={{ fill: tc.textSecondary }}
            />
            <YAxis
              domain={[0, 25]}
              tickFormatter={(v) => `${v}%`}
              stroke={tc.textSecondary}
              fontSize={11}
              tick={{ fill: tc.textSecondary }}
            />
            <Tooltip content={<FadeChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: tc.textSecondary }}
            />
            {projects.map((proj) => (
              <Line
                key={proj.id}
                type="monotone"
                dataKey={proj.id}
                name={proj.name}
                stroke={projectLineColor(proj.severity)}
                strokeWidth={2}
                dot={{ r: 4, fill: projectLineColor(proj.severity), strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Severity legend footnote ──────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        padding: '12px 16px',
        background: 'var(--bg-elevated)',
        borderRadius: 8,
        border: '1px solid var(--border-subtle)',
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Severity thresholds:</span>
        {[
          { label: 'None', color: 'var(--status-profit)', desc: 'Fade ≤2%' },
          { label: 'Watch', color: 'var(--accent)', desc: 'Fade >2%' },
          { label: 'Warning', color: 'var(--status-warning)', desc: 'Fade >5% or CPI <0.90' },
          { label: 'Critical', color: 'var(--status-loss)', desc: 'Fade >10% or CPI <0.85' },
        ].map(({ label, color, desc }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: color }} />
            <strong style={{ color: 'var(--text-primary)' }}>{label}</strong>
            <span style={{ color: 'var(--text-tertiary)' }}>{desc}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
