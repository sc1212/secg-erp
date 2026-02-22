import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Cloud, CloudRain, MapPin, Sun, Thermometer, Wind, CheckCircle, XCircle, BarChart2, Calendar } from 'lucide-react';

function todayPlus(days) {
  const d = new Date('2026-02-22');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function dayLabel(dateStr, i) {
  if (i === 0) return 'Today';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr + 'T12:00:00').getDay()];
}

const CONDITION_ICONS = {
  'Sunny': Sun, 'Clear': Sun, 'Partly Cloudy': Cloud, 'Cloudy': Cloud,
  'Rain': CloudRain, 'Thunderstorm': CloudRain, 'Drizzle': CloudRain,
};

const FORECAST = [
  { date: todayPlus(0), high: 55, low: 38, conditions: 'Partly Cloudy', precip: 10, windMph: 8,  humidity: 45 },
  { date: todayPlus(1), high: 52, low: 35, conditions: 'Sunny',         precip: 0,  windMph: 6,  humidity: 40 },
  { date: todayPlus(2), high: 58, low: 40, conditions: 'Sunny',         precip: 5,  windMph: 10, humidity: 38 },
  { date: todayPlus(3), high: 45, low: 32, conditions: 'Rain',          precip: 70, windMph: 22, humidity: 88 },
  { date: todayPlus(4), high: 42, low: 30, conditions: 'Rain',          precip: 60, windMph: 18, humidity: 84 },
  { date: todayPlus(5), high: 50, low: 34, conditions: 'Partly Cloudy', precip: 10, windMph: 8,  humidity: 55 },
  { date: todayPlus(6), high: 54, low: 36, conditions: 'Sunny',         precip: 0,  windMph: 5,  humidity: 42 },
];

const JOBSITES = [
  { id: 1, name: 'Riverside Custom',  address: '123 Oak St, Murfreesboro', temp: 48, conditions: 'Partly Cloudy', phase: 'Framing' },
  { id: 2, name: 'Oak Creek',         address: '456 Elm Dr, La Vergne',    temp: 47, conditions: 'Partly Cloudy', phase: 'Foundation' },
  { id: 4, name: 'Magnolia Spec',     address: '321 Magnolia Way, Smyrna', temp: 49, conditions: 'Cloudy',        phase: 'Finishes' },
  { id: 5, name: 'Johnson Office TI', address: '100 Main St, Murfreesboro',temp: 48, conditions: 'Partly Cloudy', phase: 'Punch List' },
  { id: 6, name: 'Elm St Multifamily',address: '500 Elm St, Nashville',    temp: 46, conditions: 'Cloudy',        phase: 'Framing' },
  { id: 7, name: 'Walnut Spec',       address: '88 Walnut Cir, Murfreesboro', temp: 48, conditions: 'Partly Cloudy', phase: 'MEP Rough-in' },
];

// Trade-specific impact rules
const TRADE_RULES = [
  { trade: 'Concrete / Foundation', icon: '🏗', thresholds: [
    { cond: d => d.low < 35,           level: 'stop',    label: 'STOP',   reason: `Low temp ${'{'}d.low{'}'}°F — concrete won't cure below 35°F` },
    { cond: d => d.low < 40,           level: 'caution', label: 'CAUTION',reason: 'Low temp risk — require concrete blankets and curing protection' },
    { cond: d => d.precip > 50,        level: 'stop',    label: 'STOP',   reason: 'Rain > 50% — postpone pours, rainwater compromises concrete mix' },
  ]},
  { trade: 'Framing', icon: '🪵', thresholds: [
    { cond: d => d.windMph > 25,       level: 'stop',    label: 'STOP',   reason: `Wind ${'{'}d.windMph{'}'}mph — suspend crane & lift operations per OSHA` },
    { cond: d => d.windMph > 20,       level: 'caution', label: 'CAUTION',reason: 'High wind — restrict use of lift equipment, extra bracing required' },
    { cond: d => d.precip > 60,        level: 'caution', label: 'CAUTION',reason: 'Heavy rain — OSB and lumber must be covered, inspect for warping' },
  ]},
  { trade: 'Roofing', icon: '🏠', thresholds: [
    { cond: d => d.windMph > 25,       level: 'stop',    label: 'STOP',   reason: `Wind ${'{'}d.windMph{'}'}mph — suspend all roofing operations` },
    { cond: d => d.precip > 30,        level: 'stop',    label: 'STOP',   reason: 'Wet surfaces — slip hazard, no roofing in rain' },
    { cond: d => d.low < 40,           level: 'caution', label: 'CAUTION',reason: 'Cold temps reduce adhesive effectiveness for shingles' },
  ]},
  { trade: 'Painting / Finishes', icon: '🎨', thresholds: [
    { cond: d => d.low < 50,           level: 'stop',    label: 'STOP',   reason: `Low temp ${'{'}d.low{'}'}°F — paint won't cure below 50°F (exterior)` },
    { cond: d => d.humidity > 85,      level: 'caution', label: 'CAUTION',reason: `Humidity ${'{'}d.humidity{'}'}% — extend dry times, risk of blistering` },
    { cond: d => d.precip > 40,        level: 'stop',    label: 'STOP',   reason: 'Rain risk — no exterior painting, cover fresh work' },
  ]},
  { trade: 'Masonry / Stucco', icon: '🧱', thresholds: [
    { cond: d => d.low < 40,           level: 'stop',    label: 'STOP',   reason: `Low temp ${'{'}d.low{'}'}°F — mortar/grout won't cure below 40°F` },
    { cond: d => d.precip > 40,        level: 'caution', label: 'CAUTION',reason: 'Moisture compromises fresh mortar — tent or postpone' },
  ]},
  { trade: 'Electrical / MEP', icon: '⚡', thresholds: [
    { cond: d => d.precip > 60,        level: 'caution', label: 'CAUTION',reason: 'Rain — limit outdoor panel work, protect equipment' },
  ]},
  { trade: 'Excavation / Site', icon: '🚜', thresholds: [
    { cond: d => d.precip > 60,        level: 'stop',    label: 'STOP',   reason: 'Heavy rain — saturated soil, equipment may get stuck or damage site' },
    { cond: d => d.precip > 30,        level: 'caution', label: 'CAUTION',reason: 'Rain — monitor for mud conditions, restrict heavy equipment' },
  ]},
];

const DELAY_LOG = [
  { date: '2026-02-19', project: 'Riverside Custom',   weather: 'Rain 40°F',     trade: 'Framing',     hoursLost: 4, cost: 960,  notes: 'Exterior work halted — interior blocking only' },
  { date: '2026-02-19', project: 'Walnut Spec',         weather: 'Rain 40°F',     trade: 'MEP',         hoursLost: 6, cost: 720,  notes: 'Full exterior shutdown — coordination only' },
  { date: '2026-02-22', project: 'Elm St Multifamily',  weather: 'Wind 22mph',    trade: 'Framing',     hoursLost: 2, cost: 840,  notes: 'Crane ops halted 9-11 AM, manual framing continued' },
  { date: '2026-01-28', project: 'Oak Creek',           weather: 'Rain/35°F',     trade: 'Foundation',  hoursLost: 8, cost: 1440, notes: 'Pour postponed — concrete protection unavailable on site' },
  { date: '2026-01-15', project: 'Riverside Custom',   weather: 'Snow 28°F',     trade: 'Framing',     hoursLost: 8, cost: 1920, notes: 'Full shutdown — snow accumulation' },
  { date: '2026-01-15', project: 'Elm St Multifamily',  weather: 'Snow 28°F',     trade: 'Framing',     hoursLost: 8, cost: 3360, notes: 'Full shutdown — 14 crew day lost' },
  { date: '2026-01-08', project: 'Walnut Spec',         weather: 'Rain/Cold 36°F',trade: 'Roofing',     hoursLost: 6, cost: 900,  notes: 'Roofing halted — wet conditions' },
];

function getTradeStatus(trade, day) {
  let worstLevel = 'ok';
  let reason = '';
  for (const rule of trade.thresholds) {
    if (rule.cond(day)) {
      if (rule.level === 'stop') { worstLevel = 'stop'; reason = rule.reason.replace('{d.windMph}', day.windMph).replace('{d.low}', day.low).replace('{d.humidity}', day.humidity); break; }
      if (rule.level === 'caution') { worstLevel = 'caution'; reason = rule.reason.replace('{d.windMph}', day.windMph).replace('{d.low}', day.low).replace('{d.humidity}', day.humidity); }
    }
  }
  return { level: worstLevel, reason };
}

const LEVEL_STYLE = {
  ok:      { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.1)',   label: 'OK' },
  caution: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)',  label: 'CAUTION' },
  stop:    { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'STOP' },
};

export default function Weather() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('forecast');
  const [hoverCell, setHoverCell] = useState(null);
  const totalDelayHrs  = DELAY_LOG.reduce((s, d) => s + d.hoursLost, 0);
  const totalDelayCost = DELAY_LOG.reduce((s, d) => s + d.cost, 0);
  const impacted = FORECAST.filter(d => d.precip > 40 || d.windMph > 20 || d.low < 35).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Weather Intelligence</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Murfreesboro, TN &middot; {impacted} high-impact day{impacted !== 1 ? 's' : ''} next 7 days &middot; {totalDelayHrs}h lost this month
        </p>
      </div>

      {/* Active alerts */}
      <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--status-warning)' }}>Rain Wed-Thu</strong> — 60–70% precip, postpone all exterior concrete pours and roofing. Pre-position tarps by Tuesday.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--status-warning)' }}>Low 30°F Fri night</strong> — freeze warning. Protect exposed concrete on Oak Creek foundation, drain any standing water from forms.</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['forecast', Sun, '7-Day Forecast'], ['planner', Calendar, 'Work Planner'], ['delays', BarChart2, 'Delay Log']].map(([t, Icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: '7px 7px 0 0', border: 'none',
            background: tab === t ? 'var(--color-brand-card)' : 'transparent',
            color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── FORECAST TAB ── */}
      {tab === 'forecast' && (
        <>
          {/* Current conditions */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 14 }}>Current — Murfreesboro, TN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Cloud size={48} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', lineHeight: 1 }}>48°F</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Partly Cloudy</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[['High / Low', '55° / 38°'], ['Wind', '8 mph NW'], ['Humidity', '42%'], ['Precip', '10%']].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-day forecast */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>7-Day Forecast</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {FORECAST.map((day, i) => {
                const Icon = CONDITION_ICONS[day.conditions] || Cloud;
                const bad = day.precip > 40 || day.windMph > 20 || day.low < 35;
                const isToday = i === 0;
                return (
                  <div key={day.date} style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 8, background: bad ? 'rgba(251,191,36,0.06)' : isToday ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${bad ? 'rgba(251,191,36,0.2)' : isToday ? 'rgba(59,130,246,0.2)' : 'transparent'}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isToday ? '#3b82f6' : bad ? 'var(--status-warning)' : 'var(--text-tertiary)', marginBottom: 8 }}>{dayLabel(day.date, i)}</div>
                    <Icon size={22} style={{ color: bad ? 'var(--status-warning)' : 'var(--text-secondary)' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 6 }}>{day.high}°</div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{day.low}°</div>
                    {day.precip > 0 && <div style={{ fontSize: 10, marginTop: 4, color: day.precip > 40 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{day.precip}%</div>}
                    {day.windMph > 18 && <div style={{ fontSize: 10, color: 'var(--status-warning)' }}>{day.windMph}mph</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jobsite conditions */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Jobsite Conditions</div>
            </div>
            {JOBSITES.map((site, i) => {
              const Icon = CONDITION_ICONS[site.conditions] || Cloud;
              return (
                <div key={site.id} onClick={() => navigate(`/projects/${site.id}`)}
                  style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i === 0 ? 'none' : '1px solid var(--color-brand-border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{site.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{site.phase} · {site.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{site.temp}°F</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{site.conditions}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── WORK PLANNER TAB ── */}
      {tab === 'planner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Trade-specific work feasibility for the next 7 days. Click any cell for details.
          </div>

          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', minWidth: 160 }}>Trade</th>
                  {FORECAST.map((day, i) => {
                    const bad = day.precip > 40 || day.windMph > 20 || day.low < 35;
                    return (
                      <th key={day.date} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: bad ? 'var(--status-warning)' : i === 0 ? '#3b82f6' : 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', minWidth: 70 }}>
                        <div>{dayLabel(day.date, i)}</div>
                        <div style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: 10 }}>{day.high}°/{day.low}°</div>
                        {day.precip > 20 && <div style={{ fontSize: 10, color: bad ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{day.precip}%🌧</div>}
                        {day.windMph > 15 && <div style={{ fontSize: 10, color: bad ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{day.windMph}mph💨</div>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {TRADE_RULES.map((trade, ti) => (
                  <tr key={trade.trade} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <span style={{ marginRight: 8 }}>{trade.icon}</span>{trade.trade}
                    </td>
                    {FORECAST.map((day, di) => {
                      const { level, reason } = getTradeStatus(trade, day);
                      const style = LEVEL_STYLE[level];
                      const key = `${ti}-${di}`;
                      return (
                        <td key={day.date} style={{ padding: '8px', textAlign: 'center', position: 'relative' }}
                          onMouseEnter={() => level !== 'ok' && setHoverCell({ key, reason, level })}
                          onMouseLeave={() => setHoverCell(null)}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', borderRadius: 5, background: style.bg, color: style.color, fontSize: 10, fontWeight: 700, cursor: level !== 'ok' ? 'help' : 'default', minWidth: 50 }}>
                            {level === 'ok' ? <CheckCircle size={12} /> : level === 'stop' ? <XCircle size={12} /> : '⚠'}
                            {' '}{style.label}
                          </div>
                          {hoverCell?.key === key && (
                            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#1a1f2e', border: '1px solid var(--color-brand-border)', borderRadius: 7, padding: '8px 12px', fontSize: 11, color: 'var(--text-primary)', whiteSpace: 'nowrap', zIndex: 100, maxWidth: 260, whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.4 }}>
                              {hoverCell.reason}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Redeployment suggestions */}
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Crew Redeployment — Wed/Thu Rain Days</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { crew: 'Thompson Framing (exterior)', impact: 'Exterior sheathing halted', redeploy: 'Shift to interior blocking, backing, and stair framing at Riverside Custom' },
                { crew: 'Miller Concrete pour crew', impact: 'Foundation pour postponed', redeploy: 'Use delay to complete form setup on east wall, prep for Friday pour' },
                { crew: 'Davis Plumbing underground', impact: 'Underground work in standing water', redeploy: 'Underground complete — shift to interior rough-in at Walnut Spec' },
                { crew: 'Elm St Multifamily framing (14)', impact: 'Tower crane halted, exterior walls slowed', redeploy: 'Interior sheathing, fire blocking, stairwell walls — keep all 14 crew productive inside' },
              ].map((r, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-brand-border)', display: 'grid', gridTemplateColumns: '180px 1fr 2fr', gap: 12, fontSize: 12, alignItems: 'start' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.crew}</div>
                  <div style={{ color: 'var(--status-warning)' }}>⚠ {r.impact}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>→ {r.redeploy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DELAY LOG TAB ── */}
      {tab === 'delays' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              ['Total Delay Events', DELAY_LOG.length, 'var(--text-primary)'],
              ['Total Hours Lost', totalDelayHrs + 'h', 'var(--status-warning)'],
              ['Estimated Cost', '$' + totalDelayCost.toLocaleString(), 'var(--status-loss)'],
              ['Avg Hrs/Event', (totalDelayHrs / DELAY_LOG.length).toFixed(1) + 'h', 'var(--text-secondary)'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: c }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Date', 'Project', 'Weather', 'Trade Impacted', 'Hrs Lost', 'Est. Cost', 'Notes'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DELAY_LOG.map((d, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{d.date}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{d.project}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{d.weather}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{d.trade}</td>
                    <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 700, color: 'var(--status-warning)' }}>{d.hoursLost}h</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--status-loss)' }}>${d.cost.toLocaleString()}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 220 }}>{d.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
