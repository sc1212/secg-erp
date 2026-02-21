import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, pct } from '../lib/format';
import KPICard from '../components/KPICard';
import { PageLoading, ErrorState } from '../components/LoadingState';
import {
  Banknote, FileText, Receipt, FolderKanban,
  TrendingUp, Building2, CalendarDays, CreditCard,
  AlertTriangle, AlertCircle, Info,
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
const alertColor = { critical: 'text-danger', warning: 'text-warn', info: 'text-ok' };
const alertBg = { critical: 'bg-danger/10', warning: 'bg-warn/10', info: 'bg-ok/10' };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-brand-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-brand-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {money(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(() => api.dashboard());

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Cash on Hand" value={money(cash.cash_on_hand || 277912)} icon={Banknote} trend={8.3} />
        <KPICard label="Accounts Receivable" value={money(cash.ar_outstanding || 184500)} icon={FileText} trend={-2.1} />
        <KPICard label="Accounts Payable" value={money(cash.ap_outstanding || 97200)} icon={Receipt} trend={5.7} />
        <KPICard label="Active Projects" value={projects.active_projects || 47} icon={FolderKanban} sub="3 at risk" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Pipeline Value" value={money(pipeline.total_value || 2400000, true)} icon={TrendingUp} sub={`${pipeline.total_opportunities || 12} active`} />
        <KPICard label="Retainage Held" value={money(cash.retainage_receivable || 142800)} icon={Building2} sub={`${projects.active_projects || 8} projects`} />
        <KPICard label="Bi-Weekly Payroll" value={money(payroll.biweekly_cost || 24813)} icon={CalendarDays} sub={`Next: ${payroll.next_pay_date || '2/28'}`} />
        <KPICard label="Total Debt" value={money(debt.total_debt || 432934)} icon={CreditCard} sub={`${debt.active_count || 6} active`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-brand-card border border-brand-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brand-text mb-4">Budget vs Actuals — Top Projects</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={demoProjects} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tickFormatter={(v) => money(v, true)} stroke="#94A3B8" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="budget" fill="#E2E8F0" radius={[0, 4, 4, 0]} name="Budget" />
              <Bar dataKey="spent" fill="#2563EB" radius={[0, 4, 4, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-brand-text mb-4">Cash Flow Forecast — 8 Weeks</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={demoCashFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
              <YAxis tickFormatter={(v) => money(v, true)} stroke="#94A3B8" fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inflow" stroke="#16A34A" fill="#16A34A" fillOpacity={0.1} name="Inflows" />
              <Area type="monotone" dataKey="outflow" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} name="Outflows" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brand-text mb-4">Alerts &amp; Action Items</h3>
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const Icon = alertIcon[a.level] || Info;
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${alertBg[a.level]}`}>
                <Icon size={16} className={alertColor[a.level]} />
                <span className="text-sm flex-1">{a.message}</span>
                <button className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors font-medium">View &rarr;</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
