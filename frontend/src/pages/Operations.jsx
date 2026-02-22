import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { money } from '../lib/format';
import { Calendar, FileText, CheckSquare, ListTodo, GitPullRequest, Users, Truck, Shield, ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PROJECTS, SCHEDULE_EVENTS, PUNCH_LIST, TASKS, FLEET, PERMITS, TEAM_LIST, getProjectDailyLogs, getProjectChangeOrders } from '../data/demoData';

const modules = [
  { key: 'schedule', label: 'Schedule', icon: Calendar, desc: 'Upcoming inspections, deliveries, meetings' },
  { key: 'logs', label: 'Daily Logs', icon: FileText, desc: 'Field logs across all projects' },
  { key: 'punch', label: 'Punch List', icon: CheckSquare, desc: 'Outstanding items and status' },
  { key: 'tasks', label: 'Tasks', icon: ListTodo, desc: 'Task assignments and deadlines' },
  { key: 'cos', label: 'Change Orders', icon: GitPullRequest, desc: 'All COs across projects' },
  { key: 'team', label: 'Team & Payroll', icon: Users, desc: 'Employee roster and hours' },
  { key: 'fleet', label: 'Fleet', icon: Truck, desc: 'Vehicles and equipment' },
  { key: 'permits', label: 'Permits & Inspections', icon: Shield, desc: 'Permit tracker and results' },
];

export default function Operations() {
  const [activeModule, setActiveModule] = useState(null);
  const navigate = useNavigate();

  if (activeModule) {
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveModule(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>
          <ArrowLeft size={16} /> Back to Operations
        </button>
        {activeModule === 'schedule' && <ScheduleModule />}
        {activeModule === 'logs' && <DailyLogsModule />}
        {activeModule === 'punch' && <PunchListModule />}
        {activeModule === 'tasks' && <TasksModule />}
        {activeModule === 'cos' && <ChangeOrdersModule />}
        {activeModule === 'team' && <TeamModule navigate={navigate} />}
        {activeModule === 'fleet' && <FleetModule />}
        {activeModule === 'permits' && <PermitsModule />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>Operations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(m => {
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              onClick={() => setActiveModule(m.key)}
              style={{ padding: 20, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.transform = 'none'; }}
            >
              <Icon size={24} style={{ color: 'var(--accent)', marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{m.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ SCHEDULE ═══
function ScheduleModule() {
  return (
    <div className="space-y-3">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Schedule</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Time</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Event</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Assigned To</th>
          </tr></thead>
          <tbody>
            {SCHEDULE_EVENTS.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{e.date}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{e.time}</td>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{e.event}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{e.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{e.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ DAILY LOGS ═══
function DailyLogsModule() {
  const [projectFilter, setProjectFilter] = useState('');
  const allLogs = useMemo(() => {
    const logs = [];
    PROJECTS.forEach(p => { getProjectDailyLogs(p.id).forEach(l => logs.push({ ...l, project: p.name })); });
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  }, []);
  const filtered = projectFilter ? allLogs.filter(l => l.project === projectFilter) : allLogs;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Daily Logs - All Projects</h2>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: 12 }}>
          <option value="">All Projects</option>
          {PROJECTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Author</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Weather</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Crew</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Summary</th>
          </tr></thead>
          <tbody>
            {filtered.slice(0, 35).map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{l.date}</td>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{l.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{l.author}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)', fontSize: 12 }}>{l.weather}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{l.crewSize}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ PUNCH LIST ═══
function PunchListModule() {
  const [statusFilter, setStatusFilter] = useState('');
  const filtered = statusFilter ? PUNCH_LIST.filter(p => p.status === statusFilter) : PUNCH_LIST;
  const priorityColor = { High: '#fb7185', Medium: '#fbbf24', Low: '#94a3b8' };
  const statusColor = { Open: '#fbbf24', 'In Progress': '#3b82f6', Complete: '#34d399' };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Punch List</h2>
        <div className="flex gap-2">
          {['', 'Open', 'In Progress', 'Complete'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, border: statusFilter === s ? '1px solid var(--accent)' : '1px solid var(--border-medium)', background: statusFilter === s ? 'rgba(59,130,246,0.1)' : 'var(--bg-surface)', color: statusFilter === s ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer' }}>{s || 'All'}</button>
          ))}
        </div>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 800 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Location</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Assigned</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Priority</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.item}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{p.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-tertiary)', fontSize: 12 }}>{p.location}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{p.assignedTo}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: priorityColor[p.priority] + '18', color: priorityColor[p.priority] }}>{p.priority}</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: statusColor[p.status] + '18', color: statusColor[p.status] }}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ TASKS ═══
function TasksModule() {
  const [search, setSearch] = useState('');
  const filtered = search ? TASKS.filter(t => t.task.toLowerCase().includes(search.toLowerCase()) || t.project.toLowerCase().includes(search.toLowerCase()) || t.assignedTo.toLowerCase().includes(search.toLowerCase())) : TASKS;
  const priorityColor = { High: '#fb7185', Medium: '#fbbf24', Low: '#94a3b8' };
  const statusColor = { Overdue: '#fb7185', 'In Progress': '#3b82f6', Pending: '#94a3b8' };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Tasks</h2>
        <div style={{ position: 'relative', maxWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
        </div>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Task</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Assigned</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Due Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Priority</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
          </tr></thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: t.status === 'Overdue' ? 'rgba(251,113,133,0.04)' : 'transparent' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{t.task}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{t.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{t.assignedTo}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: t.status === 'Overdue' ? '#fb7185' : 'var(--text-tertiary)' }}>{t.dueDate}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: priorityColor[t.priority] + '18', color: priorityColor[t.priority] }}>{t.priority}</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: (statusColor[t.status] || '#94a3b8') + '18', color: statusColor[t.status] || '#94a3b8' }}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ CHANGE ORDERS ═══
function ChangeOrdersModule() {
  const allCOs = useMemo(() => {
    const cos = [];
    PROJECTS.forEach(p => { getProjectChangeOrders(p.id).forEach(co => cos.push({ ...co, project: p.name })); });
    return cos;
  }, []);
  const statusColor = { Approved: '#34d399', Pending: '#fbbf24', Rejected: '#fb7185' };
  return (
    <div className="space-y-3">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Change Orders - All Projects</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>CO #</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
          </tr></thead>
          <tbody>
            {allCOs.map(co => (
              <tr key={co.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{co.num}</td>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{co.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{co.desc}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600 }}>{money(co.amount)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: statusColor[co.status] + '18', color: statusColor[co.status] }}>{co.status}</span>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{co.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ TEAM ═══
function TeamModule({ navigate }) {
  const [detail, setDetail] = useState(null);
  const team = TEAM_LIST;
  if (detail) {
    const m = detail;
    const projects = PROJECTS.filter(p => p.pm === m.name || m.name === 'Matt Seibert' || m.name === 'Samuel Carson' || m.name === 'Cole Notgrass');
    return (
      <div className="space-y-4">
        <button onClick={() => setDetail(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>
          <ArrowLeft size={16} /> Back to Team
        </button>
        <div style={{ padding: 20, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{m.name}</h2>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.role}</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div><span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Hours This Week</span><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{m.hoursThisWeek}</div></div>
            <div><span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Rate</span><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>${m.rate}/hr</div></div>
            <div><span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Active Projects</span><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{projects.length}</div></div>
          </div>
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Assigned Projects</h3>
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
            >
              <div><div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.phase} - {p.pct}%</div></div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-secondary)' }}>{money(p.contract)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Team & Payroll</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Role</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Active Projects</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Hours This Week</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Pay Rate</th>
          </tr></thead>
          <tbody>
            {team.map((m, i) => {
              const projects = PROJECTS.filter(p => p.pm === m.name).length || (m.role.includes('Director') || m.role === 'Owner' ? PROJECTS.length : 1);
              return (
                <tr key={i} onClick={() => setDetail(m)} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{m.role}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{projects}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{m.hoursThisWeek}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>${m.rate}/hr</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ FLEET ═══
function FleetModule() {
  const statusColor = { Active: '#34d399', 'Service Due': '#fbbf24' };
  return (
    <div className="space-y-3">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Fleet</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Vehicle</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Year</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Assigned To</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Mileage</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Next Service</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
          </tr></thead>
          <tbody>
            {FLEET.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{f.vehicle}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{f.year}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{f.assignedTo}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{f.mileage ? f.mileage.toLocaleString() : '--'}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{f.nextService}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: (statusColor[f.status] || '#94a3b8') + '18', color: statusColor[f.status] || '#94a3b8' }}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ PERMITS ═══
function PermitsModule() {
  const resultColor = { Pass: '#34d399', Fail: '#fb7185', Pending: '#fbbf24', Conditional: '#818cf8' };
  return (
    <div className="space-y-3">
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Permits & Inspections</h2>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Permit #</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Inspection Date</th>
            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Result</th>
          </tr></thead>
          <tbody>
            {PERMITS.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{p.permitNum}</td>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{p.project}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{p.type}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: p.status === 'Active' ? 'rgba(52,211,153,0.1)' : p.status === 'Applied' ? 'rgba(56,189,248,0.1)' : 'rgba(148,163,184,0.1)', color: p.status === 'Active' ? '#34d399' : p.status === 'Applied' ? '#38bdf8' : '#94a3b8' }}>{p.status}</span>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-tertiary)' }}>{p.inspectionDate || '--'}</td>
                <td style={{ padding: '8px 12px' }}>
                  {p.result ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: (resultColor[p.result] || '#94a3b8') + '18', color: resultColor[p.result] || '#94a3b8' }}>{p.result}</span> : <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>--</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
