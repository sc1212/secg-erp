/**
 * Mission Control — High-level command layer
 *
 * Surfaces operational health at the executive level:
 *   1. Cinematic mission cards   — margin, cash velocity, CO conversion
 *   2. Command brief / objectives — weekly priority list with owner badges
 *   3. Mission scores            — domain health bars
 *   4. Narrative flow            — Signal → Drilldown → Decision → Outcome
 *   5. Weekly cadence table      — rhythm tracker
 *
 * Styles exclusively via CSS custom properties (index.css mc-* classes).
 * No hardcoded color values in this file.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair, TrendingUp, Zap, GitMerge,
  ArrowRight, CheckCircle2, Circle, AlertTriangle,
  Shield, Activity, BarChart2, Target,
  ChevronRight, Radio, Clock,
} from 'lucide-react';
import {
  missionCards,
  commandNarratives,
  weeklyObjectives,
  missionScores,
  cadenceItems,
} from '../lib/missionData';

// ── Icon map for missionCards.iconKey ────────────────────────────────────────
const iconMap = { TrendingUp, Zap, GitMerge, Activity, Shield, BarChart2, Target };

// ── Severity → CSS class mapping ─────────────────────────────────────────────
function severityBadgeClass(sev) {
  const map = {
    profit:  'mc-badge mc-badge-profit',
    warning: 'mc-badge mc-badge-warning',
    loss:    'mc-badge mc-badge-loss',
    info:    'mc-badge mc-badge-info',
    purple:  'mc-badge mc-badge-purple',
  };
  return map[sev] || 'mc-badge mc-badge-info';
}

function severityTextClass(sev) {
  const map = {
    profit:  'mc-profit',
    warning: 'mc-warning',
    loss:    'mc-loss',
    info:    'mc-info',
    purple:  'mc-purple',
  };
  return map[sev] || '';
}

function narrativeSeverityStyle(sev) {
  const map = {
    loss:    { borderColor: 'var(--status-loss)', background: 'var(--status-loss-bg)' },
    warning: { borderColor: 'var(--status-warning)', background: 'var(--status-warning-bg)' },
    info:    { borderColor: 'var(--status-info)', background: 'var(--status-info-bg)' },
    profit:  { borderColor: 'var(--status-profit)', background: 'var(--status-profit-bg)' },
  };
  return map[sev] || map.info;
}

function outcomeStatusStyle(status) {
  if (status === 'complete') return { color: 'var(--status-profit)' };
  if (status === 'pending')  return { color: 'var(--status-warning)' };
  return { color: 'var(--text-tertiary)' };
}

// ── Priority badge ────────────────────────────────────────────────────────────
function PriorityDot({ priority }) {
  const col = priority === 'high'
    ? 'var(--status-loss)'
    : 'var(--status-warning)';
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: col,
        flexShrink: 0,
        marginTop: 6,
      }}
    />
  );
}

// ── Score color by value ──────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 75) return 'var(--status-profit)';
  if (score >= 55) return 'var(--status-warning)';
  return 'var(--status-loss)';
}

function scoreLabel(score) {
  if (score >= 75) return 'On track';
  if (score >= 55) return 'Needs attention';
  return 'At risk';
}

// ── Mission Card component ────────────────────────────────────────────────────
function MissionCard({ card }) {
  const navigate = useNavigate();
  const Icon = iconMap[card.iconKey] || TrendingUp;
  const deltaUp   = card.deltaDir === 'up';
  const deltaWarn = card.deltaDir === 'warn';
  const deltaColor = deltaWarn
    ? 'var(--status-warning)'
    : deltaUp
      ? 'var(--status-profit)'
      : 'var(--status-loss)';
  const valColor = card.severity === 'profit'
    ? 'var(--text-primary)'
    : card.severity === 'warning'
      ? 'var(--text-primary)'
      : 'var(--text-primary)';

  return (
    <div
      className="mc-card mc-card-clickable"
      style={{ position: 'relative', overflow: 'hidden', paddingLeft: 22 }}
      onClick={() => navigate(card.drillTo)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(card.drillTo)}
      aria-label={`View ${card.label} detail`}
    >
      <div className="mc-accent-bar" />

      {/* Icon + label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="mc-label">{card.label}</span>
        <Icon
          size={16}
          strokeWidth={1.75}
          style={{ color: 'var(--accent)', opacity: 0.7 }}
        />
      </div>

      {/* Hero value */}
      <div className="mc-value-hero" style={{ color: valColor, marginBottom: 6 }}>
        {card.value}
      </div>

      {/* Delta */}
      <div className="flex items-center gap-1.5 mb-3">
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: deltaColor,
          }}
        >
          {card.delta}
        </span>
        <span className="mc-micro">{card.deltaDetail}</span>
      </div>

      <hr className="mc-divider" style={{ marginBottom: 10 }} />

      {/* Subvalue + context */}
      <div className="mc-body" style={{ marginBottom: 4 }}>{card.subvalue}</div>
      <div className="mc-micro">{card.context}</div>

      {/* Drill arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          color: 'var(--accent)',
          opacity: 0.4,
        }}
      >
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

// ── Command Brief (objectives + owner) ───────────────────────────────────────
function CommandBrief() {
  const pendingCount = weeklyObjectives.filter(o => !o.done).length;

  return (
    <div className="mc-card" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mc-label">Command Brief</div>
          <div className="mc-body" style={{ marginTop: 2 }}>
            Weekly Objectives
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span
              className="mc-badge mc-badge-warning"
              style={{ fontSize: 10 }}
            >
              {pendingCount} open
            </span>
          )}
          <Target size={15} style={{ color: 'var(--accent)', opacity: 0.6 }} />
        </div>
      </div>

      <hr className="mc-divider" style={{ marginBottom: 12 }} />

      {/* Objective list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weeklyObjectives.map((obj) => (
          <div key={obj.id} className="mc-objective-row">
            <PriorityDot priority={obj.priority} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  color: obj.done ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  textDecoration: obj.done ? 'line-through' : 'none',
                  lineHeight: 1.4,
                }}
              >
                {obj.text}
              </div>
              <div className="mc-micro" style={{ marginTop: 2 }}>
                {obj.owner}
              </div>
            </div>
            {obj.done ? (
              <CheckCircle2 size={14} style={{ color: 'var(--status-profit)', flexShrink: 0 }} />
            ) : (
              <Circle size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mission Scores panel ──────────────────────────────────────────────────────
function MissionScores() {
  return (
    <div className="mc-card" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="mc-label">Mission Scores</div>
          <div className="mc-body" style={{ marginTop: 2 }}>
            Domain health indices
          </div>
        </div>
        <Activity size={15} style={{ color: 'var(--accent)', opacity: 0.6 }} />
      </div>

      <hr className="mc-divider" style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {missionScores.map((s) => (
          <div key={s.id}>
            {/* Domain + score number */}
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {s.domain}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: scoreColor(s.score),
                }}
              >
                {s.score}
              </span>
            </div>

            {/* Score bar */}
            <div className="mc-score-track" style={{ marginBottom: 6 }}>
              <div
                className="mc-score-fill"
                style={{
                  width: `${s.score}%`,
                  background: scoreColor(s.score),
                }}
              />
            </div>

            {/* Detail */}
            <div className="mc-micro">{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Narrative Flow step ───────────────────────────────────────────────────────
function FlowStep({ step, label, icon: StepIcon, accentColor }) {
  return (
    <div
      className="mc-flow-step"
      style={{ borderLeftWidth: 2, borderLeftStyle: 'solid', borderLeftColor: accentColor || 'var(--border-medium)' }}
    >
      <div
        className="mc-label"
        style={{
          color: accentColor || 'var(--text-tertiary)',
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        {StepIcon && <StepIcon size={10} />}
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
        {step.label}
      </div>
      <div className="mc-micro" style={{ lineHeight: 1.5 }}>
        {step.detail}
      </div>
    </div>
  );
}

// ── Single narrative row ──────────────────────────────────────────────────────
function NarrativeRow({ narrative }) {
  const sigStyle = narrativeSeverityStyle(narrative.signal.severity);

  return (
    <div
      style={{
        borderLeft: '3px solid',
        borderLeftColor: sigStyle.borderColor,
        background: sigStyle.background,
        borderRadius: '0 6px 6px 0',
        padding: '14px 16px',
        marginBottom: 0,
      }}
    >
      {/* Job tag + outcome status */}
      <div className="flex items-center justify-between mb-3">
        <span className={severityBadgeClass(narrative.signal.severity)} style={{ fontSize: 10 }}>
          {narrative.signal.job}
        </span>
        <span
          className="mc-micro"
          style={outcomeStatusStyle(narrative.outcome.status)}
        >
          {narrative.outcome.status === 'complete' ? 'Resolved' : 'In progress'}
        </span>
      </div>

      {/* 4-step flow */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
          gap: 8,
          alignItems: 'start',
        }}
      >
        <FlowStep
          step={narrative.signal}
          label="Signal"
          accentColor={sigStyle.borderColor}
        />

        <div className="mc-flow-arrow">
          <ArrowRight size={12} style={{ opacity: 0.4 }} />
        </div>

        <FlowStep
          step={narrative.drilldown}
          label="Drilldown"
          accentColor="var(--accent)"
        />

        <div className="mc-flow-arrow">
          <ArrowRight size={12} style={{ opacity: 0.4 }} />
        </div>

        <FlowStep
          step={narrative.decision}
          label="Decision"
          accentColor="var(--status-info)"
        />

        <div className="mc-flow-arrow">
          <ArrowRight size={12} style={{ opacity: 0.4 }} />
        </div>

        <FlowStep
          step={narrative.outcome}
          label="Outcome"
          accentColor={
            narrative.outcome.status === 'complete'
              ? 'var(--status-profit)'
              : 'var(--status-warning)'
          }
        />
      </div>
    </div>
  );
}

// ── Cadence Table ─────────────────────────────────────────────────────────────
function CadenceTable() {
  function cadenceStatusColor(status) {
    if (status === 'complete')    return 'var(--status-profit)';
    if (status === 'in_progress') return 'var(--status-warning)';
    return 'var(--text-tertiary)';
  }
  function cadenceStatusLabel(status) {
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
        <Clock size={15} style={{ color: 'var(--accent)', opacity: 0.6 }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="mc-table">
          <thead>
            <tr>
              <th style={{ width: 52 }}>Day</th>
              <th>Item</th>
              <th style={{ width: 80 }}>Owner</th>
              <th className="right" style={{ width: 80 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {cadenceItems.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  background: idx % 2 === 1
                    ? 'rgba(255,255,255,0.01)'
                    : 'transparent',
                }}
              >
                <td>
                  <span className="mc-micro"
                    style={{ fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}
                  >
                    {item.cadence}
                  </span>
                </td>
                <td style={{ color: 'var(--text-primary)', fontSize: 13 }}>{item.item}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.owner}</td>
                <td className="right">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: cadenceStatusColor(item.status),
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {cadenceStatusLabel(item.status)}
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MissionControl() {
  const [narrativeExpanded, setNarrativeExpanded] = useState(false);
  const visibleNarratives = narrativeExpanded ? commandNarratives : commandNarratives.slice(0, 2);

  return (
    <div className="mc-page" style={{ maxWidth: 1440, margin: '0 auto' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Crosshair size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}>
              Mission Control
            </h1>
            <div className="mc-body" style={{ marginTop: 4 }}>
              Command-layer operational view — 6 active jobs
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div
          className="flex items-center gap-2 mc-elevated"
          style={{ padding: '6px 12px' }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--status-profit)',
              animation: 'none',
            }}
          />
          <span
            className="mc-micro"
            style={{ color: 'var(--status-profit)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Live
          </span>
          <span className="mc-micro" style={{ marginLeft: 4 }}>
            Updated 2 min ago
          </span>
        </div>
      </div>

      {/* ── Mission Cards row ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          marginBottom: 14,
        }}
        className="grid-cols-1 sm:grid-cols-3"
      >
        {missionCards.map((card) => (
          <MissionCard key={card.id} card={card} />
        ))}
      </div>

      {/* ── Command Brief + Mission Scores ────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <CommandBrief />
        <MissionScores />
      </div>

      {/* ── Narrative Flow section ────────────────────────────────────────── */}
      <div className="mc-card" style={{ marginBottom: 14 }}>
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mc-label">Narrative Flow</div>
            <div
              className="mc-body"
              style={{ marginTop: 2 }}
            >
              Signal &rarr; Drilldown &rarr; Decision &rarr; Outcome
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

        {/* Narrative rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleNarratives.map((narrative) => (
            <NarrativeRow key={narrative.id} narrative={narrative} />
          ))}
        </div>

        {/* Expand / collapse */}
        {commandNarratives.length > 2 && (
          <button
            onClick={() => setNarrativeExpanded(e => !e)}
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.03em',
              padding: 0,
            }}
          >
            {narrativeExpanded ? (
              <>Show less</>
            ) : (
              <>
                Show {commandNarratives.length - 2} more narrative{commandNarratives.length - 2 !== 1 ? 's' : ''}
                <ChevronRight size={12} />
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Weekly Cadence table ──────────────────────────────────────────── */}
      <CadenceTable />

    </div>
  );
}
