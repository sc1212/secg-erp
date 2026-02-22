import { useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { ErrorState, PageLoading } from '../components/LoadingState';

const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const typeColor = {
  inspection: 'bg-blue-500/15 text-blue-400',
  milestone: 'bg-green-500/15 text-green-400',
  deadline: 'bg-yellow-500/15 text-yellow-400',
  critical: 'bg-red-500/15 text-red-400',
  meeting: 'bg-purple-500/15 text-purple-400',
  delivery: 'bg-slate-500/15 text-slate-300',
};

function generateIcs(event) {
  const start = new Date(event.start_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end = event.end_datetime ? new Date(event.end_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : start;
  const content = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${event.title}\nLOCATION:${event.location || ''}\nDESCRIPTION:${event.description || ''}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Calendar() {
  const { data, loading, error, refetch } = useApi(() => api.calendarEvents());
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('inspection');
  const [start, setStart] = useState('');
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const events = data?.items || [];

  const crew = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      const who = e.description?.includes('Connor') ? 'Connor' : e.description?.includes('Joseph') ? 'Joseph' : 'Matt';
      const day = new Date(e.start_datetime).toLocaleDateString('en-US', { weekday: 'short' });
      if (!map.has(who)) map.set(who, { Mon: '—', Tue: '—', Wed: '—', Thu: '—', Fri: '—' });
      if (map.get(who)[day] !== undefined) map.get(who)[day] = e.title;
    }
    return Array.from(map.entries());
  }, [events]);

  async function createEvent(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createCalendarEvent({
        title,
        event_type: eventType,
        start_datetime: new Date(start).toISOString(),
        description: 'Created from calendar quick add',
      });
      setTitle('');
      setStart('');
      refetch();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4 relative">
      <h1 className="text-2xl font-bold">Calendar</h1>

      <form onSubmit={createEvent} className="bg-brand-card border border-brand-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Event title" className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm" />
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm">
          <option value="inspection">Inspection</option>
          <option value="delivery">Delivery</option>
          <option value="milestone">Milestone</option>
          <option value="meeting">Meeting</option>
          <option value="deadline">Deadline</option>
          <option value="critical">Critical</option>
        </select>
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm" />
        <button disabled={saving} className="bg-brand-gold text-brand-bg rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Add Event'}</button>
      </form>

      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Events</h3>
        <div className="space-y-2">
          {events.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} className="w-full text-left p-3 border border-brand-border rounded-lg hover:bg-brand-card-hover">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-brand-muted">{new Date(e.start_datetime).toLocaleString()} {e.location ? `· ${e.location}` : ''}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${typeColor[e.event_type] || 'bg-brand-surface'}`}>{e.event_type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-lg p-4 overflow-x-auto">
        <h3 className="font-semibold mb-3">Crew Board</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-brand-border text-brand-muted text-xs uppercase"><th className="pb-2 pr-3">Team</th>{week.map((d) => <th key={d} className="pb-2 pr-3">{d}</th>)}</tr></thead>
          <tbody>{crew.length === 0 && <tr><td className="py-3 text-brand-muted" colSpan={6}>No scheduled events yet.</td></tr>}{crew.map(([name, days]) => <tr key={name} className="border-b border-brand-border/50"><td className="py-2 pr-3 font-medium">{name}</td>{week.map((d) => <td key={d} className="py-2 pr-3">{days[d] || '—'}</td>)}</tr>)}</tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-brand-surface border-l border-brand-border p-4 z-50 overflow-auto">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">{selected.title}</h3>
            <button onClick={() => setSelected(null)} className="text-brand-muted">✕</button>
          </div>
          <div className="mt-3 text-sm space-y-2">
            <p><span className="text-brand-muted">Date:</span> {new Date(selected.start_datetime).toLocaleString()}</p>
            <p><span className="text-brand-muted">Type:</span> {selected.event_type}</p>
            <p><span className="text-brand-muted">Location:</span> {selected.location || '—'}</p>
            <p><span className="text-brand-muted">Notes:</span> {selected.description || '—'}</p>
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={() => generateIcs(selected)} className="px-3 py-2 rounded bg-brand-gold text-brand-bg text-sm font-semibold">Add to Outlook (.ics)</button>
            <a href={`mailto:?subject=${encodeURIComponent(selected.title)}&body=${encodeURIComponent(`${selected.title}\n${new Date(selected.start_datetime).toLocaleString()}\n${selected.location || ''}\n${selected.description || ''}`)}`} className="px-3 py-2 rounded border border-brand-border text-sm">Email Details</a>
          </div>
        </div>
      )}
    </div>
  );
}
