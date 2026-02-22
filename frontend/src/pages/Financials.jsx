import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Banknote, Building2, Calendar, CheckCircle, Clock, CreditCard, DollarSign, FileText, Receipt, RefreshCw, Send, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import DemoBanner from '../components/DemoBanner';
import KPICard from '../components/KPICard';
import ChartTooltip from '../components/ChartTooltip';

const tabs = ['overview', 'ar', 'ap', 'pl', 'sync', 'snapshots'];

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
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t ? 'border-brand-gold text-brand-gold' : 'border-transparent text-brand-muted lg:hover:text-brand-text'
            }`}
            className="mc-tab"
            style={tab === t ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' } : undefined}
          >
            {tabLabels[t]}
          </button>
        ))}
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
              <Tooltip content={<ChartTooltip />} />
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

      {/* ── 13-Week Cash Flow Forecast ─────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">13-Week Cash Flow Forecast</h3>
          <button onClick={() => setShowCashFlowTable((current) => !current)} className="text-xs font-medium text-brand-gold lg:hover:text-brand-gold-light transition-colors">
            {showCashFlowTable ? 'View Chart' : 'View as Table'}
          </button>
        </div>
        {showCashFlowTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                  <th className="pb-3 pr-4">Week</th>
                  <th className="pb-3 pr-4 num">Inflows</th>
                  <th className="pb-3 pr-4 num">Outflows</th>
                  <th className="pb-3 num">Net</th>
                </tr>
              </thead>
              <tbody>
                {demoWeekly.map((row) => (
                  <tr key={row.week} className="border-b border-brand-border/50 lg:hover:bg-brand-card-hover">
                    <td className="py-3 pr-4 font-medium">{row.week}</td>
                    <td className="py-3 pr-4 num">{moneyExact(row.inflows)}</td>
                    <td className="py-3 pr-4 num">{moneyExact(row.outflows)}</td>
                    <td className={`py-3 num ${row.net < 0 ? 'text-danger' : 'text-ok'}`}>{row.net < 0 ? `(${moneyExact(Math.abs(row.net))})` : moneyExact(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={demoWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="week" stroke={colors.textMuted} fontSize={11} />
              <YAxis tickFormatter={(v) => money(v, true)} stroke={colors.textMuted} fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inflows" stroke={colors.ok} fill={colors.ok} fillOpacity={0.1} name="Inflows" />
              <Area type="monotone" dataKey="outflows" stroke={colors.danger} fill={colors.danger} fillOpacity={0.1} name="Outflows" />
            </AreaChart>
          </ResponsiveContainer>
        )}
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
                  <td className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{inv.invoice_number}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{shortDate(inv.date_issued)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{shortDate(inv.date_due)}</td>
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
