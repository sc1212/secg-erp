import { useState, useRef, useCallback } from 'react';
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
import {
  FileText, Camera, CheckCircle, AlertTriangle, Clock,
  Plus, X, Upload, Image, CloudSun, Users, ChevronDown,
  GripVertical,
} from 'lucide-react';

/* ── Phase Photo Prompts (Issue 7) ─────────────────────────────────────── */

const PHASE_PHOTO_PROMPTS = {
  'Foundation': ['Footings before pour', 'Rebar layout', 'Foundation forms', 'Foundation complete'],
  'Framing': ['Wall framing progress', 'Roof trusses', 'Sheathing complete', 'Window/door rough openings'],
  'Rough-In': ['Plumbing rough', 'Electrical rough', 'HVAC ductwork', 'Insulation'],
  'Drywall': ['Drywall hung', 'Tape & mud complete', 'Pre-paint inspection'],
  'Finish': ['Trim & millwork', 'Paint complete', 'Flooring installed', 'Fixtures installed'],
  'Exterior': ['Roofing complete', 'Siding/brick', 'Landscaping', 'Driveway/concrete'],
  'Final': ['Final walkthrough', 'Punch list items', 'Certificate of occupancy', 'Client handoff'],
};

const PHASE_LIST = Object.keys(PHASE_PHOTO_PROMPTS);

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const demoProjects = [
  { id: 1, code: 'PRJ-042', name: 'Custom Home -- Brentwood' },
  { id: 2, code: 'PRJ-038', name: 'Spec Home -- Franklin' },
  { id: 3, code: 'PRJ-051', name: 'Remodel -- Green Hills' },
  { id: 4, code: 'PRJ-033', name: 'Insurance Rehab -- Antioch' },
  { id: 5, code: 'PRJ-027', name: 'Commercial -- Berry Hill' },
];

const WEATHER_OPTIONS = ['Sunny', 'Partly Cloudy', 'Overcast', 'Rain', 'Snow', 'Windy', 'Fog', 'Storms'];

const demoFeed = [
  { id: 1, project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood', log_date: todayISO(), author_id: 2, author_name: 'Connor M.', work_performed: 'Completed rough plumbing inspection. Passed all points. Started electrical rough-in on 2nd floor.', status: 'submitted', submitted_at: todayAt(16, 32), photo_count: 4 },
  { id: 2, project_id: 2, project_code: 'PRJ-038', project_name: 'Spec Home — Franklin', log_date: todayISO(), author_id: 3, author_name: 'Joseph K.', work_performed: 'Framing crew progress — 2nd floor joists complete. Trusses staged for Monday delivery.', status: 'submitted', submitted_at: todayAt(17, 15), photo_count: 7 },
  { id: 3, project_id: 3, project_code: 'PRJ-051', project_name: 'Remodel — Green Hills', log_date: todayISO(), author_id: 2, author_name: 'Connor M.', work_performed: 'Drywall hanging — 85% complete. Expecting finish by Wednesday.', status: 'submitted', submitted_at: todayAt(16, 45), photo_count: 3 },
  { id: 4, project_id: 4, project_code: 'PRJ-033', project_name: 'Insurance Rehab — Antioch', log_date: yesterdayISO(), author_id: 4, author_name: 'Jake R.', work_performed: 'Demo complete on master bath. Discovered water damage behind wall — took photos for insurance claim.', status: 'reviewed', submitted_at: yesterdayAt(15, 20), photo_count: 12 },
  { id: 5, project_id: 5, project_code: 'PRJ-027', project_name: 'Commercial — Berry Hill', log_date: yesterdayISO(), author_id: 5, author_name: 'Chris T.', work_performed: 'Interior finish work — trim and crown molding installation. Punch list items 60% resolved.', status: 'submitted', submitted_at: yesterdayAt(17, 0), photo_count: 5 },
];

/* ── Helpers ───────────────────────────────────────────────────────────── */

function todayISO() { return new Date().toISOString().split('T')[0]; }
function yesterdayISO() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }
function todayAt(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); }
function yesterdayAt(h, m) { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(h, m, 0, 0); return d.toISOString(); }

const statusIcon = { draft: Clock, submitted: CheckCircle, reviewed: CheckCircle };
const statusColor = { draft: 'var(--text-tertiary)', submitted: 'var(--status-profit)', reviewed: 'var(--accent)' };

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ── Demo placeholder thumbnail colors ─────────────────────────────────── */
const thumbColors = [
  '#2563EB20', '#16A34A20', '#D9770620', '#DC262620', '#7C3AED20',
  '#0891B220', '#CA8A0420', '#4F46E520', '#059669 20', '#E1195020',
  '#06B6D420', '#8B5CF620',
];

function demoThumbColor(index) {
  return thumbColors[index % thumbColors.length];
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Photo Upload Area (sub-component) ─────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */

function PhotoUploadArea({ photos, setPhotos, promptLabel }) {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (newFiles.length === 0) return;
    setPhotos(prev => [
      ...prev,
      ...newFiles.map(f => ({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        size: f.size,
        preview: URL.createObjectURL(f),
        promptLabel: promptLabel || null,
      })),
    ]);
  }, [setPhotos, promptLabel]);

  const removePhoto = useCallback((id) => {
    setPhotos(prev => {
      const removed = prev.find(p => p.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter(p => p.id !== id);
    });
  }, [setPhotos]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const totalSize = photos.reduce((sum, p) => sum + p.size, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-medium)'}`,
          borderRadius: 8,
          padding: '20px 16px',
          textAlign: 'center',
          background: dragOver ? 'var(--accent-bg)' : 'transparent',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <Upload size={24} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
          Drag & drop photos here
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 11, margin: '4px 0 12px' }}>
          or use the buttons below
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', fontSize: 12, fontWeight: 600,
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
            }}
          >
            <Camera size={14} /> Take Photo
          </button>
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', fontSize: 12, fontWeight: 600,
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)', borderRadius: 6, cursor: 'pointer',
            }}
          >
            <Upload size={14} /> Upload Photos
          </button>
        </div>
        {/* Hidden file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* Photo count + total size */}
      {photos.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Image size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
            {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>
            {formatFileSize(totalSize)}
          </span>
        </div>
      )}

      {/* Preview grid */}
      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 8,
        }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                aspectRatio: '1',
              }}
            >
              <img
                src={photo.preview}
                alt={photo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {photo.promptLabel && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  fontSize: 9, padding: '2px 4px', lineHeight: 1.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {photo.promptLabel}
                </div>
              )}
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.65)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, lineHeight: 1, padding: 0,
                }}
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Phase Photo Prompts Checklist (sub-component) ─────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */

function PhasePromptChecklist({ phase, photos, setPhotos }) {
  const prompts = PHASE_PHOTO_PROMPTS[phase] || [];
  const promptInputRefs = useRef({});

  const handlePromptCapture = useCallback((promptLabel, files) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (newFiles.length === 0) return;
    setPhotos(prev => [
      ...prev,
      ...newFiles.map(f => ({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        size: f.size,
        preview: URL.createObjectURL(f),
        promptLabel,
      })),
    ]);
  }, [setPhotos]);

  const getPromptPhotos = useCallback((promptLabel) => {
    return photos.filter(p => p.promptLabel === promptLabel);
  }, [photos]);

  if (!phase) return null;

  return (
    <div style={{
      background: 'var(--bg-surface, var(--color-brand-surface))',
      border: '1px solid var(--border-subtle, var(--color-brand-border))',
      borderRadius: 8,
      padding: 14,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--text-tertiary)',
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <FileText size={13} />
        Guided photo checklist -- {phase}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {prompts.map((prompt) => {
          const attached = getPromptPhotos(prompt);
          const hasPhoto = attached.length > 0;
          return (
            <div
              key={prompt}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6,
                background: hasPhoto ? 'var(--status-profit-bg)' : 'transparent',
                border: `1px solid ${hasPhoto ? 'var(--status-profit)' : 'var(--border-subtle)'}`,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* Check icon or empty circle */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hasPhoto ? 'var(--status-profit)' : 'transparent',
                border: hasPhoto ? 'none' : '2px solid var(--border-medium)',
                flexShrink: 0,
              }}>
                {hasPhoto && <CheckCircle size={14} style={{ color: '#fff' }} />}
              </div>

              {/* Prompt label */}
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500,
                color: hasPhoto ? 'var(--status-profit)' : 'var(--text-primary)',
              }}>
                {prompt}
              </span>

              {/* Count badge */}
              {hasPhoto && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--status-profit)',
                  background: 'var(--status-profit-bg)', padding: '2px 6px',
                  borderRadius: 3,
                }}>
                  {attached.length}
                </span>
              )}

              {/* Camera capture button */}
              <button
                type="button"
                onClick={() => {
                  if (!promptInputRefs.current[prompt]) return;
                  promptInputRefs.current[prompt].click();
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 6,
                  background: 'var(--accent-bg)', color: 'var(--accent)',
                  border: '1px solid var(--accent-border)', cursor: 'pointer',
                  flexShrink: 0, padding: 0,
                }}
                title={`Take/upload photo for: ${prompt}`}
              >
                <Camera size={14} />
              </button>
              <input
                ref={(el) => { promptInputRefs.current[prompt] = el; }}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  handlePromptCapture(prompt, e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Summary */}
      <div style={{
        marginTop: 10, padding: '8px 10px', borderRadius: 6,
        background: 'var(--bg-elevated, var(--color-brand-surface))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12,
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Progress: {prompts.filter(p => getPromptPhotos(p).length > 0).length} / {prompts.length} captured
        </span>
        <div style={{
          width: 80, height: 5, borderRadius: 3,
          background: 'var(--border-subtle)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'var(--status-profit)',
            width: `${(prompts.filter(p => getPromptPhotos(p).length > 0).length / prompts.length) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Create Daily Log Modal ────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */

function CreateLogModal({ open, onClose }) {
  const [projectId, setProjectId] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [weather, setWeather] = useState('');
  const [crewCount, setCrewCount] = useState('');
  const [phase, setPhase] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Demo mode -- simulate submit
    setTimeout(() => {
      setSubmitting(false);
      onClose(true); // true = was submitted
      // Reset form
      setProjectId('');
      setWorkPerformed('');
      setWeather('');
      setCrewCount('');
      setPhase('');
      // Revoke all preview URLs
      photos.forEach(p => { if (p.preview) URL.revokeObjectURL(p.preview); });
      setPhotos([]);
    }, 800);
  };

  const handleClose = () => {
    photos.forEach(p => { if (p.preview) URL.revokeObjectURL(p.preview); });
    setPhotos([]);
    onClose(false);
  };

  if (!open) return null;

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    background: 'var(--bg-surface, var(--color-brand-surface))',
    border: '1px solid var(--border-medium, var(--color-brand-border))',
    borderRadius: 6, color: 'var(--text-primary)',
    fontFamily: 'inherit', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--text-tertiary)', marginBottom: 5,
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '5vh',
        background: 'var(--bg-overlay, rgba(0,0,0,0.5))',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          width: 640, maxWidth: '94vw', maxHeight: '88vh',
          background: 'var(--color-brand-card)',
          border: '1px solid var(--border-medium, var(--color-brand-border))',
          borderRadius: 12,
          boxShadow: 'var(--shadow-modal, 0 24px 48px rgba(0,0,0,0.3))',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle, var(--color-brand-border))',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Create Daily Log
          </h2>
          <button
            type="button"
            onClick={handleClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6,
              border: 'none', background: 'transparent',
              color: 'var(--text-tertiary)', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body -- scrollable */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Row: Project + Phase */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select project...</option>
                {demoProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} -- {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Construction Phase</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select phase...</option>
                {PHASE_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Performed */}
          <div>
            <label style={labelStyle}>Work Performed</label>
            <textarea
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              required
              rows={3}
              placeholder="Describe what was accomplished today..."
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            />
          </div>

          {/* Row: Weather + Crew Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>
                <CloudSun size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                Weather Conditions
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select weather...</option>
                {WEATHER_OPTIONS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                <Users size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                Crew Count
              </label>
              <input
                type="number"
                min="0"
                value={crewCount}
                onChange={(e) => setCrewCount(e.target.value)}
                placeholder="e.g. 8"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Guided Photo Prompts (Issue 7) */}
          {phase && (
            <PhasePromptChecklist phase={phase} photos={photos} setPhotos={setPhotos} />
          )}

          {/* Photo Upload Area (Issue 6) */}
          <div>
            <label style={labelStyle}>
              <Camera size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
              Photos
            </label>
            <PhotoUploadArea photos={photos} setPhotos={setPhotos} />
          </div>

          {/* Submit */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: 10, paddingTop: 4, borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '9px 18px', fontSize: 13, fontWeight: 500,
                background: 'none', color: 'var(--text-tertiary)',
                border: '1px solid var(--border-medium)', borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 22px', fontSize: 13, fontWeight: 600,
                background: submitting ? 'var(--text-tertiary)' : 'var(--accent)',
                color: '#fff', border: 'none', borderRadius: 6,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Photo Thumbnail Strip (for feed cards) ────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */

function PhotoThumbnailStrip({ count, seed }) {
  if (!count || count <= 0) return null;
  const shown = Math.min(count, 5);
  const remaining = count - shown;

  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 40, height: 40, borderRadius: 4,
            background: demoThumbColor((seed || 0) + i),
            border: '1px solid var(--border-medium)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}
        >
          <Image size={14} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
        </div>
      ))}
      {remaining > 0 && (
        <div style={{
          width: 40, height: 40, borderRadius: 4,
          background: 'var(--bg-elevated, var(--color-brand-surface))',
          border: '1px solid var(--border-medium)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
          flexShrink: 0,
        }}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Main Page Component ───────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════════ */

export default function DailyLogs() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

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

      {/* ── Header with Create button ──────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Field Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} log{filtered.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            <Plus size={15} /> Create Daily Log
          </button>
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
      </div>

      {/* ── Feed ───────────────────────────────────────────────────────────── */}
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
                      {/* Photo thumbnails strip */}
                      <PhotoThumbnailStrip count={log.photo_count} seed={log.id} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}

      {/* ── Create Daily Log Modal ─────────────────────────────────────────── */}
      <CreateLogModal
        open={showCreate}
        onClose={(submitted) => {
          setShowCreate(false);
          if (submitted) refetch();
        }}
      />
    </div>
  );
}
