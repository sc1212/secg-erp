import { useState, useMemo } from 'react';
import { Search, Star, X, ArrowLeft } from 'lucide-react';
import { money } from '../lib/format';
import { VENDORS, COI_COLOR } from '../lib/demoData';

const TRADES = ['All', 'Concrete', 'Electrical', 'Framing', 'Plumbing', 'HVAC', 'Drywall', 'Roofing', 'Painting'];

const VENDOR_JOBS = {
  1: [
    { project: 'Riverside Custom',  amount: 38400,  start: '2025-10-01', end: '2026-02-28', status: 'active' },
    { project: 'Oak Creek',         amount: 48000,  start: '2025-11-15', end: '2026-04-15', status: 'active' },
    { project: 'Elm St Multifamily', amount: 96000, start: '2025-10-15', end: '2026-06-30', status: 'active' },
    { project: 'Magnolia Spec',     amount: 14200,  start: '2025-08-20', end: '2025-12-15', status: 'complete' },
    { project: 'Johnson Office TI', amount: 12000,  start: '2025-07-10', end: '2025-09-30', status: 'complete' },
  ],
  2: [
    { project: 'Riverside Custom',  amount: 36000,  start: '2025-12-01', end: '2026-03-30', status: 'active' },
    { project: 'Oak Creek',         amount: 28000,  start: '2026-01-15', end: '2026-05-15', status: 'active' },
    { project: 'Johnson Office TI', amount: 22000,  start: '2025-07-10', end: '2026-02-28', status: 'active' },
  ],
};

const VENDOR_INVOICES = {
  1: [
    { invoice: 'INV-2042', amount: 14200, issued: '2026-02-10', due: '2026-03-05', status: 'outstanding' },
    { invoice: 'INV-1988', amount: 6400,  issued: '2026-01-28', due: '2026-02-25', status: 'paid' },
    { invoice: 'INV-1920', amount: 11400, issued: '2026-01-10', due: '2026-02-07', status: 'paid' },
  ],
  2: [
    { invoice: 'INV-2044', amount: 12400, issued: '2026-02-15', due: '2026-02-28', status: 'outstanding' },
    { invoice: 'INV-1994', amount: 7200,  issued: '2026-01-20', due: '2026-02-17', status: 'paid' },
  ],
};

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={12} style={{ color: n <= Math.floor(rating) ? '#f59e0b' : 'rgba(255,255,255,0.15)', fill: n <= Math.floor(rating) ? '#f59e0b' : 'none' }} />
      ))}
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4 }}>{rating}</span>
    </div>
  );
}

function VendorDetail({ vendor, onClose }) {
  const [tab, setTab] = useState('Jobs');
  const jobs     = VENDOR_JOBS[vendor.id]    || VENDOR_JOBS[1];
  const invoices = VENDOR_INVOICES[vendor.id] || VENDOR_INVOICES[1];
  const coi      = COI_COLOR[vendor.coi_status];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0F1929', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '88vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f4f8' }}>{vendor.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.5)', marginTop: 3 }}>{vendor.trade}  ·  {vendor.contact}  ·  {vendor.phone}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <StarRating rating={vendor.rating} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{vendor.total_jobs} total jobs</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: `${coi.color}22`, color: coi.color }}>
                COI {coi.label} — {vendor.coi_exp}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Contact Info */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[['Address', vendor.address],['Email', vendor.email],['Avg Invoice', money(vendor.avg_invoice)]].map(([k,v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 12, color: '#e2e8f0' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px' }}>
          {['Jobs','Invoices','COI Status'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 16px', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', border: 'none', background: 'transparent', color: tab === t ? '#3b82f6' : 'rgba(255,255,255,0.45)', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {tab === 'Jobs' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Project','Amount','Start','End','Status'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((j, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#e2e8f0' }}>{j.project}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: '#e2e8f0' }}>{money(j.amount)}</td>
                    <td style={{ padding: '9px 10px', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{j.start}</td>
                    <td style={{ padding: '9px 10px', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{j.end}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: j.status === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.07)', color: j.status === 'active' ? 'var(--status-profit)' : 'rgba(255,255,255,0.4)' }}>
                        {j.status === 'active' ? 'Active' : 'Complete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'Invoices' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Invoice #','Amount','Issued','Due','Status'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.07)', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: '#3b82f6' }}>{inv.invoice}</td>
                    <td style={{ padding: '9px 10px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: '#e2e8f0' }}>{money(inv.amount)}</td>
                    <td style={{ padding: '9px 10px', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{inv.issued}</td>
                    <td style={{ padding: '9px 10px', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{inv.due}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: inv.status === 'paid' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)', color: inv.status === 'paid' ? 'var(--status-profit)' : 'var(--status-warning)' }}>
                        {inv.status === 'paid' ? 'Paid' : 'Outstanding'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'COI Status' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['COI Status', coi.label, coi.color],
                ['Expiration', vendor.coi_exp, vendor.coi_status === 'expired' ? 'var(--status-loss)' : 'rgba(240,244,248,0.8)'],
                ['Active Projects', vendor.active_jobs, '#e2e8f0'],
                ['Total Jobs', vendor.total_jobs, '#e2e8f0'],
              ].map(([k, v, color]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color }}>{v}</div>
                </div>
              ))}
              {vendor.coi_status !== 'valid' && (
                <div style={{ gridColumn: '1/-1', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--status-loss)', fontWeight: 600 }}>Action Required</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,244,248,0.6)', marginTop: 4 }}>
                    {vendor.coi_status === 'expired'
                      ? `COI expired on ${vendor.coi_exp}. Vendor cannot be added to new projects until renewed.`
                      : `COI expires on ${vendor.coi_exp}. Contact vendor to renew before expiration.`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Vendors() {
  const [search, setSearch]   = useState('');
  const [trade, setTrade]     = useState('All');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    let list = VENDORS;
    if (trade !== 'All') list = list.filter(v => v.trade === trade);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.trade.toLowerCase().includes(q));
    }
    return list;
  }, [search, trade]);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      {selected && <VendorDetail vendor={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Vendor Directory</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{VENDORS.length} vendors  ·  {VENDORS.filter(v => v.coi_status === 'expired').length} expired COI  ·  {VENDORS.filter(v => v.coi_status === 'warning').length} expiring soon</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={trade} onChange={e => setTrade(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Vendor','Trade','Rating','Total Jobs','Active Jobs','Avg Invoice','COI Status','COI Expiry'].map(h => (
                <th key={h} style={{ ...thBase, textAlign: h === 'Avg Invoice' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(v => {
              const coi = COI_COLOR[v.coi_status];
              return (
                <tr key={v.id} onClick={() => setSelected(v)} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{v.trade}</td>
                  <td style={{ padding: '12px 14px' }}><StarRating rating={v.rating} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v.total_jobs}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v.active_jobs}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(v.avg_invoice)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${coi.color}1a`, color: coi.color }}>{coi.label}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: v.coi_status === 'expired' ? 'var(--status-loss)' : v.coi_status === 'warning' ? 'var(--status-warning)' : 'var(--text-secondary)' }}>{v.coi_exp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
