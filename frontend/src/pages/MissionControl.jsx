/**
 * Mission Control — High-level command layer
 *
 * Every card, objective row, score bar, narrative step, and cadence row
 * is clickable and navigates to the relevant surface.
 *
 * drillTo routing:
 *   '/projects/1?tab=cos'   → ProjectDetail, Change Orders tab
 *   '/financials?tab=ar'    → Financials, AR/Invoices tab
 *   '/vendors'              → Vendors list
 *   '/crm'                  → CRM pipeline
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair, TrendingUp, Zap, GitMerge,
  ArrowRight, CheckCircle2, Circle,
  Activity, Target, Radio, Clock, ChevronRight,
} from 'lucide-react';
import {
  missionCards,
  commandNarratives,
  weeklyObjectives,
  missionScores,
  cadenceItems,
} from '../lib/missionData';

// ── Icon registry ─────────────────────────────────────────────────────────────
const ICONS = { TrendingUp, Zap, GitMerge, Activity, Target };

// ── Color helpers ─────────────────────────────────────────────────────────────
function severityBadgeClass(sev) {
  return { loss: 'mc-badge mc-badge-loss', warning: 'mc-badge mc-badge-warning', info: 'mc-badge mc-badge-info', profit: 'mc-badge mc-badge-profit' }[sev] || 'mc-badge mc-badge-info';
}
function narrativeBorderColor(sev) {
  return { loss: 'var(--status-loss)', warning: 'var(--status-warning)', info: 'var(--status-info)', profit: 'var(--status-profit)' }[sev] || 'var(--status-info)';
}
function narrativeBgColor(sev) {
  return { loss: 'var(--status-loss-bg)', warning: 'var(--status-warning-bg)', info: 'var(--status-info-bg)', profit: 'var(--status-profit-bg)' }[sev] || 'var(--status-info-bg)';
}
function scoreBarColor(score) {
  if (score >= 75) return 'var(--status-profit)';
  if (score >= 55) return 'var(--status-warning)';
  return 'var(--status-loss)';
}
function outcomeColor(status) {
  if (status === 'complete') return 'var(--status-profit)';
  if (status === 'pending')  return 'var(--status-warning)';
  return 'var(--text-tertiary)';
}

// ── Mission Card ──────────────────────────────────────────────────────────────
function MissionCard({ card }) {
  const navigate = useNavigate();
  const Icon = ICONS[card.iconKey] || TrendingUp;
  const deltaColor = card.deltaDir === 'warn'
    ? 'var(--status-warning)'
    : card.deltaDir === 'up'
      ? 'var(--status-profit)'
      : 'var(--status-loss)';

  return (
    <div
      className="mc-card mc-card-clickable"
      style={{ position: 'relative', overflow: 'hidden', paddingLeft: 22 }}
      onClick={() => navigate(card.drillTo)}
      onKeyDown={e => e.key === 'Enter' && navigate(card.drillTo)}
      role="button"
      tabIndex={0}
      aria-label={`View ${card.label} detail`}
    >
      <div className="mc-accent-bar" />

      <div className="flex items-center justify-between mb-3">
        <span className="mc-label">{card.label}</span>
        <Icon size={15} strokeWidth={1.75} style={{ color: 'var(--accent)', opacity: 0.7 }} />
      </div>

      <div className="mc-value-hero" style={{ marginBottom: 6 }}>{card.value}</div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{card.delta}</span>
        <span className="mc-micro">{card.deltaDetail}</span>
      </div>

      <hr className="mc-divider" style={{ marginBottom: 10 }} />

      <div className="mc-body" style={{ marginBottom: 4 }}>{card.subvalue}</div>
      <div className="mc-micro">{card.context}</div>

      <div style={{ position: 'absolute', bottom: 14, right: 14, color: 'var(--accent)', opacity: 0.4 }}>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

// ── Command Brief (objectives) ────────────────────────────────────────────────
function CommandBrief() {
  const navigate = useNavigate();
  const pendingCount = weeklyObjectives.filter(o => !o.done).length;

  return (
    <div className="mc-card" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mc-label">Command Brief</div>
          <div className="mc-body" style={{ marginTop: 2 }}>Weekly Objectives</div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="mc-badge mc-badge-warning" style={{ fontSize: 10 }}>{pendingCount} open</span>
          )}
          <Target size={14} style={{ color: 'var(--accent)', opacity: 0.6 }} />
        </div>
      </div>

      <hr className="mc-divider" style={{ marginBottom: 12 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weeklyObjectives.map((obj) => (
          <div
            key={obj.id}
            className="mc-objective-row"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(obj.drillTo)}
            onKeyDown={e => e.key === 'Enter' && navigate(obj.drillTo)}
            role="button"
            tabIndex={0}
          >
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              flexShrink: 0, marginTop: 5,
              background: obj.priority === 'high' ? 'var(--status-loss)' : 'var(--status-warning)',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, lineHeight: 1.4,
                color: obj.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                textDecoration: obj.done ? 'line-through' : 'none',
              }}>
                {obj.text}
              </div>
              <div className="mc-micro" style={{ marginTop: 2 }}>{obj.owner}</div>
            </div>
            <div className="flex items-center gap-1">
              {obj.done
                ? <CheckCircle2 size={13} style={{ color: 'var(--status-profit)', flexShrink: 0 }} />
                : <Circle size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              }
              <ChevronRight size={11} style={{ color: 'var(--accent)', opacity: 0.4, flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mission Scores ────────────────────────────────────────────────────────────
function MissionScores() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="mc-card" style={{ height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mc-label">Mission Scores</div>
          <div className="mc-body" style={{ marginTop: 2 }}>Domain health indices</div>
        </div>
        <Activity size={14} style={{ color: 'var(--accent)', opacity: 0.6 }} />
      </div>

      <hr className="mc-divider" style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {missionScores.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(s.drillTo)}
            onKeyDown={e => e.key === 'Enter' && navigate(s.drillTo)}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            role="button"
            tabIndex={0}
            style={{
              cursor: 'pointer', padding: '6px 8px', borderRadius: 4,
              marginLeft: -8, marginRight: -8,
              background: hovered === s.id ? 'var(--accent-bg)' : 'transparent',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.domain}</span>
              <div className="flex items-center gap-1">
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: scoreBarColor(s.score),
                }}>{s.score}</span>
                <ChevronRight size={12} style={{ color: 'var(--accent)', opacity: 0.5 }} />
              </div>
            </div>
            <div className="mc-score-track" style={{ marginBottom: 5 }}>
              <div className="mc-score-fill" style={{ width: `${s.score}%`, background: scoreBarColor(s.score) }} />
            </div>
            <div className="mc-micro">{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Single narrative step card ────────────────────────────────────────────────
function FlowStep({ step, label, accentColor }) {
  const navigate = useNavigate();

  return (
    <div
      className="mc-flow-step"
      data-clickable={step.drillTo ? 'true' : 'false'}
      style={{ borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: accentColor || 'var(--border-medium)' }}
      onClick={() => step.drillTo && navigate(step.drillTo)}
      onKeyDown={e => e.key === 'Enter' && step.drillTo && navigate(step.drillTo)}
      role={step.drillTo ? 'button' : undefined}
      tabIndex={step.drillTo ? 0 : undefined}
    >
      <div className="mc-label" style={{ color: accentColor || 'var(--text-tertiary)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
        {step.label}
      </div>
      <div className="mc-micro" style={{ lineHeight: 1.5 }}>{step.detail}</div>
      {step.drillTo && <div className="mc-flow-view-hint">View →</div>}
    </div>
  );
}

// ── Narrative row (Signal → Drilldown → Decision → Outcome) ──────────────────
function NarrativeRow({ narrative }) {
  const borderColor = narrativeBorderColor(narrative.signal.severity);
  const bgColor     = narrativeBgColor(narrative.signal.severity);

  return (
    <div style={{
      borderLeft: `3px solid ${borderColor}`,
      background: bgColor,
      borderRadius: '0 6px 6px 0',
      padding: '14px 16px',
    }}>
      <div className="flex items-center justify-between mb-3">
        <span className={severityBadgeClass(narrative.signal.severity)} style={{ fontSize: 10 }}>
          {narrative.signal.job}
        </span>
        <span className="mc-micro" style={{ color: outcomeColor(narrative.outcome.status) }}>
          {narrative.outcome.status === 'complete' ? 'Resolved' : 'In progress'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
        gap: 8, alignItems: 'start',
      }}>
        <FlowStep step={narrative.signal}    label="Signal"    accentColor={borderColor} />
        <div className="mc-flow-arrow"><ArrowRight size={12} style={{ opacity: 0.4 }} /></div>
        <FlowStep step={narrative.drilldown} label="Drilldown" accentColor="var(--accent)" />
        <div className="mc-flow-arrow"><ArrowRight size={12} style={{ opacity: 0.4 }} /></div>
        <FlowStep step={narrative.decision}  label="Decision"  accentColor="var(--status-info)" />
        <div className="mc-flow-arrow"><ArrowRight size={12} style={{ opacity: 0.4 }} /></div>
        <FlowStep
          step={narrative.outcome}
          label="Outcome"
          accentColor={narrative.outcome.status === 'complete' ? 'var(--status-profit)' : 'var(--status-warning)'}
        />
      </div>
    </div>
  );
}

// ── Cadence Table ─────────────────────────────────────────────────────────────
function CadenceTable() {
  const navigate = useNavigate();

  function statusColor(status) {
    if (status === 'complete')    return 'var(--status-profit)';
    if (status === 'in_progress') return 'var(--status-warning)';
    return 'var(--text-tertiary)';
  }
  function statusLabel(status) {
    if (status === 'complete')    return 'Done';
    if (status === 'in_progress') return 'Active';
    return 'Pending';
  }

  return (
    <div className="mc-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mc-label">Weekly Cadence</div>
          <div className="mc-body" style={{ marginTop: 2 }}>Rhythm tracker — this week</div>
        </div>
        <Clock size={14} style={{ color: 'var(--accent)', opacity: 0.6 }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="mc-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>Day</th>
              <th>Item</th>
              <th style={{ width: 76 }}>Owner</th>
              <th className="right" style={{ width: 70 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {cadenceItems.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  cursor: 'pointer',
                  background: idx % 2 === 1 ? 'rgba(255,255,255,0.008)' : 'transparent',
                }}
                onClick={() => navigate(item.drillTo)}
                onKeyDown={e => e.key === 'Enter' && navigate(item.drillTo)}
                tabIndex={0}
                role="button"
              >
                <td>
                  <span className="mc-micro" style={{ fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>
                    {item.cadence}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>
                  <div className="flex items-center gap-1.5">
                    <span>{item.item}</span>
                    <ChevronRight size={11} style={{ color: 'var(--accent)', opacity: 0.35, flexShrink: 0 }} />
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.owner}</td>
                <td className="right">
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em',
                    color: statusColor(item.status),
                  }}>
                    {statusLabel(item.status)}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MissionControl() {
  const navigate = useNavigate();

  return (
    <div className="mc-page" style={{ maxWidth: 1440, margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 6,
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Crosshair size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: '1.25rem', fontWeight: 700,
              letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1,
            }}>
              Mission Control
            </h1>
            <div className="mc-body" style={{ marginTop: 4 }}>
              Command-layer operational view — 6 active jobs
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="mc-elevated"
            onClick={() => navigate('/projects')}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            style={{
              padding: '6px 12px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6,
              color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
              transition: 'background-color 0.15s ease',
            }}
          >
            All Jobs <ChevronRight size={12} />
          </button>
          <div className="flex items-center gap-2 mc-elevated" style={{ padding: '6px 12px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-profit)' }} />
            <span className="mc-micro" style={{
              color: 'var(--status-profit)', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Live
            </span>
            <span className="mc-micro" style={{ marginLeft: 4 }}>2 min ago</span>
          </div>
        </div>
      </div>

      {/* Mission Cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
        {missionCards.map((card) => <MissionCard key={card.id} card={card} />)}
      </div>

      {/* Command Brief + Mission Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 14 }}>
        <CommandBrief />
        <MissionScores />
      </div>

      {/* Narrative Flow */}
      <div className="mc-card" style={{ marginBottom: 14 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mc-label">Narrative Flow</div>
            <div className="mc-body" style={{ marginTop: 2 }}>
              Signal &rarr; Drilldown &rarr; Decision &rarr; Outcome — click any step to open
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="mc-badge mc-badge-info" style={{ fontSize: 10 }}>
              {commandNarratives.length} active
            </span>
            <Radio size={14} style={{ color: 'var(--accent)', opacity: 0.6 }} />
          </div>
        </div>

        <hr className="mc-divider" style={{ marginBottom: 14 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {commandNarratives.map((n) => <NarrativeRow key={n.id} narrative={n} />)}
        </div>
      </div>

      {/* Cadence Table */}
      <CadenceTable />
    </div>
  );
}
