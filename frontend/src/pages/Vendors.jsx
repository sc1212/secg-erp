import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import { Search, Star, Shield, Phone, Mail } from 'lucide-react';

const demoVendors = [
  { id: 1, name: 'ABC Plumbing LLC', trade: 'Plumbing', phone: '(555) 234-5678', email: 'mike@abcplumbing.com', score_quality: 4.5, score_timeliness: 4.0, score_communication: 3.5, score_price: 4.0, insurance_expiry: '2026-08-15', w9_on_file: true },
  { id: 2, name: 'Williams Electric', trade: 'Electrical', phone: '(555) 345-6789', email: 'bill@willelectric.com', score_quality: 5.0, score_timeliness: 4.5, score_communication: 5.0, score_price: 3.5, insurance_expiry: '2026-06-01', w9_on_file: true },
  { id: 3, name: 'Miller Concrete Works', trade: 'Concrete', phone: '(555) 456-7890', email: 'info@millerconcrete.com', score_quality: 4.0, score_timeliness: 3.0, score_communication: 3.5, score_price: 5.0, insurance_expiry: '2026-03-01', w9_on_file: true },
  { id: 4, name: 'Southeast HVAC Services', trade: 'HVAC', phone: '(555) 567-8901', email: 'service@sehvac.com', score_quality: 4.5, score_timeliness: 4.5, score_communication: 4.0, score_price: 3.0, insurance_expiry: '2026-12-31', w9_on_file: false },
  { id: 5, name: 'Carolina Framing Co', trade: 'Framing', phone: '(555) 678-9012', email: 'jobs@carolinaframing.com', score_quality: 3.5, score_timeliness: 4.0, score_communication: 4.5, score_price: 4.5, insurance_expiry: '2026-05-15', w9_on_file: true },
  { id: 6, name: 'Pro Drywall Inc', trade: 'Drywall', phone: '(555) 789-0123', email: 'bids@prodrywall.com', score_quality: 4.0, score_timeliness: 3.5, score_communication: 3.0, score_price: 4.0, insurance_expiry: '2025-12-01', w9_on_file: true },
];

function Stars({ score }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(score) ? 'text-brand-gold fill-brand-gold' : 'text-brand-border'}
        />
      ))}
      <span className="text-xs text-brand-muted ml-1">{Number(score).toFixed(1)}</span>
    </div>
  );
}

export default function Vendors() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useApi(
    () => api.vendors({ page: 1, per_page: 50, ...(search && { search }) }),
    [search]
  );

  const items = data?.items || (loading ? [] : demoVendors);
  const filtered = search
    ? items.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.trade.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <span className="text-sm text-brand-muted">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</span>
      </div>

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
              <div key={v.id} className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/20 transition-colors">
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

                <div className="flex flex-wrap gap-3 text-xs text-brand-muted border-t border-brand-border/50 pt-3">
                  {v.phone && <span className="flex items-center gap-1"><Phone size={11} /> {v.phone}</span>}
                  {v.email && <span className="flex items-center gap-1"><Mail size={11} /> {v.email}</span>}
                  <span className={`flex items-center gap-1 ${insExpired ? 'text-danger' : 'text-ok'}`}>
                    <Shield size={11} /> Ins: {shortDate(v.insurance_expiry)} {insExpired && '(EXPIRED)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
