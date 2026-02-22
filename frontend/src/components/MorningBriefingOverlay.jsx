import { useState, useEffect } from 'react';
import { PROJECTS, FINANCIAL } from '../data/demoData';
import { money } from '../lib/format';
import { ChevronRight, AlertTriangle, FileText, DollarSign, CreditCard, X } from 'lucide-react';

export default function MorningBriefingOverlay({ onDismiss, onNavigate }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleDismiss = (dismissToday = false) => {
    if (dismissToday) localStorage.setItem('briefing_dismissed_date', new Date().toDateString());
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const today = new Date();
  const h = today.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const attention = [
    { text: 'PO-089 needs approval -- 84 Lumber $10,284 (Riverside)', link: '/projects/1', severity: 'warning' },
    { text: 'Johnson Office electrical 8% over budget', link: '/projects/5', severity: 'critical' },
    { text: 'Miller Concrete COI expires in 6 days -- 3 active projects', link: '/vendors', severity: 'warning' },
    { text: 'Magnolia Spec Draw #2 -- $58K outstanding 12 days', link: '/financials', severity: 'warning' },
    { text: '3 transactions need coding', link: '/financials', severity: 'info' },
  ];

  const totalContract = PROJECTS.reduce((s, p) => s + p.contract, 0);
  const avgMargin = (PROJECTS.reduce((s, p) => s + p.margin, 0) / PROJECTS.length).toFixed(1);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: visible ? 'rgba(11,17,33,0.85)' : 'rgba(11,17,33,0)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        transition: 'background 0.3s ease',
      }}
    >
      <div style={{
        maxWidth: 680, width: '100%',
        background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,23,42,0.98))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 32,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close */}
        <button onClick={() => handleDismiss()} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        {/* Greeting */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f2f5', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {greeting}, Matt
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{dateStr}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Murfreesboro, TN -- 42F Partly Cloudy</div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

        {/* Financial Snapshot 2x2 */}
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 12 }}>
          Financial Snapshot
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <SnapCard label="Cash in Bank" value={money(284320)} color="#34d399" sub="" />
          <SnapCard label="Effective Cash" value={money(127840)} color="#fbbf24" sub="After payroll + AP" />
          <SnapCard label="Coming in 7 days" value={'+$116,000'} color="#34d399" sub="Draw #3 Riverside $58K / Invoice Johnson $58K" />
          <SnapCard label="Going out 7 days" value={'-$72,400'} color="#fb7185" sub="Payroll $48K / Vendor bills $24.4K" />
        </div>

        {/* Portfolio Margin */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Portfolio Margin Health</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f5', fontFamily: 'JetBrains Mono, monospace' }}>16.8% <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>vs 15% target</span></span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '84%', height: '100%', background: 'linear-gradient(90deg, #34d399, #22d3ee)', borderRadius: 3 }} />
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

        {/* Needs Attention */}
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 10 }}>
          Needs Your Attention ({attention.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {attention.map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.link)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', textAlign: 'left',
                padding: '10px 12px', borderRadius: 8,
                background: item.severity === 'critical' ? 'rgba(251,113,133,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${item.severity === 'critical' ? 'rgba(251,113,133,0.2)' : 'rgba(255,255,255,0.05)'}`,
                color: '#e2e8f0', fontSize: 13, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = item.severity === 'critical' ? 'rgba(251,113,133,0.08)' : 'rgba(255,255,255,0.03)'; }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: item.severity === 'critical' ? '#fb7185' : item.severity === 'warning' ? '#fbbf24' : '#38bdf8',
              }} />
              <span style={{ flex: 1 }}>{item.text}</span>
              <ChevronRight size={14} style={{ color: '#64748b' }} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
            onClick={() => handleDismiss(true)}
            style={{
              padding: '10px 20px', borderRadius: 8,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Don't show today
          </button>
          <button
            onClick={() => handleDismiss()}
            style={{
              padding: '10px 24px', borderRadius: 8,
              background: '#3b82f6', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Go to Command Center
          </button>
        </div>
      </div>
    </div>
  );
}

function SnapCard({ label, value, color, sub }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
