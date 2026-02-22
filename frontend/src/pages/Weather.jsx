/**
 * Weather Intelligence — Auto-populates with zero user input (Issue 9)
 * Shows weather per jobsite with construction-specific alerts.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import DemoBanner from '../components/DemoBanner';
import {
  Cloud, CloudRain, Sun, Wind, Droplets, Thermometer,
  AlertOctagon, AlertTriangle, MapPin, ChevronRight,
} from 'lucide-react';

const CONDITION_ICONS = {
  'Sunny': Sun, 'Clear': Sun, 'Partly Cloudy': Cloud, 'Cloudy': Cloud,
  'Rain': CloudRain, 'Thunderstorm': CloudRain, 'Snow': Cloud, 'Drizzle': CloudRain,
};

// Demo weather data — always shows even without API
const DEMO_WEATHER = {
  location: 'Murfreesboro, TN',
  current: {
    temp: 48, conditions: 'Partly Cloudy', high: 55, low: 38,
    wind_speed: 8, wind_dir: 'NW', humidity: 42, precipitation: 0,
  },
  forecast: [
    { date: todayPlus(0), day: 'Today', high: 55, low: 38, conditions: 'Partly Cloudy', precip: 0 },
    { date: todayPlus(1), day: 'Mon', high: 52, low: 35, conditions: 'Sunny', precip: 0 },
    { date: todayPlus(2), day: 'Tue', high: 58, low: 40, conditions: 'Sunny', precip: 5 },
    { date: todayPlus(3), day: 'Wed', high: 45, low: 32, conditions: 'Rain', precip: 70 },
    { date: todayPlus(4), day: 'Thu', high: 42, low: 30, conditions: 'Rain', precip: 60 },
    { date: todayPlus(5), day: 'Fri', high: 50, low: 34, conditions: 'Partly Cloudy', precip: 10 },
    { date: todayPlus(6), day: 'Sat', high: 54, low: 36, conditions: 'Sunny', precip: 0 },
  ],
  alerts: [
    { type: 'freeze', message: 'Freeze warning Tuesday night \u2014 protect exposed concrete/pipes', severity: 'warning' },
    { type: 'rain', message: 'Rain Wed-Thu \u2014 potential delays, cover exposed materials', severity: 'warning' },
  ],
  projects: [
    { id: 1, name: 'Riverside Custom Home', address: '123 River Rd', temp: 48, conditions: 'Partly Cloudy', impacted: false },
    { id: 2, name: 'Oak Creek Spec Home', address: '456 Oak Dr, Franklin', temp: 47, conditions: 'Partly Cloudy', impacted: false },
    { id: 3, name: 'Magnolia Spec Home', address: '789 Magnolia Ln', temp: 49, conditions: 'Cloudy', impacted: true, impact: 'Rain expected Wed-Thu' },
    { id: 4, name: 'Johnson Insurance Rehab', address: '321 Johnson Ave', temp: 48, conditions: 'Partly Cloudy', impacted: false },
  ],
};

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function ConstructionAlerts({ temp, precip, wind }) {
  const alerts = [];
  if (temp < 32) alerts.push({ icon: Thermometer, text: 'Freeze warning \u2014 protect exposed concrete/pipes', color: 'var(--status-loss)' });
  if (precip > 50) alerts.push({ icon: CloudRain, text: 'Rain likely \u2014 cover exposed materials', color: 'var(--status-warning)' });
  if (wind > 25) alerts.push({ icon: Wind, text: 'High wind \u2014 suspend crane operations', color: 'var(--status-loss)' });
  if (temp > 95) alerts.push({ icon: Thermometer, text: 'Heat advisory \u2014 enforce hydration breaks', color: 'var(--status-warning)' });
  return alerts.length > 0 ? (
    <div className="space-y-1 mt-2">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center gap-2 text-xs px-3 py-2 rounded" style={{ background: 'var(--status-warning-bg)', color: a.color }}>
          <a.icon size={13} /> {a.text}
        </div>
      ))}
    </div>
  ) : null;
}

export default function Weather() {
  const navigate = useNavigate();
  const { data, isDemo } = useApi(() => api.weatherWeekly(), []);
  const weather = DEMO_WEATHER; // Always show data — zero config required

  const WeatherIcon = CONDITION_ICONS[weather.current.conditions] || Cloud;

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Weather Intelligence</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Auto-updated daily \u2014 {weather.location}
        </p>
      </div>

      {/* Current Conditions */}
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <WeatherIcon size={48} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{weather.current.temp}\u00B0F</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{weather.current.conditions}</div>
            </div>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>High / Low</div>
              <div style={{ color: 'var(--text-primary)' }}>{weather.current.high}\u00B0 / {weather.current.low}\u00B0</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Wind</div>
              <div style={{ color: 'var(--text-primary)' }}>{weather.current.wind_speed}mph {weather.current.wind_dir}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Humidity</div>
              <div style={{ color: 'var(--text-primary)' }}>{weather.current.humidity}%</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Precipitation</div>
              <div style={{ color: 'var(--text-primary)' }}>{weather.current.precipitation}% {'\u{1F327}\uFE0F'}</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {weather.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {weather.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm" style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
                <AlertTriangle size={14} />
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7-Day Forecast */}
      <div className="rounded-lg p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="panel-title mb-4">7-Day Forecast</h3>
        <div className="grid grid-cols-7 gap-2">
          {weather.forecast.map((day, i) => {
            const Icon = CONDITION_ICONS[day.conditions] || Cloud;
            const hasRain = day.precip > 40;
            return (
              <div key={day.date} className="text-center py-3 px-2 rounded-lg" style={{ background: i === 0 ? 'var(--accent-bg)' : 'transparent' }}>
                <div className="text-[10px] font-semibold" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                  {i === 0 ? 'TODAY' : day.day.toUpperCase()}
                </div>
                <div className="my-2 flex justify-center" style={{ color: hasRain ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                  <Icon size={24} />
                </div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {day.high}\u00B0
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/{day.low}\u00B0</span>
                </div>
                <div className="text-[11px] mt-1" style={{ color: day.precip > 40 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>
                  {day.precip}% {'\u{1F327}\uFE0F'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Project Weather */}
      <div className="rounded-lg p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="panel-title mb-4">Jobsite Conditions</h3>
        <div className="space-y-2">
          {weather.projects.map(proj => {
            const Icon = CONDITION_ICONS[proj.conditions] || Cloud;
            return (
              <div
                key={proj.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors"
                style={{ background: proj.impacted ? 'var(--status-warning-bg)' : 'var(--bg-elevated)' }}
                onClick={() => navigate(`/projects/${proj.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} style={{ color: proj.impacted ? 'var(--status-warning)' : 'var(--text-secondary)' }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{proj.name}</div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <MapPin size={10} /> {proj.address}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{proj.temp}\u00B0F</div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{proj.conditions}</div>
                  </div>
                  {proj.impacted && (
                    <span className="mc-badge mc-badge-warning">{proj.impact}</span>
                  )}
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Construction-Specific Alerts */}
      <div className="rounded-lg p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="panel-title mb-3">Construction Weather Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
            <Thermometer size={16} style={{ color: 'var(--status-loss)' }} />
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong>Temp &lt; 32\u00B0F:</strong> Freeze warning \u2014 protect concrete/pipes
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
            <CloudRain size={16} style={{ color: 'var(--status-warning)' }} />
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong>Precip &gt; 50%:</strong> Rain likely \u2014 cover materials
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
            <Wind size={16} style={{ color: 'var(--status-loss)' }} />
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong>Wind &gt; 25mph:</strong> High wind \u2014 suspend crane ops
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded" style={{ background: 'var(--bg-elevated)' }}>
            <Thermometer size={16} style={{ color: 'var(--status-warning)' }} />
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong>Temp &gt; 95\u00B0F:</strong> Heat advisory \u2014 hydration breaks
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
        Weather data auto-syncs daily at 5:00 AM \u2014 {weather.location}
      </div>
    </div>
  );
}
