export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className={`${s} border-2 border-brand-border border-t-brand-gold rounded-full animate-spin`} />
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-danger text-sm">{message || 'Something went wrong'}</div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-sm hover:border-brand-gold/40 transition-colors">
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
