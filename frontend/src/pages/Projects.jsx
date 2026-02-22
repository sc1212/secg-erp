import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, pct, shortDate, statusBadge } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import { Search, Filter, ChevronRight } from 'lucide-react';

const statuses = ['all', 'active', 'pre_construction', 'on_hold', 'completed'];

// Demo data when backend isn't running
const demoProjects = [
  { id: 1, code: 'PRJ-042', name: '2847 Elm Street Renovation', status: 'active', project_type: 'remodel', budget_total: 120000, contract_amount: 145000, project_manager: 'Matt S.', start_date: '2025-09-15', target_completion: '2026-04-01' },
  { id: 2, code: 'PRJ-038', name: 'Lakewood Custom Home', status: 'active', project_type: 'custom_home', budget_total: 485000, contract_amount: 550000, project_manager: 'Matt S.', start_date: '2025-06-01', target_completion: '2026-08-15' },
  { id: 3, code: 'PRJ-051', name: 'Riverdale Spec Home #3', status: 'active', project_type: 'spec_home', budget_total: 320000, contract_amount: 389000, project_manager: 'Matt S.', start_date: '2025-11-01', target_completion: '2026-06-30' },
  { id: 4, code: 'PRJ-033', name: 'Highland Park Multi-Family', status: 'active', project_type: 'multifamily', budget_total: 1200000, contract_amount: 1450000, project_manager: 'Matt S.', start_date: '2025-03-01', target_completion: '2026-12-01' },
  { id: 5, code: 'PRJ-027', name: 'Insurance Claim — 114 Oak', status: 'active', project_type: 'insurance_claim', budget_total: 78000, contract_amount: 82000, project_manager: 'Matt S.', start_date: '2025-12-01', target_completion: '2026-03-15' },
  { id: 6, code: 'PRJ-055', name: 'Crestview Commercial Build-Out', status: 'pre_construction', project_type: 'commercial', budget_total: 260000, contract_amount: 310000, project_manager: 'Matt S.', start_date: '2026-03-01', target_completion: '2026-09-01' },
];

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useApi(
    () => api.projects({ page: 1, per_page: 50, ...(statusFilter !== 'all' && { status: statusFilter }), ...(search && { search }) }),
    [statusFilter, search]
  );

  const items = data?.items || (loading ? [] : demoProjects);
  const filtered = statusFilter === 'all' ? items : items.filter(p => p.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <span className="text-sm text-brand-muted">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/60 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30'
                  : 'bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Project List */}
      {loading ? (
        <PageLoading />
      ) : error && !items.length ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !filtered.length ? (
        <EmptyState title="No projects found" message="Try a different search or filter" />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block bg-brand-card border border-brand-border rounded-lg p-5 hover:border-brand-gold/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-brand-gold">{p.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(p.status)}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-brand-text group-hover:text-brand-gold transition-colors truncate">{p.name}</h3>
                  <div className="flex gap-6 mt-2 text-xs text-brand-muted">
                    <span>Budget: <b className="text-brand-text">{money(p.budget_total)}</b></span>
                    <span>Contract: <b className="text-brand-text">{money(p.contract_amount)}</b></span>
                    <span className="hidden sm:inline">PM: {p.project_manager}</span>
                    <span className="hidden sm:inline">{shortDate(p.start_date)} → {shortDate(p.target_completion)}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-brand-muted group-hover:text-brand-gold shrink-0 ml-4 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
