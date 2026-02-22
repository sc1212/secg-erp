import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { FileText, Camera, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const demoFeed = [
  { id: 1, project_id: 1, project_code: 'PRJ-042', project_name: 'Custom Home — Brentwood', log_date: todayISO(), author_id: 2, author_name: 'Connor M.', work_performed: 'Completed rough plumbing inspection. Passed all points. Started electrical rough-in on 2nd floor.', status: 'submitted', submitted_at: todayAt(16, 32), photo_count: 4 },
  { id: 2, project_id: 2, project_code: 'PRJ-038', project_name: 'Spec Home — Franklin', log_date: todayISO(), author_id: 3, author_name: 'Joseph K.', work_performed: 'Framing crew progress — 2nd floor joists complete. Trusses staged for Monday delivery.', status: 'submitted', submitted_at: todayAt(17, 15), photo_count: 7 },
  { id: 3, project_id: 3, project_code: 'PRJ-051', project_name: 'Remodel — Green Hills', log_date: todayISO(), author_id: 2, author_name: 'Connor M.', work_performed: 'Drywall hanging — 85% complete. Expecting finish by Wednesday.', status: 'submitted', submitted_at: todayAt(16, 45), photo_count: 3 },
  { id: 4, project_id: 4, project_code: 'PRJ-033', project_name: 'Insurance Rehab — Antioch', log_date: yesterdayISO(), author_id: 4, author_name: 'Jake R.', work_performed: 'Demo complete on master bath. Discovered water damage behind wall — took photos for insurance claim.', status: 'reviewed', submitted_at: yesterdayAt(15, 20), photo_count: 12 },
  { id: 5, project_id: 5, project_code: 'PRJ-027', project_name: 'Commercial — Berry Hill', log_date: yesterdayISO(), author_id: 5, author_name: 'Chris T.', work_performed: 'Interior finish work — trim and crown molding installation. Punch list items 60% resolved.', status: 'submitted', submitted_at: yesterdayAt(17, 0), photo_count: 5 },
];

function todayISO() { return new Date().toISOString().split('T')[0]; }
function yesterdayISO() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }
function todayAt(h, m) { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); }
function yesterdayAt(h, m) { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(h, m, 0, 0); return d.toISOString(); }

const statusIcon = { draft: Clock, submitted: CheckCircle, reviewed: CheckCircle };
const statusColor = { draft: 'var(--text-tertiary)', submitted: 'var(--status-profit)', reviewed: 'var(--accent)' };

export default function DailyLogs() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Field Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} log{filtered.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>
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
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
