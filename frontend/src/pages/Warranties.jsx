import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate, money } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import { AlertTriangle, ClipboardList, DollarSign, Filter, Home, ShieldCheck, Table } from 'lucide-react';

/* ── Demo data ────────────────────────────────────────────────────────── */

const demoWarranties = [
  { id: 1, project_id: 1, project_name: 'Custom Home — Brentwood', reported_by: 'Homeowner', reported_date: '2026-01-15', category: 'Plumbing', description: 'Slow drain in master bath', severity: 'normal', status: 'scheduled', assigned_to: 'Jake R.', scheduled_date: '2026-02-28', completed_date: null, cost_to_resolve: 180, charged_to: 'warranty_reserve' },
  { id: 2, project_id: 1, project_name: 'Custom Home — Brentwood', reported_by: 'Homeowner', reported_date: '2026-02-01', category: 'HVAC', description: 'Thermostat not reaching set temp in upstairs bedroom', severity: 'urgent', status: 'in_progress', assigned_to: 'Zach P.', scheduled_date: '2026-02-22', completed_date: null, cost_to_resolve: 450, charged_to: 'subcontractor' },
  { id: 3, project_id: 2, project_name: 'Spec Home — Franklin', reported_by: 'Buyer', reported_date: '2026-02-10', category: 'Drywall', description: 'Nail pops in living room ceiling', severity: 'cosmetic', status: 'reported', assigned_to: null, scheduled_date: null, completed_date: null, cost_to_resolve: null, charged_to: null },
  { id: 4, project_id: 1, project_name: 'Custom Home — Brentwood', reported_by: 'Homeowner', reported_date: '2025-11-20', category: 'Exterior', description: 'Gutter pulling away from fascia at rear corner', severity: 'normal', status: 'completed', assigned_to: 'Derek H.', scheduled_date: null, completed_date: '2025-12-05', cost_to_resolve: 275, charged_to: 'warranty_reserve' },
  { id: 5, project_id: 3, project_name: 'Remodel — Green Hills', reported_by: 'Client', reported_date: '2026-02-18', category: 'Electrical', description: 'Kitchen island outlet not working', severity: 'urgent', status: 'assessed', assigned_to: null, scheduled_date: null, completed_date: null, cost_to_resolve: null, charged_to: null },
];

const demoSummary = {
  open_items: 4,
  urgent_items: 2,
  total_resolution_cost: 905,
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

const SEVERITY_STYLES = {
  urgent:   { bg: 'var(--status-loss-bg)',    color: 'var(--status-loss)' },
  normal:   { bg: 'var(--bg-elevated)',       color: 'var(--text-secondary)' },
  cosmetic: { bg: 'var(--bg-elevated)',       color: 'var(--text-tertiary)' },
};

const STATUS_STYLES = {
  reported:    { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  assessed:    { bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  scheduled:   { bg: 'var(--status-profit-bg)',  color: 'var(--status-profit)' },
  in_progress: { bg: 'var(--status-profit-bg)',  color: 'var(--status-profit)' },
  completed:   { bg: 'var(--bg-elevated)',       color: 'var(--text-tertiary)' },
  denied:      { bg: 'var(--status-loss-bg)',    color: 'var(--status-loss)' },
};

const STATUS_LABELS = {
  reported: 'Reported',
  assessed: 'Assessed',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  denied: 'Denied',
};

const SEVERITY_LABELS = {
  urgent: 'Urgent',
  normal: 'Normal',
  cosmetic: 'Cosmetic',
};

function formatChargedTo(value) {
  if (!value) return '--';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function Warranties() {
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const { data: warrantiesData, loading, error, isDemo } = useApi(
    () => api.warranties({
      ...(statusFilter && { status: statusFilter }),
      ...(severityFilter && { severity: severityFilter }),
    }),
    [statusFilter, severityFilter]
  );

  const { data: summaryData } = useApi(() => api.warrantySummary(), []);

  const warranties = warrantiesData || (loading ? [] : demoWarranties);
  const summary = summaryData || demoSummary;

  if (loading) return <PageLoading />;
  if (error && !warranties.length) return <ErrorState message={error} />;

  // Filter demo data client-side when backend unavailable
  const filtered = isDemo
    ? warranties.filter((w) => {
        if (statusFilter && w.status !== statusFilter) return false;
        if (severityFilter && w.severity !== severityFilter) return false;
        return true;
      })
    : warranties;

  // Compute KPIs from demo data when in demo mode
  const openItems = isDemo
    ? demoWarranties.filter((w) => w.status !== 'completed' && w.status !== 'denied').length
    : summary.open_items;
  const urgentItems = isDemo
    ? demoWarranties.filter((w) => w.severity === 'urgent' && w.status !== 'completed' && w.status !== 'denied').length
    : summary.urgent_items;
  const totalCost = isDemo
    ? demoWarranties.reduce((sum, w) => sum + (w.cost_to_resolve || 0), 0)
    : summary.total_resolution_cost;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Warranty & Callbacks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <ClipboardList size={14} /> Log Callback
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard label="Open Items" value={openItems} sub="active callbacks" icon={ShieldCheck} />
        <KPICard label="Urgent Items" value={urgentItems} sub={urgentItems > 0 ? 'needs attention' : 'none'} icon={AlertTriangle} />
        <KPICard label="Total Resolution Cost" value={money(totalCost)} sub="all items" icon={DollarSign} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="assessed">Assessed</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="denied">Denied</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Severities</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
          <option value="cosmetic">Cosmetic</option>
        </select>
      </div>

      {/* Warranty Table */}
      <div className="overflow-x-auto">
        <table className="mc-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Category</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Cost</th>
              <th>Charged To</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => {
              const sevStyle = SEVERITY_STYLES[w.severity] || SEVERITY_STYLES.normal;
              const stsStyle = STATUS_STYLES[w.status] || STATUS_STYLES.reported;
              return (
                <tr key={w.id}>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {shortDate(w.reported_date)}
                  </td>
                  <td>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {w.project_name}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {w.reported_by}
                      </div>
                    </div>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {w.category}
                  </td>
                  <td>
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      {w.description}
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{ background: sevStyle.bg, color: sevStyle.color }}
                    >
                      {SEVERITY_LABELS[w.severity] || w.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{ background: stsStyle.bg, color: stsStyle.color }}
                    >
                      {STATUS_LABELS[w.status] || w.status}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {w.assigned_to || '--'}
                  </td>
                  <td className="num text-sm" style={{ color: 'var(--text-primary)' }}>
                    {w.cost_to_resolve != null ? money(w.cost_to_resolve) : '--'}
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatChargedTo(w.charged_to)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-sm py-8" style={{ color: 'var(--text-tertiary)' }}>
                  No warranty items match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
