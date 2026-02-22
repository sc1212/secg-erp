import { useState } from 'react';
import { PROJECTS, VENDORS } from '../lib/demoData';
import { money } from '../lib/format';
import { AlertTriangle, CheckCircle, Cloud, CloudRain, TrendingUp, TrendingDown } from 'lucide-react';

const TODAY = '2026-02-22';

const BRIEFING = {
  date: 'Sunday, February 22, 2026',
  generatedAt: '5:02 AM',
  weather: {
    summary: 'Partly Cloudy, 48°F — Rain expected Wed-Thu. Freeze warning Tuesday night.',
    alerts: [
      'Freeze warning Tuesday night — protect exposed concrete and pipes on all active sites',
      'Rain Wed-Thu — cover exposed materials, potential schedule delays at Magnolia and Summit Ridge',
    ],
    forecast: [
      { day: 'Sun', high: 55, low: 38, icon: Cloud,     precip: 10, risk: false },
      { day: 'Mon', high: 52, low: 35, icon: Cloud,     precip: 0,  risk: false },
      { day: 'Tue', high: 58, low: 40, icon: Cloud,     precip: 5,  risk: true  },
      { day: 'Wed', high: 45, low: 32, icon: CloudRain, precip: 70, risk: true  },
      { day: 'Thu', high: 42, low: 30, icon: CloudRain, precip: 60, risk: true  },
    ],
  },
  cashflow: {
    available: 384200,
    receivable: 127500,
    payable: 89300,
    runway: 47,
  },
  priorities: [
    { id: 1, tag: 'Urgent',   color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', text: 'Riverside — HVAC thermostat warranty claim needs scheduling before Wed weather window closes' },
    { id: 2, tag: 'Urgent',   color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', text: 'Johnson Rehab — GFI kitchen outlet failure, electrical sub needs to be on-site today' },
    { id: 3, tag: 'Decision', color: '#3b82f6',               bg: 'rgba(59,130,246,0.10)',  text: 'Patel project — Change Order #3 (Patio Extension, $12,400) awaiting client approval. Deadline 2/25' },
    { id: 4, tag: 'Action',   color: '#a855f7',               bg: 'rgba(168,85,247,0.10)',  text: 'LP SmartSide siding panels for Highland Terrace out of stock — reorder from Southeast Building today' },
    { id: 5, tag: 'Action',   color: '#a855f7',               bg: 'rgba(168,85,247,0.10)',  text: 'Colton — Daily log completion for Zach Monroe dropped to 62%. Follow up this week' },
    { id: 6, tag: 'Finance',  color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.10)',   text: 'Draw request for Oak Creek ready to submit — $87,500 milestone certified' },
  ],
  projects: [
    { id: 1, name: 'Riverside Custom Home',   pm: 'Connor Webb',  stage: 'Framing',       pct: 42, schedule: 'On Track',  financials: 'On Budget', flags: [] },
    { id: 2, name: 'Oak Creek Spec Home',      pm: 'Connor Webb',  stage: 'Rough-In',      pct: 61, schedule: 'On Track',  financials: 'On Budget', flags: ['Draw Ready'] },
    { id: 3, name: 'Magnolia Spec Home',       pm: 'Joseph Hall',  stage: 'Foundation',    pct: 22, schedule: 'On Track',  financials: 'On Budget', flags: ['Weather Risk'] },
    { id: 4, name: 'Johnson Insurance Rehab',  pm: 'Abi Darnell',  stage: 'Structural',    pct: 55, schedule: 'At Risk',   financials: 'On Budget', flags: ['Electrical Issue'] },
    { id: 5, name: 'Highland Terrace Spec',    pm: 'Alex Torres',  stage: 'Framing',       pct: 38, schedule: 'On Track',  financials: 'On Budget', flags: ['Inventory Gap'] },
    { id: 6, name: 'Summit Ridge Custom',      pm: 'Joseph Hall',  stage: 'Site Prep',     pct: 8,  schedule: 'On Track',  financials: 'On Budget', flags: ['Weather Risk'] },
  ],
  scorecard: {
    logCompletion: 88,
    milestonesOnTime: 92,
    avgMargin: 17.4,
    openWarranties: 5,
  },
};

function Pill({ label, color, bg }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: bg, color, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{label}</span>
  );
}

export default function MorningBriefing() {
  const [dismissed, setDismissed] = useState({});
  const remaining = BRIEFING.priorities.filter((_, i) => !dismissed[i]);

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Morning Briefing</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{BRIEFING.date} &middot; Generated {BRIEFING.generatedAt} &middot; Southeast Construction Group</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)' }}>
            Print / Export
          </button>
          <button style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            Send to Team
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Available Cash', money(BRIEFING.cashflow.available, true), BRIEFING.cashflow.available > 300000 ? 'var(--status-profit)' : 'var(--status-warning)'],
          ['Log Completion', `${BRIEFING.scorecard.logCompletion}%`, BRIEFING.scorecard.logCompletion >= 90 ? 'var(--status-profit)' : 'var(--status-warning)'],
          ['Avg Job Margin', `${BRIEFING.scorecard.avgMargin}%`, BRIEFING.scorecard.avgMargin >= 18 ? 'var(--status-profit)' : 'var(--status-warning)'],
          ['Open Warranties', BRIEFING.scorecard.openWarranties, BRIEFING.scorecard.openWarranties > 3 ? 'var(--status-warning)' : 'var(--status-profit)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Weather Section */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Weather Outlook — Murfreesboro, TN</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {BRIEFING.weather.forecast.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>{d.day}</div>
                  <Icon size={16} style={{ color: d.risk ? 'var(--status-warning)' : 'var(--text-secondary)' }} />
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 4 }}>{d.high}°</div>
                  {d.precip > 0 && <div style={{ fontSize: 10, color: d.precip > 40 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{d.precip}%</div>}
                </div>
              );
            })}
          </div>
        </div>
        {BRIEFING.weather.alerts.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', marginBottom: i < BRIEFING.weather.alerts.length - 1 ? 6 : 0 }}>
            <AlertTriangle size={13} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a}</span>
          </div>
        ))}
      </div>

      {/* Today's Priorities */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Priorities</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{remaining.length} of {BRIEFING.priorities.length} remaining</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BRIEFING.priorities.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 8, background: dismissed[i] ? 'rgba(255,255,255,0.02)' : p.bg, border: `1px solid ${dismissed[i] ? 'var(--color-brand-border)' : 'transparent'}`, opacity: dismissed[i] ? 0.45 : 1, transition: 'opacity 0.2s' }}>
              <button
                onClick={() => setDismissed(d => ({ ...d, [i]: !d[i] }))}
                style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${dismissed[i] ? 'var(--status-profit)' : p.color}`, background: dismissed[i] ? 'rgba(34,197,94,0.15)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, marginTop: 1 }}
              >
                {dismissed[i] && <CheckCircle size={12} style={{ color: 'var(--status-profit)' }} />}
              </button>
              <Pill label={p.tag} color={p.color} bg={p.bg} />
              <span style={{ fontSize: 13, color: dismissed[i] ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: dismissed[i] ? 'line-through' : 'none', flex: 1 }}>{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Status Snapshot */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Active Project Status</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Project', 'PM', 'Stage', 'Progress', 'Schedule', 'Financials', 'Flags'].map(h => (
              <th key={h} style={{ padding: '9px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {BRIEFING.projects.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name.split(' ').slice(0, 2).join(' ')}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{p.pm.split(' ')[0]}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{p.stage}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: p.pct >= 50 ? 'var(--status-profit)' : '#3b82f6', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)', width: 28 }}>{p.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: p.schedule === 'On Track' ? 'rgba(34,197,94,0.10)' : 'rgba(251,191,36,0.12)', color: p.schedule === 'On Track' ? 'var(--status-profit)' : 'var(--status-warning)' }}>{p.schedule}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: p.financials === 'On Budget' ? 'rgba(34,197,94,0.10)' : 'rgba(251,191,36,0.12)', color: p.financials === 'On Budget' ? 'var(--status-profit)' : 'var(--status-warning)' }}>{p.financials}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.flags.length === 0
                      ? <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>—</span>
                      : p.flags.map(f => (
                        <span key={f} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(251,191,36,0.10)', color: 'var(--status-warning)' }}>{f}</span>
                      ))
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cash Flow Snapshot */}
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Cash Flow Snapshot</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            ['Available Cash', money(BRIEFING.cashflow.available, true), 'var(--status-profit)', TrendingUp],
            ['Receivable (30d)', money(BRIEFING.cashflow.receivable, true), '#3b82f6', TrendingUp],
            ['Payable (30d)', money(BRIEFING.cashflow.payable, true), 'var(--status-warning)', TrendingDown],
            ['Runway', `${BRIEFING.cashflow.runway} days`, BRIEFING.cashflow.runway > 30 ? 'var(--status-profit)' : 'var(--status-loss)', TrendingUp],
          ].map(([label, val, color, Icon]) => (
            <div key={label} style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-brand-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)' }}>{label}</div>
                <Icon size={12} style={{ color }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-tertiary)', paddingBottom: 8 }}>
        Briefing auto-generated daily at 5:00 AM &middot; Data as of {BRIEFING.date} &middot; Southeast Construction Group
      </div>
    </div>
  );
}
