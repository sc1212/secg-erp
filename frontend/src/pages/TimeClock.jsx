import { useState } from 'react';
import { CheckCircle, MapPin, Clock } from 'lucide-react';
import { PROJECTS } from '../lib/demoData';

// Today = 2026-02-22
const ENTRIES = [
  { id: 1, name: 'Connor Webb',   project: 1, code: 'SC-001', in: '07:02', out: null,   hrs: null,  geo: true,  approved: false },
  { id: 2, name: 'Zach Monroe',   project: 3, code: 'SC-003', in: '06:48', out: null,   hrs: null,  geo: true,  approved: false },
  { id: 3, name: 'Joseph Hall',   project: 3, code: 'SC-003', in: '07:15', out: null,   hrs: null,  geo: false, approved: false },
  { id: 4, name: 'Alex Torres',   project: 6, code: 'SC-006', in: '07:30', out: null,   hrs: null,  geo: true,  approved: false },
  { id: 5, name: 'Abi Darnell',   project: 5, code: 'SC-005', in: '07:00', out: '15:45', hrs: 8.75, geo: true,  approved: true },
  { id: 6, name: 'Connor Webb',   project: 1, code: 'SC-001', in: '07:05', out: '16:00', hrs: 8.92, geo: true,  approved: true, date: '2026-02-21' },
  { id: 7, name: 'Zach Monroe',   project: 3, code: 'SC-003', in: '06:50', out: '15:30', hrs: 8.67, geo: true,  approved: true, date: '2026-02-21' },
  { id: 8, name: 'Joseph Hall',   project: 3, code: 'SC-003', in: '07:10', out: '16:05', hrs: 8.92, geo: true,  approved: false, date: '2026-02-21' },
  { id: 9, name: 'Alex Torres',   project: 6, code: 'SC-006', in: '07:25', out: '15:55', hrs: 8.50, geo: true,  approved: true, date: '2026-02-21' },
  { id: 10, name: 'Abi Darnell',  project: 5, code: 'SC-005', in: '07:02', out: '16:10', hrs: 9.13, geo: true,  approved: true, date: '2026-02-21' },
];

const TODAY = '2026-02-22';
const YESTERDAY = '2026-02-21';

function hoursActive(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const then = new Date();
  then.setHours(h, m, 0, 0);
  const diff = now - then;
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

export default function TimeClock() {
  const [tab, setTab] = useState('today');

  const todayEntries = ENTRIES.filter(e => !e.date || e.date === TODAY);
  const yestEntries = ENTRIES.filter(e => e.date === YESTERDAY);
  const allEntries = ENTRIES;

  const displayEntries = tab === 'today' ? todayEntries : tab === 'yesterday' ? yestEntries : allEntries;

  const activeCrew = todayEntries.filter(e => !e.out);
  const pendingApproval = allEntries.filter(e => e.out && !e.approved).length;
  const todayHours = todayEntries.filter(e => e.hrs).reduce((s, e) => s + e.hrs, 0);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Time Clock</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>GPS field clock-in/out — hours auto-allocated to projects and cost codes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['On Clock Now', activeCrew.length, 'var(--status-profit)'],
          ['Today\'s Hours Logged', todayHours.toFixed(1), '#3b82f6'],
          ['GPS Verified', activeCrew.filter(e => e.geo).length, 'var(--status-profit)'],
          ['Pending Approval', pendingApproval, pendingApproval > 0 ? 'var(--status-warning)' : 'var(--status-profit)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {activeCrew.length > 0 && (
        <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--status-profit)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>{activeCrew.length} crew member{activeCrew.length !== 1 ? 's' : ''} currently on the clock</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {activeCrew.map(e => {
              const proj = PROJECTS.find(p => p.id === e.project);
              return (
                <div key={e.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#3b82f6', flexShrink: 0 }}>
                    {e.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{proj?.name?.split(' ').slice(0, 2).join(' ')} &middot; {hoursActive(e.in)}</div>
                    {!e.geo && <div style={{ fontSize: 10, color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}><MapPin size={9} /> Outside geofence</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['today','Today'],['yesterday','Yesterday'],['all','All Entries']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
            color: tab === key ? '#3b82f6' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === key ? '#3b82f6' : 'transparent'}`,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Employee','Project','Date','Clock In','Clock Out','Hours','GPS','Status'].map((h, i) => (
              <th key={h} style={{ ...thBase, textAlign: i >= 5 && i <= 6 ? 'center' : i === 5 ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {displayEntries.map(e => {
              const proj = PROJECTS.find(p => p.id === e.project);
              return (
                <tr key={e.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 14, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#3b82f6', flexShrink: 0 }}>
                        {e.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{proj?.name?.split(' ').slice(0, 2).join(' ')}</td>
                  <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{e.date || TODAY}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{e.in}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', color: e.out ? 'var(--text-primary)' : 'var(--status-profit)', fontWeight: e.out ? 400 : 600 }}>
                    {e.out || '● Active'}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {e.hrs ? `${e.hrs.toFixed(2)}h` : e.out ? '—' : hoursActive(e.in)}
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, color: e.geo ? 'var(--status-profit)' : 'var(--status-warning)' }}>
                      <MapPin size={11} /> {e.geo ? 'OK' : 'Out'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {!e.out
                      ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.12)', color: 'var(--status-profit)' }}>On Clock</span>
                      : e.approved
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--status-profit)' }}><CheckCircle size={11} /> Approved</span>
                        : <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(251,191,36,0.12)', color: 'var(--status-warning)' }}>Pending</span>
                    }
                  </td>
                </tr>
              );
            })}
            {displayEntries.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No time entries for this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Weekly Hours by Project</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PROJECTS.slice(0, 6).map(p => {
            const projEntries = ENTRIES.filter(e => e.project === p.id && e.hrs);
            const total = projEntries.reduce((s, e) => s + e.hrs, 0);
            if (total === 0) return null;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 160, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(total / 50) * 100}%`, background: '#3b82f6', borderRadius: 3 }} />
                </div>
                <div style={{ width: 48, fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{total.toFixed(1)}h</div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </div>
    </div>
  );
}
