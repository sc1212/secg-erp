import { useState } from 'react';
import { moneyExact, shortDate, statusBadge } from '../../lib/format';
import { ChevronDown, ChevronRight, Code } from 'lucide-react';

export default function ActualsTab({ project }) {
  const [expandedPhase, setExpandedPhase] = useState({});
  const [expandedCode, setExpandedCode] = useState({});
  const [filterType, setFilterType] = useState('all');

  const phases = project.phases || [];

  // Gather all line items flat for filtering & totals
  const allItems = phases.flatMap((p) =>
    (p.costCodes || []).flatMap((cc) =>
      (cc.lineItems || []).map((li) => ({ ...li, phaseName: p.name, phaseCode: p.code, costCode: cc.code, costDesc: cc.description }))
    )
  );

  const types = ['all', ...new Set(allItems.map((i) => i.type))];
  const filteredItems = filterType === 'all' ? allItems : allItems.filter((i) => i.type === filterType);

  const totalActual = allItems.reduce((s, i) => s + i.amount, 0);
  const paidItems = allItems.filter((i) => i.status === 'paid');
  const totalPaid = paidItems.reduce((s, i) => s + i.amount, 0);
  const pendingItems = allItems.filter((i) => i.status !== 'paid');
  const totalPending = pendingItems.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Actuals', value: totalActual, sub: `${allItems.length} transactions` },
          { label: 'Paid', value: totalPaid, sub: `${paidItems.length} items` },
          { label: 'Pending/Approved', value: totalPending, sub: `${pendingItems.length} items` },
          { label: 'Budget Remaining', value: project.budget_total - totalActual, sub: `of ${moneyExact(project.budget_total)}` },
        ].map((card) => (
          <div key={card.label} className="bg-brand-card border border-brand-border rounded-lg p-4">
            <div className="text-xs text-brand-muted">{card.label}</div>
            <div className="text-xl font-bold mt-1">{moneyExact(card.value)}</div>
            <div className="text-[10px] text-brand-muted mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === t ? 'bg-brand-gold/15 text-brand-gold' : 'bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border'
            }`}
          >
            {t === 'all' ? `All (${allItems.length})` : `${t} (${allItems.filter((i) => i.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Phase → Cost Code → Line Items drill-down */}
      <div className="space-y-1">
        {phases.map((phase) => {
          const phaseItems = filteredItems.filter((i) => i.phaseCode === phase.code);
          if (phaseItems.length === 0 && filterType !== 'all') return null;
          const phaseTotal = phaseItems.reduce((s, i) => s + i.amount, 0);
          const isPhaseExpanded = expandedPhase[phase.id];

          return (
            <div key={phase.id}>
              <button
                onClick={() => setExpandedPhase((p) => ({ ...p, [phase.id]: !p[phase.id] }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-brand-card border border-brand-border rounded-lg hover:border-brand-gold/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isPhaseExpanded ? <ChevronDown size={14} className="text-brand-gold" /> : <ChevronRight size={14} className="text-brand-muted" />}
                  <span className="font-mono text-xs text-brand-gold">{phase.code}</span>
                  <span className="text-sm font-medium">{phase.name}</span>
                  <span className="text-[10px] text-brand-muted">({phaseItems.length} items)</span>
                </div>
                <span className="text-sm font-bold">{moneyExact(phaseTotal)}</span>
              </button>

              {isPhaseExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {(phase.costCodes || []).map((cc) => {
                    const codeItems = phaseItems.filter((i) => i.costCode === cc.code);
                    if (codeItems.length === 0) return null;
                    const codeTotal = codeItems.reduce((s, i) => s + i.amount, 0);
                    const isCodeExpanded = expandedCode[cc.id];

                    return (
                      <div key={cc.id}>
                        <button
                          onClick={() => setExpandedCode((p) => ({ ...p, [cc.id]: !p[cc.id] }))}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-brand-surface border border-brand-border/60 rounded-lg hover:border-brand-gold/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isCodeExpanded ? <ChevronDown size={12} className="text-brand-gold" /> : <ChevronRight size={12} className="text-brand-muted" />}
                            <span className="font-mono text-xs text-brand-gold/70">{cc.code}</span>
                            <span className="text-sm">{cc.description}</span>
                            <span className="text-[10px] text-brand-muted">({codeItems.length})</span>
                          </div>
                          <span className="text-sm font-medium">{moneyExact(codeTotal)}</span>
                        </button>

                        {isCodeExpanded && (
                          <div className="ml-6 mt-1">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-[10px] text-brand-muted uppercase border-b border-brand-border/30">
                                  <th className="pb-1.5 text-left">Date</th>
                                  <th className="pb-1.5 text-left">Vendor</th>
                                  <th className="pb-1.5 text-left">Description</th>
                                  <th className="pb-1.5 text-center">Type</th>
                                  <th className="pb-1.5 text-right">Amount</th>
                                  <th className="pb-1.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {codeItems.map((li) => (
                                  <tr key={li.id} className="border-b border-brand-border/15 hover:bg-brand-card-hover">
                                    <td className="py-2 text-xs text-brand-muted">{shortDate(li.date)}</td>
                                    <td className="py-2 text-xs font-medium">{li.vendor}</td>
                                    <td className="py-2 text-xs">{li.description}</td>
                                    <td className="py-2 text-center">
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-muted/10 text-brand-muted uppercase">{li.type}</span>
                                    </td>
                                    <td className="py-2 text-right font-medium">{moneyExact(li.amount)}</td>
                                    <td className="py-2 text-center">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${statusBadge(li.status)}`}>{li.status}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
    </div>
  );
}
