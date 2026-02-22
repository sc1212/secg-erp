/**
 * Formatting utilities — CFO-grade financial rendering
 *
 * Rules:
 *   - Negatives ALWAYS use accounting parentheses: ($12,400)
 *   - Negatives ALWAYS get the `.num.negative` class for red color
 *   - Compact values ($1.2M) always carry a title tooltip with the full value
 *   - All numeric cells should use the `.num` CSS class for tabular alignment
 */

const usdFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdExact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format money with accounting-style parenthetical negatives.
 * @param {number|null|undefined} value
 * @param {boolean} compact  If true, abbreviates ≥1M as $1.2M, ≥1K as $45K
 * @returns {string}
 */
export function money(value, compact = false) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const num = Number(value);
  const abs = Math.abs(num);

  let out;
  if (compact && abs >= 1_000_000) {
    out = '$' + (abs / 1_000_000).toFixed(1) + 'M';
  } else if (compact && abs >= 1_000) {
    out = '$' + (abs / 1_000).toFixed(0) + 'K';
  } else {
    out = usdFull.format(abs);
  }

  return num < 0 ? `(${out})` : out;
}

/**
 * Full-precision money (2 decimal places) with parenthetical negatives.
 */
export function moneyExact(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const num = Number(value);
  const formatted = usdExact.format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
}

/**
 * Returns the full un-abbreviated money string for use as a tooltip title
 * when compact formatting is displayed.
 */
export function moneyFull(value) {
  if (value == null || Number.isNaN(Number(value))) return '';
  return money(value, false);
}

/**
 * CSS class for a numeric cell — applies .num always, adds .negative for < 0.
 */
export function moneyClass(value) {
  if (value != null && Number(value) < 0) return 'num negative';
  return 'num';
}

export function moneyAccounting(value) {
  if (value == null) return '$0.00';
  const num = Number(value);
  const absolute = Math.abs(num).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return num < 0 ? `(${absolute})` : absolute;
}

export function pct(value) {
  if (value == null) return '0%';
  return Number(value).toFixed(1) + '%';
}

export function shortDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function statusColor(status) {
  const map = {
    active: 'text-ok',
    completed: 'text-brand-muted',
    on_hold: 'text-warn',
    pre_construction: 'text-brand-gold',
    paid: 'text-ok',
    approved: 'text-ok',
    overdue: 'text-danger',
    rejected: 'text-danger',
    draft: 'text-brand-muted',
    sent: 'text-brand-gold',
    partial: 'text-warn',
    submitted: 'text-brand-gold',
    critical: 'text-danger',
    warning: 'text-warn',
    info: 'text-ok',
  };
  return map[status] || 'text-brand-text';
}

export function statusBadge(status) {
  const colorMap = {
    active: 'bg-ok/20 text-ok',
    completed: 'bg-brand-muted/20 text-brand-muted',
    on_hold: 'bg-warn/20 text-warn',
    pre_construction: 'bg-brand-gold/20 text-brand-gold',
    paid: 'bg-ok/20 text-ok',
    approved: 'bg-ok/20 text-ok',
    overdue: 'bg-danger/20 text-danger',
    rejected: 'bg-danger/20 text-danger',
    draft: 'bg-brand-muted/20 text-brand-muted',
    sent: 'bg-brand-gold/20 text-brand-gold',
    submitted: 'bg-brand-gold/20 text-brand-gold',
    won: 'bg-ok/20 text-ok',
    lost: 'bg-danger/20 text-danger',
  };
  return colorMap[status] || 'bg-brand-muted/20 text-brand-muted';
}
