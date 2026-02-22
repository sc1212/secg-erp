import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import { money } from '../lib/format';
import ChartTooltip from '../components/ChartTooltip';
import {
  AlertCircle, AlertTriangle, Banknote, Building2, Calendar,
  CheckCircle, ChevronRight, Clock, DollarSign, FileText, Info,
  Percent, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { PROJECTS, FINANCIAL, SCHEDULE_EVENTS } from '../data/demoData';

const cashFlowData = [
  { week: 'Wk 1', inflow: 95000, outflow: 78000 },
  { week: 'Wk 2', inflow: 60000, outflow: 82000 },
  { week: 'Wk 3', inflow: 116000, outflow: 72400 },
  { week: 'Wk 4', inflow: 85000, outflow: 90000 },
  { week: 'Wk 5', inflow: 120000, outflow: 88000 },
  { week: 'Wk 6', inflow: 70000, outflow: 76000 },
  { week: 'Wk 7', inflow: 95000, outflow: 85000 },
  { week: 'Wk 8', inflow: 105000, outflow: 92000 },
];

const alerts = [
  { level: 'warning', message: 'PO-089 needs approval -- 84 Lumber $10,284 (Riverside)', link: '/projects/1' },
  { level: 'critical', message: 'Johnson Office electrical 8% over budget', link: '/projects/5' },
  { level: 'warning', message: 'Miller Concrete COI expires in 6 days -- 3 active projects', link: '/vendors' },
  { level: 'warning', message: 'Magnolia Spec Draw #2 -- $58K outstanding 12 days', link: '/financials' },
  { level: 'info', message: '3 transactions need coding', link: '/financials' },
];

const activity = [
  { text: 'New invoice synced -- Miller Concrete ($8,400)', link: '/financials', time: '2h ago' },
  { text: 'Vendor payment processed -- 84 Lumber ($12,100)', link: '/financials', time: '3h ago' },
  { text: 'Daily log submitted -- Connor, Riverside Custom', link: '/daily-logs', time: '5h ago' },
  { text: 'COI expiring in 6 days -- Miller Concrete', link: '/vendors', time: '6h ago' },
  { text: 'Change order approved -- Oak Creek CO-003 ($4,200)', link: '/projects/2', time: '8h ago' },
  { text: 'Draw request submitted -- Oak Creek ($45,000)', link: '/financials', time: 'Yesterday' },
  { text: 'Budget threshold warning -- Johnson Office at 99%', link: '/projects/5', time: 'Yesterday' },
];

const todaySchedule = SCHEDULE_EVENTS.filter(e => e.date === '2026-02-23' || e.date === '2026-02-22').slice(0, 4);

const budgetColor = { on_budget: '#34d399', watch: '#fbbf24', over_budget: '#fb7185' };
const budgetLabel = { on_budget: 'On Budget', watch: 'Watch', over_budget: 'Over Budget' };
const alertIcon = { critical: AlertCircle, warning: AlertTriangle, info: Info };
const alertBg = { critical: 'rgba(251,113,133,0.08)', warning: 'rgba(251,191,36,0.08)', info: 'rgba(56,189,248,0.08)' };
const alertColor = { critical: '#fb7185', warning: '#fbbf24', info: '#38bdf8' };

export default function Dashboard() {
  const navigate = useNavigate();
  const tc = useThemeColors();
  const totalContract = PROJECTS.reduce((s, p) => s + p.contract, 0);
  const avgMargin = (PROJECTS.reduce((s, p) => s + p.margin, 0) / PROJECTS.length).toFixed(1);
  const atRisk = PROJECTS.filter(p => p.budgetStatus === 'over_budget').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Command Center</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Cash" value={money(FINANCIAL.cash)} icon={Banknote} color="#34d399" />
        <KPI label="Effective Cash" value={money(FINANCIAL.effectiveCash)} icon={DollarSign} color="#fbbf24" />
        <KPI label="Active Contract" value={money(totalContract, true)} icon={Building2} color="#38bdf8" />
        <KPI label="AR Outstanding" value={money(FINANCIAL.arOutstanding)} icon={FileText} color="#818cf8" />
        <KPI label="Avg Margin" value={avgMargin + '%'} icon={Percent} color="#34d399" />
        <KPI label="At Risk" value={`${atRisk} job${atRisk !== 1 ? 's' : ''}`} icon={AlertTriangle} color="#fb7185" />
      </div>

      {/* Two-column: Project Pulse + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT: Project Pulse Grid */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Project Pulse</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROJECTS.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="rounded-lg p-4 cursor-pointer transition-all"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>{p.address}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    background: budgetColor[p.budgetStatus] + '18',
                    color: budgetColor[p.budgetStatus],
                    whiteSpace: 'nowrap', marginLeft: 8,
                  }}>
                    {p.phase}
                  </span>
                </div>
                <div className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>PM: {p.pm}</div>
                {/* Progress blocks */}
                <div className="flex gap-1 mb-2">
                  {[0, 1, 2, 3, 4].map(i => {
                    const blockPct = (i + 1) * 20;
                    const filled = p.pct >= blockPct;
                    const partial = !filled && p.pct >= blockPct - 20;
                    return (
                      <div key={i} style={{
                        flex: 1, height: 5, borderRadius: 2,
                        background: filled ? budgetColor[p.budgetStatus] : partial ? budgetColor[p.budgetStatus] + '60' : 'rgba(255,255,255,0.06)',
                      }} />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-secondary)' }}>{money(p.contract, true)}</span>
                  <span>{budgetLabel[p.budgetStatus]}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{p.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Queue */}
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Action Queue</h3>
            <div className="space-y-2">
              {alerts.map((a, i) => {
                const Icon = alertIcon[a.level];
                return (
                  <div
                    key={i}
                    onClick={() => navigate(a.link)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                    style={{ background: alertBg[a.level] }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = alertBg[a.level]; }}
                  >
                    <Icon size={14} style={{ color: alertColor[a.level], flexShrink: 0 }} />
                    <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>{a.message}</span>
                    <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cash Flow */}
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Cash Flow Forecast - 8 Weeks</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={cashFlowData} barGap={2}>
                <XAxis dataKey="week" stroke={tc.textTertiary || '#475569'} fontSize={10} />
                <YAxis tickFormatter={v => money(v, true)} stroke={tc.textTertiary || '#475569'} fontSize={10} width={45} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="inflow" fill="#34d399" radius={[2, 2, 0, 0]} name="In" />
                <Bar dataKey="outflow" fill="#fb7185" radius={[2, 2, 0, 0]} name="Out" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Today's Schedule</h3>
              <button onClick={() => navigate('/calendar')} className="text-[11px] font-medium" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            <div className="space-y-2">
              {(todaySchedule.length > 0 ? todaySchedule : SCHEDULE_EVENTS.slice(0, 4)).map(ev => (
                <div
                  key={ev.id}
                  onClick={() => navigate('/calendar')}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <Clock size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{ev.event}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ev.project}</div>
                  </div>
                  <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>What Changed - Last 48 Hours</h3>
        <div className="space-y-1">
          {activity.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.link)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <span className="text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--text-primary)' }}>{item.text}</span>
              <span className="text-[10px] flex-shrink-0 whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}
