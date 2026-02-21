import { useState } from 'react';
import { moneyExact, shortDate, statusBadge } from '../../lib/format';
import { ChevronDown, ChevronRight, FileText, ShoppingCart } from 'lucide-react';

const typeIcon = { subcontract: FileText, purchase_order: ShoppingCart };
const typeLabel = { subcontract: 'Subcontract', purchase_order: 'Purchase Order' };

export default function CommitmentsTab({ project }) {
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState('all'); // all, active, closed

  const commitments = project.commitments || [];
  const filtered = filter === 'all' ? commitments : commitments.filter((c) => c.status === filter);

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // Totals
  const totals = commitments.reduce(
    (acc, c) => ({
      original: acc.original + c.originalAmount,
      cos: acc.cos + c.approvedCOs,
      revised: acc.revised + c.revisedAmount,
      invoiced: acc.invoiced + c.invoiced,
      paid: acc.paid + c.paid,
      remaining: acc.remaining + c.remaining,
      retainage: acc.retainage + c.retainage,
    }),
    { original: 0, cos: 0, revised: 0, invoiced: 0, paid: 0, remaining: 0, retainage: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Committed', value: totals.revised, sub: `${commitments.length} contracts/POs` },
          { label: 'Invoiced', value: totals.invoiced, sub: `${((totals.invoiced / totals.revised) * 100).toFixed(1)}% of committed` },
          { label: 'Paid', value: totals.paid, sub: `Retainage: ${moneyExact(totals.retainage)}` },
          { label: 'Remaining', value: totals.remaining, sub: `Open commitments: ${commitments.filter((c) => c.status === 'active').length}` },
        ].map((card) => (
          <div key={card.label} className="bg-brand-card border border-brand-border rounded-xl p-4">
            <div className="text-xs text-brand-muted">{card.label}</div>
            <div className="text-xl font-bold mt-1">{moneyExact(card.value)}</div>
            <div className="text-[10px] text-brand-muted mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-brand-gold/15 text-brand-gold' : 'bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border'
            }`}
          >
            {f === 'all' ? `All (${commitments.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${commitments.filter((c) => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Commitments list */}
      <div className="space-y-2">
        {filtered.map((cmt) => {
          const isExpanded = expanded[cmt.id];
          const Icon = typeIcon[cmt.type] || FileText;
          return (
            <div key={cmt.id} className="border border-brand-border rounded-xl overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => toggle(cmt.id)}
                className="w-full flex items-center gap-4 px-5 py-3.5 bg-brand-card hover:bg-brand-card-hover transition-colors text-left"
              >
                {isExpanded ? <ChevronDown size={14} className="text-brand-gold shrink-0" /> : <ChevronRight size={14} className="text-brand-muted shrink-0" />}
                <Icon size={16} className="text-brand-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-brand-gold">{cmt.number}</span>
                    <span className="text-sm font-medium">{cmt.vendor}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(cmt.status)}`}>{cmt.status}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-muted/10 text-brand-muted">{typeLabel[cmt.type]}</span>
                  </div>
                  <div className="text-xs text-brand-muted mt-0.5">{cmt.description} — {cmt.phase}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">{moneyExact(cmt.revisedAmount)}</div>
                  {cmt.approvedCOs > 0 && (
                    <div className="text-[10px] text-brand-muted">Orig: {moneyExact(cmt.originalAmount)} + CO: {moneyExact(cmt.approvedCOs)}</div>
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 py-4 bg-brand-surface border-t border-brand-border/50 space-y-4">
                  {/* Commitment summary bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                    {[
                      { label: 'Original', value: cmt.originalAmount },
                      { label: 'Approved COs', value: cmt.approvedCOs },
                      { label: 'Revised Total', value: cmt.revisedAmount },
                      { label: 'Invoiced', value: cmt.invoiced },
                      { label: 'Remaining', value: cmt.remaining },
                    ].map((col) => (
                      <div key={col.label}>
                        <div className="text-[10px] text-brand-muted uppercase">{col.label}</div>
                        <div className="text-sm font-bold mt-0.5">{moneyExact(col.value)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                      <span>Invoiced: {moneyExact(cmt.invoiced)}</span>
                      <span>{cmt.revisedAmount > 0 ? ((cmt.invoiced / cmt.revisedAmount) * 100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-gold rounded-full transition-all"
                        style={{ width: `${cmt.revisedAmount > 0 ? Math.min((cmt.invoiced / cmt.revisedAmount) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Invoices drill-down */}
                  {cmt.invoices && cmt.invoices.length > 0 && (
                    <div>
                      <div className="text-xs text-brand-muted uppercase font-semibold mb-2">Invoices ({cmt.invoices.length})</div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-brand-border/50 text-[10px] text-brand-muted uppercase">
                            <th className="pb-2 text-left">Invoice #</th>
                            <th className="pb-2 text-left">Date</th>
                            <th className="pb-2 text-right">Amount</th>
                            <th className="pb-2 text-center">Status</th>
                            <th className="pb-2 text-left">Paid Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cmt.invoices.map((inv) => (
                            <tr key={inv.id} className="border-b border-brand-border/20 hover:bg-brand-card-hover">
                              <td className="py-2 font-mono text-xs text-brand-gold">{inv.number}</td>
                              <td className="py-2 text-xs text-brand-muted">{shortDate(inv.date)}</td>
                              <td className="py-2 text-right font-medium">{moneyExact(inv.amount)}</td>
                              <td className="py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(inv.status)}`}>{inv.status}</span>
                              </td>
                              <td className="py-2 text-xs text-brand-muted">{inv.paidDate ? shortDate(inv.paidDate) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-brand-muted pt-2 border-t border-brand-border/30">
                    <span>Cost Code: <b className="text-brand-text">{cmt.costCode}</b></span>
                    <span>Issued: <b className="text-brand-text">{shortDate(cmt.date)}</b></span>
                    {cmt.retainage > 0 && <span>Retainage Held: <b className="text-warn">{moneyExact(cmt.retainage)}</b></span>}
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
