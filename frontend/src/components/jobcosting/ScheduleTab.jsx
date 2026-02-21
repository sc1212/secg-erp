import { useState } from 'react';
import { shortDate, pct, statusBadge } from '../../lib/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

const milestoneColor = {
  completed: 'bg-ok',
  in_progress: 'bg-brand-gold',
  not_started: 'bg-brand-border',
  delayed: 'bg-warn',
  blocked: 'bg-danger',
};

export default function ScheduleTab({ project }) {
  const [expanded, setExpanded] = useState(null);
  const milestones = project.milestones || [];

  const completed = milestones.filter((m) => m.status === 'completed').length;
  const inProgress = milestones.filter((m) => m.status === 'in_progress').length;
  const notStarted = milestones.filter((m) => m.status === 'not_started').length;

  // Calculate days variance for completed milestones
  const getDaysVariance = (m) => {
    if (!m.actual_end || !m.planned_end) return null;
    const planned = new Date(m.planned_end);
    const actual = new Date(m.actual_end);
    return Math.round((actual - planned) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Completed', value: completed, total: milestones.length, color: 'text-ok' },
          { label: 'In Progress', value: inProgress, total: milestones.length, color: 'text-brand-gold' },
          { label: 'Remaining', value: notStarted, total: milestones.length, color: 'text-brand-muted' },
        ].map((card) => (
          <div key={card.label} className="bg-brand-card border border-brand-border rounded-xl p-4">
            <div className="text-xs text-brand-muted">{card.label}</div>
            <div className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-brand-muted">of {card.total} milestones</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4">
        <div className="flex justify-between text-xs text-brand-muted mb-2">
          <span>Overall Progress</span>
          <span>{pct((completed / milestones.length) * 100)}</span>
        </div>
        <div className="h-3 bg-brand-bg rounded-full overflow-hidden flex">
          <div className="h-full bg-ok transition-all" style={{ width: `${(completed / milestones.length) * 100}%` }} />
          <div className="h-full bg-brand-gold transition-all" style={{ width: `${(inProgress / milestones.length) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-brand-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ok" /> Complete</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-gold" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-border" /> Not Started</span>
        </div>
      </div>

      {/* Timeline list */}
      <div className="space-y-2">
        {milestones.map((m) => {
          const isExpanded = expanded === m.id;
          const daysVar = getDaysVariance(m);

          return (
            <div key={m.id} className="bg-brand-card border border-brand-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : m.id)}
                className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-brand-card-hover transition-colors"
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${milestoneColor[m.status] || 'bg-brand-border'}`} />
                {isExpanded ? <ChevronDown size={12} className="text-brand-gold shrink-0" /> : <ChevronRight size={12} className="text-brand-muted shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{m.task_name}</div>
                  <div className="text-xs text-brand-muted">
                    {shortDate(m.planned_start)} → {shortDate(m.planned_end)}
                    {m.actual_end && <span className="text-ok ml-2">Done: {shortDate(m.actual_end)}</span>}
                    {daysVar !== null && daysVar !== 0 && (
                      <span className={`ml-2 ${daysVar > 0 ? 'text-warn' : 'text-ok'}`}>
                        ({daysVar > 0 ? `+${daysVar}d late` : `${Math.abs(daysVar)}d early`})
                      </span>
                    )}
                  </div>
                </div>
                {m.percentComplete != null && m.status === 'in_progress' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-brand-bg rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full" style={{ width: `${m.percentComplete}%` }} />
                    </div>
                    <span className="text-xs text-brand-muted">{pct(m.percentComplete)}</span>
                  </div>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${statusBadge(m.status)}`}>
                  {m.status?.replace('_', ' ')}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 py-3 bg-brand-surface border-t border-brand-border/50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase">Planned Start</div>
                      <div className="font-medium mt-0.5">{shortDate(m.planned_start)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase">Planned End</div>
                      <div className="font-medium mt-0.5">{shortDate(m.planned_end)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase">Actual Start</div>
                      <div className="font-medium mt-0.5">{m.actual_start ? shortDate(m.actual_start) : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase">Actual End</div>
                      <div className="font-medium mt-0.5">{m.actual_end ? shortDate(m.actual_end) : '—'}</div>
                    </div>
                  </div>
                  {m.dependencies && m.dependencies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-border/30">
                      <div className="text-[10px] text-brand-muted uppercase">Dependencies</div>
                      <div className="flex gap-2 mt-1">
                        {m.dependencies.map((depId) => {
                          const dep = milestones.find((ms) => ms.id === depId);
                          return dep ? (
                            <span key={depId} className="px-2 py-0.5 bg-brand-card border border-brand-border rounded text-xs">
                              {dep.task_name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
