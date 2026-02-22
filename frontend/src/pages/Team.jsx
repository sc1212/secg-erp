import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { PROJECTS } from '../lib/demoData';
import { money } from '../lib/format';

const TEAM = [
  { id: 1, name: 'Matt Seibert',  role: 'Owner / GM',              dept: 'Leadership',  phone: '(615) 555-0101', email: 'matt@secgtn.com',    hire: '2011-03-01', rate: 0,     hours: 0,  projects: [1,2,3,4,5,6,7,8], salary: true },
  { id: 2, name: 'Samuel Carson', role: 'Director of Finance',      dept: 'Finance',     phone: '(615) 555-0102', email: 'samuel@secgtn.com',  hire: '2016-07-12', rate: 58.00, hours: 42, projects: [1,2,3,4,5,6,7,8], salary: true },
  { id: 3, name: 'Cole Notgrass', role: 'Director of Operations',   dept: 'Operations',  phone: '(615) 555-0103', email: 'cole@secgtn.com',    hire: '2015-01-20', rate: 55.00, hours: 48, projects: [1,2,3,4,5,6,7,8], salary: true },
  { id: 4, name: 'Colton Harris', role: 'Director of Multifamily',  dept: 'Operations',  phone: '(615) 555-0104', email: 'colton@secgtn.com',  hire: '2018-05-07', rate: 52.00, hours: 45, projects: [5,6], salary: true },
  { id: 5, name: 'Connor Webb',   role: 'Project Manager',          dept: 'Field',       phone: '(615) 555-0105', email: 'connor@secgtn.com',  hire: '2019-08-15', rate: 38.50, hours: 47, projects: [1,2] },
  { id: 6, name: 'Joseph Hall',   role: 'Project Manager',          dept: 'Field',       phone: '(615) 555-0106', email: 'joseph@secgtn.com',  hire: '2020-02-03', rate: 36.00, hours: 44, projects: [3,4] },
  { id: 7, name: 'Abi Darnell',   role: 'Project Manager',          dept: 'Field',       phone: '(615) 555-0107', email: 'abi@secgtn.com',     hire: '2021-06-14', rate: 35.00, hours: 41, projects: [5,7] },
  { id: 8, name: 'Alex Torres',   role: 'Project Manager',          dept: 'Field',       phone: '(615) 555-0108', email: 'alex@secgtn.com',    hire: '2022-01-10', rate: 34.50, hours: 39, projects: [6,8] },
  { id: 9, name: 'Zach Monroe',   role: 'Mechanical Services Lead', dept: 'Mechanical',  phone: '(615) 555-0109', email: 'zach@secgtn.com',    hire: '2017-11-28', rate: 32.00, hours: 51, projects: [3,4,5] },
];

const DEPT_COLORS = {
  Leadership: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  Finance:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  Operations: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)' },
  Field:      { color: 'var(--status-profit)', bg: 'rgba(34,197,94,0.12)' },
  Mechanical: { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function TeamDetail({ member, onClose }) {
  const [tab, setTab] = useState('overview');
  const memberProjects = PROJECTS.filter(p => member.projects.includes(p.id));
  const dc = DEPT_COLORS[member.dept] || DEPT_COLORS.Field;

  const weeklyHours = WEEK_DAYS.map((day, i) => ({
    day,
    hrs: member.hours > 0 ? Math.max(6, Math.round(member.hours / 5) + (i % 2 === 0 ? 1 : -1)) : 0,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{member.role}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-brand-border)' }}>
          {['Overview', 'Projects', 'Hours'].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
              padding: '10px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: 'none',
              color: tab === t.toLowerCase() ? '#3b82f6' : 'var(--text-secondary)',
              borderBottom: `2px solid ${tab === t.toLowerCase() ? '#3b82f6' : 'transparent'}`,
            }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {tab === 'overview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: dc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: dc.color, flexShrink: 0 }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: dc.bg, color: dc.color }}>{member.dept}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Phone', member.phone],
                  ['Email', member.email],
                  ['Hire Date', new Date(member.hire).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })],
                  ['Active Projects', memberProjects.length.toString()],
                  ['Hours This Week', member.salary ? 'Salaried' : `${member.hours} hrs`],
                  ['Pay Rate', member.salary ? 'Salary' : `$${member.rate.toFixed(2)}/hr`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {memberProjects.length === 0
                ? <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: 20 }}>No active project assignments.</div>
                : memberProjects.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--color-brand-border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{p.phase} &middot; {p.pct}% complete</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{money(p.contract, true)}</div>
                      <div style={{ fontSize: 11, color: p.margin_pct < 5 ? 'var(--status-loss)' : 'var(--status-profit)', fontFamily: 'monospace' }}>{p.margin_pct}% margin</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'hours' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {member.salary ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 20, textAlign: 'center' }}>Salaried employee — hours tracked quarterly.</div>
              ) : (
                <>
                  {weeklyHours.map(({ day, hrs }) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{day}</div>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(hrs / 12) * 100}%`, background: '#3b82f6', borderRadius: 3 }} />
                      </div>
                      <div style={{ width: 36, fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', textAlign: 'right' }}>{hrs}h</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Total This Week</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#3b82f6' }}>{member.hours} hrs</span>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Est. Weekly Pay</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--status-profit)' }}>{money(member.hours * member.rate)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const [selected, setSelected] = useState(null);
  const [deptFilter, setDeptFilter] = useState('All');

  const depts = ['All', ...Array.from(new Set(TEAM.map(m => m.dept)))];
  const filtered = deptFilter === 'All' ? TEAM : TEAM.filter(m => m.dept === deptFilter);

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  const totalHours = TEAM.filter(m => !m.salary).reduce((s, m) => s + m.hours, 0);
  const totalPayroll = TEAM.filter(m => !m.salary).reduce((s, m) => s + m.hours * m.rate, 0);

  return (
    <div className="space-y-5">
      {selected && <TeamDetail member={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Team &amp; Payroll</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{TEAM.length} employees &middot; {totalHours} field hrs this week &middot; est. {money(totalPayroll)} payroll</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          ['Total Employees', TEAM.length, '#3b82f6'],
          ['Field Hours / Week', totalHours, 'var(--status-warning)'],
          ['Est. Weekly Payroll', money(totalPayroll, true), 'var(--status-profit)'],
          ['Active PMs', TEAM.filter(m => m.role.includes('Project Manager')).length, '#a78bfa'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {depts.map(d => (
          <button key={d} onClick={() => setDeptFilter(d)} style={{
            padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${deptFilter === d ? '#3b82f6' : 'var(--color-brand-border)'}`,
            background: deptFilter === d ? 'rgba(59,130,246,0.14)' : 'transparent',
            color: deptFilter === d ? '#3b82f6' : 'var(--text-secondary)',
          }}>{d}</button>
        ))}
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {[['Name','left'],['Role','left'],['Dept','left'],['Projects','right'],['Hrs / Week','right'],['Pay Rate','right'],['','right']].map(([h, align]) => (
              <th key={h} style={{ ...thBase, textAlign: align }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(m => {
              const dc = DEPT_COLORS[m.dept] || DEPT_COLORS.Field;
              const memberProjects = PROJECTS.filter(p => m.projects.includes(p.id));
              return (
                <tr key={m.id} onClick={() => setSelected(m)}
                  style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: dc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: dc.color, flexShrink: 0 }}>
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{m.role}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: dc.bg, color: dc.color }}>{m.dept}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{memberProjects.length}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: m.salary ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{m.salary ? 'Salaried' : `${m.hours} hrs`}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{m.salary ? '—' : `$${m.rate.toFixed(2)}/hr`}</td>
                  <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                    <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
