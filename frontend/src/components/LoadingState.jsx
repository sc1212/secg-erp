function SkeletonBlock({ className = '' }) {
  return <div className={`rounded-lg bg-brand-surface shimmer ${className}`} aria-hidden="true" />;
}

export function PageLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading content">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
      </div>
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="h-48" />
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4" aria-live="polite">
      <div className="text-danger text-sm">{message || 'Something went wrong'}</div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-sm lg:hover:border-brand-gold/40 transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2">
      <div className="text-brand-muted text-sm font-medium">{title || 'No data'}</div>
      {message && <div className="text-brand-muted/60 text-xs">{message}</div>}
    </div>
  );
}
