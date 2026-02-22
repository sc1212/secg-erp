import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const LOGS = [
  { id:  1, date: '2026-02-22', project: 'Riverside Custom',   pm: 'Connor Mitchell', weather: 'Partly Cloudy, 42°F', crew: 8,  summary: 'Framing crew completed 2nd floor joist installation. Stair rough framing started.', issues: 'Stair stringer delivery delayed — rescheduled Feb 24.', photos: 6 },
  { id:  2, date: '2026-02-22', project: 'Walnut Spec',         pm: 'Connor Mitchell', weather: 'Partly Cloudy, 42°F', crew: 4,  summary: 'MEP rough-in coordination. Davis Plumbing underground piping complete.', issues: '', photos: 3 },
  { id:  3, date: '2026-02-22', project: 'Elm St Multifamily',  pm: 'Alex Reyes',      weather: 'Partly Cloudy, 42°F', crew: 14, summary: 'Level 2 framing — exterior walls 60% complete. Safety toolbox talk conducted at 7 AM.', issues: 'Wind at 22 mph halted crane ops for 2 hrs.', photos: 8 },
  { id:  4, date: '2026-02-21', project: 'Riverside Custom',   pm: 'Connor Mitchell', weather: 'Clear, 38°F',          crew: 8,  summary: 'Exterior sheathing — north and east walls 40% complete. LVL header set at garage.', issues: '', photos: 5 },
  { id:  5, date: '2026-02-21', project: 'Magnolia Spec',       pm: 'Joseph Kowalski', weather: 'Clear, 38°F',          crew: 3,  summary: 'Interior trim and paint prep. Anderson Paint on site for touch-ups.', issues: '', photos: 2 },
  { id:  6, date: '2026-02-21', project: 'Johnson Office TI',  pm: 'Joseph Kowalski', weather: 'Clear, 38°F',          crew: 5,  summary: 'Punch list items — 12 of 28 complete. Flooring contractor finished main lobby.', issues: 'Millwork cabinet delay — ETA March 1.', photos: 4 },
  { id:  7, date: '2026-02-20', project: 'Oak Creek',           pm: 'Connor Mitchell', weather: 'Overcast, 44°F',       crew: 6,  summary: 'Foundation wall pours — north and west complete. Rebar inspection passed.', issues: '', photos: 5 },
  { id:  8, date: '2026-02-20', project: 'Elm St Multifamily',  pm: 'Alex Reyes',      weather: 'Overcast, 44°F',       crew: 14, summary: 'Level 1 framing complete. Sheathing started on west elevation.', issues: '', photos: 10 },
  { id:  9, date: '2026-02-19', project: 'Riverside Custom',   pm: 'Connor Mitchell', weather: 'Rain, 40°F',           crew: 4,  summary: 'Interior work only — blocking and backing for plumbing fixtures.', issues: 'Rain delay — exterior work lost 4 hrs.', photos: 2 },
  { id: 10, date: '2026-02-19', project: 'Walnut Spec',         pm: 'Connor Mitchell', weather: 'Rain, 40°F',           crew: 2,  summary: 'MEP coordination drawings reviewed. No exterior work.', issues: 'Rain delay.', photos: 0 },
  { id: 11, date: '2026-02-18', project: 'Riverside Custom',   pm: 'Connor Mitchell', weather: 'Clear, 50°F',          crew: 8,  summary: 'Garage slab poured — Miller Concrete on site. 1st floor interior wall framing progressed.', issues: '', photos: 6 },
  { id: 12, date: '2026-02-18', project: 'Johnson Office TI',  pm: 'Joseph Kowalski', weather: 'Clear, 50°F',          crew: 5,  summary: 'Final electrical trim completed. Williams Electric confirmed CO-ready.', issues: '', photos: 3 },
  { id: 13, date: '2026-02-17', project: 'Magnolia Spec',       pm: 'Joseph Kowalski', weather: 'Clear, 55°F',          crew: 6,  summary: 'Client final walk-through — punch list created (28 items). Keys not handed over pending cabinet install.', issues: 'Punch list items outstanding — see decisions queue.', photos: 12 },
  { id: 14, date: '2026-02-17', project: 'Elm St Multifamily',  pm: 'Alex Reyes',      weather: 'Clear, 55°F',          crew: 16, summary: 'Full framing crew — level 1 walls set and braced. Inspections called.', issues: '', photos: 7 },
  { id: 15, date: '2026-02-14', project: 'Oak Creek',           pm: 'Connor Mitchell', weather: 'Cloudy, 46°F',         crew: 4,  summary: 'Footer pour — east elevation. Concrete cure time 48 hrs before wall forms.', issues: '', photos: 4 },
  { id: 16, date: '2026-02-14', project: 'Zion Mechanical',     pm: 'Zach Hollis',     weather: 'Cloudy, 46°F',         crew: 3,  summary: 'Final piping connections — boiler room complete. Ready for pressure test.', issues: '', photos: 5 },
  { id: 17, date: '2026-02-13', project: 'Riverside Custom',   pm: 'Connor Mitchell', weather: 'Clear, 52°F',          crew: 8,  summary: 'Living room, kitchen, and pantry walls framed. Owner visit for walk-through.', issues: '', photos: 8 },
  { id: 18, date: '2026-02-13', project: 'Walnut Spec',         pm: 'Connor Mitchell', weather: 'Clear, 52°F',          crew: 6,  summary: 'Roof sheathing and felt paper — 80% complete. OSB delivery received.', issues: '', photos: 3 },
];

const PROJECTS_LIST = ['All', ...Array.from(new Set(LOGS.map(l => l.project)))];

export default function DailyLogs() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [project, setProject]   = useState('All');
  const [expandedId, setExpanded] = useState(null);

  const rows = useMemo(() => {
    let list = LOGS;
    if (project !== 'All') list = list.filter(l => l.project === project);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l => l.project.toLowerCase().includes(q) || l.pm.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q));
    }
    return list;
  }, [search, project]);

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Daily Logs</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{LOGS.length} entries across all projects</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={project} onChange={e => setProject(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          {PROJECTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(log => (
          <div key={log.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              onClick={() => setExpanded(expandedId === log.id ? null : log.id)}
              style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{log.date}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); navigate(`/projects/${[1,2,3,4,5,6,7,8][log.id % 8]}`); }}
                >{log.project}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.pm.split(' ')[0]}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{log.weather}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Crew: {log.crew}</span>
                {log.photos > 0 && <span style={{ fontSize: 11, color: '#3b82f6' }}>{log.photos} photos</span>}
                {log.issues && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--status-warning)', padding: '2px 7px', borderRadius: 4, background: 'rgba(251,191,36,0.1)' }}>Issue</span>}
              </div>
              {expandedId === log.id ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
            </div>
            {expandedId === log.id && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-brand-border)' }}>
                <div style={{ paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Work Performed</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{log.summary}</div>
                  {log.issues && (
                    <div style={{ marginTop: 12, background: 'rgba(251,191,36,0.08)', borderRadius: 7, padding: '10px 12px', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--status-warning)', marginBottom: 4 }}>Issues / Notes</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{log.issues}</div>
                    </div>
                  )}
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate(`/projects/${[1,2,3,4,5,6,7,8][log.id % 8]}`)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Project</button>
                    {log.photos > 0 && <button onClick={() => navigate('/documents?type=photos')} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>View {log.photos} Photos</button>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
