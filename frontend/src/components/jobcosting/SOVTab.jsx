import { useState } from 'react';
import { moneyExact, pct } from '../../lib/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function SOVTab({ project }) {
  const [expandedLine, setExpandedLine] = useState(null);
  const lines = project.sov_lines || [];

  // Totals
  const totals = lines.reduce(
    (acc, l) => ({
      scheduled: acc.scheduled + l.scheduled_value,
      prevBilled: acc.prevBilled + l.previous_billed,
      currentBilled: acc.currentBilled + l.current_billed,
      stored: acc.stored + (l.stored_materials || 0),
      balance: acc.balance + l.balance_to_finish,
    }),
    { scheduled: 0, prevBilled: 0, currentBilled: 0, stored: 0, balance: 0 }
  );
  const totalPct = totals.scheduled > 0 ? ((totals.scheduled - totals.balance) / totals.scheduled) * 100 : 0;

  // Find matching pay app billing detail for a SOV line
  const getBillingHistory = (lineNum) => {
    const payApps = project.pay_apps || [];
    return payApps
      .map((pa) => {
        const match = (pa.lines || []).find((l) => l.sovLine === lineNum);
        if (!match || match.thisperiod === 0) return null;
        return { payApp: pa.pay_app_number, period: pa.period, amount: match.thisperiod, retainage: match.retainage, status: pa.status };
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Contract Value', value: totals.scheduled },
          { label: 'Total Billed', value: totals.prevBilled + totals.currentBilled },
          { label: 'Balance to Finish', value: totals.balance },
          { label: 'Overall % Complete', value: null, display: pct(totalPct) },
        ].map((card) => (
          <div key={card.label} className="bg-brand-card border border-brand-border rounded-lg p-4">
            <div className="text-xs text-brand-muted">{card.label}</div>
            <div className="text-xl font-bold mt-1">{card.display || moneyExact(card.value)}</div>
          </div>
        ))}
      </div>

      {/* SOV Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-left text-[10px] text-brand-muted uppercase">
              <th className="pb-3 pr-2 w-8"></th>
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 pr-4 text-right">Scheduled Value</th>
              <th className="pb-3 pr-4 text-right">Prev Billed</th>
              <th className="pb-3 pr-4 text-right">Current</th>
              <th className="pb-3 pr-4 text-right">% Complete</th>
              <th className="pb-3 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const isExpanded = expandedLine === l.id;
              const history = getBillingHistory(l.line_number);
              const hasHistory = history.length > 0;
              return (
                <>
                  <tr
                    key={l.id}
                    className={`border-b border-brand-border/50 cursor-pointer transition-colors ${isExpanded ? 'bg-brand-gold/5' : 'hover:bg-brand-card-hover'}`}
                    onClick={() => setExpandedLine(isExpanded ? null : l.id)}
                  >
                    <td className="py-3 pr-2">
                      {hasHistory && (isExpanded ? <ChevronDown size={12} className="text-brand-gold" /> : <ChevronRight size={12} className="text-brand-muted" />)}
                    </td>
                    <td className="py-3 pr-4 text-brand-muted">{l.line_number}</td>
                    <td className="py-3 pr-4">{l.description}</td>
                    <td className="py-3 pr-4 text-right">{moneyExact(l.scheduled_value)}</td>
                    <td className="py-3 pr-4 text-right">{moneyExact(l.previous_billed)}</td>
                    <td className="py-3 pr-4 text-right">{moneyExact(l.current_billed)}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-brand-bg rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full bg-brand-gold rounded-full" style={{ width: `${l.percent_complete}%` }} />
                        </div>
                        <span>{pct(l.percent_complete)}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">{moneyExact(l.balance_to_finish)}</td>
                  </tr>
                  {isExpanded && hasHistory && (
                    <tr key={`${l.id}-detail`}>
                      <td colSpan={8} className="pb-3">
                        <div className="ml-10 bg-brand-surface border border-brand-border/50 rounded-lg p-3">
                          <div className="text-[10px] text-brand-muted uppercase font-semibold mb-2">Billing History</div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-[10px] text-brand-muted uppercase border-b border-brand-border/30">
                                <th className="pb-1 text-left">Pay App</th>
                                <th className="pb-1 text-left">Period</th>
                                <th className="pb-1 text-right">Billed</th>
                                <th className="pb-1 text-right">Retainage</th>
                                <th className="pb-1 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {history.map((h, i) => (
                                <tr key={i} className="border-b border-brand-border/15">
                                  <td className="py-1.5 font-medium">#{h.payApp}</td>
                                  <td className="py-1.5 text-brand-muted">{h.period}</td>
                                  <td className="py-1.5 text-right">{moneyExact(h.amount)}</td>
                                  <td className="py-1.5 text-right text-brand-muted">{moneyExact(h.retainage)}</td>
                                  <td className="py-1.5 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                                      h.status === 'paid' ? 'bg-ok/20 text-ok' : 'bg-brand-gold/20 text-brand-gold'
                                    }`}>{h.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-border font-semibold">
              <td className="py-3 pr-2"></td>
              <td className="py-3 pr-4"></td>
              <td className="py-3 pr-4">Total</td>
              <td className="py-3 pr-4 text-right">{moneyExact(totals.scheduled)}</td>
              <td className="py-3 pr-4 text-right">{moneyExact(totals.prevBilled)}</td>
              <td className="py-3 pr-4 text-right">{moneyExact(totals.currentBilled)}</td>
              <td className="py-3 pr-4 text-right">{pct(totalPct)}</td>
              <td className="py-3 text-right">{moneyExact(totals.balance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
