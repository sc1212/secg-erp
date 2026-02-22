import { useState } from 'react';
import { moneyExact, shortDate, statusBadge } from '../../lib/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PayAppsTab({ project }) {
  const [expanded, setExpanded] = useState(null);
  const payApps = project.pay_apps || [];

  // Totals
  const totalRequested = payApps.reduce((s, p) => s + p.amount_requested, 0);
  const totalApproved = payApps.reduce((s, p) => s + p.amount_approved, 0);
  const totalRetainage = payApps.reduce((s, p) => s + p.retainage_held, 0);
  const totalNet = payApps.reduce((s, p) => s + p.net_payment, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Requested', value: totalRequested },
          { label: 'Total Approved', value: totalApproved },
          { label: 'Retainage Held', value: totalRetainage },
          { label: 'Net Paid', value: totalNet },
        ].map((card) => (
          <div key={card.label} className="bg-brand-card border border-brand-border rounded-lg p-4">
            <div className="text-xs text-brand-muted">{card.label}</div>
            <div className="text-xl font-bold mt-1">{moneyExact(card.value)}</div>
          </div>
        ))}
      </div>

      {/* Pay apps list */}
      <div className="space-y-3">
        {payApps.map((pa) => {
          const isExpanded = expanded === pa.id;
          return (
            <div key={pa.id} className="bg-brand-card border border-brand-border rounded-lg overflow-hidden hover:border-brand-gold/20 transition-colors">
              <button
                onClick={() => setExpanded(isExpanded ? null : pa.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={14} className="text-brand-gold" /> : <ChevronRight size={14} className="text-brand-muted" />}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Pay App #{pa.pay_app_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(pa.status)}`}>{pa.status}</span>
                      {pa.period && <span className="text-xs text-brand-muted">{pa.period}</span>}
                    </div>
                    <div className="text-xs text-brand-muted mt-1">
                      Submitted: {shortDate(pa.submitted_date)}
                      {pa.paid_date && ` • Paid: ${shortDate(pa.paid_date)}`}
                      {pa.approved_date && !pa.paid_date && ` • Approved: ${shortDate(pa.approved_date)}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{moneyExact(pa.net_payment)}</div>
                  <div className="text-xs text-brand-muted">Retainage: {moneyExact(pa.retainage_held)}</div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 py-4 bg-brand-surface border-t border-brand-border/50">
                  {/* Summary row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
                    {[
                      { label: 'Requested', value: pa.amount_requested },
                      { label: 'Approved', value: pa.amount_approved },
                      { label: 'Retainage (10%)', value: pa.retainage_held },
                      { label: 'Net Payment', value: pa.net_payment },
                    ].map((col) => (
                      <div key={col.label}>
                        <div className="text-[10px] text-brand-muted uppercase">{col.label}</div>
                        <div className="text-sm font-bold mt-0.5">{moneyExact(col.value)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Line items breakdown */}
                  {pa.lines && pa.lines.length > 0 && (
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase font-semibold mb-2">Billing Breakdown</div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] text-brand-muted uppercase border-b border-brand-border/40">
                            <th className="pb-1.5 text-left">SOV Line</th>
                            <th className="pb-1.5 text-left">Description</th>
                            <th className="pb-1.5 text-right">This Period</th>
                            <th className="pb-1.5 text-right">Retainage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pa.lines.map((line, i) => (
                            <tr key={i} className="border-b border-brand-border/20">
                              <td className="py-2 text-brand-muted">#{line.sovLine}</td>
                              <td className="py-2">{line.description}</td>
                              <td className="py-2 text-right font-medium">{moneyExact(line.thisperiod)}</td>
                              <td className="py-2 text-right text-brand-muted">{moneyExact(line.retainage)}</td>
                            </tr>
                          ))}
                          <tr className="font-semibold">
                            <td className="pt-2"></td>
                            <td className="pt-2">Total</td>
                            <td className="pt-2 text-right">{moneyExact(pa.lines.reduce((s, l) => s + l.thisperiod, 0))}</td>
                            <td className="pt-2 text-right text-brand-muted">{moneyExact(pa.lines.reduce((s, l) => s + l.retainage, 0))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
