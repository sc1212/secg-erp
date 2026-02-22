import { useState } from 'react';
import { PROJECTS } from '../lib/demoData';
import { CheckCircle, Clock, FileText, MessageSquare, Upload } from 'lucide-react';

const CLIENTS = [
  {
    id: 1, project: 1, name: 'Marcus & Diane Webb', email: 'mwebb@gmail.com', phone: '(615) 448-2291',
    portalStatus: 'active', lastLogin: '2026-02-21', selections: 14, pendingApprovals: 2,
    unreadMessages: 1, docs: 8,
  },
  {
    id: 2, project: 4, name: 'Gerald & Patty Johnson', email: 'gjohnson@bellsouth.net', phone: '(615) 882-4401',
    portalStatus: 'active', lastLogin: '2026-02-19', selections: 6, pendingApprovals: 0,
    unreadMessages: 0, docs: 5,
  },
  {
    id: 3, project: 8, name: 'Taylor & Brooke Anderson', email: 'tanderson@outlook.com', phone: '(615) 331-7720',
    portalStatus: 'invited', lastLogin: null, selections: 0, pendingApprovals: 0,
    unreadMessages: 0, docs: 2,
  },
  {
    id: 4, project: 7, name: 'Ray & Connie Patel', email: 'rpatel@yahoo.com', phone: '(615) 204-8839',
    portalStatus: 'active', lastLogin: '2026-02-20', selections: 9, pendingApprovals: 3,
    unreadMessages: 2, docs: 11,
  },
];

const ACTIVITY = [
  { id: 1, client: 1, type: 'approval',  text: 'Approved Kitchen Countertop Selection — Quartz "Calacatta Gold"',           time: '2026-02-21 14:32', icon: CheckCircle, color: 'var(--status-profit)' },
  { id: 2, client: 4, type: 'message',   text: 'Ray Patel sent a message: "Any update on the exterior color choices?"',     time: '2026-02-21 11:08', icon: MessageSquare, color: '#3b82f6' },
  { id: 3, client: 4, type: 'upload',    text: 'Document uploaded: Change Order #3 — Patio Extension',                      time: '2026-02-20 16:45', icon: Upload, color: '#a855f7' },
  { id: 4, client: 1, type: 'message',   text: 'Diane Webb sent a message: "Excited about the framing progress!"',           time: '2026-02-20 09:14', icon: MessageSquare, color: '#3b82f6' },
  { id: 5, client: 2, type: 'approval',  text: 'Approved Flooring Selection — LVP "Farmhouse Oak"',                         time: '2026-02-19 15:55', icon: CheckCircle, color: 'var(--status-profit)' },
  { id: 6, client: 4, type: 'pending',   text: 'Pending approval: Fixture Upgrade Package — Master Bath (est. $2,800)',      time: '2026-02-19 10:30', icon: Clock, color: 'var(--status-warning)' },
  { id: 7, client: 1, type: 'upload',    text: 'Document uploaded: Progress Photos — Week 8',                               time: '2026-02-18 17:20', icon: Upload, color: '#a855f7' },
  { id: 8, client: 4, type: 'pending',   text: 'Pending approval: Change Order #3 — Patio Extension ($12,400)',              time: '2026-02-18 08:55', icon: Clock, color: 'var(--status-warning)' },
  { id: 9, client: 3, type: 'invite',    text: 'Portal invitation sent to Taylor & Brooke Anderson',                        time: '2026-02-17 13:00', icon: FileText, color: 'var(--text-tertiary)' },
];

const PENDING_APPROVALS = [
  { id: 1, client: 1, item: 'Master Bath Tile Upgrade',   amount: 1850,  submitted: '2026-02-19', deadline: '2026-02-26' },
  { id: 2, client: 1, item: 'Cabinet Hardware Upgrade',   amount: 640,   submitted: '2026-02-20', deadline: '2026-02-27' },
  { id: 3, client: 4, item: 'Fixture Upgrade Package',    amount: 2800,  submitted: '2026-02-19', deadline: '2026-02-26' },
  { id: 4, client: 4, item: 'Change Order #3 — Patio',   amount: 12400, submitted: '2026-02-18', deadline: '2026-02-25' },
  { id: 5, client: 4, item: 'Upgraded Insulation R-49',  amount: 1100,  submitted: '2026-02-21', deadline: '2026-02-28' },
];

const STATUS_CONFIG = {
  active:  { label: 'Active',   color: 'var(--status-profit)', bg: 'rgba(34,197,94,0.10)' },
  invited: { label: 'Invited',  color: '#3b82f6',              bg: 'rgba(59,130,246,0.10)' },
  inactive:{ label: 'Inactive', color: 'var(--text-tertiary)', bg: 'rgba(255,255,255,0.06)' },
};

function days(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date('2026-02-22')) / 86400000);
}

export default function ClientPortal() {
  const [tab, setTab] = useState('clients');
  const [expandedId, setExpandedId] = useState(null);
  const [notified, setNotified] = useState({});

  const totalPending = PENDING_APPROVALS.length;
  const totalUnread = CLIENTS.reduce((s, c) => s + c.unreadMessages, 0);
  const active = CLIENTS.filter(c => c.portalStatus === 'active').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Client Portal</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{CLIENTS.length} clients &middot; {active} active &middot; {totalPending} pending approvals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Portal Clients', CLIENTS.length, 'var(--text-primary)'],
          ['Active Logins', active, 'var(--status-profit)'],
          ['Pending Approvals', totalPending, totalPending > 0 ? 'var(--status-warning)' : 'var(--text-primary)'],
          ['Unread Messages', totalUnread, totalUnread > 0 ? '#3b82f6' : 'var(--text-primary)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {[['clients', 'Clients'], ['approvals', 'Pending Approvals'], ['activity', 'Activity Feed']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${tab === key ? '#3b82f6' : 'var(--color-brand-border)'}`,
            background: tab === key ? 'rgba(59,130,246,0.14)' : 'transparent',
            color: tab === key ? '#3b82f6' : 'var(--text-secondary)',
          }}>
            {label}
            {key === 'approvals' && totalPending > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: 'var(--status-warning)', color: '#000' }}>{totalPending}</span>
            )}
            {key === 'activity' && totalUnread > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#3b82f6', color: '#fff' }}>{totalUnread}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'clients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CLIENTS.map(c => {
            const proj = PROJECTS.find(p => p.id === c.project);
            const sc = STATUS_CONFIG[c.portalStatus];
            const isExpanded = expandedId === c.id;
            const initials = c.name.split(' ').filter((_, i) => i === 0 || i === c.name.split(' ').length - 1).map(n => n[0]).join('');
            return (
              <div key={c.id} style={{ background: 'var(--color-brand-card)', border: `1px solid ${isExpanded ? '#3b82f6' : 'var(--color-brand-border)'}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#3b82f6', flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      {c.unreadMessages > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#3b82f6', color: '#fff' }}>{c.unreadMessages} new</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{proj?.name} &middot; {c.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
                    {[['Selections', c.selections], ['Pending', c.pendingApprovals], ['Docs', c.docs]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: val > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--color-brand-border)', paddingTop: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                      {[
                        ['Email', c.email],
                        ['Phone', c.phone],
                        ['Last Login', c.lastLogin || 'Never'],
                      ].map(([label, val]) => (
                        <div key={label} style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: label === 'Last Login' ? 'monospace' : undefined }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={e => { e.stopPropagation(); setNotified(n => ({ ...n, [c.id]: true })); }}
                        style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
                      >
                        {notified[c.id] ? 'Message Sent' : 'Send Message'}
                      </button>
                      <button
                        onClick={e => e.stopPropagation()}
                        style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                      >
                        Upload Document
                      </button>
                      {c.portalStatus === 'invited' && (
                        <button
                          onClick={e => e.stopPropagation()}
                          style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.10)', color: 'var(--status-warning)' }}
                        >
                          Resend Invite
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'approvals' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Client', 'Project', 'Item', 'Amount', 'Submitted', 'Deadline', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: h === 'Amount' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {PENDING_APPROVALS.map(a => {
                const client = CLIENTS.find(c => c.id === a.client);
                const proj = PROJECTS.find(p => p.id === client?.project);
                const dLeft = days(a.deadline);
                const urgent = dLeft <= 3;
                return (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{client?.name.split(' ').slice(-2).join(' ')}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{proj?.name.split(' ').slice(0, 2).join(' ')}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', maxWidth: 220 }}>{a.item}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--status-profit)' }}>${a.amount.toLocaleString()}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{a.submitted}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, fontFamily: 'monospace', color: urgent ? 'var(--status-warning)' : 'var(--text-tertiary)' }}>{a.deadline}{urgent && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--status-warning)' }}>({dLeft}d)</span>}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ padding: '4px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.10)', color: 'var(--status-profit)' }}>Approve</button>
                        <button style={{ padding: '4px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(251,113,133,0.35)', background: 'rgba(251,113,133,0.08)', color: 'var(--status-loss)' }}>Decline</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          {ACTIVITY.map((a, i) => {
            const client = CLIENTS.find(c => c.id === a.client);
            return (
              <div key={a.id} style={{ padding: '13px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, borderTop: i === 0 ? 'none' : '1px solid var(--color-brand-border)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={14} style={{ color: a.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 3 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{client?.name.split(' ').slice(-2).join(' ')} &middot; {a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
