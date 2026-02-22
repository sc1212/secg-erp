import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, Plus, X, BarChart2, List, Cloud, Users, Camera, AlertTriangle } from 'lucide-react';

const LOGS = [
  {
    id: 1, date: '2026-02-22', project: 'Riverside Custom', projectId: 1,
    pm: 'Connor Mitchell', phase: 'Framing',
    weather: 'Partly Cloudy', temp: 42, windMph: 8, humidity: 55,
    crew: 8, subHours: 16,
    subs: ['Thompson Framing — 6 crew (48 hrs total)', 'Clark HVAC rough-in — 2 crew (16 hrs)'],
    equipment: ['Scissor Lift #2', 'Compound Miter Saw', '4× Framing Nailer', 'Air Compressor 60-gal'],
    summary: 'Framing crew completed 2nd floor joist installation — all 28 TJI joists set and nailed. Stair rough framing started; stringers laid out, treads not yet cut. LVL header set at master bedroom opening.',
    issues: 'Stair stringer delivery delayed — rescheduled Feb 24. No schedule impact if delivered on time.',
    photos: 6,
    scheduledPct: 75, actualPct: 72,
    deliveries: ['LVL beams (4 pcs, 18 ft) — received', 'Joist hangers (200) — received', 'Stair stringers — NOT delivered, rescheduled 2/24'],
    visitors: ['David Rivers (owner walk-through 10:00 AM — satisfied with progress)'],
    drawNote: 'Framing 72% complete — eligible for Draw #3 ($28,400) per draw schedule at 75%. Will resubmit Friday.',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 2, date: '2026-02-22', project: 'Walnut Spec', projectId: 7,
    pm: 'Connor Mitchell', phase: 'MEP Rough-in',
    weather: 'Partly Cloudy', temp: 42, windMph: 8, humidity: 55,
    crew: 4, subHours: 24,
    subs: ['Davis Plumbing underground complete — 2 crew (16 hrs)', 'Williams Electric rough-in — 2 crew (8 hrs)'],
    equipment: ['Pipe Bender', 'Wire Fish Kit', 'Drill/Driver Set'],
    summary: 'MEP rough-in coordination. Davis Plumbing underground piping complete and capped for inspection. Williams Electric started bedroom circuits and service panel rough.',
    issues: '',
    photos: 3,
    scheduledPct: 55, actualPct: 55,
    deliveries: ['PVC pipe (200 LF) — received', 'Wire 12/2 (4 rolls) — received'],
    visitors: [],
    drawNote: 'MEP rough-in 50% complete — Draw #2 eligible after inspection pass (est. $14,200)',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 3, date: '2026-02-22', project: 'Elm St Multifamily', projectId: 6,
    pm: 'Alex Reyes', phase: 'Framing',
    weather: 'Partly Cloudy', temp: 42, windMph: 22, humidity: 60,
    crew: 14, subHours: 0,
    subs: [],
    equipment: ['Tower Crane', 'Scissor Lift #1', 'Scissor Lift #3', 'Forklift', '8× Framing Nailer'],
    summary: 'Level 2 framing — exterior walls 60% complete. Safety toolbox talk conducted at 7 AM covering fall protection and crane hand signals. All crew signed attendance. Stairwell core framed.',
    issues: 'Wind at 22 mph halted crane ops 9–11 AM (2 hrs). Crew shifted to manual wall framing during downtime. No injury, no structural impact.',
    photos: 8,
    scheduledPct: 40, actualPct: 38,
    deliveries: ['Lumber package units 201–208 (partial, 60%)'],
    visitors: ['City Inspector — framing pre-inspection (passed, stamp on file)'],
    drawNote: 'Level 2 framing 38% — Draw #4 at 50% completion triggers $72,000 disbursement',
    hoursLost: 2, impactLevel: 'minor',
  },
  {
    id: 4, date: '2026-02-21', project: 'Riverside Custom', projectId: 1,
    pm: 'Connor Mitchell', phase: 'Framing',
    weather: 'Clear', temp: 38, windMph: 5, humidity: 42,
    crew: 8, subHours: 0,
    subs: [],
    equipment: ['Scissor Lift #2', '4× Framing Nailer', 'Table Saw', 'Air Compressor'],
    summary: 'Exterior sheathing on north and east walls 40% complete. LVL header set at garage opening (triple 1¾″ × 11¼″ LVL). Blocking for windows and doors complete per plans.',
    issues: '',
    photos: 5,
    scheduledPct: 72, actualPct: 70,
    deliveries: ['OSB sheathing 7/16″ (48 sheets) — received'],
    visitors: [],
    drawNote: '',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 5, date: '2026-02-21', project: 'Magnolia Spec', projectId: 4,
    pm: 'Joseph Kowalski', phase: 'Finishes',
    weather: 'Clear', temp: 38, windMph: 5, humidity: 42,
    crew: 3, subHours: 16,
    subs: ['Anderson Paint touch-ups — 2 crew (8 hrs)', 'Martinez Drywall repairs — 2 crew (8 hrs)'],
    equipment: ['Paint Sprayer', 'Drywall Sander', 'Shop Vac'],
    summary: 'Interior trim and paint prep. Anderson Paint on site for final wall color corrections. 4 of 28 punch list items resolved today: bedroom caulking, closet door rehang, kitchen backsplash grout touch, bath mirror remount.',
    issues: '',
    photos: 2,
    scheduledPct: 95, actualPct: 96,
    deliveries: [],
    visitors: ['Realtor — potential buyer showing at 2 PM'],
    drawNote: '',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 6, date: '2026-02-21', project: 'Johnson Office TI', projectId: 5,
    pm: 'Joseph Kowalski', phase: 'Punch List',
    weather: 'Clear', temp: 38, windMph: 5, humidity: 42,
    crew: 5, subHours: 8,
    subs: ['Williams Electric final trim — 2 crew (8 hrs)'],
    equipment: [],
    summary: 'Punch list 12/28 complete. Flooring contractor finished main lobby and reception. Williams Electric completed final outlet covers and labeled panel. Conference room AV rough-in complete.',
    issues: 'Millwork cabinet delay — ETA March 1. Blocking CO issuance.',
    photos: 4,
    scheduledPct: 96, actualPct: 95,
    deliveries: [],
    visitors: ['Johnson Properties LLC — client progress walk (OK with pace)'],
    drawNote: 'Final payment $18,000 pending CO — cabinet install is critical path',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 7, date: '2026-02-20', project: 'Oak Creek', projectId: 2,
    pm: 'Connor Mitchell', phase: 'Foundation',
    weather: 'Overcast', temp: 44, windMph: 12, humidity: 68,
    crew: 6, subHours: 16,
    subs: ['Miller Concrete pour crew — 4 crew (16 hrs)'],
    equipment: ['Concrete Pump Truck', 'Vibrator (3)', 'Screed Board', 'Bull Float'],
    summary: 'Foundation wall pours north and west complete — 14 yards ready-mix each wall. Rebar inspection passed 8 AM (inspector: D. Holt). East wall forming in progress for Monday pour.',
    issues: '',
    photos: 5,
    scheduledPct: 42, actualPct: 42,
    deliveries: ['Ready-mix concrete — 28 yards, 3 trucks', 'Anchor bolts ½″ (100 pcs)'],
    visitors: ['D. Holt — City Building Inspector, rebar passed, stamp on file'],
    drawNote: 'Foundation 42% — Draw #1 at 50% foundation complete triggers $32,800',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 8, date: '2026-02-20', project: 'Elm St Multifamily', projectId: 6,
    pm: 'Alex Reyes', phase: 'Framing',
    weather: 'Overcast', temp: 44, windMph: 12, humidity: 68,
    crew: 14, subHours: 0,
    subs: [],
    equipment: ['Tower Crane', 'Scissor Lift #1', 'Scissor Lift #3', 'Forklift'],
    summary: 'Level 1 framing complete — all exterior and interior walls set, plumbed, and braced. Sheathing started west elevation (25%). Stairwell core walls framed.',
    issues: '',
    photos: 10,
    scheduledPct: 35, actualPct: 35,
    deliveries: ['OSB sheathing (96 sheets)', 'House wrap (2 rolls)'],
    visitors: [],
    drawNote: '',
    hoursLost: 0, impactLevel: 'none',
  },
  {
    id: 9, date: '2026-02-19', project: 'Riverside Custom', projectId: 1,
    pm: 'Connor Mitchell', phase: 'Framing',
    weather: 'Rain', temp: 40, windMph: 18, humidity: 92,
    crew: 4, subHours: 0,
    subs: [],
    equipment: ['Circular Saw', 'Air Compressor'],
    summary: 'Interior-only day due to rain. Installed blocking and backing for plumbing fixtures in master bath and kitchen (per plumber layout). No exterior progress possible.',
    issues: 'Rain delay — exterior work lost ~4 hrs. Schedule impact: 0.5 day. Weather log updated for lender documentation.',
    photos: 2,
    scheduledPct: 67, actualPct: 65,
    deliveries: [],
    visitors: [],
    drawNote: '',
    hoursLost: 4, impactLevel: 'moderate',
  },
  {
    id: 10, date: '2026-02-19', project: 'Walnut Spec', projectId: 7,
    pm: 'Connor Mitchell', phase: 'MEP Rough-in',
    weather: 'Rain', temp: 40, windMph: 18, humidity: 92,
    crew: 2, subHours: 0,
    subs: [],
    equipment: [],
    summary: 'MEP coordination drawings reviewed with sub foremen on site. Confirmed underground plumbing inspection with city for Feb 21. Revised rough-in schedule distributed to Davis, Williams, Clark.',
    issues: 'Rain delay — all exterior work paused for day.',
    photos: 0,
    scheduledPct: 52, actualPct: 50,
    deliveries: [],
    visitors: [],
    drawNote: '',
    hoursLost: 6, impactLevel: 'moderate',
  },
];

const PROJECTS_LIST = ['All', ...Array.from(new Set(LOGS.map(l => l.project)))];

const PHASE_COLORS = {
  'Framing':      { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'Foundation':   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  'MEP Rough-in': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Finishes':     { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Punch List':   { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  'Pre-Construction': { color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

const IMPACT_COLORS = {
  none:     { label: 'No Impact',    color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.1)' },
  minor:    { label: 'Minor Delay',  color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.1)' },
  moderate: { label: 'Moderate',     color: '#f97316',               bg: 'rgba(249,115,22,0.1)' },
  severe:   { label: 'Severe',       color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.1)' },
};

const WEATHER_ICON = { 'Clear': '☀', 'Partly Cloudy': '⛅', 'Overcast': '☁', 'Rain': '🌧', 'Snow': '❄' };

// --- Drill Modal ---
function DrillModal({ drill, onClose }) {
  if (!drill) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{drill.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}><X size={16} /></button>
        </div>
        {drill.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < drill.rows.length - 1 ? '1px solid var(--color-brand-border)' : 'none' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.highlight ? 'var(--status-warning)' : 'var(--text-primary)' }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- New Log Modal ---
function NewLogModal({ onClose }) {
  const [form, setForm] = useState({ project: 'Riverside Custom', date: '2026-02-23', pm: 'Connor Mitchell', weather: 'Clear', temp: '', wind: '', crew: '', summary: '', issues: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k, ph, type = 'text', half = false) => (
    <div style={{ flex: half ? '0 0 48%' : '1 1 100%' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ph}</div>
      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 540 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>New Daily Log Entry</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: '1 1 100%' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project</div>
            <select value={form.project} onChange={e => set('project', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
              {PROJECTS_LIST.filter(p => p !== 'All').map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          {inp('date', 'Date', 'date', true)}
          {inp('pm', 'Project Manager', 'text', true)}
          {inp('weather', 'Weather Condition', 'text', true)}
          {inp('temp', 'Temp (°F)', 'number', true)}
          {inp('wind', 'Wind (mph)', 'number', true)}
          {inp('crew', 'Total Crew on Site', 'number', true)}
          <div style={{ flex: '1 1 100%' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Work Performed Summary</div>
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={3} placeholder="Describe work completed today..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <div style={{ flex: '1 1 100%' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issues / Notes (optional)</div>
            <textarea value={form.issues} onChange={e => set('issues', e.target.value)} rows={2} placeholder="Delays, problems, decisions needed..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--bg-base, #1a1f2e)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Log Entry</button>
        </div>
      </div>
    </div>
  );
}

// --- Mini bar used in analytics ---
function MiniBar({ value, max, color }) {
  const w = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div style={{ height: 6, borderRadius: 3, background: 'var(--color-brand-border)', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

export default function DailyLogs() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('logs');
  const [search, setSearch]     = useState('');
  const [project, setProject]   = useState('All');
  const [expandedId, setExpanded] = useState(null);
  const [drill, setDrill]       = useState(null);
  const [showNew, setShowNew]   = useState(false);

  const rows = useMemo(() => {
    let list = LOGS;
    if (project !== 'All') list = list.filter(l => l.project === project);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.project.toLowerCase().includes(q) ||
        l.pm.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.phase.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, project]);

  // Analytics aggregations
  const totalPhotos  = LOGS.reduce((s, l) => s + l.photos, 0);
  const totalCrew    = LOGS.reduce((s, l) => s + l.crew, 0);
  const totalSubHrs  = LOGS.reduce((s, l) => s + l.subHours, 0);
  const hoursLost    = LOGS.reduce((s, l) => s + l.hoursLost, 0);

  // Per-project latest entry
  const byProject = useMemo(() => {
    const map = {};
    LOGS.forEach(l => {
      if (!map[l.project] || l.date > map[l.project].date) map[l.project] = l;
    });
    return Object.values(map).sort((a, b) => b.actualPct - a.actualPct);
  }, []);

  // Weather delay log
  const weatherDelays = LOGS.filter(l => l.hoursLost > 0);

  // Last 7 dates bar chart
  const dates = [...new Set(LOGS.map(l => l.date))].sort().reverse().slice(0, 7).reverse();
  const dateActivity = dates.map(d => ({
    date: d,
    entries: LOGS.filter(l => l.date === d).length,
    crew: LOGS.filter(l => l.date === d).reduce((s, l) => s + l.crew, 0),
  }));
  const maxCrew = Math.max(...dateActivity.map(d => d.crew), 1);

  const statBox = (label, value, sub, onClick) => (
    <div onClick={onClick} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '14px 16px', flex: '1 1 120px', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-5">
      {showNew && <NewLogModal onClose={() => setShowNew(false)} />}
      <DrillModal drill={drill} onClose={() => setDrill(null)} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Daily Logs</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{LOGS.length} entries · {[...new Set(LOGS.map(l => l.project))].length} active projects</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Log Entry
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-brand-border)', paddingBottom: 0 }}>
        {[['logs', List, 'Log Entries'], ['analytics', BarChart2, 'Analytics']].map(([t, Icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: '7px 7px 0 0', border: 'none', background: tab === t ? 'var(--color-brand-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent' }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── LOG ENTRIES TAB ── */}
      {tab === 'logs' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search project, PM, phase, summary..."
                style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <select value={project} onChange={e => setProject(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
              {PROJECTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{rows.length} entries shown</span>
          </div>

          {/* Log cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map(log => {
              const phase = PHASE_COLORS[log.phase] || { color: 'var(--text-secondary)', bg: 'rgba(148,163,184,0.1)' };
              const impact = IMPACT_COLORS[log.impactLevel];
              const variance = log.actualPct - log.scheduledPct;
              const isOpen = expandedId === log.id;
              return (
                <div key={log.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Row header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : log.id)}
                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{log.date}</span>
                      <span
                        onClick={e => { e.stopPropagation(); navigate(`/projects/${log.projectId}`); }}
                        style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >{log.project}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: phase.color, background: phase.bg, padding: '2px 7px', borderRadius: 4 }}>{log.phase}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.pm.split(' ')[0]}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{WEATHER_ICON[log.weather] || ''} {log.weather}, {log.temp}°F</span>
                      <span
                        onClick={e => { e.stopPropagation(); setDrill({ title: `${log.project} — Crew ${log.date}`, rows: [{ label: 'Direct crew on site', value: `${log.crew} workers` }, { label: 'Sub hours', value: `${log.subHours} hrs` }, ...log.subs.map(s => ({ label: 'Sub detail', value: s }))] }); }}
                        style={{ fontSize: 11, color: 'var(--text-tertiary)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                      >
                        <Users size={10} style={{ display: 'inline', marginRight: 3 }} />{log.crew + (log.subHours > 0 ? `+${log.subHours / 8 | 0}` : '')} crew
                      </span>
                      {/* Schedule variance */}
                      <span
                        onClick={e => { e.stopPropagation(); setDrill({ title: `${log.project} — Schedule`, rows: [{ label: 'Scheduled %', value: `${log.scheduledPct}%` }, { label: 'Actual %', value: `${log.actualPct}%` }, { label: 'Variance', value: `${variance >= 0 ? '+' : ''}${variance}%`, highlight: variance < -3 }] }); }}
                        style={{ fontSize: 11, fontWeight: 600, color: variance < -3 ? 'var(--status-warning)' : variance >= 0 ? 'var(--status-profit)' : 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                      >
                        {log.actualPct}% {variance >= 0 ? `▲+${variance}%` : `▼${variance}%`}
                      </span>
                      {log.photos > 0 && (
                        <span style={{ fontSize: 11, color: '#3b82f6' }}>
                          <Camera size={10} style={{ display: 'inline', marginRight: 3 }} />{log.photos}
                        </span>
                      )}
                      {log.impactLevel !== 'none' && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: impact.color, padding: '2px 7px', borderRadius: 4, background: impact.bg }}>
                          <AlertTriangle size={10} style={{ display: 'inline', marginRight: 3 }} />{impact.label}
                        </span>
                      )}
                      {log.issues && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--status-warning)', padding: '2px 7px', borderRadius: 4, background: 'rgba(251,191,36,0.1)' }}>Issue</span>}
                    </div>
                    {isOpen ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-brand-border)' }}>
                      <div style={{ paddingTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>

                        {/* Work Summary */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Work Performed</div>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65 }}>{log.summary}</div>
                        </div>

                        {/* Crew & Subs */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Crew & Subs</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Direct: </span>
                              <span
                                onClick={() => setDrill({ title: `Crew Detail — ${log.project} ${log.date}`, rows: [{ label: 'Direct crew', value: `${log.crew} workers` }, { label: 'Sub hours', value: `${log.subHours} hrs` }, { label: 'Total headcount', value: `~${log.crew + Math.round(log.subHours / 8)} people` }] })}
                                style={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'underline dotted' }}
                              >{log.crew} workers</span>
                            </div>
                            {log.subs.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-tertiary)' }}>Sub: </span>{s}</div>)}
                            {log.equipment.length > 0 && (
                              <div style={{ marginTop: 6 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>Equipment:</div>
                                {log.equipment.map((e, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>• {e}</div>)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Site Conditions */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Site Conditions</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}><span style={{ color: 'var(--text-tertiary)' }}>Weather: </span>{WEATHER_ICON[log.weather]} {log.weather}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}><span style={{ color: 'var(--text-tertiary)' }}>Temp: </span>{log.temp}°F</div>
                            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}><span style={{ color: 'var(--text-tertiary)' }}>Wind: </span>{log.windMph} mph</div>
                            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}><span style={{ color: 'var(--text-tertiary)' }}>Humidity: </span>{log.humidity}%</div>
                            {log.hoursLost > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-warning)' }}>Hrs lost: {log.hoursLost}h</div>}
                          </div>
                        </div>

                        {/* Progress */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 8 }}>Progress</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Scheduled</span>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{log.scheduledPct}%</span>
                              </div>
                              <div style={{ height: 5, borderRadius: 3, background: 'var(--color-brand-border)' }}>
                                <div style={{ height: '100%', width: `${log.scheduledPct}%`, background: 'rgba(148,163,184,0.4)', borderRadius: 3 }} />
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Actual</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: variance >= 0 ? 'var(--status-profit)' : 'var(--status-warning)' }}>{log.actualPct}%</span>
                              </div>
                              <div style={{ height: 5, borderRadius: 3, background: 'var(--color-brand-border)' }}>
                                <div style={{ height: '100%', width: `${log.actualPct}%`, background: variance >= 0 ? 'var(--status-profit)' : '#f97316', borderRadius: 3 }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deliveries & Visitors */}
                      {(log.deliveries.length > 0 || log.visitors.length > 0) && (
                        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                          {log.deliveries.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Deliveries</div>
                              {log.deliveries.map((d, i) => <div key={i} style={{ fontSize: 12, color: d.includes('NOT') ? 'var(--status-warning)' : 'var(--text-secondary)', marginBottom: 2 }}>• {d}</div>)}
                            </div>
                          )}
                          {log.visitors.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Visitors / Inspections</div>
                              {log.visitors.map((v, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>• {v}</div>)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issues */}
                      {log.issues && (
                        <div style={{ marginTop: 12, background: 'rgba(251,191,36,0.08)', borderRadius: 7, padding: '10px 12px', border: '1px solid rgba(251,191,36,0.2)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--status-warning)', marginBottom: 4 }}>Issues / Notes</div>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{log.issues}</div>
                        </div>
                      )}

                      {/* Draw note */}
                      {log.drawNote && (
                        <div style={{ marginTop: 10, background: 'rgba(59,130,246,0.07)', borderRadius: 7, padding: '8px 12px', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#3b82f6', marginBottom: 3 }}>Draw Eligibility</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.drawNote}</div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => navigate(`/projects/${log.projectId}`)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Project</button>
                        {log.photos > 0 && <button onClick={() => navigate('/documents?type=photos')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>View {log.photos} Photos</button>}
                        <button onClick={() => navigate('/draws')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Draws</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {rows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>No log entries match your filters.</div>
            )}
          </div>
        </>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {statBox('Total Entries', LOGS.length, `${[...new Set(LOGS.map(l => l.date))].length} unique days`, () => setDrill({ title: 'Entry Breakdown', rows: [{ label: 'Total log entries', value: LOGS.length }, { label: 'Unique dates', value: [...new Set(LOGS.map(l => l.date))].length }, { label: 'Projects covered', value: [...new Set(LOGS.map(l => l.project))].length }] }))}
            {statBox('Total Crew-Days', totalCrew, 'across all entries', () => setDrill({ title: 'Crew Summary', rows: LOGS.map(l => ({ label: `${l.date} ${l.project}`, value: `${l.crew} crew` })) }))}
            {statBox('Sub Hours', totalSubHrs + 'h', 'subcontractor labor logged', () => setDrill({ title: 'Sub Hours by Entry', rows: LOGS.filter(l => l.subHours > 0).map(l => ({ label: `${l.date} ${l.project}`, value: `${l.subHours} hrs` })) }))}
            {statBox('Hours Lost', hoursLost + 'h', 'to weather delays', () => setDrill({ title: 'Weather Delay Log', rows: weatherDelays.map(l => ({ label: `${l.date} ${l.project}`, value: `${l.hoursLost} hrs`, highlight: l.hoursLost >= 4 })) }))}
            {statBox('Photos', totalPhotos, 'site photos logged', null)}
          </div>

          {/* 7-day crew activity chart */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>7-Day Crew Activity</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
              {dateActivity.map(d => {
                const h = Math.max(8, Math.round((d.crew / maxCrew) * 72));
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                    onClick={() => setDrill({ title: `Activity ${d.date}`, rows: [{ label: 'Log entries', value: d.entries }, { label: 'Total crew', value: d.crew }, { label: 'Projects', value: LOGS.filter(l => l.date === d.date).map(l => l.project).join(', ') }] })}>
                    <div style={{ width: '100%', height: h, background: '#3b82f6', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                    <div style={{ fontSize: 9, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{d.date.slice(5)}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.crew}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Bar height = total crew on site · click bar for detail</div>
          </div>

          {/* Per-project progress table */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Schedule vs Actual by Project</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>As of most recent daily log entry</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Project', 'Phase', 'Last Entry', 'Scheduled', 'Actual', 'Variance', 'Progress'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byProject.map((log, i) => {
                  const phase = PHASE_COLORS[log.phase] || {};
                  const variance = log.actualPct - log.scheduledPct;
                  return (
                    <tr key={log.project} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span onClick={() => navigate(`/projects/${log.projectId}`)}
                          style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >{log.project}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}><span style={{ color: phase.color, background: phase.bg, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{log.phase}</span></td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>{log.date}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{log.scheduledPct}%</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: variance >= 0 ? 'var(--status-profit)' : 'var(--status-warning)' }}
                        onClick={() => setDrill({ title: `${log.project} Progress Detail`, rows: [{ label: 'Scheduled %', value: `${log.scheduledPct}%` }, { label: 'Actual %', value: `${log.actualPct}%` }, { label: 'Variance', value: `${variance >= 0 ? '+' : ''}${variance}%`, highlight: variance < -3 }, { label: 'Last entry', value: log.date }, { label: 'PM', value: log.pm }] })}
                        style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                      >{log.actualPct}%</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: variance >= 0 ? 'var(--status-profit)' : 'var(--status-warning)' }}>
                        {variance >= 0 ? '+' : ''}{variance}%
                      </td>
                      <td style={{ padding: '10px 14px', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MiniBar value={log.actualPct} max={100} color={variance >= 0 ? 'var(--status-profit)' : '#f97316'} />
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{log.actualPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Weather delay log */}
          {weatherDelays.length > 0 && (
            <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Weather Delay Log</div>
                <span style={{ fontSize: 12, color: 'var(--status-warning)' }}>{hoursLost}h total lost</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Date', 'Project', 'Condition', 'Hrs Lost', 'Impact', 'Notes'].map(h => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weatherDelays.map((log, i) => {
                    const impact = IMPACT_COLORS[log.impactLevel];
                    return (
                      <tr key={log.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{log.date}</td>
                        <td style={{ padding: '9px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.project}</td>
                        <td style={{ padding: '9px 14px', color: 'var(--text-secondary)' }}>{WEATHER_ICON[log.weather]} {log.weather}, {log.temp}°F, {log.windMph}mph</td>
                        <td style={{ padding: '9px 14px', fontWeight: 600, color: 'var(--status-warning)' }}
                          onClick={() => setDrill({ title: 'Delay Detail', rows: [{ label: 'Project', value: log.project }, { label: 'Date', value: log.date }, { label: 'Hours lost', value: `${log.hoursLost}h`, highlight: true }, { label: 'Weather', value: `${log.weather} ${log.temp}°F` }, { label: 'Impact', value: impact.label }] })}
                          style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                        >{log.hoursLost}h</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: 11, color: impact.color, background: impact.bg, padding: '2px 6px', borderRadius: 4 }}>{impact.label}</span>
                        </td>
                        <td style={{ padding: '9px 14px', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.issues}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
