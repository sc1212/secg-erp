import { useState } from 'react';
import { money } from '../lib/format';
import { Download, ArrowLeft } from 'lucide-react';
import { PROJECTS, AR_AGING } from '../data/demoData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChartTooltip from '../components/ChartTooltip';

const reports = [
  { key: 'budget', label: 'Project Budget vs Actual', desc: 'Compare budget to actual across all projects' },
  { key: 'wip', label: 'WIP Report', desc: 'Work in Progress -- standard construction format' },
  { key: 'ar', label: 'AR Aging Report', desc: 'Receivables aging by project and client' },
  { key: 'profit', label: 'Profitability Analysis', desc: 'Margin and profitability by project' },
];

export default function Reports() {
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = () => { setToast('Exported to CSV'); setTimeout(() => setToast(null), 2000); };

  if (active) {
    return (
      <div className="space-y-4">
        {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '10px 20px', borderRadius: 8, background: '#34d399', color: '#000', fontWeight: 600, fontSize: 13 }}>{toast}</div>}
        <div className="flex items-center justify-between">
          <button onClick={() => setActive(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back to Reports
          </button>
          <button onClick={showToast} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
        {active === 'budget' && <BudgetReport />}
        {active === 'wip' && <WIPReport />}
        {active === 'ar' && <ARReport />}
        {active === 'profit' && <ProfitReport />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map(r => (
          <div
            key={r.key}
            onClick={() => setActive(r.key)}
            style={{ padding: 20, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ BUDGET VS ACTUAL ═══
function BudgetReport() {
  const data = PROJECTS.map(p => {
    const budget = p.contract * (1 - p.margin / 100);
    return { ...p, budget: Math.round(budget), actual: p.spent, variance: Math.round(budget - p.spent) };
  });
  const totals = data.reduce((s, p) => ({ contract: s.contract + p.contract, budget: s.budget + p.budget, actual: s.actual + p.actual, variance: s.variance + p.variance }), { contract: 0, budget: 0, actual: 0, variance: 0 });
  const chartData = data.map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), Budget: p.budget, Actual: p.actual }));
  return (
    <div className="space-y-4">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Project Budget vs Actual</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', padding: 16 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke="#475569" fontSize={10} angle={-20} textAnchor="end" height={50} />
            <YAxis tickFormatter={v => money(v, true)} stroke="#475569" fontSize={10} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Budget" fill="rgba(255,255,255,0.08)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Actual" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Contract</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Budget</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actual</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Variance</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Margin %</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
          </tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                <Num v={p.contract} />
                <Num v={p.budget} />
                <Num v={p.actual} />
                <Num v={p.variance} color={p.variance >= 0 ? '#34d399' : '#fb7185'} />
                <Num v={p.margin} suffix="%" color={p.margin < 5 ? '#fb7185' : '#34d399'} />
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.budgetStatus === 'over_budget' ? '#fb7185' : p.budgetStatus === 'watch' ? '#fbbf24' : '#34d399' }} />
                </td>
              </tr>
            ))}
            <tr style={{ background: 'var(--bg-elevated)', fontWeight: 700 }}>
              <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>TOTALS</td>
              <Num v={totals.contract} bold />
              <Num v={totals.budget} bold />
              <Num v={totals.actual} bold />
              <Num v={totals.variance} color={totals.variance >= 0 ? '#34d399' : '#fb7185'} bold />
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ WIP REPORT ═══
function WIPReport() {
  const data = PROJECTS.map(p => {
    const earnedRevenue = p.contract * (p.pct / 100);
    const overUnder = earnedRevenue - p.spent;
    return { ...p, earnedRevenue: Math.round(earnedRevenue), overUnder: Math.round(overUnder) };
  });
  return (
    <div className="space-y-4">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Work in Progress Report</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Contract</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>% Complete</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Costs to Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Earned Revenue</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Over/Under Billing</th>
          </tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                <Num v={p.contract} />
                <Num v={p.pct} suffix="%" />
                <Num v={p.spent} />
                <Num v={p.earnedRevenue} />
                <Num v={p.overUnder} color={p.overUnder >= 0 ? '#34d399' : '#fb7185'} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ AR AGING REPORT ═══
function ARReport() {
  const byProject = {};
  AR_AGING.forEach(a => {
    if (!byProject[a.project]) byProject[a.project] = { project: a.project, current: 0, d30: 0, d60: 0, d90: 0, total: 0 };
    const b = byProject[a.project];
    b.total += a.amount;
    if (a.ageDays <= 30) b.current += a.amount;
    else if (a.ageDays <= 60) b.d30 += a.amount;
    else if (a.ageDays <= 90) b.d60 += a.amount;
    else b.d90 += a.amount;
  });
  const rows = Object.values(byProject);
  const totals = rows.reduce((s, r) => ({ current: s.current + r.current, d30: s.d30 + r.d30, d60: s.d60 + r.d60, d90: s.d90 + r.d90, total: s.total + r.total }), { current: 0, d30: 0, d60: 0, d90: 0, total: 0 });
  return (
    <div className="space-y-4">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>AR Aging Report</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Current</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>1-30</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>31-60</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>61-90</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>90+</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total</th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.project}</td>
                <Num v={r.current} />
                <Num v={r.d30} />
                <Num v={r.d60} color={r.d60 > 0 ? '#fbbf24' : undefined} />
                <Num v={r.d90} color={r.d90 > 0 ? '#fb7185' : undefined} />
                <Num v={0} />
                <Num v={r.total} bold />
              </tr>
            ))}
            <tr style={{ background: 'var(--bg-elevated)', fontWeight: 700 }}>
              <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>TOTALS</td>
              <Num v={totals.current} bold />
              <Num v={totals.d30} bold />
              <Num v={totals.d60} bold color="#fbbf24" />
              <Num v={totals.d90} bold color="#fb7185" />
              <Num v={0} bold />
              <Num v={totals.total} bold />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ PROFITABILITY ANALYSIS ═══
function ProfitReport() {
  const data = PROJECTS.map(p => {
    const revenue = p.contract * (p.pct / 100);
    const grossProfit = revenue - p.spent;
    return { ...p, revenue: Math.round(revenue), directCosts: p.spent, grossProfit: Math.round(grossProfit) };
  }).sort((a, b) => b.margin - a.margin);
  const chartData = data.map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), Margin: p.margin }));
  return (
    <div className="space-y-4">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Profitability Analysis</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', padding: 16 }}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke="#475569" fontSize={10} angle={-20} textAnchor="end" height={50} />
            <YAxis stroke="#475569" fontSize={10} unit="%" />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Margin" radius={[3, 3, 0, 0]} fill={(entry) => entry.Margin < 5 ? '#fb7185' : '#34d399'}>
              {chartData.map((entry, i) => (
                <rect key={i} fill={data[i].margin < 5 ? '#fb7185' : data[i].margin < 15 ? '#fbbf24' : '#34d399'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Revenue</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Direct Costs</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Gross Profit</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Margin %</th>
          </tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                <Num v={p.revenue} />
                <Num v={p.directCosts} />
                <Num v={p.grossProfit} color={p.grossProfit >= 0 ? '#34d399' : '#fb7185'} />
                <Num v={p.margin} suffix="%" color={p.margin < 5 ? '#fb7185' : p.margin < 15 ? '#fbbf24' : '#34d399'} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Num({ v, suffix, color, bold }) {
  const display = suffix ? `${v}${suffix}` : money(v);
  return (
    <td style={{
      padding: '8px 12px', textAlign: 'right',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
      fontWeight: bold ? 700 : 600,
      color: color || 'var(--text-primary)',
    }}>{v === 0 && !suffix ? '--' : display}</td>
  );
}
