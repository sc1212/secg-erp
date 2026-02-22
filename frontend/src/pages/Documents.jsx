import { useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { ErrorState, PageLoading } from '../components/LoadingState';

const folderTypes = ['contract', 'plans', 'coi', 'w9', 'lien_waiver', 'permit', 'photo', 'change_order', 'invoice'];

export default function Documents() {
  const [docType, setDocType] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { data, loading, error, refetch } = useApi(() => api.documents({ ...(docType && { doc_type: docType }) }), [docType]);

  const rows = useMemo(() => {
    const items = data?.items || [];
    return query ? items.filter((d) => d.title.toLowerCase().includes(query.toLowerCase())) : items;
  }, [data, query]);

  async function onUpload(file) {
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadDocument(file);
      refetch();
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  const counts = Object.fromEntries(folderTypes.map((t) => [t, (data?.items || []).filter((d) => d.doc_type === t).length]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Vault</h1>
        <label className="px-3 py-2 rounded-lg bg-brand-gold text-brand-bg text-sm font-semibold cursor-pointer">⬆️ Upload
          <input type="file" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {folderTypes.map((t) => (
          <button key={t} onClick={() => setDocType(t)} className={`text-left bg-brand-card border rounded-lg p-3 ${docType === t ? 'border-brand-gold' : 'border-brand-border'}`}>
            <div className="font-medium capitalize">📁 {t.replace('_', ' ')}</div>
            <div className="text-xs text-brand-muted">{counts[t]} files</div>
          </button>
        ))}
      </div>

      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search filenames..." className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm w-64" />
          {uploading && <span className="text-xs text-brand-muted">Uploading...</span>}
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-brand-muted border-b border-brand-border">
            <tr><th className="p-2 text-left">Filename</th><th className="p-2 text-left">Type</th><th className="p-2 text-left">Project</th><th className="p-2 text-left">Uploaded</th><th className="p-2 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-brand-border/50 hover:bg-brand-card-hover">
                <td className="p-2">{d.title}</td>
                <td className="p-2 capitalize">{d.doc_type?.replace('_', ' ')}</td>
                <td className="p-2">{d.project_id ? `#${d.project_id}` : '—'}</td>
                <td className="p-2">{shortDate(d.created_at)}</td>
                <td className="p-2">
                  <button onClick={() => setSelected(d)} className="text-brand-gold text-xs mr-2">Preview</button>
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs">Download</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[520px] bg-brand-surface border-l border-brand-border p-4 z-50">
          <div className="flex items-center justify-between"><h3 className="font-semibold">{selected.title}</h3><button onClick={() => setSelected(null)}>✕</button></div>
          <div className="mt-2 text-xs text-brand-muted">{selected.mime_type || selected.doc_type}</div>
          {selected.file_url?.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? <img src={selected.file_url} alt={selected.title} className="mt-3 rounded border border-brand-border" /> : <iframe title={selected.title} src={selected.file_url} className="mt-3 w-full h-[80vh] border border-brand-border rounded" />}
        </div>
      )}
    </div>
  );
}
