import { useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { ErrorState, PageLoading } from '../components/LoadingState';

const PHOTO_PROMPTS_BY_PHASE = {
  framing: [
    { label: 'Overall Site', description: 'Wide shot showing framing progress from street', required: true },
    { label: 'Framing Detail', description: 'Close-up of wall framing, headers, connections', required: true },
    { label: 'Sheathing Progress', description: 'Exterior sheathing/wrap installation', required: true },
    { label: 'Roof Framing', description: 'Truss/rafter installation progress', required: true },
    { label: 'Safety Setup', description: 'Fall protection, scaffolding, warning tape', required: true },
    { label: 'Material Delivery', description: 'Any materials delivered today', required: false },
  ],
};

export default function DailyLogs() {
  const { data, loading, error, refetch } = useApi(() => api.dailyLogFeed(7));
  const { data: projectsData } = useApi(() => api.projects({ limit: 20 }), []);
  const { data: employeesData } = useApi(() => api.employees(true), []);

  const [projectId, setProjectId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [work, setWork] = useState('');
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState({});
  const [extras, setExtras] = useState([]);

  const rows = data?.items || [];
  const projects = projectsData?.items || [];
  const employees = employeesData?.items || [];
  const selectedProject = projects.find((p) => String(p.id) === projectId);
  const phase = selectedProject?.phase || 'framing';
  const prompts = PHOTO_PROMPTS_BY_PHASE[phase] || PHOTO_PROMPTS_BY_PHASE.framing;

  const requiredCount = useMemo(() => prompts.filter((p) => p.required).length, [prompts]);
  const requiredDone = useMemo(() => prompts.filter((p) => p.required && photos[p.label]).length, [prompts, photos]);

  async function submit(e, force = false) {
    e.preventDefault();
    if (!projectId || !authorId) return;
    if (!force && requiredDone < requiredCount) {
      const yes = window.confirm(`${requiredCount - requiredDone} required photos are missing. Submit anyway?`);
      if (!yes) return;
    }
    setSaving(true);
    try {
      await api.createProjectDailyLog(Number(projectId), {
        log_date: new Date().toISOString().slice(0, 10),
        author_id: Number(authorId),
        work_performed: work,
      });
      setWork('');
      setPhotos({});
      setExtras([]);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Daily Logs</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-brand-card border border-brand-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm">
            <option value="">Select project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name || p.code || `Project ${p.id}`}</option>)}
          </select>
          <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm">
            <option value="">Author</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </select>
          <input value={work} onChange={(e) => setWork(e.target.value)} placeholder="Work performed" className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm" />
          <button disabled={saving} className="bg-brand-gold text-brand-bg rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Create Log'}</button>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">📸 Photos</h3>
            <span className="text-xs text-brand-muted">Uploaded: {requiredDone} of {requiredCount} required · {extras.length} additional</span>
          </div>
          <p className="text-xs text-brand-muted">Required photos for today · phase: <span className="capitalize">{phase.replace('_', ' ')}</span></p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {prompts.map((prompt) => {
              const file = photos[prompt.label];
              return (
                <label key={prompt.label} className={`border rounded-lg p-3 cursor-pointer ${prompt.required ? (file ? 'border-ok' : 'border-danger') : 'border-dashed border-brand-border'}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotos((prev) => ({ ...prev, [prompt.label]: e.target.files?.[0] || null }))} />
                  <div className="text-xs font-medium">{file ? '✅ Done' : '📷'} {prompt.label}</div>
                  <div className="text-[11px] text-brand-muted mt-1">{prompt.description}</div>
                </label>
              );
            })}
          </div>

          <label className="block border border-brand-border rounded-lg p-3 cursor-pointer text-sm">
            + Add Photos (tap to capture or select from gallery)
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setExtras(Array.from(e.target.files || []))} />
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-3 py-2 rounded-lg bg-brand-gold text-brand-bg text-sm font-semibold">Submit Log</button>
            <button type="button" onClick={(e) => submit(e, true)} disabled={saving} className="px-3 py-2 rounded-lg border border-brand-border text-sm">Submit Incomplete</button>
          </div>
        </div>
      </form>

      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <div className="text-sm font-semibold mb-3">Recent logs (last 7 days)</div>
        <div className="space-y-2">
          {rows.length === 0 && <div className="text-sm text-brand-muted">No logs yet.</div>}
          {rows.map((r) => (
            <button key={r.id} className="w-full text-left bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm hover:bg-brand-card-hover">
              <div className="flex justify-between"><span className={r.status === 'submitted' ? 'text-ok' : 'text-warn'}>{r.status === 'submitted' ? '✅' : '⚠️'} Project #{r.project_id}</span><span className="text-brand-muted">{r.log_date}</span></div>
              <div className="text-brand-muted text-xs">Author #{r.author_id}</div>
              <div>{r.work_performed || 'No work note entered.'}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
