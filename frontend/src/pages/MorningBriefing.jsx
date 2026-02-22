import { AlertTriangle, CalendarClock, CloudRain, DollarSign, Truck } from 'lucide-react';

export default function MorningBriefing() {
  const actions = [
    'Approve CO #7 for PRJ-042 ($12,400)',
    'ABC Plumbing COI expires in 12 days',
    'Payroll runs Friday — review submitted hours',
  ];

  return (
    <div className="space-y-4">
      <div className="bg-brand-card border border-brand-border rounded-lg p-5">
        <p className="text-xs uppercase tracking-wide text-brand-muted">Morning Briefing</p>
        <h1 className="text-2xl font-bold mt-1">Good morning, Matt — Friday</h1>
        <p className="text-sm text-brand-muted mt-1">Personalized snapshot assembled from cash, weather, logs, fleet, and queue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <BriefCard icon={DollarSign} label="Cash Position" value="$277,912" sub="+$45,000 yesterday" />
        <BriefCard icon={CloudRain} label="Weather Watch" value="2 jobs affected" sub="Rain Wed 85%" />
        <BriefCard icon={CalendarClock} label="Inspections" value="3 today" sub="First at 9:00 AM" />
        <BriefCard icon={Truck} label="Fleet" value="1 due" sub="F-250 oil change" />
        <BriefCard icon={AlertTriangle} label="Attention Items" value="3" sub="Action required" />
      </div>

      <div className="bg-brand-card border border-brand-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Needs your attention</h3>
        <div className="space-y-2">
          {actions.map((item) => (
            <div key={item} className="flex items-center justify-between bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm">
              <span>{item}</span>
              <button className="text-brand-gold lg:hover:text-brand-gold-light">Open</button>
            </div>
          ))}
        </div>
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate, money } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import {
  DollarSign, FolderKanban, Users, AlertTriangle,
  Sun, Clock, Sparkles,
} from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const demoBriefing = {
  generated_at: '2026-02-22T06:00:00',
  greeting: 'Good morning, Mike.',
  weather_summary: 'Sunny, 72\u00B0F high \u2014 all clear for outdoor work today.',
  sections: [
    {
      title: 'Cash Position',
      icon: 'DollarSign',
      items: [
        'Operating account: $142,800 (+$23,400 from Friday)',
        'AR due this week: $67,200 across 3 invoices',
        'AP due this week: $31,500 (2 vendor payments)',
      ],
    },
    {
      title: 'Project Updates',
      icon: 'FolderKanban',
      items: [
        'PRJ-042 Brentwood: Cabinet delivery confirmed for Monday',
        'PRJ-038 Franklin: Drywall crew finishing today (on schedule)',
        'PRJ-051 Green Hills: Demo 80% complete, on track for Wednesday',
      ],
    },
    {
      title: 'Team & Safety',
      icon: 'Users',
      items: [
        '14 days since last incident',
        "Jake R.'s OSHA-30 expires in 12 days \u2014 renewal scheduled",
        'All daily logs submitted for Friday',
      ],
    },
    {
      title: 'Action Items',
      icon: 'AlertTriangle',
      items: [
        'URGENT: Thompson warranty callback \u2014 HVAC not reaching temp (assigned to Zach P.)',
        'Review draw #3 for PRJ-042 ($45,200) \u2014 ready for submission',
        'PEX 3/4" stock critical \u2014 2 units remaining, order needed',
        'Schedule toolbox talk for this week (last one: Feb 14)',
      ],
    },
  ],
};

/* ── Icon Map ──────────────────────────────────────────────────────────── */

const ICON_MAP = {
  DollarSign,
  FolderKanban,
  Users,
  AlertTriangle,
};

/* ── Component ────────────────────────────────────────────────────────── */

export default function MorningBriefing() {
  const briefing = demoBriefing;
  const generatedDate = new Date(briefing.generated_at);
  const formattedTime = generatedDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      <DemoBanner />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Morning Briefing
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Generated {formattedTime}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            AI-Generated
          </span>
        </div>
      </div>

      {/* Greeting */}
      <div
        className="rounded-lg p-5"
        style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
      >
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {briefing.greeting}
        </p>
      </div>

      {/* Weather Summary */}
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-3"
        style={{
          background: 'var(--status-profit-bg)',
          border: '1px solid color-mix(in srgb, var(--status-profit) 30%, transparent)',
        }}
      >
        <Sun size={18} style={{ color: 'var(--status-profit)', flexShrink: 0 }} />
        <span className="text-sm font-medium" style={{ color: 'var(--status-profit)' }}>
          {briefing.weather_summary}
        </span>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {briefing.sections.map((section) => (
          <SectionCard key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}

function BriefCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-lg p-3">
      <div className="text-xs text-brand-muted flex items-center gap-1"><Icon size={13} /> {label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
      <div className="text-xs text-brand-muted">{sub}</div>
/* ── Section Card ──────────────────────────────────────────────────────── */

function SectionCard({ section }) {
  const Icon = ICON_MAP[section.icon] || AlertTriangle;
  const isActionItems = section.title === 'Action Items';

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        background: 'var(--color-brand-card)',
        border: isActionItems
          ? '1px solid color-mix(in srgb, var(--status-warning) 40%, transparent)'
          : '1px solid var(--color-brand-border)',
      }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          style={{ color: isActionItems ? 'var(--status-warning)' : 'var(--accent)', flexShrink: 0 }}
        />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          {section.title}
        </h3>
      </div>

      {/* Items */}
      <ul className="space-y-2">
        {section.items.map((item, i) => {
          const isUrgent = item.startsWith('URGENT:');
          const isCritical = item.toLowerCase().includes('critical');

          return (
            <li key={i} className="flex items-start gap-2">
              {/* Urgency indicator */}
              {isUrgent ? (
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-px"
                  style={{ background: 'var(--status-loss-bg)', color: 'var(--status-loss)' }}
                >
                  URGENT
                </span>
              ) : isCritical ? (
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-px"
                  style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}
                >
                  ALERT
                </span>
              ) : (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                  style={{ background: isActionItems ? 'var(--status-warning)' : 'var(--accent)' }}
                />
              )}
              <span
                className="text-sm"
                style={{
                  color: isUrgent
                    ? 'var(--status-loss)'
                    : isCritical
                      ? 'var(--status-warning)'
                      : 'var(--text-primary)',
                  fontWeight: isUrgent ? 600 : 400,
                }}
              >
                {isUrgent ? item.replace('URGENT: ', '') : item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
