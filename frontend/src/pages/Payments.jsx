import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Search } from 'lucide-react';
import { money } from '../lib/format';

const BILLS = [
  { id: 'BILL-214', vendor: 'Williams Electric',  project: 'Johnson Office TI',  desc: 'Electrical trim-out — final billing',   amount: 12400, due: '2026-02-26', status: 'overdue',   lien: 'received' },
  { id: 'BILL-213', vendor: 'Martinez Drywall',   project: 'Johnson Office TI',  desc: 'Drywall — board, tape, float, finish',  amount:  8400, due: '2026-02-24', status: 'overdue',   lien: 'pending' },
  { id: 'BILL-212', vendor: 'Thompson Framing',   project: 'Elm St Multifamily', desc: 'Framing labor — Level 2 complete',      amount: 42000, due: '2026-02-28', status: 'due_soon',  lien: 'received' },
  { id: 'BILL-211', vendor: 'Clark HVAC',         project: 'Oak Creek',          desc: 'HVAC equipment deposit — unit ordered', amount:  8200, due: '2026-02-25', status: 'due_soon',  lien: 'na' },
  { id: 'BILL-210', vendor: '84 Lumber',          project: 'Riverside Custom',   desc: 'Lumber — 2x10 joists & LVL',           amount: 10284, due: '2026-03-01', status: 'upcoming',  lien: 'na' },
  { id: 'BILL-209', vendor: 'Davis Plumbing',     project: 'Magnolia Spec',      desc: 'Plumbing rough-in — complete',          amount:  9800, due: '2026-03-08', status: 'upcoming',  lien: 'received' },
  { id: 'BILL-208', vendor: 'Anderson Paint',     project: 'Walnut Spec',        desc: 'Interior paint — labor and material',   amount:  6800, due: '2026-03-10', status: 'upcoming',  lien: 'pending' },
  { id: 'BILL-207', vendor: 'Brown Roofing',      project: 'Magnolia Spec',      desc: 'Roof installation — complete',          amount: 14200, due: '2026-03-15', status: 'upcoming',  lien: 'received' },
  { id: 'BILL-206', vendor: 'Miller Concrete',    project: 'Riverside Custom',   desc: 'Foundation pour — Phase 2',             amount: 14200, due: '2026-03-05', status: 'upcoming',  lien: 'received' },
];

const STATUS_COLOR = {
  overdue:   { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Overdue' },
  due_soon:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Due Soon' },
  upcoming:  { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Upcoming' },
  paid:      { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.05)', label: 'Paid' },
};

const LIEN_COLOR = {
  received: { color: 'var(--status-profit)', label: 'Received' },
  pending:  { color: 'var(--status-warning)', label: 'Pending' },
  na:       { color: 'var(--text-tertiary)', label: 'N/A' },
};

export default function Payments() {
  const navigate = useNavigate();
  const [bills, setBills]     = useState(BILLS);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('All');
  const [paid, setPaid]       = useState([]);

  const rows = useMemo(() => {
    let list = bills.filter(b => !paid.includes(b.id));
    if (statusF !== 'All') list = list.filter(b => {
      if (statusF === 'Overdue') return b.status === 'overdue';
      if (statusF === 'Due Soon') return b.status === 'due_soon';
      if (statusF === 'Upcoming') return b.status === 'upcoming';
      return true;
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => b.vendor.toLowerCase().includes(q) || b.project.toLowerCase().includes(q));
    }
    return list;
  }, [bills, statusF, search, paid]);

  const paidBills = BILLS.filter(b => paid.includes(b.id));

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function paySelected() {
    if (selected.size === 0) return;
    const total = rows.filter(b => selected.has(b.id)).reduce((s, b) => s + b.amount, 0);
    setPaid(prev => [...prev, ...selected]);
    setSelected(new Set());
    alert(`Payment submitted for ${selected.size} bill(s) totaling ${money(total)}.\n\nIn production, this would initiate ACH transfers through your banking integration.`);
  }

  const totalSelected = rows.filter(b => selected.has(b.id)).reduce((s,b) => s+b.amount, 0);
  const totalDue      = rows.reduce((s,b) => s+b.amount, 0);
  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Pay Bills</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{rows.length} outstanding  ·  {money(totalDue)} total due</p>
        </div>
        {selected.size > 0 && (
          <button onClick={paySelected} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={15} /> Pay {selected.size} Selected — {money(totalSelected)}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor or project..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {['All','Overdue','Due Soon','Upcoming'].map(f => (
          <button key={f} onClick={() => setStatusF(f)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${statusF === f ? '#3b82f6' : 'var(--color-brand-border)'}`, background: statusF === f ? 'rgba(59,130,246,0.14)' : 'transparent', color: statusF === f ? '#3b82f6' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{f}</button>
        ))}
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, width: 40 }}>
                <input type="checkbox" onChange={e => { if (e.target.checked) setSelected(new Set(rows.map(b=>b.id))); else setSelected(new Set()); }} checked={rows.length > 0 && selected.size === rows.length} style={{ cursor: 'pointer' }} />
              </th>
              {['Bill #','Vendor','Project','Description','Amount','Due Date','Lien Waiver','Status'].map((h,i) => (
                <th key={h} style={{ ...thBase, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(b => {
              const sc = STATUS_COLOR[b.status];
              const lc = LIEN_COLOR[b.lien];
              const isSelected = selected.has(b.id);
              return (
                <tr key={b.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: isSelected ? 'rgba(59,130,246,0.06)' : 'transparent', transition: 'background 0.12s' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(b.id)} style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }}>{b.id}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{b.vendor}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => navigate('/projects')}>{b.project}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{b.desc}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(b.amount)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: b.status === 'overdue' ? 'var(--status-loss)' : 'var(--text-secondary)' }}>{b.due}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: lc.color }}>{lc.label}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paidBills.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Paid This Session</div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {paidBills.map(b => (
                  <tr key={b.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-tertiary)' }}>{b.id}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{b.vendor}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{b.project}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(b.amount)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'rgba(52,211,153,0.12)', color: 'var(--status-profit)' }}>Paid</span>
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
