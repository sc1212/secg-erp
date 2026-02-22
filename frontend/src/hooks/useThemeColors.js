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
  };
}

export function useThemeColors() {
  const [colors, setColors] = useState(readColorTokens);

  useEffect(() => {
    const update = () => setColors(readColorTokens());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });

    return () => observer.disconnect();
  }, []);

  return colors;
}
