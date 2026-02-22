import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { money } from '../lib/format';
import KPICard from '../components/KPICard';
import { Banknote, FileText, Receipt, TrendingUp, CreditCard, Building2 } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import ChartTooltip from '../components/ChartTooltip';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TABS = ['Transactions', 'AR Aging', 'AP Summary', 'Cash Flow'];

const TRANSACTIONS = [
  { date: '2026-02-22', project: 'Riverside Custom',    vendor: 'Thompson Framing',  desc: 'Framing labor — Week 6',          amount: -18400, type: 'AP' },
  { date: '2026-02-21', project: 'Elm St Multifamily',  vendor: 'Elm Dev Partners',  desc: 'Draw #2 received',                amount:  85000, type: 'AR' },
  { date: '2026-02-20', project: 'Oak Creek',           vendor: 'Miller Concrete',   desc: 'Foundation pour',                 amount: -14200, type: 'AP' },
  { date: '2026-02-20', project: 'Johnson Office TI',   vendor: 'Williams Electric', desc: 'Electrical invoice',             amount: -12400, type: 'AP' },
  { date: '2026-02-19', project: 'Magnolia Spec',       vendor: 'Johnson Properties', desc: 'Invoice #1024 payment',          amount:  58000, type: 'AR' },
  { date: '2026-02-18', project: 'Walnut Spec',         vendor: 'Anderson Paint',    desc: 'Paint labor — interior',         amount:  -6800, type: 'AP' },
  { date: '2026-02-17', project: 'Riverside Custom',    vendor: 'David & Linda Rivers', desc: 'Draw #1 received',            amount:  58000, type: 'AR' },
  { date: '2026-02-15', project: 'Oak Creek',           vendor: 'Clark HVAC',        desc: 'HVAC rough-in deposit',          amount:  -8200, type: 'AP' },
  { date: '2026-02-14', project: 'Smith Residence',     vendor: 'SECG',              desc: 'Retainage billing #1',           amount:  24250, type: 'AR' },
  { date: '2026-02-12', project: 'Zion Mechanical',     vendor: 'Zion Church',       desc: 'Final invoice payment',          amount:  28800, type: 'AR' },
  { date: '2026-02-10', project: 'Magnolia Spec',       vendor: 'Davis Plumbing',    desc: 'Plumbing rough-in',              amount:  -9800, type: 'AP' },
  { date: '2026-02-08', project: 'Elm St Multifamily',  vendor: 'Thompson Framing',  desc: 'Framing crew — floor 2',         amount: -42000, type: 'AP' },
  { date: '2026-02-05', project: 'Johnson Office TI',   vendor: 'Martinez Drywall',  desc: 'Drywall — main office',          amount:  -8400, type: 'AP' },
  { date: '2026-02-04', project: 'Walnut Spec',         vendor: 'SECG Spec',         desc: 'Pre-sale deposit received',      amount:  27500, type: 'AR' },
  { date: '2026-02-01', project: 'Riverside Custom',    vendor: '84 Lumber',         desc: 'Lumber — 2x10 joists',           amount:  -8240, type: 'AP' },
  { date: '2026-01-30', project: 'Elm St Multifamily',  vendor: 'City of Nashville', desc: 'Permits & fees',                 amount:  -4800, type: 'AP' },
  { date: '2026-01-28', project: 'Oak Creek',           vendor: 'Earthworks Inc',    desc: 'Site grading complete',          amount: -12000, type: 'AP' },
  { date: '2026-01-25', project: 'Magnolia Spec',       vendor: 'Brown Roofing',     desc: 'Roof installation complete',     amount: -14200, type: 'AP' },
  { date: '2026-01-22', project: 'Zion Mechanical',     vendor: 'Clark HVAC',        desc: 'MEP services — partial',         amount:  -9800, type: 'AP' },
  { date: '2026-01-20', project: 'Johnson Office TI',   vendor: 'Johnson Properties', desc: 'Owner invoice #003',            amount:  48000, type: 'AR' },
  { date: '2026-01-15', project: 'Smith Residence',     vendor: 'SECG',              desc: 'Preliminary design deposit',     amount:  12000, type: 'AR' },
  { date: '2026-01-12', project: 'Elm St Multifamily',  vendor: 'Elm Dev Partners',  desc: 'Draw #1 received',              amount: 120000, type: 'AR' },
  { date: '2026-01-10', project: 'Riverside Custom',    vendor: 'Miller Concrete',   desc: 'Garage slab',                   amount:  -6400, type: 'AP' },
  { date: '2026-01-08', project: 'Walnut Spec',         vendor: 'Davis Plumbing',    desc: 'Rough-in labor',                amount:  -7200, type: 'AP' },
  { date: '2026-01-05', project: 'Magnolia Spec',       vendor: 'Clark HVAC',        desc: 'HVAC system install',           amount: -18800, type: 'AP' },
];

const AR_AGING = [
  { project: 'Elm St Multifamily',  client: 'Elm Dev Partners',    invoice: 'Draw #3',    amount: 120000, issued: '2026-01-28', age: 25, status: 'outstanding', current: 120000, d30: 0, d60: 0, d90: 0 },
  { project: 'Riverside Custom',    client: 'David & Linda Rivers', invoice: 'Draw #2',   amount:  58000, issued: '2026-02-10', age: 12, status: 'outstanding', current: 58000,  d30: 0, d60: 0, d90: 0 },
  { project: 'Magnolia Spec',       client: 'SECG Spec Division',  invoice: 'Draw #2',    amount:  58000, issued: '2026-01-31', age: 22, status: 'outstanding', current: 58000,  d30: 0, d60: 0, d90: 0 },
  { project: 'Johnson Office TI',   client: 'Johnson Properties',  invoice: 'Invoice #4',  amount:  24200, issued: '2026-01-10', age: 43, status: 'overdue',     current: 0,      d30: 24200, d60: 0, d90: 0 },
  { project: 'Smith Residence',     client: 'Robert & Carol Smith', invoice: 'Retainage #1', amount: 24250, issued: '2025-12-20', age: 64, status: 'overdue', current: 0, d30: 0, d60: 24250, d90: 0 },
  { project: 'Oak Creek',           client: 'Oak Creek Holdings',  invoice: 'Invoice #2',  amount:  18000, issued: '2025-11-10', age: 104, status: 'overdue',   current: 0,      d30: 0,      d60: 0,    d90: 18000 },
  { project: 'Walnut Spec',         client: 'SECG Spec Division',  invoice: 'Pre-sale',    amount:   9950, issued: '2026-02-15', age: 7,  status: 'outstanding', current: 9950,   d30: 0, d60: 0, d90: 0 },
];

const AP_SUMMARY = [
  { vendor: 'Thompson Framing',  amount: 42000, due: '2026-02-28', project: 'Elm St Multifamily', status: 'due_soon' },
  { vendor: 'Williams Electric', amount: 12400, due: '2026-02-26', project: 'Johnson Office TI',  status: 'overdue' },
  { vendor: 'Miller Concrete',   amount: 14200, due: '2026-03-05', project: 'Oak Creek',           status: 'upcoming' },
  { vendor: 'Clark HVAC',        amount:  8200, due: '2026-02-25', project: 'Oak Creek',           status: 'due_soon' },
  { vendor: '84 Lumber',         amount: 10284, due: '2026-03-01', project: 'Riverside Custom',   status: 'upcoming' },
  { vendor: 'Davis Plumbing',    amount:  9800, due: '2026-03-08', project: 'Magnolia Spec',       status: 'upcoming' },
  { vendor: 'Anderson Paint',    amount:  6800, due: '2026-03-10', project: 'Walnut Spec',         status: 'upcoming' },
  { vendor: 'Martinez Drywall',  amount:  8400, due: '2026-02-24', project: 'Johnson Office TI',  status: 'overdue' },
  { vendor: 'Brown Roofing',     amount: 14200, due: '2026-03-15', project: 'Magnolia Spec',       status: 'upcoming' },
];

const CASH_FLOW_WEEKS = [
  { week: 'Wk 1',  inflow: 95000,  outflow: 78000,  net: 17000  },
  { week: 'Wk 2',  inflow: 60000,  outflow: 82000,  net: -22000 },
  { week: 'Wk 3',  inflow: 116000, outflow: 72400,  net: 43600  },
  { week: 'Wk 4',  inflow: 85000,  outflow: 90000,  net: -5000  },
  { week: 'Wk 5',  inflow: 120000, outflow: 88000,  net: 32000  },
  { week: 'Wk 6',  inflow: 70000,  outflow: 76000,  net: -6000  },
  { week: 'Wk 7',  inflow: 95000,  outflow: 85000,  net: 10000  },
  { week: 'Wk 8',  inflow: 105000, outflow: 92000,  net: 13000  },
  { week: 'Wk 9',  inflow: 88000,  outflow: 96000,  net: -8000  },
  { week: 'Wk 10', inflow: 130000, outflow: 78000,  net: 52000  },
  { week: 'Wk 11', inflow: 72000,  outflow: 88000,  net: -16000 },
  { week: 'Wk 12', inflow: 98000,  outflow: 82000,  net: 16000  },
];

const AP_STATUS_COLOR = {
  overdue:   { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Overdue' },
  due_soon:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Due Soon' },
  upcoming:  { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Upcoming' },
};
const AR_STATUS_COLOR = {
  overdue:     { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Overdue' },
  outstanding: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Outstanding' },
};

export default function Financials() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tc = useThemeColors();
  const initTab = searchParams.get('tab') === 'ar' ? 'AR Aging' : searchParams.get('tab') === 'ap' ? 'AP Summary' : searchParams.get('tab') === 'cash' ? 'Cash Flow' : 'Transactions';
  const [tab, setTab]     = useState(initTab);
  const [txSearch, setTxSearch] = useState('');
  const [txType, setTxType]     = useState('All');

  const totalAR = AR_AGING.reduce((s, r) => s + r.amount, 0);
  const totalAP = AP_SUMMARY.reduce((s, r) => s + r.amount, 0);

  const filteredTx = useMemo(() => TRANSACTIONS.filter(tx => {
    const matchType = txType === 'All' || tx.type === txType;
    const q = txSearch.toLowerCase();
    const matchSearch = !q || tx.project.toLowerCase().includes(q) || tx.vendor.toLowerCase().includes(q) || tx.desc.toLowerCase().includes(q);
    return matchType && matchSearch;
  }), [txSearch, txType]);

  // AR aging buckets
  const arCurrent = AR_AGING.reduce((s, r) => s + r.current, 0);
  const ar30      = AR_AGING.reduce((s, r) => s + r.d30, 0);
  const ar60      = AR_AGING.reduce((s, r) => s + r.d60, 0);
  const ar90      = AR_AGING.reduce((s, r) => s + r.d90, 0);

  let runningBalance = 284320;
  const cfWithBalance = CASH_FLOW_WEEKS.map(w => {
    runningBalance += w.net;
    return { ...w, balance: runningBalance };
  });

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Financial Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>As of February 22, 2026</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        <KPICard label="Cash in Bank"     value="$284,320"           icon={Banknote}    trend={3.1} />
        <KPICard label="Effective Cash"   value="$127,840"           icon={Banknote}    sub="After payroll + AP" />
        <KPICard label="AR Outstanding"   value={money(totalAR)}     icon={FileText}    sub="7 invoices" />
        <KPICard label="AP Outstanding"   value={money(totalAP)}     icon={Receipt}     trend={-4.2} />
        <KPICard label="Revenue MTD"      value="$482,000"           icon={TrendingUp}  trend={8.4} />
        <KPICard label="Gross Margin"     value="16.8%"              icon={TrendingUp}  trend={1.2} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-brand-border)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
            border: 'none', background: 'transparent', whiteSpace: 'nowrap',
            color: tab === t ? '#3b82f6' : 'var(--text-secondary)',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab: Transactions */}
      {tab === 'Transactions' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Search project, vendor, or description..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {['All','AR','AP'].map(t => (
              <button key={t} onClick={() => setTxType(t)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${txType === t ? '#3b82f6' : 'var(--color-brand-border)'}`, background: txType === t ? 'rgba(59,130,246,0.14)' : 'transparent', color: txType === t ? '#3b82f6' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{t}</button>
            ))}
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[['Date','left'],['Project','left'],['Vendor / Party','left'],['Description','left'],['Amount','right'],['Type','left']].map(([h,a]) => (
                      <th key={h} style={{ ...thBase, textAlign: a }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => navigate(tx.type === 'AR' ? '/financials?tab=ar' : '/payments')}
                    >
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{tx.project}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{tx.vendor}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{tx.desc}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600, color: tx.amount > 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>
                        {tx.amount > 0 ? '+' : ''}{money(tx.amount)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: tx.type === 'AR' ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)', color: tx.type === 'AR' ? 'var(--status-profit)' : 'var(--status-loss)' }}>{tx.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AR Aging */}
      {tab === 'AR Aging' && (
        <div>
          {/* Aging summary bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[['Current', arCurrent, 'var(--status-profit)'],['1–30 Days', ar30, 'var(--status-warning)'],['31–60 Days', ar60, '#f97316'],['60+ Days', ar90, 'var(--status-loss)']].map(([label, val, color]) => (
              <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color }}>{money(val)}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Project','Client','Invoice / Draw','Amount','Issued','Age (days)','Status'].map(h => (
                    <th key={h} style={{ ...thBase, textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AR_AGING.map((r, i) => {
                  const sc = AR_STATUS_COLOR[r.status] || AR_STATUS_COLOR.outstanding;
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.project}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.client}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.invoice}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(r.amount)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.issued}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', color: r.age > 60 ? 'var(--status-loss)' : r.age > 30 ? 'var(--status-warning)' : 'var(--text-primary)' }}>{r.age}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={3} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL AR OUTSTANDING</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalAR)}</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: AP Summary */}
      {tab === 'AP Summary' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Vendor','Amount','Due Date','Project','Status'].map(h => (
                  <th key={h} style={{ ...thBase, textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AP_SUMMARY.map((a, i) => {
                const sc = AP_STATUS_COLOR[a.status];
                return (
                  <tr key={i} onClick={() => navigate('/payments')} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.vendor}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(a.amount)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: a.status === 'overdue' ? 'var(--status-loss)' : 'var(--text-secondary)' }}>{a.due}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{a.project}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL AP</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalAP)}</td>
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Cash Flow */}
      {tab === 'Cash Flow' && (
        <div className="space-y-4">
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: 20 }}>
            <div className="panel-head" style={{ marginBottom: 12 }}>
              <h3 className="panel-title">12-Week Cash Flow Forecast</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CASH_FLOW_WEEKS}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
                <XAxis dataKey="week" stroke={tc.textSecondary} fontSize={11} />
                <YAxis tickFormatter={v => `$${v/1000}K`} stroke={tc.textSecondary} fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="inflow"  fill={tc.statusProfit} name="Inflows"  radius={[3,3,0,0]} />
                <Bar dataKey="outflow" fill={tc.statusLoss}   name="Outflows" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Week','Inflows','Outflows','Net','Running Balance'].map((h,i) => (
                    <th key={h} style={{ ...thBase, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cfWithBalance.map((w, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{w.week}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(w.inflow)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-loss)' }}>{money(w.outflow)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: w.net >= 0 ? 'var(--status-profit)' : 'var(--status-loss)' }}>{w.net >= 0 ? '+' : ''}{money(w.net)}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(w.balance)}</td>
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
