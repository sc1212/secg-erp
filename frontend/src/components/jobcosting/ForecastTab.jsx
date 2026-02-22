import { useState } from 'react';
import { moneyExact, pct, shortDate, statusBadge } from '../../lib/format';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight, CircleDot } from 'lucide-react';

export default function ForecastTab({ project }) {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [expandedCodes, setExpandedCodes] = useState({});

  const togglePhase = (id) => setExpandedPhases((p) => ({ ...p, [id]: !p[id] }));
  const toggleCode = (id) => setExpandedCodes((p) => ({ ...p, [id]: !p[id] }));

  const phases = project.phases || [];

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

  const costToComplete = totals.forecast - totals.actual;
  const forecastPct = totals.budget > 0 ? (totals.forecast / totals.budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall forecast summary */}
      <div className="bg-brand-card border border-brand-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-4">Project Forecast Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Original Budget', value: totals.budget },
            { label: 'Forecast at Completion', value: totals.forecast, highlight: totals.forecast > totals.budget },
            { label: 'Cost to Complete', value: costToComplete },
            { label: 'Actual to Date', value: totals.actual },
            { label: 'Projected Variance', value: totals.variance, isVariance: true },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-[10px] text-brand-muted uppercase">{item.label}</div>
              <div className={`text-lg font-bold mt-1 ${
                item.isVariance ? (item.value < 0 ? 'text-danger' : 'text-ok') : item.highlight ? 'text-warn' : ''
              }`}>
                {moneyExact(item.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Forecast vs budget bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-brand-muted mb-1">
            <span>Forecast vs Budget</span>
            <span>{pct(forecastPct)}</span>
          </div>
          <div className="h-3 bg-brand-surface rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-full -ml-px w-px bg-brand-text/30 z-10" style={{ left: '100%' }} />
            <div
              className={`h-full rounded-full transition-all ${forecastPct > 100 ? 'bg-danger' : forecastPct > 95 ? 'bg-warn' : 'bg-ok'}`}
              style={{ width: `${Math.min(forecastPct, 105)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase-by-phase forecast — fully expandable */}
      <div>
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">Forecast by Phase</h3>

        {/* Header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-2 px-4 pb-2 text-[10px] text-brand-muted uppercase tracking-wider">
          <span>Phase</span>
          <span className="text-right">Budget</span>
          <span className="text-right">Actual</span>
          <span className="text-right">Cost to Complete</span>
          <span className="text-right">Forecast</span>
          <span className="text-right">Variance</span>
          <span className="text-center">Trend</span>
        </div>

        <div className="space-y-1">
          {phases.map((phase) => {
            const ctc = phase.forecast - phase.actual;
            const trend = phase.variance > 0 ? 'under' : phase.variance < 0 ? 'over' : 'on';
            const TrendIcon = trend === 'under' ? TrendingDown : trend === 'over' ? TrendingUp : Minus;
            const trendColor = trend === 'under' ? 'text-ok' : trend === 'over' ? 'text-danger' : 'text-brand-muted';
            const isExpanded = expandedPhases[phase.id];

            return (
              <div key={phase.id}>
                {/* Phase row — clickable */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-2 items-center px-4 py-3 bg-brand-card border border-brand-border rounded-lg hover:border-brand-gold/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={14} className="text-brand-gold" /> : <ChevronRight size={14} className="text-brand-muted" />}
                    <span className="font-mono text-xs text-brand-gold">{phase.code}</span>
                    <span className="text-sm font-medium">{phase.name}</span>
                    <span className="text-[10px] text-brand-muted">({(phase.costCodes || []).length} codes)</span>
                  </div>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(phase.budget)}</span>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(phase.actual)}</span>
                  <span className="text-right text-sm hidden sm:block">{moneyExact(ctc)}</span>
                  <span className="text-right text-sm font-medium hidden sm:block">{moneyExact(phase.forecast)}</span>
                  <span className={`text-right text-sm font-medium hidden sm:block ${phase.variance < 0 ? 'text-danger' : 'text-ok'}`}>
                    {moneyExact(phase.variance)}
                  </span>
                  <span className={`hidden sm:flex justify-center ${trendColor}`}>
                    <TrendIcon size={16} />
                  </span>
                </button>

                {/* Expanded cost codes */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {(phase.costCodes || []).map((cc) => {
                      const ccCtc = cc.forecast - cc.actual;
                      const ccTrend = cc.variance > 0 ? 'under' : cc.variance < 0 ? 'over' : 'on';
                      const CcIcon = ccTrend === 'under' ? TrendingDown : ccTrend === 'over' ? TrendingUp : Minus;
                      const ccColor = ccTrend === 'under' ? 'text-ok' : ccTrend === 'over' ? 'text-danger' : 'text-brand-muted';
                      const isCodeExpanded = expandedCodes[cc.id];
                      const hasLineItems = cc.lineItems && cc.lineItems.length > 0;

                      return (
                        <div key={cc.id}>
                          {/* Cost code row */}
                          <button
                            onClick={() => hasLineItems && toggleCode(cc.id)}
                            className={`w-full grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-2 items-center px-4 py-2.5 bg-brand-surface border border-brand-border/60 rounded-lg transition-colors text-left ${hasLineItems ? 'hover:border-brand-gold/20 cursor-pointer' : 'cursor-default'}`}
                          >
                            <div className="flex items-center gap-2">
                              {hasLineItems ? (
                                isCodeExpanded ? <ChevronDown size={12} className="text-brand-gold" /> : <ChevronRight size={12} className="text-brand-muted" />
                              ) : (
                                <CircleDot size={12} className="text-brand-muted/40" />
                              )}
                              <span className="font-mono text-xs text-brand-gold/70">{cc.code}</span>
                              <span className="text-xs">{cc.description}</span>
                            </div>
                            <span className="text-right text-xs hidden sm:block">{moneyExact(cc.budget)}</span>
                            <span className="text-right text-xs hidden sm:block">{moneyExact(cc.actual)}</span>
                            <span className="text-right text-xs hidden sm:block">{moneyExact(ccCtc)}</span>
                            <span className="text-right text-xs font-medium hidden sm:block">{moneyExact(cc.forecast)}</span>
                            <span className={`text-right text-xs font-medium hidden sm:block ${cc.variance < 0 ? 'text-danger' : 'text-ok'}`}>
                              {moneyExact(cc.variance)}
                            </span>
                            <span className={`hidden sm:flex justify-center ${ccColor}`}>
                              <CcIcon size={12} />
                            </span>
                          </button>

                          {/* Expanded line items */}
                          {isCodeExpanded && hasLineItems && (
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
                                <div
                                  key={li.id}
                                  className="grid grid-cols-[100px_1fr_1fr_80px_80px_60px] gap-2 px-3 py-2 hover:bg-brand-card-hover rounded transition-colors"
                                >
                                  <span className="text-xs text-brand-muted">{shortDate(li.date)}</span>
                                  <span className="text-xs font-medium truncate">{li.vendor}</span>
                                  <span className="text-xs truncate">{li.description}</span>
                                  <span className="text-[10px] text-brand-muted uppercase">{li.type}</span>
                                  <span className="text-xs text-right font-medium">{moneyExact(li.amount)}</span>
                                  <span className="flex justify-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${statusBadge(li.status)}`}>{li.status}</span>
                                  </span>
                                </div>
                              ))}
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
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-2 px-4 py-3 mt-2 bg-brand-card border border-brand-gold/20 rounded-lg font-semibold text-sm">
          <span>Project Total</span>
          <span className="text-right">{moneyExact(totals.budget)}</span>
          <span className="text-right">{moneyExact(totals.actual)}</span>
          <span className="text-right">{moneyExact(costToComplete)}</span>
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
