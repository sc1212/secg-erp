import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import { money } from '../lib/format';
import KPICard from '../components/KPICard';
import ChartTooltip from '../components/ChartTooltip';
import { PROJECTS, STATUS_COLOR, STATUS_LABEL } from '../lib/demoData';
import {
  Banknote, FileText, Receipt, FolderKanban, TrendingUp, Building2,
  AlertCircle, AlertTriangle, Info, CheckCircle, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';

const CASH_FLOW_DATA = [
  { week: 'Wk 1', inflow: 95000,  outflow: 78000 },
  { week: 'Wk 2', inflow: 60000,  outflow: 82000 },
  { week: 'Wk 3', inflow: 116000, outflow: 72400 },
  { week: 'Wk 4', inflow: 85000,  outflow: 90000 },
  { week: 'Wk 5', inflow: 120000, outflow: 88000 },
  { week: 'Wk 6', inflow: 70000,  outflow: 76000 },
  { week: 'Wk 7', inflow: 95000,  outflow: 85000 },
  { week: 'Wk 8', inflow: 105000, outflow: 92000 },
];

const ACTION_QUEUE = [
  { level: 'critical', text: 'PO-089 needs approval — 84 Lumber $10,284',       link: '/exceptions' },
  { level: 'critical', text: '3 invoices overdue — AR total $48,200',            link: '/financials?tab=ar' },
  { level: 'warning',  text: 'Miller Concrete COI expires Feb 28',               link: '/vendors' },
  { level: 'warning',  text: 'Johnson Office TI is 8% over budget',              link: '/projects/5?tab=costs' },
  { level: 'warning',  text: 'Magnolia Spec Draw #2 outstanding 12 days',        link: '/draws' },
  { level: 'info',     text: '3 QuickBooks transactions need coding',            link: '/financials?tab=transactions' },
];

const SCHEDULE_TODAY = [
  { time: '8:00 AM',  event: 'Frame inspection — Riverside Custom', project: 'PRJ-042', assigned: 'Connor Mitchell' },
  { time: '10:30 AM', event: 'Client walk-through — Magnolia Spec', project: 'PRJ-031', assigned: 'Joseph Kowalski' },
  { time: '1:00 PM',  event: 'Concrete pour — Oak Creek foundation', project: 'PRJ-038', assigned: 'Connor Mitchell' },
  { time: '3:30 PM',  event: 'Punch list review — Johnson Office TI', project: 'PRJ-027', assigned: 'Joseph Kowalski' },
];

const LEVEL_ICON  = { critical: AlertCircle, warning: AlertTriangle, info: Info };
const LEVEL_COLOR = {
  critical: { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.1)' },
  warning:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.1)' },
  info:     { color: 'var(--accent)',         bg: 'rgba(59,130,246,0.1)' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const tc = useThemeColors();

  const totalContract = PROJECTS.reduce((s, p) => s + p.contract, 0);
  const totalAR = 312400;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Command Center</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        <KPICard label="Cash in Bank"      value="$284,320"              icon={Banknote}     trend={3.1} />
        <KPICard label="Effective Cash"    value="$127,840"              icon={Banknote}     sub="After payroll + AP" />
        <KPICard label="Active Contract"   value={money(totalContract, true)} icon={FolderKanban} sub="8 projects" />
        <KPICard label="AR Outstanding"    value={money(totalAR)}        icon={FileText}     trend={-2.1} />
        <KPICard label="Avg Margin"        value="16.8%"                 icon={TrendingUp}   trend={1.4} />
        <KPICard label="At Risk"           value="1 Job"                 icon={AlertTriangle} sub="Johnson Office TI" />
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* LEFT: Project Pulse Grid */}
        <div>
          <div className="panel-head" style={{ marginBottom: 12 }}>
            <h3 className="panel-title">Project Pulse</h3>
            <button className="ghost-btn" onClick={() => navigate('/projects')}>View All Jobs</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {PROJECTS.map((p) => {
              const sc = STATUS_COLOR[p.status] || STATUS_COLOR.on_budget;
              const spent_pct = Math.min(100, (p.spent / p.budget) * 100);
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  style={{
                    background: 'var(--color-brand-card)',
                    border: '1px solid var(--color-brand-border)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brand-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: sc.bg, color: sc.color, whiteSpace: 'nowrap', marginLeft: 6 }}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{p.address}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10 }}>PM: {p.pm.split(' ')[0]}  ·  {p.phase}</div>

                  {/* 5-segment progress bar */}
                  <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                    {[0,20,40,60,80].map((threshold, i) => {
                      const filled = p.pct > threshold;
                      const isOver = p.status === 'over_budget';
                      const isWatch = p.status === 'watch';
                      let bg = filled
                        ? (isOver ? 'var(--status-loss)' : isWatch ? 'var(--status-warning)' : 'var(--status-profit)')
                        : 'rgba(255,255,255,0.07)';
                      return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: bg, transition: 'background 0.3s' }} />;
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{money(p.contract, true)}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{p.pct}% complete</span>
                    <span style={{ color: sc.color, fontWeight: 600 }}>{p.margin_pct}% margin</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Action Queue + Cash Flow + Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Action Queue */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px' }}>
            <div className="panel-head" style={{ marginBottom: 12 }}>
              <h3 className="panel-title">Action Queue</h3>
              <span style={{ fontSize: 11, color: 'var(--status-loss)', fontWeight: 600 }}>
                {ACTION_QUEUE.filter(a => a.level === 'critical').length} Critical
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ACTION_QUEUE.map((a, i) => {
                const Icon = LEVEL_ICON[a.level];
                const lc = LEVEL_COLOR[a.level];
                return (
                  <div
                    key={i}
                    onClick={() => navigate(a.link)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 7,
                      background: lc.bg, cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Icon size={13} style={{ color: lc.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1 }}>{a.text}</span>
                    <span style={{ fontSize: 11, color: lc.color, fontWeight: 600 }}>Fix</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cash Flow Forecast */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px' }}>
            <div className="panel-head" style={{ marginBottom: 8 }}>
              <h3 className="panel-title">Cash Flow — 8 Weeks</h3>
              <button className="ghost-btn" onClick={() => navigate('/cash-flow')}>Expand</button>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={CASH_FLOW_DATA} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
                <XAxis dataKey="week" stroke={tc.textSecondary} fontSize={9} />
                <YAxis tickFormatter={(v) => `$${v/1000}K`} stroke={tc.textSecondary} fontSize={9} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="inflow"  stroke={tc.statusProfit} fill={tc.statusProfit} fillOpacity={0.15} name="In" />
                <Area type="monotone" dataKey="outflow" stroke={tc.statusLoss}   fill={tc.statusLoss}   fillOpacity={0.1}  name="Out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Today's Schedule */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px' }}>
            <div className="panel-head" style={{ marginBottom: 12 }}>
              <h3 className="panel-title">Today&apos;s Schedule</h3>
              <button className="ghost-btn" onClick={() => navigate('/calendar')}>Full Calendar</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SCHEDULE_TODAY.map((ev, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/calendar')}
                  style={{ display: 'flex', gap: 10, cursor: 'pointer', padding: '6px 0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', width: 58, flexShrink: 0, paddingTop: 2, fontFamily: 'monospace' }}>{ev.time}</div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{ev.event}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{ev.project}  ·  {ev.assigned}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
