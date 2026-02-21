import { useState } from 'react';
import { moneyExact, shortDate } from '../../lib/format';
import { Star, Shield, ShieldAlert, Award, ChevronDown, ChevronRight } from 'lucide-react';

const bidStatusStyle = {
  awarded: 'bg-ok/20 text-ok',
  submitted: 'bg-brand-gold/20 text-brand-gold',
  rejected: 'bg-danger/20 text-danger',
  pending_selection: 'bg-warn/20 text-warn',
};

export default function BidsQuotesTab({ project, initialBidRef }) {
  const bids = project.bids || {};
  const bidKeys = Object.keys(bids);
  const [selectedBid, setSelectedBid] = useState(initialBidRef || bidKeys[0] || '');
  const [expandedVendor, setExpandedVendor] = useState(null);

  if (bidKeys.length === 0) {
    return <div className="text-center py-12 text-brand-muted">No bids or quotes available for this project.</div>;
  }

  const currentBid = bids[selectedBid];
  if (!currentBid) return null;

  const vendors = currentBid.vendors || [];

  // Get all unique line items across vendors for comparison matrix
  const allItems = [...new Set(vendors.flatMap((v) => v.breakdown.map((b) => b.item)))];

  return (
    <div className="space-y-6">
      {/* Cost code selector pills */}
      <div>
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">Select Scope</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {bidKeys.map((key) => {
            const b = bids[key];
            return (
              <button
                key={key}
                onClick={() => { setSelectedBid(key); setExpandedVendor(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                  selectedBid === key
                    ? 'bg-brand-gold/15 border-brand-gold text-brand-gold'
                    : 'bg-brand-card border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-gold/30'
                }`}
              >
                <span className="font-mono text-xs mr-2">{b.costCode}</span>
                {b.description}
                {b.status === 'pending_selection' && (
                  <span className="ml-2 w-2 h-2 bg-warn rounded-full inline-block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bid header info */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Bid Comparison — {currentBid.costCode} {currentBid.description}</h3>
          <div className="text-sm text-brand-muted mt-1">
            Budget: <b className="text-brand-text">{moneyExact(currentBid.budget)}</b>
            <span className="mx-2">•</span>
            {vendors.length} bid{vendors.length !== 1 ? 's' : ''} received
          </div>
        </div>
        <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${bidStatusStyle[currentBid.status] || 'bg-brand-muted/20 text-brand-muted'}`}>
          {currentBid.status?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* ── Comparison Matrix ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="pb-3 pr-4 text-left text-xs text-brand-muted uppercase w-48">Line Item</th>
              {vendors.map((v) => (
                <th key={v.id} className="pb-3 px-3 text-center min-w-[180px]">
                  <div className={`rounded-lg p-3 ${v.recommended ? 'bg-brand-gold/10 border border-brand-gold/40' : 'bg-brand-card border border-brand-border'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-sm">{v.name}</span>
                      {v.recommended && <Award size={14} className="text-brand-gold" />}
                    </div>
                    <div className="text-lg font-bold mt-1">{moneyExact(v.baseBid)}</div>
                    <div className={`text-xs mt-1 ${v.baseBid <= currentBid.budget ? 'text-ok' : 'text-danger'}`}>
                      {v.baseBid <= currentBid.budget ? 'Under budget' : `Over by ${moneyExact(v.baseBid - currentBid.budget)}`}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 mt-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} className={s <= Math.floor(v.rating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-muted/30'} />
                      ))}
                      <span className="text-[10px] text-brand-muted ml-1">{v.rating}</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Base bid row */}
            <tr className="border-b border-brand-border/50 bg-brand-surface/50">
              <td className="py-2.5 pr-4 font-semibold text-xs uppercase text-brand-muted">Base Bid</td>
              {vendors.map((v) => (
                <td key={v.id} className="py-2.5 px-3 text-center font-bold">{moneyExact(v.baseBid)}</td>
              ))}
            </tr>

            {/* Line items comparison */}
            {allItems.map((item) => {
              // Find lowest price for this item
              const prices = vendors.map((v) => {
                const line = v.breakdown.find((b) => b.item === item);
                return line ? line.amount : null;
              });
              const validPrices = prices.filter((p) => p !== null);
              const lowest = validPrices.length > 0 ? Math.min(...validPrices) : null;

              return (
                <tr key={item} className="border-b border-brand-border/30 hover:bg-brand-card-hover">
                  <td className="py-2 pr-4 text-sm">{item}</td>
                  {vendors.map((v, i) => {
                    const line = v.breakdown.find((b) => b.item === item);
                    if (!line) return <td key={v.id} className="py-2 px-3 text-center text-brand-muted">—</td>;
                    const isLowest = line.amount === lowest && validPrices.length > 1;
                    return (
                      <td key={v.id} className="py-2 px-3 text-center">
                        <div className={`text-sm ${isLowest ? 'text-ok font-semibold' : ''}`}>{moneyExact(line.amount)}</div>
                        <div className="text-[10px] text-brand-muted">{line.qty} @ {moneyExact(line.unitPrice)}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Notes row */}
            <tr className="border-b border-brand-border/30">
              <td className="py-2.5 pr-4 font-semibold text-xs uppercase text-brand-muted align-top">Notes</td>
              {vendors.map((v) => (
                <td key={v.id} className="py-2.5 px-3 text-xs text-brand-muted">{v.notes}</td>
              ))}
            </tr>

            {/* Exclusions row */}
            <tr className="border-b border-brand-border/30">
              <td className="py-2.5 pr-4 font-semibold text-xs uppercase text-danger/70 align-top">Exclusions</td>
              {vendors.map((v) => (
                <td key={v.id} className="py-2.5 px-3 text-xs text-danger/80">{v.exclusions}</td>
              ))}
            </tr>

            {/* Insurance row */}
            <tr className="border-b border-brand-border/30">
              <td className="py-2.5 pr-4 font-semibold text-xs uppercase text-brand-muted align-top">Insurance</td>
              {vendors.map((v) => (
                <td key={v.id} className="py-2.5 px-3">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    {v.insurance?.gl && <span className="text-[9px] px-1.5 py-0.5 rounded bg-ok/20 text-ok">GL</span>}
                    {v.insurance?.wc ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-ok/20 text-ok">WC</span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/20 text-danger">No WC</span>
                    )}
                    {v.insurance?.auto && <span className="text-[9px] px-1.5 py-0.5 rounded bg-ok/20 text-ok">Auto</span>}
                  </div>
                  <div className="text-[10px] text-brand-muted text-center mt-1">Exp: {shortDate(v.insurance?.expiry)}</div>
                </td>
              ))}
            </tr>

            {/* Date submitted */}
            <tr className="border-b border-brand-border/30">
              <td className="py-2.5 pr-4 font-semibold text-xs uppercase text-brand-muted">Submitted</td>
              {vendors.map((v) => (
                <td key={v.id} className="py-2.5 px-3 text-center text-xs text-brand-muted">{shortDate(v.submittedDate)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-end">
        {vendors.map((v) => (
          <button
            key={v.id}
            disabled={currentBid.status === 'awarded'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              v.recommended
                ? 'bg-brand-gold text-brand-bg hover:bg-brand-gold/90'
                : 'bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text'
            } ${currentBid.status === 'awarded' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {currentBid.status === 'awarded' && currentBid.awardedVendor === v.id
              ? 'Awarded'
              : v.recommended
              ? `Award to ${v.name}`
              : `Select ${v.name}`}
          </button>
        ))}
      </div>

      {/* ── Vendor Detail Drill-Down ── */}
      <div>
        <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3">Vendor Detail</h3>
        <div className="space-y-2">
          {vendors.map((v) => {
            const isExpanded = expandedVendor === v.id;
            return (
              <div key={v.id} className={`border rounded-xl overflow-hidden transition-colors ${v.recommended ? 'border-brand-gold/30' : 'border-brand-border'}`}>
                <button
                  onClick={() => setExpandedVendor(isExpanded ? null : v.id)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-brand-card hover:bg-brand-card-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={14} className="text-brand-gold" /> : <ChevronRight size={14} />}
                    <span className="font-medium">{v.name}</span>
                    {v.recommended && <Award size={14} className="text-brand-gold" />}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${bidStatusStyle[v.status]}`}>{v.status}</span>
                  </div>
                  <span className="font-bold">{moneyExact(v.baseBid)}</span>
                </button>
                {isExpanded && (
                  <div className="px-5 py-4 bg-brand-surface border-t border-brand-border/50 space-y-4">
                    {/* Full breakdown table */}
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-brand-border/50 text-xs text-brand-muted uppercase">
                          <th className="pb-2 text-left">Item</th>
                          <th className="pb-2 text-right">Qty</th>
                          <th className="pb-2 text-right">Unit Price</th>
                          <th className="pb-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.breakdown.map((line, i) => (
                          <tr key={i} className="border-b border-brand-border/20">
                            <td className="py-2">{line.item}</td>
                            <td className="py-2 text-right text-brand-muted">{line.qty}</td>
                            <td className="py-2 text-right">{moneyExact(line.unitPrice)}</td>
                            <td className="py-2 text-right font-medium">{moneyExact(line.amount)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td className="pt-2" colSpan={3}>Total</td>
                          <td className="pt-2 text-right">{moneyExact(v.baseBid)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Notes, exclusions, insurance */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-brand-muted uppercase font-semibold mb-1">Notes</div>
                        <div className="text-sm">{v.notes}</div>
                      </div>
                      <div>
                        <div className="text-xs text-danger/70 uppercase font-semibold mb-1">Exclusions</div>
                        <div className="text-sm text-danger/80">{v.exclusions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-brand-muted uppercase font-semibold mb-1">Insurance / Rating</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {v.insurance?.gl && <span className="text-[9px] px-1.5 py-0.5 rounded bg-ok/20 text-ok">GL</span>}
                          {v.insurance?.wc ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-ok/20 text-ok">WC</span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/20 text-danger flex items-center gap-1"><ShieldAlert size={10} />No WC</span>
                          )}
                          {v.insurance?.auto && <span className="text-[9px] px-1.5 py-0.5 rounded bg-ok/20 text-ok">Auto</span>}
                        </div>
                        <div className="flex items-center gap-0.5 mt-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= Math.floor(v.rating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-muted/30'} />
                          ))}
                          <span className="text-xs text-brand-muted ml-1">{v.rating} / 5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
