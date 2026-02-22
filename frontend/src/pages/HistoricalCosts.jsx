import { useState, useMemo } from 'react';
import { Search, Download, X } from 'lucide-react';
import { money } from '../lib/format';

const TRANSACTIONS = [
  { id:  1, date: '2026-02-22', project: 'Riverside Custom',   projectId: 1, vendor: 'Thompson Framing',    code: '06-100', type: 'Subcontract', method: 'ACH',   amount: 13600, description: '2nd floor joist/decking labor — Phase 2 partial',  po: 'PO-2026-0041', invoice: 'TF-2024' },
  { id:  2, date: '2026-02-21', project: 'Elm St Multifamily',  projectId: 6, vendor: 'Thompson Framing',    code: '06-100', type: 'Subcontract', method: 'ACH',   amount: 12000, description: 'Level 2 framing labor — milestone 2 partial',         po: 'PO-2026-0038', invoice: 'TF-2025' },
  { id:  3, date: '2026-02-20', project: 'Oak Creek',           projectId: 2, vendor: 'Miller Concrete',     code: '03-100', type: 'Subcontract', method: 'Check', amount: 5180,  description: 'Foundation walls north/west — ready mix 28 yd³',     po: 'PO-2026-0044', invoice: 'MC-0812' },
  { id:  4, date: '2026-02-20', project: 'Walnut Spec',         projectId: 7, vendor: 'Davis Plumbing',      code: '15-100', type: 'Subcontract', method: 'ACH',   amount: 6200,  description: 'Underground DWV rough-in — complete',                 po: 'PO-2026-0051', invoice: 'DP-2260' },
  { id:  5, date: '2026-02-20', project: 'Johnson Office TI',   projectId: 5, vendor: 'Williams Electric',   code: '16-100', type: 'Subcontract', method: 'ACH',   amount: 9400,  description: 'Rough-in complete — final payment Phase 2',           po: 'PO-2026-0035', invoice: 'WE-0441' },
  { id:  6, date: '2026-02-19', project: 'Riverside Custom',   projectId: 1, vendor: 'Nashville Lumber Co.', code: '06-110', type: 'Material',    method: 'Card',  amount: 1248,  description: 'Framing nails, joist hangers, hurricane ties',        po: null,           invoice: null },
  { id:  7, date: '2026-02-18', project: 'Riverside Custom',   projectId: 1, vendor: 'Miller Concrete',     code: '03-200', type: 'Subcontract', method: 'Check', amount: 5690,  description: 'Garage slab — fiber-reinforced 14 yd³ + pump truck',   po: 'PO-2026-0044', invoice: 'MC-0811' },
  { id:  8, date: '2026-02-18', project: 'Johnson Office TI',   projectId: 5, vendor: 'Williams Electric',   code: '16-200', type: 'Subcontract', method: 'ACH',   amount: 6200,  description: 'Final electrical trim — CO-ready',                    po: 'PO-2026-0035', invoice: 'WE-0442' },
  { id:  9, date: '2026-02-14', project: 'Oak Creek',           projectId: 2, vendor: 'Miller Concrete',     code: '03-100', type: 'Subcontract', method: 'Check', amount: 3330,  description: 'Footer pour east elevation — 18 yd³ ready-mix',       po: 'PO-2026-0044', invoice: 'MC-0810' },
  { id: 10, date: '2026-02-13', project: 'Elm St Multifamily',  projectId: 6, vendor: 'Nashville Lumber Co.', code: '06-110', type: 'Material',   method: 'ACH',   amount: 18400, description: 'Level 2 lumber package — studs, plates, HDR lumber',  po: 'PO-2026-0055', invoice: 'NL-8821' },
  { id: 11, date: '2026-02-10', project: 'Riverside Custom',   projectId: 1, vendor: 'Nashville Lumber Co.', code: '06-110', type: 'Material',    method: 'ACH',   amount: 8240,  description: 'LVL beams (4) + joist hangers + OSB sheathing',       po: null,           invoice: 'NL-8814' },
  { id: 12, date: '2026-02-08', project: 'Magnolia Spec',       projectId: 4, vendor: 'Anderson Paint',      code: '09-900', type: 'Subcontract', method: 'Check', amount: 4800,  description: 'Interior paint — complete, touch-ups pending',        po: null,           invoice: 'AP-0112' },
  { id: 13, date: '2026-02-05', project: 'Walnut Spec',         projectId: 7, vendor: 'Clark HVAC',          code: '15-200', type: 'Subcontract', method: 'ACH',   amount: 8400,  description: 'HVAC rough-in — 50% milestone payment',              po: null,           invoice: 'CH-0288' },
  { id: 14, date: '2026-02-03', project: 'Elm St Multifamily',  projectId: 6, vendor: 'Thompson Framing',    code: '06-100', type: 'Subcontract', method: 'ACH',   amount: 42000, description: 'Level 1 framing complete — milestone payment',        po: 'PO-2026-0038', invoice: 'TF-2020' },
  { id: 15, date: '2026-02-01', project: 'Riverside Custom',   projectId: 1, vendor: 'Clark HVAC',           code: '15-200', type: 'Subcontract', method: 'ACH',   amount: 6800,  description: 'HVAC equipment delivery and rough placement',         po: null,           invoice: 'CH-0280' },
  { id: 16, date: '2026-01-28', project: 'Johnson Office TI',   projectId: 5, vendor: 'Williams Electric',   code: '16-100', type: 'Subcontract', method: 'ACH',   amount: 17000, description: 'Demo + 400A service install — Phase 1',               po: 'PO-2026-0035', invoice: 'WE-0430' },
  { id: 17, date: '2026-01-22', project: 'Magnolia Spec',       projectId: 4, vendor: 'Martinez Drywall',    code: '09-200', type: 'Subcontract', method: 'Check', amount: 12400, description: 'Drywall hang, tape, texture — complete',             po: null,           invoice: 'MD-0088' },
  { id: 18, date: '2026-01-18', project: 'Walnut Spec',         projectId: 7, vendor: 'Davis Plumbing',      code: '15-300', type: 'Subcontract', method: 'ACH',   amount: 4200,  description: 'Water supply rough-in — complete',                    po: 'PO-2026-0051', invoice: 'DP-2255' },
  { id: 19, date: '2026-01-15', project: 'Oak Creek',           projectId: 2, vendor: 'Nashville Lumber Co.', code: '06-110', type: 'Material',   method: 'ACH',   amount: 6840,  description: 'Foundation form lumber + anchor bolts + hardware',    po: null,           invoice: 'NL-8802' },
  { id: 20, date: '2026-01-10', project: 'Riverside Custom',   projectId: 1, vendor: 'Thompson Framing',    code: '06-100', type: 'Subcontract', method: 'ACH',   amount: 18400, description: '1st floor framing complete — Phase 1 milestone',      po: 'PO-2026-0041', invoice: 'TF-2010' },
];

const PROJECTS_LIST = ['All', ...Array.from(new Set(TRANSACTIONS.map(t => t.project)))];
const TYPES         = ['All', 'Material', 'Subcontract', 'Labor', 'Equipment', 'Overhead'];
const METHODS       = ['All', 'ACH', 'Check', 'Card', 'Wire'];
const CODE_LIST     = ['All', ...Array.from(new Set(TRANSACTIONS.map(t => t.code))).sort()];

const TYPE_COLORS = {
  Material:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  Subcontract: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Labor:       { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Equipment:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Overhead:    { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.07)' },
};

// Aggregation helpers
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = { key: k, items: [], total: 0 };
    acc[k].items.push(item);
    acc[k].total += item.amount;
    return acc;
  }, {});
}

export default function HistoricalCosts() {
  const [search, setSearch]   = useState('');
  const [project, setProject] = useState('All');
  const [type, setType]       = useState('All');
  const [method, setMethod]   = useState('All');
  const [code, setCode]       = useState('All');
  const [view, setView]       = useState('transactions');
  const [startDate, setStart] = useState('2026-01-01');
  const [endDate, setEnd]     = useState('2026-02-28');

  const filtered = useMemo(() => TRANSACTIONS.filter(t => {
    if (project !== 'All' && t.project !== project) return false;
    if (type !== 'All' && t.type !== type) return false;
    if (method !== 'All' && t.method !== method) return false;
    if (code !== 'All' && t.code !== code) return false;
    if (t.date < startDate || t.date > endDate) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.vendor.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.po || '').toLowerCase().includes(q) || (t.invoice || '').toLowerCase().includes(q);
    }
    return true;
  }), [project, type, method, code, search, startDate, endDate]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  // Aggregated views
  const byProject  = Object.values(groupBy(filtered, 'project')).sort((a, b) => b.total - a.total);
  const byVendor   = Object.values(groupBy(filtered, 'vendor')).sort((a, b) => b.total - a.total);
  const byCode     = Object.values(groupBy(filtered, 'code')).sort((a, b) => b.total - a.total);

  const thBase = { padding: '8px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  const AggTable = ({ rows, labelKey, labelHeader }) => (
    <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={thBase}>{labelHeader}</th>
          <th style={{ ...thBase, textAlign: 'right' }}>Total</th>
          <th style={{ ...thBase, textAlign: 'right' }}>Transactions</th>
          <th style={{ ...thBase, textAlign: 'right' }}>% of Total</th>
          <th style={thBase}>Bar</th>
        </tr></thead>
        <tbody>
          {rows.map((r, i) => {
            const barPct = total > 0 ? (r.total / total) * 100 : 0;
            return (
              <tr key={r.key} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.key}</td>
                <td style={{ padding: '9px 14px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>{money(r.total)}</td>
                <td style={{ padding: '9px 14px', fontSize: 11, textAlign: 'right', color: 'var(--text-secondary)' }}>{r.items.length}</td>
                <td style={{ padding: '9px 14px', fontSize: 11, textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{barPct.toFixed(1)}%</td>
                <td style={{ padding: '9px 14px', minWidth: 100 }}>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-brand-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barPct}%`, background: '#3b82f6', borderRadius: 3 }} />
                  </div>
                </td>
              </tr>
            );
          })}
          <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Total</td>
            <td style={{ padding: '9px 14px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, textAlign: 'right', color: 'var(--status-profit)' }}>{money(total)}</td>
            <td style={{ padding: '9px 14px', fontSize: 11, textAlign: 'right', color: 'var(--text-secondary)' }}>{filtered.length}</td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Historical Cost Detail</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{TRANSACTIONS.length} transactions · {money(TRANSACTIONS.reduce((s, t) => s + t.amount, 0), true)} total</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['transactions', 'by_project', 'by_vendor', 'by_code'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: `1px solid ${view === v ? '#3b82f6' : 'var(--color-brand-border)'}`, background: view === v ? 'rgba(59,130,246,0.14)' : 'transparent', color: view === v ? '#3b82f6' : 'var(--text-secondary)' }}>
            {v === 'transactions' ? 'All Transactions' : v === 'by_project' ? 'By Project' : v === 'by_vendor' ? 'By Vendor' : 'By Cost Code'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 160px', maxWidth: 240 }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Vendor, desc, PO, invoice..."
              style={{ width: '100%', paddingLeft: 26, paddingRight: 8, paddingTop: 6, paddingBottom: 6, borderRadius: 6, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {[['Project', project, setProject, PROJECTS_LIST], ['Type', type, setType, TYPES], ['Method', method, setMethod, METHODS], ['Code', code, setCode, CODE_LIST]].map(([l, val, setter, opts]) => (
            <select key={l} value={val} onChange={e => setter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
              {opts.map(o => <option key={o} value={o}>{o === 'All' ? `All ${l}s` : o}</option>)}
            </select>
          ))}
          <input type="date" value={startDate} onChange={e => setStart(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>—</span>
          <input type="date" value={endDate} onChange={e => setEnd(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{filtered.length} transactions · {money(total)}</span>
        </div>
      </div>

      {/* Transaction table */}
      {view === 'transactions' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Date', 'Project', 'Vendor', 'Cost Code', 'Type', 'Method', 'PO / Invoice', 'Amount', 'Description'].map((h, i) => (
                <th key={h + i} style={{ ...thBase, textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((t, i) => {
                const tc = TYPE_COLORS[t.type] || TYPE_COLORS.Overhead;
                return (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{t.date}</td>
                    <td style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{t.project.split(' ').slice(0, 2).join(' ')}</td>
                    <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t.vendor}</td>
                    <td style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'monospace', color: '#3b82f6' }}>{t.code}</td>
                    <td style={{ padding: '8px 14px' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: tc.bg, color: tc.color }}>{t.type}</span></td>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-tertiary)' }}>{t.method}</td>
                    <td style={{ padding: '8px 14px', fontSize: 10, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{t.po || t.invoice || '—'}</td>
                    <td style={{ padding: '8px 14px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>{money(t.amount)}</td>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No transactions match filters.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'by_project' && <AggTable rows={byProject} labelKey="project" labelHeader="Project" />}
      {view === 'by_vendor'  && <AggTable rows={byVendor}  labelKey="vendor"  labelHeader="Vendor" />}
      {view === 'by_code'    && <AggTable rows={byCode}    labelKey="code"    labelHeader="Cost Code" />}
    </div>
  );
}
