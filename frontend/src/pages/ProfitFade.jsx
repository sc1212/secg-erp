import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import { money } from '../lib/format';
import ChartTooltip from '../components/ChartTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PROJECTS, STATUS_COLOR } from '../lib/demoData';

// Historical margin snapshots — bid margin vs current forecast vs actual-to-date
const FADE_DATA = [
  { name: 'Riverside',  bid: 18.2, forecast: 16.8, actual: 16.2 },
  { name: 'Oak Creek',  bid: 16.0, forecast: 14.8, actual: 14.8 },
  { name: 'Smith Res',  bid: 19.0, forecast: 18.5, actual: 18.5 },
  { name: 'Magnolia',   bid: 17.0, forecast: 15.8, actual: 15.1 },
  { name: 'Johnson TI', bid: 12.0, forecast: 4.2,  actual: 1.0  },
  { name: 'Elm St',     bid: 14.0, forecast: 12.6, actual: 12.2 },
  { name: 'Walnut',     bid: 18.0, forecast: 17.4, actual: 17.4 },
  { name: 'Zion Mech',  bid: 15.0, forecast: 14.2, actual: 14.2 },
];

const FADE_REASONS = [
  { project: 'Johnson Office TI',  reason: 'Electrical scope growth — panel upgrade, ADA conduit',   fade: -11.0, severity: 'critical' },
  { project: 'Johnson Office TI',  reason: 'Flooring upgrade, millwork delay cost overrun',           fade: -3.2,  severity: 'critical' },
  { project: 'Oak Creek',          reason: 'Concrete overrun — extra yardage due to soil conditions', fade: -1.2,  severity: 'warning' },
  { project: 'Magnolia Spec',      reason: 'Owner-driven finishes upgrade — paint, flooring',         fade: -1.9,  severity: 'warning' },
  { project: 'Riverside Custom',   reason: 'Deck CO added scope, lumber material variance',           fade: -2.0,  severity: 'info' },
  { project: 'Elm St Multifamily', reason: 'City fee increase, crane rental overage',                 fade: -1.8,  severity: 'warning' },
];

const SEVERITY_COLOR = {
  critical: { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)' },
  warning:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' },
  info:     { color: '#3b82f6',               bg: 'rgba(59,130,246,0.1)' },
};

export default function ProfitFade() {
  const navigate = useNavigate();
  const tc = useThemeColors();

  const avgBid      = FADE_DATA.reduce((s,d)=>s+d.bid,0) / FADE_DATA.length;
  const avgForecast = FADE_DATA.reduce((s,d)=>s+d.forecast,0) / FADE_DATA.length;
  const avgActual   = FADE_DATA.reduce((s,d)=>s+d.actual,0) / FADE_DATA.length;
  const totalFade   = avgActual - avgBid;

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Profit Fade Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Early warning — bid vs forecast vs actual by project</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Avg Bid Margin', `${avgBid.toFixed(1)}%`, '#3b82f6'],
          ['Avg Forecast',   `${avgForecast.toFixed(1)}%`, 'var(--status-warning)'],
          ['Avg Actual',     `${avgActual.toFixed(1)}%`, 'var(--status-profit)'],
          ['Portfolio Fade', `${totalFade.toFixed(1)}%`, totalFade < -2 ? 'var(--status-loss)' : 'var(--status-warning)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Bid Margin vs Forecast vs Actual — By Project</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={FADE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
            <XAxis dataKey="name" stroke={tc.textSecondary} fontSize={11} />
            <YAxis tickFormatter={v => `${v}%`} stroke={tc.textSecondary} fontSize={11} domain={[0, 22]} />
            <Tooltip content={<ChartTooltip />} formatter={(v) => `${v}%`} />
            <Bar dataKey="bid"      name="Bid Margin"  fill={tc.borderMedium}    radius={[3,3,0,0]} />
            <Bar dataKey="forecast" name="Forecast"    fill={tc.statusWarning}   radius={[3,3,0,0]} />
            <Bar dataKey="actual"   name="Actual"      fill={tc.chartPrimary}    radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
          {[['Bid Margin', tc.borderMedium],['Forecast', tc.statusWarning],['Actual', tc.chartPrimary]].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Table */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-brand-border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Project-by-Project Breakdown</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Project','Contract','Bid Margin','Forecast','Actual','Fade','Status'].map((h,i) => (
              <th key={h} style={{ ...thBase, textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {PROJECTS.map((p, i) => {
              const fd = FADE_DATA[i];
              const fade = fd ? (fd.actual - fd.bid) : 0;
              const sc = STATUS_COLOR[p.status] || STATUS_COLOR.on_budget;
              return (
                <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{money(p.contract, true)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: '#3b82f6' }}>{fd?.bid.toFixed(1)}%</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-warning)' }}>{fd?.forecast.toFixed(1)}%</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: p.margin_pct < 5 ? 'var(--status-loss)' : p.margin_pct < 12 ? 'var(--status-warning)' : 'var(--status-profit)', fontWeight: 700 }}>{p.margin_pct}%</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: fade < -3 ? 'var(--status-loss)' : fade < -1 ? 'var(--status-warning)' : 'var(--status-profit)' }}>
                    {fade >= 0 ? '+' : ''}{fade.toFixed(1)}%
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color }}>{p.status === 'over_budget' ? 'Over Budget' : p.status === 'watch' ? 'Watch' : 'On Budget'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fade Reasons */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-brand-border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Fade Root Causes</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Project','Root Cause','Fade','Severity'].map((h,i) => (
              <th key={h} style={{ ...thBase, textAlign: i===2?'right':'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {FADE_REASONS.map((r,i) => {
              const sc = SEVERITY_COLOR[r.severity];
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.project}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.reason}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 700, color: 'var(--status-loss)' }}>{r.fade.toFixed(1)}%</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color }}>
                      {r.severity.charAt(0).toUpperCase() + r.severity.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
