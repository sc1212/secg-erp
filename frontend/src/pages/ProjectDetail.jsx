import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Eye, Search, X } from 'lucide-react';
import { money } from '../lib/format';
import { PROJECTS, getProjectCostBreakdown, getProjectTransactions, getProjectMilestones, getProjectDailyLogs, getProjectChangeOrders, getProjectDocuments } from '../data/demoData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChartTooltip from '../components/ChartTooltip';

const tabKeys = ['overview', 'costs', 'schedule', 'logs', 'change-orders', 'documents'];
const tabLabels = ['Overview', 'Cost Detail', 'Schedule', 'Daily Logs', 'Change Orders', 'Documents'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initTab = tabKeys.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const [tab, setTab] = useState(initTab);

  const project = PROJECTS.find(p => p.id === Number(id)) || PROJECTS[0];
  const remaining = project.contract - project.spent;
  const budgetColor = project.budgetStatus === 'over_budget' ? '#fb7185' : project.budgetStatus === 'watch' ? '#fbbf24' : '#34d399';
  const budgetLabel = project.budgetStatus === 'over_budget' ? 'Over Budget' : project.budgetStatus === 'watch' ? 'Watch' : 'On Budget';
  const cos = getProjectChangeOrders(project.id);
  const coTotal = cos.filter(c => c.status === 'Approved').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div style={{ padding: 20, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>{project.code}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: budgetColor + '18', color: budgetColor }}>{project.phase}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{project.name}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{project.address} -- PM: {project.pm}</div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MiniKPI label="Contract" value={money(project.contract)} />
        <MiniKPI label="Cost to Date" value={money(project.spent)} />
        <MiniKPI label="Remaining" value={money(remaining)} />
        <MiniKPI label="Margin %" value={project.margin + '%'} color={project.margin < 5 ? '#fb7185' : '#34d399'} />
        <MiniKPI label="Change Orders" value={money(coTotal)} />
        <MiniKPI label="Completion" value={project.pct + '%'} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-medium)', overflowX: 'auto' }}>
        {tabKeys.map((k, i) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === k ? 'var(--accent)' : 'var(--text-tertiary)',
              borderBottom: tab === k ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, whiteSpace: 'nowrap',
            }}
          >
            {tabLabels[i]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab project={project} />}
      {tab === 'costs' && <CostDetailTab project={project} />}
      {tab === 'schedule' && <ScheduleTab project={project} />}
      {tab === 'logs' && <DailyLogsTab project={project} />}
      {tab === 'change-orders' && <ChangeOrdersTab project={project} />}
      {tab === 'documents' && <DocumentsTab project={project} />}
    </div>
  );
}

function MiniKPI({ label, value, color }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
    </div>
  );
}

// ═══ TAB 1: OVERVIEW ═══
function OverviewTab({ project }) {
  const breakdown = useMemo(() => getProjectCostBreakdown(project.id), [project.id]);
  const chartData = breakdown.map(b => ({ trade: b.trade, Budget: b.budget, Spent: b.spent }));
  return (
    <div className="space-y-4">
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis type="number" tickFormatter={v => money(v, true)} stroke="#475569" fontSize={10} />
            <YAxis type="category" dataKey="trade" stroke="#475569" fontSize={11} width={80} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="Budget" fill="rgba(255,255,255,0.08)" radius={[0, 3, 3, 0]} />
            <Bar dataKey="Spent" fill="#3b82f6" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Trade</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Budget</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Committed</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Spent</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{row.trade}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{money(row.budget)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{money(row.committed)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)' }}>{money(row.spent)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: row.variance >= 0 ? '#34d399' : '#fb7185' }}>{money(row.variance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ TAB 2: COST DETAIL ═══
function CostDetailTab({ project }) {
  const txns = useMemo(() => getProjectTransactions(project.id), [project.id]);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    let list = txns;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.vendor.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.costCode.includes(q));
    }
    list.sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'date': av = a.date; bv = b.date; break;
        case 'vendor': av = a.vendor; bv = b.vendor; break;
        case 'amount': av = a.amount; bv = b.amount; break;
        default: av = a.date; bv = b.date;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [txns, search, sortCol, sortDir]);

  const handleSort = col => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } };

  return (
    <div className="space-y-3">
      <div style={{ position: 'relative', maxWidth: 280 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by vendor, code..." style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th onClick={() => handleSort('date')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}>Date</th>
              <th onClick={() => handleSort('vendor')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}>Vendor</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
              <th onClick={() => handleSort('amount')} style={{ padding: '10px 12px', textAlign: 'right', cursor: 'pointer' }}>Amount</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Cost Code</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{t.date}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{t.vendor}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{t.description}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)' }}>{money(t.amount)}</td>
                <td style={{ padding: '8px 12px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)' }}>{t.costCode}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: t.status === 'Paid' ? 'rgba(52,211,153,0.1)' : t.status === 'Pending' ? 'rgba(251,191,36,0.1)' : 'rgba(56,189,248,0.1)', color: t.status === 'Paid' ? '#34d399' : t.status === 'Pending' ? '#fbbf24' : '#38bdf8' }}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ TAB 3: SCHEDULE ═══
function ScheduleTab({ project }) {
  const milestones = useMemo(() => getProjectMilestones(project.id), [project.id]);
  const statusColor = { Complete: '#34d399', 'In Progress': '#3b82f6', Upcoming: '#475569' };
  return (
    <div className="space-y-4">
      {/* Gantt-like bars */}
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', padding: 16 }}>
        {milestones.map((m, i) => {
          const total = milestones.length;
          const leftPct = (i / total) * 100;
          const widthPct = (1 / total) * 100;
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 120, fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>{m.name}</div>
              <div style={{ flex: 1, height: 18, background: 'rgba(255,255,255,0.03)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`, height: '100%', background: statusColor[m.status] || '#475569', borderRadius: 3, opacity: 0.7 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: statusColor[m.status], width: 80, textAlign: 'right' }}>{m.status}</span>
            </div>
          );
        })}
      </div>
      {/* Table */}
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Milestone</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Planned Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Actual Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{m.plannedDate}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{m.actualDate || '--'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: statusColor[m.status] + '18', color: statusColor[m.status] }}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ TAB 4: DAILY LOGS ═══
function DailyLogsTab({ project }) {
  const logs = useMemo(() => getProjectDailyLogs(project.id), [project.id]);
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="space-y-2">
      {logs.map(log => (
        <div key={log.id} style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-tertiary)', width: 90, flexShrink: 0 }}>{log.date}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', width: 80, flexShrink: 0 }}>{log.author}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 140, flexShrink: 0 }}>{log.weather}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', width: 70, flexShrink: 0 }}>Crew: {log.crewSize}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.summary}</span>
            {expanded === log.id ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
          </div>
          {expanded === log.id && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontSize: 13 }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>Work Performed</div>
                <div style={{ color: 'var(--text-primary)' }}>{log.workPerformed}</div>
              </div>
              {log.materialsUsed && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 4 }}>Materials Used</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{log.materialsUsed}</div>
                </div>
              )}
              {log.issues && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#fbbf24', marginBottom: 4 }}>Issues Noted</div>
                  <div style={{ color: '#fbbf24' }}>{log.issues}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══ TAB 5: CHANGE ORDERS ═══
function ChangeOrdersTab({ project }) {
  const cos = useMemo(() => getProjectChangeOrders(project.id), [project.id]);
  const [detail, setDetail] = useState(null);
  const statusColor = { Approved: '#34d399', Pending: '#fbbf24', Rejected: '#fb7185' };
  return (
    <div className="space-y-3">
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>CO #</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Requested By</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {cos.map(co => (
              <tr key={co.id} onClick={() => setDetail(detail === co.id ? null : co.id)} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{co.num}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{co.desc}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{co.requestedBy}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)' }}>{money(co.amount)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: statusColor[co.status] + '18', color: statusColor[co.status] }}>{co.status}</span>
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{co.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (() => {
        const co = cos.find(c => c.id === detail);
        return co ? (
          <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{co.num} -- Detail</h3>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span style={{ color: 'var(--text-tertiary)' }}>Description:</span> <span style={{ color: 'var(--text-primary)' }}>{co.desc}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Amount:</span> <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{money(co.amount)}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Requested By:</span> <span style={{ color: 'var(--text-primary)' }}>{co.requestedBy}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Status:</span> <span style={{ color: statusColor[co.status], fontWeight: 600 }}>{co.status}</span></div>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}

// ═══ TAB 6: DOCUMENTS ═══
function DocumentsTab({ project }) {
  const docs = useMemo(() => getProjectDocuments(project.id), [project.id]);
  const [preview, setPreview] = useState(null);
  const typeColor = { Contract: '#3b82f6', Plans: '#818cf8', Permits: '#34d399', Submittals: '#fbbf24', Photos: '#f472b6', Reports: '#22d3ee' };
  return (
    <div className="space-y-3">
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Uploaded By</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Size</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} onClick={() => setPreview(d)} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{d.name}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: (typeColor[d.type] || '#475569') + '18', color: typeColor[d.type] || '#475569' }}>{d.type}</span>
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{d.uploadedBy}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{d.date}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-tertiary)', fontSize: 12 }}>{d.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Preview Modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setPreview(null)}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 12, padding: 24 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{preview.name}</h3>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 16 }}>
              <Eye size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Document Preview</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{preview.type} -- {preview.size}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span style={{ color: 'var(--text-tertiary)' }}>Uploaded by:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.uploadedBy}</span></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Date:</span> <span style={{ color: 'var(--text-primary)' }}>{preview.date}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
