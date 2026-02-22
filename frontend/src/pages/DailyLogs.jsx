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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { FileText, Camera, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const demoFeed = [
  { id: 1, project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood', log_date: todayISO(), author_id: 2, author_name: 'Connor M.', work_performed: 'Completed rough plumbing inspection. Passed all points. Started electrical rough-in on 2nd floor.', status: 'submitted', submitted_at: todayAt(16, 32), photo_count: 4 },
  { id: 2, project_id: 2, project_code: 'PRJ-038', project_name: 'Spec Home — Franklin', log_date: todayISO(), author_id: 3, author_name: 'Joseph K.', work_performed: 'Framing crew progress — 2nd floor joists complete. Trusses staged for Monday delivery.', status: 'submitted', submitted_at: todayAt(17, 15), photo_count: 7 },
  { id: 3, project_id: 3, project_code: 'PRJ-051', project_name: 'Remodel — Green Hills', log_date: todayISO(), author_id: 2, author_name: 'Connor M.', work_performed: 'Drywall hanging — 85% complete. Expecting finish by Wednesday.', status: 'submitted', submitted_at: todayAt(16, 45), photo_count: 3 },
  { id: 4, project_id: 4, project_code: 'PRJ-033', project_name: 'Insurance Rehab — Antioch', log_date: yesterdayISO(), author_id: 4, author_name: 'Jake R.', work_performed: 'Demo complete on master bath. Discovered water damage behind wall — took photos for insurance claim.', status: 'reviewed', submitted_at: yesterdayAt(15, 20), photo_count: 12 },
  { id: 5, project_id: 5, project_code: 'PRJ-027', project_name: 'Commercial — Berry Hill', log_date: yesterdayISO(), author_id: 5, author_name: 'Chris T.', work_performed: 'Interior finish work — trim and crown molding installation. Punch list items 60% resolved.', status: 'submitted', submitted_at: yesterdayAt(17, 0), photo_count: 5 },
];

function todayISO() { return new Date().toISOString().split('T')[0]; }
function yesterdayISO() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }
function todayAt(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); }
function yesterdayAt(h, m) { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(h, m, 0, 0); return d.toISOString(); }

const statusIcon = { draft: Clock, submitted: CheckCircle, reviewed: CheckCircle };
const statusColor = { draft: 'var(--text-tertiary)', submitted: 'var(--status-profit)', reviewed: 'var(--accent)' };

export default function DailyLogs() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data, loading, error, isDemo, refetch } = useApi(
    () => api.dailyLogFeed({ days: 14 }),
    []
  );

  const logs = data || (loading ? [] : demoFeed);

  const filtered = filter === 'all' ? logs : logs.filter((l) => {
    if (filter === 'today') return l.log_date === todayISO();
    if (filter === 'submitted') return l.status === 'submitted';
    if (filter === 'draft') return l.status === 'draft';
    return true;
  });

  // Group by date
  const grouped = {};
  for (const log of filtered) {
    if (!grouped[log.log_date]) grouped[log.log_date] = [];
    grouped[log.log_date].push(log);
  }

  if (loading) return <PageLoading />;
  if (error && !logs.length) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Field Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} log{filtered.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>
        <div className="flex gap-1">
          {['all', 'today', 'submitted', 'draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors"
              style={{
                background: filter === f ? 'var(--accent)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: filter === f ? 'none' : '1px solid var(--border-medium)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState title="No daily logs" message="No logs match the current filter" />
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([dateStr, dayLogs]) => (
            <div key={dateStr} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--text-tertiary)' }}>
                {dateStr === todayISO() ? 'Today' : dateStr === yesterdayISO() ? 'Yesterday' : shortDate(dateStr)}
              </h3>
              <div className="space-y-2">
                {dayLogs.map((log) => {
                  const Icon = statusIcon[log.status] || Clock;
                  return (
                    <div
                      key={log.id}
                      className="rounded-lg p-4 cursor-pointer transition-colors"
                      style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
                      onClick={() => navigate(`/projects/${log.project_id}?tab=daily-log`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon size={16} style={{ color: statusColor[log.status], flexShrink: 0 }} />
                          <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>{log.project_code}</span>
                          <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>— {log.author_name}</span>
                          {log.submitted_at && (
                            <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                              {new Date(log.submitted_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {log.photo_count > 0 && (
                          <div className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            <Camera size={12} /> {log.photo_count}
                          </div>
                        )}
                      </div>
                      {log.work_performed && (
                        <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                          {log.work_performed}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
