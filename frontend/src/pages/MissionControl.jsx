import { useState } from 'react';
import { useThemeColors } from '../hooks/useThemeColors';
import { money } from '../lib/format';
import { PROJECTS } from '../lib/demoData';
import ChartTooltip from '../components/ChartTooltip';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const REPORTS = ['Budget vs Actual', 'WIP Report', 'AR Aging', 'Profitability'];

const AR_ROWS = [
  { project: 'Elm St Multifamily',  client: 'Elm Dev Partners',    amount: 120000, current: 120000, d30: 0,     d60: 0,    d90: 0    },
  { project: 'Riverside Custom',    client: 'David & Linda Rivers', amount:  58000, current:  58000, d30: 0,     d60: 0,    d90: 0    },
  { project: 'Magnolia Spec',       client: 'SECG Spec Division',   amount:  58000, current:  58000, d30: 0,     d60: 0,    d90: 0    },
  { project: 'Johnson Office TI',   client: 'Johnson Properties',   amount:  24200, current:  0,     d30: 24200, d60: 0,    d90: 0    },
  { project: 'Smith Residence',     client: 'Robert & Carol Smith', amount:  24250, current:  0,     d30: 0,     d60: 24250, d90: 0   },
  { project: 'Oak Creek',           client: 'Oak Creek Holdings',   amount:  18000, current:  0,     d30: 0,     d60: 0,    d90: 18000 },
  { project: 'Walnut Spec',         client: 'SECG Spec Division',   amount:   9950, current:   9950, d30: 0,     d60: 0,    d90: 0    },
];

const PROFITABILITY = PROJECTS.map(p => ({
  name: p.name.split(' ')[0],
  revenue: p.spent / (1 - p.margin_pct / 100),
  cost: p.spent,
  gross_profit: p.spent * (p.margin_pct / 100),
  margin: p.margin_pct,
}));

function ExportBtn({ report }) {
  return (
    <button
      onClick={() => {
        const msg = `"${report}" exported to CSV.\n\nFile: ${report.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
        alert(msg);
      }}
      style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      Export CSV
    </button>
  );
}

export default function MissionControl() {
  const [tab, setTab] = useState('Budget vs Actual');
  const tc = useThemeColors();

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  const wipData = PROJECTS.map(p => {
    const earnedRevenue = p.contract * (p.pct / 100);
    const overbilling   = earnedRevenue - p.spent;
    return { ...p, earned: earnedRevenue, overbilling };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Reports</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>As of February 22, 2026</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-brand-border)', overflowX: 'auto' }}>
        {REPORTS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
            border: 'none', background: 'transparent', whiteSpace: 'nowrap',
            color: tab === t ? '#3b82f6' : 'var(--text-secondary)',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Budget vs Actual */}
      {tab === 'Budget vs Actual' && (
        <div className="space-y-4">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ExportBtn report="Budget vs Actual" /></div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Budget vs Actual Spend — All Projects</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PROJECTS.map(p => ({ name: p.name.split(' ')[0], budget: p.budget, actual: p.spent }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
                <XAxis dataKey="name" stroke={tc.textSecondary} fontSize={11} />
                <YAxis tickFormatter={v => `$${v/1000}K`} stroke={tc.textSecondary} fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="budget" name="Budget" fill={tc.borderMedium} radius={[3,3,0,0]} />
                <Bar dataKey="actual" name="Actual" fill={tc.chartPrimary} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Project','Contract','Budget','Actual','Variance','Margin %','Status'].map((h,i) => (
                  <th key={h} style={{ ...thBase, textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {PROJECTS.map(p => {
                  const variance = p.budget - p.spent;
                  const statusLabel = p.status === 'over_budget' ? 'Over Budget' : p.status === 'watch' ? 'Watch' : 'On Budget';
                  const statusColor = p.status === 'over_budget' ? 'var(--status-loss)' : p.status === 'watch' ? 'var(--status-warning)' : 'var(--status-profit)';
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(p.contract)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(p.budget)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(p.spent)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: variance < 0 ? 'var(--status-loss)' : 'var(--status-profit)', fontWeight: 600 }}>{money(variance)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: p.margin_pct < 5 ? 'var(--status-loss)' : p.margin_pct < 12 ? 'var(--status-warning)' : 'var(--status-profit)' }}>{p.margin_pct}%</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${statusColor}1a`, color: statusColor }}>{statusLabel}</span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>TOTALS</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(PROJECTS.reduce((s,p)=>s+p.contract,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(PROJECTS.reduce((s,p)=>s+p.budget,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(PROJECTS.reduce((s,p)=>s+p.spent,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(PROJECTS.reduce((s,p)=>s+p.budget-p.spent,0))}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WIP Report */}
      {tab === 'WIP Report' && (
        <div className="space-y-4">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ExportBtn report="WIP Report" /></div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Project','Contract','% Complete','Cost to Date','Earned Revenue','Over / Under Billing'].map((h,i) => (
                  <th key={h} style={{ ...thBase, textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {wipData.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(p.contract)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{p.pct}%</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(p.spent)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(p.earned)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: p.overbilling > 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>
                      {p.overbilling > 0 ? '+' : ''}{money(p.overbilling)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>TOTALS</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(wipData.reduce((s,p)=>s+p.contract,0))}</td>
                  <td />
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(wipData.reduce((s,p)=>s+p.spent,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(wipData.reduce((s,p)=>s+p.earned,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(wipData.reduce((s,p)=>s+p.overbilling,0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AR Aging */}
      {tab === 'AR Aging' && (
        <div className="space-y-4">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ExportBtn report="AR Aging Report" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[['Current',AR_ROWS.reduce((s,r)=>s+r.current,0)],['1–30 Days',AR_ROWS.reduce((s,r)=>s+r.d30,0)],['31–60 Days',AR_ROWS.reduce((s,r)=>s+r.d60,0)],['60+ Days',AR_ROWS.reduce((s,r)=>s+r.d90,0)]].map(([label, val], i) => (
              <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: i === 0 ? 'var(--status-profit)' : i === 1 ? 'var(--status-warning)' : i === 2 ? '#f97316' : 'var(--status-loss)' }}>{money(val)}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Project','Client','Total','Current','1–30','31–60','60+'].map((h,i) => (
                  <th key={h} style={{ ...thBase, textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {AR_ROWS.map((r,i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.project}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.client}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>{money(r.amount)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: r.current > 0 ? 'var(--status-profit)' : 'var(--text-tertiary)' }}>{money(r.current)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: r.d30 > 0 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{money(r.d30)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: r.d60 > 0 ? '#f97316' : 'var(--text-tertiary)' }}>{money(r.d60)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: r.d90 > 0 ? 'var(--status-loss)' : 'var(--text-tertiary)', fontWeight: r.d90 > 0 ? 700 : 400 }}>{money(r.d90)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={2} style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(AR_ROWS.reduce((s,r)=>s+r.amount,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right' }}>{money(AR_ROWS.reduce((s,r)=>s+r.current,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right' }}>{money(AR_ROWS.reduce((s,r)=>s+r.d30,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right' }}>{money(AR_ROWS.reduce((s,r)=>s+r.d60,0))}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-loss)' }}>{money(AR_ROWS.reduce((s,r)=>s+r.d90,0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profitability */}
      {tab === 'Profitability' && (
        <div className="space-y-4">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><ExportBtn report="Profitability Analysis" /></div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Gross Margin % by Project</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[...PROFITABILITY].sort((a,b)=>b.margin-a.margin)}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
                <XAxis dataKey="name" stroke={tc.textSecondary} fontSize={11} />
                <YAxis tickFormatter={v=>`${v}%`} stroke={tc.textSecondary} fontSize={11} domain={[0, 22]} />
                <Tooltip content={<ChartTooltip />} formatter={v=>`${v}%`} />
                <Bar dataKey="margin" name="Margin %" radius={[4,4,0,0]}
                  fill={tc.chartPrimary}
                  label={{ position: 'top', fontSize: 10, fill: tc.textSecondary, formatter: v => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Project','Revenue','Direct Cost','Gross Profit','Margin %','Trend'].map((h,i) => (
                  <th key={h} style={{ ...thBase, textAlign: i > 0 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...PROFITABILITY].sort((a,b)=>b.margin-a.margin).map((p,i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{PROJECTS[i]?.name || p.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(p.revenue)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(p.cost)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)', fontWeight: 600 }}>{money(p.gross_profit)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: p.margin < 5 ? 'var(--status-loss)' : p.margin < 12 ? 'var(--status-warning)' : 'var(--status-profit)' }}>{p.margin}%</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'right', color: p.margin > 15 ? 'var(--status-profit)' : p.margin < 5 ? 'var(--status-loss)' : 'var(--status-warning)' }}>
                      {p.margin > 15 ? 'Above target' : p.margin < 5 ? 'Below minimum' : 'At risk'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
