import { useState } from 'react';
import { PROJECTS } from '../lib/demoData';
import { money } from '../lib/format';
import { AlertTriangle } from 'lucide-react';

const ITEMS = [
  { id: 1,  name: 'Dimensional Lumber 2x6x16',      category: 'Framing',     unit: 'bd ft',  qty: 840,  minQty: 200,  location: 'Yard A',    project: 1, cost: 1.20,  supplier: 'Nashville Lumber Co.',  sku: 'LUM-2616',  lastOrder: '2026-02-10' },
  { id: 2,  name: 'OSB Sheathing 7/16 4x8',          category: 'Framing',     unit: 'sheet',  qty: 120,  minQty: 30,   location: 'Yard A',    project: 2, cost: 18.50, supplier: 'Nashville Lumber Co.',  sku: 'OSB-716',   lastOrder: '2026-02-08' },
  { id: 3,  name: 'Schedule 40 PVC 3" x 10\'',       category: 'Plumbing',    unit: 'stick',  qty: 24,   minQty: 10,   location: 'Trailer 1', project: 1, cost: 14.75, supplier: 'Able Plumbing Supply', sku: 'PVC-340-3',  lastOrder: '2026-01-28' },
  { id: 4,  name: 'ROMEX 12/2 Wire',                 category: 'Electrical',  unit: 'ft',     qty: 1200, minQty: 500,  location: 'Trailer 2', project: 3, cost: 0.62,  supplier: 'Middle TN Electric',   sku: 'ROM-122',    lastOrder: '2026-02-05' },
  { id: 5,  name: 'Anchor Bolt 1/2" x 12"',          category: 'Foundation',  unit: 'ea',     qty: 340,  minQty: 100,  location: 'Yard B',    project: 2, cost: 1.85,  supplier: 'Nashville Lumber Co.',  sku: 'ANCH-5012', lastOrder: '2026-01-20' },
  { id: 6,  name: 'Blown Insulation R-38',            category: 'Insulation',  unit: 'bag',    qty: 18,   minQty: 20,   location: 'Yard A',    project: 1, cost: 22.00, supplier: 'Insulate Pro',          sku: 'INS-R38',    lastOrder: '2026-02-12' },
  { id: 7,  name: 'LP SmartSide Panel 4x8',           category: 'Siding',      unit: 'sheet',  qty: 0,    minQty: 15,   location: '—',         project: 5, cost: 54.00, supplier: 'Southeast Building',   sku: 'LP-SP48',    lastOrder: '2026-01-15' },
  { id: 8,  name: 'Hardie Lap Siding 8.25" x 12\'',  category: 'Siding',      unit: 'pc',     qty: 88,   minQty: 40,   location: 'Yard B',    project: 6, cost: 9.40,  supplier: 'Southeast Building',   sku: 'HDL-825',    lastOrder: '2026-02-01' },
  { id: 9,  name: 'Concrete Form Tube 12"',           category: 'Foundation',  unit: 'ea',     qty: 8,    minQty: 5,    location: 'Yard B',    project: 3, cost: 16.20, supplier: 'Able Plumbing Supply', sku: 'CFT-12',     lastOrder: '2025-12-18' },
  { id: 10, name: 'Fiberglass Batt R-15 3.5"',        category: 'Insulation',  unit: 'bag',    qty: 6,    minQty: 15,   location: 'Trailer 1', project: 4, cost: 38.00, supplier: 'Insulate Pro',          sku: 'FBR-R15',    lastOrder: '2026-01-30' },
  { id: 11, name: 'Galvanized Joist Hanger 2x10',     category: 'Hardware',    unit: 'box',    qty: 14,   minQty: 5,    location: 'Trailer 2', project: 2, cost: 28.50, supplier: 'Nashville Lumber Co.',  sku: 'JH-210',     lastOrder: '2026-02-14' },
  { id: 12, name: 'Roofing Nail 1.75" Coil',          category: 'Hardware',    unit: 'box',    qty: 32,   minQty: 10,   location: 'Yard A',    project: 1, cost: 44.00, supplier: 'Southeast Building',   sku: 'RN-175',     lastOrder: '2026-02-03' },
  { id: 13, name: 'PEX-A Tubing 1/2" x 100\'',       category: 'Plumbing',    unit: 'roll',   qty: 9,    minQty: 4,    location: 'Trailer 1', project: 3, cost: 74.00, supplier: 'Able Plumbing Supply', sku: 'PEX-5100',   lastOrder: '2026-01-25' },
  { id: 14, name: 'LVL Beam 3.5x9.5x20\'',           category: 'Framing',     unit: 'ea',     qty: 4,    minQty: 2,    location: 'Yard A',    project: 5, cost: 218.00,supplier: 'Nashville Lumber Co.',  sku: 'LVL-3520',   lastOrder: '2026-02-10' },
  { id: 15, name: 'GFCI Outlet 20A Tamper-Resist',    category: 'Electrical',  unit: 'ea',     qty: 28,   minQty: 12,   location: 'Trailer 2', project: 4, cost: 12.40, supplier: 'Middle TN Electric',   sku: 'GFCI-20A',   lastOrder: '2026-01-18' },
  { id: 16, name: 'House Wrap Tyvek 9x100\'',         category: 'Siding',      unit: 'roll',   qty: 2,    minQty: 4,    location: 'Yard B',    project: 6, cost: 128.00,supplier: 'Southeast Building',   sku: 'TYVK-9100',  lastOrder: '2026-01-12' },
  { id: 17, name: 'Concrete Backer Board 3x5',        category: 'Tile',        unit: 'sheet',  qty: 22,   minQty: 10,   location: 'Trailer 1', project: 1, cost: 11.80, supplier: 'Southeast Building',   sku: 'CBB-35',     lastOrder: '2026-02-07' },
  { id: 18, name: 'Self-Tapping Screws 3" #10',       category: 'Hardware',    unit: 'box',    qty: 7,    minQty: 6,    location: 'Trailer 2', project: 3, cost: 16.50, supplier: 'Nashville Lumber Co.',  sku: 'STS-310',    lastOrder: '2026-01-22' },
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

function stockStatus(item) {
  if (item.qty === 0) return { label: 'Out of Stock', color: 'var(--status-loss)', bg: 'rgba(251,113,133,0.12)' };
  if (item.qty <= item.minQty) return { label: 'Low Stock', color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' };
  return { label: 'In Stock', color: 'var(--status-profit)', bg: 'rgba(34,197,94,0.10)' };
}

export default function Inventory() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('All');

  const filtered = ITEMS.filter(item => {
    if (category !== 'All' && item.category !== category) return false;
    if (stockFilter === 'Low / Out' && item.qty > item.minQty) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q) && !item.supplier.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalValue = ITEMS.reduce((s, i) => s + i.qty * i.cost, 0);
  const lowStock = ITEMS.filter(i => i.qty > 0 && i.qty <= i.minQty).length;
  const outOfStock = ITEMS.filter(i => i.qty === 0).length;

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Inventory</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{ITEMS.length} items tracked &middot; {lowStock + outOfStock} need attention</p>
      </div>

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

      {(lowStock > 0 || outOfStock > 0) && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 8, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--status-warning)' }}>{outOfStock} item{outOfStock !== 1 ? 's' : ''} out of stock</strong> and <strong style={{ color: 'var(--status-warning)' }}>{lowStock} item{lowStock !== 1 ? 's' : ''} below minimum</strong> — review and reorder.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, SKU, supplier..."
          style={{ flex: '1 1 200px', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Low / Out'].map(s => (
            <button key={s} onClick={() => setStockFilter(s)} style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${stockFilter === s ? '#3b82f6' : 'var(--color-brand-border)'}`,
              background: stockFilter === s ? 'rgba(59,130,246,0.14)' : 'transparent',
              color: stockFilter === s ? '#3b82f6' : 'var(--text-secondary)',
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${category === c ? '#3b82f6' : 'var(--color-brand-border)'}`,
            background: category === c ? 'rgba(59,130,246,0.14)' : 'transparent',
            color: category === c ? '#3b82f6' : 'var(--text-secondary)',
          }}>{c}</button>
        ))}
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['SKU', 'Item', 'Category', 'Qty', 'Min', 'Unit', 'Unit Cost', 'Total Value', 'Location', 'Project', 'Status'].map((h, i) => (
              <th key={h} style={{ ...thBase, textAlign: [6, 7].includes(i) ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(item => {
              const ss = stockStatus(item);
              const cat = CAT_COLOR[item.category] || CAT_COLOR['Hardware'];
              const proj = PROJECTS.find(p => p.id === item.project);
              return (
                <tr key={item.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.sku}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200 }}>{item.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: cat.bg, color: cat.color }}>{item.category}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: item.qty === 0 ? 'var(--status-loss)' : item.qty <= item.minQty ? 'var(--status-warning)' : 'var(--text-primary)' }}>{item.qty}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.minQty}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{item.unit}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(item.cost)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>{money(item.qty * item.cost)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{item.location}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{proj ? proj.name.split(' ').slice(0, 2).join(' ') : '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: ss.bg, color: ss.color }}>{ss.label}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No items match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
