import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { Trophy, Target, TrendingUp, DollarSign, Users, Calendar, Award, BarChart3 } from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const demoLeaderboard = [
  { employee_id: 2, employee_name: 'Connor M.', role: 'PM', total_score: 82, estimated_bonus: 3280, metrics: { margin: '18.2%', logs: '95%', on_time: '100%' } },
  { employee_id: 3, employee_name: 'Joseph K.', role: 'PM', total_score: 74, estimated_bonus: 2960, metrics: { margin: '15.8%', logs: '88%', on_time: '90%' } },
  { employee_id: 4, employee_name: 'Jake R.', role: 'Lead', total_score: 68, estimated_bonus: 2720, metrics: { margin: '14.1%', logs: '92%', on_time: '85%' } },
  { employee_id: 6, employee_name: 'Zach P.', role: 'HVAC', total_score: 55, estimated_bonus: 1040, metrics: { margin: '22.4%', logs: '60%', on_time: '—' } },
];

const demoProgram = {
  id: 1, name: 'Q1 2026 Incentive Program', description: 'Performance-based quarterly bonus pool',
  start_date: '2026-01-01', end_date: '2026-03-31', total_pool: 15000, status: 'active',
  metrics: [
    { id: 1, metric_key: 'job_margin', label: 'Job Margin %', weight: 40, target_value: 18, min_value: 10, max_value: 25 },
    { id: 2, metric_key: 'daily_log_completion', label: 'Daily Log Completion', weight: 30, target_value: 100, min_value: 70, max_value: 100 },
    { id: 3, metric_key: 'on_time_completion', label: 'On-Time Milestones', weight: 30, target_value: 95, min_value: 75, max_value: 100 },
  ],
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

function scoreBarColor(score) {
  if (score >= 80) return 'var(--status-profit)';
  if (score >= 60) return 'var(--accent)';
  return 'var(--status-warning)';
}

function scoreBarBg(score) {
  if (score >= 80) return 'var(--status-profit-bg)';
  if (score >= 60) return 'var(--accent-bg)';
  return 'var(--status-warning-bg)';
}

function scoreTierLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Developing';
}

function rankStyle(rank) {
  if (rank === 1) return { bg: 'color-mix(in srgb, #D4AF37 15%, transparent)', color: '#D4AF37', border: 'color-mix(in srgb, #D4AF37 40%, transparent)' };
  if (rank === 2) return { bg: 'color-mix(in srgb, #C0C0C0 15%, transparent)', color: '#C0C0C0', border: 'color-mix(in srgb, #C0C0C0 40%, transparent)' };
  if (rank === 3) return { bg: 'color-mix(in srgb, #CD7F32 15%, transparent)', color: '#CD7F32', border: 'color-mix(in srgb, #CD7F32 40%, transparent)' };
  return { bg: 'var(--color-brand-card)', color: 'var(--text-tertiary)', border: 'var(--color-brand-border)' };
}

function formatPeriod(start, end) {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(s)} — ${fmt(e)}`;
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function Scorecard() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // API calls
  const { data: leaderboardData, loading: loadingLb, error: errorLb, isDemo: isDemoLb } = useApi(
    () => api.scorecardLeaderboard(),
    []
  );

  const { data: programsData, loading: loadingPg, error: errorPg, isDemo: isDemoPg } = useApi(
    () => api.scorecardPrograms(),
    []
  );

  const loading = loadingLb || loadingPg;
  const error = errorLb || errorPg;
  const isDemo = isDemoLb || isDemoPg;

  const leaderboard = leaderboardData || (loading ? [] : demoLeaderboard);
  const programs = programsData || (loading ? [] : [demoProgram]);
  const program = programs.length > 0 ? programs[0] : demoProgram;

  if (loading) return <PageLoading />;
  if (error && !leaderboard.length) return <ErrorState message={error} />;

  const sorted = [...leaderboard].sort((a, b) => b.total_score - a.total_score);
  const totalBonuses = sorted.reduce((s, e) => s + (e.estimated_bonus || 0), 0);

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Employee Scorecard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {program.name} &middot; Pool: {money(program.total_pool)}
        </p>
      </div>

      {/* Program Info Card */}
      <div
        className="rounded-lg p-5"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              <Trophy size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {program.name}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {program.description}
              </p>
            </div>
          </div>
          <span
            className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
            style={{
              background: program.status === 'active' ? 'var(--status-profit-bg)' : 'var(--status-warning-bg)',
              color: program.status === 'active' ? 'var(--status-profit)' : 'var(--status-warning)',
            }}
          >
            {program.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Period
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={13} style={{ color: 'var(--text-tertiary)' }} />
              {formatPeriod(program.start_date, program.end_date)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Total Pool
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--status-profit)' }}>
              <DollarSign size={13} style={{ color: 'var(--status-profit)' }} />
              {money(program.total_pool)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Participants
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <Users size={13} style={{ color: 'var(--text-tertiary)' }} />
              {sorted.length} employees
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Allocated
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={13} style={{ color: 'var(--accent)' }} />
              {money(totalBonuses)} of {money(program.total_pool)}
            </div>
          </div>
        </div>

        {/* Metric Weights (inline) */}
        <div
          className="mt-4 pt-4 flex flex-wrap gap-3"
          style={{ borderTop: '1px solid var(--color-brand-border)' }}
        >
          {(program.metrics || []).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              <Target size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {m.label}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {m.weight}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Leaderboard
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Ranked by total score
          </span>
        </div>

        <div className="space-y-3">
          {sorted.map((entry, i) => {
            const rank = i + 1;
            const rs = rankStyle(rank);
            const barColor = scoreBarColor(entry.total_score);
            const barBg = scoreBarBg(entry.total_score);
            const isExpanded = selectedEmployee === entry.employee_id;

            return (
              <div
                key={entry.employee_id}
                className="rounded-lg overflow-hidden transition-colors"
                style={{
                  background: 'var(--color-brand-card)',
                  border: `1px solid ${isExpanded ? barColor : 'var(--color-brand-border)'}`,
                }}
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedEmployee(isExpanded ? null : entry.employee_id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                    >
                      {rank}
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {entry.employee_name}
                        </span>
                        <span
                          className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                        >
                          {entry.role}
                        </span>
                      </div>

                      {/* Score Bar */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-1 h-2.5 rounded-full overflow-hidden"
                          style={{ background: barBg }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(entry.total_score, 100)}%`,
                              background: barColor,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold shrink-0 w-8 text-right" style={{ color: barColor }}>
                          {entry.total_score}
                        </span>
                      </div>

                      <div className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {scoreTierLabel(entry.total_score)}
                      </div>
                    </div>

                    {/* Bonus */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold num" style={{ color: 'var(--status-profit)' }}>
                        {money(entry.estimated_bonus)}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        est. bonus
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Metrics */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-0"
                    style={{ borderTop: '1px solid var(--color-brand-border)' }}
                  >
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <MetricDetail
                        label="Job Margin %"
                        value={entry.metrics.margin}
                        target="18%"
                        weight={40}
                        icon={TrendingUp}
                      />
                      <MetricDetail
                        label="Daily Log Completion"
                        value={entry.metrics.logs}
                        target="100%"
                        weight={30}
                        icon={BarChart3}
                      />
                      <MetricDetail
                        label="On-Time Milestones"
                        value={entry.metrics.on_time}
                        target="95%"
                        weight={30}
                        icon={Target}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Breakdown Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Metric Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th className="num">Weight</th>
                <th className="num">Target</th>
                <th className="num">Min</th>
                <th className="num">Max</th>
              </tr>
            </thead>
            <tbody>
              {(program.metrics || []).map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Target size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {m.label}
                      </span>
                    </div>
                  </td>
                  <td className="num">
                    <div className="flex items-center gap-2 justify-end">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${m.weight}px`,
                          background: 'var(--accent)',
                        }}
                      />
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {m.weight}%
                      </span>
                    </div>
                  </td>
                  <td className="num">
                    <span className="text-sm font-medium" style={{ color: 'var(--status-profit)' }}>
                      {m.target_value}{m.metric_key === 'job_margin' ? '%' : '%'}
                    </span>
                  </td>
                  <td className="num">
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {m.min_value}{m.metric_key === 'job_margin' ? '%' : '%'}
                    </span>
                  </td>
                  <td className="num">
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {m.max_value}{m.metric_key === 'job_margin' ? '%' : '%'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Metric Detail Card ─────────────────────────────────────────────────── */

function MetricDetail({ label, value, target, weight, icon: Icon }) {
  const isNA = value === '—' || value === '--';
  const numericValue = isNA ? 0 : parseFloat(value);
  const numericTarget = parseFloat(target);
  const atOrAbove = !isNA && numericValue >= numericTarget;

  return (
    <div
      className="rounded-lg p-3"
      style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color: 'var(--accent)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span
            className="text-lg font-bold"
            style={{ color: isNA ? 'var(--text-tertiary)' : atOrAbove ? 'var(--status-profit)' : 'var(--text-primary)' }}
          >
            {value}
          </span>
          <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            target: {target}
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {weight}%
        </span>
      </div>
    </div>
  );
}
