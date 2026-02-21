import { useState } from 'react';
import { moneyExact, shortDate, statusBadge } from '../../lib/format';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { EmptyState } from '../LoadingState';

export default function ChangeOrdersTab({ project }) {
  const [expanded, setExpanded] = useState(null);
  const cos = project.change_orders || [];

  if (cos.length === 0) return <EmptyState title="No change orders" />;

  const totalApproved = cos.filter((c) => c.status === 'approved').reduce((s, c) => s + c.amount, 0);
  const totalPending = cos.filter((c) => c.status === 'pending_approval').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total COs', value: null, display: cos.length },
          { label: 'Approved Amount', value: totalApproved },
          { label: 'Pending Amount', value: totalPending },
        ].map((card) => (
          <div key={card.label} className="bg-brand-card border border-brand-border rounded-xl p-4">
            <div className="text-xs text-brand-muted">{card.label}</div>
            <div className="text-xl font-bold mt-1">{card.display || moneyExact(card.value)}</div>
          </div>
        ))}
      </div>

      {/* CO list */}
      <div className="space-y-3">
        {cos.map((co) => {
          const isExpanded = expanded === co.id;
          return (
            <div key={co.id} className="bg-brand-card border border-brand-border rounded-xl overflow-hidden hover:border-brand-gold/20 transition-colors">
              <button
                onClick={() => setExpanded(isExpanded ? null : co.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={14} className="text-brand-gold" /> : <ChevronRight size={14} className="text-brand-muted" />}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-brand-gold">{co.co_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(co.status)}`}>
                        {co.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-medium mt-1">{co.title}</div>
                    <div className="text-xs text-brand-muted mt-0.5">Submitted: {shortDate(co.date_submitted)}</div>
                  </div>
                </div>
                <div className="text-right font-bold text-lg">{moneyExact(co.amount)}</div>
              </button>

              {isExpanded && (
                <div className="px-5 py-4 bg-brand-surface border-t border-brand-border/50 space-y-4">
                  {/* Reason */}
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase font-semibold mb-1">Reason</div>
                    <div className="text-sm">{co.reason}</div>
                  </div>

                  {/* Schedule impact */}
                  {co.impact_days != null && (
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase font-semibold mb-1">Schedule Impact</div>
                      <div className={`text-sm font-medium ${co.impact_days > 0 ? 'text-warn' : 'text-ok'}`}>
                        {co.impact_days > 0 ? `+${co.impact_days} days` : 'No impact'}
                      </div>
                    </div>
                  )}

                  {/* Cost breakdown */}
                  {co.cost_impact && co.cost_impact.length > 0 && (
                    <div>
                      <div className="text-[10px] text-brand-muted uppercase font-semibold mb-2">Cost Impact Breakdown</div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] text-brand-muted uppercase border-b border-brand-border/40">
                            <th className="pb-1.5 text-left">Cost Code</th>
                            <th className="pb-1.5 text-left">Description</th>
                            <th className="pb-1.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {co.cost_impact.map((ci, i) => (
                            <tr key={i} className="border-b border-brand-border/20">
                              <td className="py-2 font-mono text-xs text-brand-gold">{ci.costCode}</td>
                              <td className="py-2">{ci.description}</td>
                              <td className="py-2 text-right font-medium">{moneyExact(ci.amount)}</td>
                            </tr>
                          ))}
                          <tr className="font-semibold">
                            <td className="pt-2"></td>
                            <td className="pt-2">Total</td>
                            <td className="pt-2 text-right">{moneyExact(co.cost_impact.reduce((s, c) => s + c.amount, 0))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex gap-4 text-xs text-brand-muted pt-2 border-t border-brand-border/30">
                    <span>Submitted: <b className="text-brand-text">{shortDate(co.date_submitted)}</b></span>
                    {co.date_approved && <span>Approved: <b className="text-ok">{shortDate(co.date_approved)}</b></span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
