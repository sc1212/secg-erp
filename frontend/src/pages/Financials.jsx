import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import { money, moneyExact, pct, shortDate, statusBadge, moneyClass } from '../lib/format';
import KPICard from '../components/KPICard';
import ChartTooltip from '../components/ChartTooltip';
import DemoBanner from '../components/DemoBanner';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, FileText, Receipt,
  AlertCircle, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight,
  CheckCircle, RefreshCw, Banknote, Building2, Users, Send,
  ChevronRight, ExternalLink, CircleDot, Zap, Calendar, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ─── Tab Configuration ─────────────────────────────────────────────────────── */
const tabs = ['overview', 'ap', 'ar', 'pl', 'sync', 'snapshots'];
const tabLabels = {
  overview: 'Overview',
  ap: 'Accounts Payable',
  ar: 'Accounts Receivable',
  pl: 'P&L',
  sync: 'QuickBooks Sync',
  snapshots: 'Snapshots',
};
const tabIcons = {
  overview: Zap,
  ap: Receipt,
  ar: FileText,
  pl: TrendingUp,
  sync: RefreshCw,
  snapshots: Calendar,
};

/* ─── Demo Data ─────────────────────────────────────────────────────────────── */

// 13-Week Cash Flow Forecast
function buildDemoForecast() {
  const startDate = new Date(2026, 1, 23);
  const weeks = [];
  let cash = 247800;
  const threshold = 75000;

  const patterns = [
    { inflow: 62000, outflow: 48000 },
    { inflow: 41000, outflow: 55000 },
    { inflow: 88000, outflow: 52000 },
    { inflow: 35000, outflow: 61000 },
    { inflow: 72000, outflow: 47000 },
    { inflow: 28000, outflow: 58000 },
    { inflow: 95000, outflow: 54000 },
    { inflow: 44000, outflow: 63000 },
    { inflow: 81000, outflow: 49000 },
    { inflow: 32000, outflow: 72000 },
    { inflow: 68000, outflow: 51000 },
    { inflow: 56000, outflow: 67000 },
    { inflow: 91000, outflow: 53000 },
  ];

  for (let i = 0; i < 13; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i * 7);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const p = patterns[i];
    cash += p.inflow - p.outflow;

    weeks.push({
      week: `W${i + 1}`,
      weekLabel: label,
      inflow: p.inflow,
      outflow: p.outflow,
      cash: Math.round(cash),
      threshold,
      belowThreshold: cash < threshold,
    });
  }
  return weeks;
}

const demoCashForecast = buildDemoForecast();

// Money In vs Out (monthly bars)
const demoMoneyInOut = [
  { month: 'Sep', moneyIn: 284000, moneyOut: 218000 },
  { month: 'Oct', moneyIn: 312000, moneyOut: 267000 },
  { month: 'Nov', moneyIn: 258000, moneyOut: 241000 },
  { month: 'Dec', moneyIn: 296000, moneyOut: 278000 },
  { month: 'Jan', moneyIn: 341000, moneyOut: 259000 },
  { month: 'Feb', moneyIn: 278000, moneyOut: 232000 },
];

// Action Items
const demoActionItems = [
  {
    id: 1,
    type: 'overdue',
    icon: AlertCircle,
    severity: 'critical',
    title: '3 Invoices Overdue',
    description: '$45,200 outstanding past due date — oldest is 38 days',
    cta: 'View Overdue',
    ctaRoute: '/financials?tab=ar',
    amount: 45200,
  },
  {
    id: 2,
    type: 'ap_due',
    icon: Clock,
    severity: 'warning',
    title: '5 AP Bills Due This Week',
    description: '$18,400 in vendor bills due within 7 days',
    cta: 'Pay Now',
    ctaRoute: '/financials?tab=ap',
    amount: 18400,
  },
  {
    id: 3,
    type: 'draw_ready',
    icon: Send,
    severity: 'info',
    title: '2 Draw Requests Ready',
    description: 'PRJ-042 Draw #4 ($41,400) and PRJ-038 Draw #2 ($28,600) — approved, awaiting submission',
    cta: 'Submit Draws',
    ctaRoute: '/draws',
    amount: 70000,
  },
  {
    id: 4,
    type: 'payroll',
    icon: Users,
    severity: 'info',
    title: 'Payroll Processing — Feb 28',
    description: '$24,200 biweekly payroll due in 6 days — 18 employees',
    cta: 'Review',
    ctaRoute: '/team?tab=payroll',
    amount: 24200,
  },
];

// Project Financial Health
const demoProjectHealth = [
  { id: 1, code: 'PRJ-042', name: 'Custom Home — Brentwood', budget: 420000, spent: 289800, pctUsed: 69, status: 'green', margin: 12.4 },
  { id: 2, code: 'PRJ-038', name: 'Spec Home — Franklin', budget: 310000, spent: 217000, pctUsed: 70, status: 'green', margin: 10.8 },
  { id: 3, code: 'PRJ-051', name: 'Remodel — Green Hills', budget: 185000, spent: 177600, pctUsed: 96, status: 'red', margin: 2.1 },
  { id: 4, code: 'PRJ-033', name: 'Insurance Rehab — Antioch', budget: 275000, spent: 255750, pctUsed: 93, status: 'yellow', margin: 5.2 },
  { id: 5, code: 'PRJ-027', name: 'Commercial — Berry Hill', budget: 540000, spent: 334800, pctUsed: 62, status: 'green', margin: 15.6 },
];

// Recent Transactions
const demoTransactions = [
  { id: 1, date: '2026-02-22', group: 'today', description: 'Draw #3 — PRJ-042 Brentwood', amount: 41400, direction: 'in', category: 'Draw', counterparty: 'First Horizon Bank' },
  { id: 2, date: '2026-02-22', group: 'today', description: 'ABC Electrical — Invoice #4821', amount: 8400, direction: 'out', category: 'Vendor', counterparty: 'ABC Electrical' },
  { id: 3, date: '2026-02-22', group: 'today', description: 'Lumber Depot — PO #1247', amount: 12600, direction: 'out', category: 'Materials', counterparty: 'Lumber Depot' },
  { id: 4, date: '2026-02-21', group: 'yesterday', description: 'Client Payment — Invoice INV-2024-004', amount: 32000, direction: 'in', category: 'AR Payment', counterparty: 'Henderson Family' },
  { id: 5, date: '2026-02-21', group: 'yesterday', description: 'Payroll — Biweekly #4', amount: 24200, direction: 'out', category: 'Payroll', counterparty: '18 Employees' },
  { id: 6, date: '2026-02-21', group: 'yesterday', description: 'Insurance Premium — GL Policy', amount: 2850, direction: 'out', category: 'Insurance', counterparty: 'Hartford Ins.' },
  { id: 7, date: '2026-02-21', group: 'yesterday', description: 'Retainage Release — PRJ-027', amount: 14200, direction: 'in', category: 'Retainage', counterparty: 'Berry Hill Holdings' },
  { id: 8, date: '2026-02-20', group: 'earlier', description: 'Chase LOC — Monthly Payment', amount: 1250, direction: 'out', category: 'Debt', counterparty: 'Chase Bank' },
  { id: 9, date: '2026-02-20', group: 'earlier', description: 'Plumbing Pro — Invoice #7792', amount: 6200, direction: 'out', category: 'Vendor', counterparty: 'Plumbing Pro LLC' },
  { id: 10, date: '2026-02-20', group: 'earlier', description: 'Client Deposit — PRJ-055', amount: 15000, direction: 'in', category: 'Deposit', counterparty: 'New Client' },
];

// AP Bills
const demoAPBills = [
  { id: 1, vendor: 'ABC Electrical', invoice: 'INV-4821', amount: 8400, due: '2026-02-25', age: 0, status: 'due_soon' },
  { id: 2, vendor: 'Lumber Depot', invoice: 'PO-1247', amount: 12600, due: '2026-02-26', age: 0, status: 'due_soon' },
  { id: 3, vendor: 'Plumbing Pro LLC', invoice: 'INV-7792', amount: 6200, due: '2026-02-28', age: 0, status: 'due_soon' },
  { id: 4, vendor: 'Concrete Masters', invoice: 'INV-2218', amount: 4800, due: '2026-02-23', age: 0, status: 'due_soon' },
  { id: 5, vendor: 'HVAC Solutions', invoice: 'INV-0934', amount: 9200, due: '2026-03-04', age: 0, status: 'scheduled' },
  { id: 6, vendor: 'Roofing Co.', invoice: 'INV-5541', amount: 15400, due: '2026-02-18', age: 4, status: 'overdue' },
  { id: 7, vendor: 'Drywall Experts', invoice: 'INV-3316', amount: 7800, due: '2026-02-15', age: 7, status: 'overdue' },
  { id: 8, vendor: 'Paint Supply Co', invoice: 'INV-8812', amount: 3200, due: '2026-03-10', age: 0, status: 'scheduled' },
];

// AR Invoices
const demoARInvoices = [
  { id: 1, number: 'INV-2024-001', client: 'Henderson Family', project: 'PRJ-042', amount: 45000, balance: 45000, issued: '2026-01-15', due: '2026-02-14', age: 8, status: 'overdue' },
  { id: 2, number: 'INV-2024-005', client: 'Wilson Properties', project: 'PRJ-051', amount: 28200, balance: 28200, issued: '2026-01-20', due: '2026-02-19', age: 3, status: 'overdue' },
  { id: 3, number: 'INV-2024-002', client: 'Franklin Dev Corp', project: 'PRJ-038', amount: 38500, balance: 38500, issued: '2026-02-01', due: '2026-03-03', age: 0, status: 'sent' },
  { id: 4, number: 'INV-2024-003', client: 'Antioch Insurance', project: 'PRJ-033', amount: 41400, balance: 41400, issued: '2026-02-10', due: '2026-03-12', age: 0, status: 'sent' },
  { id: 5, number: 'INV-2024-006', client: 'Berry Hill Holdings', project: 'PRJ-027', amount: 33300, balance: 33300, issued: '2026-02-15', due: '2026-03-17', age: 0, status: 'sent' },
  { id: 6, number: 'INV-2024-004', client: 'Henderson Family', project: 'PRJ-042', amount: 32000, balance: 0, issued: '2025-12-01', due: '2025-12-31', age: 0, status: 'paid' },
];

// QuickBooks Sync Status
const demoQBSync = {
  connected: true,
  lastSync: '2026-02-22T14:32:00Z',
  nextSync: '2026-02-22T15:32:00Z',
  status: 'synced',
  company: 'Southeast Construction Group',
  syncHistory: [
    { id: 1, timestamp: '2026-02-22T14:32:00Z', type: 'auto', records: 24, status: 'success', duration: '12s' },
    { id: 2, timestamp: '2026-02-22T13:32:00Z', type: 'auto', records: 18, status: 'success', duration: '8s' },
    { id: 3, timestamp: '2026-02-22T12:32:00Z', type: 'auto', records: 31, status: 'success', duration: '15s' },
    { id: 4, timestamp: '2026-02-22T11:32:00Z', type: 'manual', records: 42, status: 'success', duration: '22s' },
    { id: 5, timestamp: '2026-02-22T10:32:00Z', type: 'auto', records: 12, status: 'warning', duration: '45s', note: '2 records skipped — duplicate check numbers' },
    { id: 6, timestamp: '2026-02-21T14:32:00Z', type: 'auto', records: 28, status: 'success', duration: '11s' },
  ],
  pendingItems: 3,
  arSynced: 23,
  apSynced: 41,
  journalEntries: 156,
};

/* ─── Severity Styles ───────────────────────────────────────────────────────── */
const severityStyles = {
  critical: { color: 'var(--status-loss)', bg: 'var(--status-loss-bg, rgba(251,113,133,0.1))' },
  warning: { color: 'var(--status-warning)', bg: 'var(--status-warning-bg, rgba(251,191,36,0.1))' },
  info: { color: 'var(--status-profit)', bg: 'var(--status-profit-bg, rgba(52,211,153,0.1))' },
};

const trafficLightColors = {
  green: 'var(--status-profit)',
  yellow: 'var(--status-warning)',
  red: 'var(--status-loss)',
};

/* ─── Custom Forecast Tooltip ───────────────────────────────────────────────── */
function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const byKey = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: 'var(--text-primary)',
        minWidth: 180,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 700 }}>{label}</p>
      {byKey.inflow != null && <p style={{ color: 'var(--status-profit)', margin: '2px 0' }}>Inflows: {money(byKey.inflow)}</p>}
      {byKey.outflow != null && <p style={{ color: 'var(--status-loss)', margin: '2px 0' }}>Outflows: {money(byKey.outflow)}</p>}
      {byKey.cash != null && (
        <p
          style={{
            color: byKey.cash < 75000 ? 'var(--status-loss)' : 'var(--accent)',
            margin: '2px 0',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 4,
            marginTop: 4,
            fontWeight: 700,
          }}
        >
          Cash Position: {money(byKey.cash)}
        </p>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function Financials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tc = useThemeColors();

  const validTabs = tabs;
  const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const [tab, setTab] = useState(initialTab);

  // API calls with demo fallbacks
  const { data: arData, isDemo: arDemo } = useApi(() => api.ar(), []);
  const { data: cashData, isDemo: cashDemo } = useApi(() => api.cashForecastWeekly(), []);
  const { data: txData, isDemo: txDemo } = useApi(() => api.transactions(), []);

  const isDemo = arDemo || cashDemo || txDemo;

  // Use API data or fallbacks
  const arInvoices = arData || demoARInvoices;
  const cashForecast = cashData?.length ? cashData : demoCashForecast;
  const transactions = txData?.length ? txData : demoTransactions;

  function handleTabChange(t) {
    setTab(t);
    setSearchParams({ tab: t });
  }

  // KPI computations
  const cashOnHand = 247800;
  const cashMoM = 3.2;
  const arOutstanding = useMemo(() => {
    const openInvoices = arInvoices.filter((inv) => inv.status !== 'paid');
    return {
      total: openInvoices.reduce((s, inv) => s + (inv.balance ?? inv.amount ?? 0), 0),
      count: openInvoices.length,
    };
  }, [arInvoices]);
  const apDue = 42600;
  const netPosition = cashOnHand + arOutstanding.total - apDue;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Financial Command Center
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          className="ghost-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => handleTabChange('sync')}
        >
          <RefreshCw size={14} />
          QB Synced 2m ago
        </button>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────── */}
      <div className="flex gap-1 pb-px overflow-x-auto" style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
        {tabs.map((t) => {
          const TabIcon = tabIcons[t];
          return (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className="mc-tab"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                ...(tab === t ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' } : {}),
              }}
            >
              <TabIcon size={14} />
              {tabLabels[t]}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <OverviewTab
          tc={tc}
          navigate={navigate}
          cashOnHand={cashOnHand}
          cashMoM={cashMoM}
          arOutstanding={arOutstanding}
          apDue={apDue}
          netPosition={netPosition}
          cashForecast={cashForecast}
          transactions={transactions}
          handleTabChange={handleTabChange}
        />
      )}

      {/* ── AP TAB ──────────────────────────────────────────────────── */}
      {tab === 'ap' && <APTab navigate={navigate} />}

      {/* ── AR TAB ──────────────────────────────────────────────────── */}
      {tab === 'ar' && <ARTab arInvoices={arInvoices} navigate={navigate} />}

      {/* ── P&L TAB ─────────────────────────────────────────────────── */}
      {tab === 'pl' && <PLTab navigate={navigate} />}

      {/* ── SYNC TAB ────────────────────────────────────────────────── */}
      {tab === 'sync' && <SyncTab />}

      {/* ── SNAPSHOTS TAB ───────────────────────────────────────────── */}
      {tab === 'snapshots' && <SnapshotsTab />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB — the Financial Command Center
   ═══════════════════════════════════════════════════════════════════════════════ */
function OverviewTab({ tc, navigate, cashOnHand, cashMoM, arOutstanding, apDue, netPosition, cashForecast, transactions, handleTabChange }) {
  return (
    <div className="space-y-6">
      {/* ── KPI Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Financial KPIs">
        <div
          onClick={() => navigate('/cash-flow')}
          style={{ cursor: 'pointer' }}
        >
          <KPICard
            label="Cash on Hand"
            value={money(cashOnHand)}
            icon={Banknote}
            trend={cashMoM}
            sub="MoM"
          />
        </div>
        <div
          onClick={() => handleTabChange('ar')}
          style={{ cursor: 'pointer' }}
        >
          <KPICard
            label="AR Outstanding"
            value={money(arOutstanding.total)}
            icon={FileText}
            sub={`${arOutstanding.count} invoices`}
          />
        </div>
        <div
          onClick={() => handleTabChange('ap')}
          style={{ cursor: 'pointer' }}
        >
          <KPICard
            label="AP Due"
            value={money(apDue)}
            icon={Receipt}
            sub="Due < 7 days"
          />
        </div>
        <div
          onClick={() => navigate('/cash-flow')}
          style={{ cursor: 'pointer' }}
        >
          <KPICard
            label="Net Position"
            value={money(netPosition)}
            icon={DollarSign}
            sub="Cash + AR - AP"
          />
        </div>
      </div>

      {/* ── Charts: Cash Forecast + Money In/Out ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 13-Week Cash Flow Forecast (Area chart) */}
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
        >
          <div className="panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
            <div>
              <h3 className="panel-title">13-Week Cash Forecast</h3>
              <div className="panel-sub">Cash position with danger zone highlighted</div>
            </div>
            <button className="ghost-btn" onClick={() => navigate('/cash-flow')}>
              Full View &rarr;
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cashForecast} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tc.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={tc.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tc.statusLoss} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={tc.statusLoss} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
              <XAxis dataKey="weekLabel" stroke={tc.textSecondary} fontSize={10} interval={1} />
              <YAxis tickFormatter={(v) => money(v, true)} stroke={tc.textSecondary} fontSize={10} />
              <Tooltip content={<ForecastTooltip />} />
              <ReferenceLine
                y={75000}
                stroke={tc.statusWarning}
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{ value: '$75K min', fill: tc.statusWarning, fontSize: 10, position: 'insideTopLeft' }}
              />
              <Area
                type="monotone"
                dataKey="cash"
                stroke={tc.accent}
                fill="url(#cashGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: tc.accent }}
                name="Cash Position"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Money In vs Out (Dual Bar chart) */}
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
        >
          <div className="panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
            <div>
              <h3 className="panel-title">Money In vs Out</h3>
              <div className="panel-sub">6-month comparison</div>
            </div>
            <button className="ghost-btn" onClick={() => handleTabChange('pl')}>
              P&L &rarr;
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={demoMoneyInOut} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
              <XAxis dataKey="month" stroke={tc.textSecondary} fontSize={11} />
              <YAxis tickFormatter={(v) => money(v, true)} stroke={tc.textSecondary} fontSize={10} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="moneyIn" fill={tc.statusProfit} fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Money In" />
              <Bar dataKey="moneyOut" fill={tc.statusLoss} fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Money Out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ACTION ITEMS ─────────────────────────────────────────── */}
      <div
        className="rounded-lg p-5"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
          <h3 className="panel-title">Action Items</h3>
          <span className="text-xs font-semibold" style={{ color: 'var(--status-loss)' }}>
            {demoActionItems.filter((a) => a.severity === 'critical').length} urgent
          </span>
        </div>
        <div className="space-y-2" aria-live="polite" aria-label="Financial action items">
          {demoActionItems.map((item) => {
            const Icon = item.icon;
            const style = severityStyles[item.severity] || severityStyles.info;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors"
                style={{ background: style.bg }}
                onClick={() => navigate(item.ctaRoute)}
              >
                <Icon size={18} style={{ color: style.color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: style.color, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {money(item.amount)}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {item.description}
                  </p>
                </div>
                <button
                  className="text-xs font-semibold whitespace-nowrap transition-colors"
                  style={{ color: 'var(--accent)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.ctaRoute);
                  }}
                >
                  {item.type === 'ap_due' ? 'Pay Now' : 'View'} &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Project Financial Health + Recent Transactions ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Financial Health */}
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
        >
          <div className="panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
            <div>
              <h3 className="panel-title">Project Financial Health</h3>
              <div className="panel-sub">{demoProjectHealth.length} active projects</div>
            </div>
            <button className="ghost-btn" onClick={() => navigate('/projects')}>
              All Projects &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="mc-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th className="right">Budget</th>
                  <th style={{ minWidth: 120 }}>Consumed</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoProjectHealth.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                    style={{ transition: 'background 0.15s' }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.code}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: 1 }}>{p.name}</div>
                    </td>
                    <td className="num right" style={{ fontWeight: 500 }}>{money(p.budget, true)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            background: 'var(--border-subtle)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(p.pctUsed, 100)}%`,
                              height: '100%',
                              borderRadius: 3,
                              background: trafficLightColors[p.status],
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: trafficLightColors[p.status], minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {p.pctUsed}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: trafficLightColors[p.status],
                          boxShadow: `0 0 6px ${trafficLightColors[p.status]}40`,
                        }}
                        title={`${p.margin}% margin`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
        >
          <div className="panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
            <div>
              <h3 className="panel-title">Recent Transactions</h3>
              <div className="panel-sub">Activity feed</div>
            </div>
            <button className="ghost-btn" onClick={() => handleTabChange('pl')}>
              View All &rarr;
            </button>
          </div>
          <TransactionFeed transactions={transactions} navigate={navigate} />
        </div>
      </div>

      {/* ── QuickBooks Sync Status Bar ───────────────────────────── */}
      <QBSyncBar syncData={demoQBSync} onClick={() => handleTabChange('sync')} />
    </div>
  );
}

/* ─── Transaction Feed Component ────────────────────────────────────────────── */
function TransactionFeed({ transactions, navigate }) {
  const grouped = useMemo(() => {
    const groups = {};
    transactions.forEach((tx) => {
      const g = tx.group || 'earlier';
      if (!groups[g]) groups[g] = [];
      groups[g].push(tx);
    });
    return groups;
  }, [transactions]);

  const groupLabels = { today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier This Week' };
  const groupOrder = ['today', 'yesterday', 'earlier'];

  return (
    <div className="space-y-4" style={{ maxHeight: 380, overflowY: 'auto' }}>
      {groupOrder.map((groupKey) => {
        const items = grouped[groupKey];
        if (!items?.length) return null;
        return (
          <div key={groupKey}>
            <div
              className="text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {groupLabels[groupKey]}
            </div>
            <div className="space-y-1">
              {items.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'transparent' }}
                  onClick={() => navigate(`/financials?tab=pl`)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Direction Arrow */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: tx.direction === 'in'
                        ? 'rgba(52,211,153,0.1)'
                        : 'rgba(251,113,133,0.1)',
                      flexShrink: 0,
                    }}
                  >
                    {tx.direction === 'in' ? (
                      <ArrowDownRight size={16} style={{ color: 'var(--status-profit)', transform: 'scaleX(-1)' }} />
                    ) : (
                      <ArrowUpRight size={16} style={{ color: 'var(--status-loss)', transform: 'scaleX(-1)' }} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {tx.description}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {tx.category} &middot; {tx.counterparty}
                    </div>
                  </div>

                  {/* Amount */}
                  <div
                    className="text-sm font-bold whitespace-nowrap"
                    style={{
                      color: tx.direction === 'in' ? 'var(--status-profit)' : 'var(--status-loss)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {tx.direction === 'in' ? '+' : '-'}{money(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── QuickBooks Sync Bar ───────────────────────────────────────────────────── */
function QBSyncBar({ syncData, onClick }) {
  const data = syncData || demoQBSync;
  const lastSyncTime = data.lastSync
    ? new Date(data.lastSync).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '—';

  return (
    <div
      className="rounded-lg px-5 py-3 flex items-center justify-between cursor-pointer transition-colors"
      style={{
        background: 'var(--color-brand-card)',
        border: '1px solid var(--color-brand-border)',
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: data.connected ? 'var(--status-profit)' : 'var(--status-loss)',
            boxShadow: data.connected ? '0 0 8px rgba(52,211,153,0.5)' : '0 0 8px rgba(251,113,133,0.5)',
          }}
        />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          QuickBooks Online
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {data.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Last sync: {lastSyncTime}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {data.pendingItems} pending
        </span>
        <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
          Details &rarr;
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AP TAB
   ═══════════════════════════════════════════════════════════════════════════════ */
function APTab({ navigate }) {
  const [filter, setFilter] = useState('all');
  const { data: apData } = useApi(() => api.recurring(), []);

  const bills = demoAPBills;
  const filtered = filter === 'all'
    ? bills
    : bills.filter((b) => b.status === filter);

  const totalOverdue = bills.filter((b) => b.status === 'overdue').reduce((s, b) => s + b.amount, 0);
  const totalDueSoon = bills.filter((b) => b.status === 'due_soon').reduce((s, b) => s + b.amount, 0);
  const totalScheduled = bills.filter((b) => b.status === 'scheduled').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-4">
      {/* AP KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total AP" value={money(bills.reduce((s, b) => s + b.amount, 0))} icon={Receipt} sub={`${bills.length} bills`} />
        <KPICard label="Overdue" value={money(totalOverdue)} icon={AlertCircle} sub={`${bills.filter((b) => b.status === 'overdue').length} bills`} />
        <KPICard label="Due This Week" value={money(totalDueSoon)} icon={Clock} sub={`${bills.filter((b) => b.status === 'due_soon').length} bills`} />
        <KPICard label="Scheduled" value={money(totalScheduled)} icon={Calendar} sub={`${bills.filter((b) => b.status === 'scheduled').length} bills`} />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'due_soon', label: 'Due Soon' },
          { key: 'scheduled', label: 'Scheduled' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: filter === f.key ? 'var(--accent)' : 'var(--bg-elevated)',
              color: filter === f.key ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--color-brand-border)'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* AP Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Invoice</th>
                <th className="right">Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <tr
                  key={bill.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/vendors`)}
                >
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bill.vendor}</td>
                  <td className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{bill.invoice}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{moneyExact(bill.amount)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{shortDate(bill.due)}</td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                      style={{
                        background: bill.status === 'overdue'
                          ? 'rgba(251,113,133,0.15)'
                          : bill.status === 'due_soon'
                            ? 'rgba(251,191,36,0.15)'
                            : 'rgba(52,211,153,0.15)',
                        color: bill.status === 'overdue'
                          ? 'var(--status-loss)'
                          : bill.status === 'due_soon'
                            ? 'var(--status-warning)'
                            : 'var(--status-profit)',
                      }}
                    >
                      {bill.status === 'due_soon' ? 'Due Soon' : bill.status === 'overdue' ? 'Overdue' : 'Scheduled'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      className="text-xs font-semibold transition-colors"
                      style={{ color: 'var(--accent)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/payments');
                      }}
                    >
                      Pay Now &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AR TAB
   ═══════════════════════════════════════════════════════════════════════════════ */
function ARTab({ arInvoices, navigate }) {
  const [filter, setFilter] = useState('all');

  const invoices = arInvoices || demoARInvoices;
  const filtered = filter === 'all'
    ? invoices
    : invoices.filter((inv) => inv.status === filter);

  const totalOverdue = invoices.filter((inv) => inv.status === 'overdue').reduce((s, inv) => s + (inv.balance ?? inv.amount), 0);
  const totalSent = invoices.filter((inv) => inv.status === 'sent').reduce((s, inv) => s + (inv.balance ?? inv.amount), 0);
  const totalPaid = invoices.filter((inv) => inv.status === 'paid').reduce((s, inv) => s + inv.amount, 0);

  return (
    <div className="space-y-4">
      {/* AR KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Outstanding"
          value={money(totalOverdue + totalSent)}
          icon={FileText}
          sub={`${invoices.filter((i) => i.status !== 'paid').length} invoices`}
        />
        <KPICard
          label="Overdue"
          value={money(totalOverdue)}
          icon={AlertCircle}
          sub={`${invoices.filter((i) => i.status === 'overdue').length} invoices`}
        />
        <KPICard
          label="Sent / Pending"
          value={money(totalSent)}
          icon={Send}
          sub={`${invoices.filter((i) => i.status === 'sent').length} invoices`}
        />
        <KPICard
          label="Collected (MTD)"
          value={money(totalPaid)}
          icon={CheckCircle}
          sub={`${invoices.filter((i) => i.status === 'paid').length} payments`}
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'sent', label: 'Sent' },
          { key: 'paid', label: 'Paid' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: filter === f.key ? 'var(--accent)' : 'var(--bg-elevated)',
              color: filter === f.key ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--color-brand-border)'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* AR Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th className="right">Amount</th>
                <th className="right">Balance</th>
                <th>Due</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/financials?tab=ar`)}
                >
                  <td className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{inv.number}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inv.client}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{inv.project}</td>
                  <td className="num right">{moneyExact(inv.amount)}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{moneyExact(inv.balance)}</td>
                  <td style={{ color: inv.status === 'overdue' ? 'var(--status-loss)' : 'var(--text-secondary)' }}>
                    {shortDate(inv.due)}
                    {inv.age > 0 && (
                      <span className="text-[10px] font-bold ml-1" style={{ color: 'var(--status-loss)' }}>
                        ({inv.age}d)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {inv.status === 'overdue' && (
                      <button
                        className="text-xs font-semibold transition-colors"
                        style={{ color: 'var(--status-loss)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/financials?tab=ar');
                        }}
                      >
                        Send Reminder &rarr;
                      </button>
                    )}
                    {inv.status === 'sent' && (
                      <button
                        className="text-xs font-semibold transition-colors"
                        style={{ color: 'var(--accent)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/financials?tab=ar');
                        }}
                      >
                        View &rarr;
                      </button>
                    )}
                    {inv.status === 'paid' && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Collected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   P&L TAB
   ═══════════════════════════════════════════════════════════════════════════════ */
function PLTab({ navigate }) {
  const { data: plData } = useApi(() => api.plSummary(), []);

  const demoPL = {
    revenue: [
      { label: 'Contract Revenue', amount: 842000 },
      { label: 'Change Orders', amount: 48200 },
      { label: 'T&M Billings', amount: 24600 },
      { label: 'Other Income', amount: 3800 },
    ],
    totalRevenue: 918600,
    cogs: [
      { label: 'Direct Labor', amount: 284000 },
      { label: 'Materials', amount: 196400 },
      { label: 'Subcontractors', amount: 148000 },
      { label: 'Equipment Rental', amount: 32600 },
      { label: 'Permits & Fees', amount: 8400 },
    ],
    totalCOGS: 669400,
    grossProfit: 249200,
    grossMargin: 27.1,
    opex: [
      { label: 'Office Salaries', amount: 68000 },
      { label: 'Insurance', amount: 14200 },
      { label: 'Rent & Utilities', amount: 8400 },
      { label: 'Vehicle Expenses', amount: 6800 },
      { label: 'Marketing', amount: 4200 },
      { label: 'Professional Fees', amount: 3600 },
      { label: 'Other G&A', amount: 7200 },
    ],
    totalOpex: 112400,
    netIncome: 136800,
    netMargin: 14.9,
  };

  const pl = plData || demoPL;

  return (
    <div className="space-y-4">
      {/* P&L KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Revenue (YTD)" value={money(pl.totalRevenue)} icon={TrendingUp} trend={12.4} sub="vs prior year" />
        <KPICard label="Gross Profit" value={money(pl.grossProfit)} icon={DollarSign} sub={`${pl.grossMargin}% margin`} />
        <KPICard label="Operating Expenses" value={money(pl.totalOpex)} icon={CreditCard} trend={-3.2} sub="vs budget" />
        <KPICard label="Net Income" value={money(pl.netIncome)} icon={Banknote} sub={`${pl.netMargin}% margin`} />
      </div>

      {/* P&L Statement */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-brand-border)' }}>
          <div>
            <h3 className="panel-title">Profit & Loss Statement</h3>
            <div className="panel-sub">Year-to-date through February 2026</div>
          </div>
          <button className="ghost-btn">Export PDF</button>
        </div>
        <div className="overflow-x-auto">
          <table className="mc-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Category</th>
                <th className="right">Amount</th>
                <th className="right">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {/* Revenue Section */}
              <tr>
                <td colSpan={3} style={{ fontWeight: 700, color: 'var(--text-primary)', paddingTop: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Revenue
                </td>
              </tr>
              {pl.revenue.map((r, i) => (
                <tr key={`rev-${i}`} className="cursor-pointer" onClick={() => navigate('/financials?tab=pl')}>
                  <td style={{ paddingLeft: 24, color: 'var(--text-secondary)' }}>{r.label}</td>
                  <td className="num right">{money(r.amount)}</td>
                  <td className="num right" style={{ color: 'var(--text-tertiary)' }}>{pct((r.amount / pl.totalRevenue) * 100)}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total Revenue</td>
                <td className="num right" style={{ fontWeight: 700, color: 'var(--status-profit)' }}>{money(pl.totalRevenue)}</td>
                <td className="num right" style={{ fontWeight: 700 }}>100.0%</td>
              </tr>

              {/* COGS Section */}
              <tr>
                <td colSpan={3} style={{ fontWeight: 700, color: 'var(--text-primary)', paddingTop: 16, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cost of Goods Sold
                </td>
              </tr>
              {pl.cogs.map((c, i) => (
                <tr key={`cogs-${i}`} className="cursor-pointer" onClick={() => navigate('/financials?tab=pl')}>
                  <td style={{ paddingLeft: 24, color: 'var(--text-secondary)' }}>{c.label}</td>
                  <td className="num right">{money(c.amount)}</td>
                  <td className="num right" style={{ color: 'var(--text-tertiary)' }}>{pct((c.amount / pl.totalRevenue) * 100)}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total COGS</td>
                <td className="num right" style={{ fontWeight: 700, color: 'var(--status-loss)' }}>{money(pl.totalCOGS)}</td>
                <td className="num right" style={{ fontWeight: 700 }}>{pct((pl.totalCOGS / pl.totalRevenue) * 100)}</td>
              </tr>

              {/* Gross Profit */}
              <tr style={{ background: 'rgba(52,211,153,0.05)', borderTop: '2px solid var(--color-brand-border)' }}>
                <td style={{ fontWeight: 800, color: 'var(--status-profit)', fontSize: 14 }}>Gross Profit</td>
                <td className="num right" style={{ fontWeight: 800, color: 'var(--status-profit)', fontSize: 14 }}>{money(pl.grossProfit)}</td>
                <td className="num right" style={{ fontWeight: 700, color: 'var(--status-profit)' }}>{pct(pl.grossMargin)}</td>
              </tr>

              {/* OpEx Section */}
              <tr>
                <td colSpan={3} style={{ fontWeight: 700, color: 'var(--text-primary)', paddingTop: 16, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Operating Expenses
                </td>
              </tr>
              {pl.opex.map((o, i) => (
                <tr key={`opex-${i}`} className="cursor-pointer" onClick={() => navigate('/financials?tab=pl')}>
                  <td style={{ paddingLeft: 24, color: 'var(--text-secondary)' }}>{o.label}</td>
                  <td className="num right">{money(o.amount)}</td>
                  <td className="num right" style={{ color: 'var(--text-tertiary)' }}>{pct((o.amount / pl.totalRevenue) * 100)}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total Operating Expenses</td>
                <td className="num right" style={{ fontWeight: 700, color: 'var(--status-loss)' }}>{money(pl.totalOpex)}</td>
                <td className="num right" style={{ fontWeight: 700 }}>{pct((pl.totalOpex / pl.totalRevenue) * 100)}</td>
              </tr>

              {/* Net Income */}
              <tr style={{ background: 'rgba(52,211,153,0.08)', borderTop: '3px solid var(--color-brand-border)' }}>
                <td style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: 15 }}>Net Income</td>
                <td className="num right" style={{ fontWeight: 900, color: pl.netIncome >= 0 ? 'var(--status-profit)' : 'var(--status-loss)', fontSize: 15 }}>
                  {money(pl.netIncome)}
                </td>
                <td className="num right" style={{ fontWeight: 800, color: pl.netIncome >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>
                  {pct(pl.netMargin)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SYNC TAB — QuickBooks Integration
   ═══════════════════════════════════════════════════════════════════════════════ */
function SyncTab() {
  const data = demoQBSync;
  const [syncing, setSyncing] = useState(false);

  function handleManualSync() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Connection Status Hero */}
      <div
        className="rounded-lg p-6"
        style={{
          background: 'var(--color-brand-card)',
          border: data.connected
            ? '2px solid var(--status-profit)'
            : '2px solid var(--status-loss)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: data.connected ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
              }}
            >
              {data.connected ? (
                <CheckCircle size={24} style={{ color: 'var(--status-profit)' }} />
              ) : (
                <AlertCircle size={24} style={{ color: 'var(--status-loss)' }} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                QuickBooks Online
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {data.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase"
              style={{
                background: data.connected ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)',
                color: data.connected ? 'var(--status-profit)' : 'var(--status-loss)',
              }}
            >
              {data.connected ? 'Connected' : 'Disconnected'}
            </span>
            <button
              className="ghost-btn"
              onClick={handleManualSync}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="AR Records" value={data.arSynced} icon={FileText} sub="Synced" />
        <KPICard label="AP Records" value={data.apSynced} icon={Receipt} sub="Synced" />
        <KPICard label="Journal Entries" value={data.journalEntries} icon={Building2} sub="Total" />
        <KPICard label="Pending Items" value={data.pendingItems} icon={Clock} sub="Awaiting sync" />
      </div>

      {/* Sync History */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-brand-border)' }}>
          <h3 className="panel-title">Sync History</h3>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Last 24 hours</span>
        </div>
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th className="right">Records</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.syncHistory.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                      style={{
                        background: entry.type === 'manual' ? 'rgba(56,189,248,0.15)' : 'var(--bg-elevated)',
                        color: entry.type === 'manual' ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="num right" style={{ fontWeight: 600 }}>{entry.records}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{entry.duration}</td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                      style={{
                        background: entry.status === 'success'
                          ? 'rgba(52,211,153,0.15)'
                          : entry.status === 'warning'
                            ? 'rgba(251,191,36,0.15)'
                            : 'rgba(251,113,133,0.15)',
                        color: entry.status === 'success'
                          ? 'var(--status-profit)'
                          : entry.status === 'warning'
                            ? 'var(--status-warning)'
                            : 'var(--status-loss)',
                      }}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--text-tertiary)', maxWidth: 200 }}>
                    {entry.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SNAPSHOTS TAB
   ═══════════════════════════════════════════════════════════════════════════════ */
function SnapshotsTab() {
  const demoSnapshots = [
    { id: 1, date: '2026-02-22', type: 'Weekly', cashOnHand: 247800, arTotal: 186400, apTotal: 42600, netPosition: 391600, createdBy: 'System' },
    { id: 2, date: '2026-02-15', type: 'Weekly', cashOnHand: 240100, arTotal: 192800, apTotal: 38200, netPosition: 394700, createdBy: 'System' },
    { id: 3, date: '2026-02-08', type: 'Weekly', cashOnHand: 228400, arTotal: 178600, apTotal: 45100, netPosition: 361900, createdBy: 'System' },
    { id: 4, date: '2026-02-01', type: 'Monthly', cashOnHand: 235600, arTotal: 168400, apTotal: 41800, netPosition: 362200, createdBy: 'Mike S.' },
    { id: 5, date: '2026-01-25', type: 'Weekly', cashOnHand: 221300, arTotal: 174200, apTotal: 39600, netPosition: 355900, createdBy: 'System' },
    { id: 6, date: '2026-01-18', type: 'Weekly', cashOnHand: 218700, arTotal: 181400, apTotal: 44200, netPosition: 355900, createdBy: 'System' },
    { id: 7, date: '2026-01-01', type: 'Monthly', cashOnHand: 212400, arTotal: 156800, apTotal: 36400, netPosition: 332800, createdBy: 'Mike S.' },
  ];

  return (
    <div className="space-y-4">
      {/* Snapshot Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Point-in-time financial snapshots for trend analysis and compliance
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
          }}
        >
          Create Snapshot
        </button>
      </div>

      {/* Snapshots Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th className="right">Cash on Hand</th>
                <th className="right">AR Total</th>
                <th className="right">AP Total</th>
                <th className="right">Net Position</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {demoSnapshots.map((snap, index) => {
                const prevSnap = demoSnapshots[index + 1];
                const netChange = prevSnap ? snap.netPosition - prevSnap.netPosition : 0;
                return (
                  <tr key={snap.id} className="cursor-pointer">
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{shortDate(snap.date)}</td>
                    <td>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{
                          background: snap.type === 'Monthly' ? 'rgba(56,189,248,0.15)' : 'var(--bg-elevated)',
                          color: snap.type === 'Monthly' ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        {snap.type}
                      </span>
                    </td>
                    <td className="num right">{money(snap.cashOnHand)}</td>
                    <td className="num right">{money(snap.arTotal)}</td>
                    <td className="num right">{money(snap.apTotal)}</td>
                    <td className="num right" style={{ fontWeight: 700 }}>
                      {money(snap.netPosition)}
                      {netChange !== 0 && (
                        <span
                          className="text-[10px] font-bold ml-2"
                          style={{ color: netChange > 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}
                        >
                          {netChange > 0 ? '+' : ''}{money(netChange, true)}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{snap.createdBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
