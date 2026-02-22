import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { FileText, Upload, Search, FolderOpen, AlertTriangle, Image, Shield, Receipt, File, ChevronLeft } from 'lucide-react';

const DOC_TYPE_ICONS = {
  contract: FileText, plans: File, permit: Shield, coi: Shield,
  lien_waiver: FileText, inspection_report: FileText, photo: Image,
  change_order: FileText, draw_package: FileText, proposal: FileText,
  w9: FileText, invoice: Receipt, warranty: Shield,
  punch_list: FileText, safety_report: Shield, other: File,
};

const DOC_TYPE_LABELS = {
  contract: 'Contracts', plans: 'Plans & Drawings', permit: 'Permits',
  coi: 'Insurance (COIs)', lien_waiver: 'Lien Waivers', inspection_report: 'Inspection Reports',
  photo: 'Photos', change_order: 'Change Orders', draw_package: 'Draw Packages',
  proposal: 'Proposals', w9: 'W-9s', invoice: 'Invoices',
  warranty: 'Warranties', punch_list: 'Punch Lists', safety_report: 'Safety Reports',
  other: 'Other Documents',
};

const demoTypes = [
  { doc_type: 'contract', count: 8 },
  { doc_type: 'plans', count: 24 },
  { doc_type: 'permit', count: 6 },
  { doc_type: 'coi', count: 12 },
  { doc_type: 'photo', count: 89 },
  { doc_type: 'change_order', count: 14 },
  { doc_type: 'invoice', count: 32 },
  { doc_type: 'lien_waiver', count: 18 },
  { doc_type: 'w9', count: 9 },
  { doc_type: 'warranty', count: 4 },
];

const demoDocs = [
  { id: 1, title: 'PRJ-042 General Contract', doc_type: 'contract', file_name: 'PRJ042_Contract_Final.pdf', file_size_bytes: 2400000, created_at: '2025-08-15T10:00:00', expiry_date: null, status: 'active', project_id: 1 },
  { id: 2, title: 'ABC Plumbing COI', doc_type: 'coi', file_name: 'ABC_Plumbing_COI_2026.pdf', file_size_bytes: 850000, created_at: '2025-12-01T14:30:00', expiry_date: '2026-03-15', status: 'active', vendor_id: 1 },
  { id: 3, title: 'PRJ-038 Architectural Plans', doc_type: 'plans', file_name: 'PRJ038_Plans_RevC.pdf', file_size_bytes: 15200000, created_at: '2025-10-20T09:00:00', expiry_date: null, status: 'active', project_id: 2 },
  { id: 4, title: 'Building Permit #BP-2025-4421', doc_type: 'permit', file_name: 'Permit_BP20254421.pdf', file_size_bytes: 420000, created_at: '2025-09-10T11:00:00', expiry_date: '2026-09-10', status: 'active', project_id: 1 },
  { id: 5, title: 'TN Electric W-9', doc_type: 'w9', file_name: 'TN_Electric_W9.pdf', file_size_bytes: 180000, created_at: '2025-07-01T08:00:00', expiry_date: null, status: 'active', vendor_id: 2 },
  { id: 6, title: 'Change Order #7 — PRJ-042', doc_type: 'change_order', file_name: 'CO7_PRJ042.pdf', file_size_bytes: 320000, created_at: '2026-02-10T16:00:00', expiry_date: null, status: 'active', project_id: 1 },
];

const demoExpiring = [
  { id: 2, title: 'ABC Plumbing COI', doc_type: 'coi', expiry_date: '2026-03-15', file_name: 'ABC_Plumbing_COI.pdf', status: 'active' },
  { id: 4, title: 'Building Permit #BP-2025-4421', doc_type: 'permit', expiry_date: '2026-09-10', file_name: 'Permit.pdf', status: 'active' },
];

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const [activeType, setActiveType] = useState(null);
  const [search, setSearch] = useState('');

  const { data: types, loading, error, isDemo } = useApi(() => api.documentTypes(), []);
  const docTypes = types || (loading ? [] : demoTypes);

  const { data: docsData } = useApi(
    () => activeType ? api.documents({ doc_type: activeType, ...(search && { search }) }) : null,
    [activeType, search]
  );
  const docs = docsData || (activeType ? demoDocs.filter(d => d.doc_type === activeType) : []);

  const { data: expiringData } = useApi(() => api.documentsExpiring({ days: 60 }), []);
  const expiring = expiringData || demoExpiring;

  if (loading) return <PageLoading />;
  if (error && !docTypes.length) return <ErrorState message={error} />;

  const totalDocs = docTypes.reduce((s, t) => s + t.count, 0);

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Document Vault</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{totalDocs} documents across {docTypes.length} categories</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium" style={{ background: 'var(--accent)', color: '#fff' }}>
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {/* Expiring alerts */}
      {expiring.length > 0 && !activeType && (
        <div className="rounded-lg p-4" style={{ background: 'var(--status-warning-bg)', border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} />
            <span className="text-xs font-bold uppercase" style={{ color: 'var(--status-warning)' }}>Expiring Soon</span>
          </div>
          <div className="space-y-1">
            {expiring.map((d) => (
              <div key={d.id} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium">{d.title}</span>
                <span style={{ color: 'var(--status-warning)' }}>expires {shortDate(d.expiry_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeType ? (
        /* Document List View */
        <div className="space-y-4">
          <button onClick={() => setActiveType(null)} className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
            <ChevronLeft size={16} /> Back to folders
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {DOC_TYPE_LABELS[activeType] || activeType}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}>
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)', width: 200 }}
              />
            </div>
          </div>

          {docs.length === 0 ? (
            <EmptyState title="No documents" message="No documents in this category yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => {
                    const Icon = DOC_TYPE_ICONS[doc.doc_type] || File;
                    const isExpiringSoon = doc.expiry_date && new Date(doc.expiry_date) < new Date(Date.now() + 30 * 86400000);
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Icon size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.title}</div>
                              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{doc.file_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-xs num" style={{ color: 'var(--text-secondary)' }}>{formatBytes(doc.file_size_bytes)}</td>
                        <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{doc.created_at ? shortDate(doc.created_at) : '—'}</td>
                        <td className="text-xs" style={{ color: isExpiringSoon ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                          {doc.expiry_date ? shortDate(doc.expiry_date) : '—'}
                          {isExpiringSoon && ' ⚠'}
                        </td>
                        <td>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded" style={{
                            background: doc.status === 'active' ? 'var(--status-profit-bg)' : 'var(--bg-elevated)',
                            color: doc.status === 'active' ? 'var(--status-profit)' : 'var(--text-tertiary)',
                          }}>
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Folder Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {docTypes.map((t) => {
            const Icon = DOC_TYPE_ICONS[t.doc_type] || File;
            return (
              <div
                key={t.doc_type}
                className="rounded-lg p-4 cursor-pointer transition-colors text-center"
                style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
                onClick={() => setActiveType(t.doc_type)}
              >
                <div className="flex justify-center mb-2" style={{ color: 'var(--accent)' }}>
                  <Icon size={28} />
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {DOC_TYPE_LABELS[t.doc_type] || t.doc_type}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {t.count} document{t.count !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
