import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { EmptyState } from './LoadingState';
import { Plus, CheckCircle, Clock, Camera, ChevronDown, ChevronUp, Send, Save } from 'lucide-react';

const statusIcon = { draft: Clock, submitted: CheckCircle, reviewed: CheckCircle };
const statusColor = { draft: 'var(--text-tertiary)', submitted: 'var(--status-profit)', reviewed: 'var(--accent)' };

const demoLogs = [
  {
    id: 1, project_id: 1, log_date: new Date().toISOString().split('T')[0], author_id: 2,
    weather_summary: 'Partly cloudy, mild', temp_high: 72, temp_low: 48, conditions: 'Partly Cloudy',
    work_performed: 'Completed rough plumbing inspection. Passed all points. Started electrical rough-in on 2nd floor.',
    delays_issues: null, delay_severity: 'none', visitors: 'County inspector — Jim K.',
    safety_notes: 'All clear, toolbox talk on ladder safety.',
    material_deliveries: 'Romex wire delivery (12 rolls)', equipment_on_site: 'Generator, compressor',
    status: 'submitted', submitted_at: new Date().toISOString(),
    crew_entries: [
      { id: 1, entity_type: 'employee', entity_name: 'Connor M.', headcount: 1, hours: 8, trade: 'PM' },
      { id: 2, entity_type: 'subcontractor', entity_name: 'ABC Plumbing', headcount: 3, hours: 8, trade: 'Plumbing' },
      { id: 3, entity_type: 'subcontractor', entity_name: 'TN Electric', headcount: 2, hours: 6, trade: 'Electrical' },
    ],
    photos: [],
  },
];

export default function DailyLogTab({ projectId }) {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => api.projectDailyLogs(projectId),
    [projectId]
  );

  const logs = data || (loading ? [] : demoLogs);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Field Logs ({logs.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={14} /> New Log
        </button>
      </div>

      {showForm && <DailyLogForm projectId={projectId} onClose={() => { setShowForm(false); refetch(); }} />}

      {logs.length === 0 ? (
        <EmptyState title="No daily logs" message="Start documenting daily site activity" />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = statusIcon[log.status] || Clock;
            const isExpanded = expanded === log.id;
            return (
              <div key={log.id} className="rounded-lg overflow-hidden" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={16} style={{ color: statusColor[log.status], flexShrink: 0 }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{shortDate(log.log_date)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase" style={{
                          background: `color-mix(in srgb, ${statusColor[log.status]} 15%, transparent)`,
                          color: statusColor[log.status],
                        }}>{log.status}</span>
                      </div>
                      {log.work_performed && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)', maxWidth: 500 }}>
                          {log.work_performed}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {log.conditions && (
                      <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-tertiary)' }}>
                        {log.conditions} {log.temp_high && `${log.temp_high}°/${log.temp_low}°`}
                      </span>
                    )}
                    {log.crew_entries?.length > 0 && (
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {log.crew_entries.reduce((s, c) => s + c.headcount, 0)} crew
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {/* Weather strip */}
                    {log.conditions && (
                      <div className="flex items-center gap-4 pt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span>{log.conditions}</span>
                        {log.temp_high != null && <span>{log.temp_high}°F / {log.temp_low}°F</span>}
                      </div>
                    )}

                    {/* Crew on site */}
                    {log.crew_entries?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Crew on Site</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {log.crew_entries.map((c) => (
                            <div key={c.id} className="text-xs px-2 py-1.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
                              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.entity_name}</span>
                              <span style={{ color: 'var(--text-tertiary)' }}> · {c.trade} · {c.headcount}p × {c.hours}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work performed */}
                    {log.work_performed && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Work Performed</div>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.work_performed}</p>
                      </div>
                    )}

                    {/* Delays */}
                    {log.delays_issues && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--status-warning)' }}>Delays / Issues</div>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.delays_issues}</p>
                      </div>
                    )}

                    {/* Other fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {log.visitors && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Visitors</div>
                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{log.visitors}</p>
                        </div>
                      )}
                      {log.material_deliveries && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Deliveries</div>
                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{log.material_deliveries}</p>
                        </div>
                      )}
                      {log.safety_notes && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Safety</div>
                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{log.safety_notes}</p>
                        </div>
                      )}
                      {log.equipment_on_site && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Equipment</div>
                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{log.equipment_on_site}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DailyLogForm({ projectId, onClose }) {
  const [form, setForm] = useState({
    work_performed: '',
    delays_issues: '',
    delay_severity: 'none',
    visitors: '',
    safety_notes: '',
    material_deliveries: '',
    equipment_on_site: '',
  });
  const [crew, setCrew] = useState([{ entity_type: 'employee', entity_name: '', headcount: 1, hours: 8, trade: '' }]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const updateCrew = (i, field, val) => {
    const next = [...crew];
    next[i] = { ...next[i], [field]: val };
    setCrew(next);
  };

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' };

  return (
    <div className="rounded-lg p-5 space-y-4" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--accent-border)' }}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          New Daily Log — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h4>
        <button onClick={onClose} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Cancel</button>
      </div>

      {/* Weather auto strip */}
      <div className="rounded px-3 py-2 text-xs flex items-center gap-3" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
        <span>Weather auto-populated at submission</span>
      </div>

      {/* Crew */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Crew on Site</div>
          <button onClick={() => setCrew([...crew, { entity_type: 'subcontractor', entity_name: '', headcount: 1, hours: 8, trade: '' }])} className="text-[10px] font-medium" style={{ color: 'var(--accent)' }}>+ Add</button>
        </div>
        {crew.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-1.5">
            <select value={c.entity_type} onChange={(e) => updateCrew(i, 'entity_type', e.target.value)} className="col-span-3 px-2 py-1.5 rounded text-xs" style={inputStyle}>
              <option value="employee">Employee</option>
              <option value="subcontractor">Subcontractor</option>
            </select>
            <input placeholder="Name" value={c.entity_name} onChange={(e) => updateCrew(i, 'entity_name', e.target.value)} className="col-span-3 px-2 py-1.5 rounded text-xs" style={inputStyle} />
            <input placeholder="Trade" value={c.trade} onChange={(e) => updateCrew(i, 'trade', e.target.value)} className="col-span-2 px-2 py-1.5 rounded text-xs" style={inputStyle} />
            <input type="number" placeholder="#" value={c.headcount} onChange={(e) => updateCrew(i, 'headcount', +e.target.value)} className="col-span-2 px-2 py-1.5 rounded text-xs" style={inputStyle} />
            <input type="number" placeholder="Hrs" value={c.hours} onChange={(e) => updateCrew(i, 'hours', +e.target.value)} className="col-span-2 px-2 py-1.5 rounded text-xs" style={inputStyle} />
          </div>
        ))}
      </div>

      {/* Work performed */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Work Performed</div>
        <textarea value={form.work_performed} onChange={set('work_performed')} rows={3} className="w-full px-3 py-2 rounded text-sm resize-none" style={inputStyle} placeholder="What got done today?" />
      </div>

      {/* Delays */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Delays / Issues</div>
        <textarea value={form.delays_issues} onChange={set('delays_issues')} rows={2} className="w-full px-3 py-2 rounded text-sm resize-none" style={inputStyle} placeholder="Any problems or delays?" />
        <div className="flex gap-2 mt-1">
          {['none', 'minor', 'major'].map((s) => (
            <button key={s} onClick={() => setForm({ ...form, delay_severity: s })} className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase" style={{
              background: form.delay_severity === s
                ? s === 'major' ? 'var(--status-loss-bg)' : s === 'minor' ? 'var(--status-warning-bg)' : 'var(--bg-elevated)'
                : 'transparent',
              color: form.delay_severity === s
                ? s === 'major' ? 'var(--status-loss)' : s === 'minor' ? 'var(--status-warning)' : 'var(--text-secondary)'
                : 'var(--text-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Other fields in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Visitors</div>
          <input value={form.visitors} onChange={set('visitors')} className="w-full px-3 py-2 rounded text-sm" style={inputStyle} placeholder="Inspectors, owners..." />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Deliveries</div>
          <input value={form.material_deliveries} onChange={set('material_deliveries')} className="w-full px-3 py-2 rounded text-sm" style={inputStyle} placeholder="What was delivered?" />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Safety Notes</div>
          <input value={form.safety_notes} onChange={set('safety_notes')} className="w-full px-3 py-2 rounded text-sm" style={inputStyle} placeholder="Safety observations..." />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Equipment</div>
          <input value={form.equipment_on_site} onChange={set('equipment_on_site')} className="w-full px-3 py-2 rounded text-sm" style={inputStyle} placeholder="Equipment on site..." />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium" style={{ border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}>
          <Save size={14} /> Save Draft
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-medium" style={{ background: 'var(--accent)', color: '#fff' }}>
          <Send size={14} /> Submit
        </button>
      </div>
    </div>
  );
}
