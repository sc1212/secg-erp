import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, Search, Plus, X, Layers } from 'lucide-react';
import { money } from '../lib/format';
import { PROJECTS } from '../lib/demoData';

const LOCATIONS = ['All', 'Main Yard', 'Trailer 1', 'Trailer 2', 'Riverside Site', 'Elm St Site', 'Oak Creek Site'];

const ITEMS = [
  { id:  1, sku: 'LUM-2616',   name: 'Dimensional Lumber 2×6×16',       category: 'Framing',    unit: 'bd ft',  qty: 840,  minQty: 200,  location: 'Main Yard',      projectId: 1, cost: 1.20,   supplier: 'Nashville Lumber Co.',   lastOrder: '2026-02-10', lastReceived: '2026-02-14' },
  { id:  2, sku: 'OSB-716',    name: 'OSB Sheathing 7/16 4×8',          category: 'Framing',    unit: 'sheet',  qty: 120,  minQty: 30,   location: 'Main Yard',      projectId: 2, cost: 18.50,  supplier: 'Nashville Lumber Co.',   lastOrder: '2026-02-08', lastReceived: '2026-02-12' },
  { id:  3, sku: 'PVC-340-3',  name: 'Schedule 40 PVC 3″×10′',          category: 'Plumbing',   unit: 'stick',  qty: 24,   minQty: 10,   location: 'Trailer 1',      projectId: 1, cost: 14.75,  supplier: 'Able Plumbing Supply',  lastOrder: '2026-01-28', lastReceived: '2026-02-01' },
  { id:  4, sku: 'ROM-122',    name: 'ROMEX 12/2 Wire',                  category: 'Electrical', unit: 'ft',     qty: 1200, minQty: 500,  location: 'Trailer 2',      projectId: 7, cost: 0.62,   supplier: 'Middle TN Electric',    lastOrder: '2026-02-05', lastReceived: '2026-02-07' },
  { id:  5, sku: 'ANCH-5012',  name: 'Anchor Bolt ½″×12″',              category: 'Foundation', unit: 'ea',     qty: 340,  minQty: 100,  location: 'Oak Creek Site',  projectId: 2, cost: 1.85,   supplier: 'Nashville Lumber Co.',   lastOrder: '2026-01-20', lastReceived: '2026-01-24' },
  { id:  6, sku: 'INS-R38',    name: 'Blown Insulation R-38',            category: 'Insulation', unit: 'bag',    qty: 18,   minQty: 20,   location: 'Main Yard',      projectId: 1, cost: 22.00,  supplier: 'Insulate Pro',          lastOrder: '2026-02-12', lastReceived: '2026-02-18' },
  { id:  7, sku: 'LP-SP48',    name: 'LP SmartSide Panel 4×8',           category: 'Siding',     unit: 'sheet',  qty: 0,    minQty: 15,   location: '—',               projectId: 5, cost: 54.00,  supplier: 'Southeast Building',    lastOrder: '2026-01-15', lastReceived: null },
  { id:  8, sku: 'HDL-825',    name: 'Hardie Lap Siding 8.25″×12′',     category: 'Siding',     unit: 'pc',     qty: 88,   minQty: 40,   location: 'Elm St Site',     projectId: 6, cost: 9.40,   supplier: 'Southeast Building',    lastOrder: '2026-02-01', lastReceived: '2026-02-05' },
  { id:  9, sku: 'CFT-12',     name: 'Concrete Form Tube 12″',           category: 'Foundation', unit: 'ea',     qty: 8,    minQty: 5,    location: 'Oak Creek Site',  projectId: 2, cost: 16.20,  supplier: 'Able Plumbing Supply',  lastOrder: '2025-12-18', lastReceived: '2025-12-22' },
  { id: 10, sku: 'FBR-R15',    name: 'Fiberglass Batt R-15 3.5″',       category: 'Insulation', unit: 'bag',    qty: 6,    minQty: 15,   location: 'Trailer 1',      projectId: 4, cost: 38.00,  supplier: 'Insulate Pro',          lastOrder: '2026-01-30', lastReceived: '2026-02-02' },
  { id: 11, sku: 'JH-210',     name: 'Galvanized Joist Hanger 2×10',    category: 'Hardware',   unit: 'box',    qty: 14,   minQty: 5,    location: 'Trailer 2',      projectId: 2, cost: 28.50,  supplier: 'Nashville Lumber Co.',   lastOrder: '2026-02-14', lastReceived: '2026-02-16' },
  { id: 12, sku: 'RN-175',     name: 'Roofing Nail 1.75″ Coil',         category: 'Hardware',   unit: 'box',    qty: 32,   minQty: 10,   location: 'Main Yard',      projectId: 1, cost: 44.00,  supplier: 'Southeast Building',    lastOrder: '2026-02-03', lastReceived: '2026-02-06' },
  { id: 13, sku: 'PEX-5100',   name: 'PEX-A Tubing ½″×100′',           category: 'Plumbing',   unit: 'roll',   qty: 9,    minQty: 4,    location: 'Trailer 1',      projectId: 7, cost: 74.00,  supplier: 'Able Plumbing Supply',  lastOrder: '2026-01-25', lastReceived: '2026-01-28' },
  { id: 14, sku: 'LVL-3520',   name: 'LVL Beam 3.5×9.5×20′',           category: 'Framing',    unit: 'ea',     qty: 4,    minQty: 2,    location: 'Riverside Site',  projectId: 1, cost: 218.00, supplier: 'Nashville Lumber Co.',   lastOrder: '2026-02-10', lastReceived: '2026-02-14' },
  { id: 15, sku: 'GFCI-20A',   name: 'GFCI Outlet 20A Tamper-Resist',  category: 'Electrical', unit: 'ea',     qty: 28,   minQty: 12,   location: 'Trailer 2',      projectId: 4, cost: 12.40,  supplier: 'Middle TN Electric',    lastOrder: '2026-01-18', lastReceived: '2026-01-22' },
  { id: 16, sku: 'TYVK-9100',  name: 'House Wrap Tyvek 9×100′',        category: 'Siding',     unit: 'roll',   qty: 2,    minQty: 4,    location: 'Elm St Site',     projectId: 6, cost: 128.00, supplier: 'Southeast Building',    lastOrder: '2026-01-12', lastReceived: '2026-01-16' },
  { id: 17, sku: 'CBB-35',     name: 'Concrete Backer Board 3×5',       category: 'Tile',       unit: 'sheet',  qty: 22,   minQty: 10,   location: 'Trailer 1',      projectId: 1, cost: 11.80,  supplier: 'Southeast Building',    lastOrder: '2026-02-07', lastReceived: '2026-02-10' },
  { id: 18, sku: 'STS-310',    name: 'Self-Tapping Screws 3″ #10',     category: 'Hardware',   unit: 'box',    qty: 7,    minQty: 6,    location: 'Trailer 2',      projectId: 7, cost: 16.50,  supplier: 'Nashville Lumber Co.',   lastOrder: '2026-01-22', lastReceived: '2026-01-26' },
  { id: 19, sku: 'REBAR-5',    name: 'Rebar #5 20′',                    category: 'Foundation', unit: 'stick',  qty: 42,   minQty: 20,   location: 'Oak Creek Site',  projectId: 2, cost: 12.80,  supplier: 'Nashville Lumber Co.',   lastOrder: '2026-02-15', lastReceived: '2026-02-18' },
  { id: 20, sku: 'WD-2X4-92',  name: 'Stud 2×4×92.5″',                 category: 'Framing',    unit: 'ea',     qty: 1840, minQty: 300,  location: 'Elm St Site',     projectId: 6, cost: 4.25,   supplier: 'Nashville Lumber Co.',   lastOrder: '2026-02-18', lastReceived: '2026-02-20' },
];

const ALLOCATIONS = [
  { id: 1, project: 'Riverside Custom',   projectId: 1, sku: 'LUM-2616',   qty: 400, status: 'in_use',    phase: 'Framing',     allocated: '2026-02-01', pm: 'Connor Mitchell' },
  { id: 2, project: 'Riverside Custom',   projectId: 1, sku: 'LVL-3520',   qty: 4,   status: 'in_use',    phase: 'Framing',     allocated: '2026-02-14', pm: 'Connor Mitchell' },
  { id: 3, project: 'Riverside Custom',   projectId: 1, sku: 'RN-175',     qty: 12,  status: 'in_use',    phase: 'Framing',     allocated: '2026-02-10', pm: 'Connor Mitchell' },
  { id: 4, project: 'Oak Creek',          projectId: 2, sku: 'ANCH-5012',  qty: 200, status: 'in_use',    phase: 'Foundation',  allocated: '2026-01-25', pm: 'Connor Mitchell' },
  { id: 5, project: 'Oak Creek',          projectId: 2, sku: 'REBAR-5',    qty: 42,  status: 'in_use',    phase: 'Foundation',  allocated: '2026-02-18', pm: 'Connor Mitchell' },
  { id: 6, project: 'Elm St Multifamily', projectId: 6, sku: 'HDL-825',    qty: 60,  status: 'reserved',  phase: 'Framing',     allocated: '2026-02-05', pm: 'Alex Reyes' },
  { id: 7, project: 'Elm St Multifamily', projectId: 6, sku: 'TYVK-9100',  qty: 2,   status: 'in_use',    phase: 'Framing',     allocated: '2026-02-16', pm: 'Alex Reyes' },
  { id: 8, project: 'Elm St Multifamily', projectId: 6, sku: 'WD-2X4-92',  qty: 1840,status: 'in_use',    phase: 'Framing',     allocated: '2026-02-20', pm: 'Alex Reyes' },
  { id: 9, project: 'Walnut Spec',        projectId: 7, sku: 'ROM-122',    qty: 800, status: 'in_use',    phase: 'MEP Rough-in',allocated: '2026-02-07', pm: 'Connor Mitchell' },
  { id:10, project: 'Walnut Spec',        projectId: 7, sku: 'PEX-5100',   qty: 9,   status: 'in_use',    phase: 'MEP Rough-in',allocated: '2026-01-28', pm: 'Connor Mitchell' },
  { id:11, project: 'Magnolia Spec',      projectId: 4, sku: 'FBR-R15',    qty: 6,   status: 'in_use',    phase: 'Finishes',    allocated: '2026-02-02', pm: 'Joseph Kowalski' },
  { id:12, project: 'Magnolia Spec',      projectId: 4, sku: 'GFCI-20A',   qty: 28,  status: 'installed', phase: 'Finishes',    allocated: '2026-01-22', pm: 'Joseph Kowalski' },
];

const CATEGORIES = ['All', 'Framing', 'Plumbing', 'Electrical', 'Foundation', 'Insulation', 'Siding', 'Hardware', 'Tile'];

const CAT_COLOR = {
  'Framing':     { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'Plumbing':    { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  'Electrical':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Foundation':  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  'Insulation':  { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Siding':      { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  'Hardware':    { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.07)' },
  'Tile':        { color: '#e879f9', bg: 'rgba(232,121,249,0.12)' },
};

const ALLOC_STATUS = {
  in_use:    { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)',  label: 'In Use' },
  reserved:  { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Reserved' },
  installed: { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Installed' },
};

function stockStatus(item) {
  if (item.qty === 0) return { label: 'Out of Stock', color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)' };
  if (item.qty <= item.minQty) return { label: 'Low Stock',    color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' };
  return { label: 'In Stock',     color: 'var(--status-profit)', bg: 'rgba(34,197,94,0.10)' };
}

// Receive Order Modal
function ReceiveModal({ item, onClose }) {
  const [qty, setQty] = useState('');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: 24, width: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Receive / Reorder</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={16} /></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {item.sku} · Current: {item.qty} {item.unit} · Min: {item.minQty}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity to Receive</div>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supplier</div>
          <div style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.03)', fontSize: 13, color: 'var(--text-secondary)' }}>{item.supplier}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create PO</button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState('inventory');
  const [category, setCategory] = useState('All');
  const [search, setSearch]   = useState('');
  const [location, setLocation] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [receiveItem, setReceiveItem] = useState(null);

  const filtered = useMemo(() => ITEMS.filter(item => {
    if (category !== 'All' && item.category !== category) return false;
    if (location !== 'All' && item.location !== location) return false;
    if (stockFilter === 'Low / Out' && item.qty > item.minQty) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q) && !item.supplier.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [category, location, stockFilter, search]);

  const totalValue  = ITEMS.reduce((s, i) => s + i.qty * i.cost, 0);
  const lowStock    = ITEMS.filter(i => i.qty > 0 && i.qty <= i.minQty).length;
  const outOfStock  = ITEMS.filter(i => i.qty === 0).length;
  const reorderItems = ITEMS.filter(i => i.qty <= i.minQty);

  const thBase = { padding: '9px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-5">
      {receiveItem && <ReceiveModal item={receiveItem} onClose={() => setReceiveItem(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Materials & Inventory</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{ITEMS.length} items tracked · {lowStock + outOfStock} need attention</p>
        </div>
        <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={13} /> Receive Materials
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Total Items', ITEMS.length, 'var(--text-primary)'],
          ['Inventory Value', money(totalValue, true), 'var(--status-profit)'],
          ['Low Stock', lowStock, lowStock > 0 ? 'var(--status-warning)' : 'var(--status-profit)'],
          ['Out of Stock', outOfStock, outOfStock > 0 ? 'var(--status-loss)' : 'var(--status-profit)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {reorderItems.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 8, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--status-warning)' }}>{outOfStock} out of stock</strong> and <strong style={{ color: 'var(--status-warning)' }}>{lowStock} below minimum</strong> — immediate reorder required.
          </span>
          <button onClick={() => setTab('reorder')} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 6, border: '1px solid var(--status-warning)', background: 'transparent', color: 'var(--status-warning)', fontSize: 12, cursor: 'pointer' }}>View Reorder Queue</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['inventory', Package, 'Inventory'], ['allocations', Layers, 'Project Allocations'], ['reorder', AlertTriangle, `Reorder Queue (${reorderItems.length})`]].map(([t, Icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: '7px 7px 0 0', border: 'none',
            background: tab === t ? 'var(--color-brand-card)' : 'transparent',
            color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── INVENTORY TAB ── */}
      {tab === 'inventory' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 280 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, SKU, supplier..."
                style={{ width: '100%', paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={location} onChange={e => setLocation(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            {['All', 'Low / Out'].map(s => (
              <button key={s} onClick={() => setStockFilter(s)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${stockFilter === s ? '#3b82f6' : 'var(--color-brand-border)'}`,
                background: stockFilter === s ? 'rgba(59,130,246,0.14)' : 'transparent',
                color: stockFilter === s ? '#3b82f6' : 'var(--text-secondary)',
              }}>{s}</button>
            ))}
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '5px 11px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${category === c ? '#3b82f6' : 'var(--color-brand-border)'}`,
                background: category === c ? 'rgba(59,130,246,0.14)' : 'transparent',
                color: category === c ? '#3b82f6' : 'var(--text-secondary)',
              }}>{c}</button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['SKU', 'Item', 'Cat', 'Location', 'Qty', 'Min', 'Unit Cost', 'Value', 'Project', 'Status', ''].map((h, i) => (
                  <th key={h + i} style={{ ...thBase, textAlign: ['Unit Cost', 'Value'].includes(h) ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(item => {
                  const ss = stockStatus(item);
                  const cat = CAT_COLOR[item.category] || CAT_COLOR['Hardware'];
                  const proj = PROJECTS.find(p => p.id === item.projectId);
                  return (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                      <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.sku}</td>
                      <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200 }}>{item.name}</td>
                      <td style={{ padding: '9px 14px' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: cat.bg, color: cat.color }}>{item.category}</span></td>
                      <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-secondary)' }}>{item.location}</td>
                      <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: item.qty === 0 ? 'var(--status-loss)' : item.qty <= item.minQty ? 'var(--status-warning)' : 'var(--text-primary)' }}>{item.qty.toLocaleString()}</td>
                      <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.minQty}</td>
                      <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(item.cost)}</td>
                      <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(item.qty * item.cost)}</td>
                      <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {proj ? <span onClick={() => navigate(`/projects/${proj.id}`)} style={{ cursor: 'pointer', color: '#3b82f6' }}>{proj.name.split(' ').slice(0, 2).join(' ')}</span> : '—'}
                      </td>
                      <td style={{ padding: '9px 14px' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                      <td style={{ padding: '9px 14px' }}>
                        {item.qty <= item.minQty && (
                          <button onClick={() => setReceiveItem(item)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid var(--status-warning)', background: 'transparent', color: 'var(--status-warning)', fontSize: 11, cursor: 'pointer' }}>Reorder</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No items match filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ALLOCATIONS TAB ── */}
      {tab === 'allocations' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Material Allocations by Project</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Materials committed to active jobs — allocated quantities reduce available inventory</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Project', 'Phase', 'SKU', 'Item', 'Qty', 'Unit Value', 'Status', 'Allocated', 'PM'].map(h => (
                <th key={h} style={thBase}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {ALLOCATIONS.map((a, i) => {
                const item = ITEMS.find(x => x.sku === a.sku);
                const astyle = ALLOC_STATUS[a.status];
                return (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate(`/projects/${a.projectId}`)}>{a.project}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-secondary)' }}>{a.phase}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{a.sku}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{item?.name || a.sku}</td>
                    <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{a.qty.toLocaleString()}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{item ? money(a.qty * item.cost) : '—'}</td>
                    <td style={{ padding: '9px 14px' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: astyle.bg, color: astyle.color }}>{astyle.label}</span></td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{a.allocated}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-secondary)' }}>{a.pm.split(' ')[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── REORDER TAB ── */}
      {tab === 'reorder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {reorderItems.length} items at or below minimum stock level — review and create purchase orders.
          </div>
          {reorderItems.map(item => {
            const ss = stockStatus(item);
            const proj = PROJECTS.find(p => p.id === item.projectId);
            const suggestQty = item.minQty * 3 - item.qty;
            return (
              <div key={item.id} style={{ background: 'var(--color-brand-card)', border: `1px solid ${item.qty === 0 ? 'rgba(251,113,133,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: ss.bg, color: ss.color }}>{ss.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SKU: {item.sku} · {item.supplier} · {proj?.name || '—'}</div>
                </div>
                <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>On Hand</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: item.qty === 0 ? 'var(--status-loss)' : 'var(--status-warning)' }}>{item.qty}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Min</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{item.minQty}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Suggest Order</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#3b82f6' }}>{suggestQty}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Est. Cost</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(suggestQty * item.cost)}</div>
                  </div>
                </div>
                <button onClick={() => setReceiveItem(item)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Create PO</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
