import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROJECTS } from '../lib/demoData';

const PERMITS = [
  { id:  1, projectId: 1, number: 'BP-2025-0441', type: 'Building',    desc: 'New residential construction — 3,240 sf single-family', authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-08-10', issued: '2025-09-02', expires: '2026-09-02', fee: 5200,  inspector: 'D. Holt' },
  { id:  2, projectId: 1, number: 'EP-2025-0882', type: 'Electrical',  desc: '200A service upgrade, rough-in wiring, all circuits',    authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-09-01', issued: '2025-09-20', expires: '2026-09-20', fee: 1400,  inspector: 'M. Webb' },
  { id:  3, projectId: 1, number: 'PP-2025-0374', type: 'Plumbing',    desc: 'Full plumbing rough-in, fixture installation, DWV',      authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-09-01', issued: '2025-09-20', expires: '2026-09-20', fee: 980,   inspector: 'T. Crane' },
  { id:  4, projectId: 2, number: 'BP-2025-0512', type: 'Building',    desc: 'Spec home — 2,580 sf single-family residential',         authority: 'City of La Vergne',        status: 'active',   applied: '2025-10-15', issued: '2025-11-01', expires: '2026-11-01', fee: 4800,  inspector: 'R. Green' },
  { id:  5, projectId: 3, number: 'BP-2026-0023', type: 'Building',    desc: 'Custom home — 3,800 sf residential, pre-construction',   authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-12-01', issued: '2025-12-20', expires: '2026-12-20', fee: 6400,  inspector: 'D. Holt' },
  { id:  6, projectId: 5, number: 'EP-2026-0041', type: 'Electrical',  desc: '400A commercial service, panel upgrade, ADA conduit',    authority: 'City of Murfreesboro',    status: 'active',   applied: '2026-01-05', issued: '2026-01-18', expires: '2027-01-18', fee: 2200,  inspector: 'L. Parish' },
  { id:  7, projectId: 5, number: 'MP-2026-0039', type: 'Mechanical',  desc: 'HVAC replacement — commercial TI, 5-ton split system',   authority: 'City of Murfreesboro',    status: 'pending',  applied: '2026-01-20', issued: null,         expires: null,         fee: 1600,  inspector: 'TBD' },
  { id:  8, projectId: 6, number: 'BP-2025-0601', type: 'Building',    desc: '24-unit multifamily — Phase 1 foundation and framing',   authority: 'Rutherford Co. Bldg Dept', status: 'active',   applied: '2025-07-01', issued: '2025-07-28', expires: '2026-07-28', fee: 18400, inspector: 'D. Holt' },
  { id:  9, projectId: 6, number: 'FP-2025-0122', type: 'Fire',        desc: 'Fire suppression system — multifamily NFPA 13 sprinklers',authority: 'Rutherford Co. Fire Marshal', status: 'active', applied: '2025-07-15', issued: '2025-08-05', expires: '2026-08-05', fee: 3200,  inspector: 'Fire Marshal' },
  { id: 10, projectId: 4, number: 'BP-2025-0588', type: 'Building',    desc: 'Spec home — 2,200 sf residential, finishes phase',        authority: 'City of Smyrna',          status: 'active',   applied: '2025-06-15', issued: '2025-07-10', expires: '2026-07-10', fee: 14800, inspector: 'S. Ford' },
  { id: 11, projectId: 6, number: 'BP-2026-0071', type: 'Building',    desc: '24-unit multifamily — Phase 2 site permit, unit 13-24',  authority: 'Rutherford Co. Bldg Dept', status: 'pending',  applied: '2026-02-01', issued: null,         expires: null,         fee: 19200, inspector: 'TBD' },
  { id: 12, projectId: 8, number: 'RP-2025-0447', type: 'Remodel',     desc: 'Mechanical services — boiler room piping upgrade',        authority: 'City of Nashville',       status: 'active',   applied: '2025-11-10', issued: '2025-12-02', expires: '2026-12-02', fee: 1800,  inspector: 'J. Tran' },
];

const INSPECTIONS = [
  { id: 1, projectId: 1, type: 'Framing',             permitNum: 'BP-2025-0441', date: '2026-02-26', inspector: 'D. Holt',            status: 'pending', notes: '' },
  { id: 2, projectId: 1, type: 'Electrical Rough-In', permitNum: 'EP-2025-0882', date: '2026-02-28', inspector: 'M. Webb',            status: 'pending', notes: '' },
  { id: 3, projectId: 2, type: 'Plumbing Underground', permitNum: 'BP-2025-0512', date: '2026-02-21', inspector: 'T. Crane',          status: 'passed',  notes: 'All DWV passed. Underground ready for backfill.' },
  { id: 4, projectId: 5, type: 'Electrical Service',  permitNum: 'EP-2026-0041', date: '2026-02-24', inspector: 'L. Parish',         status: 'passed',  notes: 'Service panel and 400A service approved.' },
  { id: 5, projectId: 5, type: 'Mechanical Rough',    permitNum: 'MP-2026-0039', date: '2026-03-05', inspector: 'City of Murfreesboro',status: 'pending', notes: '' },
  { id: 6, projectId: 2, type: 'Foundation',          permitNum: 'BP-2025-0512', date: '2026-02-20', inspector: 'R. Green',           status: 'passed',  notes: 'Rebar inspection passed. Footings approved.' },
  { id: 7, projectId: 6, type: 'Fire Suppression',    permitNum: 'FP-2025-0122', date: '2026-03-08', inspector: 'Fire Marshal',        status: 'pending', notes: '' },
  { id: 8, projectId: 6, type: 'Framing',             permitNum: 'BP-2025-0601', date: '2026-02-20', inspector: 'S. Ford',            status: 'failed',  failReason: 'Level 1 wall bracing inadequate — per IRC R602.10. Required: let-in bracing or structural sheathing panels at all corners.', reinspDate: '2026-02-27', notes: '' },
  { id: 9, projectId: 8, type: 'Rough-In Plumbing',  permitNum: 'RP-2025-0447', date: '2026-03-10', inspector: 'J. Tran',            status: 'pending', notes: '' },
];

const PERMIT_STATUS_COLOR = {
  active:  { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'Active' },
  pending: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Pending' },
  expired: { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Expired' },
  closed:  { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)', label: 'Closed' },
};

const INSP_COLOR = {
  pending: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)',  label: 'Pending',     icon: Clock },
  passed:  { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'Passed',      icon: CheckCircle },
  failed:  { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Failed',      icon: XCircle },
};

// Compliance checklist per project phase
const COMPLIANCE_ITEMS = {
  'Foundation': ['Building Permit Issued', 'Footing Inspection', 'Foundation Inspection', 'Waterproofing Inspection'],
  'Framing':    ['Building Permit Issued', 'Framing Inspection', 'Sheathing Inspection', 'Energy Code Inspection'],
  'MEP Rough-in':['Building Permit Issued', 'Rough Electrical', 'Rough Plumbing', 'Rough HVAC', 'Insulation Inspection'],
  'Finishes':   ['Building Permit Issued', 'Drywall Inspection', 'Electrical Final', 'Plumbing Final', 'HVAC Final'],
  'Punch List': ['Electrical Final', 'Plumbing Final', 'Mechanical Final', 'Fire Safety', 'Certificate of Occupancy'],
  'Closeout':   ['All Inspections Passed', 'Certificate of Occupancy', 'Lien Waivers', 'Warranty Filed'],
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date('2026-02-22')) / 86400000);
}

// Fail Detail Modal
function FailModal({ inspection, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--status-loss)' }}>Failed Inspection</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Project', PROJECTS.find(p => p.id === inspection.projectId)?.name], ['Type', inspection.type], ['Permit #', inspection.permitNum], ['Inspector', inspection.inspector], ['Date', inspection.date], ['Re-Inspect', inspection.reinspDate || 'TBD']].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--status-loss)', marginBottom: 6 }}>Failure Reason / Correction Required</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{inspection.failReason}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Close</button>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Schedule Re-Inspection</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Permits() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('permits');
  const [projectFilter, setProjectFilter] = useState('All');
  const [failModal, setFailModal] = useState(null);
  const [search, setSearch]     = useState('');

  const projectNames = ['All', ...PROJECTS.map(p => p.name)];
  const projectIdMap = Object.fromEntries(PROJECTS.map(p => [p.name, p.id]));

  const filteredPermits = (projectFilter === 'All' ? PERMITS : PERMITS.filter(p => p.projectId === projectIdMap[projectFilter]))
    .filter(p => !search || p.number.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()));

  const filteredInspections = (projectFilter === 'All' ? INSPECTIONS : INSPECTIONS.filter(i => i.projectId === projectIdMap[projectFilter]))
    .filter(i => !search || i.type.toLowerCase().includes(search.toLowerCase()));

  const pendingInspections = INSPECTIONS.filter(i => i.status === 'pending').length;
  const failedInspections  = INSPECTIONS.filter(i => i.status === 'failed').length;
  const pendingPermits     = PERMITS.filter(p => p.status === 'pending').length;
  const activePermits      = PERMITS.filter(p => p.status === 'active').length;
  const totalFees          = PERMITS.reduce((s, p) => s + p.fee, 0);

  const thBase = { padding: '9px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-5">
      {failModal && <FailModal inspection={failModal} onClose={() => setFailModal(null)} />}

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Permits & Inspections</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{PERMITS.length} permits · {INSPECTIONS.length} inspections · ${totalFees.toLocaleString()} in permit fees</p>
      </div>

      {/* Stats */}
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

      {/* Failed inspection alert */}
      {failedInspections > 0 && (
        <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 8, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <XCircle size={15} style={{ color: 'var(--status-loss)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-loss)' }}>{failedInspections} failed inspection — re-inspection required before work can continue</span>
          </div>
          {INSPECTIONS.filter(i => i.status === 'failed').map(i => (
            <div key={i.id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 24, marginBottom: 3 }}>
              {PROJECTS.find(p => p.id === i.projectId)?.name} — {i.type} ({i.date})
              <button onClick={() => setFailModal(i)} style={{ marginLeft: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(251,113,133,0.4)', background: 'transparent', color: 'var(--status-loss)', fontSize: 11, cursor: 'pointer' }}>View Details</button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-brand-border)', flex: '0 0 auto' }}>
          {['permits', 'inspections', 'compliance'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', textTransform: 'capitalize', color: tab === t ? '#3b82f6' : 'var(--text-secondary)', borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}` }}>
              {t === 'compliance' ? 'Compliance Dashboard' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ padding: '7px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', outline: 'none' }}>
          {projectNames.map(n => <option key={n}>{n}</option>)}
        </select>
        <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 240 }}>
          <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ width: '100%', paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* ── PERMITS TAB ── */}
      {tab === 'permits' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Project', 'Permit #', 'Type', 'Description', 'Authority', 'Applied', 'Issued', 'Expires', 'Fee', 'Status'].map(h => (
                <th key={h} style={{ ...thBase }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredPermits.map((p, i) => {
                const proj = PROJECTS.find(pr => pr.id === p.projectId);
                const sc = PERMIT_STATUS_COLOR[p.status] || PERMIT_STATUS_COLOR.active;
                const days = daysUntil(p.expires);
                const expiryWarn = days !== null && days >= 0 && days <= 60;
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => navigate(`/projects/${p.projectId}`)}>{proj?.name?.split(' ').slice(0, 2).join(' ') || '—'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.number}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.type}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 220 }}>{p.desc}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{p.authority}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{p.applied}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: p.issued ? 'var(--text-tertiary)' : 'var(--status-warning)', fontFamily: 'monospace' }}>{p.issued || 'Pending'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: expiryWarn ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>
                      {p.expires || '—'}
                      {expiryWarn && <span style={{ display: 'block', fontSize: 10, color: 'var(--status-warning)' }}>{days}d left</span>}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>${p.fee.toLocaleString()}</td>
                    <td style={{ padding: '9px 14px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                  </tr>
                );
              })}
              {filteredPermits.length === 0 && <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No permits match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── INSPECTIONS TAB ── */}
      {tab === 'inspections' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Project', 'Inspection Type', 'Permit #', 'Scheduled', 'Days Away', 'Inspector', 'Result', ''].map(h => (
                <th key={h} style={thBase}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filteredInspections.map((insp, i) => {
                const proj = PROJECTS.find(p => p.id === insp.projectId);
                const ic = INSP_COLOR[insp.status] || INSP_COLOR.pending;
                const days = daysUntil(insp.date);
                const Icon = ic.icon;
                return (
                  <tr key={insp.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: insp.status === 'failed' ? 'rgba(251,113,133,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate(`/projects/${insp.projectId}`)}>{proj?.name?.split(' ').slice(0, 2).join(' ')}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-primary)', fontWeight: insp.status === 'failed' ? 600 : 400 }}>{insp.type}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{insp.permitNum}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{insp.date}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: days !== null && days <= 2 ? 'var(--status-warning)' : 'var(--text-secondary)' }}>
                      {days === null ? '—' : days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-tertiary)' }}>{insp.inspector}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: ic.bg, color: ic.color }}>
                        <Icon size={11} />{ic.label}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      {insp.status === 'failed' && (
                        <button onClick={() => setFailModal(insp)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid rgba(251,113,133,0.4)', background: 'transparent', color: 'var(--status-loss)', fontSize: 11, cursor: 'pointer' }}>View Failure</button>
                      )}
                      {insp.status === 'passed' && insp.notes && (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insp.notes}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredInspections.length === 0 && <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No inspections match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── COMPLIANCE TAB ── */}
      {tab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Per-project compliance checklist based on current phase. Green = confirmed passed or not yet required.</div>
          {PROJECTS.filter(p => p.status !== 'complete').map(proj => {
            const checkItems = COMPLIANCE_ITEMS[proj.phase] || COMPLIANCE_ITEMS['Framing'];
            const projInspections = INSPECTIONS.filter(i => i.projectId === proj.id);
            return (
              <div key={proj.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--color-brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span onClick={() => navigate(`/projects/${proj.id}`)} style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }}>{proj.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 10 }}>Phase: {proj.phase}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                    {projInspections.filter(i => i.status === 'failed').length > 0 && (
                      <span style={{ color: 'var(--status-loss)', fontWeight: 600 }}>
                        <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {projInspections.filter(i => i.status === 'failed').length} failed
                      </span>
                    )}
                    <span style={{ color: 'var(--text-tertiary)' }}>{projInspections.filter(i => i.status === 'passed').length} passed</span>
                    <span style={{ color: 'var(--status-warning)' }}>{projInspections.filter(i => i.status === 'pending').length} upcoming</span>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {checkItems.map((item, ii) => {
                    const related = projInspections.find(i => i.type.toLowerCase().includes(item.toLowerCase().split(' ')[0]) || item.toLowerCase().includes(i.type.toLowerCase().split(' ')[0]));
                    const isFailed = related?.status === 'failed';
                    const isPassed = related?.status === 'passed';
                    const isPending = related?.status === 'pending';
                    const color = isFailed ? 'var(--status-loss)' : isPassed ? 'var(--status-profit)' : isPending ? 'var(--status-warning)' : 'var(--text-tertiary)';
                    const bg = isFailed ? 'rgba(251,113,133,0.1)' : isPassed ? 'rgba(52,211,153,0.1)' : isPending ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)';
                    return (
                      <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, background: bg, border: `1px solid ${color}25` }}>
                        {isFailed ? <XCircle size={11} style={{ color }} /> : isPassed ? <CheckCircle size={11} style={{ color }} /> : <Clock size={11} style={{ color }} />}
                        <span style={{ fontSize: 11, color, fontWeight: isPassed ? 600 : 400 }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
