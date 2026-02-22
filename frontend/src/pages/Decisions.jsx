import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const PUNCH_ITEMS = [
  { id:  1, item: 'Touch-up paint — master bedroom ceiling',  project: 'Magnolia Spec',      location: 'Master Bedroom',  assigned: 'Anderson Paint',    priority: 'low',    status: 'open' },
  { id:  2, item: 'Adjust cabinet doors — kitchen',           project: 'Magnolia Spec',      location: 'Kitchen',         assigned: 'Joseph Kowalski',   priority: 'medium', status: 'open' },
  { id:  3, item: 'Caulk gaps — master bath tile',            project: 'Magnolia Spec',      location: 'Master Bath',     assigned: 'Davis Plumbing',    priority: 'medium', status: 'in_progress' },
  { id:  4, item: 'Replace broken outlet cover — office',     project: 'Magnolia Spec',      location: 'Office',          assigned: 'Williams Electric', priority: 'low',    status: 'open' },
  { id:  5, item: 'Fix HVAC damper — bedroom 2',              project: 'Magnolia Spec',      location: 'Bedroom 2',       assigned: 'Clark HVAC',        priority: 'high',   status: 'open' },
  { id:  6, item: 'Garage door adjustment — binding',         project: 'Johnson Office TI',  location: 'Garage',          assigned: 'Joseph Kowalski',   priority: 'medium', status: 'in_progress' },
  { id:  7, item: 'Millwork installation — reception',        project: 'Johnson Office TI',  location: 'Reception',       assigned: 'TBD',               priority: 'high',   status: 'open' },
  { id:  8, item: 'Rebalance HVAC — conference room',         project: 'Johnson Office TI',  location: 'Conference Rm',   assigned: 'Clark HVAC',        priority: 'medium', status: 'open' },
  { id:  9, item: 'Floor transition strip — lobby to office', project: 'Johnson Office TI',  location: 'Lobby',           assigned: 'Martinez Drywall',  priority: 'low',    status: 'open' },
  { id: 10, item: 'Electrical panel label final',             project: 'Johnson Office TI',  location: 'Electrical Rm',   assigned: 'Williams Electric', priority: 'high',   status: 'complete' },
  { id: 11, item: 'Siding dent repair — south elevation',     project: 'Riverside Custom',   location: 'Exterior',        assigned: 'Connor Mitchell',   priority: 'medium', status: 'open' },
  { id: 12, item: 'Railing install — rear deck',              project: 'Riverside Custom',   location: 'Rear Deck',       assigned: 'TBD',               priority: 'low',    status: 'open' },
  { id: 13, item: 'Foundation crack seal — NE corner',        project: 'Oak Creek',          location: 'Foundation',      assigned: 'Miller Concrete',   priority: 'high',   status: 'open' },
  { id: 14, item: 'Compaction test recheck — garage area',    project: 'Oak Creek',          location: 'Garage Pad',      assigned: 'Connor Mitchell',   priority: 'medium', status: 'open' },
  { id: 15, item: 'Grout reseal — master shower',             project: 'Walnut Spec',        location: 'Master Bath',     assigned: 'Davis Plumbing',    priority: 'low',    status: 'open' },
  { id: 16, item: 'Light fixture swap — dining',              project: 'Walnut Spec',        location: 'Dining Room',     assigned: 'Williams Electric', priority: 'low',    status: 'in_progress' },
  { id: 17, item: 'Concrete pressure test — boiler room',     project: 'Zion Mechanical',    location: 'Boiler Room',     assigned: 'Zach Hollis',       priority: 'high',   status: 'complete' },
  { id: 18, date: '2026-02-20', item: 'Plumbing chase patch — level 2', project: 'Elm St Multifamily', location: 'Level 2', assigned: 'Davis Plumbing', priority: 'medium', status: 'open' },
  { id: 19, item: 'Stair baluster spacing check',             project: 'Elm St Multifamily', location: 'Stairwell',       assigned: 'Thompson Framing',  priority: 'high',   status: 'open' },
  { id: 20, item: 'Window flashing inspection — west side',   project: 'Elm St Multifamily', location: 'Exterior',        assigned: 'Cole Notgrass',     priority: 'high',   status: 'open' },
];

const PRIORITY_COLOR = {
  high:   { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'High' },
  medium: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Medium' },
  low:    { color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.05)', label: 'Low' },
};
const STATUS_COLOR = {
  open:        { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Open' },
  in_progress: { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)', label: 'In Progress' },
  complete:    { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.12)', label: 'Complete' },
};

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Complete'];
const PROJECTS_LIST  = ['All', ...Array.from(new Set(PUNCH_ITEMS.map(p => p.project)))];

export default function Decisions() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [projectF, setProjectF] = useState('All');
  const [statusF, setStatusF]   = useState('All');

  const rows = useMemo(() => {
    let list = PUNCH_ITEMS;
    if (projectF !== 'All') list = list.filter(p => p.project === projectF);
    if (statusF  !== 'All') {
      const s = statusF.toLowerCase().replace(' ', '_');
      list = list.filter(p => p.status === s);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.item.toLowerCase().includes(q) || p.project.toLowerCase().includes(q) || p.assigned.toLowerCase().includes(q));
    }
    return list;
  }, [search, projectF, statusF]);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  const openCount  = PUNCH_ITEMS.filter(p => p.status === 'open').length;
  const inProgCount = PUNCH_ITEMS.filter(p => p.status === 'in_progress').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Punch List</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{openCount} open  ·  {inProgCount} in progress  ·  {PUNCH_ITEMS.filter(p=>p.status==='complete').length} complete</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={projectF} onChange={e => setProjectF(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          {PROJECTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusF(f)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${statusF === f ? '#3b82f6' : 'var(--color-brand-border)'}`, background: statusF === f ? 'rgba(59,130,246,0.14)' : 'transparent', color: statusF === f ? '#3b82f6' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Item','Project','Location','Assigned To','Priority','Status'].map(h => <th key={h} style={thBase}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No items match.</td></tr>
            )}
            {rows.map(p => {
              const pc = PRIORITY_COLOR[p.priority];
              const sc = STATUS_COLOR[p.status];
              return (
                <tr key={p.id} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => navigate(`/projects/${[1,2,3,4,5,6,7,8][p.id % 8]}`)}
                >
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{p.item}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{p.project}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{p.location}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{p.assigned}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: pc.bg, color: pc.color }}>{pc.label}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
