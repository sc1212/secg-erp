/**
 * Draw Requests & Invoicing — Redesigned (Issue 11B)
 * Features: pending draws with detail cards, draw history, create new draw
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import {
  Building2, CheckCircle, Clock, AlertTriangle, FileText,
  Download, Send, Eye, Plus, Edit3, ChevronRight,
} from 'lucide-react';

const DEMO_PENDING = [
  {
    id: 3, project: 'Oak Creek', projectId: 2, drawNumber: 4, amount: 45000,
    status: 'ready', createdDate: '2026-02-20', percentComplete: 65,
    breakdown: 'Foundation 100%, Framing 95%, Plumbing 40%, HVAC 30%',
    supportingDocs: '4 invoices, 3 lien waivers attached',
  },
  {
    id: 6, project: 'Riverside Custom', projectId: 1, drawNumber: 3, amount: 62000,
    status: 'submitted', submittedDate: '2026-02-14', expectedFunding: '2026-02-26',
    daysUntilFunding: 4,
  },
];

const DEMO_HISTORY = [
  { id: 5, project: 'Riverside Custom', drawNumber: 3, amount: 58000, fundedDate: '2026-02-10', status: 'funded' },
  { id: 4, project: 'Oak Creek', drawNumber: 2, amount: 40000, fundedDate: '2026-01-28', status: 'funded' },
  { id: 2, project: 'Riverside Custom', drawNumber: 2, amount: 52000, fundedDate: '2026-01-15', status: 'funded' },
  { id: 1, project: 'Magnolia Spec', drawNumber: 1, amount: 35000, fundedDate: '2026-01-05', status: 'funded' },
];

const STATUS_BADGE = {
  ready: { label: 'Ready to Send', bg: 'var(--status-info-bg)', color: 'var(--status-info)' },
  submitted: { label: 'Submitted, Awaiting Funding', bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  funded: { label: 'Funded', bg: 'var(--status-profit-bg)', color: 'var(--status-profit)' },
  draft: { label: 'Draft', bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)' },
};

export default function Draws() {
  const navigate = useNavigate();
  const { isDemo } = useApi(() => api.dashboard(), []);
  const pending = DEMO_PENDING;
  const history = DEMO_HISTORY;

  const totalPending = pending.reduce((s, d) => s + d.amount, 0);
  const totalFunded = history.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Draw Requests & Invoicing</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Construction loan draws and client invoicing
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
          >
            <Plus size={14} /> Create New Draw Request
          </button>
          <button className="ghost-btn flex items-center gap-1.5">
            <FileText size={13} /> Create Invoice
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Pending Draws" value={money(totalPending)} icon={Clock} sub={`${pending.length} active`} />
        <KPICard label="Total Funded (YTD)" value={money(totalFunded)} icon={CheckCircle} sub={`${history.length} draws`} />
        <KPICard label="Active Projects" value="5" icon={Building2} sub="with draw schedules" />
        <KPICard label="Avg. Funding Time" value="7 days" icon={Clock} sub="from submission" />
      </div>

      {/* Pending Draws Section */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          Pending Draws
        </h2>
        <div className="space-y-3">
          {pending.map(draw => {
            const badge = STATUS_BADGE[draw.status] || STATUS_BADGE.draft;
            return (
              <div
                key={draw.id}
                className="rounded-lg overflow-hidden"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Draw #{draw.drawNumber} \u2014 {draw.project}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded text-xs font-semibold"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {money(draw.amount)}
                    </span>
                  </div>

                  {draw.status === 'ready' && (
                    <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div>Created: {shortDate(draw.createdDate)} &middot; % Complete: {draw.percentComplete}%</div>
                      <div>Breakdown: {draw.breakdown}</div>
                      <div>Supporting Docs: {draw.supportingDocs}</div>
                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="mc-score-track">
                          <div
                            className="mc-score-fill"
                            style={{ width: `${draw.percentComplete}%`, background: 'var(--accent)' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {draw.status === 'submitted' && (
                    <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div>Sent: {shortDate(draw.submittedDate)}</div>
                      <div>
                        Expected Funding: {shortDate(draw.expectedFunding)}
                        <span style={{ color: 'var(--status-info)', fontWeight: 500 }}> ({draw.daysUntilFunding} days)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-2 px-5 py-3"
                  style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}
                >
                  {draw.status === 'ready' && (
                    <>
                      <button className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1" style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}>
                        <Send size={12} /> Review & Send
                      </button>
                      <button className="ghost-btn flex items-center gap-1"><Edit3 size={12} /> Edit</button>
                      <button className="ghost-btn flex items-center gap-1"><Download size={12} /> Download PDF</button>
                    </>
                  )}
                  {draw.status === 'submitted' && (
                    <>
                      <button className="ghost-btn flex items-center gap-1"><Eye size={12} /> View</button>
                      <button className="ghost-btn flex items-center gap-1"><Send size={12} /> Follow Up</button>
                      <button className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1" style={{ background: 'var(--status-profit)', color: '#fff' }}>
                        <CheckCircle size={12} /> Mark as Funded
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Draw History */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          Draw History
        </h2>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          {history.map((draw, i) => (
            <div
              key={draw.id}
              className="flex items-center justify-between px-5 py-3 cursor-pointer transition-colors"
              style={{
                borderBottom: i < history.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: 'var(--bg-surface)',
              }}
              onClick={() => navigate(`/projects/${draw.project === 'Riverside Custom' ? 1 : draw.project === 'Oak Creek' ? 2 : 3}`)}
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={16} style={{ color: 'var(--status-profit)' }} />
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Draw #{draw.drawNumber} \u2014 {draw.project}
                  </span>
                  <span className="text-xs ml-3" style={{ color: 'var(--text-tertiary)' }}>
                    Funded {shortDate(draw.fundedDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {money(draw.amount)}
                </span>
                <span className="mc-badge mc-badge-profit">\u2713</span>
                <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
