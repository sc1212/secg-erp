import { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';

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

const demoEvents = [
  { id: 1, title: 'Rough Plumbing Inspection', event_type: 'inspection', start_datetime: nextWeekday(1, 9), end_datetime: nextWeekday(1, 10), project_id: 1, created_by: 1, all_day: false, attendees: [] },
  { id: 2, title: 'Draw #3 Deadline — PRJ-042', event_type: 'draw_due', start_datetime: nextWeekday(2, 0), end_datetime: null, project_id: 1, created_by: 1, all_day: true, attendees: [] },
  { id: 3, title: 'Owner Walkthrough — PRJ-038', event_type: 'walkthrough', start_datetime: nextWeekday(3, 14), end_datetime: nextWeekday(3, 16), project_id: 2, created_by: 1, all_day: false, attendees: [] },
  { id: 4, title: 'Drywall Delivery', event_type: 'delivery', start_datetime: nextWeekday(1, 8), end_datetime: nextWeekday(1, 9), project_id: 3, created_by: 1, all_day: false, attendees: [] },
  { id: 5, title: 'Joseph PTO', event_type: 'pto', start_datetime: nextWeekday(5, 0), end_datetime: null, project_id: null, created_by: 3, all_day: true, attendees: [] },
  { id: 6, title: 'Safety Meeting', event_type: 'meeting', start_datetime: nextWeekday(0, 7), end_datetime: nextWeekday(0, 7, 30), project_id: null, created_by: 1, all_day: false, attendees: [] },
  { id: 7, title: 'Electrical Inspection', event_type: 'inspection', start_datetime: nextWeekday(4, 10), end_datetime: nextWeekday(4, 11), project_id: 2, created_by: 1, all_day: false, attendees: [] },
  { id: 8, title: 'Framing Milestone Complete', event_type: 'milestone', start_datetime: nextWeekday(3, 0), end_datetime: null, project_id: 2, created_by: 1, all_day: true, attendees: [] },
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

export default function Calendar() {
  const [view, setView] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);

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
                      className="rounded px-2 py-1.5 text-xs cursor-pointer transition-opacity"
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

      {view === 'crew' && <CrewBoard days={days} events={events} crew={demoCrew} />}

      {view === 'month' && (
        <MonthView weekOffset={weekOffset} events={events} />
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
    </div>
  );
}

function CrewBoard({ days, events, crew }) {
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
                            className="text-[10px] px-2 py-1 rounded truncate"
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

function MonthView({ weekOffset, events }) {
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
                <div key={e.id} className="text-[9px] truncate rounded px-1 py-0.5 mb-0.5" style={{ background: `color-mix(in srgb, ${EVENT_COLORS[e.event_type] || 'var(--accent)'} 15%, transparent)`, color: EVENT_COLORS[e.event_type] || 'var(--accent)' }}>
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
