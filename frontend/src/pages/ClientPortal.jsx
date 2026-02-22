import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { shortDate, money } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import DemoBanner from '../components/DemoBanner';
import { AlertTriangle, Camera, CheckCircle, Clock, Eye, EyeOff, FileText, Grid, Home, ListChecks, MessageSquare, Users } from 'lucide-react';

/* ── Demo Data ─────────────────────────────────────────────────────────── */

const demoClients = [
  {
    id: 1, name: 'Thompson Family', project: 'Custom Home — Brentwood', project_code: 'PRJ-042',
    status: 'active', last_login: '2026-02-21', portal_enabled: true,
    shared_photos: 47, shared_documents: 12, pending_selections: 3,
    milestones_visible: 8, milestones_complete: 5,
    next_milestone: 'Cabinet Installation — Mar 5',
    unread_messages: 2,
  },
  {
    id: 2, name: 'Rivera Family', project: 'Spec Home — Franklin', project_code: 'PRJ-038',
    status: 'active', last_login: '2026-02-19', portal_enabled: true,
    shared_photos: 23, shared_documents: 8, pending_selections: 0,
    milestones_visible: 6, milestones_complete: 4,
    next_milestone: 'Drywall Finish — Feb 28',
    unread_messages: 0,
  },
  {
    id: 3, name: 'Johnson', project: 'Remodel — Green Hills', project_code: 'PRJ-051',
    status: 'active', last_login: '2026-02-14', portal_enabled: false,
    shared_photos: 0, shared_documents: 0, pending_selections: 5,
    milestones_visible: 4, milestones_complete: 1,
    next_milestone: 'Demo Complete — Feb 25',
    unread_messages: 1,
  },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function ClientPortal() {
  const activePortals = demoClients.filter((c) => c.portal_enabled).length;
  const totalPendingSelections = demoClients.reduce((s, c) => s + c.pending_selections, 0);
  const totalUnread = demoClients.reduce((s, c) => s + c.unread_messages, 0);

  return (
    <div className="space-y-6">
      <DemoBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Client Portal
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Manage client-facing project views
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={Users} label="Active Portals" value={activePortals} sub={`${demoClients.length} total clients`} />
        <KpiCard
          icon={ListChecks}
          label="Pending Selections"
          value={totalPendingSelections}
          sub={totalPendingSelections > 0 ? 'awaiting client input' : 'all complete'}
          accent={totalPendingSelections > 0}
        />
        <KpiCard
          icon={MessageSquare}
          label="Unread Messages"
          value={totalUnread}
          sub={totalUnread > 0 ? 'needs response' : 'all caught up'}
          accent={totalUnread > 0}
        />
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {demoClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: accent ? 'var(--status-loss)' : 'var(--accent)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div className="text-xl font-bold" style={{ color: accent ? 'var(--status-loss)' : 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</div>
      )}
    </div>
  );
}

/* ── Client Card ───────────────────────────────────────────────────────── */

function ClientCard({ client }) {
  const progressPct = client.milestones_visible > 0
    ? Math.round((client.milestones_complete / client.milestones_visible) * 100)
    : 0;

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
    >
      {/* Header row: name + portal badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {client.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {client.project}
          </div>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {client.project_code}
          </div>
        </div>
        <PortalBadge enabled={client.portal_enabled} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Progress
          </span>
          <span className="text-[10px] font-medium num" style={{ color: 'var(--text-secondary)' }}>
            {client.milestones_complete} / {client.milestones_visible} milestones
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? 'var(--status-profit)' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Next milestone */}
      <div className="flex items-center gap-2">
        <Clock size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Next: {client.next_milestone}
        </span>
      </div>

      {/* Shared content counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Camera size={12} style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-xs num" style={{ color: 'var(--text-secondary)' }}>
            {client.shared_photos} photos
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={12} style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-xs num" style={{ color: 'var(--text-secondary)' }}>
            {client.shared_documents} docs
          </span>
        </div>
      </div>

      {/* Footer: selections, messages, last login */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border-medium)' }}
      >
        <div className="flex items-center gap-3">
          {/* Pending selections */}
          {client.pending_selections > 0 ? (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}
            >
              <AlertTriangle size={10} />
              {client.pending_selections} selection{client.pending_selections !== 1 ? 's' : ''} pending
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: 'var(--status-profit-bg)', color: 'var(--status-profit)' }}
            >
              <CheckCircle size={10} />
              Selections complete
            </span>
          )}

          {/* Unread messages badge */}
          {client.unread_messages > 0 && (
            <span
              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--status-loss)', color: '#fff', lineHeight: 1 }}
            >
              <MessageSquare size={10} />
              {client.unread_messages}
            </span>
          )}
        </div>

        {/* Last login */}
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          Login: {shortDate(client.last_login)}
        </span>
      </div>
    </div>
  );
}

/* ── Portal Badge ──────────────────────────────────────────────────────── */

function PortalBadge({ enabled }) {
  if (enabled) {
    return (
      <span
        className="flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0"
        style={{ background: 'var(--status-profit-bg)', color: 'var(--status-profit)' }}
      >
        <Eye size={10} />
        Enabled
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0"
      style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}
    >
      <EyeOff size={10} />
      Disabled
    </span>
  );
}
