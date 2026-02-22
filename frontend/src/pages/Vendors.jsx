import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, shortDate } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import {
  Star, Search, Filter, Phone, Mail, ChevronUp, ChevronDown,
  AlertTriangle, Check, X, Plus, Shield, ChevronLeft, ChevronRight,
  CheckSquare, Square, MoreHorizontal, FileText, Download, Trash2,
} from 'lucide-react';

/* ========================================================================== */
/*  DEMO DATA - 18 realistic construction vendors                             */
/* ========================================================================== */

const TRADES = ['Plumbing', 'Electrical', 'Concrete', 'HVAC', 'Framing', 'Drywall', 'Roofing', 'Painting', 'Flooring', 'Landscaping', 'Excavation', 'Masonry', 'Insulation', 'Glass/Glazing', 'Fire Protection'];
const PROJECTS = ['PRJ-042 Elm Street', 'PRJ-038 Lakewood', 'PRJ-051 Riverdale', 'PRJ-055 Oak Manor', 'PRJ-060 Pinehurst'];
const COI_STATUSES = ['current', 'expiring', 'expired'];
const W9_STATUSES = ['on_file', 'incomplete', 'missing'];
const RATING_OPTIONS = [1, 2, 3, 4, 5];

const today = new Date();
const daysFromNow = (d) => Math.ceil((new Date(d) - today) / (1000 * 60 * 60 * 24));

const demoVendors = [
  { id: 1,  name: 'ABC Plumbing LLC',            trade: 'Plumbing',        contact: 'Mike Anderson',      phone: '(555) 234-5678', email: 'mike@abcplumbing.com',        status: 'active',   favorite: true,  coi_expiry: '2026-08-15', w9_status: 'on_file',    rating: 4.5, balance: 8500,  projects: ['PRJ-042 Elm Street', 'PRJ-038 Lakewood'] },
  { id: 2,  name: 'Williams Electric',            trade: 'Electrical',      contact: 'Bill Williams',      phone: '(555) 345-6789', email: 'bill@willelectric.com',       status: 'active',   favorite: true,  coi_expiry: '2026-06-01', w9_status: 'on_file',    rating: 4.8, balance: 6200,  projects: ['PRJ-038 Lakewood'] },
  { id: 3,  name: 'Miller Concrete Works',        trade: 'Concrete',        contact: 'Dave Miller',        phone: '(555) 456-7890', email: 'info@millerconcrete.com',     status: 'active',   favorite: false, coi_expiry: '2026-03-10', w9_status: 'on_file',    rating: 3.8, balance: 12400, projects: ['PRJ-042 Elm Street'] },
  { id: 4,  name: 'Southeast HVAC Services',      trade: 'HVAC',            contact: 'Tom Garcia',         phone: '(555) 567-8901', email: 'service@sehvac.com',          status: 'active',   favorite: false, coi_expiry: '2026-12-31', w9_status: 'missing',    rating: 4.2, balance: 3100,  projects: ['PRJ-055 Oak Manor'] },
  { id: 5,  name: 'Carolina Framing Co',          trade: 'Framing',         contact: 'Jake Roberts',       phone: '(555) 678-9012', email: 'jobs@carolinaframing.com',    status: 'active',   favorite: true,  coi_expiry: '2026-05-15', w9_status: 'on_file',    rating: 4.0, balance: 15800, projects: ['PRJ-042 Elm Street', 'PRJ-051 Riverdale'] },
  { id: 6,  name: 'Pro Drywall Inc',              trade: 'Drywall',         contact: 'Steve Brown',        phone: '(555) 789-0123', email: 'bids@prodrywall.com',         status: 'active',   favorite: false, coi_expiry: '2025-12-01', w9_status: 'on_file',    rating: 3.5, balance: 4200,  projects: ['PRJ-038 Lakewood'] },
  { id: 7,  name: 'Summit Roofing & Gutters',     trade: 'Roofing',         contact: 'Carlos Mendez',      phone: '(555) 890-1234', email: 'carlos@summitroofing.com',    status: 'active',   favorite: false, coi_expiry: '2026-04-20', w9_status: 'on_file',    rating: 4.6, balance: 22000, projects: ['PRJ-051 Riverdale', 'PRJ-055 Oak Manor'] },
  { id: 8,  name: 'Brushworks Painting',          trade: 'Painting',        contact: 'Amy Chen',           phone: '(555) 901-2345', email: 'amy@brushworks.com',          status: 'active',   favorite: false, coi_expiry: '2026-09-30', w9_status: 'on_file',    rating: 4.7, balance: 0,     projects: ['PRJ-042 Elm Street'] },
  { id: 9,  name: 'Precision Tile & Stone',       trade: 'Flooring',        contact: 'Rick Palmer',        phone: '(555) 012-3456', email: 'rick@precisiontile.com',      status: 'active',   favorite: false, coi_expiry: '2026-03-01', w9_status: 'incomplete', rating: 3.9, balance: 7600,  projects: ['PRJ-055 Oak Manor'] },
  { id: 10, name: 'Greenscape Landscaping',       trade: 'Landscaping',     contact: 'Maria Sanchez',      phone: '(555) 123-4567', email: 'maria@greenscape.net',        status: 'active',   favorite: false, coi_expiry: '2026-11-15', w9_status: 'on_file',    rating: 4.3, balance: 3400,  projects: ['PRJ-042 Elm Street'] },
  { id: 11, name: 'Trident Excavation',           trade: 'Excavation',      contact: 'Ron Walker',         phone: '(555) 234-5670', email: 'ron@tridentexcavation.com',   status: 'active',   favorite: true,  coi_expiry: '2026-07-01', w9_status: 'on_file',    rating: 4.1, balance: 18500, projects: ['PRJ-060 Pinehurst'] },
  { id: 12, name: 'Heritage Masonry',             trade: 'Masonry',         contact: 'Frank DiNapoli',     phone: '(555) 345-6780', email: 'frank@heritagemasonry.com',   status: 'inactive', favorite: false, coi_expiry: '2025-10-15', w9_status: 'on_file',    rating: 3.2, balance: 0,     projects: [] },
  { id: 13, name: 'Comfort Zone Insulation',      trade: 'Insulation',      contact: 'Larry Price',        phone: '(555) 456-7891', email: 'larry@comfortzone.com',       status: 'active',   favorite: false, coi_expiry: '2026-02-28', w9_status: 'on_file',    rating: 4.0, balance: 2800,  projects: ['PRJ-051 Riverdale'] },
  { id: 14, name: 'Crystal Clear Glass',          trade: 'Glass/Glazing',   contact: 'Sarah Kim',          phone: '(555) 567-8902', email: 'sarah@crystalclearglass.com', status: 'active',   favorite: false, coi_expiry: '2026-01-15', w9_status: 'missing',    rating: 3.6, balance: 5100,  projects: ['PRJ-055 Oak Manor'] },
  { id: 15, name: 'Patriot Fire Protection',      trade: 'Fire Protection', contact: 'Jim O\'Brien',       phone: '(555) 678-9013', email: 'jim@patriotfire.com',         status: 'active',   favorite: false, coi_expiry: '2026-10-01', w9_status: 'on_file',    rating: 4.9, balance: 9200,  projects: ['PRJ-060 Pinehurst'] },
  { id: 16, name: 'Lowcountry Plumbing',          trade: 'Plumbing',        contact: 'Danny Hart',         phone: '(555) 789-0124', email: 'danny@lowcountryplmb.com',   status: 'inactive', favorite: false, coi_expiry: '2025-08-30', w9_status: 'incomplete', rating: 2.8, balance: 0,     projects: [] },
  { id: 17, name: 'PowerLine Electrical',         trade: 'Electrical',      contact: 'Kevin Cho',          phone: '(555) 890-1235', email: 'kevin@powerlineelec.com',     status: 'active',   favorite: false, coi_expiry: '2026-06-15', w9_status: 'on_file',    rating: 4.4, balance: 11200, projects: ['PRJ-042 Elm Street', 'PRJ-060 Pinehurst'] },
  { id: 18, name: 'Apex Concrete Solutions',       trade: 'Concrete',        contact: 'Tony Russo',         phone: '(555) 901-2346', email: 'tony@apexconcrete.com',       status: 'active',   favorite: false, coi_expiry: '2026-03-18', w9_status: 'on_file',    rating: 4.1, balance: 6800,  projects: ['PRJ-051 Riverdale'] },
];


/* ========================================================================== */
/*  HELPER FUNCTIONS                                                          */
/* ========================================================================== */

function getCoiStatus(expiryDate) {
  if (!expiryDate) return 'expired';
  const days = daysFromNow(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'current';
}

function getCoiDaysLabel(expiryDate) {
  if (!expiryDate) return 'No COI';
  const days = daysFromNow(expiryDate);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days <= 30) return `${days}d remaining`;
  return shortDate(expiryDate);
}


/* ========================================================================== */
/*  SUB-COMPONENTS                                                            */
/* ========================================================================== */

/** Star rating display (1-5) */
function StarRating({ score, size = 12 }) {
  const rounded = Math.round(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= rounded ? 'var(--accent)' : 'var(--border-medium)',
            fill: i <= rounded ? 'var(--accent)' : 'none',
          }}
        />
      ))}
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
        {Number(score).toFixed(1)}
      </span>
    </div>
  );
}

/** COI status badge */
function CoiBadge({ expiryDate }) {
  const status = getCoiStatus(expiryDate);
  const label = getCoiDaysLabel(expiryDate);
  const config = {
    current:  { icon: Check, bg: 'var(--status-profit-bg)', color: 'var(--status-profit)', borderColor: 'color-mix(in srgb, var(--status-profit) 25%, transparent)' },
    expiring: { icon: AlertTriangle, bg: 'var(--status-warning-bg)', color: 'var(--status-warning)', borderColor: 'color-mix(in srgb, var(--status-warning) 25%, transparent)' },
    expired:  { icon: X, bg: 'var(--status-loss-bg)', color: 'var(--status-loss)', borderColor: 'color-mix(in srgb, var(--status-loss) 25%, transparent)' },
  };
  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600,
        padding: '2px 8px', borderRadius: 4,
        background: c.bg, color: c.color, border: `1px solid ${c.borderColor}`,
        whiteSpace: 'nowrap',
      }}
      title={`COI: ${label}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

/** W9 status badge */
function W9Badge({ status }) {
  const config = {
    on_file:    { icon: Check, bg: 'var(--status-profit-bg)', color: 'var(--status-profit)', label: 'On File' },
    incomplete: { icon: AlertTriangle, bg: 'var(--status-warning-bg)', color: 'var(--status-warning)', label: 'Incomplete' },
    missing:    { icon: X, bg: 'var(--status-loss-bg)', color: 'var(--status-loss)', label: 'Missing' },
  };
  const c = config[status] || config.missing;
  const Icon = c.icon;

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600,
        padding: '2px 8px', borderRadius: 4,
        background: c.bg, color: c.color,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={11} />
      {c.label}
    </span>
  );
}

/** Sortable column header */
function SortHeader({ label, column, sortCol, sortDir, onSort, align }) {
  const active = sortCol === column;
  return (
    <th
      onClick={() => onSort(column)}
      style={{
        cursor: 'pointer', userSelect: 'none',
        textAlign: align || 'left',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {label}
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 0 }}>
          <ChevronUp
            size={10}
            style={{
              color: active && sortDir === 'asc' ? 'var(--accent)' : 'var(--text-tertiary)',
              opacity: active && sortDir === 'asc' ? 1 : 0.35,
              marginBottom: -2,
            }}
          />
          <ChevronDown
            size={10}
            style={{
              color: active && sortDir === 'desc' ? 'var(--accent)' : 'var(--text-tertiary)',
              opacity: active && sortDir === 'desc' ? 1 : 0.35,
            }}
          />
        </span>
      </span>
    </th>
  );
}


/* ========================================================================== */
/*  MAIN COMPONENT                                                            */
/* ========================================================================== */

export default function Vendors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'directory';

  // --- State ---
  const [search, setSearch] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [coiFilter, setCoiFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [favorites, setFavorites] = useState(() => new Set(demoVendors.filter((v) => v.favorite).map((v) => v.id)));
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const ROWS_PER_PAGE = 25;

  // --- API ---
  const { data, loading, error, isDemo } = useApi(
    () => api.vendors({ page: 1, per_page: 50, ...(search && { search }) }),
    [search]
  );

  const items = data?.items || (loading ? [] : demoVendors);

  // --- Filtering ---
  const filtered = useMemo(() => {
    return items.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.trade.toLowerCase().includes(q) && !(v.contact || '').toLowerCase().includes(q)) return false;
      }
      if (tradeFilter && v.trade !== tradeFilter) return false;
      if (statusFilter && v.status !== statusFilter) return false;
      if (coiFilter) {
        const coiSt = getCoiStatus(v.coi_expiry);
        if (coiFilter !== coiSt) return false;
      }
      if (ratingFilter) {
        const minRating = Number(ratingFilter);
        if ((v.rating || 0) < minRating) return false;
      }
      if (projectFilter) {
        if (!(v.projects || []).some((p) => p.includes(projectFilter))) return false;
      }
      return true;
    });
  }, [items, search, tradeFilter, statusFilter, coiFilter, ratingFilter, projectFilter]);

  // --- Sorting ---
  const sorted = useMemo(() => {
    const arr = [...filtered];

    // Always sort favorites to top
    arr.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      // Then by selected column
      let aVal, bVal;
      switch (sortCol) {
        case 'name':    aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
        case 'trade':   aVal = a.trade.toLowerCase(); bVal = b.trade.toLowerCase(); break;
        case 'contact': aVal = (a.contact || '').toLowerCase(); bVal = (b.contact || '').toLowerCase(); break;
        case 'phone':   aVal = a.phone || ''; bVal = b.phone || ''; break;
        case 'coi':     aVal = daysFromNow(a.coi_expiry); bVal = daysFromNow(b.coi_expiry); break;
        case 'w9':      { const order = { on_file: 0, incomplete: 1, missing: 2 }; aVal = order[a.w9_status] ?? 3; bVal = order[b.w9_status] ?? 3; break; }
        case 'balance': aVal = a.balance || 0; bVal = b.balance || 0; break;
        case 'rating':  aVal = a.rating || 0; bVal = b.rating || 0; break;
        default:        aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase();
      }

      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return arr;
  }, [filtered, sortCol, sortDir, favorites]);

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  // --- Compliance tab data ---
  const complianceVendors = useMemo(() => {
    return items
      .filter((v) => {
        const st = getCoiStatus(v.coi_expiry);
        return st === 'expiring' || st === 'expired';
      })
      .sort((a, b) => daysFromNow(a.coi_expiry) - daysFromNow(b.coi_expiry));
  }, [items]);

  // --- Handlers ---
  const handleSort = useCallback((col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }, [sortCol]);

  const toggleFavorite = useCallback((e, id) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelected = useCallback((e, id) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === pageItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageItems.map((v) => v.id)));
    }
  }, [pageItems, selected]);

  const handleRowClick = useCallback((vendorId) => {
    navigate(`/vendors/${vendorId}`);
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setTradeFilter('');
    setStatusFilter('');
    setCoiFilter('');
    setRatingFilter('');
    setProjectFilter('');
    setPage(1);
  }, []);

  const setTab = useCallback((tab) => {
    if (tab === 'directory') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const hasActiveFilters = tradeFilter || statusFilter || coiFilter || ratingFilter || projectFilter;

  // Count compliance issues for badge
  const complianceCount = complianceVendors.length;
  const expiredCount = items.filter((v) => getCoiStatus(v.coi_expiry) === 'expired').length;
  const w9IssueCount = items.filter((v) => v.w9_status !== 'on_file').length;

  if (loading) return <PageLoading />;

  // Unique trades for filter dropdown
  const uniqueTrades = [...new Set(items.map((v) => v.trade))].sort();
  const uniqueProjects = [...new Set(items.flatMap((v) => v.projects || []))].sort();

  /* ======================================================================== */
  /*  RENDER                                                                  */
  /* ======================================================================== */
  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 20, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0,
            }}
          >
            Vendor Directory
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {filtered.length} vendor{filtered.length !== 1 ? 's' : ''}
            {hasActiveFilters ? ' (filtered)' : ''}
            {' '}&middot; {items.filter((v) => v.status === 'active').length} active
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 6,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search vendors, trades, contacts..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text-primary)', width: 220,
              }}
            />
          </div>
          {/* Add Vendor button */}
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 6,
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}
          >
            <Plus size={14} /> Add Vendor
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-medium)', paddingBottom: 0 }}>
        {[
          { key: 'directory', label: 'Directory' },
          { key: 'compliance', label: 'Compliance Tracker', badge: complianceCount },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              fontSize: 13, fontWeight: 500,
              border: 'none', background: 'none', cursor: 'pointer',
              color: currentTab === t.key ? 'var(--accent)' : 'var(--text-tertiary)',
              borderBottom: currentTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t.label}
            {t.badge > 0 && (
              <span
                style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10,
                  background: 'var(--status-loss)', color: '#fff',
                  lineHeight: '16px',
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── DIRECTORY TAB ──────────────────────────────────────────────── */}
      {currentTab === 'directory' && (
        <>
          {/* Filter Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            padding: '8px 12px', borderRadius: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
          }}>
            <Filter size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />

            {/* Trade filter */}
            <select
              value={tradeFilter}
              onChange={(e) => { setTradeFilter(e.target.value); setPage(1); }}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                color: tradeFilter ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              <option value="">All Trades</option>
              {uniqueTrades.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                color: statusFilter ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              <option value="">Active / Inactive</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* COI filter */}
            <select
              value={coiFilter}
              onChange={(e) => { setCoiFilter(e.target.value); setPage(1); }}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                color: coiFilter ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              <option value="">COI Status</option>
              <option value="current">Current (&gt;30d)</option>
              <option value="expiring">Expiring (&lt;30d)</option>
              <option value="expired">Expired</option>
            </select>

            {/* Rating filter */}
            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                color: ratingFilter ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              <option value="">Rating</option>
              {RATING_OPTIONS.map((r) => <option key={r} value={r}>{r}+ Stars</option>)}
            </select>

            {/* Project filter */}
            <select
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                color: projectFilter ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              <option value="">Project</option>
              {uniqueProjects.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: 'none', border: '1px solid var(--border-medium)',
                  color: 'var(--status-loss)', cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 14px', borderRadius: 6,
                background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                border: '1px solid var(--accent-border)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                {selected.size} selected
              </span>
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <MoreHorizontal size={12} /> Bulk Actions
              </button>
              {showBulkMenu && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 4, fontSize: 11,
                      background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)', cursor: 'pointer',
                    }}
                  >
                    <FileText size={11} /> Request COI
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 4, fontSize: 11,
                      background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)', cursor: 'pointer',
                    }}
                  >
                    <Download size={11} /> Export CSV
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 4, fontSize: 11,
                      background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)', cursor: 'pointer',
                    }}
                  >
                    <Mail size={11} /> Email
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 4, fontSize: 11,
                      background: 'var(--bg-surface)', border: '1px solid var(--border-medium)',
                      color: 'var(--status-loss)', cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={11} /> Deactivate
                  </button>
                </div>
              )}
              <button
                onClick={() => { setSelected(new Set()); setShowBulkMenu(false); }}
                style={{
                  marginLeft: 'auto',
                  padding: '4px 10px', borderRadius: 4, fontSize: 11,
                  background: 'none', border: '1px solid var(--border-medium)',
                  color: 'var(--text-tertiary)', cursor: 'pointer',
                }}
              >
                Deselect All
              </button>
            </div>
          )}

          {/* Table */}
          {filtered.length === 0 ? (
            <EmptyState title="No vendors match filters" message="Adjust your search or filter criteria" />
          ) : (
            <div className="overflow-x-auto" style={{ borderRadius: 8, border: '1px solid var(--border-medium)' }}>
              <table className="mc-table" style={{ minWidth: 1050 }}>
                <thead>
                  <tr>
                    {/* Select all checkbox */}
                    <th style={{ width: 36, textAlign: 'center', padding: '8px 6px' }}>
                      <span
                        onClick={toggleSelectAll}
                        style={{ cursor: 'pointer', display: 'inline-flex' }}
                        title={selected.size === pageItems.length ? 'Deselect all' : 'Select all'}
                      >
                        {selected.size > 0 && selected.size === pageItems.length
                          ? <CheckSquare size={14} style={{ color: 'var(--accent)' }} />
                          : <Square size={14} style={{ color: 'var(--text-tertiary)' }} />
                        }
                      </span>
                    </th>
                    {/* Favorite column */}
                    <th style={{ width: 36, textAlign: 'center', padding: '8px 4px' }}>
                      <Star size={12} style={{ color: 'var(--text-tertiary)' }} />
                    </th>
                    <SortHeader label="Vendor Name"  column="name"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Trade"        column="trade"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Contact"      column="contact" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Phone"        column="phone"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="COI"          column="coi"     sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="W9"           column="w9"      sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Balance (AP)" column="balance" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} align="right" />
                    <SortHeader label="Rating"       column="rating"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((v) => {
                    const isFav = favorites.has(v.id);
                    const isSelected = selected.has(v.id);
                    const isInactive = v.status === 'inactive';
                    return (
                      <tr
                        key={v.id}
                        onClick={() => handleRowClick(v.id)}
                        style={{
                          cursor: 'pointer',
                          opacity: isInactive ? 0.55 : 1,
                          background: isSelected ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : undefined,
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ textAlign: 'center', padding: '6px 6px', width: 36 }}>
                          <span
                            onClick={(e) => toggleSelected(e, v.id)}
                            style={{ cursor: 'pointer', display: 'inline-flex' }}
                          >
                            {isSelected
                              ? <CheckSquare size={14} style={{ color: 'var(--accent)' }} />
                              : <Square size={14} style={{ color: 'var(--text-tertiary)' }} />
                            }
                          </span>
                        </td>

                        {/* Favorite star */}
                        <td style={{ textAlign: 'center', padding: '6px 4px', width: 36 }}>
                          <span
                            onClick={(e) => toggleFavorite(e, v.id)}
                            style={{ cursor: 'pointer', display: 'inline-flex' }}
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              size={14}
                              style={{
                                color: isFav ? 'var(--accent)' : 'var(--border-medium)',
                                fill: isFav ? 'var(--accent)' : 'none',
                                transition: 'color 0.15s',
                              }}
                            />
                          </span>
                        </td>

                        {/* Vendor name */}
                        <td style={{ padding: '6px 12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                              {v.name}
                            </span>
                            {isInactive && (
                              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 500 }}>INACTIVE</span>
                            )}
                          </div>
                        </td>

                        {/* Trade */}
                        <td style={{ padding: '6px 12px' }}>
                          <span
                            style={{
                              fontSize: 11, fontWeight: 500,
                              padding: '2px 8px', borderRadius: 4,
                              background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                            }}
                          >
                            {v.trade}
                          </span>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '6px 12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{v.contact}</span>
                            {v.email && (
                              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Mail size={9} /> {v.email}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '6px 12px' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={11} style={{ flexShrink: 0 }} /> {v.phone}
                          </span>
                        </td>

                        {/* COI */}
                        <td style={{ padding: '6px 12px' }}>
                          <CoiBadge expiryDate={v.coi_expiry} />
                        </td>

                        {/* W9 */}
                        <td style={{ padding: '6px 12px' }}>
                          <W9Badge status={v.w9_status} />
                        </td>

                        {/* Balance (AP owed) */}
                        <td className="right" style={{ padding: '6px 12px', fontVariantNumeric: 'tabular-nums' }}>
                          <span style={{
                            fontSize: 13, fontWeight: 600,
                            color: v.balance > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          }}>
                            {v.balance > 0 ? money(v.balance) : '\u2014'}
                          </span>
                        </td>

                        {/* Rating */}
                        <td style={{ padding: '6px 12px' }}>
                          <StarRating score={v.rating || 0} size={11} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {sorted.length > ROWS_PER_PAGE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Showing {(safePage - 1) * ROWS_PER_PAGE + 1}&ndash;{Math.min(safePage * ROWS_PER_PAGE, sorted.length)} of {sorted.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage <= 1}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '4px 8px',
                    borderRadius: 4, border: '1px solid var(--border-medium)',
                    background: 'var(--bg-surface)', cursor: safePage <= 1 ? 'default' : 'pointer',
                    opacity: safePage <= 1 ? 0.4 : 1,
                    color: 'var(--text-secondary)', fontSize: 12,
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      border: safePage === p ? '1px solid var(--accent-border)' : '1px solid var(--border-medium)',
                      background: safePage === p ? 'var(--accent-bg)' : 'var(--bg-surface)',
                      color: safePage === p ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage >= totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '4px 8px',
                    borderRadius: 4, border: '1px solid var(--border-medium)',
                    background: 'var(--bg-surface)', cursor: safePage >= totalPages ? 'default' : 'pointer',
                    opacity: safePage >= totalPages ? 0.4 : 1,
                    color: 'var(--text-secondary)', fontSize: 12,
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Compliance Warning Banner ───────────────────────────────── */}
          {(expiredCount > 0 || w9IssueCount > 0) && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 6,
                background: 'color-mix(in srgb, var(--status-loss) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--status-loss) 25%, transparent)',
              }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--status-loss)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-loss)' }}>
                  Compliance Alert:
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 6 }}>
                  {expiredCount > 0 && `${expiredCount} vendor${expiredCount !== 1 ? 's' : ''} with expired COI`}
                  {expiredCount > 0 && w9IssueCount > 0 && ' \u2022 '}
                  {w9IssueCount > 0 && `${w9IssueCount} vendor${w9IssueCount !== 1 ? 's' : ''} with W9 issues`}
                </span>
              </div>
              <button
                onClick={() => setTab('compliance')}
                style={{
                  padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: 'var(--status-loss)', color: '#fff',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                View Details
              </button>
            </div>
          )}
        </>
      )}

      {/* ── COMPLIANCE TAB ─────────────────────────────────────────────── */}
      {currentTab === 'compliance' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <ComplianceCard
              icon={X}
              label="Expired COIs"
              value={expiredCount}
              color="var(--status-loss)"
              bg="var(--status-loss-bg)"
            />
            <ComplianceCard
              icon={AlertTriangle}
              label="Expiring <30 Days"
              value={complianceVendors.filter((v) => getCoiStatus(v.coi_expiry) === 'expiring').length}
              color="var(--status-warning)"
              bg="var(--status-warning-bg)"
            />
            <ComplianceCard
              icon={FileText}
              label="W9 Missing/Incomplete"
              value={w9IssueCount}
              color="var(--status-warning)"
              bg="var(--status-warning-bg)"
            />
            <ComplianceCard
              icon={Shield}
              label="Fully Compliant"
              value={items.filter((v) => getCoiStatus(v.coi_expiry) === 'current' && v.w9_status === 'on_file').length}
              color="var(--status-profit)"
              bg="var(--status-profit-bg)"
            />
          </div>

          {/* Expired / Expiring COI table */}
          <div
            style={{
              borderRadius: 8, border: '1px solid var(--border-medium)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '10px 14px',
              background: 'color-mix(in srgb, var(--status-loss) 6%, var(--bg-elevated))',
              borderBottom: '1px solid var(--border-medium)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangle size={14} style={{ color: 'var(--status-loss)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Vendors with Expiring / Expired COIs ({complianceVendors.length})
              </span>
            </div>

            {complianceVendors.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Check size={24} style={{ color: 'var(--status-profit)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All vendors have current COI coverage.</p>
              </div>
            ) : (
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Trade</th>
                    <th>Contact</th>
                    <th>COI Expiry</th>
                    <th>Status</th>
                    <th>Days</th>
                    <th>W9</th>
                    <th>Balance (AP)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceVendors.map((v) => {
                    const coiSt = getCoiStatus(v.coi_expiry);
                    const days = daysFromNow(v.coi_expiry);
                    return (
                      <tr
                        key={v.id}
                        onClick={() => handleRowClick(v.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {v.name}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.trade}</span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{v.contact}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Phone size={9} /> {v.phone}
                          </div>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {shortDate(v.coi_expiry)}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <CoiBadge expiryDate={v.coi_expiry} />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color: coiSt === 'expired' ? 'var(--status-loss)' : 'var(--status-warning)',
                          }}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <W9Badge status={v.w9_status} />
                        </td>
                        <td className="right" style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {v.balance > 0 ? money(v.balance) : '\u2014'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            style={{
                              padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                              background: coiSt === 'expired' ? 'var(--status-loss)' : 'var(--accent)',
                              color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            {coiSt === 'expired' ? 'Request COI' : 'Send Reminder'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* W9 Issues table */}
          {w9IssueCount > 0 && (
            <div
              style={{
                borderRadius: 8, border: '1px solid var(--border-medium)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '10px 14px',
                background: 'color-mix(in srgb, var(--status-warning) 6%, var(--bg-elevated))',
                borderBottom: '1px solid var(--border-medium)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <FileText size={14} style={{ color: 'var(--status-warning)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  W9 Issues ({w9IssueCount})
                </span>
              </div>
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Trade</th>
                    <th>Contact</th>
                    <th>W9 Status</th>
                    <th>Balance (AP)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter((v) => v.w9_status !== 'on_file').map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => handleRowClick(v.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {v.name}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.trade}</span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{v.contact}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{v.email}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <W9Badge status={v.w9_status} />
                      </td>
                      <td className="right" style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {v.balance > 0 ? money(v.balance) : '\u2014'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          style={{
                            padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: 'var(--accent)', color: '#fff',
                            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          Request W9
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ========================================================================== */
/*  COMPLIANCE CARD COMPONENT                                                 */
/* ========================================================================== */

function ComplianceCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div
      style={{
        borderRadius: 8, padding: 14,
        background: 'var(--color-brand-card)',
        border: '1px solid var(--color-brand-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon size={14} style={{ color }} />
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}
