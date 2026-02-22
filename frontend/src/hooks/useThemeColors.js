import { useState, useEffect } from 'react';

function getThemeColors() {
  const s = getComputedStyle(document.documentElement);
  const get = (v) => s.getPropertyValue(v).trim();
  return {
    chartPrimary:   get('--chart-primary')   || '#38bdf8',
    chartSecondary: get('--chart-secondary') || '#818cf8',
    chartTertiary:  get('--chart-tertiary')  || '#34d399',
    textPrimary:    get('--text-primary')     || '#f0f2f5',
    textSecondary:  get('--text-secondary')   || '#94a3b8',
    textTertiary:   get('--text-tertiary')    || '#475569',
    borderSubtle:   get('--border-subtle')    || 'rgba(255,255,255,0.05)',
    borderMedium:   get('--border-medium')    || 'rgba(255,255,255,0.08)',
    bgSurface:      get('--bg-surface')       || '#111828',
    bgElevated:     get('--bg-elevated')      || '#151f30',
    bgCard:         get('--color-brand-card') || '#111828',
    statusProfit:   get('--status-profit')    || '#34d399',
    statusLoss:     get('--status-loss')      || '#fb7185',
    statusWarning:  get('--status-warning')   || '#fbbf24',
    accent:         get('--accent')           || '#38bdf8',
  };
}

export function useThemeColors() {
  const [colors, setColors] = useState(getThemeColors);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          requestAnimationFrame(() => setColors(getThemeColors()));
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return colors;
}
