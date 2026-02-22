import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Banknote, Building2, CheckCircle2, ClipboardList, Clock3, Construction, DatabaseZap, Download, FileText, Filter, Flag, FolderKanban, GitBranch, HandCoins, Home, Layers3, Map, MessageSquareMore, ShieldCheck, Sparkles, TrendingUp, Users, Users2, Wallet } from 'lucide-react';

function TinyMetric({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 bg-brand-surface rounded p-2 text-xs">
      {Icon && <Icon size={14} className="text-brand-gold shrink-0" />}
      <div><div className="text-brand-muted">{label}</div><div className="font-semibold">{value}</div></div>
    </div>
  );
}

const views = [
  { id: 'command', label: 'Command Deck' },
  { id: 'queue', label: 'Decision Queue' },
  { id: 'ops', label: 'Field Ops Logs' },
  { id: 'pipeline', label: 'Leads · Proposals · Invoices' },
];

const portfolioKpis = [
  { label: '13-week net floor', value: '($170,000)', trend: 'week 6', icon: Banknote, tone: 'danger' },
  { label: 'Gross margin at risk', value: '$388,000', trend: 'change orders', icon: TrendingUp, tone: 'warn' },
  { label: 'AR aging > 30 days', value: '$142,800', trend: 'owner draw #7', icon: Wallet, tone: 'warn' },
  { label: 'Decision SLA hit-rate', value: '92%', trend: 'last 14 days', icon: CheckCircle2, tone: 'ok' },
];

const decisionQueue = [
  { type: 'Invoice Approval', project: 'PRJ-042', item: 'Metro Concrete INV-4421', amount: 82400, age: '4h', owner: 'Controller', priority: 'Critical' },
  { type: 'Change Order', project: 'PRJ-038', item: 'CO-119 Lobby redesign', amount: 94000, age: '24d', owner: 'PM Office', priority: 'Warning' },
  { type: 'Owner Draw', project: 'PRJ-051', item: 'Draw #7 package', amount: 142800, age: '2d', owner: 'Billing', priority: 'Warning' },
  { type: 'Vendor Payment', project: 'PRJ-027', item: 'Williams Electric', amount: 6200, age: '1d', owner: 'AP', priority: 'Warning' },
  { type: 'Budget Revision', project: 'PRJ-042', item: 'BR-91 Cost code reallocation', amount: 32100, age: '6h', owner: 'Project Accountant', priority: 'Critical' },
];

const projects = [
  {
    id: 'PRJ-042',
    name: 'Elm Street Custom Home',
    pm: 'Alyssa Kent',
    superintendent: 'Victor Hale',
    budget: 2480000,
    committed: 2316000,
    invoiced: 2189000,
    paid: 2014000,
    forecastAtCompletion: 2579000,
    variance: -99000,
  },
  {
    id: 'PRJ-051',
    name: 'Riverdale Spec #3',
    pm: 'Noah Briggs',
    superintendent: 'Trevor Diaz',
    budget: 1960000,
    committed: 1822000,
    invoiced: 1641000,
    paid: 1539000,
    forecastAtCompletion: 2034000,
    variance: -74000,
  },
  {
    id: 'PRJ-038',
    name: 'Lakewood Renovation',
    pm: 'Mina Clarke',
    superintendent: 'Ruben Shaw',
    budget: 1715000,
    committed: 1669000,
    invoiced: 1498000,
    paid: 1442000,
    forecastAtCompletion: 1761000,
    variance: -46000,
  },
];

const dailyLogs = [
  {
    project: 'PRJ-042 · Elm Street',
    weather: '63°F · Clear',
    crew: '28 field · 6 subs',
    blockers: 'Rebar delivery delayed by 2h; concrete pour shifted to 1:00 PM.',
    notes: [
      'PM: Need owner signature on revised stair detail before close of business.',
      'Super: Crew held 45 min waiting on pump truck routing approval.',
      'Controller: Timecards tagged to cost code 03-310 for overtime audit.',
    ],
  },
  {
    project: 'PRJ-051 · Riverdale Spec #3',
    weather: '61°F · Windy',
    crew: '16 field · 4 subs',
    blockers: 'Lift rental down; replacement ETA 3:30 PM.',
    notes: [
      'PM: Exterior framing remains on critical path through Friday.',
      'Ops: Added overtime request for tomorrow to recover sequence.',
      'Billing: Draw backup photos uploaded and linked to billing packet.',
    ],
  },
];

const pipeline = {
  leads: [
    { company: 'Northgate Holdings', stage: 'Qualified', next: 'Site walk Tue 9:00' },
    { company: 'Lakeview Estates', stage: 'Proposal Draft', next: 'Finalize scope alternates' },
    { company: 'Sable Ridge', stage: 'Negotiation', next: 'Value engineering review' },
  ],
  proposals: [
    { id: 'PROP-228', project: 'Elm ADU', amount: 685000, status: 'Sent' },
    { id: 'PROP-231', project: 'Northgate TI', amount: 1240000, status: 'Review' },
    { id: 'PROP-236', project: 'River Lot 12', amount: 912000, status: 'Won' },
  ],
  invoices: [
    { id: 'INV-2034', project: 'Northgate Draw #7', amount: 142800, status: 'Overdue 36d' },
    { id: 'INV-2048', project: 'Elm Draw #5', amount: 96500, status: 'Submitted' },
    { id: 'INV-2051', project: 'Lakewood CO Billing', amount: 27400, status: 'Draft' },
  ],
};

const controls = [
  { label: 'tenant_id isolation', status: 'Enforced in API contracts + request middleware', icon: ShieldCheck },
  { label: 'RLS policy coverage', status: 'Pending rollout for draw tables + audit logs', icon: Layers3 },
  { label: 'QuickBooks bi-directional sync', status: 'Bills, invoices, and payment status mapped', icon: DatabaseZap },
  { label: 'RBAC matrix', status: 'Owner/CFO, PM, Ops, Controller role scopes defined', icon: Users2 },
];

const priorityClass = {
  Critical: 'bg-danger/10 text-danger border-danger/20',
  Warning: 'bg-warn/10 text-warn border-warn/20',
};

function money(value) {
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function TonePill({ tone, text }) {
  const toneClass = tone === 'danger' ? 'bg-danger/10 text-danger border-danger/20' : tone === 'warn' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-ok/10 text-ok border-ok/20';
  return <span className={`text-[11px] px-2 py-0.5 rounded-full border ${toneClass}`}>{text}</span>;
}

export default function OperatingSystem() {
  const [view, setView] = useState('command');
  const [selectedProject, setSelectedProject] = useState(projects[0].id);

  const activeProject = useMemo(() => projects.find((p) => p.id === selectedProject) ?? projects[0], [selectedProject]);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-6">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(1200px 280px at 15% -10%, color-mix(in oklab, var(--color-brand-gold) 20%, transparent), transparent 70%)' }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
    <div className="space-y-3">
      <section className="bg-brand-card border border-brand-border rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-brand-gold font-semibold">Southeast Construction Group · Financial Command Center</p>
            <h1 className="display-title text-2xl lg:text-3xl font-semibold mt-2">One screen for cash, cost, approvals, and field execution.</h1>
            <p className="text-sm text-brand-muted mt-2 max-w-3xl">Designed to replace spreadsheet + QuickBooks + email loops with a decision-first operating surface for owners, PMs, and controllers.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[280px]">
            <MetricTile icon={Clock3} label="Open decisions" value="17" />
            <MetricTile icon={CheckCircle2} label="SLA this week" value="92%" />
            <MetricTile icon={ClipboardList} label="Ops logs posted" value="14" />
            <MetricTile icon={Building2} label="Active jobs" value="23" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {portfolioKpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-brand-border bg-brand-card p-3">
            <div className="flex items-center justify-between text-brand-muted text-xs">
              <span>{kpi.label}</span>
              <kpi.icon size={14} />
            </div>
            <p className="mt-2 text-lg font-semibold num">{kpi.value}</p>
            <div className="mt-2"><TonePill tone={kpi.tone} text={kpi.trend} /></div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-brand-border bg-brand-card p-2 sticky top-0 z-20 backdrop-blur-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {views.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`text-xs px-3 py-2 rounded-md border transition-colors ${view === tab.id ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-border text-brand-muted lg:hover:text-brand-text'}`}
            >
              {tab.label}
            </button>
      <section className="bg-brand-card border border-brand-border rounded-lg p-1.5 sticky top-0 z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {viewTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`px-2 py-2 text-xs rounded-md border ${activeView === tab.id ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-brand-border text-brand-muted hover:text-brand-text'}`}>{tab.label}</button>
          ))}
        </div>
      </section>

      {view === 'command' && (
        <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-3">
          <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FolderKanban size={15} className="text-brand-gold" />Real-time job costing: budget vs actual vs forecast</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="uppercase text-brand-muted text-left border-b border-brand-border">
                    <th className="pb-2">Project</th>
                    <th className="pb-2 num">Budget</th>
                    <th className="pb-2 num">Committed</th>
                    <th className="pb-2 num">Invoiced</th>
                    <th className="pb-2 num">Forecast EAC</th>
                    <th className="pb-2 num">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-brand-border/60 lg:hover:bg-brand-card-hover cursor-pointer" onClick={() => setSelectedProject(project.id)}>
                      <td className="py-2">
                        <p className="font-medium">{project.id}</p>
                        <p className="text-brand-muted">{project.name}</p>
                      </td>
                      <td className="py-2 num">{money(project.budget)}</td>
                      <td className="py-2 num">{money(project.committed)}</td>
                      <td className="py-2 num">{money(project.invoiced)}</td>
                      <td className="py-2 num">{money(project.forecastAtCompletion)}</td>
                      <td className="py-2 num text-danger">({money(Math.abs(project.variance))})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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


          <div className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><HandCoins size={15} className="text-brand-gold" />Project decision lens</h3>
            <div className="border border-brand-border rounded-lg p-3">
              <p className="text-xs text-brand-muted">Active project</p>
              <p className="font-semibold text-sm mt-1">{activeProject.id} · {activeProject.name}</p>
              <p className="text-xs mt-2">PM: {activeProject.pm}</p>
              <p className="text-xs">Superintendent: {activeProject.superintendent}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <DataBox label="Paid to date" value={money(activeProject.paid)} />
              <DataBox label="Cost variance" value={`(${money(Math.abs(activeProject.variance))})`} tone="danger" />
              <DataBox label="Budget remaining" value={money(activeProject.budget - activeProject.paid)} />
              <DataBox label="Forecast overrun" value={`${((Math.abs(activeProject.variance) / activeProject.budget) * 100).toFixed(1)}%`} tone="warn" />
            </div>
          </div>
        </section>
      )}

      {view === 'queue' && (
        <section className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-3">
          <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ClipboardList size={15} className="text-brand-gold" />Linear-style finance decision queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="uppercase text-brand-muted text-left border-b border-brand-border">
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Project</th>
                    <th className="pb-2">Item</th>
                    <th className="pb-2 num">Amount</th>
                    <th className="pb-2">Age</th>
                    <th className="pb-2">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionQueue.map((row) => (
                    <tr key={row.item} className="border-b border-brand-border/60 lg:hover:bg-brand-card-hover">
                      <td className="py-2"><span className={`text-[11px] px-2 py-0.5 rounded border ${priorityClass[row.priority]}`}>{row.priority}</span></td>
                      <td className="py-2">{row.type}</td>
                      <td className="py-2">{row.project}</td>
                      <td className="py-2 font-medium">{row.item}</td>
                      <td className="py-2 num">{money(row.amount)}</td>
                      <td className="py-2 text-brand-muted">{row.age}</td>
                      <td className="py-2 text-brand-muted">{row.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><ShieldCheck size={15} className="text-brand-gold" />Architecture controls</h3>
            {controls.map((control) => {
              const Icon = control.icon;
              return (
                <div key={control.label} className="border border-brand-border rounded-lg p-3">
                  <p className="text-xs font-medium flex items-center gap-2"><Icon size={14} className="text-brand-gold" />{control.label}</p>
                  <p className="text-xs text-brand-muted mt-1">{control.status}</p>
                </div>
              );
            })}
          </div>
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

      {view === 'ops' && (
        <section className="space-y-3">
          <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><MessageSquareMore size={15} className="text-brand-gold" />Buildertrend-style daily logs (PM + field + finance aligned)</h3>
            <p className="text-xs text-brand-muted mt-1">Every field note can drive cost-code impact, billing evidence, and next-day execution plans without leaving this screen.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {dailyLogs.map((log) => (
              <article key={log.project} className="rounded-xl border border-brand-border bg-brand-card p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{log.project}</h4>
                  <span className="text-[11px] text-brand-muted">Today</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <DataBox label="Weather" value={log.weather} />
                  <DataBox label="Crew" value={log.crew} />
                </div>
                <div className="border border-brand-border rounded-md p-2 mt-2 text-xs">
                  <p className="text-brand-muted">Blockers</p>
                  <p className="mt-1 font-medium">{log.blockers}</p>
                </div>
                <div className="mt-3 space-y-1">
                  {log.notes.map((note) => (
                    <p key={note} className="text-xs bg-brand-surface rounded-md px-2 py-1.5">{note}</p>
                  ))}
                </div>
              </article>
            ))}
          <div className="bg-brand-card border border-brand-border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">1) Drivers</p>{module.drivers.map((d) => <button key={d.id} onClick={() => { setDriverId(d.id); setRecordId(''); }} className={`w-full text-left text-xs px-2 py-2 rounded border mb-2 ${driverId === d.id ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}>{d.label}</button>)}</div>
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">2) Records</p>{driver ? driver.records.map((r) => <button key={r.id} onClick={() => setRecordId(r.id)} className={`w-full text-left text-xs px-2 py-2 rounded border mb-2 ${recordId === r.id ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}><div className="font-medium">{r.label}</div><div className="text-brand-muted">{r.rootCause}</div></button>) : <p className="text-xs text-brand-muted">Pick a driver.</p>}</div>
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">3) Transactions</p>{record ? record.transactions.map((t) => <button key={t} onClick={() => setSelectedTransaction(t)} className={`w-full text-left text-xs px-2 py-2 rounded border mb-2 ${selectedTransaction === t ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border'}`}>{t}</button>) : <p className="text-xs text-brand-muted">Pick a record.</p>}</div>
            <div className="border border-brand-border rounded-lg p-3"><p className="text-xs font-semibold mb-2">4) Actions</p><div className="flex flex-wrap gap-2">{['Flag Risk', 'Assign Owner', 'Approve', 'Escalate', 'Update Forecast'].map((a) => <button key={a} onClick={() => handleAction(a)} className="text-xs px-2 py-1 rounded border border-brand-border hover:border-brand-gold">{a}</button>)}</div><div className="mt-2 space-y-1">{actionLog.slice(0, 4).map((l) => <p className="text-[11px]" key={l}>• {l}</p>)}</div></div>
          </div>
        </section>
      )}

      {view === 'pipeline' && (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users2 size={15} className="text-brand-gold" />Leads</h3>
            <div className="space-y-2">
              {pipeline.leads.map((lead) => (
                <div key={lead.company} className="border border-brand-border rounded-md p-2 text-xs">
                  <p className="font-medium">{lead.company}</p>
                  <p className="text-brand-muted mt-1">{lead.stage}</p>
                  <p className="mt-1">Next: {lead.next}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText size={15} className="text-brand-gold" />Proposals</h3>
            <div className="space-y-2">
              {pipeline.proposals.map((proposal) => (
                <div key={proposal.id} className="border border-brand-border rounded-md p-2 text-xs">
                  <p className="font-medium">{proposal.id} · {proposal.project}</p>
                  <p className="num mt-1">{money(proposal.amount)}</p>
                  <p className="text-brand-muted mt-1">Status: {proposal.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-brand-gold" />Invoices</h3>
            <div className="space-y-2">
              {pipeline.invoices.map((invoice) => (
                <div key={invoice.id} className="border border-brand-border rounded-md p-2 text-xs">
                  <p className="font-medium">{invoice.id} · {invoice.project}</p>
                  <p className="num mt-1">{money(invoice.amount)}</p>
                  <p className="text-brand-muted mt-1">{invoice.status}</p>
                </div>
              ))}
            </div>
          </div>
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

      <section className="rounded-xl border border-brand-border bg-brand-card p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><ArrowRight size={14} className="text-brand-gold" />QuickBooks bidirectional workflow map</h3>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {['Estimate', 'Budget', 'Commitments', 'Invoices', 'Payments', 'Forecast'].map((step, index, all) => (
            <div key={step} className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md border border-brand-border bg-brand-surface">{step}</span>
              {index < all.length - 1 && <ArrowRight size={12} className="text-brand-muted" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2">
      <div className="flex items-center justify-between text-[11px] text-brand-muted">
        <span>{label}</span>
        <Icon size={13} />
      </div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}

function DataBox({ label, value, tone }) {
  const toneClass = tone === 'danger' ? 'text-danger' : tone === 'warn' ? 'text-warn' : 'text-brand-text';
  return (
    <div className="border border-brand-border rounded-md p-2 text-xs">
      <p className="text-brand-muted">{label}</p>
      <p className={`mt-1 font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}
