import { moneyExact, pct } from '../../lib/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ForecastTab({ project }) {
  const phases = project.phases || [];

  // Calculate project-level forecast totals
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
      <div className="bg-brand-card border border-brand-border rounded-xl p-5">
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
          <div className="h-3 bg-brand-bg rounded-full overflow-hidden relative">
            {/* Budget line at 100% */}
            <div className="absolute top-0 bottom-0 left-full -ml-px w-px bg-brand-text/30 z-10" style={{ left: '100%' }} />
            <div
              className={`h-full rounded-full transition-all ${forecastPct > 100 ? 'bg-danger' : forecastPct > 95 ? 'bg-warn' : 'bg-ok'}`}
              style={{ width: `${Math.min(forecastPct, 105)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase-by-phase forecast */}
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

            return (
              <div key={phase.id}>
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-2 items-center px-4 py-3 bg-brand-card border border-brand-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-gold">{phase.code}</span>
                    <span className="text-sm font-medium">{phase.name}</span>
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
                </div>

                {/* Cost codes within phase */}
                <div className="ml-6 mt-1 space-y-px">
                  {(phase.costCodes || []).map((cc) => {
                    const ccCtc = cc.forecast - cc.actual;
                    const ccTrend = cc.variance > 0 ? 'under' : cc.variance < 0 ? 'over' : 'on';
                    const CcIcon = ccTrend === 'under' ? TrendingDown : ccTrend === 'over' ? TrendingUp : Minus;
                    const ccColor = ccTrend === 'under' ? 'text-ok' : ccTrend === 'over' ? 'text-danger' : 'text-brand-muted';

                    return (
                      <div
                        key={cc.id}
                        className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_60px] gap-2 items-center px-4 py-2 bg-brand-surface border border-brand-border/40 rounded"
                      >
                        <div className="flex items-center gap-2">
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
                      </div>
                    );
                  })}
                </div>
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
