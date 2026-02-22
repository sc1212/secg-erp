import { useState } from 'react';
import { money } from '../lib/format';

const PROGRAM = {
  name: 'Q1 2026 Incentive Program',
  desc: 'Performance-based quarterly bonus pool',
  period: 'Jan 1 — Mar 31, 2026',
  pool: 15000,
  status: 'active',
  metrics: [
    { label: 'Job Margin %',          weight: 40, target: '18%' },
    { label: 'Daily Log Completion',  weight: 30, target: '100%' },
    { label: 'On-Time Milestones',    weight: 30, target: '95%' },
  ],
};

const SCORES = [
  { id: 1, name: 'Connor Webb',   role: 'PM',      score: 84, bonus: 3360, margin: '17.8%', logs: '98%', ontime: '100%' },
  { id: 2, name: 'Joseph Hall',   role: 'PM',      score: 76, bonus: 3040, margin: '15.2%', logs: '91%', ontime: '90%' },
  { id: 3, name: 'Abi Darnell',   role: 'PM',      score: 71, bonus: 2840, margin: '14.8%', logs: '88%', ontime: '88%' },
  { id: 4, name: 'Alex Torres',   role: 'PM',      score: 68, bonus: 2720, margin: '16.1%', logs: '82%', ontime: '85%' },
  { id: 5, name: 'Zach Monroe',   role: 'Mech',    score: 57, bonus: 1040, margin: '22.4%', logs: '62%', ontime: '—' },
  { id: 6, name: 'Colton Harris', role: 'Dir Ops', score: 88, bonus: 3520, margin: '18.9%', logs: '100%', ontime: '96%' },
];

function scoreColor(score) {
  if (score >= 80) return 'var(--status-profit)';
  if (score >= 60) return '#3b82f6';
  return 'var(--status-warning)';
}

function scoreBg(score) {
  if (score >= 80) return 'rgba(34,197,94,0.10)';
  if (score >= 60) return 'rgba(59,130,246,0.10)';
  return 'rgba(251,191,36,0.10)';
}

function scoreTier(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Developing';
}

function rankStyle(rank) {
  if (rank === 1) return { bg: 'rgba(212,175,55,0.15)',  color: '#D4AF37', border: 'rgba(212,175,55,0.4)' };
  if (rank === 2) return { bg: 'rgba(192,192,192,0.15)', color: '#B0B8C1', border: 'rgba(192,192,192,0.4)' };
  if (rank === 3) return { bg: 'rgba(205,127,50,0.15)',  color: '#CD7F32', border: 'rgba(205,127,50,0.4)' };
  return { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)', border: 'var(--color-brand-border)' };
}

export default function Scorecard() {
  const [expanded, setExpanded] = useState(null);

  const sorted = [...SCORES].sort((a, b) => b.score - a.score);
  const totalBonuses = sorted.reduce((s, e) => s + e.bonus, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Employee Scorecard</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{PROGRAM.name} &middot; Pool: {money(PROGRAM.pool)}</p>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{PROGRAM.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{PROGRAM.desc} &middot; {PROGRAM.period}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(34,197,94,0.12)', color: 'var(--status-profit)', textTransform: 'uppercase' }}>Active</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
          {[['Bonus Pool', money(PROGRAM.pool)], ['Participants', `${sorted.length} employees`], ['Allocated', `${money(totalBonuses)} of ${money(PROGRAM.pool)}`]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--color-brand-border)', paddingTop: 14 }}>
          {PROGRAM.metrics.map(m => (
            <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{m.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#3b82f6', color: '#fff' }}>{m.weight}%</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>target: {m.target}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Leaderboard</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((e, i) => {
          const rank = i + 1;
          const rs = rankStyle(rank);
          const sc = scoreColor(e.score);
          const sbg = scoreBg(e.score);
          const isExpanded = expanded === e.id;
          return (
            <div key={e.id} onClick={() => setExpanded(isExpanded ? null : e.id)} style={{ background: 'var(--color-brand-card)', border: `1px solid ${isExpanded ? sc : 'var(--color-brand-border)'}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>{rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{e.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>{e.role}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{scoreTier(e.score)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 8, background: sbg, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(e.score, 100)}%`, background: sc, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: sc, width: 32 }}>{e.score}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{money(e.bonus)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>est. bonus</div>
                </div>
              </div>
              {isExpanded && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--color-brand-border)', paddingTop: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[['Job Margin', e.margin, '18%', 40], ['Daily Log Completion', e.logs, '100%', 30], ['On-Time Milestones', e.ontime, '95%', 30]].map(([label, val, target, wt]) => {
                      const isNA = val === '—';
                      const isGood = !isNA && parseFloat(val) >= parseFloat(target);
                      return (
                        <div key={label} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.14)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>{label}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: isNA ? 'var(--text-tertiary)' : isGood ? 'var(--status-profit)' : 'var(--status-warning)' }}>{val}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#3b82f6', color: '#fff' }}>{wt}%</span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>target: {target}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
