import { useState } from 'react';
import { moneyExact, pct, shortDate, statusBadge } from '../../lib/format';
import { decisionQueue } from './demoData';
import {
  ChevronDown, ChevronRight, AlertTriangle, AlertCircle, Clock, FileCheck,
  ExternalLink, CircleDot,
} from 'lucide-react';

const priorityStyle = {
  high: 'border-danger/40 bg-danger/5',
  medium: 'border-warn/40 bg-warn/5',
  low: 'border-brand-border bg-brand-card',
};

const priorityDot = { high: 'bg-danger', medium: 'bg-warn', low: 'bg-brand-muted' };

const typeIcon = {
  needs_bid_selection: AlertTriangle,
  over_budget: AlertCircle,
  pending_approval: Clock,
  invoice_pending: FileCheck,
};

const phaseStatusStyle = {
  complete: 'bg-ok/20 text-ok',
  on_track: 'bg-ok/20 text-ok',
  in_progress: 'bg-brand-gold/20 text-brand-gold',
  at_risk: 'bg-warn/20 text-warn',
  over_budget: 'bg-danger/20 text-danger',
  not_started: 'bg-brand-muted/20 text-brand-muted',
  needs_bids: 'bg-warn/20 text-warn',
  pending: 'bg-brand-muted/20 text-brand-muted',
};

export default function CostCodesTab({ project, onNavigateToBids }) {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [expandedCodes, setExpandedCodes] = useState({});
  const [selectedLineItem, setSelectedLineItem] = useState(null);

  const togglePhase = (id) => setExpandedPhases((p) => ({ ...p, [id]: !p[id] }));
  const toggleCode = (id) => setExpandedCodes((p) => ({ ...p, [id]: !p[id] }));

  const phases = project.phases || [];

  // Totals
  const totals = phases.reduce(
    (acc, p) => ({
      budget: acc.budget + p.budget,
      committed: acc.committed + p.committed,
      actual: acc.actual + p.actual,
      forecast: acc.forecast + p.forecast,
      variance: acc.variance + p.variance,
    }),
    { budget: 0, committed: 0, actual: 0, forecast: 0, variance: 0 }
  );

  return (
    <div className="space-y-6">
      {/* ── Decision Queue ── */}
      <div>
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Decision Queue
          <span className="ml-2 px-1.5 py-0.5 rounded bg-danger/20 text-danger text-[10px] font-bold">
            {decisionQueue.length}
          </span>
        </h3>
        <div className="space-y-2">
          {decisionQueue.map((dq) => {
            const Icon = typeIcon[dq.type] || AlertCircle;
            return (
              <div
                key={dq.id}
                className={`border rounded-lg px-4 py-3 flex items-center gap-3 ${priorityStyle[dq.priority]}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[dq.priority]}`} />
                <Icon size={16} className="shrink-0 text-brand-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{dq.title}</div>
                  <div className="text-xs text-brand-muted">{dq.description}</div>
                </div>
                <span className="text-[10px] text-brand-muted whitespace-nowrap">{shortDate(dq.date)}</span>
                <button
                  onClick={() => {
                    if (dq.type === 'needs_bid_selection' && dq.bidRef && onNavigateToBids) {
                      onNavigateToBids(dq.bidRef);
                    }
                  }}
                  className="px-3 py-1 text-xs font-medium rounded bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 transition-colors whitespace-nowrap"
                >
                  {dq.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Phase Summary (expandable) ── */}
      <div>
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Phase Summary
        </h3>

        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-4 pb-2 text-[10px] text-brand-muted uppercase tracking-wider">
          <span>Phase</span>
          <span className="text-right">Budget</span>
          <span className="text-right">Committed</span>
          <span className="text-right">Actual</span>
          <span className="text-right">Forecast</span>
          <span className="text-right">Variance</span>
          <span className="text-center">Status</span>
        </div>

        <div className="space-y-1">
          {phases.map((phase) => {
            const isExpanded = expandedPhases[phase.id];
            return (
              <div key={phase.id}>
                {/* Phase row */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 items-center px-4 py-3 bg-brand-card border border-brand-border rounded-lg hover:border-brand-gold/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={14} className="text-brand-gold" /> : <ChevronRight size={14} className="text-brand-muted" />}
                    <span className="font-mono text-xs text-brand-gold">{phase.code}</span>
                    <span className="text-sm font-medium">{phase.name}</span>
                  </div>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(phase.budget)}</span>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(phase.committed)}</span>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(phase.actual)}</span>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(phase.forecast)}</span>
                  <span className={`text-right text-sm font-medium hidden sm:block ${phase.variance < 0 ? 'text-danger' : 'text-ok'}`}>
                    {moneyExact(phase.variance)}
                  </span>
                  <span className="hidden sm:flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${phaseStatusStyle[phase.status] || 'bg-brand-muted/20 text-brand-muted'}`}>
                      {phase.status?.replace(/_/g, ' ')}
                    </span>
                  </span>
                </button>

                {/* Expanded cost codes */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {(phase.costCodes || []).map((cc) => {
                      const isCodeExpanded = expandedCodes[cc.id];
                      return (
                        <div key={cc.id}>
                          {/* Cost code row */}
                          <button
                            onClick={() => toggleCode(cc.id)}
                            className="w-full grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 items-center px-4 py-2.5 bg-brand-surface border border-brand-border/60 rounded-lg hover:border-brand-gold/20 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2">
                              {cc.lineItems?.length > 0 ? (
                                isCodeExpanded ? <ChevronDown size={12} className="text-brand-gold" /> : <ChevronRight size={12} className="text-brand-muted" />
                              ) : (
                                <CircleDot size={12} className="text-brand-muted/40" />
                              )}
                              <span className="font-mono text-xs text-brand-gold/70">{cc.code}</span>
                              <span className="text-sm">{cc.description}</span>
                              {cc.needsBidSelection && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-warn/20 text-warn">NEEDS BID</span>
                              )}
                            </div>
                            <span className="text-right text-sm hidden sm:block">{moneyExact(cc.budget)}</span>
                            <span className="text-right text-sm hidden sm:block">{moneyExact(cc.committed)}</span>
                            <span className="text-right text-sm hidden sm:block">{moneyExact(cc.actual)}</span>
                            <span className="text-right text-sm hidden sm:block">{moneyExact(cc.forecast)}</span>
                            <span className={`text-right text-sm font-medium hidden sm:block ${cc.variance < 0 ? 'text-danger' : 'text-ok'}`}>
                              {moneyExact(cc.variance)}
                            </span>
                            <span className="hidden sm:flex justify-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${phaseStatusStyle[cc.status] || 'bg-brand-muted/20 text-brand-muted'}`}>
                                {cc.status?.replace(/_/g, ' ')}
                              </span>
                            </span>
                          </button>

                          {/* Expanded line items */}
                          {isCodeExpanded && cc.lineItems?.length > 0 && (
                            <div className="ml-6 mt-1 space-y-px">
                              <div className="grid grid-cols-[100px_1fr_1fr_80px_80px_60px] gap-2 px-3 py-1.5 text-[10px] text-brand-muted uppercase tracking-wider">
                                <span>Date</span>
                                <span>Vendor</span>
                                <span>Description</span>
                                <span>Type</span>
                                <span className="text-right">Amount</span>
                                <span className="text-center">Status</span>
                              </div>
                              {cc.lineItems.map((li) => (
                                <button
                                  key={li.id}
                                  onClick={() => setSelectedLineItem(selectedLineItem === li.id ? null : li.id)}
                                  className={`w-full grid grid-cols-[100px_1fr_1fr_80px_80px_60px] gap-2 px-3 py-2 text-left rounded transition-colors ${
                                    selectedLineItem === li.id ? 'bg-brand-gold/10 border border-brand-gold/30' : 'hover:bg-brand-card-hover border border-transparent'
                                  }`}
                                >
                                  <span className="text-xs text-brand-muted">{shortDate(li.date)}</span>
                                  <span className="text-xs font-medium truncate">{li.vendor}</span>
                                  <span className="text-xs truncate">{li.description}</span>
                                  <span className="text-[10px] text-brand-muted uppercase">{li.type}</span>
                                  <span className="text-xs text-right font-medium">{moneyExact(li.amount)}</span>
                                  <span className="flex justify-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${statusBadge(li.status)}`}>{li.status}</span>
                                  </span>
                                </button>
                              ))}
                              {/* Line items subtotal */}
                              <div className="grid grid-cols-[100px_1fr_1fr_80px_80px_60px] gap-2 px-3 py-2 border-t border-brand-border/40">
                                <span></span>
                                <span></span>
                                <span className="text-xs text-brand-muted font-medium">Subtotal ({cc.lineItems.length} items)</span>
                                <span></span>
                                <span className="text-xs text-right font-bold">
                                  {moneyExact(cc.lineItems.reduce((s, l) => s + l.amount, 0))}
                                </span>
                                <span></span>
                              </div>
                            </div>
                          )}

                          {isCodeExpanded && (!cc.lineItems || cc.lineItems.length === 0) && (
                            <div className="ml-6 mt-1 px-4 py-3 text-xs text-brand-muted italic bg-brand-surface/50 rounded border border-brand-border/30">
                              No line items yet.{' '}
                              {cc.needsBidSelection && (
                                <button
                                  onClick={() => onNavigateToBids && onNavigateToBids(`cc-${cc.code.replace('-', '-')}`)}
                                  className="text-brand-gold hover:underline inline-flex items-center gap-1"
                                >
                                  Review bids <ExternalLink size={10} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals row */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-3 mt-2 bg-brand-card border border-brand-gold/20 rounded-lg font-semibold text-sm">
          <span>Project Total</span>
          <span className="text-right">{moneyExact(totals.budget)}</span>
          <span className="text-right">{moneyExact(totals.committed)}</span>
          <span className="text-right">{moneyExact(totals.actual)}</span>
          <span className="text-right">{moneyExact(totals.forecast)}</span>
          <span className={`text-right font-bold ${totals.variance < 0 ? 'text-danger' : 'text-ok'}`}>
            {moneyExact(totals.variance)}
          </span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
