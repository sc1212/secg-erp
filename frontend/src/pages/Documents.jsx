import { useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import {
  FileText, Upload, Search, FolderOpen, AlertTriangle, Image, Shield,
  Receipt, File, ChevronLeft, Download, Eye, Calendar, Filter, X,
  Folder, List, Tag, Clock, User, HardDrive, CheckCircle, FileImage,
  FilePlus, UploadCloud,
} from 'lucide-react';

/* ── Type Mapping ─────────────────────────────────────────────────────── */

const DOC_TYPE_ICONS = {
  contract: FileText, plans: FileImage, permit: Shield, coi: Shield,
  lien_waiver: FileText, inspection_report: FileText, photo: Image,
  change_order: FileText, draw_package: FileText, proposal: FileText,
  w9: FileText, invoice: Receipt, warranty: Shield,
  punch_list: FileText, safety_report: Shield, other: File,
};

const DOC_TYPE_LABELS = {
  contract: 'Contracts', plans: 'Plans & Drawings', permit: 'Permits',
  coi: 'COIs & Insurance', lien_waiver: 'Lien Waivers', inspection_report: 'Inspection Reports',
  photo: 'Photos', change_order: 'Change Orders', draw_package: 'Draw Packages',
  proposal: 'Proposals', w9: 'W-9s', invoice: 'Invoices',
  warranty: 'Warranties', punch_list: 'Punch Lists', safety_report: 'Safety Reports',
  other: 'Other Documents',
};

const DOC_TYPE_COLORS = {
  contract: 'var(--accent)',
  plans: '#6366f1',
  permit: '#f59e0b',
  coi: '#ef4444',
  lien_waiver: '#8b5cf6',
  photo: '#06b6d4',
  change_order: '#f97316',
  w9: '#64748b',
  invoice: '#10b981',
  warranty: '#ec4899',
  other: 'var(--text-tertiary)',
};

/* URL param → doc_type mapping */
const URL_TYPE_MAP = {
  contracts: 'contract',
  photos: 'photo',
  plans: 'plans',
  coi: 'coi',
  permits: 'permit',
  invoices: 'invoice',
  w9: 'w9',
  'lien-waivers': 'lien_waiver',
  'change-orders': 'change_order',
};

/* ── Demo Data ────────────────────────────────────────────────────────── */

const demoFolders = [
  { doc_type: 'contract',       count: 23 },
  { doc_type: 'plans',          count: 45 },
  { doc_type: 'coi',            count: 89 },
  { doc_type: 'w9',             count: 52 },
  { doc_type: 'lien_waiver',    count: 67 },
  { doc_type: 'permit',         count: 34 },
  { doc_type: 'photo',          count: 847 },
  { doc_type: 'change_order',   count: 28 },
  { doc_type: 'invoice',        count: 62 },
];

const DEMO_PROJECTS = ['PRJ-042 Riverside Custom', 'PRJ-038 Mountain View', 'PRJ-051 Lakeshore Reno', 'PRJ-044 Downtown Office'];
const DEMO_VENDORS = ['ABC Plumbing LLC', 'Williams Electric', 'Miller Concrete', 'SE HVAC Services', 'Carolina Framing Co'];
const DEMO_UPLOADERS = ['Mike Sullivan', 'Jake Torres', 'Sarah Chen', 'Derek Hall'];

const demoDocs = [
  { id: 1, title: 'PRJ-042 General Contract', doc_type: 'contract', file_name: 'PRJ042_Contract_Final.pdf', file_size_bytes: 2400000, created_at: '2025-08-15T10:00:00', expiry_date: null, status: 'active', project_name: 'PRJ-042 Riverside Custom', vendor_name: null, uploaded_by: 'Mike Sullivan' },
  { id: 2, title: 'ABC Plumbing COI 2026', doc_type: 'coi', file_name: 'ABC_Plumbing_COI_2026.pdf', file_size_bytes: 850000, created_at: '2025-12-01T14:30:00', expiry_date: '2026-03-15', status: 'active', project_name: null, vendor_name: 'ABC Plumbing LLC', uploaded_by: 'Sarah Chen' },
  { id: 3, title: 'PRJ-038 Architectural Plans Rev C', doc_type: 'plans', file_name: 'PRJ038_Plans_RevC.pdf', file_size_bytes: 15200000, created_at: '2025-10-20T09:00:00', expiry_date: null, status: 'active', project_name: 'PRJ-038 Mountain View', vendor_name: null, uploaded_by: 'Mike Sullivan' },
  { id: 4, title: 'Building Permit #BP-2025-4421', doc_type: 'permit', file_name: 'Permit_BP20254421.pdf', file_size_bytes: 420000, created_at: '2025-09-10T11:00:00', expiry_date: '2026-09-10', status: 'active', project_name: 'PRJ-042 Riverside Custom', vendor_name: null, uploaded_by: 'Jake Torres' },
  { id: 5, title: 'TN Electric W-9', doc_type: 'w9', file_name: 'TN_Electric_W9.pdf', file_size_bytes: 180000, created_at: '2025-07-01T08:00:00', expiry_date: null, status: 'active', project_name: null, vendor_name: 'Williams Electric', uploaded_by: 'Sarah Chen' },
  { id: 6, title: 'Change Order #7 -- PRJ-042', doc_type: 'change_order', file_name: 'CO7_PRJ042.pdf', file_size_bytes: 320000, created_at: '2026-02-10T16:00:00', expiry_date: null, status: 'active', project_name: 'PRJ-042 Riverside Custom', vendor_name: 'Carolina Framing Co', uploaded_by: 'Mike Sullivan' },
  { id: 7, title: 'Williams Electric COI', doc_type: 'coi', file_name: 'Williams_Electric_COI.pdf', file_size_bytes: 720000, created_at: '2025-11-15T10:30:00', expiry_date: '2026-04-01', status: 'active', project_name: null, vendor_name: 'Williams Electric', uploaded_by: 'Sarah Chen' },
  { id: 8, title: 'Framing Invoice #1247', doc_type: 'invoice', file_name: 'INV_1247_CarolinaFraming.pdf', file_size_bytes: 145000, created_at: '2026-02-18T09:15:00', expiry_date: null, status: 'active', project_name: 'PRJ-042 Riverside Custom', vendor_name: 'Carolina Framing Co', uploaded_by: 'Derek Hall' },
  { id: 9, title: 'Site Photo -- Foundation Pour', doc_type: 'photo', file_name: 'IMG_20260215_foundation.jpg', file_size_bytes: 4200000, created_at: '2026-02-15T15:45:00', expiry_date: null, status: 'active', project_name: 'PRJ-051 Lakeshore Reno', vendor_name: null, uploaded_by: 'Jake Torres' },
  { id: 10, title: 'ABC Plumbing Lien Waiver', doc_type: 'lien_waiver', file_name: 'LienWaiver_ABC_Jan2026.pdf', file_size_bytes: 210000, created_at: '2026-01-31T11:00:00', expiry_date: null, status: 'active', project_name: 'PRJ-042 Riverside Custom', vendor_name: 'ABC Plumbing LLC', uploaded_by: 'Mike Sullivan' },
  { id: 11, title: 'SE HVAC COI Renewal', doc_type: 'coi', file_name: 'SEHVAC_COI_2026.pdf', file_size_bytes: 890000, created_at: '2026-01-05T14:00:00', expiry_date: '2026-06-30', status: 'active', project_name: null, vendor_name: 'SE HVAC Services', uploaded_by: 'Sarah Chen' },
  { id: 12, title: 'Miller Concrete W-9', doc_type: 'w9', file_name: 'MillerConcrete_W9.pdf', file_size_bytes: 165000, created_at: '2025-06-15T09:00:00', expiry_date: null, status: 'active', project_name: null, vendor_name: 'Miller Concrete', uploaded_by: 'Sarah Chen' },
  { id: 13, title: 'Electrical Permit #EP-2025-312', doc_type: 'permit', file_name: 'ElecPermit_EP2025312.pdf', file_size_bytes: 380000, created_at: '2025-10-05T10:30:00', expiry_date: '2026-04-05', status: 'active', project_name: 'PRJ-038 Mountain View', vendor_name: null, uploaded_by: 'Jake Torres' },
  { id: 14, title: 'PRJ-051 Structural Plans', doc_type: 'plans', file_name: 'PRJ051_Structural_v2.pdf', file_size_bytes: 22400000, created_at: '2026-02-01T08:30:00', expiry_date: null, status: 'active', project_name: 'PRJ-051 Lakeshore Reno', vendor_name: null, uploaded_by: 'Mike Sullivan' },
  { id: 15, title: 'PRJ-044 Subcontract -- HVAC', doc_type: 'contract', file_name: 'PRJ044_SubK_HVAC.pdf', file_size_bytes: 1800000, created_at: '2026-01-20T13:00:00', expiry_date: null, status: 'active', project_name: 'PRJ-044 Downtown Office', vendor_name: 'SE HVAC Services', uploaded_by: 'Mike Sullivan' },
  { id: 16, title: 'Site Photo -- Steel Erection', doc_type: 'photo', file_name: 'IMG_20260220_steel.jpg', file_size_bytes: 5100000, created_at: '2026-02-20T11:20:00', expiry_date: null, status: 'active', project_name: 'PRJ-044 Downtown Office', vendor_name: null, uploaded_by: 'Derek Hall' },
  { id: 17, title: 'Plumbing Invoice #3891', doc_type: 'invoice', file_name: 'INV_3891_ABCPlumbing.pdf', file_size_bytes: 132000, created_at: '2026-02-12T16:45:00', expiry_date: null, status: 'active', project_name: 'PRJ-042 Riverside Custom', vendor_name: 'ABC Plumbing LLC', uploaded_by: 'Derek Hall' },
  { id: 18, title: 'Change Order #2 -- PRJ-051', doc_type: 'change_order', file_name: 'CO2_PRJ051.pdf', file_size_bytes: 275000, created_at: '2026-02-08T10:00:00', expiry_date: null, status: 'active', project_name: 'PRJ-051 Lakeshore Reno', vendor_name: 'Miller Concrete', uploaded_by: 'Mike Sullivan' },
];

const demoExpiring = [
  { id: 2, title: 'ABC Plumbing COI 2026', doc_type: 'coi', expiry_date: '2026-03-15', file_name: 'ABC_Plumbing_COI_2026.pdf', status: 'active', vendor_name: 'ABC Plumbing LLC' },
  { id: 7, title: 'Williams Electric COI', doc_type: 'coi', expiry_date: '2026-04-01', file_name: 'Williams_Electric_COI.pdf', status: 'active', vendor_name: 'Williams Electric' },
  { id: 13, title: 'Electrical Permit #EP-2025-312', doc_type: 'permit', expiry_date: '2026-04-05', file_name: 'ElecPermit_EP2025312.pdf', status: 'active', project_name: 'PRJ-038 Mountain View' },
  { id: 4, title: 'Building Permit #BP-2025-4421', doc_type: 'permit', expiry_date: '2026-09-10', file_name: 'Permit_BP20254421.pdf', status: 'active', project_name: 'PRJ-042 Riverside Custom' },
];

const demoRecentUploads = [
  { id: 16, title: 'Site Photo -- Steel Erection', doc_type: 'photo', file_name: 'IMG_20260220_steel.jpg', file_size_bytes: 5100000, created_at: '2026-02-20T11:20:00', uploaded_by: 'Derek Hall', project_name: 'PRJ-044 Downtown Office' },
  { id: 8, title: 'Framing Invoice #1247', doc_type: 'invoice', file_name: 'INV_1247_CarolinaFraming.pdf', file_size_bytes: 145000, created_at: '2026-02-18T09:15:00', uploaded_by: 'Derek Hall', project_name: 'PRJ-042 Riverside Custom' },
  { id: 9, title: 'Site Photo -- Foundation Pour', doc_type: 'photo', file_name: 'IMG_20260215_foundation.jpg', file_size_bytes: 4200000, created_at: '2026-02-15T15:45:00', uploaded_by: 'Jake Torres', project_name: 'PRJ-051 Lakeshore Reno' },
  { id: 17, title: 'Plumbing Invoice #3891', doc_type: 'invoice', file_name: 'INV_3891_ABCPlumbing.pdf', file_size_bytes: 132000, created_at: '2026-02-12T16:45:00', uploaded_by: 'Derek Hall', project_name: 'PRJ-042 Riverside Custom' },
  { id: 6, title: 'Change Order #7 -- PRJ-042', doc_type: 'change_order', file_name: 'CO7_PRJ042.pdf', file_size_bytes: 320000, created_at: '2026-02-10T16:00:00', uploaded_by: 'Mike Sullivan', project_name: 'PRJ-042 Riverside Custom' },
];

const TAG_SUGGESTIONS = {
  contract: ['Signed', 'Draft', 'Amendment', 'Subcontract', 'GC'],
  coi: ['General Liability', 'Workers Comp', 'Auto', 'Umbrella', 'Renewal'],
  permit: ['Building', 'Electrical', 'Plumbing', 'Mechanical', 'Demolition'],
  invoice: ['Approved', 'Pending', 'Disputed', 'Paid', 'Partial'],
  photo: ['Progress', 'Issue', 'Completion', 'Inspection', 'Safety'],
  plans: ['Architectural', 'Structural', 'MEP', 'Site', 'As-Built'],
  w9: ['Current', 'Pending Review'],
  lien_waiver: ['Conditional', 'Unconditional', 'Partial', 'Final'],
  change_order: ['Approved', 'Pending', 'Owner-Initiated', 'Field'],
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

function formatBytes(bytes) {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryBadge(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return null;
  if (days < 0) return { label: 'EXPIRED', bg: 'color-mix(in srgb, var(--status-loss) 15%, transparent)', color: 'var(--status-loss)' };
  if (days <= 30) return { label: `${days}d`, bg: 'color-mix(in srgb, var(--status-loss) 15%, transparent)', color: 'var(--status-loss)' };
  if (days <= 60) return { label: `${days}d`, bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' };
  if (days <= 90) return { label: `${days}d`, bg: 'var(--status-profit-bg)', color: 'var(--status-profit)' };
  return null;
}

function timeAgo(dateStr) {
  if (!dateStr) return '--';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return shortDate(dateStr);
}

/* ── View Tabs ────────────────────────────────────────────────────────── */

const VIEW_TABS = [
  { key: 'folders', label: 'Folders', icon: FolderOpen },
  { key: 'list',    label: 'List',    icon: List },
  { key: 'search',  label: 'Search',  icon: Search },
];

/* ── Main Component ───────────────────────────────────────────────────── */

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL type param
  const urlType = searchParams.get('type');
  const mappedUrlType = urlType ? (URL_TYPE_MAP[urlType] || urlType) : null;

  const [view, setView] = useState(mappedUrlType ? 'list' : 'folders');
  const [activeType, setActiveType] = useState(mappedUrlType || null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadDocType, setUploadDocType] = useState('');

  const fileInputRef = useRef(null);

  // API calls
  const { data: types, loading, error, isDemo } = useApi(() => api.documentTypes(), []);
  const docTypes = types || (loading ? [] : demoFolders);

  const { data: docsData } = useApi(
    () => api.documents({
      ...(activeType && { doc_type: activeType }),
      ...(search && { search }),
    }),
    [activeType, search]
  );

  const allDocs = docsData || (loading ? [] : demoDocs);

  const { data: expiringData } = useApi(() => api.documentsExpiring({ days: 90 }), []);
  const expiring = expiringData || demoExpiring;

  // Compute total count
  const totalDocs = docTypes.reduce((s, t) => s + t.count, 0);

  // Build filtered document list
  const filteredDocs = useMemo(() => {
    let result = allDocs;

    if (activeType) {
      result = result.filter(d => d.doc_type === activeType);
    }
    if (typeFilter) {
      result = result.filter(d => d.doc_type === typeFilter);
    }
    if (projectFilter) {
      result = result.filter(d => d.project_name === projectFilter);
    }
    if (vendorFilter) {
      result = result.filter(d => d.vendor_name === vendorFilter);
    }
    if (dateFrom) {
      result = result.filter(d => d.created_at && d.created_at >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(d => d.created_at && d.created_at <= dateTo + 'T23:59:59');
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.file_name || '').toLowerCase().includes(q) ||
        (d.project_name || '').toLowerCase().includes(q) ||
        (d.vendor_name || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [allDocs, activeType, typeFilter, projectFilter, vendorFilter, dateFrom, dateTo, search]);

  // Handlers
  const handleFolderClick = useCallback((docType) => {
    setActiveType(docType);
    setView('list');
    setSearchParams({ type: docType });
  }, [setSearchParams]);

  const handleBackToFolders = useCallback(() => {
    setActiveType(null);
    setView('folders');
    setSearchParams({});
    setPreviewDoc(null);
  }, [setSearchParams]);

  const handleViewChange = useCallback((v) => {
    setView(v);
    if (v === 'folders') {
      setActiveType(null);
      setSearchParams({});
      setPreviewDoc(null);
    }
    if (v === 'search') {
      setActiveType(null);
      setSearchParams({});
    }
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setTypeFilter('');
    setProjectFilter('');
    setVendorFilter('');
    setDateFrom('');
    setDateTo('');
  }, []);

  const hasFilters = typeFilter || projectFilter || vendorFilter || dateFrom || dateTo;

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadFiles(files);
      setShowUploadZone(true);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadFiles(files);
      setShowUploadZone(true);
    }
  }, []);

  if (loading) return <PageLoading />;
  if (error && !docTypes.length) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            DOCUMENT VAULT
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {totalDocs.toLocaleString()} documents across {docTypes.length} categories
          </p>
        </div>
        <button
          onClick={() => {
            setShowUploadZone(true);
            setUploadFiles([]);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {/* ── View Toggle ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bg-elevated)' }}>
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = view === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleViewChange(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: isActive ? 'var(--color-brand-card)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  border: isActive ? '1px solid var(--color-brand-border)' : '1px solid transparent',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick search on list/search views */}
        {(view === 'list' || view === 'search') && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}
          >
            <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)', width: 220 }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Expiration Tracking Banner ─────────────────────────────── */}
      {expiring.length > 0 && view === 'folders' && (
        <div
          className="rounded-lg p-4"
          style={{
            background: 'var(--status-warning-bg)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--status-warning)' }}>
              Expiring Soon -- COIs & Permits
            </span>
          </div>
          <div className="space-y-1.5">
            {expiring.map((d) => {
              const badge = expiryBadge(d.expiry_date);
              const Icon = DOC_TYPE_ICONS[d.doc_type] || File;
              return (
                <div key={d.id} className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-primary)' }}>
                  <Icon size={13} style={{ color: DOC_TYPE_COLORS[d.doc_type] || 'var(--accent)', flexShrink: 0 }} />
                  <span className="font-medium">{d.title}</span>
                  {d.vendor_name && (
                    <span style={{ color: 'var(--text-tertiary)' }}>{d.vendor_name}</span>
                  )}
                  {d.project_name && (
                    <span style={{ color: 'var(--text-tertiary)' }}>{d.project_name}</span>
                  )}
                  {badge && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  )}
                  <span style={{ color: 'var(--status-warning)' }}>
                    expires {shortDate(d.expiry_date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Upload Zone Modal ──────────────────────────────────────── */}
      {showUploadZone && (
        <UploadZone
          files={uploadFiles}
          docType={uploadDocType}
          setDocType={setUploadDocType}
          onClose={() => { setShowUploadZone(false); setUploadFiles([]); setUploadDocType(''); }}
          onFileSelect={handleFileSelect}
          fileInputRef={fileInputRef}
          dragOver={dragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      )}

      {/* ── Filter Bar (list & search views) ───────────────────────── */}
      {(view === 'list' || view === 'search') && (
        <FilterBar
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          projectFilter={projectFilter} setProjectFilter={setProjectFilter}
          vendorFilter={vendorFilter} setVendorFilter={setVendorFilter}
          dateFrom={dateFrom} setDateFrom={setDateFrom}
          dateTo={dateTo} setDateTo={setDateTo}
          hasFilters={hasFilters} clearFilters={clearFilters}
          activeType={activeType}
        />
      )}

      {/* ── Folder View ────────────────────────────────────────────── */}
      {view === 'folders' && !activeType && (
        <>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {docTypes.map((t) => {
              const Icon = DOC_TYPE_ICONS[t.doc_type] || File;
              const accentColor = DOC_TYPE_COLORS[t.doc_type] || 'var(--accent)';
              return (
                <div
                  key={t.doc_type}
                  className="rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--color-brand-card)',
                    border: '1px solid var(--color-brand-border)',
                  }}
                  onClick={() => handleFolderClick(t.doc_type)}
                >
                  <div className="flex justify-center mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
                    >
                      <Icon size={24} style={{ color: accentColor }} />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-center" style={{ color: 'var(--text-primary)' }}>
                    {DOC_TYPE_LABELS[t.doc_type] || t.doc_type}
                  </div>
                  <div className="text-lg font-bold text-center mt-0.5" style={{ color: accentColor }}>
                    {t.count}
                  </div>
                  <div className="text-[10px] text-center uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    document{t.count !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Uploads Section */}
          <RecentUploads
            docs={demoRecentUploads}
            onPreview={(doc) => setPreviewDoc(doc)}
          />
        </>
      )}

      {/* ── List View (with optional type filter from folder click) ── */}
      {(view === 'list' || (view === 'folders' && activeType)) && (
        <div className="space-y-4">
          {activeType && (
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToFolders}
                className="flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                <ChevronLeft size={16} /> Back to folders
              </button>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = DOC_TYPE_ICONS[activeType] || File;
                  return <Icon size={16} style={{ color: DOC_TYPE_COLORS[activeType] || 'var(--accent)' }} />;
                })()}
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {DOC_TYPE_LABELS[activeType] || activeType}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
                  {filteredDocs.length}
                </span>
              </div>
            </div>
          )}

          <DocumentTable
            docs={filteredDocs}
            onPreview={(doc) => setPreviewDoc(doc)}
            showType={!activeType}
          />
        </div>
      )}

      {/* ── Search View ────────────────────────────────────────────── */}
      {view === 'search' && (
        <div className="space-y-4">
          {!search && !hasFilters ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
              >
                <Search size={28} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Search across all {totalDocs.toLocaleString()} documents
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Search by filename, title, project, or vendor name
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {filteredDocs.length} result{filteredDocs.length !== 1 ? 's' : ''} found
                {search && <> for "<span style={{ color: 'var(--text-primary)' }}>{search}</span>"</>}
              </div>
              <DocumentTable
                docs={filteredDocs}
                onPreview={(doc) => setPreviewDoc(doc)}
                showType
              />
            </>
          )}
        </div>
      )}

      {/* ── Document Preview Panel ─────────────────────────────────── */}
      {previewDoc && (
        <PreviewPanel
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

/* ── Filter Bar Component ─────────────────────────────────────────────── */

function FilterBar({
  typeFilter, setTypeFilter,
  projectFilter, setProjectFilter,
  vendorFilter, setVendorFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  hasFilters, clearFilters,
  activeType,
}) {
  const selectStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />

      {!activeType && (
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs outline-none"
          style={selectStyle}
        >
          <option value="">All Types</option>
          {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      )}

      <select
        value={projectFilter}
        onChange={(e) => setProjectFilter(e.target.value)}
        className="px-2 py-1.5 rounded-lg text-xs outline-none"
        style={selectStyle}
      >
        <option value="">All Projects</option>
        {DEMO_PROJECTS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={vendorFilter}
        onChange={(e) => setVendorFilter(e.target.value)}
        className="px-2 py-1.5 rounded-lg text-xs outline-none"
        style={selectStyle}
      >
        <option value="">All Vendors</option>
        {DEMO_VENDORS.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>

      <div className="flex items-center gap-1">
        <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs outline-none"
          style={selectStyle}
          title="From date"
        />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs outline-none"
          style={selectStyle}
          title="To date"
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}

/* ── Document Table ───────────────────────────────────────────────────── */

function DocumentTable({ docs, onPreview, showType }) {
  if (docs.length === 0) {
    return <EmptyState title="No documents found" message="Try adjusting your filters or search terms" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="mc-table">
        <thead>
          <tr>
            <th>Document</th>
            {showType && <th>Type</th>}
            <th>Project</th>
            <th>Vendor</th>
            <th>Uploaded</th>
            <th>Size</th>
            <th>Uploaded By</th>
            <th>Expires</th>
            <th style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => {
            const Icon = DOC_TYPE_ICONS[doc.doc_type] || File;
            const accentColor = DOC_TYPE_COLORS[doc.doc_type] || 'var(--accent)';
            const isExpiringSoon = doc.expiry_date && daysUntil(doc.expiry_date) <= 60;
            const badge = doc.expiry_date ? expiryBadge(doc.expiry_date) : null;

            return (
              <tr key={doc.id} className="cursor-pointer" onClick={() => onPreview(doc)}>
                <td>
                  <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: accentColor, flexShrink: 0 }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)', maxWidth: 280 }}>
                        {doc.title}
                      </div>
                      <div className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)', maxWidth: 280 }}>
                        {doc.file_name}
                      </div>
                    </div>
                  </div>
                </td>
                {showType && (
                  <td>
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                        color: accentColor,
                      }}
                    >
                      {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                    </span>
                  </td>
                )}
                <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {doc.project_name || '--'}
                </td>
                <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {doc.vendor_name || '--'}
                </td>
                <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {doc.created_at ? shortDate(doc.created_at) : '--'}
                </td>
                <td className="text-xs num" style={{ color: 'var(--text-secondary)' }}>
                  {formatBytes(doc.file_size_bytes)}
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <User size={11} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {doc.uploaded_by || '--'}
                    </span>
                  </div>
                </td>
                <td>
                  {doc.expiry_date ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs" style={{ color: isExpiringSoon ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                        {shortDate(doc.expiry_date)}
                      </span>
                      {badge && (
                        <span
                          className="text-[9px] font-bold px-1 py-0.5 rounded"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>--</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      title="Preview"
                      onClick={() => onPreview(doc)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Recent Uploads ───────────────────────────────────────────────────── */

function RecentUploads({ docs, onPreview }) {
  if (!docs || docs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} style={{ color: 'var(--accent)' }} />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          Recent Uploads
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {docs.map((doc) => {
          const Icon = DOC_TYPE_ICONS[doc.doc_type] || File;
          const accentColor = DOC_TYPE_COLORS[doc.doc_type] || 'var(--accent)';
          return (
            <div
              key={doc.id}
              className="rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01]"
              style={{
                background: 'var(--color-brand-card)',
                border: '1px solid var(--color-brand-border)',
              }}
              onClick={() => onPreview(doc)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
                >
                  <Icon size={16} style={{ color: accentColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {doc.title}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {doc.file_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {timeAgo(doc.created_at)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {doc.uploaded_by}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Preview Panel ────────────────────────────────────────────────────── */

function PreviewPanel({ doc, onClose }) {
  const Icon = DOC_TYPE_ICONS[doc.doc_type] || File;
  const accentColor = DOC_TYPE_COLORS[doc.doc_type] || 'var(--accent)';
  const badge = doc.expiry_date ? expiryBadge(doc.expiry_date) : null;
  const tags = TAG_SUGGESTIONS[doc.doc_type] || [];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full overflow-y-auto"
        style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--color-brand-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Header */}
        <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
          style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--color-brand-border)' }}
        >
          <div className="flex items-center gap-2">
            <Eye size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Document Preview</span>
          </div>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-tertiary)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* File Preview Placeholder */}
          <div
            className="rounded-lg flex flex-col items-center justify-center py-12"
            style={{
              background: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
              border: `1px dashed color-mix(in srgb, ${accentColor} 30%, transparent)`,
            }}
          >
            <Icon size={48} style={{ color: accentColor, opacity: 0.6 }} />
            <span className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
              {doc.doc_type === 'photo' ? 'Image Preview' : 'Document Preview'}
            </span>
            <span className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {doc.file_name}
            </span>
          </div>

          {/* Title & Type */}
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{doc.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                  color: accentColor,
                }}
              >
                {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
              </span>
              {doc.status && (
                <span
                  className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    background: doc.status === 'active' ? 'var(--status-profit-bg)' : 'var(--bg-elevated)',
                    color: doc.status === 'active' ? 'var(--status-profit)' : 'var(--text-tertiary)',
                  }}
                >
                  {doc.status}
                </span>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
          >
            <MetaRow icon={File} label="Filename" value={doc.file_name} />
            <MetaRow icon={HardDrive} label="Size" value={formatBytes(doc.file_size_bytes)} />
            <MetaRow icon={Calendar} label="Uploaded" value={doc.created_at ? shortDate(doc.created_at) : '--'} />
            <MetaRow icon={User} label="Uploaded By" value={doc.uploaded_by || '--'} />
            {doc.project_name && <MetaRow icon={Folder} label="Project" value={doc.project_name} />}
            {doc.vendor_name && <MetaRow icon={FileText} label="Vendor" value={doc.vendor_name} />}
            {doc.expiry_date && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={12} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Expires</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: badge ? badge.color : 'var(--text-primary)' }}>
                    {shortDate(doc.expiry_date)}
                  </span>
                  {badge && (
                    <span
                      className="text-[9px] font-bold px-1 py-0.5 rounded"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Auto-Tag Suggestions */}
          {tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag size={12} style={{ color: 'var(--accent)' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Suggested Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className="text-[10px] px-2 py-1 rounded-full font-medium transition-colors"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Download size={14} /> Download
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{
                background: 'var(--color-brand-card)',
                border: '1px solid var(--color-brand-border)',
                color: 'var(--text-primary)',
              }}
            >
              <Eye size={14} /> Open Full
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Meta Row ─────────────────────────────────────────────────────────── */

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color: 'var(--text-tertiary)' }} />
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <span className="text-xs font-medium truncate ml-4" style={{ color: 'var(--text-primary)', maxWidth: 200, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

/* ── Upload Zone ──────────────────────────────────────────────────────── */

function UploadZone({ files, docType, setDocType, onClose, onFileSelect, fileInputRef, dragOver, onDragOver, onDragLeave, onDrop }) {
  const tags = docType ? (TAG_SUGGESTIONS[docType] || []) : [];
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'var(--color-brand-card)',
        border: dragOver
          ? '2px dashed var(--accent)'
          : '1px solid var(--color-brand-border)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
        <div className="flex items-center gap-2">
          <FilePlus size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Upload Documents</span>
        </div>
        <button onClick={onClose} className="p-1" style={{ color: 'var(--text-tertiary)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Drop zone */}
        <div
          className="rounded-lg py-10 flex flex-col items-center gap-3 transition-colors"
          style={{
            background: dragOver
              ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
              : 'var(--bg-elevated)',
            border: dragOver
              ? '2px dashed var(--accent)'
              : '2px dashed var(--border-medium)',
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <UploadCloud size={36} style={{ color: dragOver ? 'var(--accent)' : 'var(--text-tertiary)' }} />
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Drag and drop files here, or
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onFileSelect}
          />
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            PDF, JPG, PNG, DOC, XLS up to 50MB
          </span>
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </span>
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                </div>
                <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-tertiary)' }}>
                  {formatBytes(f.size)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Document type selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>Document Type</label>
          <select
            value={docType}
            onChange={(e) => { setDocType(e.target.value); setSelectedTags([]); }}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Select type...</option>
            {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Auto-tag suggestions */}
        {tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag size={12} style={{ color: 'var(--accent)' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Auto-Tag Suggestions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="text-[10px] px-2 py-1 rounded-full font-medium transition-colors"
                    style={{
                      background: isSelected
                        ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                        : 'var(--bg-elevated)',
                      border: isSelected
                        ? '1px solid var(--accent)'
                        : '1px solid var(--border-medium)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {isSelected ? <CheckCircle size={10} className="inline mr-0.5" style={{ marginBottom: 1 }} /> : '+'}{' '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload button */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-opacity"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              opacity: files.length === 0 ? 0.5 : 1,
            }}
            disabled={files.length === 0}
          >
            <Upload size={14} /> Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
