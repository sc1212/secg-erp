import { useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, shortDate } from '../lib/format';
import { EmptyState, ErrorState, PageLoading } from '../components/LoadingState';

const demoVendors = [
  { id: 1, name: 'Miller Concrete', trade: 'Concrete', contact_name: 'Tom M', phone: 'x4521', insurance_expiry: '2026-08-15', w9_on_file: true, current_balance: 8400, rating: 4 },
  { id: 2, name: 'Williams Electric', trade: 'Electrical', contact_name: 'Dave W', phone: 'x7788', insurance_expiry: '2026-02-25', w9_on_file: true, current_balance: 6200, rating: 5 },
  { id: 3, name: '84 Lumber', trade: 'Material', contact_name: 'Acct Mgr', phone: 'x9900', insurance_expiry: '2026-12-01', w9_on_file: true, current_balance: 12100, rating: 4 },
  { id: 4, name: 'TN Mechanical', trade: 'HVAC', contact_name: 'Mark T', phone: 'x2200', insurance_expiry: '2025-01-01', w9_on_file: false, current_balance: 0, rating: 3 },
];

function coiStatus(expiry) {
  if (!expiry) return { label: '⚠️ Unknown', cls: 'text-warn' };
  const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: '❌ Exp', cls: 'text-danger' };
  if (days <= 30) return { label: `⚠️ ${days}d`, cls: 'text-warn' };
  return { label: `✅ ${Math.round(days / 30)}mo`, cls: 'text-ok' };
}

export default function Vendors() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [selected, setSelected] = useState(null);
  const { data, loading, error, refetch } = useApi(() => api.vendors({ page: 1, per_page: 100, ...(search && { search }) }), [search]);

  const items = data?.items?.length ? data.items : demoVendors;
  const rows = useMemo(() => {
    const filtered = search ? items.filter((v) => `${v.name} ${v.trade || ''}`.toLowerCase().includes(search.toLowerCase())) : items;
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return sorted;
  }, [items, search, sort]);

  const setSortKey = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor Directory</h1>
        <div className="text-sm text-brand-muted">{rows.length} vendors</div>
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="max-w-sm bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-sm" />

      {rows.length === 0 ? <EmptyState title="No vendors found" /> : (
        <div className="bg-brand-card border border-brand-border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-brand-muted border-b border-brand-border">
              <tr>
                <th className="p-2">★</th>
                <th className="p-2 text-left cursor-pointer" onClick={() => setSortKey('name')}>Vendor Name</th>
                <th className="p-2 text-left cursor-pointer" onClick={() => setSortKey('trade')}>Trade</th>
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">COI</th>
                <th className="p-2 text-left">W9</th>
                <th className="p-2 text-right">Bal.</th>
                <th className="p-2 text-left">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const coi = coiStatus(v.insurance_expiry);
                return (
                  <tr key={v.id} className="border-b border-brand-border/50 hover:bg-brand-card-hover cursor-pointer" onClick={() => setSelected(v)}>
                    <td className="p-2">{v.favorite ? '⭐' : ''}</td>
                    <td className="p-2 font-medium">{v.name}</td>
                    <td className="p-2">{v.trade || '—'}</td>
                    <td className="p-2">{v.contact_name || '—'}</td>
                    <td className="p-2">{v.phone || '—'}</td>
                    <td className={`p-2 ${coi.cls}`}>{coi.label}</td>
                    <td className="p-2">{v.w9_on_file ? '✅' : '⚠️'}</td>
                    <td className="p-2 text-right tabular-nums">{money(v.current_balance || 0)}</td>
                    <td className="p-2">{'★'.repeat(Math.round(v.rating || 3))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          placeholder="Search vendors or trades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/60 transition-colors"
        />
      </div>

      {loading ? <PageLoading /> : !filtered.length ? (
        <EmptyState title="No vendors found" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((v) => {
            const avgScore = ((Number(v.score_quality) + Number(v.score_timeliness) + Number(v.score_communication) + Number(v.score_price)) / 4);
            const insExpired = v.insurance_expiry && new Date(v.insurance_expiry) < new Date();
            return (
              <div key={v.id} className="bg-brand-card border border-brand-border rounded-lg p-5 hover:border-brand-gold/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-brand-text">{v.name}</h3>
                    <span className="text-xs text-brand-gold">{v.trade}</span>
                  </div>
                  <Stars score={avgScore} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase">Quality</div>
                    <Stars score={v.score_quality} />
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase">Timeliness</div>
                    <Stars score={v.score_timeliness} />
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase">Communication</div>
                    <Stars score={v.score_communication} />
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase">Price</div>
                    <Stars score={v.score_price} />
                  </div>
                </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-brand-surface border-l border-brand-border p-4 z-50">
          <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{selected.name}</h3><button onClick={() => setSelected(null)}>✕</button></div>
          <div className="mt-3 text-sm space-y-2">
            <p><span className="text-brand-muted">Trade:</span> {selected.trade || '—'}</p>
            <p><span className="text-brand-muted">Contact:</span> {selected.contact_name || '—'}</p>
            <p><span className="text-brand-muted">Phone:</span> {selected.phone || '—'}</p>
            <p><span className="text-brand-muted">Email:</span> {selected.email || '—'}</p>
            <p><span className="text-brand-muted">COI Expiry:</span> {shortDate(selected.insurance_expiry)}</p>
            <p><span className="text-brand-muted">W9:</span> {selected.w9_on_file ? 'On file' : 'Missing'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
