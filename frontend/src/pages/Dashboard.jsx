import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import { money } from '../lib/format';
import KPICard from '../components/KPICard';
import ChartTooltip from '../components/ChartTooltip';
import DemoBanner from '../components/DemoBanner';
import { PageLoading, ErrorState } from '../components/LoadingState';
import {
  Banknote, FileText, Receipt, FolderKanban,
  TrendingUp, Building2, CalendarDays, CreditCard,
  AlertTriangle, AlertCircle, Info, CheckCircle, Camera, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';

const demoProjects = [
  { name: 'PRJ-042', budget: 120000, spent: 82800, pct: 69 },
  { name: 'PRJ-038', budget: 95000, spent: 66500, pct: 70 },
  { name: 'PRJ-051', budget: 80000, spent: 76800, pct: 96 },
  { name: 'PRJ-033', budget: 150000, spent: 139500, pct: 93 },
  { name: 'PRJ-027', budget: 200000, spent: 124000, pct: 62 },
];

const demoCashFlow = [
  { week: 'W1', inflow: 85000, outflow: 62000 },
  { week: 'W2', inflow: 45000, outflow: 71000 },
  { week: 'W3', inflow: 92000, outflow: 58000 },
  { week: 'W4', inflow: 78000, outflow: 65000 },
  { week: 'W5', inflow: 110000, outflow: 74000 },
  { week: 'W6', inflow: 65000, outflow: 82000 },
  { week: 'W7', inflow: 98000, outflow: 60000 },
  { week: 'W8', inflow: 72000, outflow: 68000 },
];

const alertIcon = { critical: AlertCircle, warning: AlertTriangle, info: Info };
const alertStyles = {
  critical: { color: 'var(--status-loss)',    bg: 'var(--status-loss-bg)' },
  warning:  { color: 'var(--status-warning)', bg: 'var(--status-warning-bg)' },
  info:     { color: 'var(--status-profit)',  bg: 'var(--status-profit-bg)' },
};

export default function Dashboard() {
  const { data, loading, error, isDemo, refetch } = useApi(() => api.dashboard());
  const tc = useThemeColors();

  const cash = data?.cash || {};
  const projects = data?.projects || {};
  const pipeline = data?.pipeline || {};
  const payroll = data?.payroll || {};
  const debt = data?.debt || {};
  const alerts = data?.alerts || [
    { level: 'critical', category: 'AR', message: '3 invoices overdue totaling $45,200' },
    { level: 'warning', category: 'Budget', message: 'PRJ-051 is 96% of budget with 2 months remaining' },
    { level: 'warning', category: 'Compliance', message: '5 lien waivers pending from vendors' },
    { level: 'info', category: 'Draws', message: 'Draw #3 for PRJ-042 approved ($41,400)' },
  ];

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-live="polite" aria-label="Key performance indicators">
        <KPICard label="Cash on Hand" value={money(cash.cash_on_hand ?? 0)} icon={Banknote} trend={8.3} />
        <KPICard label="Accounts Receivable" value={money(cash.ar_outstanding ?? 0)} icon={FileText} trend={-2.1} />
        <KPICard label="Accounts Payable" value={money(cash.ap_outstanding ?? 0)} icon={Receipt} trend={5.7} />
        <KPICard label="Active Projects" value={projects.active_projects ?? 0} icon={FolderKanban} sub="3 at risk" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Pipeline Value" value={money(pipeline.total_value ?? 0, true)} icon={TrendingUp} sub={`${pipeline.total_opportunities ?? 0} active`} />
        <KPICard label="Retainage Held" value={money(cash.retainage_receivable ?? 0)} icon={Building2} sub={`${projects.active_projects ?? 0} projects`} />
        <KPICard label="Bi-Weekly Payroll" value={money(payroll.biweekly_cost ?? 0)} icon={CalendarDays} sub={`Next: ${payroll.next_pay_date ?? '—'}`} />
        <KPICard label="Total Debt" value={money(debt.total_debt ?? 0)} icon={CreditCard} sub={`${debt.active_count ?? 0} active`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget vs Actuals */}
        <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Budget vs Actuals — Top Projects</h3>
              <div className="panel-sub">Current period spend against budget</div>
            </div>
            <button className="ghost-btn">View as Table</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demoProjects} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tickFormatter={(v) => money(v, true)} stroke={tc.textSecondary} fontSize={11} />
              <YAxis type="category" dataKey="name" stroke={tc.textSecondary} fontSize={11} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="budget" fill={tc.borderMedium} radius={[0, 4, 4, 0]} name="Budget" />
              <Bar dataKey="spent" fill={tc.chartPrimary} radius={[0, 4, 4, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Forecast */}
        <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Cash Flow Forecast — 8 Weeks</h3>
              <div className="panel-sub">Projected inflows vs outflows</div>
            </div>
            <button className="ghost-btn">View as Table</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demoCashFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
              <XAxis dataKey="week" stroke={tc.textSecondary} fontSize={11} />
              <YAxis tickFormatter={(v) => money(v, true)} stroke={tc.textSecondary} fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inflow" stroke={tc.statusProfit} fill={tc.statusProfit} fillOpacity={0.1} name="Inflows" />
              <Area type="monotone" dataKey="outflow" stroke={tc.statusLoss} fill={tc.statusLoss} fillOpacity={0.1} name="Outflows" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Field Logs */}
      <TodaysLogs />

      {/* Alerts */}
      <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
        <div className="panel-head" style={{ marginBottom: 12 }}>
          <h3 className="panel-title">Alerts &amp; Action Items</h3>
        </div>
        <div className="space-y-2" aria-live="polite" aria-label="Financial alerts">
          {alerts.map((a, i) => {
            const Icon = alertIcon[a.level] || Info;
            const style = alertStyles[a.level] || alertStyles.info;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: style.bg }}>
                <Icon size={16} style={{ color: style.color }} />
                <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{a.message}</span>
                <button className="text-xs font-medium transition-colors" style={{ color: 'var(--accent)' }}>
                  View &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const demoTodayStatus = {
  date: new Date().toISOString().split('T')[0],
  total_projects: 5,
  submitted_count: 3,
  projects: [
    { project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood', has_log: true, status: 'submitted', author_name: 'Connor M.', submitted_at: new Date(new Date().setHours(16, 32)).toISOString(), work_performed: 'Completed rough plumbing inspection. Passed.', photo_count: 4 },
    { project_id: 2, project_code: 'PRJ-038', project_name: 'Spec Home — Franklin', has_log: true, status: 'submitted', author_name: 'Joseph K.', submitted_at: new Date(new Date().setHours(17, 15)).toISOString(), work_performed: 'Framing crew progress — 2nd floor joists complete', photo_count: 7 },
    { project_id: 3, project_code: 'PRJ-051', project_name: 'Remodel — Green Hills', has_log: true, status: 'submitted', author_name: 'Connor M.', submitted_at: new Date(new Date().setHours(16, 45)).toISOString(), work_performed: 'Drywall hanging — 85% complete', photo_count: 3 },
    { project_id: 4, project_code: 'PRJ-033', project_name: 'Insurance Rehab — Antioch', has_log: false },
    { project_id: 5, project_code: 'PRJ-027', project_name: 'Commercial — Berry Hill', has_log: false },
  ],
};

function TodaysLogs() {
  const navigate = useNavigate();
  const { data } = useApi(() => api.dailyLogTodayStatus(), []);
  const status = data || demoTodayStatus;

  return (
    <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
      <div className="panel-head" style={{ marginBottom: 12 }}>
        <div>
          <h3 className="panel-title">Today's Field Logs</h3>
          <div className="panel-sub">{status.submitted_count} of {status.total_projects} submitted</div>
        </div>
        <button className="ghost-btn" onClick={() => navigate('/daily-logs')}>View All</button>
      </div>
      <div className="space-y-2">
        {status.projects?.map((p) => (
          <div
            key={p.project_id}
            className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors"
            style={{ background: p.has_log ? 'var(--status-profit-bg)' : 'var(--status-warning-bg)' }}
            onClick={() => navigate(`/projects/${p.project_id}?tab=daily-log`)}
          >
            {p.has_log ? (
              <CheckCircle size={16} style={{ color: 'var(--status-profit)', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <AlertTriangle size={16} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: 2 }} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.project_code}</span>
                {p.has_log ? (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    — {p.author_name} submitted at {new Date(p.submitted_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-xs font-medium" style={{ color: 'var(--status-warning)' }}>No log submitted</span>
                )}
              </div>
              {p.work_performed && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{p.work_performed}</p>
              )}
              {p.photo_count > 0 && (
                <div className="flex items-center gap-1 mt-0.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  <Camera size={11} /> {p.photo_count} photos
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
