import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Cloud, CloudRain, MapPin, Sun, Thermometer, Wind } from 'lucide-react';

function todayPlus(days) {
  const d = new Date('2026-02-22');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const CONDITION_ICONS = {
  'Sunny': Sun, 'Clear': Sun, 'Partly Cloudy': Cloud, 'Cloudy': Cloud,
  'Rain': CloudRain, 'Thunderstorm': CloudRain, 'Drizzle': CloudRain,
};

const WEATHER = {
  location: 'Murfreesboro, TN',
  current: { temp: 48, conditions: 'Partly Cloudy', high: 55, low: 38, wind_speed: 8, wind_dir: 'NW', humidity: 42, precipitation: 10 },
  forecast: [
    { date: todayPlus(0), day: 'Today', high: 55, low: 38, conditions: 'Partly Cloudy', precip: 10 },
    { date: todayPlus(1), day: 'Mon',   high: 52, low: 35, conditions: 'Sunny',         precip: 0  },
    { date: todayPlus(2), day: 'Tue',   high: 58, low: 40, conditions: 'Sunny',         precip: 5  },
    { date: todayPlus(3), day: 'Wed',   high: 45, low: 32, conditions: 'Rain',          precip: 70 },
    { date: todayPlus(4), day: 'Thu',   high: 42, low: 30, conditions: 'Rain',          precip: 60 },
    { date: todayPlus(5), day: 'Fri',   high: 50, low: 34, conditions: 'Partly Cloudy', precip: 10 },
    { date: todayPlus(6), day: 'Sat',   high: 54, low: 36, conditions: 'Sunny',         precip: 0  },
  ],
  alerts: [
    { message: 'Freeze warning Tuesday night — protect exposed concrete and pipes', severity: 'warning' },
    { message: 'Rain Wed-Thu — potential delays, cover exposed materials', severity: 'warning' },
  ],
  jobsites: [
    { id: 1, name: 'Riverside Custom Home',    address: '1204 River Bend Rd, Murfreesboro', temp: 48, conditions: 'Partly Cloudy', impacted: false, impact: null },
    { id: 2, name: 'Oak Creek Spec Home',       address: '874 Oak Creek Dr, Franklin',       temp: 47, conditions: 'Partly Cloudy', impacted: false, impact: null },
    { id: 3, name: 'Magnolia Spec Home',        address: '332 Magnolia Ln, Brentwood',       temp: 49, conditions: 'Cloudy',        impacted: true,  impact: 'Rain expected Wed-Thu' },
    { id: 4, name: 'Johnson Insurance Rehab',   address: '109 Johnson Ave, Murfreesboro',    temp: 48, conditions: 'Partly Cloudy', impacted: false, impact: null },
    { id: 5, name: 'Highland Terrace Spec',     address: '540 Highland Terrace, Nashville',  temp: 46, conditions: 'Cloudy',        impacted: true,  impact: 'Freeze risk Tue night' },
    { id: 6, name: 'Summit Ridge Custom',       address: '28 Summit Ridge Rd, Nolensville',  temp: 44, conditions: 'Cloudy',        impacted: true,  impact: 'Rain Wed, freeze risk' },
  ],
};

const RULES = [
  { icon: Thermometer, color: 'var(--status-loss)',    text: 'Temp < 32°F — freeze warning, protect concrete and pipes' },
  { icon: CloudRain,   color: 'var(--status-warning)', text: 'Precip > 50% — rain likely, cover exposed materials' },
  { icon: Wind,        color: 'var(--status-loss)',    text: 'Wind > 25 mph — suspend crane operations' },
  { icon: Thermometer, color: 'var(--status-warning)', text: 'Temp > 95°F — heat advisory, enforce hydration breaks' },
];

export default function Weather() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const WeatherIcon = CONDITION_ICONS[WEATHER.current.conditions] || Cloud;
  const impacted = WEATHER.jobsites.filter(j => j.impacted).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Weather Intelligence</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Auto-updated daily &middot; {WEATHER.location} &middot; {impacted} jobsite{impacted !== 1 ? 's' : ''} impacted this week</p>
      </div>

      {/* Alert Banner */}
      {WEATHER.alerts.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WEATHER.alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 14 }}>Current Conditions</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <WeatherIcon size={48} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', lineHeight: 1 }}>{WEATHER.current.temp}°F</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{WEATHER.current.conditions}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              ['High / Low', `${WEATHER.current.high}° / ${WEATHER.current.low}°`],
              ['Wind', `${WEATHER.current.wind_speed} mph ${WEATHER.current.wind_dir}`],
              ['Humidity', `${WEATHER.current.humidity}%`],
              ['Precip Chance', `${WEATHER.current.precipitation}%`],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>7-Day Forecast</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {WEATHER.forecast.map((day, i) => {
            const Icon = CONDITION_ICONS[day.conditions] || Cloud;
            const rainRisk = day.precip > 40;
            const isToday = i === 0;
            return (
              <div key={day.date} style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 8, background: isToday ? 'rgba(59,130,246,0.10)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(59,130,246,0.20)' : '1px solid transparent' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isToday ? '#3b82f6' : 'var(--text-tertiary)', marginBottom: 8 }}>{isToday ? 'Today' : day.day}</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <Icon size={22} style={{ color: rainRisk ? 'var(--status-warning)' : 'var(--text-secondary)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{day.high}°</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{day.low}°</div>
                {day.precip > 0 && (
                  <div style={{ fontSize: 10, marginTop: 4, color: rainRisk ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{day.precip}%</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Jobsite Conditions */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Jobsite Conditions</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Click a site to open project details</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {WEATHER.jobsites.map((site, i) => {
            const Icon = CONDITION_ICONS[site.conditions] || Cloud;
            return (
              <div
                key={site.id}
                onClick={() => navigate(`/projects/${site.id}`)}
                style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 14, borderTop: i === 0 ? 'none' : '1px solid var(--color-brand-border)', cursor: 'pointer', background: site.impacted ? 'rgba(251,191,36,0.04)' : 'transparent' }}
              >
                <Icon size={20} style={{ color: site.impacted ? 'var(--status-warning)' : 'var(--text-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{site.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <MapPin size={10} /> {site.address}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{site.temp}°F</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{site.conditions}</div>
                </div>
                {site.impacted && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(251,191,36,0.14)', color: 'var(--status-warning)', whiteSpace: 'nowrap', marginLeft: 4 }}>{site.impact}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Construction Rules */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Construction Weather Rules</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {RULES.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-brand-border)' }}>
              <r.icon size={16} style={{ color: r.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Weather data auto-syncs daily at 5:00 AM &middot; {WEATHER.location}
      </div>
    </div>
  );
}
