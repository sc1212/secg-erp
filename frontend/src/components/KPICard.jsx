import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ label, value, sub, trend, icon: Icon }) {
  const isUp = trend && trend > 0;
  const isDown = trend && trend < 0;

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-brand-muted uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className="text-brand-gold" />}
      </div>
      <div className="text-2xl font-bold text-brand-text">{value}</div>
      {(sub || trend != null) && (
        <div className="flex items-center gap-2 mt-1">
          {trend != null && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-ok' : isDown ? 'text-danger' : 'text-brand-muted'}`}>
              {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : null}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {sub && <span className="text-xs text-brand-muted">{sub}</span>}
        </div>
      )}
    </div>
  );
}
