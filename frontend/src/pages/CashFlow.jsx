import { useThemeColors } from '../hooks/useThemeColors';
import { money } from '../lib/format';
import ChartTooltip from '../components/ChartTooltip';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const WEEKS = [
  { week: 'Feb 22', inflow: 95000,  outflow: 78000,  net: 17000,  balance: 284320 },
  { week: 'Mar 1',  inflow: 116000, outflow: 72400,  net: 43600,  balance: 301320 },
  { week: 'Mar 8',  inflow: 60000,  outflow: 82000,  net: -22000, balance: 344920 },
  { week: 'Mar 15', inflow: 85000,  outflow: 90000,  net: -5000,  balance: 322920 },
  { week: 'Mar 22', inflow: 120000, outflow: 88000,  net: 32000,  balance: 317920 },
  { week: 'Mar 29', inflow: 70000,  outflow: 76000,  net: -6000,  balance: 349920 },
  { week: 'Apr 5',  inflow: 95000,  outflow: 85000,  net: 10000,  balance: 343920 },
  { week: 'Apr 12', inflow: 105000, outflow: 92000,  net: 13000,  balance: 353920 },
  { week: 'Apr 19', inflow: 88000,  outflow: 96000,  net: -8000,  balance: 366920 },
  { week: 'Apr 26', inflow: 130000, outflow: 78000,  net: 52000,  balance: 358920 },
  { week: 'May 3',  inflow: 72000,  outflow: 88000,  net: -16000, balance: 410920 },
  { week: 'May 10', inflow: 98000,  outflow: 82000,  net: 16000,  balance: 394920 },
  { week: 'May 17', inflow: 110000, outflow: 74000,  net: 36000,  balance: 410920 },
];

// Compute running balance from starting cash
let running = 284320;
const DATA = WEEKS.map((w, i) => {
  if (i === 0) return { ...w, balance: running };
  running += WEEKS[i-1].net;
  return { ...w, balance: running };
});

const UPCOMING_INFLOWS = [
  { date: 'Feb 24', desc: 'Draw #2 — Riverside Custom',     amount: 58000, project: 'Riverside Custom' },
  { date: 'Feb 27', desc: 'Inv #4 — Johnson Office TI',     amount: 48000, project: 'Johnson Office TI' },
  { date: 'Mar 5',  desc: 'Draw #3 — Elm St Multifamily',   amount: 120000, project: 'Elm St Multifamily' },
  { date: 'Mar 12', desc: 'Retainage — Magnolia Spec',       amount: 14500, project: 'Magnolia Spec' },
  { date: 'Mar 15', desc: 'Final pay — Zion Mechanical',     amount: 4800,  project: 'Zion Mechanical' },
];

const UPCOMING_OUTFLOWS = [
  { date: 'Feb 24', desc: 'Payroll — bi-weekly',             amount: 48000 },
  { date: 'Feb 26', desc: 'Williams Electric — Inv BILL-214', amount: 12400 },
  { date: 'Feb 24', desc: 'Martinez Drywall — Inv BILL-213', amount:  8400 },
  { date: 'Feb 28', desc: 'Thompson Framing — Inv BILL-212', amount: 42000 },
  { date: 'Mar 1',  desc: '84 Lumber — Inv BILL-210',        amount: 10284 },
  { date: 'Mar 8',  desc: 'Payroll — bi-weekly',             amount: 48000 },
  { date: 'Mar 8',  desc: 'Davis Plumbing — Inv BILL-209',   amount:  9800 },
];

export default function CashFlow() {
  const tc = useThemeColors();

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Cash Flow Forecast</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>13-week outlook  ·  Starting balance: {money(284320)}</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Starting Cash', 284320, 'var(--text-primary)'],
          ['Projected Inflows', DATA.reduce((s,w)=>s+w.inflow,0), 'var(--status-profit)'],
          ['Projected Outflows', DATA.reduce((s,w)=>s+w.outflow,0), 'var(--status-loss)'],
          ['Ending Balance', DATA[DATA.length-1].balance, '#3b82f6'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color }}>{money(val)}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>13-Week Cash Flow — Inflows vs Outflows vs Balance</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
            <XAxis dataKey="week" stroke={tc.textSecondary} fontSize={11} />
            <YAxis yAxisId="bars" tickFormatter={v => `$${v/1000}K`} stroke={tc.textSecondary} fontSize={11} />
            <YAxis yAxisId="line" orientation="right" tickFormatter={v => `$${v/1000}K`} stroke={tc.textSecondary} fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine yAxisId="bars" y={0} stroke={tc.borderMedium} />
            <Bar yAxisId="bars" dataKey="inflow"  fill={tc.statusProfit} name="Inflows"  radius={[3,3,0,0]} fillOpacity={0.8} />
            <Bar yAxisId="bars" dataKey="outflow" fill={tc.statusLoss}   name="Outflows" radius={[3,3,0,0]} fillOpacity={0.8} />
            <Line yAxisId="line" type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} name="Cash Balance" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Two columns: Upcoming In / Out */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-brand-border)', fontSize: 13, fontWeight: 600, color: 'var(--status-profit)' }}>Upcoming Inflows</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Date','Description','Amount'].map((h,i) => <th key={h} style={{ ...thBase, textAlign: i===2?'right':'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {UPCOMING_INFLOWS.map((r,i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{r.desc}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)', fontWeight: 600 }}>+{money(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-brand-border)', fontSize: 13, fontWeight: 600, color: 'var(--status-loss)' }}>Upcoming Outflows</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Date','Description','Amount'].map((h,i) => <th key={h} style={{ ...thBase, textAlign: i===2?'right':'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {UPCOMING_OUTFLOWS.map((r,i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{r.desc}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-loss)', fontWeight: 600 }}>{money(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Table */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-brand-border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Weekly Detail</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Week','Inflows','Outflows','Net','Running Balance'].map((h,i) => (
              <th key={h} style={{ ...thBase, textAlign: i===0?'left':'right' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {DATA.map((w,i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)', background: i === 0 ? 'rgba(59,130,246,0.04)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', fontSize: 12, color: i===0?'#3b82f6':'var(--text-primary)', fontWeight: i===0?700:400 }}>{w.week}{i===0?' (This Week)':''}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(w.inflow)}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-loss)' }}>{money(w.outflow)}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: w.net >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>{w.net >= 0 ? '+' : ''}{money(w.net)}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{money(w.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
