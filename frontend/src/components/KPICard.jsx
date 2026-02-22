import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ label, value, sub, trend, icon: Icon }) {
  const isUp = trend && trend > 0;
  const isDown = trend && trend < 0;

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        background: 'var(--color-brand-card)',
        border: '1px solid var(--color-brand-border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {Icon && <Icon size={16} style={{ color: 'var(--accent)' }} />}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {(sub || trend != null) && (
        <div className="flex items-center gap-2 mt-1">
          {trend != null && (
            <span
              className="flex items-center gap-0.5 text-xs font-medium"
              style={{
                color: isUp ? 'var(--status-profit)' : isDown ? 'var(--status-loss)' : 'var(--text-secondary)',
              }}
            >
              {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : null}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {sub && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}
