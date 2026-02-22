import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { money } from '../lib/format';

const POS = [
  {
    id: 'PO-2026-0041', projectId: 1, project: 'Riverside Custom', vendor: 'Thompson Framing', category: 'Subcontract',
    status: 'approved', amount: 48200, committed: 48200, received: 32000, invoiced: 32000,
    created: '2026-01-10', approvedDate: '2026-01-12', dueDate: '2026-04-30', pm: 'Connor Mitchell',
    approver: 'Cole Notgrass', threshold: '$5K+',
    lineItems: [
      { desc: 'Framing labor — 1st floor walls and plates', qty: 1, unit: 'ls', unitCost: 18400, total: 18400, received: true },
      { desc: 'Framing labor — 2nd floor joists and decking', qty: 1, unit: 'ls', unitCost: 16200, total: 16200, received: true },
      { desc: 'Framing labor — roof structure and sheathing', qty: 1, unit: 'ls', unitCost: 13600, total: 13600, received: false },
    ],
    receivingLog: [
      { date: '2026-02-10', qty: 'Phase 1', note: 'First floor framing complete', amount: 18400 },
      { date: '2026-02-20', qty: 'Phase 2', note: '2nd floor joist/decking complete', amount: 13600 },
    ],
    notes: 'Work per scope exhibit A. Includes all labor, nails, and minor materials.',
  },
  {
    id: 'PO-2026-0038', projectId: 6, project: 'Elm St Multifamily', vendor: 'Thompson Framing', category: 'Subcontract',
    status: 'approved', amount: 142000, committed: 142000, received: 54000, invoiced: 54000,
    created: '2025-10-15', approvedDate: '2025-10-20', dueDate: '2026-09-01', pm: 'Alex Reyes',
    approver: 'Matt Seibert', threshold: '$25K+ (Owner)',
    lineItems: [
      { desc: 'Level 1 framing — all units', qty: 1, unit: 'ls', unitCost: 42000, total: 42000, received: true },
      { desc: 'Level 2 framing — all units', qty: 1, unit: 'ls', unitCost: 38000, total: 38000, received: true },
      { desc: 'Level 3 framing — all units', qty: 1, unit: 'ls', unitCost: 36000, total: 36000, received: false },
      { desc: 'Roof structure and sheathing', qty: 1, unit: 'ls', unitCost: 26000, total: 26000, received: false },
    ],
    receivingLog: [
      { date: '2026-01-15', qty: 'Level 1', note: 'Level 1 complete and inspected', amount: 42000 },
      { date: '2026-02-20', qty: 'Level 2', note: 'Level 2 complete', amount: 12000 },
    ],
    notes: 'Phase payments per milestone per exhibit B. Inspector signoff required before each payment.',
  },
  {
    id: 'PO-2026-0044', projectId: 1, project: 'Riverside Custom', vendor: 'Miller Concrete', category: 'Material',
    status: 'partially_received', amount: 22800, committed: 22800, received: 14200, invoiced: 14200,
    created: '2026-01-20', approvedDate: '2026-01-22', dueDate: '2026-03-15', pm: 'Connor Mitchell',
    approver: 'Connor Mitchell', threshold: 'Under $5K per delivery',
    lineItems: [
      { desc: 'Foundation footings — ready-mix concrete 3000 psi', qty: 18, unit: 'yd³', unitCost: 185, total: 3330, received: true },
      { desc: 'Foundation walls — ready-mix concrete 3000 psi', qty: 28, unit: 'yd³', unitCost: 185, total: 5180, received: true },
      { desc: 'Garage slab — fiber-reinforced 4000 psi', qty: 14, unit: 'yd³', unitCost: 195, total: 2730, received: true },
      { desc: 'Driveway apron and walks', qty: 10, unit: 'yd³', unitCost: 185, total: 1850, received: false },
      { desc: 'Pump truck rental — 4 pours', qty: 4, unit: 'ea', unitCost: 620, total: 2480, received: false },
      { desc: 'Finishing labor — flatwork', qty: 1, unit: 'ls', unitCost: 7230, total: 7230, received: false },
    ],
    receivingLog: [
      { date: '2026-01-30', qty: '18 yd³', note: 'Footer pour complete', amount: 3330 },
      { date: '2026-02-05', qty: '28 yd³', note: 'Foundation walls north/west', amount: 5180 },
      { date: '2026-02-18', qty: '14 yd³', note: 'Garage slab poured', amount: 5690 },
    ],
    notes: 'Mix designs approved by structural engineer. Pump truck included in pricing.',
  },
  {
    id: 'PO-2026-0051', projectId: 7, project: 'Walnut Spec', vendor: 'Davis Plumbing', category: 'Subcontract',
    status: 'sent', amount: 18400, committed: 18400, received: 0, invoiced: 0,
    created: '2026-02-01', approvedDate: '2026-02-05', dueDate: '2026-04-15', pm: 'Connor Mitchell',
    approver: 'Joseph Kowalski', threshold: '$5–25K (Finance)',
    lineItems: [
      { desc: 'Underground DWV rough-in', qty: 1, unit: 'ls', unitCost: 6200, total: 6200, received: false },
      { desc: 'Above-grade DWV rough-in', qty: 1, unit: 'ls', unitCost: 5400, total: 5400, received: false },
      { desc: 'Water supply rough-in', qty: 1, unit: 'ls', unitCost: 4200, total: 4200, received: false },
      { desc: 'Fixture set — all fixtures', qty: 1, unit: 'ls', unitCost: 2600, total: 2600, received: false },
    ],
    receivingLog: [],
    notes: 'Underground complete per daily log 2/22. PO issued on schedule.',
  },
  {
    id: 'PO-2026-0035', projectId: 5, project: 'Johnson Office TI', vendor: 'Williams Electric', category: 'Subcontract',
    status: 'closed', amount: 32600, committed: 32600, received: 32600, invoiced: 32600,
    created: '2025-09-01', approvedDate: '2025-09-05', dueDate: '2026-02-28', pm: 'Joseph Kowalski',
    approver: 'Matt Seibert', threshold: '$25K+ (Owner)',
    lineItems: [
      { desc: 'Demo and disconnect existing service', qty: 1, unit: 'ls', unitCost: 4200, total: 4200, received: true },
      { desc: '400A commercial service installation', qty: 1, unit: 'ls', unitCost: 12800, total: 12800, received: true },
      { desc: 'Branch circuit rough-in — all offices', qty: 1, unit: 'ls', unitCost: 9400, total: 9400, received: true },
      { desc: 'Lighting, outlets, final trim', qty: 1, unit: 'ls', unitCost: 6200, total: 6200, received: true },
    ],
    receivingLog: [
      { date: '2025-10-15', qty: 'Phase 1', note: 'Demo and service install', amount: 17000 },
      { date: '2026-01-20', qty: 'Phase 2', note: 'Rough-in complete', amount: 9400 },
      { date: '2026-02-18', qty: 'Final', note: 'Final trim and CO-ready', amount: 6200 },
    ],
    notes: 'Final inspection passed 2/24. CO-ready.',
  },
  {
    id: 'PO-2026-0055', projectId: 2, project: 'Oak Creek', vendor: 'Nashville Lumber Co.', category: 'Material',
    status: 'pending_approval', amount: 28400, committed: 0, received: 0, invoiced: 0,
    created: '2026-02-20', approvedDate: null, dueDate: '2026-03-15', pm: 'Connor Mitchell',
    approver: 'Matt Seibert (required — >$25K)', threshold: '$25K+ (Owner)',
    lineItems: [
      { desc: 'Framing lumber package — walls and plates', qty: 1, unit: 'ls', unitCost: 18200, total: 18200, received: false },
      { desc: 'LVL beams — garage and bearing points', qty: 8, unit: 'ea', unitCost: 245, total: 1960, received: false },
      { desc: 'TJI joists 11-7/8″ 230 — 2nd floor', qty: 42, unit: 'ea', unitCost: 196, total: 8232, received: false },
      { desc: 'Delivery and unloading', qty: 1, unit: 'ls', unitCost: 8, total: 8, received: false },
    ],
    receivingLog: [],
    notes: 'Awaiting Matt approval. Framing schedule contingent on this material delivery.',
  },
];

const STATUS_CONFIG = {
  draft:             { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)', label: 'Draft' },
  pending_approval:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Pending Approval' },
  approved:          { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)', label: 'Approved' },
  sent:              { color: '#8b5cf6',               bg: 'rgba(139,92,246,0.12)', label: 'Sent to Vendor' },
  partially_received:{ color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Partially Received' },
  received:          { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Received' },
  closed:            { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)', label: 'Closed' },
};

function PODetail({ po, onClose }) {
  const receivedPct = po.amount > 0 ? Math.round((po.received / po.amount) * 100) : 0;
  const navigate = useNavigate();
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{po.id}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{po.vendor} · {po.project}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 5, background: STATUS_CONFIG[po.status]?.bg, color: STATUS_CONFIG[po.status]?.color }}>{STATUS_CONFIG[po.status]?.label}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={16} /></button>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[['Project', po.project], ['PM', po.pm], ['Vendor', po.vendor], ['Category', po.category], ['Created', po.created], ['Due', po.dueDate], ['Approved By', po.approver || 'Pending'], ['Approval Threshold', po.threshold]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Financial summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[['PO Amount', money(po.amount), 'var(--text-primary)'], ['Received', money(po.received), 'var(--status-profit)'], ['Invoiced', money(po.invoiced), '#3b82f6'], ['Balance', money(po.amount - po.received), po.amount - po.received > 0 ? 'var(--status-warning)' : 'var(--status-profit)']].map(([l, v, c]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Receipt Progress</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{receivedPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--color-brand-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${receivedPct}%`, background: receivedPct === 100 ? 'var(--status-profit)' : '#3b82f6', borderRadius: 3 }} />
          </div>
        </div>

        {/* Line items */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Line Items</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
              {['Description', 'Qty', 'Unit', 'Unit Cost', 'Total', 'Received'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: h === 'Unit Cost' || h === 'Total' ? 'right' : 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {po.lineItems.map((li, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>{li.desc}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{li.qty}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{li.unit}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{money(li.unitCost)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{money(li.total)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>{li.received ? <CheckCircle size={14} style={{ color: 'var(--status-profit)' }} /> : <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Receiving log */}
        {po.receivingLog.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Receiving Log</div>
            {po.receivingLog.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--color-brand-border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', flexShrink: 0 }}>{r.date}</span>
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{r.qty} — {r.note}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--status-profit)', flexShrink: 0 }}>{money(r.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {po.notes && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '10px 12px', border: '1px solid var(--color-brand-border)', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{po.notes}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Close</button>
          {po.status === 'pending_approval' && <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--status-profit)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Approve PO</button>}
          {(po.status === 'approved' || po.status === 'sent') && <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Record Receipt</button>}
        </div>
      </div>
    </div>
  );
}

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [detail, setDetail]       = useState(null);

  const statuses = ['All', 'pending_approval', 'approved', 'sent', 'partially_received', 'closed'];

  const filtered = useMemo(() => POS.filter(po => {
    if (statusFilter !== 'All' && po.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return po.id.toLowerCase().includes(q) || po.vendor.toLowerCase().includes(q) || po.project.toLowerCase().includes(q);
    }
    return true;
  }), [search, statusFilter]);

  const totalCommitted  = POS.filter(p => p.status !== 'draft').reduce((s, p) => s + p.amount, 0);
  const totalReceived   = POS.reduce((s, p) => s + p.received, 0);
  const pendingApproval = POS.filter(p => p.status === 'pending_approval').length;
  const openPOs         = POS.filter(p => !['closed', 'draft'].includes(p.status)).length;

  const thBase = { padding: '9px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-5">
      {detail && <PODetail po={detail} onClose={() => setDetail(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Purchase Orders</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{POS.length} POs · {money(totalCommitted, true)} committed · {openPOs} open</p>
        </div>
        <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={13} /> New PO
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Open POs', openPOs, 'var(--text-primary)'],
          ['Committed', money(totalCommitted, true), '#3b82f6'],
          ['Received', money(totalReceived, true), 'var(--status-profit)'],
          ['Pending Approval', pendingApproval, pendingApproval > 0 ? 'var(--status-warning)' : 'var(--status-profit)'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {pendingApproval > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--status-warning)' }}>{pendingApproval} PO{pendingApproval > 1 ? 's' : ''} awaiting approval</strong> — review and approve to unblock vendor orders.
          </span>
        </div>
      )}

      {/* Approval thresholds reference */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Approval Thresholds</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['Under $5K', 'PM Self-Approve', '#3b82f6'], ['$5K–$25K', 'Finance Director (Samuel)', 'var(--status-warning)'], ['$25K+', 'Owner Approval Required (Matt)', 'var(--status-loss)']].map(([range, who, color]) => (
            <div key={range} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{range}</strong> — {who}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 260 }}>
          <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="PO #, vendor, project..."
            style={{ width: '100%', paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statuses.map(s => {
            const label = s === 'All' ? 'All' : STATUS_CONFIG[s]?.label || s;
            return (
              <button key={s} onClick={() => setStatus(s)} style={{ padding: '6px 11px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: `1px solid ${statusFilter === s ? '#3b82f6' : 'var(--color-brand-border)'}`, background: statusFilter === s ? 'rgba(59,130,246,0.14)' : 'transparent', color: statusFilter === s ? '#3b82f6' : 'var(--text-secondary)' }}>{label}</button>
            );
          })}
        </div>
      </div>

      {/* PO Table */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['PO Number', 'Project', 'Vendor', 'Category', 'Amount', 'Received', 'Balance', 'Due', 'Approver', 'Status', ''].map((h, i) => (
              <th key={h + i} style={{ ...thBase, textAlign: ['Amount', 'Received', 'Balance'].includes(h) ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((po, i) => {
              const sc = STATUS_CONFIG[po.status] || {};
              const balance = po.amount - po.received;
              return (
                <tr key={po.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#3b82f6', cursor: 'pointer' }} onClick={() => setDetail(po)}>{po.id}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => navigate(`/projects/${po.projectId}`)}>{po.project}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{po.vendor}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-tertiary)' }}>{po.category}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, textAlign: 'right', color: 'var(--text-primary)' }}>{money(po.amount)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(po.received)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, textAlign: 'right', color: balance > 0 ? 'var(--status-warning)' : 'var(--status-profit)' }}>{money(balance)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{po.dueDate}</td>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-tertiary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.approver || 'Pending'}</td>
                  <td style={{ padding: '9px 14px' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</span></td>
                  <td style={{ padding: '9px 14px' }}>
                    <button onClick={() => setDetail(po)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>View</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No POs match filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
