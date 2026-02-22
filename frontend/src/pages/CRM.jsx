import { useState } from 'react';
import { money } from '../lib/format';

const PIPELINE = [
  { id: 1, name: 'Westside Custom Home',          client: 'Jennifer Adams',      type: 'Custom Home',    value: 580000,  prob: 75, status: 'shortlisted',   pm: 'Connor Webb',   notes: 'Bid submitted 2/10. Walking site 2/28.' },
  { id: 2, name: 'Riverstone Multifamily Phase 2', client: 'Riverstone Dev LLC', type: 'Multifamily',   value: 2100000, prob: 40, status: 'pursuing',      pm: 'Colton Harris', notes: 'RFP received. Estimate in progress.' },
  { id: 3, name: 'Oak Creek Remodel',              client: 'Robert Chen',         type: 'Remodel',       value: 92000,   prob: 65, status: 'bid_submitted', pm: 'Joseph Hall',   notes: 'Bid submitted 2/14. Decision expected 3/1.' },
  { id: 4, name: 'Crestview Office Build-Out',     client: 'Crestview Corp',      type: 'Commercial TI', value: 320000,  prob: 20, status: 'identified',    pm: 'Alex Torres',   notes: 'Initial inquiry. Meeting scheduled 3/5.' },
  { id: 5, name: 'Magnolia Custom Addition',       client: 'David & Karen Park',  type: 'Remodel',       value: 145000,  prob: 80, status: 'shortlisted',   pm: 'Connor Webb',   notes: 'Client selected us pending final pricing.' },
  { id: 6, name: 'Downtown Loft Renovation',       client: 'Sarah Mitchell',      type: 'Remodel',       value: 124000,  prob: 55, status: 'bid_submitted', pm: 'Abi Darnell',   notes: 'Competing against 2 other bids.' },
];

const LEADS = [
  { id: 1, name: 'Westside Custom Home',        status: 'qualified',      type: 'Custom Home',  contact: 'Jennifer Adams',      value: 580000,  salesperson: 'Matt S.' },
  { id: 2, name: 'Oak Creek Remodel',           status: 'proposal_sent',  type: 'Remodel',      contact: 'Robert Chen',          value: 92000,   salesperson: 'Matt S.' },
  { id: 3, name: 'Magnolia Custom Addition',    status: 'qualified',      type: 'Remodel',      contact: 'David & Karen Park',   value: 145000,  salesperson: 'Matt S.' },
  { id: 4, name: 'Downtown Loft Renovation',    status: 'proposal_sent',  type: 'Remodel',      contact: 'Sarah Mitchell',       value: 124000,  salesperson: 'Matt S.' },
  { id: 5, name: 'Riverstone Phase 2',          status: 'new',            type: 'Multifamily',  contact: 'Riverstone Dev LLC',   value: 2100000, salesperson: 'Matt S.' },
  { id: 6, name: 'Crestview Office Build-Out',  status: 'contacted',      type: 'Commercial',   contact: 'Crestview Corp',       value: 320000,  salesperson: 'Matt S.' },
  { id: 7, name: 'Sunrise Subdivision - Lot 4', status: 'new',            type: 'Spec Home',    contact: 'Inbound',              value: 460000,  salesperson: 'Matt S.' },
];

const WON_LOST = [
  { id: 1, name: 'Elm St Multifamily Phase 1', client: 'Elm St Holdings',    value: 2800000, result: 'won',  date: '2025-06-01' },
  { id: 2, name: 'Summerfield Custom Home',    client: 'The Johnson Family', value: 510000,  result: 'won',  date: '2025-08-15' },
  { id: 3, name: 'Gallatin Commercial Pad',    client: 'Gallatin Invest.',   value: 680000,  result: 'lost', date: '2025-09-22' },
  { id: 4, name: 'Heritage Pointe Spec',       client: 'Internal',           value: 420000,  result: 'won',  date: '2025-11-10' },
  { id: 5, name: 'Crossroads Retail TI',       client: 'Crossroads LLC',     value: 240000,  result: 'lost', date: '2025-12-05' },
  { id: 6, name: 'Smith Residence Addition',   client: 'Mark & Lisa Smith',  value: 88000,   result: 'won',  date: '2026-01-20' },
];

const STATUS_LABEL = { identified: 'Identified', pursuing: 'Pursuing', bid_submitted: 'Bid Submitted', shortlisted: 'Shortlisted' };
const STATUS_COLOR = {
  identified:    { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)' },
  pursuing:      { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)' },
  bid_submitted: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' },
  shortlisted:   { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)' },
};

const LEAD_STATUS_COLOR = {
  new:           { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)' },
  contacted:     { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)' },
  qualified:     { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' },
  proposal_sent: { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)' },
};

export default function CRM() {
  const [tab, setTab] = useState('pipeline');
  const [selected, setSelected] = useState(null);

  const totalPipeline = PIPELINE.reduce((s, p) => s + p.value, 0);
  const weightedPipeline = PIPELINE.reduce((s, p) => s + p.value * (p.prob / 100), 0);
  const wonRevenue = WON_LOST.filter(w => w.result === 'won').reduce((s, w) => s + w.value, 0);
  const winRate = Math.round((WON_LOST.filter(w => w.result === 'won').length / WON_LOST.length) * 100);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>CRM &amp; Pipeline</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{PIPELINE.length} active opportunities &middot; {LEADS.length} leads in system</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Pipeline Value', money(totalPipeline, true), '#3b82f6'],
          ['Weighted Value', money(weightedPipeline, true), 'var(--status-warning)'],
          ['Active Leads', LEADS.length, 'var(--text-primary)'],
          ['Win Rate (12 mo)', `${winRate}%`, 'var(--status-profit)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['pipeline','Pipeline'],['leads','Leads'],['history','Won / Lost']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
            color: tab === key ? '#3b82f6' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === key ? '#3b82f6' : 'transparent'}`,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PIPELINE.map(p => {
            const sc = STATUS_COLOR[p.status] || STATUS_COLOR.identified;
            const isSelected = selected === p.id;
            return (
              <div key={p.id}
                onClick={() => setSelected(isSelected ? null : p.id)}
                style={{ background: 'var(--color-brand-card)', border: `1px solid ${isSelected ? '#3b82f6' : 'var(--color-brand-border)'}`, borderRadius: 10, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-brand-border)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{STATUS_LABEL[p.status]}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.client} &middot; {p.type} &middot; PM: {p.pm}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(p.value)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.prob}% probability</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.prob}%`, background: p.prob >= 70 ? 'var(--status-profit)' : p.prob >= 40 ? '#3b82f6' : 'var(--text-tertiary)', borderRadius: 2 }} />
                </div>
                {isSelected && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {p.notes}
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>Weighted value: {money(p.value * p.prob / 100)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'leads' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Opportunity','Contact','Type','Value','Salesperson','Status'].map((h, i) => (
                <th key={h} style={{ ...thBase, textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {LEADS.map(l => {
                const sc = LEAD_STATUS_COLOR[l.status] || LEAD_STATUS_COLOR.new;
                return (
                  <tr key={l.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{l.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{l.contact}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{l.type}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{money(l.value)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{l.salesperson}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                        {l.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Won Revenue (12 mo)</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{money(wonRevenue, true)}</div>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Win Rate</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{winRate}%</div>
            </div>
          </div>
          <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Project','Client','Contract Value','Date','Result'].map((h, i) => (
                  <th key={h} style={{ ...thBase, textAlign: i === 2 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {WON_LOST.map(w => (
                  <tr key={w.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{w.client}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(w.value)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{w.date}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase',
                        background: w.result === 'won' ? 'rgba(34,197,94,0.12)' : 'rgba(251,113,133,0.12)',
                        color: w.result === 'won' ? 'var(--status-profit)' : 'var(--status-loss)',
                      }}>{w.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
