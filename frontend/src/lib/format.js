export function money(value, compact = false) {
  if (value == null) return '$0';
  const num = Number(value);
  if (compact && Math.abs(num) >= 1_000_000) {
    return '$' + (num / 1_000_000).toFixed(1) + 'M';
  }
  if (compact && Math.abs(num) >= 1_000) {
    return '$' + (num / 1_000).toFixed(0) + 'K';
  }
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function moneyExact(value) {
  if (value == null) return '$0.00';
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
