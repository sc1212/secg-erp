import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { money, pct } from '../lib/format';

// CSI MasterFormat divisions (simplified for construction ERP)
const DIVISIONS = [
  { div: '01', name: 'General Requirements' },
  { div: '02', name: 'Existing Conditions' },
  { div: '03', name: 'Concrete' },
  { div: '04', name: 'Masonry' },
  { div: '05', name: 'Metals' },
  { div: '06', name: 'Wood, Plastics & Composites' },
  { div: '07', name: 'Thermal & Moisture Protection' },
  { div: '08', name: 'Openings' },
  { div: '09', name: 'Finishes' },
  { div: '10', name: 'Specialties' },
  { div: '15', name: 'Mechanical' },
  { div: '16', name: 'Electrical' },
  { div: '99', name: 'Overhead & Indirect' },
];

const COST_CODES = [
  // 01 - General Requirements
  { code: '01-100', div: '01', name: 'Permits & Inspections',      type: 'overhead', qbAccount: '5010',  totalBudget: 52000, totalActual: 48200, activeJobs: 6, avgCostPerSF: 8.20 },
  { code: '01-200', div: '01', name: 'Temporary Facilities',       type: 'overhead', qbAccount: '5020',  totalBudget: 18400, totalActual: 16800, activeJobs: 5, avgCostPerSF: 2.10 },
  { code: '01-300', div: '01', name: 'Supervision / PM Labor',     type: 'labor',    qbAccount: '5030',  totalBudget: 124000,totalActual: 118400,activeJobs: 8, avgCostPerSF: 14.60 },
  { code: '01-400', div: '01', name: 'Equipment Rental',           type: 'equipment',qbAccount: '5040',  totalBudget: 38000, totalActual: 41200, activeJobs: 6, avgCostPerSF: 5.40 },
  // 03 - Concrete
  { code: '03-100', div: '03', name: 'Footings & Foundations',     type: 'sub',      qbAccount: '5110',  totalBudget: 98000, totalActual: 88400, activeJobs: 4, avgCostPerSF: 24.20 },
  { code: '03-200', div: '03', name: 'Slab on Grade',              type: 'sub',      qbAccount: '5120',  totalBudget: 64000, totalActual: 58800, activeJobs: 4, avgCostPerSF: 18.40 },
  { code: '03-300', div: '03', name: 'Concrete Walls',             type: 'sub',      qbAccount: '5130',  totalBudget: 42000, totalActual: 38200, activeJobs: 3, avgCostPerSF: 14.80 },
  // 06 - Wood, Plastics
  { code: '06-100', div: '06', name: 'Rough Framing Labor',        type: 'sub',      qbAccount: '5210',  totalBudget: 248000,totalActual: 196400,activeJobs: 5, avgCostPerSF: 42.10 },
  { code: '06-110', div: '06', name: 'Framing Materials',          type: 'material', qbAccount: '5220',  totalBudget: 184000,totalActual: 172800,activeJobs: 5, avgCostPerSF: 38.60 },
  { code: '06-200', div: '06', name: 'Finish Carpentry / Trim',    type: 'sub',      qbAccount: '5230',  totalBudget: 68000, totalActual: 62400, activeJobs: 4, avgCostPerSF: 16.20 },
  { code: '06-400', div: '06', name: 'Cabinetry & Millwork',       type: 'sub',      qbAccount: '5240',  totalBudget: 92000, totalActual: 86200, activeJobs: 4, avgCostPerSF: 22.40 },
  // 07 - Thermal & Moisture
  { code: '07-100', div: '07', name: 'Waterproofing',              type: 'sub',      qbAccount: '5310',  totalBudget: 24000, totalActual: 21800, activeJobs: 3, avgCostPerSF: 6.80 },
  { code: '07-200', div: '07', name: 'Insulation',                 type: 'sub',      qbAccount: '5320',  totalBudget: 44000, totalActual: 40200, activeJobs: 5, avgCostPerSF: 9.60 },
  { code: '07-300', div: '07', name: 'Roofing',                    type: 'sub',      qbAccount: '5330',  totalBudget: 68000, totalActual: 58400, activeJobs: 4, avgCostPerSF: 16.40 },
  { code: '07-400', div: '07', name: 'Siding & Exterior Finish',   type: 'sub',      qbAccount: '5340',  totalBudget: 72000, totalActual: 64800, activeJobs: 4, avgCostPerSF: 18.20 },
  // 08 - Openings
  { code: '08-100', div: '08', name: 'Doors & Frames',             type: 'material', qbAccount: '5410',  totalBudget: 38000, totalActual: 34200, activeJobs: 5, avgCostPerSF: 8.60 },
  { code: '08-200', div: '08', name: 'Windows & Glazing',          type: 'material', qbAccount: '5420',  totalBudget: 62000, totalActual: 58800, activeJobs: 5, avgCostPerSF: 14.20 },
  // 09 - Finishes
  { code: '09-200', div: '09', name: 'Drywall & Plaster',          type: 'sub',      qbAccount: '5510',  totalBudget: 84000, totalActual: 78400, activeJobs: 5, avgCostPerSF: 19.20 },
  { code: '09-300', div: '09', name: 'Tile',                       type: 'sub',      qbAccount: '5520',  totalBudget: 48000, totalActual: 42800, activeJobs: 4, avgCostPerSF: 11.80 },
  { code: '09-600', div: '09', name: 'Flooring',                   type: 'sub',      qbAccount: '5530',  totalBudget: 72000, totalActual: 64200, activeJobs: 5, avgCostPerSF: 16.80 },
  { code: '09-900', div: '09', name: 'Painting',                   type: 'sub',      qbAccount: '5540',  totalBudget: 44000, totalActual: 38600, activeJobs: 5, avgCostPerSF: 9.40 },
  // 15 - Mechanical
  { code: '15-100', div: '15', name: 'Plumbing Rough-In',          type: 'sub',      qbAccount: '5610',  totalBudget: 88000, totalActual: 76400, activeJobs: 5, avgCostPerSF: 18.80 },
  { code: '15-200', div: '15', name: 'HVAC / Mechanical',          type: 'sub',      qbAccount: '5620',  totalBudget: 96000, totalActual: 88200, activeJobs: 5, avgCostPerSF: 20.40 },
  { code: '15-300', div: '15', name: 'Plumbing Fixtures & Trim',   type: 'sub',      qbAccount: '5630',  totalBudget: 38000, totalActual: 34800, activeJobs: 4, avgCostPerSF: 9.20 },
  // 16 - Electrical
  { code: '16-100', div: '16', name: 'Electrical Rough-In',        type: 'sub',      qbAccount: '5710',  totalBudget: 84000, totalActual: 78600, activeJobs: 5, avgCostPerSF: 18.60 },
  { code: '16-200', div: '16', name: 'Electrical Devices & Trim',  type: 'sub',      qbAccount: '5720',  totalBudget: 28000, totalActual: 24400, activeJobs: 5, avgCostPerSF: 6.20 },
  { code: '16-300', div: '16', name: 'Service & Distribution',     type: 'sub',      qbAccount: '5730',  totalBudget: 18000, totalActual: 16200, activeJobs: 3, avgCostPerSF: 4.80 },
  // 99 - Overhead
  { code: '99-100', div: '99', name: 'General Overhead',           type: 'overhead', qbAccount: '6010',  totalBudget: 184000,totalActual: 178400,activeJobs: 8, avgCostPerSF: 18.40 },
  { code: '99-200', div: '99', name: 'Insurance & Bonds',          type: 'overhead', qbAccount: '6020',  totalBudget: 64000, totalActual: 58800, activeJobs: 8, avgCostPerSF: 6.20 },
  { code: '99-300', div: '99', name: 'Vehicle & Equipment',        type: 'overhead', qbAccount: '6030',  totalBudget: 48000, totalActual: 52400, activeJobs: 8, avgCostPerSF: 5.80 },
];

const TYPE_COLORS = {
  material:  { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)',  label: 'Material' },
  labor:     { color: '#10b981',               bg: 'rgba(16,185,129,0.12)', label: 'Labor' },
  sub:       { color: '#8b5cf6',               bg: 'rgba(139,92,246,0.12)', label: 'Subcontract' },
  equipment: { color: '#f59e0b',               bg: 'rgba(245,158,11,0.12)', label: 'Equipment' },
  overhead:  { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.07)',label: 'Overhead' },
};

export default function CostCodes() {
  const [search, setSearch]       = useState('');
  const [expandedDivs, setExpanded] = useState(new Set(['01', '06', '15', '16']));
  const [typeFilter, setType]     = useState('All');
  const [selected, setSelected]   = useState(null);

  const toggleDiv = (div) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(div)) next.delete(div); else next.add(div);
      return next;
    });
  };

  const filtered = useMemo(() => COST_CODES.filter(c => {
    if (typeFilter !== 'All' && c.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.qbAccount.includes(q);
    }
    return true;
  }), [search, typeFilter]);

  const totalBudget = COST_CODES.reduce((s, c) => s + c.totalBudget, 0);
  const totalActual = COST_CODES.reduce((s, c) => s + c.totalActual, 0);

  const thBase = { padding: '8px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Cost Code Manager</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{COST_CODES.length} codes across {DIVISIONS.length} CSI divisions · mapped to QuickBooks GL</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={13} /> Add Cost Code
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Total Codes', COST_CODES.length, 'var(--text-primary)'],
          ['Total Budgeted', money(totalBudget, true), '#3b82f6'],
          ['Total Actual', money(totalActual, true), 'var(--status-profit)'],
          ['Avg Variance', pct(((totalActual - totalBudget) / totalBudget) * 100), totalActual > totalBudget ? 'var(--status-loss)' : 'var(--status-profit)'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Code, name, QB account..."
            style={{ width: '100%', paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {['All', 'material', 'labor', 'sub', 'equipment', 'overhead'].map(t => (
          <button key={t} onClick={() => setType(t)} style={{ padding: '6px 11px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: `1px solid ${typeFilter === t ? '#3b82f6' : 'var(--color-brand-border)'}`, background: typeFilter === t ? 'rgba(59,130,246,0.14)' : 'transparent', color: typeFilter === t ? '#3b82f6' : 'var(--text-secondary)' }}>
            {t === 'All' ? 'All' : TYPE_COLORS[t]?.label || t}
          </button>
        ))}
      </div>

      {/* Main table — grouped by division */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Code', 'Name', 'Type', 'QB Account', 'Total Budgeted', 'Total Actual', 'Variance', 'Avg $/SF', 'Active Jobs'].map((h, i) => (
              <th key={h + i} style={{ ...thBase, textAlign: ['Total Budgeted', 'Total Actual', 'Variance', 'Avg $/SF'].includes(h) ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {DIVISIONS.map(div => {
              const divCodes = filtered.filter(c => c.div === div.div);
              if (divCodes.length === 0) return null;
              const isOpen = expandedDivs.has(div.div);
              const divBudget = divCodes.reduce((s, c) => s + c.totalBudget, 0);
              const divActual = divCodes.reduce((s, c) => s + c.totalActual, 0);
              return [
                <tr key={`div-${div.div}`} onClick={() => toggleDiv(div.div)} style={{ background: 'rgba(255,255,255,0.04)', cursor: 'pointer', borderTop: '2px solid var(--color-brand-border)' }}>
                  <td colSpan={2} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isOpen ? <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />}
                      Division {div.div} — {div.name}
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 400 }}>({divCodes.length} codes)</span>
                    </div>
                  </td>
                  <td colSpan={3} style={{ padding: '10px 14px' }} />
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{money(divBudget, true)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontFamily: 'monospace', color: 'var(--status-profit)', fontWeight: 600 }}>{money(divActual, true)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: divActual > divBudget ? 'var(--status-loss)' : 'var(--status-profit)' }}>
                    {divActual > divBudget ? '+' : ''}{money(divActual - divBudget, true)}
                  </td>
                  <td colSpan={1} />
                </tr>,
                ...(!isOpen ? [] : divCodes.map((code, i) => {
                  const tc = TYPE_COLORS[code.type] || TYPE_COLORS.overhead;
                  const variance = code.totalActual - code.totalBudget;
                  const variancePct = code.totalBudget > 0 ? (variance / code.totalBudget) * 100 : 0;
                  return (
                    <tr key={code.code} onClick={() => setSelected(selected?.code === code.code ? null : code)} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', background: selected?.code === code.code ? 'rgba(59,130,246,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '8px 14px 8px 32px', fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6' }}>{code.code}</td>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{code.name}</td>
                      <td style={{ padding: '8px 14px' }}><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: tc.bg, color: tc.color }}>{tc.label}</span></td>
                      <td style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{code.qbAccount}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{money(code.totalBudget)}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{money(code.totalActual)}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: variance > 0 ? 'var(--status-loss)' : 'var(--status-profit)', fontWeight: 600 }}>
                        {variance > 0 ? '+' : ''}{money(variance)} <span style={{ fontSize: 10, opacity: 0.75 }}>({variancePct.toFixed(1)}%)</span>
                      </td>
                      <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>${code.avgCostPerSF.toFixed(2)}</td>
                      <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>{code.activeJobs}</td>
                    </tr>
                  );
                })),
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Selected code detail */}
      {selected && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.code} — {selected.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>QB GL: {selected.qbAccount} · {selected.activeJobs} active jobs · Type: {TYPE_COLORS[selected.type]?.label}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              ['Total Budgeted', money(selected.totalBudget), 'var(--text-primary)'],
              ['Total Actual', money(selected.totalActual), 'var(--status-profit)'],
              ['Variance', money(selected.totalActual - selected.totalBudget), selected.totalActual > selected.totalBudget ? 'var(--status-loss)' : 'var(--status-profit)'],
              ['Var %', pct(((selected.totalActual - selected.totalBudget) / selected.totalBudget) * 100), selected.totalActual > selected.totalBudget ? 'var(--status-loss)' : 'var(--status-profit)'],
              ['Avg $/SF', '$' + selected.avgCostPerSF.toFixed(2), 'var(--text-primary)'],
              ['Active Jobs', selected.activeJobs, '#3b82f6'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--color-brand-border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (selected.totalActual / selected.totalBudget) * 100).toFixed(0)}%`, background: selected.totalActual > selected.totalBudget ? 'var(--status-loss)' : '#3b82f6', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{((selected.totalActual / selected.totalBudget) * 100).toFixed(1)}% of budget consumed</div>
          </div>
        </div>
      )}
    </div>
  );
}
