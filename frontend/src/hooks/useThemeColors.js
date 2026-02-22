import { useEffect, useState } from 'react';

function readColorTokens() {
  const styles = getComputedStyle(document.documentElement);
  const value = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    textMuted: value('--color-brand-muted', '#94A3B8'),
    border: value('--color-brand-border', '#E2E8F0'),
    card: value('--color-brand-card', '#FFFFFF'),
    ok: value('--color-ok', '#16A34A'),
    danger: value('--color-danger', '#DC2626'),
    gold: value('--color-brand-gold', '#2563EB'),
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
  const [colors, setColors] = useState(readColorTokens);

  useEffect(() => {
    const update = () => setColors(readColorTokens());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });

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
