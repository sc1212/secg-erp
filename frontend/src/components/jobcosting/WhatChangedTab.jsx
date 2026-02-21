import { useState } from 'react';
import { shortDate } from '../../lib/format';
import {
  GitCommit, DollarSign, FileText, Calendar, Gavel, Receipt, ArrowRight,
} from 'lucide-react';

const typeConfig = {
  budget_revision: { icon: DollarSign, color: 'text-warn', bg: 'bg-warn/10', label: 'Budget Revision' },
  change_order: { icon: Gavel, color: 'text-brand-gold', bg: 'bg-brand-gold/10', label: 'Change Order' },
  bid_received: { icon: FileText, color: 'text-brand-gold', bg: 'bg-brand-gold/10', label: 'Bid Received' },
  pay_app: { icon: Receipt, color: 'text-ok', bg: 'bg-ok/10', label: 'Pay App' },
  commitment: { icon: DollarSign, color: 'text-ok', bg: 'bg-ok/10', label: 'Commitment' },
  milestone: { icon: Calendar, color: 'text-brand-gold', bg: 'bg-brand-gold/10', label: 'Milestone' },
};

export default function WhatChangedTab({ project }) {
  const [filterType, setFilterType] = useState('all');
  const changeLog = project.changeLog || [];
  const types = ['all', ...new Set(changeLog.map((c) => c.type))];
  const filtered = filterType === 'all' ? changeLog : changeLog.filter((c) => c.type === filterType);

  return (
    <div className="space-y-6">
      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto">
        {types.map((t) => {
          const cfg = typeConfig[t];
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === t ? 'bg-brand-gold/15 text-brand-gold' : 'bg-brand-card text-brand-muted hover:text-brand-text border border-brand-border'
              }`}
            >
              {t === 'all' ? `All (${changeLog.length})` : `${cfg?.label || t} (${changeLog.filter((c) => c.type === t).length})`}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-brand-border" />

        <div className="space-y-1">
          {filtered.map((entry, i) => {
            const cfg = typeConfig[entry.type] || { icon: GitCommit, color: 'text-brand-muted', bg: 'bg-brand-muted/10', label: entry.type };
            const Icon = cfg.icon;

            return (
              <div key={entry.id} className="relative flex items-start gap-4 pl-2">
                {/* Timeline dot */}
                <div className={`relative z-10 w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={13} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 bg-brand-card border border-brand-border rounded-lg px-4 py-3 hover:border-brand-gold/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{entry.description}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        {entry.costCode && <span className="font-mono text-[10px] text-brand-gold">{entry.costCode}</span>}
                        {entry.category && <span className="text-[10px] text-brand-muted">{entry.category}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-brand-muted">{shortDate(entry.date)}</div>
                      <div className="text-[10px] text-brand-muted mt-0.5">by {entry.user}</div>
                    </div>
                  </div>

                  {/* Before/After */}
                  {(entry.before || entry.after) && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {entry.before && (
                        <span className="px-2 py-1 rounded bg-brand-surface text-brand-muted">{entry.before}</span>
                      )}
                      {entry.before && entry.after && <ArrowRight size={12} className="text-brand-muted" />}
                      {entry.after && (
                        <span className="px-2 py-1 rounded bg-brand-gold/10 text-brand-gold font-medium">{entry.after}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-brand-muted text-sm">No changes found for this filter.</div>
      )}
    </div>
  );
}
