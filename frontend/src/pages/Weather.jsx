import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react';

const SEVERITY_STYLES = {
  stop_work: { color: 'var(--status-loss)', bg: 'var(--status-loss-bg)', icon: AlertOctagon, label: 'STOP WORK' },
  warning: { color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', icon: AlertTriangle, label: 'CAUTION' },
  caution: { color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', icon: AlertTriangle, label: 'CAUTION' },
};

const CONDITION_ICONS = {
  'Sunny': Sun, 'Clear': Sun, 'Partly Cloudy': Cloud, 'Cloudy': Cloud,
  'Rain': CloudRain, 'Thunderstorm': CloudRain, 'Snow': Cloud, 'Drizzle': CloudRain,
};

function WeatherIcon({ conditions, size = 24 }) {
  const Icon = CONDITION_ICONS[conditions] || Cloud;
  return <Icon size={size} />;
}

export default function Weather() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(null);

  const { data, loading, error, isDemo, refetch } = useApi(() => api.weatherWeekly(), []);
  const days = data || [];

  if (loading) return <PageLoading />;
  if (error && !days.length) return <ErrorState message={error} onRetry={refetch} />;

  const selected = selectedDay !== null ? days[selectedDay] : null;
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Weather Intelligence</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>7-day forecast with job impact analysis</p>
      </div>

      {/* 7-Day Forecast Strip */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const f = day.forecast;
          const d = new Date(f.forecast_date + 'T12:00:00');
          const isToday = i === 0;
          const hasImpact = day.affected_projects > 0;
          const worstSeverity = day.impacts.length > 0
            ? (day.impacts.some(im => im.severity === 'stop_work') ? 'stop_work' : 'warning')
            : null;

          return (
            <div
              key={f.forecast_date}
              className="rounded-lg p-3 cursor-pointer transition-all text-center"
              style={{
                background: selectedDay === i ? 'var(--accent-bg)' : 'var(--color-brand-card)',
                border: `1px solid ${selectedDay === i ? 'var(--accent-border)' : hasImpact ? (worstSeverity === 'stop_work' ? 'var(--status-loss)' : 'var(--status-warning)') : 'var(--color-brand-border)'}`,
              }}
              onClick={() => setSelectedDay(selectedDay === i ? null : i)}
            >
              <div className="text-[10px] font-semibold tracking-wider" style={{ color: isToday ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                {isToday ? 'TODAY' : dayNames[d.getDay()]}
              </div>
              <div className="my-2 flex justify-center" style={{ color: hasImpact ? (worstSeverity === 'stop_work' ? 'var(--status-loss)' : 'var(--status-warning)') : 'var(--text-primary)' }}>
                <WeatherIcon conditions={f.conditions} size={28} />
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {f.temp_high_f}°<span style={{ color: 'var(--text-tertiary)' }}>/{f.temp_low_f}°</span>
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                {f.precipitation_pct}% precip
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                Wind: {f.wind_speed_mph}mph
              </div>
              {hasImpact && (
                <div className="text-[10px] font-semibold mt-1.5 px-1 py-0.5 rounded" style={{
                  background: SEVERITY_STYLES[worstSeverity]?.bg,
                  color: SEVERITY_STYLES[worstSeverity]?.color,
                }}>
                  {day.affected_projects} JOB{day.affected_projects > 1 ? 'S' : ''} AFFECTED
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Impact Detail Panel */}
      {selected && (
        <WeatherImpactPanel day={selected} onProjectClick={(id) => navigate(`/projects/${id}?tab=milestones`)} />
      )}

      {/* Impact Rules Summary */}
      <ImpactRulesPanel />
    </div>
  );
}

function WeatherImpactPanel({ day, onProjectClick }) {
  const f = day.forecast;
  const d = new Date(f.forecast_date + 'T12:00:00');
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const stopWork = day.impacts.filter(i => i.severity === 'stop_work');
  const warnings = day.impacts.filter(i => i.severity === 'warning' || i.severity === 'caution');

  // Get unique affected project IDs
  const affectedIds = new Set(day.impacts.map(i => i.project_id));

  return (
    <div className="rounded-lg p-5 space-y-4" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {dayName} — {f.conditions} ({f.precipitation_pct}% chance, {String(f.precipitation_inches)}")
          </h3>
          <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1"><Thermometer size={12} /> {f.temp_high_f}°/{f.temp_low_f}°F</span>
            <span className="flex items-center gap-1"><Wind size={12} /> {f.wind_speed_mph} mph</span>
            <span className="flex items-center gap-1"><Droplets size={12} /> {f.humidity_pct}% humidity</span>
          </div>
        </div>
      </div>

      {stopWork.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon size={14} style={{ color: 'var(--status-loss)' }} />
            <span className="text-xs font-bold uppercase" style={{ color: 'var(--status-loss)' }}>Stop Work</span>
          </div>
          <div className="space-y-1.5">
            {stopWork.map((impact, i) => (
              <ImpactRow key={i} impact={impact} onClick={() => onProjectClick(impact.project_id)} />
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} />
            <span className="text-xs font-bold uppercase" style={{ color: 'var(--status-warning)' }}>Caution</span>
          </div>
          <div className="space-y-1.5">
            {warnings.map((impact, i) => (
              <ImpactRow key={i} impact={impact} onClick={() => onProjectClick(impact.project_id)} />
            ))}
          </div>
        </div>
      )}

      {day.impacts.length === 0 && (
        <div className="flex items-center gap-2 py-2">
          <CheckCircle size={14} style={{ color: 'var(--status-profit)' }} />
          <span className="text-sm" style={{ color: 'var(--status-profit)' }}>No weather impacts — all clear for work</span>
        </div>
      )}
    </div>
  );
}

function ImpactRow({ impact, onClick }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors"
      style={{ background: 'var(--bg-elevated)' }}
      onClick={onClick}
    >
      <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>{impact.project_code}</span>
      <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>
        {impact.trade_or_activity} — {impact.message}
      </span>
      <span className="text-[10px] font-medium shrink-0" style={{ color: 'var(--accent)' }}>View &rarr;</span>
    </div>
  );
}

function ImpactRulesPanel() {
  const { data } = useApi(() => api.weatherRules(), []);
  const rules = data || [];
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? rules : rules.slice(0, 6);

  return (
    <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
      <div className="panel-head" style={{ marginBottom: 12 }}>
        <div>
          <h3 className="panel-title">Impact Rules</h3>
          <div className="panel-sub">Configurable thresholds for weather-sensitive activities</div>
        </div>
        {rules.length > 6 && (
          <button className="ghost-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : `Show All (${rules.length})`}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="mc-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Condition</th>
              <th>Threshold</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {display.map((r, i) => (
              <tr key={r.id || i}>
                <td className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.trade_or_activity}</td>
                <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.condition_field.replace(/_/g, ' ')}</td>
                <td className="num text-xs">{r.operator} {String(r.threshold_value)}</td>
                <td>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded" style={{
                    background: SEVERITY_STYLES[r.severity]?.bg || 'var(--bg-elevated)',
                    color: SEVERITY_STYLES[r.severity]?.color || 'var(--text-secondary)',
                  }}>
                    {r.severity?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
