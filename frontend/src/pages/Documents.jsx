import { useState } from 'react';
import { Search, Download, X, AlertTriangle, File, FileText, Image } from 'lucide-react';
import { PROJECTS, VENDORS } from '../lib/demoData';

const DOCS = [
  { id:  1, title: 'Riverside Custom Home — General Contract',  type: 'Contract',       project: 1, vendor: null,     file: 'SC001_Contract_Final.pdf',     size: '2.4 MB', date: '2025-08-15', expires: null,         uploaded: 'Matt Seibert' },
  { id:  2, title: 'Oak Creek Spec Home — General Contract',    type: 'Contract',       project: 2, vendor: null,     file: 'SC002_Contract_Final.pdf',     size: '2.1 MB', date: '2025-10-20', expires: null,         uploaded: 'Matt Seibert' },
  { id:  3, title: 'Magnolia Spec Home — General Contract',     type: 'Contract',       project: 3, vendor: null,     file: 'SC003_Contract_Final.pdf',     size: '1.9 MB', date: '2025-12-05', expires: null,         uploaded: 'Matt Seibert' },
  { id:  4, title: 'Johnson Office TI — General Contract',      type: 'Contract',       project: 4, vendor: null,     file: 'SC004_Contract_Signed.pdf',    size: '3.2 MB', date: '2026-01-10', expires: null,         uploaded: 'Matt Seibert' },
  { id:  5, title: 'Tennessee Electric — COI 2026',             type: 'COI',            project: null, vendor: 1,    file: 'TN_Electric_COI_2026.pdf',     size: '850 KB', date: '2025-12-01', expires: '2026-08-01', uploaded: 'Samuel Carson' },
  { id:  6, title: 'Volunteer Plumbing — COI 2026',             type: 'COI',            project: null, vendor: 2,    file: 'Vol_Plumbing_COI_2026.pdf',    size: '820 KB', date: '2025-12-10', expires: '2026-09-15', uploaded: 'Samuel Carson' },
  { id:  7, title: 'Midstate Concrete — COI 2026',              type: 'COI',            project: null, vendor: 3,    file: 'Midstate_COI_2026.pdf',        size: '780 KB', date: '2026-01-05', expires: '2026-03-20', uploaded: 'Samuel Carson' },
  { id:  8, title: 'Patriot HVAC — COI Renewal',                type: 'COI',            project: null, vendor: 4,    file: 'Patriot_HVAC_COI.pdf',         size: '890 KB', date: '2026-01-12', expires: '2026-06-30', uploaded: 'Samuel Carson' },
  { id:  9, title: 'Riverside Custom — Architectural Plans',    type: 'Plans',          project: 1, vendor: null,     file: 'SC001_Arch_Plans_Rev3.pdf',    size: '18.4 MB', date: '2025-09-01', expires: null,        uploaded: 'Connor Webb' },
  { id: 10, title: 'Elm St Multifamily — Structural Plans',     type: 'Plans',          project: 5, vendor: null,     file: 'SC005_Structural_v2.pdf',      size: '22.1 MB', date: '2025-07-10', expires: null,        uploaded: 'Colton Harris' },
  { id: 11, title: 'Walnut Creek Village — Site Plans',         type: 'Plans',          project: 6, vendor: null,     file: 'SC006_Site_Plans_Final.pdf',   size: '15.6 MB', date: '2025-06-20', expires: null,        uploaded: 'Colton Harris' },
  { id: 12, title: 'Riverside — Building Permit BP-2025-0441', type: 'Permit',         project: 1, vendor: null,     file: 'Permit_BP20250441.pdf',        size: '420 KB', date: '2025-09-02', expires: '2026-09-02', uploaded: 'Connor Webb' },
  { id: 13, title: 'Elm St — Building Permit BP-2025-0601',    type: 'Permit',         project: 5, vendor: null,     file: 'Permit_BP20250601.pdf',        size: '510 KB', date: '2025-07-28', expires: '2026-07-28', uploaded: 'Colton Harris' },
  { id: 14, title: 'Tennessee Electric — W-9',                  type: 'W-9',            project: null, vendor: 1,    file: 'TN_Electric_W9.pdf',           size: '180 KB', date: '2025-07-01', expires: null,         uploaded: 'Samuel Carson' },
  { id: 15, title: 'Volunteer Plumbing — W-9',                  type: 'W-9',            project: null, vendor: 2,    file: 'Vol_Plumbing_W9.pdf',          size: '175 KB', date: '2025-07-01', expires: null,         uploaded: 'Samuel Carson' },
  { id: 16, title: 'Johnson TI — CO #7 Electrical Upgrade',    type: 'Change Order',   project: 4, vendor: 1,        file: 'CO7_SC004_Electrical.pdf',     size: '320 KB', date: '2026-02-10', expires: null,         uploaded: 'Joseph Hall' },
  { id: 17, title: 'Riverside — CO #3 Deck Addition',           type: 'Change Order',   project: 1, vendor: null,    file: 'CO3_SC001_Deck.pdf',           size: '280 KB', date: '2026-01-22', expires: null,         uploaded: 'Connor Webb' },
  { id: 18, title: 'Midstate Concrete — Lien Waiver Jan 2026',  type: 'Lien Waiver',    project: 1, vendor: 3,        file: 'LW_Midstate_Jan2026.pdf',      size: '210 KB', date: '2026-01-31', expires: null,         uploaded: 'Samuel Carson' },
  { id: 19, title: 'Riverside — Site Photo (Foundation Pour)',   type: 'Photo',          project: 1, vendor: null,    file: 'IMG_20260215_foundation.jpg',  size: '4.2 MB', date: '2026-02-15', expires: null,         uploaded: 'Connor Webb' },
  { id: 20, title: 'Elm St — Site Photo (Framing Progress)',    type: 'Photo',          project: 5, vendor: null,    file: 'IMG_20260218_framing.jpg',     size: '5.1 MB', date: '2026-02-18', expires: null,         uploaded: 'Colton Harris' },
  { id: 21, title: 'Tennessee Electric — Invoice #4821',        type: 'Invoice',        project: 4, vendor: 1,        file: 'INV_4821_TN_Electric.pdf',     size: '145 KB', date: '2026-02-12', expires: null,         uploaded: 'Joseph Hall' },
  { id: 22, title: 'Volunteer Plumbing — Invoice #2314',        type: 'Invoice',        project: 1, vendor: 2,        file: 'INV_2314_Vol_Plumbing.pdf',    size: '132 KB', date: '2026-02-08', expires: null,         uploaded: 'Connor Webb' },
  { id: 23, title: 'Patriot HVAC — Invoice #6109',              type: 'Invoice',        project: 4, vendor: 4,        file: 'INV_6109_Patriot_HVAC.pdf',    size: '128 KB', date: '2026-01-28', expires: null,         uploaded: 'Joseph Hall' },
];

const TYPES = ['All', 'Contract', 'COI', 'Plans', 'Permit', 'W-9', 'Change Order', 'Lien Waiver', 'Photo', 'Invoice'];

const TYPE_COLOR = {
  Contract:     { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)' },
  COI:          { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)' },
  Plans:        { color: '#6366f1',               bg: 'rgba(99,102,241,0.12)' },
  Permit:       { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' },
  'W-9':        { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)' },
  'Change Order': { color: '#f97316',             bg: 'rgba(249,115,22,0.12)' },
  'Lien Waiver': { color: '#8b5cf6',              bg: 'rgba(139,92,246,0.12)' },
  Photo:        { color: '#06b6d4',               bg: 'rgba(6,182,212,0.12)' },
  Invoice:      { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function DocModal({ doc, onClose }) {
  const tc = TYPE_COLOR[doc.type] || { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  const proj = doc.project ? PROJECTS.find(p => p.id === doc.project) : null;
  const vendor = doc.vendor ? VENDORS.find(v => v.id === doc.vendor) : null;
  const days = daysUntil(doc.expires);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, width: '100%', maxWidth: 520 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-brand-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Document Type</div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: tc.bg, color: tc.color }}>{doc.type}</span>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>File Size</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{doc.size}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Uploaded</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{doc.date} by {doc.uploaded}</div>
          </div>
          {proj && <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Project</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{proj.name}</div>
          </div>}
          {vendor && <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Vendor</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{vendor.name}</div>
          </div>}
          {doc.expires && <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>Expires</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: days !== null && days <= 60 ? 'var(--status-warning)' : 'var(--text-primary)' }}>
              {doc.expires}{days !== null && days <= 60 ? ` (${days}d)` : ''}
            </div>
          </div>}
          <div style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{doc.file}</div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-brand-border)', display: 'flex', gap: 10 }}>
          <button onClick={() => alert(`Downloading ${doc.file}...`)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Download size={13} /> Download
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--color-brand-border)', cursor: 'pointer', fontSize: 12 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const expiringDocs = DOCS.filter(d => {
    const days = daysUntil(d.expires);
    return days !== null && days <= 60;
  });

  const filtered = DOCS.filter(d => {
    if (typeFilter !== 'All' && d.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const proj = d.project ? PROJECTS.find(p => p.id === d.project) : null;
      const vendor = d.vendor ? VENDORS.find(v => v.id === d.vendor) : null;
      return d.title.toLowerCase().includes(q)
        || d.file.toLowerCase().includes(q)
        || (proj?.name || '').toLowerCase().includes(q)
        || (vendor?.name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      {selected && <DocModal doc={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Document Vault</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{DOCS.length} documents &middot; {Object.keys(TYPE_COLOR).length} categories</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Total Documents', DOCS.length, '#3b82f6'],
          ['Contracts & COIs', DOCS.filter(d => d.type === 'Contract' || d.type === 'COI').length, '#6366f1'],
          ['Plans & Photos', DOCS.filter(d => d.type === 'Plans' || d.type === 'Photo').length, '#06b6d4'],
          ['Expiring Soon', expiringDocs.length, expiringDocs.length > 0 ? 'var(--status-warning)' : 'var(--status-profit)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {expiringDocs.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-warning)', marginBottom: 4 }}>Documents Expiring Within 60 Days</div>
            {expiringDocs.map(d => (
              <div key={d.id} style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, cursor: 'pointer' }} onClick={() => setSelected(d)}>
                {d.title} &mdash; expires {d.expires} ({daysUntil(d.expires)}d)
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${typeFilter === t ? '#3b82f6' : 'var(--color-brand-border)'}`,
              background: typeFilter === t ? 'rgba(59,130,246,0.14)' : 'transparent',
              color: typeFilter === t ? '#3b82f6' : 'var(--text-secondary)',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Document','Type','Project / Vendor','Size','Uploaded','Expires',''].map((h, i) => (
              <th key={h || i} style={thBase}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No documents match.</td></tr>
            )}
            {filtered.map(d => {
              const tc = TYPE_COLOR[d.type] || { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
              const proj = d.project ? PROJECTS.find(p => p.id === d.project) : null;
              const vendor = d.vendor ? VENDORS.find(v => v.id === d.vendor) : null;
              const days = daysUntil(d.expires);
              return (
                <tr key={d.id} onClick={() => setSelected(d)}
                  style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {d.type === 'Photo' ? <Image size={14} style={{ color: tc.color, flexShrink: 0 }} /> : <FileText size={14} style={{ color: tc.color, flexShrink: 0 }} />}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{d.file}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>{d.type}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {proj?.name || vendor?.name || '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{d.size}</td>
                  <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{d.date}</td>
                  <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: days !== null && days <= 60 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>
                    {d.expires ? `${d.expires}${days !== null && days <= 60 ? ` (${days}d)` : ''}` : '—'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={e => { e.stopPropagation(); alert(`Downloading ${d.file}...`); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
