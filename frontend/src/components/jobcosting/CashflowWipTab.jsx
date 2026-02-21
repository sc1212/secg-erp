import { moneyExact, pct } from '../../lib/format';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CashflowWipTab({ project }) {
  const cf = project.cashflow || {};
  const wip = project.wip || {};
  const months = cf.months || [];

  // Build chart data
  const chartData = months.map((m, i) => ({
    month: m,
    budgeted: cf.budgetedSpend?.[i] || 0,
    actual: cf.actualSpend?.[i] || 0,
    billings: cf.billings?.[i] || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-xs">
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="font-medium">{moneyExact(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* WIP Summary */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-4">WIP Reconciliation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Contract Value', value: wip.totalContractValue },
            { label: 'Total Billed', value: wip.totalBilled },
            { label: 'Total Cost', value: wip.totalCost },
            { label: 'Earned Revenue', value: wip.earnedRevenue },
            { label: 'Est. Cost at Completion', value: wip.estimatedCostAtCompletion },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-[10px] text-brand-muted uppercase">{item.label}</div>
              <div className="text-lg font-bold mt-1">{moneyExact(item.value)}</div>
            </div>
          ))}
        </div>

        {/* Over/Under billing + Profit metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-brand-border/50">
          <div>
            <div className="text-[10px] text-brand-muted uppercase">Over/Under Billed</div>
            <div className={`text-lg font-bold mt-1 ${wip.overUnderBilled < 0 ? 'text-danger' : 'text-ok'}`}>
              {moneyExact(wip.overUnderBilled)}
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">
              {wip.overUnderBilled < 0 ? 'Under-billed' : 'Over-billed'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-brand-muted uppercase">Retainage Held</div>
            <div className="text-lg font-bold mt-1 text-warn">{moneyExact(wip.retainageHeld)}</div>
          </div>
          <div>
            <div className="text-[10px] text-brand-muted uppercase">Gross Profit</div>
            <div className="text-lg font-bold mt-1 text-ok">{moneyExact(wip.grossProfit)}</div>
          </div>
          <div>
            <div className="text-[10px] text-brand-muted uppercase">Gross Margin</div>
            <div className="text-lg font-bold mt-1 text-ok">{pct(wip.grossProfitPct)}</div>
          </div>
        </div>

        {/* % Complete bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-brand-muted mb-1">
            <span>Percent Complete</span>
            <span>{pct(wip.percentComplete)}</span>
          </div>
          <div className="h-3 bg-brand-bg rounded-full overflow-hidden">
            <div className="h-full bg-brand-gold rounded-full transition-all" style={{ width: `${wip.percentComplete}%` }} />
          </div>
        </div>
      </div>

      {/* Cashflow Chart - Costs */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-4">Monthly Cashflow</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
              <XAxis dataKey="month" tick={{ fill: '#A0A0B0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#A0A0B0', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#A0A0B0' }} />
              <Bar dataKey="budgeted" name="Budgeted" fill="#C9A84C" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="billings" name="Billings" fill="#22C55E" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">Monthly Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-[10px] text-brand-muted uppercase">
                <th className="pb-2 text-left">Month</th>
                <th className="pb-2 text-right">Budgeted</th>
                <th className="pb-2 text-right">Actual</th>
                <th className="pb-2 text-right">Variance</th>
                <th className="pb-2 text-right">Billings</th>
                <th className="pb-2 text-right">Net Cash</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => {
                const variance = row.budgeted - row.actual;
                const netCash = row.billings - row.actual;
                return (
                  <tr key={row.month} className="border-b border-brand-border/30 hover:bg-brand-card-hover">
                    <td className="py-2 font-medium">{row.month}</td>
                    <td className="py-2 text-right">{moneyExact(row.budgeted)}</td>
                    <td className="py-2 text-right">{moneyExact(row.actual)}</td>
                    <td className={`py-2 text-right ${variance < 0 ? 'text-danger' : 'text-ok'}`}>{moneyExact(variance)}</td>
                    <td className="py-2 text-right">{moneyExact(row.billings)}</td>
                    <td className={`py-2 text-right font-medium ${netCash < 0 ? 'text-danger' : 'text-ok'}`}>{moneyExact(netCash)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
