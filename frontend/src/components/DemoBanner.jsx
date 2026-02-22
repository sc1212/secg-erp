import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium mb-4"
      style={{
        background: 'var(--status-warning-bg)',
        color: 'var(--status-warning)',
        border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)',
      }}
    >
      <AlertTriangle size={14} />
      <span>Demo Mode — Backend unreachable. Showing sample data, not live financials.</span>
    </div>
  );
}
