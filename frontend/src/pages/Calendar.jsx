import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const EVENTS = [
  { id:  1, date: '2026-02-22', time: '8:00 AM',  event: 'Frame inspection',           project: 'Riverside Custom',   assigned: 'Connor Mitchell', type: 'Inspection' },
  { id:  2, date: '2026-02-22', time: '10:30 AM', event: 'Client walk-through',         project: 'Magnolia Spec',       assigned: 'Joseph Kowalski', type: 'Client Meeting' },
  { id:  3, date: '2026-02-22', time: '1:00 PM',  event: 'Concrete pour — foundation', project: 'Oak Creek',           assigned: 'Connor Mitchell', type: 'Delivery' },
  { id:  4, date: '2026-02-22', time: '3:30 PM',  event: 'Punch list review',          project: 'Johnson Office TI',   assigned: 'Joseph Kowalski', type: 'Internal' },
  { id:  5, date: '2026-02-24', time: '8:00 AM',  event: 'Lumber delivery — joists',   project: 'Riverside Custom',   assigned: 'Connor Mitchell', type: 'Delivery' },
  { id:  6, date: '2026-02-24', time: '11:00 AM', event: 'Plumbing rough-in start',    project: 'Walnut Spec',         assigned: 'Zach Hollis',     type: 'Milestone' },
  { id:  7, date: '2026-02-25', time: '9:00 AM',  event: 'Electrical inspection',      project: 'Johnson Office TI',   assigned: 'Joseph Kowalski', type: 'Inspection' },
  { id:  8, date: '2026-02-25', time: '2:00 PM',  event: 'Draw submission — Draw #3',  project: 'Elm St Multifamily',  assigned: 'Samuel Carson',   type: 'Financial' },
  { id:  9, date: '2026-02-26', time: '8:30 AM',  event: 'Roofing crew start',         project: 'Walnut Spec',         assigned: 'Connor Mitchell', type: 'Milestone' },
  { id: 10, date: '2026-02-26', time: '10:00 AM', event: 'Client design meeting',      project: 'Smith Residence',     assigned: 'Abi Darnell',     type: 'Client Meeting' },
  { id: 11, date: '2026-02-27', time: '9:00 AM',  event: 'HVAC rough-in inspection',   project: 'Riverside Custom',   assigned: 'Connor Mitchell', type: 'Inspection' },
  { id: 12, date: '2026-02-28', time: '10:00 AM', event: 'COI renewal — Miller Concrete', project: 'All Projects',    assigned: 'Samuel Carson',   type: 'Compliance' },
  { id: 13, date: '2026-03-01', time: '8:00 AM',  event: 'Foundation inspection',      project: 'Oak Creek',           assigned: 'Connor Mitchell', type: 'Inspection' },
  { id: 14, date: '2026-03-01', time: '1:00 PM',  event: 'Pre-con meeting — Smith Res', project: 'Smith Residence',   assigned: 'Abi Darnell',     type: 'Internal' },
  { id: 15, date: '2026-03-03', time: '9:00 AM',  event: 'Framing milestone review',   project: 'Elm St Multifamily', assigned: 'Alex Reyes',      type: 'Milestone' },
  { id: 16, date: '2026-03-05', time: '8:00 AM',  event: 'Insulation start',           project: 'Magnolia Spec',      assigned: 'Joseph Kowalski', type: 'Milestone' },
  { id: 17, date: '2026-03-05', time: '11:00 AM', event: 'Safety walkthrough',         project: 'Elm St Multifamily', assigned: 'Cole Notgrass',   type: 'Safety' },
  { id: 18, date: '2026-03-10', time: '9:00 AM',  event: 'Drywall start',              project: 'Magnolia Spec',      assigned: 'Joseph Kowalski', type: 'Milestone' },
  { id: 19, date: '2026-03-15', time: '10:00 AM', event: 'Owner final walk',           project: 'Johnson Office TI',  assigned: 'Joseph Kowalski', type: 'Client Meeting' },
  { id: 20, date: '2026-03-20', time: '8:00 AM',  event: 'Certificate of Occupancy — Zion', project: 'Zion Mechanical', assigned: 'Zach Hollis', type: 'Milestone' },
];

const TYPE_COLOR = {
  Inspection:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'Client Meeting': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Delivery:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Milestone:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Financial:      { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Internal:       { color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
  Compliance:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  Safety:         { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const EVENT_TYPES = ['All', 'Inspection', 'Client Meeting', 'Delivery', 'Milestone', 'Financial', 'Compliance', 'Safety', 'Internal'];

export default function Calendar() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected]     = useState(null);

  const rows = useMemo(() => {
    let list = EVENTS;
    if (typeFilter !== 'All') list = list.filter(e => e.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.event.toLowerCase().includes(q) || e.project.toLowerCase().includes(q) || e.assigned.toLowerCase().includes(q));
    }
    return list;
  }, [search, typeFilter]);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Schedule / Calendar</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{EVENTS.length} upcoming events across all projects</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EVENT_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `1px solid ${typeFilter === t ? '#3b82f6' : 'var(--color-brand-border)'}`, background: typeFilter === t ? 'rgba(59,130,246,0.14)' : 'transparent', color: typeFilter === t ? '#3b82f6' : 'var(--text-secondary)', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>
      </div>

      {selected && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid #3b82f6', borderRadius: 10, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.event}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selected.date} at {selected.time}  ·  {selected.project}  ·  {selected.assigned}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/projects/${[1,2,3,4,5,6,7,8][Math.floor(Math.random()*8)+1]}`)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Project</button>
              <button onClick={() => setSelected(null)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date','Time','Event','Project','Assigned To','Type'].map(h => <th key={h} style={thBase}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(ev => {
              const tc = TYPE_COLOR[ev.type] || TYPE_COLOR.Internal;
              const isToday = ev.date === '2026-02-22';
              return (
                <tr key={ev.id} onClick={() => setSelected(ev)} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s', background: isToday ? 'rgba(59,130,246,0.04)' : 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(59,130,246,0.04)' : 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 12, color: isToday ? '#3b82f6' : 'var(--text-primary)', fontWeight: isToday ? 700 : 400 }}>{ev.date}{isToday ? ' (Today)' : ''}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{ev.time}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{ev.event}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{ev.project}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{ev.assigned}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>{ev.type}</span>
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
