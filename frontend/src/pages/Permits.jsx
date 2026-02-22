import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { PROJECTS } from '../lib/demoData';

const PERMITS = [
  { id:  1, project: 1, number: 'BP-2025-0441', type: 'Building',    desc: 'New residential construction — 3,400 sf single-family', authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-08-10', issued: '2025-09-02', expires: '2026-09-02', fee: 5200 },
  { id:  2, project: 1, number: 'EP-2025-0882', type: 'Electrical',  desc: '200A service upgrade and rough-in wiring',              authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-09-01', issued: '2025-09-20', expires: '2026-09-20', fee: 1400 },
  { id:  3, project: 1, number: 'PP-2025-0374', type: 'Plumbing',    desc: 'Full plumbing rough-in and fixture installation',        authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-09-01', issued: '2025-09-20', expires: '2026-09-20', fee: 980 },
  { id:  4, project: 2, number: 'BP-2025-0512', type: 'Building',    desc: 'Spec home — 2,800 sf single-family residential',        authority: 'City of Franklin',        status: 'active',   applied: '2025-10-15', issued: '2025-11-01', expires: '2026-11-01', fee: 4800 },
  { id:  5, project: 3, number: 'BP-2026-0023', type: 'Building',    desc: 'Spec home — 2,600 sf single-family residential',        authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-12-01', issued: '2025-12-20', expires: '2026-12-20', fee: 4400 },
  { id:  6, project: 4, number: 'EP-2026-0041', type: 'Electrical',  desc: '400A commercial service, panel upgrade, ADA conduit',   authority: 'City of Murfreesboro',    status: 'active',   applied: '2026-01-05', issued: '2026-01-18', expires: '2027-01-18', fee: 2200 },
  { id:  7, project: 4, number: 'MP-2026-0039', type: 'Mechanical',  desc: 'HVAC system replacement — commercial office TI',        authority: 'City of Murfreesboro',    status: 'pending',  applied: '2026-01-20', issued: null,         expires: null,         fee: 1600 },
  { id:  8, project: 5, number: 'BP-2025-0601', type: 'Building',    desc: '24-unit multifamily — Phase 1 foundation and framing',  authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-07-01', issued: '2025-07-28', expires: '2026-07-28', fee: 18400 },
  { id:  9, project: 5, number: 'FP-2025-0122', type: 'Fire',        desc: 'Fire suppression system — multifamily sprinklers',      authority: 'Rutherford Co. Fire Marshal', status: 'active', applied: '2025-07-15', issued: '2025-08-05', expires: '2026-08-05', fee: 3200 },
  { id: 10, project: 6, number: 'BP-2025-0588', type: 'Building',    desc: '16-unit multifamily — new construction residential',    authority: 'City of Smyrna',          status: 'active',   applied: '2025-06-15', issued: '2025-07-10', expires: '2026-07-10', fee: 14800 },
  { id: 11, project: 7, number: 'BP-2026-0071', type: 'Building',    desc: '24-unit multifamily — Phase 2 site permit',             authority: 'Rutherford Co. Bldg Dept', status: 'pending',  applied: '2026-02-01', issued: null,         expires: null,         fee: 19200 },
  { id: 12, project: 8, number: 'RP-2025-0447', type: 'Remodel',     desc: 'Kitchen and bath remodel — residential addition',       authority: 'City of Murfreesboro',    status: 'active',   applied: '2025-11-10', issued: '2025-12-02', expires: '2026-12-02', fee: 1800 },
];

const INSPECTIONS = [
  { id: 1, project: 1, type: 'Framing',           permit: 'BP-2025-0441', date: '2026-02-26', inspector: 'Rutherford Co. Inspections', status: 'pending' },
  { id: 2, project: 1, type: 'Electrical Rough-In', permit: 'EP-2025-0882', date: '2026-02-28', inspector: 'Rutherford Co. Inspections', status: 'pending' },
  { id: 3, project: 2, type: 'Plumbing Final',    permit: 'BP-2025-0512', date: '2026-02-25', inspector: 'City of Franklin Inspections', status: 'passed' },
  { id: 4, project: 4, type: 'Electrical Service', permit: 'EP-2026-0041', date: '2026-02-24', inspector: 'City of Murfreesboro',        status: 'passed' },
  { id: 5, project: 4, type: 'Mechanical Rough',  permit: 'MP-2026-0039', date: '2026-03-05', inspector: 'City of Murfreesboro',        status: 'pending' },
  { id: 6, project: 5, type: 'Foundation',        permit: 'BP-2025-0601', date: '2026-02-27', inspector: 'Rutherford Co. Inspections',  status: 'passed' },
  { id: 7, project: 5, type: 'Fire Suppression',  permit: 'FP-2025-0122', date: '2026-03-08', inspector: 'Rutherford Co. Fire Marshal', status: 'pending' },
  { id: 8, project: 6, type: 'Framing',           permit: 'BP-2025-0588', date: '2026-02-20', inspector: 'City of Smyrna',              status: 'failed' },
  { id: 9, project: 8, type: 'Rough-In',          permit: 'RP-2025-0447', date: '2026-03-10', inspector: 'City of Murfreesboro',        status: 'pending' },
];

const STATUS_COLOR = {
  active:  { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'Active' },
  pending: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Pending' },
  expired: { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Expired' },
  closed:  { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)', label: 'Closed' },
};

const INSP_COLOR = {
  pending: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)',  label: 'Pending' },
  passed:  { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'Passed' },
  failed:  { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Failed' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

export default function Permits() {
  const [tab, setTab] = useState('permits');
  const [projectFilter, setProjectFilter] = useState('All');

  const projectNames = ['All', ...PROJECTS.map(p => p.name)];
  const projectIdMap = Object.fromEntries(PROJECTS.map(p => [p.name, p.id]));

  const filteredPermits = projectFilter === 'All' ? PERMITS
    : PERMITS.filter(p => p.project === projectIdMap[projectFilter]);
  const filteredInspections = projectFilter === 'All' ? INSPECTIONS
    : INSPECTIONS.filter(i => i.project === projectIdMap[projectFilter]);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  const pendingInspections = INSPECTIONS.filter(i => i.status === 'pending').length;
  const failedInspections  = INSPECTIONS.filter(i => i.status === 'failed').length;
  const pendingPermits     = PERMITS.filter(p => p.status === 'pending').length;
  const activePermits      = PERMITS.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Permits &amp; Inspections</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{PERMITS.length} permits tracked &middot; {INSPECTIONS.length} inspections</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Active Permits', activePermits, 'var(--status-profit)'],
          ['Pending Applications', pendingPermits, 'var(--status-warning)'],
          ['Upcoming Inspections', pendingInspections, '#3b82f6'],
          ['Failed Inspections', failedInspections, failedInspections > 0 ? 'var(--status-loss)' : 'var(--status-profit)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {failedInspections > 0 && (
        <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: 'var(--status-loss)', flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--status-loss)' }}>{failedInspections} failed inspection{failedInspections > 1 ? 's' : ''}</strong> — re-inspection required before work can continue.
            {INSPECTIONS.filter(i => i.status === 'failed').map(i => (
              <span key={i.id} style={{ display: 'block', marginTop: 2 }}>{PROJECTS.find(p => p.id === i.project)?.name} &mdash; {i.type}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-brand-border)' }}>
          {['permits', 'inspections'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
              textTransform: 'capitalize', color: tab === t ? '#3b82f6' : 'var(--text-secondary)',
              borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}`,
            }}>{t}</button>
          ))}
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{
          padding: '7px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: '1px solid var(--color-brand-border)',
          background: 'var(--color-brand-card)', color: 'var(--text-primary)', outline: 'none',
        }}>
          {projectNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {tab === 'permits' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Project','Permit #','Type','Description','Authority','Applied','Issued','Expires','Status'].map((h, i) => (
                <th key={h} style={{ ...thBase, textAlign: 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredPermits.map(p => {
                const proj = PROJECTS.find(pr => pr.id === p.project);
                const sc = STATUS_COLOR[p.status] || STATUS_COLOR.active;
                const days = daysUntil(p.expires);
                const expiryWarn = days !== null && days >= 0 && days <= 60;
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{proj?.name?.split(' ').slice(0, 2).join(' ') || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.number}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.type}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', maxWidth: 220 }}>{p.desc}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{p.authority}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{p.applied}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{p.issued || '—'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: expiryWarn ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>
                      {p.expires || '—'}
                      {expiryWarn && <span style={{ display: 'block', fontSize: 10 }}>{days}d left</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'inspections' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Project','Inspection Type','Permit #','Scheduled','Days Away','Inspector','Result'].map(h => (
                <th key={h} style={thBase}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredInspections.map(i => {
                const proj = PROJECTS.find(p => p.id === i.project);
                const ic = INSP_COLOR[i.status] || INSP_COLOR.pending;
                const days = daysUntil(i.date);
                return (
                  <tr key={i.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{proj?.name?.split(' ').slice(0, 2).join(' ')}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{i.type}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{i.permit}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{i.date}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: days !== null && days <= 2 ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                      {days === null ? '—' : days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-tertiary)' }}>{i.inspector}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: ic.bg, color: ic.color }}>{ic.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
