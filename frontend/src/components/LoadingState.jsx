function SkeletonBlock({ className = '' }) {
  return <div className={`rounded-lg bg-brand-surface shimmer ${className}`} aria-hidden="true" />;
/* ── Loading States — Skeleton Shimmer (Design System Compliant) ──────────── */

export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        ...style,
      }}
    />
  );
}

export function PageLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading content">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
      </div>
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="h-48" />
    <div className="space-y-6 animate-pulse">
      {/* KPI row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-4"
            style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}
          >
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-52 w-full" />
      </div>
    </div>
  );
}

export function TableLoading({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" style={{ maxWidth: j === 0 ? 200 : 120 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" aria-live="polite">
      <div className="text-danger text-sm">{message || 'Something went wrong'}</div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-sm lg:hover:border-brand-gold/40 transition-colors">
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-sm" style={{ color: 'var(--status-loss)' }}>
        {message || 'Something went wrong'}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{
            background: 'var(--color-brand-card)',
            border: '1px solid var(--color-brand-border)',
            color: 'var(--text-primary)',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2">
      <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {title || 'No data'}
      </div>
      {message && <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {message}
      </div>}
    </div>
  );
}
