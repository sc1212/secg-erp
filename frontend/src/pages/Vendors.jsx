import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, ChevronUp, ChevronDown, ChevronLeft, ArrowLeft, Phone, Mail, X } from 'lucide-react';
import { money } from '../lib/format';
import { VENDORS, getVendorHistory, getVendorInvoices } from '../data/demoData';

const coiColor = { current: '#34d399', expiring: '#fbbf24', expired: '#fb7185' };
const coiLabel = { current: 'Current', expiring: 'Expiring', expired: 'Expired' };

export default function VendorsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const trades = useMemo(() => [...new Set(VENDORS.map(v => v.trade))].sort(), []);

  const filtered = useMemo(() => {
    let list = [...VENDORS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.trade.toLowerCase().includes(q));
    }
    if (tradeFilter) list = list.filter(v => v.trade === tradeFilter);
    list.sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'name': av = a.name; bv = b.name; break;
        case 'trade': av = a.trade; bv = b.trade; break;
        case 'rating': av = a.rating; bv = b.rating; break;
        case 'totalJobs': av = a.totalJobs; bv = b.totalJobs; break;
        case 'avgInvoice': av = a.avgInvoice; bv = b.avgInvoice; break;
        default: av = a.name; bv = b.name;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [search, tradeFilter, sortCol, sortDir]);

  if (selectedVendor) return <VendorDetail vendor={selectedVendor} onBack={() => setSelectedVendor(null)} />;

  const SH = ({ label, col, align }) => (
    <th onClick={() => handleSort(col)} style={{ padding: '10px 12px', cursor: 'pointer', userSelect: 'none', textAlign: align || 'left', whiteSpace: 'nowrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {label}
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 0 }}>
          <ChevronUp size={10} style={{ color: sortCol === col && sortDir === 'asc' ? 'var(--accent)' : 'var(--text-tertiary)', opacity: sortCol === col && sortDir === 'asc' ? 1 : 0.3, marginBottom: -2 }} />
          <ChevronDown size={10} style={{ color: sortCol === col && sortDir === 'desc' ? 'var(--accent)' : 'var(--text-tertiary)', opacity: sortCol === col && sortDir === 'desc' ? 1 : 0.3 }} />
        </span>
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>Vendor Directory</h1>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{filtered.length} vendors</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div style={{ position: 'relative', maxWidth: 260, flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
        </div>
        <select value={tradeFilter} onChange={e => setTradeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: tradeFilter ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: 13 }}>
          <option value="">All Trades</option>
          {trades.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <SH label="Name" col="name" />
              <SH label="Trade" col="trade" />
              <SH label="Rating" col="rating" align="center" />
              <SH label="Total Jobs" col="totalJobs" align="right" />
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Active Jobs</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>COI Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>COI Expiry</th>
              <SH label="Avg Invoice" col="avgInvoice" align="right" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr
                key={v.id}
                onClick={() => setSelectedVendor(v)}
                style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{v.trade}</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ color: '#fbbf24', fontSize: 12 }}>{'*'.repeat(Math.round(v.rating))}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 12, marginLeft: 4 }}>{v.rating}</span>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{v.totalJobs}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)' }}>{v.activeJobs}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: coiColor[v.coiStatus] + '18', color: coiColor[v.coiStatus] }}>{coiLabel[v.coiStatus]}</span>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: v.coiStatus === 'expired' ? '#fb7185' : v.coiStatus === 'expiring' ? '#fbbf24' : 'var(--text-secondary)' }}>{v.coiExpiry}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)' }}>{money(v.avgInvoice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VendorDetail({ vendor, onBack }) {
  const history = useMemo(() => getVendorHistory(vendor.id), [vendor.id]);
  const invoices = useMemo(() => getVendorInvoices(vendor.id), [vendor.id]);

  return (
    <div className="space-y-5">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>
        <ArrowLeft size={16} /> Back to Vendors
      </button>

      {/* Header */}
      <div style={{ padding: 20, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>{vendor.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Trade: <b style={{ color: 'var(--text-primary)' }}>{vendor.trade}</b></span>
              <span style={{ color: 'var(--text-secondary)' }}>Rating: <b style={{ color: '#fbbf24' }}>{vendor.rating}</b></span>
              <span style={{ color: 'var(--text-secondary)' }}>COI: <b style={{ color: coiColor[vendor.coiStatus] }}>{coiLabel[vendor.coiStatus]} ({vendor.coiExpiry})</b></span>
            </div>
          </div>
          <div className="text-sm space-y-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Phone size={13} /> {vendor.phone}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}><Mail size={13} /> {vendor.email}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Contact: {vendor.contact}</div>
          </div>
        </div>
      </div>

      {/* Job History */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Job History</h3>
        <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Start</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>End</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{h.project}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{money(h.amount)}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{h.startDate}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{h.endDate || '--'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: h.status === 'Active' ? 'rgba(52,211,153,0.1)' : 'rgba(148,163,184,0.1)', color: h.status === 'Active' ? '#34d399' : '#94a3b8' }}>{h.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Invoices */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Invoices</h3>
        <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Invoice #</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{inv.invoiceNum}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{money(inv.amount)}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{inv.date}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{inv.project}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: inv.status === 'Outstanding' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', color: inv.status === 'Outstanding' ? '#fbbf24' : '#34d399' }}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Notes */}
      <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Performance Notes</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {vendor.name} has completed {vendor.totalJobs} jobs with SECG. Average rating of {vendor.rating}/5.0 across all projects. Currently {vendor.activeJobs} active job{vendor.activeJobs !== 1 ? 's' : ''}. Average invoice amount: {money(vendor.avgInvoice)}. COI status: {coiLabel[vendor.coiStatus]}.
        </div>
      </div>
    </div>
  );
}
