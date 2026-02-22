import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, X } from 'lucide-react';
import { money } from '../lib/format';

const PURCHASE_ORDERS = [
  { id: 'PO-089', vendor: '84 Lumber',         project: 'Riverside Custom',   desc: 'Lumber — stair stringers and 2x12',   amount: 10284, date: '2026-02-20', status: 'pending_approval', approver: 'Matt Seibert' },
  { id: 'PO-088', vendor: 'Thompson Framing',   project: 'Elm St Multifamily', desc: 'Framing labor — level 2 complete',    amount: 42000, date: '2026-02-18', status: 'approved',          approver: 'Cole Notgrass' },
  { id: 'PO-087', vendor: 'Miller Concrete',    project: 'Oak Creek',          desc: 'Foundation walls — east/south',       amount: 24200, date: '2026-02-15', status: 'approved',          approver: 'Connor Mitchell' },
  { id: 'PO-086', vendor: 'Williams Electric',  project: 'Johnson Office TI',  desc: 'Electrical trim-out — final',         amount: 12400, date: '2026-02-14', status: 'approved',          approver: 'Joseph Kowalski' },
  { id: 'PO-085', vendor: 'Clark HVAC',         project: 'Oak Creek',          desc: 'HVAC equipment deposit',              amount:  8200, date: '2026-02-12', status: 'approved',          approver: 'Connor Mitchell' },
  { id: 'PO-084', vendor: 'Davis Plumbing',     project: 'Magnolia Spec',      desc: 'Plumbing rough-in — complete',        amount:  9800, date: '2026-02-10', status: 'approved',          approver: 'Joseph Kowalski' },
  { id: 'PO-083', vendor: 'Anderson Paint',     project: 'Walnut Spec',        desc: 'Interior paint — labor and material', amount:  6800, date: '2026-02-08', status: 'approved',          approver: 'Connor Mitchell' },
  { id: 'PO-082', vendor: 'Brown Roofing',      project: 'Walnut Spec',        desc: 'Roof system — shingles and labor',    amount: 18400, date: '2026-02-05', status: 'approved',          approver: 'Connor Mitchell' },
  { id: 'PO-081', vendor: 'Martinez Drywall',   project: 'Johnson Office TI',  desc: 'Drywall — board, tape, finish',       amount:  8400, date: '2026-02-01', status: 'approved',          approver: 'Joseph Kowalski' },
  { id: 'PO-080', vendor: 'Earthworks Inc',     project: 'Oak Creek',          desc: 'Site grading — full scope',           amount: 12000, date: '2026-01-28', status: 'approved',          approver: 'Connor Mitchell' },
  { id: 'PO-079', vendor: 'Thompson Framing',   project: 'Riverside Custom',   desc: 'Framing labor — weeks 1-4',           amount: 38400, date: '2026-01-15', status: 'approved',          approver: 'Connor Mitchell' },
  { id: 'PO-078', vendor: 'Miller Concrete',    project: 'Riverside Custom',   desc: 'Concrete — foundation and flatwork',  amount: 24800, date: '2026-01-10', status: 'closed',            approver: 'Connor Mitchell' },
];

const STATUS_COLOR = {
  pending_approval: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Needs Approval' },
  approved:         { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Approved' },
  closed:           { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.05)', label: 'Closed' },
};

const STATUS_FILTERS = ['All', 'Needs Approval', 'Approved', 'Closed'];

export default function Exceptions() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('All');
  const [pos, setPos]         = useState(PURCHASE_ORDERS);

  const rows = useMemo(() => {
    let list = pos;
    if (statusF === 'Needs Approval') list = list.filter(p => p.status === 'pending_approval');
    else if (statusF === 'Approved')  list = list.filter(p => p.status === 'approved');
    else if (statusF === 'Closed')    list = list.filter(p => p.status === 'closed');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.vendor.toLowerCase().includes(q) || p.project.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }, [search, statusF, pos]);

  function approve(id) {
    setPos(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  }
  function reject(id) {
    setPos(prev => prev.map(p => p.id === id ? { ...p, status: 'closed' } : p));
  }

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };
  const totalPending = pos.filter(p => p.status === 'pending_approval').reduce((s,p)=>s+p.amount,0);

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Purchase Orders</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {pos.filter(p=>p.status==='pending_approval').length} pending approval  ·  {money(totalPending)} awaiting
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search POs..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusF(f)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${statusF === f ? '#3b82f6' : 'var(--color-brand-border)'}`, background: statusF === f ? 'rgba(59,130,246,0.14)' : 'transparent', color: statusF === f ? '#3b82f6' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['PO #','Vendor','Project','Description','Amount','Date','Approver','Status','Actions'].map((h,i) => (
                  <th key={h} style={{ ...thBase, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(po => {
                const sc = STATUS_COLOR[po.status];
                return (
                  <tr key={po.id} style={{ borderTop: '1px solid var(--color-brand-border)', transition: 'background 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{po.id}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{po.vendor}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => navigate('/projects')}>{po.project}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{po.desc}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(po.amount)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{po.date}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{po.approver}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {po.status === 'pending_approval' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => approve(po.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', background: 'rgba(52,211,153,0.15)', color: 'var(--status-profit)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button onClick={() => reject(po.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', background: 'rgba(251,113,133,0.12)', color: 'var(--status-loss)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <X size={11} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
