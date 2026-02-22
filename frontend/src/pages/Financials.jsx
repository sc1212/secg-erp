import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { money } from '../lib/format';
import { Search, Download } from 'lucide-react';
import { FINANCIAL, TRANSACTIONS, AR_AGING, AP_ITEMS, CASH_FLOW_WEEKLY } from '../data/demoData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart } from 'recharts';
import ChartTooltip from '../components/ChartTooltip';

const tabs = ['Transactions', 'AR Aging', 'AP Summary', 'Cash Flow'];

export default function Financials() {
  const [searchParams] = useSearchParams();
  const initTab = tabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'Transactions';
  const [tab, setTab] = useState(initTab);
  const [toast, setToast] = useState(null);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  return (
    <div className="space-y-5">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '10px 20px', borderRadius: 8, background: '#34d399', color: '#000', fontWeight: 600, fontSize: 13 }}>{toast}</div>
      )}
      <h1 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>Financial Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <SCard label="Cash" value={money(FINANCIAL.cash)} color="#34d399" />
        <SCard label="Effective" value={money(FINANCIAL.effectiveCash)} color="#fbbf24" />
        <SCard label="AR" value={money(FINANCIAL.arOutstanding)} color="#818cf8" />
        <SCard label="AP" value={money(FINANCIAL.apOutstanding)} color="#fb7185" />
        <SCard label="Rev MTD" value={money(FINANCIAL.revenueMTD)} color="#38bdf8" />
        <SCard label="Gross Margin" value={FINANCIAL.grossMargin + '%'} color="#34d399" />
        <SCard label="Backlog" value={money(FINANCIAL.backlog, true)} color="#818cf8" />
        <SCard label="LOC Avail" value={money(FINANCIAL.locAvailable)} color="#22d3ee" />
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-medium)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t ? 'var(--accent)' : 'var(--text-tertiary)',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, whiteSpace: 'nowrap',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Transactions' && <TransactionsTab />}
      {tab === 'AR Aging' && <ARAgingTab />}
      {tab === 'AP Summary' && <APSummaryTab />}
      {tab === 'Cash Flow' && <CashFlowTab showToast={showToast} />}
    </div>
  );
}

function SCard({ label, value, color }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
    </div>
  );
}

function TransactionsTab() {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let list = [...TRANSACTIONS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.project.toLowerCase().includes(q) || t.vendor.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [search, sortCol, sortDir]);

  const handleSort = col => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } };

  return (
    <div className="space-y-3">
      <div style={{ position: 'relative', maxWidth: 280 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter transactions..." style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              {[['Date','date'],['Project','project'],['Vendor','vendor'],['Description','description'],['Amount','amount'],['Type','type']].map(([label, col]) => (
                <th key={col} onClick={() => handleSort(col)} style={{ padding: '10px 12px', textAlign: col === 'amount' ? 'right' : 'left', cursor: 'pointer' }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{t.date}</td>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{t.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{t.vendor}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{t.description}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{money(t.amount)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{t.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ARAgingTab() {
  const current = AR_AGING.filter(a => a.ageDays <= 30).reduce((s, a) => s + a.amount, 0);
  const d30 = AR_AGING.filter(a => a.ageDays > 30 && a.ageDays <= 60).reduce((s, a) => s + a.amount, 0);
  const d60 = AR_AGING.filter(a => a.ageDays > 60 && a.ageDays <= 90).reduce((s, a) => s + a.amount, 0);
  const d90 = AR_AGING.filter(a => a.ageDays > 90).reduce((s, a) => s + a.amount, 0);
  const total = AR_AGING.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SCard label="Current (0-30)" value={money(current)} color="#34d399" />
        <SCard label="31-60 Days" value={money(d30)} color="#fbbf24" />
        <SCard label="61-90 Days" value={money(d60)} color="#fb7185" />
        <SCard label="90+ Days" value={money(d90)} color="#ef4444" />
        <SCard label="Total AR" value={money(total)} color="#818cf8" />
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Invoice/Draw</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date Issued</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Age (days)</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {AR_AGING.map((a, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{a.invoiceOrDraw}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{money(a.amount)}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{a.dateIssued}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: a.ageDays > 60 ? '#fb7185' : a.ageDays > 30 ? '#fbbf24' : 'var(--text-primary)' }}>{a.ageDays}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: a.status === 'Past Due' ? 'rgba(251,113,133,0.1)' : 'rgba(251,191,36,0.1)', color: a.status === 'Past Due' ? '#fb7185' : '#fbbf24' }}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function APSummaryTab() {
  return (
    <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Vendor</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Due Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {AP_ITEMS.map((a, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.vendor}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{money(a.amount)}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{a.dueDate}</td>
              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{a.project}</td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: a.status === 'Due Soon' ? 'rgba(251,191,36,0.1)' : 'rgba(56,189,248,0.1)', color: a.status === 'Due Soon' ? '#fbbf24' : '#38bdf8' }}>{a.status}</span>
              </td>
            </tr>
          ))}
          <tr style={{ background: 'var(--bg-elevated)', fontWeight: 700 }}>
            <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>Total</td>
            <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-primary)' }}>{money(AP_ITEMS.reduce((s, a) => s + a.amount, 0))}</td>
            <td colSpan={3}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CashFlowTab({ showToast }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>12-Week Cash Flow Projection</h3>
        <button onClick={() => showToast('Exported to CSV')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
          <Download size={12} /> Export
        </button>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', padding: 16 }}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={CASH_FLOW_WEEKLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" stroke="#475569" fontSize={11} />
            <YAxis tickFormatter={v => money(v, true)} stroke="#475569" fontSize={10} width={50} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="inflow" fill="#34d399" radius={[3, 3, 0, 0]} name="Inflows" />
            <Bar dataKey="outflow" fill="#fb7185" radius={[3, 3, 0, 0]} name="Outflows" />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} name="Balance" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Week</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Inflows</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Outflows</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Net</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {CASH_FLOW_WEEKLY.map((w, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{w.week}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#34d399' }}>{money(w.inflow)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#fb7185' }}>{money(w.outflow)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: w.net >= 0 ? '#34d399' : '#fb7185' }}>{money(w.net)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{money(w.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
