import { useMemo, useState } from 'react';
import {
  ArrowRight,
  DollarSign,
  Banknote,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  GitBranch,
  Users2,
  Clock3,
  Layers3,
  Sparkles,
  Radar,
  Siren,
  HandCoins,
} from 'lucide-react';

const roleViews = {
  owner: {
    label: 'Owner / CFO',
    mission: 'Protect margin + cash in the next 2–13 weeks.',
    defaultModule: 'cash',
    inbox: [
      { priority: 'Critical', item: 'Week-6 cash shortfall: -$170k', owner: 'Controller', due: 'Today' },
      { priority: 'Warning', item: '3 projects >4% margin erosion', owner: 'Ops Director', due: 'Tomorrow' },
      { priority: 'Warning', item: 'Pending CO backlog tied to $388k exposure', owner: 'PM Office', due: '2 days' },
    ],
  },
  pm: {
    label: 'Project Manager',
    mission: 'Control cost code drift + unblock billable work.',
    defaultModule: 'margin',
    inbox: [
      { priority: 'Critical', item: 'PRJ-042 concrete labor productivity variance', owner: 'PM', due: 'Today' },
      { priority: 'Warning', item: 'Committed not invoiced: $182k', owner: 'Project Accountant', due: 'Tomorrow' },
      { priority: 'Warning', item: 'CO-119 pending owner response >20 days', owner: 'PM', due: 'Today' },
    ],
  },
  ops: {
    label: 'Ops / Field',
    mission: 'Remove blockers driving schedule/cost slippage.',
    defaultModule: 'change-orders',
    inbox: [
      { priority: 'Critical', item: 'Concrete crew shortage on PRJ-051', owner: 'Superintendent', due: 'Today' },
      { priority: 'Warning', item: 'Submittal delay impacting sequence', owner: 'Project Engineer', due: 'Tomorrow' },
      { priority: 'Warning', item: 'Lift rental idle time > planned usage', owner: 'Field Ops', due: '2 days' },
    ],
  },
};

const modules = [
  {
    id: 'margin', title: 'Gross Margin Erosion', icon: DollarSign,
    kpi: 'Gross Margin % down 2.4 pts', metric: { value: '-2.4 pts', comparison: 'vs prior forecast' },
    drivers: [
      {
        id: 'labor-productivity', label: 'Labor productivity variance', summary: 'Overtime + rework on structural concrete scopes',
        records: [{ id: 'prj-042-03310', label: 'PRJ-042 · 03-310 Structural Concrete', detail: 'Budget $680k · Committed $644k · Invoiced $661k · Paid $615k · EAC $731k', rootCause: 'productivity + rework', transactions: ['INV-4421 · Metro Concrete · $82,400 · Approved 2026-01-11', 'TS-8840 · Crew A overtime · 42 hrs · Approved by PM', 'PO-1209 · Rebar escalation change · $18,300'] }],
      },
      {
        id: 'material-price', label: 'Material unit price variance', summary: 'Steel and specialty materials above estimate baseline',
        records: [{ id: 'prj-038-05510', label: 'PRJ-038 · 05-510 Metal Stairs', detail: 'Steel package +11.2% vs estimate baseline', rootCause: 'unit_price_variance', transactions: ['PO-1170 revision 2 · +$24,500 · Linked to mill surcharge notice'] }],
      },
    ],
  },
  {
    id: 'cash', title: '13-Week Cash Risk', icon: Banknote,
    kpi: 'Week 6 projected shortfall: -$170,000', metric: { value: '-$170k', comparison: 'week 6 net position' },
    drivers: [
      {
        id: 'ar-delay', label: 'AR delay risk', summary: 'Collections slippage and retainage release delays',
        records: [{ id: 'inv-2034', label: 'INV-2034 · Northgate Owner Draw #7', detail: 'Amount $142,800 · Aging 36 days · Retainage 10% pending certs', rootCause: 'timing/cash_timing', transactions: ['Billing record BILL-770 · Submitted 2026-01-02', 'Collection note · Promise-to-pay slipped from W5 to W7'] }],
      },
      {
        id: 'payroll-concentration', label: 'Payroll concentration', summary: 'High overtime density in same cash window',
        records: [{ id: 'pay-2-14', label: 'Payroll Batch · Week 6 · $248,100', detail: 'High overtime from PRJ-042 + PRJ-051 concrete crews', rootCause: 'productivity', transactions: ['Labor batch PAY-2026-06 · 132 field employees · Approved by Controller'] }],
      },
    ],
  },
  {
    id: 'change-orders', title: 'Pending Change Order Impact', icon: ClipboardList,
    kpi: 'Pending CO exposure: $388,000', metric: { value: '$388k', comparison: 'unapproved cost at risk' },
    drivers: [{ id: 'awaiting-owner', label: 'Awaiting owner response', summary: 'Submitted COs aging beyond SLA', records: [{ id: 'co-119', label: 'CO-119 · PRJ-042 Lobby redesign', detail: 'Amount $94,000 · Submitted 24 days ago · Cost impact active', rootCause: 'scope_change', transactions: ['Budget revision BR-91 queued (not posted)', 'Billing status: Not billable until owner approval'] }] }],
  },
];

const pageHierarchy = [
  { role: 'Owner/CFO', landing: 'Executive Command Center', modules: 'Margin risk, 13-week cash, AR/retainage, CO exposure' },
  { role: 'PM', landing: 'Job Cost Control', modules: 'Project variance, cost code drift, commitments, CO blockers, EAC' },
  { role: 'Ops/Field', landing: 'Production Blockers', modules: 'Labor constraints, sub/vendor blockers, escalation queue' },
  { role: 'Admin/Controller', landing: 'Finance Operations', modules: 'Billing workflow, collections queue, payables timing, debt obligations' },
];
const workflowSpecs = [
  { page: 'Executive Command Center', users: 'Owner, CFO', decisions: 'Margin interventions, cash mitigation', actions: 'Flag, assign, escalate, approve mitigation' },
  { page: 'Job Cost Control', users: 'PM, Project Accountant', decisions: 'Reforecast EAC, variance containment', actions: 'Update forecast, hold/release commitment' },
  { page: 'AR / Billing / Retainage', users: 'Billing team, Controller', decisions: 'Collections priority, retainage release', actions: 'Assign collector, update cash date' },
  { page: 'Change Order Control', users: 'PM, Ops, Finance', decisions: 'CO approval priority, budget/billing impact', actions: 'Approve/reject/escalate CO' },
];
const chain = ['Project', 'Phase/Division', 'Cost Code', 'Vendor/Sub/Labor', 'PO/Invoice/Timesheet', 'Payment/Transaction'];
const traceabilityRows = [
  ['Project ↔ Phase ↔ Cost Code', 'Budget lineage and cost classification'],
  ['Vendor/Sub ↔ PO ↔ Invoice ↔ Payment', 'Commitment-to-cash traceability'],
  ['CO ↔ Budget Revision ↔ Billing ↔ Margin', 'Financial coupling and forecast integrity'],
  ['AR ↔ Collections ↔ Cash Forecast', 'Week-level liquidity driver transparency'],
  ['Payroll/Labor ↔ Job Costs ↔ Productivity', 'Operational root-cause attribution'],
];
const scenarioPlaybooks = [
  { id: 'margin-fire', title: 'Margin Fire Drill', role: 'Owner/CFO + PM', trigger: 'Gross margin drops >2 pts in 5 days', objective: 'Contain erosion within 72 hours', sequence: ['Identify top variance projects', 'Assign PM owners + due dates', 'Approve mitigation package', 'Reforecast + lock baseline'] },
  { id: 'cash-shock', title: 'Cash Shock Week', role: 'CFO + Controller', trigger: 'Forecast week net cash below zero', objective: 'Close shortfall before payroll cutoff', sequence: ['Pinpoint AR slips/AP concentrations', 'Escalate collections', 'Stage payment timing scenarios', 'Approve contingency draw if required'] },
  { id: 'co-logjam', title: 'CO Logjam Recovery', role: 'PM + Ops + Finance', trigger: 'CO queue aging >14 days', objective: 'Convert pending COs into billable state', sequence: ['Segment by owner response risk', 'Escalate blockers with evidence pack', 'Post budget revisions on approvals', 'Push billing package same-day'] },
];
const missionCards = [
  { id: 'red-alert-margin', title: 'Red Alert: Margin Compression', icon: Siren, brief: 'Three projects crossing erosion threshold in one cycle.', command: 'Launch 48-hour margin containment sprint.', score: 'Risk 88/100' },
  { id: 'cash-turbulence', title: 'Cash Turbulence Window', icon: HandCoins, brief: 'Week 6 and 7 both negative under baseline assumptions.', command: 'Activate collections war-room + payment resequencing.', score: 'Risk 81/100' },
  { id: 'co-pressure', title: 'CO Pressure Build-up', icon: Radar, brief: 'Pending CO aging exceeds SLA in two regions.', command: 'Daily escalation cadence until billable conversion.', score: 'Risk 76/100' },
];
const commandNarratives = [
  'Signal detected: week-level cash shortfall expands by $42k after AR slip.',
  'Drill executed: AR driver opened, invoice-level retainage blockers identified.',
  'Decision applied: assign collector + escalate owner response + adjust AP sequencing.',
  'Outcome tracked: forecast delta improves, contingency draw avoided this cycle.',
];

const priorityClass = { Critical: 'bg-danger/10 text-danger border-danger/20', Warning: 'bg-warn/10 text-warn border-warn/20' };

function TinyMetric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-card px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-brand-muted"><Icon size={13} /> {label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function OperatingSystem() {
  const [role, setRole] = useState('owner');
  const [activeView, setActiveView] = useState('overview');
  const [moduleId, setModuleId] = useState(roleViews.owner.defaultModule);
  const [driverId, setDriverId] = useState('');
  const [recordId, setRecordId] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [actionLog, setActionLog] = useState([]);

  const module = useMemo(() => modules.find((m) => m.id === moduleId) ?? modules[0], [moduleId]);
  const driver = useMemo(() => module.drivers.find((d) => d.id === driverId), [module, driverId]);
  const record = useMemo(() => driver?.records.find((r) => r.id === recordId), [driver, recordId]);
  const queueRows = useMemo(() => {
    const base = roleViews[role].inbox;
    const followUps = base.map((row, idx) => ({
      ...row,
      item: `${row.item} · Follow-up ${idx + 1}`,
      due: idx === 0 ? 'Next 4h' : idx === 1 ? 'End of day' : '24h',
    }));
    return [...base, ...followUps];
  }, [role]);


  const selectRole = (nextRole) => {
    setRole(nextRole);
    setModuleId(roleViews[nextRole].defaultModule);
    setDriverId('');
    setRecordId('');
    setSelectedTransaction('');
  };
  const handleAction = (action) => {
    const context = [module?.title, driver?.label, record?.label, selectedTransaction].filter(Boolean).join(' → ');
    const stamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setActionLog((prev) => [`${stamp}: ${action} (${context || 'Portfolio level'})`, ...prev].slice(0, 7));
  };

  const viewTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'mission', label: 'Mission Control' },
    { id: 'drilldown', label: 'Drilldown Lab' },
    { id: 'workflows', label: 'Workflow Specs' },
    { id: 'traceability', label: 'Traceability Map' },
    { id: 'scenario', label: 'Scenario Studio' },
  ];

  return (
    <div className="space-y-3">
      <section className="bg-brand-card border border-brand-border rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <p className="text-[11px] tracking-wide uppercase text-brand-gold font-semibold">Construction Operating System</p>
            <h1 className="text-xl font-bold">Logic-first decision workspace (fake data)</h1>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 min-w-[320px]">
            <TinyMetric label="KPI drills" value="12 / 12" icon={CheckCircle2} />
            <TinyMetric label="Dead-end views" value="0" icon={AlertTriangle} />
            <TinyMetric label="Active role" value={roleViews[role].label} icon={Users2} />
            <TinyMetric label="Open actions" value={String(actionLog.length)} icon={Clock3} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {Object.entries(roleViews).map(([key, view]) => (
          <button key={key} onClick={() => selectRole(key)} className={`text-left rounded-lg border p-2.5 transition ${role === key ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border bg-brand-card hover:border-brand-gold/50'}`}>
            <p className="text-xs text-brand-muted">{view.label}</p>
            <p className="text-sm font-medium mt-1">{view.mission}</p>
          </button>
        ))}
      </section>

      <section className="bg-brand-card border border-brand-border rounded-lg p-1.5 sticky top-0 z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {viewTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`px-2 py-2 text-xs rounded-md border ${activeView === tab.id ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-border text-brand-muted hover:text-brand-text'}`}>{tab.label}</button>
          ))}
        </div>
      </section>

      {activeView === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          <section className="bg-brand-card border border-brand-border rounded-lg p-3 xl:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Intervention Queue</h3>
              <div className="text-xs text-brand-muted flex items-center gap-1"><Filter size={12} /> sort · filter · compare · export</div>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="text-left text-xs uppercase text-brand-muted border-b border-brand-border"><th className="pb-2">Priority</th><th className="pb-2">Issue</th><th className="pb-2">Owner</th><th className="pb-2">SLA</th></tr></thead>
              <tbody>{queueRows.map((row) => <tr key={row.item} className="border-b border-brand-border/60"><td className="py-2"><span className={`text-[11px] px-2 py-0.5 rounded border ${priorityClass[row.priority]}`}>{row.priority}</span></td><td className="py-2 font-medium">{row.item}</td><td className="py-2 text-brand-muted">{row.owner}</td><td className="py-2 text-brand-muted">{row.due}</td></tr>)}</tbody>
            </table>
          </section>
          <section className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-2">
            <h3 className="font-semibold">Quick Decision Lens</h3>
            <div className="text-xs p-2 rounded border border-brand-border">Top cash risk in next 2 weeks: AR delay + payroll concentration overlap.</div>
            <div className="text-xs p-2 rounded border border-brand-border">Top margin risk: labor productivity + rework in structural concrete scope.</div>
            <div className="text-xs p-2 rounded border border-brand-border">Top CO risk: owner response aging beyond SLA, delaying billing conversion.</div>
          </section>


        <section className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          {modules.map((m) => (
            <div key={m.id} className="bg-brand-card border border-brand-border rounded-lg p-3">
              <p className="text-[11px] uppercase text-brand-muted">Active Module</p>
              <p className="text-sm font-semibold mt-1">{m.title}</p>
              <p className="text-xs text-brand-muted mt-1">{m.kpi}</p>
              <p className="text-xs mt-2"><span className="font-medium">Primary metric:</span> {m.metric.value}</p>
            </div>
          ))}
        </section>
              </div>
      )}

      {activeView === 'mission' && (
        <section className="space-y-2">
          <div className="bg-brand-card border border-brand-border rounded-lg p-3">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles size={15} className="text-brand-gold" />Mission Control</h3>
            <p className="text-sm text-brand-muted">Signal → Drilldown → Decision → Outcome command narratives.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">{missionCards.map((card) => { const Icon = card.icon; return <div key={card.id} className="bg-brand-card border border-brand-border rounded-lg p-3"><div className="flex items-center justify-between"><h4 className="font-medium text-sm">{card.title}</h4><Icon size={14} className="text-brand-gold" /></div><p className="text-xs text-brand-muted mt-2">{card.brief}</p><p className="text-xs mt-2"><span className="font-medium">Command:</span> {card.command}</p><p className="text-[11px] mt-2 inline-flex px-2 py-0.5 rounded border border-brand-border">{card.score}</p></div>; })}</div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4 space-y-1">{commandNarratives.map((n, i) => <p key={n} className="text-sm"><span className="text-brand-gold font-semibold mr-2">{i + 1}.</span>{n}</p>)}</div>
        </section>
      )}

      {activeView === 'drilldown' && (
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-3">
          <div className="space-y-3">
            {modules.map((m) => { const Icon = m.icon; return <button key={m.id} onClick={() => { setModuleId(m.id); setDriverId(''); setRecordId(''); setSelectedTransaction(''); }} className={`w-full text-left bg-brand-card border rounded-lg p-3 ${moduleId === m.id ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}><div className="flex items-center gap-2 text-brand-gold text-xs"><Icon size={14} /> KPI</div><p className="font-medium text-sm mt-1">{m.title}</p><p className="text-xs text-brand-muted">{m.kpi}</p></button>; })}
          </div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">1) Drivers</p>{module.drivers.map((d) => <button key={d.id} onClick={() => { setDriverId(d.id); setRecordId(''); }} className={`w-full text-left text-xs px-2 py-2 rounded border mb-2 ${driverId === d.id ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}>{d.label}</button>)}</div>
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">2) Records</p>{driver ? driver.records.map((r) => <button key={r.id} onClick={() => setRecordId(r.id)} className={`w-full text-left text-xs px-2 py-2 rounded border mb-2 ${recordId === r.id ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}><div className="font-medium">{r.label}</div><div className="text-brand-muted">{r.rootCause}</div></button>) : <p className="text-xs text-brand-muted">Pick a driver.</p>}</div>
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">3) Transactions</p>{record ? record.transactions.map((t) => <button key={t} onClick={() => setSelectedTransaction(t)} className={`w-full text-left text-xs px-2 py-2 rounded border mb-2 ${selectedTransaction === t ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}>{t}</button>) : <p className="text-xs text-brand-muted">Pick a record.</p>}</div>
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">4) Actions</p><div className="flex flex-wrap gap-2">{['Flag Risk', 'Assign Owner', 'Approve', 'Escalate', 'Update Forecast'].map((a) => <button key={a} onClick={() => handleAction(a)} className="text-xs px-2 py-1 rounded border border-brand-border hover:border-brand-gold">{a}</button>)}</div><div className="mt-2 space-y-1">{actionLog.slice(0, 4).map((l) => <p className="text-[11px]" key={l}>• {l}</p>)}</div></div>
          </div>
        </section>
      )}

      {activeView === 'workflows' && (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="bg-brand-card border border-brand-border rounded-lg p-3"><h3 className="font-semibold text-sm flex items-center gap-2"><GitBranch size={14} className="text-brand-gold" />Role Entry Map</h3><div className="space-y-2 mt-2">{pageHierarchy.map((p) => <div className="text-xs border border-brand-border rounded p-2" key={p.role}><div className="font-medium">{p.role} → {p.landing}</div><div className="text-brand-muted">{p.modules}</div></div>)}</div></div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-3"><h3 className="font-semibold text-sm flex items-center gap-2"><Users2 size={14} className="text-brand-gold" />Workflow Specs</h3><div className="space-y-2 mt-2">{workflowSpecs.map((s) => <div key={s.page} className="text-xs border border-brand-border rounded p-2"><div className="font-medium">{s.page}</div><div><span className="font-medium">Users:</span> {s.users}</div><div><span className="font-medium">Decisions:</span> {s.decisions}</div><div><span className="font-medium">Actions:</span> {s.actions}</div></div>)}</div></div>
        </section>
      )}

      {activeView === 'traceability' && (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="bg-brand-card border border-brand-border rounded-lg p-3"><h3 className="font-semibold text-sm mb-2">Job Cost Chain</h3><div className="flex flex-wrap gap-2">{chain.map((step, i) => <div key={step} className="text-xs flex items-center gap-2"><span className="px-2 py-1 rounded border border-brand-border bg-brand-surface">{step}</span>{i < chain.length - 1 && <ArrowRight size={11} className="text-brand-muted" />}</div>)}</div></div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-3"><h3 className="font-semibold text-sm mb-2">Traceability Map</h3><div className="space-y-2">{traceabilityRows.map(([c, m]) => <div key={c} className="text-xs border border-brand-border rounded p-2"><div className="font-medium">{c}</div><div className="text-brand-muted">{m}</div></div>)}</div><div className="flex gap-2 mt-3"><button className="text-xs px-2 py-1 border rounded border-brand-border flex items-center gap-1"><Filter size={12}/>Filter</button><button className="text-xs px-2 py-1 border rounded border-brand-border">Compare</button><button className="text-xs px-2 py-1 border rounded border-brand-border flex items-center gap-1"><Download size={12}/>Export</button></div></div>
        </section>
      )}

      {activeView === 'scenario' && (
        <section className="space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">{scenarioPlaybooks.map((s) => <div key={s.id} className="bg-brand-card border border-brand-border rounded-lg p-3"><p className="text-[11px] uppercase text-brand-gold">{s.role}</p><h4 className="font-medium text-sm">{s.title}</h4><p className="text-xs text-brand-muted mt-1"><span className="font-medium text-brand-text">Trigger:</span> {s.trigger}</p><p className="text-xs text-brand-muted"><span className="font-medium text-brand-text">Objective:</span> {s.objective}</p><div className="mt-2 space-y-1">{s.sequence.map((step, i) => <p key={step} className="text-xs"><span className="text-brand-gold font-semibold mr-1">{i + 1}.</span>{step}</p>)}</div></div>)}</div>
          <div className="bg-brand-card border border-brand-border rounded-lg p-4"><h3 className="font-semibold text-sm mb-2">Runbook Output</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-2"><TinyMetric label="Time to first action" value="11 min" icon={Clock3} /><TinyMetric label="Actions created" value="7 assignments" icon={Users2} /><TinyMetric label="Forecast delta locked" value="+$86,000" icon={Layers3} /></div></div>
        </section>
      )}
    </div>
  );
}
