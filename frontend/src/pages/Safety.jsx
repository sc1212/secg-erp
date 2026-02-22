import { useState } from 'react';
import { AlertTriangle, CheckCircle, Shield, Users, Award, FileText } from 'lucide-react';
import { PROJECTS } from '../lib/demoData';

const INCIDENTS = [
  { id: 1, project: 1, date: '2026-01-06', type: 'Near Miss',        severity: 'low',    reporter: 'Connor Webb',   desc: 'Unsecured ladder slid on wet concrete near south foundation wall. No injuries.', root: 'Ladder feet not cleaned; no spotter assigned.', action: 'Mandatory ladder inspection before each use. Spotter required on wet surfaces.', status: 'closed', osha: false },
  { id: 2, project: 2, date: '2026-01-22', type: 'First Aid',        severity: 'medium', reporter: 'Joseph Hall',   desc: 'Worker received minor laceration on left hand from circular saw kickback.', root: 'Dull blade not replaced per schedule; improper material support.', action: 'Blade replacement log enforced. Material support jig required for rip cuts over 4 ft.', status: 'closed', osha: false },
  { id: 3, project: 1, date: '2026-02-03', type: 'Recordable',       severity: 'high',   reporter: 'Connor Webb',   desc: 'Electrician stepped on exposed nail penetrating boot sole. Tetanus shot administered.', root: 'Debris not cleared from work area; boots lacked puncture-resistant soles.', action: 'Puncture-resistant insoles mandatory. End-of-day debris sweep added to daily log.', status: 'corrective_action', osha: true },
  { id: 4, project: 3, date: '2026-02-10', type: 'Property Damage',  severity: 'medium', reporter: 'Joseph Hall',   desc: 'Skid steer bucket struck underground water line during grading. Line repaired same day.', root: 'Utility locate markings faded after rain; operator did not request re-mark.', action: 'Re-locate required after any precipitation over 0.5 inches. Pre-dig checklist updated.', status: 'investigating', osha: false },
  { id: 5, project: 2, date: '2026-02-18', type: 'Near Miss',        severity: 'low',    reporter: 'Joseph Hall',   desc: 'Unsecured sheet of plywood blown off 2nd-floor deck by wind gust. Landed in exclusion zone.', root: 'Materials not weighted or tied down during high-wind advisory.', action: 'Wind speed protocol: all loose materials secured when gusts exceed 25 mph.', status: 'open', osha: false },
];

const TOOLBOX_TALKS = [
  { id: 1, project: 1, date: '2026-02-03', topic: 'Fall Protection & Harness Inspection',  conductor: 'Cole Notgrass',  attendees: 12, mins: 25, notes: 'Reviewed proper harness fit, lanyard inspection, and anchor requirements for upcoming roof work.' },
  { id: 2, project: 2, date: '2026-02-05', topic: 'Trenching & Excavation Safety',          conductor: 'Joseph Hall',    attendees: 8,  mins: 20, notes: 'Covered soil classification, sloping requirements, and cave-in hazard protocols.' },
  { id: 3, project: 1, date: '2026-02-10', topic: 'Electrical Safety — Lock Out / Tag Out', conductor: 'Connor Webb',    attendees: 10, mins: 30, notes: 'Demonstrated LOTO procedures for panel work. Each crew member practiced applying locks and tags.' },
  { id: 4, project: 3, date: '2026-02-12', topic: 'Heat Illness Prevention',                conductor: 'Zach Monroe',    attendees: 15, mins: 15, notes: 'Hydration, shade breaks, and recognizing heat exhaustion symptoms before summer season.' },
  { id: 5, project: 2, date: '2026-02-17', topic: 'Scaffold Erection & Inspection',         conductor: 'Joseph Hall',    attendees: 9,  mins: 35, notes: 'Competent person checklist, base plate leveling, and daily inspection tag procedures.' },
  { id: 6, project: 1, date: '2026-02-19', topic: 'PPE Compliance & Housekeeping',          conductor: 'Connor Webb',    attendees: 14, mins: 20, notes: 'Hard hat, safety glasses, and high-vis vest requirements. Clean work area expectations reviewed.' },
];

const CERTS = [
  { id: 1, name: 'Cole Notgrass',  cert: 'OSHA 30-Hour Construction',        num: 'OSHA-30-88421',  issued: '2024-03-15', expires: '2029-03-15', status: 'active' },
  { id: 2, name: 'Connor Webb',    cert: 'OSHA 10-Hour Construction',        num: 'OSHA-10-77205',  issued: '2023-06-01', expires: '2028-06-01', status: 'active' },
  { id: 3, name: 'Zach Monroe',    cert: 'OSHA 10-Hour Construction',        num: 'OSHA-10-66382',  issued: '2022-11-15', expires: '2027-11-15', status: 'active' },
  { id: 4, name: 'Joseph Hall',    cert: 'First Aid / CPR / AED',            num: 'ARC-FA-20458',   issued: '2024-04-10', expires: '2026-04-10', status: 'pending_renewal' },
  { id: 5, name: 'Abi Darnell',    cert: 'First Aid / CPR / AED',            num: 'ARC-FA-31022',   issued: '2024-05-01', expires: '2026-05-01', status: 'active' },
  { id: 6, name: 'Zach Monroe',    cert: 'Confined Space Entry',              num: 'CSE-TN-30891',   issued: '2023-01-12', expires: '2026-01-12', status: 'expired' },
  { id: 7, name: 'Alex Torres',    cert: 'Competent Person — Excavation',    num: 'CPE-TN-12044',   issued: '2022-11-05', expires: '2026-03-05', status: 'pending_renewal' },
  { id: 8, name: 'Connor Webb',    cert: 'Forklift Operator',                 num: 'FORK-TN-66230',  issued: '2023-08-18', expires: '2026-08-18', status: 'active' },
];

const INCIDENT_STATUS = {
  open:              { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Open' },
  investigating:     { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Investigating' },
  corrective_action: { color: '#3b82f6',               bg: 'rgba(59,130,246,0.12)', label: 'Corrective Action' },
  closed:            { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',  label: 'Closed' },
};

const SEVERITY_COLOR = {
  low:    { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)' },
  medium: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' },
  high:   { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)' },
};

const CERT_STATUS = {
  active:          { color: 'var(--status-profit)',  bg: 'rgba(34,197,94,0.12)',   label: 'Active' },
  pending_renewal: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Pending Renewal' },
  expired:         { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Expired' },
};

function daysUntil(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

export default function Safety() {
  const [tab, setTab] = useState('incidents');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  const openIncidents = INCIDENTS.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const daysSinceIncident = Math.ceil((new Date() - new Date('2026-02-18')) / 86400000);

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Safety &amp; Compliance</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Incident tracking, toolbox talks, and certifications</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          ['Days Since Incident', daysSinceIncident, daysSinceIncident < 7 ? 'var(--status-loss)' : 'var(--status-profit)'],
          ['Open Incidents', openIncidents, openIncidents > 0 ? 'var(--status-loss)' : 'var(--status-profit)'],
          ['YTD Incidents', INCIDENTS.length, 'var(--text-primary)'],
          ['Talks This Month', TOOLBOX_TALKS.length, '#3b82f6'],
          ['Expiring Certs', CERTS.filter(c => c.status !== 'active').length, 'var(--status-warning)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      {openIncidents > 0 && (
        <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: 'var(--status-loss)', flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--status-loss)' }}>{openIncidents} open incident{openIncidents > 1 ? 's' : ''}</strong> require attention and corrective action documentation.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['incidents','Incidents'],['toolbox','Toolbox Talks'],['certs','Certifications']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
            color: tab === key ? '#3b82f6' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === key ? '#3b82f6' : 'transparent'}`,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'incidents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {INCIDENTS.map(inc => {
            const sc = INCIDENT_STATUS[inc.status] || INCIDENT_STATUS.open;
            const sev = SEVERITY_COLOR[inc.severity] || SEVERITY_COLOR.low;
            const proj = PROJECTS.find(p => p.id === inc.project);
            const isExpanded = expandedId === inc.id;
            return (
              <div key={inc.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
                <div onClick={() => setExpandedId(isExpanded ? null : inc.id)} style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: sev.bg, color: sev.color, textTransform: 'capitalize' }}>{inc.severity}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{inc.type} &mdash; {proj?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{inc.desc}</div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{inc.date}</div>
                  {inc.osha && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(251,113,133,0.15)', color: 'var(--status-loss)' }}>OSHA</span>}
                </div>
                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--color-brand-border)', paddingTop: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Root Cause</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inc.root}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Corrective Action</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inc.action}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>Reported by: {inc.reporter}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'toolbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {TOOLBOX_TALKS.map(t => {
            const proj = PROJECTS.find(p => p.id === t.project);
            return (
              <div key={t.id} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t.topic}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    ['Date', t.date],
                    ['Project', proj?.name],
                    ['Conductor', t.conductor],
                    ['Attendees', `${t.attendees} people`],
                    ['Duration', `${t.mins} min`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{val}</span>
                    </div>
                  ))}
                </div>
                {t.notes && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--color-brand-border)', paddingTop: 8 }}>{t.notes}</div>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'certs' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Employee','Certification','Cert #','Issued','Expires','Status'].map(h => (
                <th key={h} style={thBase}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {CERTS.map(c => {
                const sc = CERT_STATUS[c.status] || CERT_STATUS.active;
                const days = daysUntil(c.expires);
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.cert}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{c.num}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{c.issued}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: days <= 90 ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>
                      {c.expires}{days <= 90 ? ` (${days}d)` : ''}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span>
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
