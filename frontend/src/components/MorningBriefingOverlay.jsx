import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, TrendingUp, TrendingDown, X } from 'lucide-react';

const BRIEFING = {
  user: 'Matt',
  date: 'Sunday, February 22, 2026',
  weather: 'Murfreesboro, TN  ·  42°F  ·  Partly Cloudy',
  financials: [
    { label: 'Cash in Bank',       value: '$284,320', sub: '',                                        color: 'var(--status-profit)' },
    { label: 'Effective Cash',     value: '$127,840', sub: 'After payroll + AP',                      color: 'var(--status-warning)' },
    { label: 'Coming in 7 Days',   value: '+$116,000', sub: 'Draw #3 Riverside $58K · Invoice Johnson $58K', color: 'var(--status-profit)' },
    { label: 'Going out 7 Days',   value: '-$72,400',  sub: 'Payroll $48K · Vendor bills $24.4K',    color: 'var(--status-loss)' },
  ],
  margin: { pct: 16.8, target: 15 },
  attention: [
    { text: 'PO-089 needs approval — 84 Lumber $10,284 (Riverside)',   link: '/exceptions',               level: 'critical' },
    { text: 'Johnson Office electrical 8% over budget',                link: '/projects/5?tab=costs',      level: 'warning' },
    { text: 'Miller Concrete COI expires in 6 days — 3 active projects', link: '/vendors',                level: 'warning' },
    { text: 'Magnolia Spec Draw #2 — $58K outstanding 12 days',        link: '/draws',                    level: 'warning' },
    { text: '3 transactions need coding in QuickBooks',                 link: '/financials?tab=transactions', level: 'info' },
  ],
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const LEVEL_COLOR = {
  critical: 'var(--status-loss)',
  warning:  'var(--status-warning)',
  info:     'var(--accent)',
};

export default function MorningBriefingOverlay({ onDismiss }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onDismiss, 250);
  }

  function go(link) {
    dismiss();
    setTimeout(() => navigate(link), 260);
  }

  function dismissToday() {
    localStorage.setItem('briefing_dismissed_date', new Date().toDateString());
    dismiss();
  }

  const marginBar = Math.min(100, (BRIEFING.margin.pct / 25) * 100);
  const targetBar = Math.min(100, (BRIEFING.margin.target / 25) * 100);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 560,
        background: '#0F1929',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 16,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'transform 0.25s ease',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f0f4f8', letterSpacing: '-0.3px' }}>
                {getGreeting()}, {BRIEFING.user}.
              </div>
              <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.5)', marginTop: 4 }}>
                {BRIEFING.date}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)', marginTop: 2 }}>
                {BRIEFING.weather}
              </div>
            </div>
            <button onClick={dismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 14, textTransform: 'uppercase' }}>
            Financial Snapshot
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {BRIEFING.financials.map((f) => (
              <div key={f.label} style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{f.label}</div>
                <div style={{
                  fontSize: 22, fontWeight: 700,
                  color: f.color,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  letterSpacing: '-0.5px',
                }}>{f.value}</div>
                {f.sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, lineHeight: 1.4 }}>{f.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Margin Health */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
              Portfolio Margin Health
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-profit)', fontFamily: 'monospace' }}>
              {BRIEFING.margin.pct}% <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 11 }}>vs {BRIEFING.margin.target}% target</span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, position: 'relative', overflow: 'visible' }}>
            <div style={{ height: '100%', width: `${marginBar}%`, background: 'var(--status-profit)', borderRadius: 3, transition: 'width 0.6s ease' }} />
            <div style={{
              position: 'absolute', top: -2, left: `${targetBar}%`,
              width: 2, height: 10, background: 'var(--status-warning)',
              borderRadius: 1,
            }} />
          </div>
        </div>

        {/* Needs Attention */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 12, textTransform: 'uppercase' }}>
            Needs Your Attention ({BRIEFING.attention.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BRIEFING.attention.map((item, i) => (
              <button
                key={i}
                onClick={() => go(item.link)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8, padding: '10px 14px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: LEVEL_COLOR[item.level], flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(240,244,248,0.8)', flex: 1 }}>{item.text}</span>
                <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 28px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={dismissToday}
            style={{
              padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            Don&apos;t show today
          </button>
          <button
            onClick={dismiss}
            style={{
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; }}
          >
            Go to Command Center <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
