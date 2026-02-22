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
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, X, Download, Edit3, Trash2, ExternalLink } from 'lucide-react';

const EVENT_COLORS = {
  inspection: 'var(--chart-primary)',
  meeting: 'var(--status-purple)',
  deadline: 'var(--status-profit)',
  delivery: 'var(--status-warning)',
  milestone: 'var(--status-profit)',
  pto: 'var(--text-tertiary)',
  training: 'var(--chart-secondary)',
  walkthrough: 'var(--chart-tertiary)',
  closing: 'var(--status-profit)',
  draw_due: 'var(--status-loss)',
  permit: 'var(--status-info)',
  personal: 'var(--accent)',
};

const EVENT_LABELS = {
  inspection: 'Inspection', meeting: 'Meeting', deadline: 'Deadline',
  delivery: 'Delivery', milestone: 'Milestone', pto: 'PTO',
  training: 'Training', walkthrough: 'Walkthrough', closing: 'Closing',
  draw_due: 'Draw Due', permit: 'Permit', personal: 'Personal',
};

const VIEWS = ['week', 'crew', 'month'];
const VIEW_LABELS = { week: 'Week', crew: 'Crew Board', month: 'Month' };

const DEMO_PROJECTS = {
  1: { id: 1, code: 'PRJ-042', name: 'Custom Home — Brentwood' },
  2: { id: 2, code: 'PRJ-038', name: 'Spec Home — Franklin' },
  3: { id: 3, code: 'PRJ-051', name: 'Remodel — Green Hills' },
  4: { id: 4, code: 'PRJ-033', name: 'Insurance Rehab — Antioch' },
  5: { id: 5, code: 'PRJ-027', name: 'Commercial — Berry Hill' },
};

const demoEvents = [
  { id: 1, title: 'Rough Plumbing Inspection', event_type: 'inspection', start_datetime: nextWeekday(1, 9), end_datetime: nextWeekday(1, 10), project_id: 1, project_name: 'Custom Home — Brentwood', created_by: 1, all_day: false, location: '1247 Tyne Blvd, Brentwood, TN', description: 'Metro codes rough plumbing inspection — ensure all work is accessible before drywall.', attendees: ['Matt S.', 'Connor M.', 'Metro Inspector'] },
  { id: 2, title: 'Draw #3 Deadline — PRJ-042', event_type: 'draw_due', start_datetime: nextWeekday(2, 0), end_datetime: null, project_id: 1, project_name: 'Custom Home — Brentwood', created_by: 1, all_day: true, location: '', description: 'Submit draw request #3 to lender. Framing + rough-in milestone reached.', attendees: ['Matt S.'] },
  { id: 3, title: 'Owner Walkthrough — PRJ-038', event_type: 'walkthrough', start_datetime: nextWeekday(3, 14), end_datetime: nextWeekday(3, 16), project_id: 2, project_name: 'Spec Home — Franklin', created_by: 1, all_day: false, location: '830 Evans St, Franklin, TN', description: 'Pre-drywall walkthrough with homeowner. Review framing, mechanicals, and any change orders.', attendees: ['Matt S.', 'Joseph K.', 'Homeowner'] },
  { id: 4, title: 'Drywall Delivery', event_type: 'delivery', start_datetime: nextWeekday(1, 8), end_datetime: nextWeekday(1, 9), project_id: 3, project_name: 'Remodel — Green Hills', created_by: 1, all_day: false, location: '2100 Abbott Martin Rd, Green Hills, TN', description: 'Drywall delivery — 120 sheets. Crew must have garage cleared for staging.', attendees: ['Jake R.', 'Chris T.'] },
  { id: 5, title: 'Joseph PTO', event_type: 'pto', start_datetime: nextWeekday(5, 0), end_datetime: null, project_id: null, project_name: null, created_by: 3, all_day: true, location: '', description: 'Personal day off.', attendees: ['Joseph K.'] },
  { id: 6, title: 'Safety Meeting', event_type: 'meeting', start_datetime: nextWeekday(0, 7), end_datetime: nextWeekday(0, 7, 30), project_id: null, project_name: null, created_by: 1, all_day: false, location: 'SECG Office — Conference Room A', description: 'Weekly safety standup. Review incidents, near-misses, and upcoming OSHA topics.', attendees: ['Matt S.', 'Connor M.', 'Joseph K.', 'Jake R.', 'Chris T.'] },
  { id: 7, title: 'Electrical Inspection', event_type: 'inspection', start_datetime: nextWeekday(4, 10), end_datetime: nextWeekday(4, 11), project_id: 2, project_name: 'Spec Home — Franklin', created_by: 1, all_day: false, location: '830 Evans St, Franklin, TN', description: 'Rough electrical inspection — all circuits labeled, panels accessible.', attendees: ['Joseph K.', 'Metro Inspector'] },
  { id: 8, title: 'Framing Milestone Complete', event_type: 'milestone', start_datetime: nextWeekday(3, 0), end_datetime: null, project_id: 2, project_name: 'Spec Home — Franklin', created_by: 1, all_day: true, location: '', description: 'Framing 100% complete. Ready for mechanical rough-in phase.', attendees: ['Joseph K.'] },
];

const demoCrew = [
  { employee_id: 1, name: 'Matt S.', role: 'Owner' },
  { employee_id: 2, name: 'Connor M.', role: 'PM' },
  { employee_id: 3, name: 'Joseph K.', role: 'PM' },
  { employee_id: 4, name: 'Jake R.', role: 'Lead' },
  { employee_id: 5, name: 'Chris T.', role: 'Lead' },
];

function nextWeekday(dayOffset, hour, minute = 0) {
  const d = new Date();
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayOffset);
  target.setHours(hour, minute, 0, 0);
  return target.toISOString();
}

function getWeekDays(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDayHeader(d) {
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return {
    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    dayNum: d.getDate(),
    isToday,
  };
}

function formatICSDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function generateICS(event) {
  const dtStart = formatICSDate(event.start_datetime);
  const dtEnd = event.end_datetime
    ? formatICSDate(event.end_datetime)
    : formatICSDate(event.start_datetime);
  const summary = (event.title || '').replace(/[,;\\]/g, '\\$&');
  const description = (event.description || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  const location = (event.location || '').replace(/[,;\\]/g, '\\$&');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SECG ERP//Calendar//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(event.title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Calendar() {
  const navigate = useNavigate();
  const [view, setView] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const onEventClick = (event) => setSelectedEvent(event);

  const weekStart = getWeekDays(weekOffset)[0];
  const weekEnd = getWeekDays(weekOffset)[6];
  const startISO = weekStart.toISOString().split('T')[0];
  const endISO = weekEnd.toISOString().split('T')[0];

  const { data, loading, error, isDemo, refetch } = useApi(
    () => api.calendarEvents({ start: startISO, end: endISO }),
    [startISO, endISO]
  );

  const events = data || (loading ? [] : demoEvents);
  const days = getWeekDays(weekOffset);

  const eventsForDay = (d) => {
    const dayStr = d.toISOString().split('T')[0];
    return events.filter((e) => {
      const eDate = new Date(e.start_datetime).toISOString().split('T')[0];
      return eDate === dayStr;
    });
  };

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (loading) return <PageLoading />;
  if (error && !events.length) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1" style={{ borderRadius: 6, border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: view === v ? 'var(--accent)' : 'transparent',
                  color: view === v ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded" style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded text-xs font-medium" style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
              Today
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded" style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Plus size={14} /> New Event
          </button>
        </div>
      </div>

      {view === 'week' && (
        <div className="rounded-lg overflow-hidden" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const { dayName, dayNum, isToday } = formatDayHeader(d);
              return (
                <div key={d.toISOString()} className="text-center py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{dayName}</div>
                  <div
                    className="text-sm font-bold mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full"
                    style={{
                      color: isToday ? '#fff' : 'var(--text-primary)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                    }}
                  >
                    {dayNum}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7" style={{ minHeight: 400 }}>
            {days.map((d) => {
              const dayEvents = eventsForDay(d);
              return (
                <div
                  key={d.toISOString()}
                  className="p-2 space-y-1"
                  style={{ borderRight: '1px solid var(--border-subtle)' }}
                >
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => onEventClick(e)}
                      className="rounded px-2 py-1.5 text-xs cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        background: `color-mix(in srgb, ${EVENT_COLORS[e.event_type] || 'var(--accent)'} 15%, transparent)`,
                        borderLeft: `3px solid ${EVENT_COLORS[e.event_type] || 'var(--accent)'}`,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <div className="font-medium truncate">{e.title}</div>
                      {!e.all_day && (
                        <div className="flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          <Clock size={10} />
                          <span className="text-[10px]">{formatTime(e.start_datetime)}</span>
                        </div>
                      )}
                      {e.all_day && (
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>All day</div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'crew' && <CrewBoard days={days} events={events} crew={demoCrew} onEventClick={onEventClick} />}

      {view === 'month' && (
        <MonthView weekOffset={weekOffset} events={events} onEventClick={onEventClick} />
      )}

      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(EVENT_LABELS).slice(0, 8).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: EVENT_COLORS[key] }} />
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
          </div>
        ))}
      </div>

      {showModal && <EventModal onClose={() => setShowModal(false)} />}

      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
}

function CrewBoard({ days, events, crew, onEventClick }) {
  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-brand-border)' }}>
      <table className="mc-table" style={{ minWidth: 800 }}>
        <thead>
          <tr>
            <th style={{ width: 140 }}>Team Member</th>
            {days.slice(0, 5).map((d) => (
              <th key={d.toISOString()} className="text-center" style={{ minWidth: 120 }}>
                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {crew.map((emp) => (
            <tr key={emp.employee_id}>
              <td>
                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{emp.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{emp.role}</div>
              </td>
              {days.slice(0, 5).map((d) => {
                const dayStr = d.toISOString().split('T')[0];
                const dayEvents = events.filter((e) => {
                  const eDate = new Date(e.start_datetime).toISOString().split('T')[0];
                  return eDate === dayStr;
                });
                return (
                  <td key={dayStr} className="text-center">
                    {dayEvents.length > 0 ? (
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            onClick={() => onEventClick(e)}
                            className="text-[10px] px-2 py-1 rounded truncate cursor-pointer hover:opacity-80"
                            style={{
                              background: `color-mix(in srgb, ${EVENT_COLORS[e.event_type] || 'var(--accent)'} 15%, transparent)`,
                              color: EVENT_COLORS[e.event_type] || 'var(--accent)',
                              fontWeight: 500,
                            }}
                          >
                            {e.title.length > 16 ? e.title.slice(0, 16) + '...' : e.title}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthView({ weekOffset, events, onEventClick }) {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday start
  const totalDays = lastDay.getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
      <div className="p-3 text-center font-semibold" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
        {baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
          <div key={d} className="text-center py-2 text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} className="p-2 min-h-[80px]" style={{ borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }} />;
          const isToday = d.toDateString() === today.toDateString();
          const dayStr = d.toISOString().split('T')[0];
          const dayEvents = events.filter((e) => new Date(e.start_datetime).toISOString().split('T')[0] === dayStr);
          return (
            <div key={dayStr} className="p-1.5 min-h-[80px]" style={{ borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                className="text-xs font-medium mb-1 inline-flex items-center justify-center w-6 h-6 rounded-full"
                style={{ color: isToday ? '#fff' : 'var(--text-secondary)', background: isToday ? 'var(--accent)' : 'transparent' }}
              >
                {d.getDate()}
              </div>
              {dayEvents.slice(0, 3).map((e) => (
                <div key={e.id} onClick={() => onEventClick(e)} className="text-[9px] truncate rounded px-1 py-0.5 mb-0.5 cursor-pointer hover:opacity-80" style={{ background: `color-mix(in srgb, ${EVENT_COLORS[e.event_type] || 'var(--accent)'} 15%, transparent)`, color: EVENT_COLORS[e.event_type] || 'var(--accent)' }}>
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>+{dayEvents.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventDetailPanel({ event, onClose, navigate }) {
  const color = EVENT_COLORS[event.event_type] || 'var(--accent)';
  const typeLabel = EVENT_LABELS[event.event_type] || event.event_type;
  const project = event.project_id ? DEMO_PROJECTS[event.project_id] : null;
  const startDate = new Date(event.start_datetime);
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = event.all_day
    ? 'All day'
    : `${formatTime(event.start_datetime)}${event.end_datetime ? ` — ${formatTime(event.end_datetime)}` : ''}`;
  const attendees = event.attendees || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90]"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />
      {/* Slide-out panel */}
      <div
        className="fixed top-0 right-0 h-full z-[100] flex flex-col"
        style={{
          width: 400,
          maxWidth: '90vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Event Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-tertiary)', background: 'var(--bg-elevated)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Title + Badge */}
          <div>
            <div className="flex items-start gap-2">
              <h3 className="text-lg font-bold flex-1" style={{ color: 'var(--text-primary)' }}>{event.title}</h3>
            </div>
            <span
              className="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: `color-mix(in srgb, ${color} 15%, transparent)`,
                color: color,
              }}
            >
              {typeLabel}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Clock size={16} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{dateStr}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{timeStr}</div>
            </div>
          </div>

          {/* Project */}
          {project && (
            <div className="flex items-start gap-3">
              <CalendarDays size={16} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Project</div>
                <button
                  onClick={() => { navigate(`/projects/${project.id}`); onClose(); }}
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {project.code} — {project.name}
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin size={16} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Location</div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{event.location}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div
              className="rounded-md p-3 text-sm leading-relaxed"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {event.description}
            </div>
          )}

          {/* Attendees */}
          {attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                  Attendees ({attendees.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {attendees.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color: color }}
                    >
                      {name.split(' ').map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => generateICS(event)}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium flex-1 justify-center hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Download size={13} /> Export .ics
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium flex-1 justify-center hover:opacity-90 transition-opacity"
            style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
          >
            <Edit3 size={13} /> Edit
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium justify-center hover:opacity-90 transition-opacity"
            style={{ border: '1px solid var(--border-medium)', color: 'var(--status-loss)', background: 'var(--bg-elevated)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Keyframe for slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function EventModal({ onClose }) {
  const [form, setForm] = useState({
    title: '', event_type: 'meeting', start_datetime: '',
    end_datetime: '', all_day: false, project_id: '', location: '', description: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'var(--bg-overlay)' }} onClick={onClose}>
      <div
        className="rounded-lg p-6 w-full max-w-lg mx-4 space-y-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Event</h2>

        <div className="space-y-3">
          <input placeholder="Event title" value={form.title} onChange={set('title')} className="w-full px-3 py-2 rounded text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }} />
          <select value={form.event_type} onChange={set('event_type')} className="w-full px-3 py-2 rounded text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>
            {Object.entries(EVENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={form.start_datetime} onChange={set('start_datetime')} className="px-3 py-2 rounded text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }} />
            <input type="datetime-local" value={form.end_datetime} onChange={set('end_datetime')} className="px-3 py-2 rounded text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }} />
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.all_day} onChange={set('all_day')} /> All day
          </label>
          <input placeholder="Location" value={form.location} onChange={set('location')} className="w-full px-3 py-2 rounded text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }} />
          <textarea placeholder="Description" value={form.description} onChange={set('description')} rows={3} className="w-full px-3 py-2 rounded text-sm resize-none" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm font-medium" style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button className="px-4 py-2 rounded text-sm font-medium" style={{ background: 'var(--accent)', color: '#fff' }}>Create Event</button>
        </div>
      </div>
    </div>
  );
}
