import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, X } from 'lucide-react';
import { money } from '../lib/format';
import { PROJECTS, STATUS_COLOR, STATUS_LABEL } from '../lib/demoData';

const COST_CODES = {
  default: [
    { trade: 'Sitework',    budget: 18000,  committed: 18000,  spent: 18000,  pct: 100 },
    { trade: 'Concrete',    budget: 42000,  committed: 42000,  spent: 38400,  pct: 91  },
    { trade: 'Framing',     budget: 95000,  committed: 95000,  spent: 78200,  pct: 82  },
    { trade: 'Roofing',     budget: 28000,  committed: 28000,  spent: 0,      pct: 0   },
    { trade: 'Plumbing',    budget: 38000,  committed: 22000,  spent: 18400,  pct: 48  },
    { trade: 'HVAC',        budget: 34000,  committed: 18000,  spent: 8200,   pct: 24  },
    { trade: 'Electrical',  budget: 36000,  committed: 20000,  spent: 14200,  pct: 39  },
    { trade: 'Drywall',     budget: 28000,  committed: 0,      spent: 0,      pct: 0   },
    { trade: 'Painting',    budget: 18000,  committed: 0,      spent: 0,      pct: 0   },
    { trade: 'Insulation',  budget: 12000,  committed: 0,      spent: 0,      pct: 0   },
    { trade: 'Finishes',    budget: 38400,  committed: 0,      spent: 0,      pct: 0   },
    { trade: 'Overhead',    budget: 18500,  committed: 18500,  spent: 12000,  pct: 65  },
  ],
  5: [
    { trade: 'Demo',        budget: 8000,   committed: 8000,   spent: 8000,   pct: 100 },
    { trade: 'Concrete',    budget: 12000,  committed: 14400,  spent: 14400,  pct: 120 },
    { trade: 'Framing',     budget: 28000,  committed: 30000,  spent: 29800,  pct: 106 },
    { trade: 'Roofing',     budget: 0,      committed: 0,      spent: 0,      pct: 0   },
    { trade: 'Plumbing',    budget: 18000,  committed: 19200,  spent: 18400,  pct: 102 },
    { trade: 'HVAC',        budget: 16000,  committed: 17800,  spent: 17800,  pct: 111 },
    { trade: 'Electrical',  budget: 22000,  committed: 26400,  spent: 24200,  pct: 110 },
    { trade: 'Drywall',     budget: 14000,  committed: 14200,  spent: 14200,  pct: 101 },
    { trade: 'Painting',    budget: 8000,   committed: 9200,   spent: 8800,   pct: 110 },
    { trade: 'Flooring',    budget: 18000,  committed: 20000,  spent: 19800,  pct: 110 },
    { trade: 'Overhead',    budget: 18000,  committed: 18800,  spent: 18800,  pct: 104 },
  ],
};

const TRANSACTIONS_DATA = [
  { date: '2026-02-18', vendor: 'Miller Concrete',   desc: 'Foundation pour — Phase 2',           amount: 14200, code: 'Concrete',   status: 'paid' },
  { date: '2026-02-15', vendor: 'Thompson Framing',  desc: 'Framing labor — Week 6',              amount: 18400, code: 'Framing',    status: 'paid' },
  { date: '2026-02-12', vendor: '84 Lumber',         desc: 'Lumber delivery — 2x10 joists',       amount: 8240,  code: 'Framing',    status: 'pending' },
  { date: '2026-02-10', vendor: 'Davis Plumbing',    desc: 'Rough-in labor — bathrooms',          amount: 6800,  code: 'Plumbing',   status: 'paid' },
  { date: '2026-02-08', vendor: 'Williams Electric', desc: 'Rough-in electrical — main floor',    amount: 7200,  code: 'Electrical', status: 'paid' },
  { date: '2026-02-05', vendor: 'Clark HVAC',        desc: 'Duct rough-in — 1st floor',           amount: 8200,  code: 'HVAC',       status: 'paid' },
  { date: '2026-02-01', vendor: 'Thompson Framing',  desc: 'Framing labor — Week 5',              amount: 18400, code: 'Framing',    status: 'paid' },
  { date: '2026-01-28', vendor: 'Miller Concrete',   desc: 'Slab flatwork — garage',              amount: 6400,  code: 'Concrete',   status: 'paid' },
  { date: '2026-01-22', vendor: 'Thompson Framing',  desc: 'LVL beams — main span',               amount: 12800, code: 'Framing',    status: 'paid' },
  { date: '2026-01-18', vendor: 'Davis Plumbing',    desc: 'Underground rough-in',                amount: 4800,  code: 'Plumbing',   status: 'paid' },
  { date: '2026-01-14', vendor: 'Earthworks Inc',    desc: 'Sitework grading complete',           amount: 18000, code: 'Sitework',   status: 'paid' },
  { date: '2026-01-10', vendor: 'Miller Concrete',   desc: 'Foundation walls — north/west',       amount: 11400, code: 'Concrete',   status: 'paid' },
  { date: '2025-12-20', vendor: 'City of Murfreesboro', desc: 'Building permit fee',              amount: 3200,  code: 'Overhead',   status: 'paid' },
];

const MILESTONES_DATA = [
  { name: 'Permitting',            planned: '2025-09-30', actual: '2025-10-02', status: 'complete' },
  { name: 'Site Prep',             planned: '2025-10-10', actual: '2025-10-08', status: 'complete' },
  { name: 'Foundation',            planned: '2025-10-28', actual: '2025-10-30', status: 'complete' },
  { name: 'Framing Start',         planned: '2025-11-10', actual: '2025-11-12', status: 'complete' },
  { name: 'Rough MEP',             planned: '2026-01-05', actual: '2026-01-08', status: 'complete' },
  { name: 'Framing Complete',      planned: '2026-02-15', actual: null,          status: 'in_progress' },
  { name: 'Rough Inspections',     planned: '2026-03-01', actual: null,          status: 'pending' },
  { name: 'Insulation',            planned: '2026-03-10', actual: null,          status: 'pending' },
  { name: 'Drywall',               planned: '2026-03-20', actual: null,          status: 'pending' },
  { name: 'Finishes',              planned: '2026-04-15', actual: null,          status: 'pending' },
  { name: 'Punch List',            planned: '2026-05-15', actual: null,          status: 'pending' },
  { name: 'Certificate of Occupancy', planned: '2026-05-30', actual: null,       status: 'pending' },
];

const DAILY_LOGS_DATA = [
  { date: '2026-02-22', author: 'Connor Mitchell', weather: 'Partly Cloudy 42°F', crew: 8, summary: 'Framing crew completed 2nd floor joist installation. Stair rough framing started.', issues: 'Delivery of stair stringers delayed — rescheduled for Mon 2/24.' },
  { date: '2026-02-21', author: 'Connor Mitchell', weather: 'Clear 38°F',          crew: 8, summary: 'Continued 2nd floor framing. Exterior sheathing 40% complete on north and east walls.', issues: '' },
  { date: '2026-02-20', author: 'Connor Mitchell', weather: 'Overcast 44°F',       crew: 6, summary: 'Interior wall framing — master suite and bedrooms. Davis Plumbing on site for rough-in coordination.', issues: '' },
  { date: '2026-02-19', author: 'Connor Mitchell', weather: 'Rain 40°F',           crew: 4, summary: 'Rain stopped exterior work. Interior blocking and backing for plumbing fixtures completed.', issues: 'Lost approx 4 hours due to rain. No schedule impact expected.' },
  { date: '2026-02-18', author: 'Connor Mitchell', weather: 'Clear 50°F',          crew: 8, summary: 'Miller Concrete on site — garage slab flatwork completed. Framing crew continued 1st floor interior walls.', issues: '' },
  { date: '2026-02-17', author: 'Connor Mitchell', weather: 'Clear 55°F',          crew: 8, summary: 'Full framing crew. 1st floor exterior walls complete. LVL beam installation at main span.', issues: '' },
  { date: '2026-02-14', author: 'Connor Mitchell', weather: 'Cloudy 46°F',         crew: 7, summary: 'Thompson Framing — set LVL beams, header installation. Williams Electric traced conduit routes.', issues: '' },
  { date: '2026-02-13', author: 'Connor Mitchell', weather: 'Clear 52°F',          crew: 8, summary: 'Framing walls — living room, kitchen, pantry. Owner visited site for walk-through.', issues: '' },
];

const CHANGE_ORDERS_DATA = {
  default: [
    { co: 'CO-001', desc: 'Owner added rear deck — 400 SF composite', amount: 18400, status: 'approved', date: '2025-12-10', requested_by: 'Owner' },
    { co: 'CO-002', desc: 'Upgrade kitchen island to quartz countertop', amount: 4200, status: 'approved', date: '2026-01-08', requested_by: 'Owner' },
    { co: 'CO-003', desc: 'Additional exterior outlets — 6 locations',  amount: 2100, status: 'pending',  date: '2026-02-14', requested_by: 'Connor Mitchell' },
  ],
  5: [
    { co: 'CO-001', desc: 'Electrical panel upgrade — 400A service',   amount: 8400,  status: 'approved', date: '2025-08-20', requested_by: 'PM' },
    { co: 'CO-002', desc: 'Flooring change — LVP upgrade',             amount: 3200,  status: 'approved', date: '2025-09-15', requested_by: 'Owner' },
    { co: 'CO-003', desc: 'ADA restroom upgrade — additional scope',    amount: 12800, status: 'approved', date: '2025-10-01', requested_by: 'Owner' },
    { co: 'CO-004', desc: 'Overhead door — dock leveler installation',  amount: 6400,  status: 'rejected', date: '2025-11-10', requested_by: 'Owner' },
  ],
};

const DOCUMENTS_DATA = [
  { name: 'Prime Contract',                 type: 'Contract',   uploaded: 'Matt Seibert',    date: '2025-09-15', size: '2.1 MB' },
  { name: 'Architectural Plans — Rev 3',    type: 'Plans',      uploaded: 'Connor Mitchell', date: '2025-10-01', size: '18.4 MB' },
  { name: 'Building Permit #2025-4821',     type: 'Permit',     uploaded: 'Connor Mitchell', date: '2025-10-02', size: '0.4 MB' },
  { name: 'Thompson Framing Subcontract',   type: 'Contract',   uploaded: 'Samuel Carson',   date: '2025-11-01', size: '0.8 MB' },
  { name: 'Structural Engineering Calcs',   type: 'Submittal',  uploaded: 'Connor Mitchell', date: '2025-10-20', size: '5.2 MB' },
  { name: 'Foundation Inspection — Pass',   type: 'Inspection', uploaded: 'Connor Mitchell', date: '2025-10-30', size: '0.2 MB' },
  { name: 'Framing Photos — Week 6',        type: 'Photos',     uploaded: 'Connor Mitchell', date: '2026-02-22', size: '42.8 MB' },
  { name: 'Owner Change Order Log',         type: 'Report',     uploaded: 'Samuel Carson',   date: '2026-02-01', size: '0.3 MB' },
  { name: 'COI — Thompson Framing',         type: 'Insurance',  uploaded: 'Samuel Carson',   date: '2025-11-01', size: '0.5 MB' },
];

const TABS = ['Overview', 'Cost Detail', 'Schedule', 'Daily Logs', 'Change Orders', 'Documents'];
const CO_COLOR   = { approved: 'var(--status-profit)', pending: 'var(--status-warning)', rejected: 'var(--status-loss)' };
const MS_COLOR   = { complete: 'var(--status-profit)', in_progress: '#3b82f6', pending: 'var(--text-tertiary)' };
const DOC_COLOR  = { Contract: '#3b82f6', Plans: '#8b5cf6', Permit: '#f59e0b', Submittal: '#06b6d4', Inspection: '#10b981', Photos: '#ec4899', Report: '#64748b', Insurance: '#f97316' };

function DocModal({ doc, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: 28, maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{doc.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[['Type', doc.type],['Uploaded By', doc.uploaded],['Date', doc.date],['Size', doc.size]].map(([k,v]) => (
            <div key={k} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Document preview — demo mode</span>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Close</button>
          <button onClick={() => alert('Download triggered (demo)')} style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Download</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initTab = searchParams.get('tab') === 'costs' ? 'Cost Detail' : searchParams.get('tab') === 'cos' ? 'Change Orders' : 'Overview';
  const [tab, setTab]         = useState(initTab);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [txSearch, setTxSearch]       = useState('');
  const [expandedLog, setExpandedLog] = useState(null);

  const project = PROJECTS.find(p => p.id === Number(id)) || PROJECTS[0];
  const sc           = STATUS_COLOR[project.status] || STATUS_COLOR.on_budget;
  const costCodes    = COST_CODES[project.id]   || COST_CODES.default;
  const changeOrders = CHANGE_ORDERS_DATA[project.id] || CHANGE_ORDERS_DATA.default;
  const totalBudget  = costCodes.reduce((s, c) => s + c.budget, 0);
  const totalSpent   = costCodes.reduce((s, c) => s + c.spent, 0);
  const coTotal      = changeOrders.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0);
  const transactions = TRANSACTIONS_DATA.filter(tx =>
    !txSearch.trim() || tx.vendor.toLowerCase().includes(txSearch.toLowerCase()) || tx.code.toLowerCase().includes(txSearch.toLowerCase())
  );

  const kpis = [
    { label: 'Contract Value',   value: money(project.contract) },
    { label: 'Cost to Date',     value: money(project.spent) },
    { label: 'Remaining Budget', value: money(totalBudget - totalSpent) },
    { label: 'Gross Margin',     value: `${project.margin_pct}%` },
    { label: 'Change Orders',    value: money(coTotal, true) },
    { label: 'Completion',       value: `${project.pct}%` },
  ];

  const thBase = { padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left' };

  return (
    <div className="space-y-5">
      {selectedDoc && <DocModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}

      <div>
        <button onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Back to Jobs
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{project.name}</h1>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: sc.bg, color: sc.color }}>{STATUS_LABEL[project.status]}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>{project.phase}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5 }}>{project.address}  ·  PM: {project.pm}  ·  {project.code}</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-brand-border)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
            border: 'none', background: 'transparent', whiteSpace: 'nowrap',
            color: tab === t ? '#3b82f6' : 'var(--text-secondary)',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'Overview' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[['Trade','left'],['Budget','right'],['Committed','right'],['Spent','right'],['Variance','right'],['Used %','left']].map(([h, align]) => (
                  <th key={h} style={{ ...thBase, textAlign: align }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costCodes.map(c => {
                const variance = c.budget - c.spent;
                const barPct   = Math.min(100, (c.budget > 0 ? (c.spent / c.budget) * 100 : 0));
                const isOver   = c.spent > c.budget;
                return (
                  <tr key={c.trade} style={{ borderTop: '1px solid var(--color-brand-border)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.trade}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(c.budget)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(c.committed)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(c.spent)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', fontWeight: isOver ? 700 : 400, color: isOver ? 'var(--status-loss)' : variance === 0 ? 'var(--text-secondary)' : 'var(--status-profit)' }}>{money(variance)}</td>
                    <td style={{ padding: '11px 14px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${Math.min(100,barPct)}%`, borderRadius: 3, background: isOver ? 'var(--status-loss)' : barPct > 85 ? 'var(--status-warning)' : 'var(--status-profit)' }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace', width: 35, textAlign: 'right' }}>{c.pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>TOTAL</td>
                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalBudget)}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(costCodes.reduce((s,c)=>s+c.committed,0))}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalSpent)}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: totalBudget - totalSpent < 0 ? 'var(--status-loss)' : 'var(--status-profit)' }}>{money(totalBudget - totalSpent)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Cost Detail */}
      {tab === 'Cost Detail' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-brand-border)' }}>
            <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Filter by vendor or cost code..." style={{ width: '100%', padding: '7px 12px', borderRadius: 7, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[['Date','left'],['Vendor','left'],['Description','left'],['Amount','right'],['Cost Code','left'],['Status','left']].map(([h,a]) => (
                  <th key={h} style={{ ...thBase, textAlign: a }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{tx.date}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{tx.vendor}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{tx.desc}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right', whiteSpace: 'nowrap' }}>{money(tx.amount)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{tx.code}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: tx.status === 'paid' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)', color: tx.status === 'paid' ? 'var(--status-profit)' : 'var(--status-warning)' }}>
                      {tx.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Schedule */}
      {tab === 'Schedule' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Milestone','Planned Date','Actual Date','Status'].map(h => <th key={h} style={thBase}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {MILESTONES_DATA.map((m, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: MS_COLOR[m.status], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: m.status === 'in_progress' ? 600 : 400 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{m.planned}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: m.actual ? 'var(--status-profit)' : 'var(--text-tertiary)' }}>{m.actual || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: m.status === 'complete' ? 'rgba(52,211,153,0.12)' : m.status === 'in_progress' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)', color: MS_COLOR[m.status] }}>
                      {m.status === 'complete' ? 'Complete' : m.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Daily Logs */}
      {tab === 'Daily Logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DAILY_LOGS_DATA.map((log, i) => (
            <div key={i} style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
              <div onClick={() => setExpandedLog(expandedLog === i ? null : i)} style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{log.date}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.author}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{log.weather}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Crew: {log.crew}</span>
                </div>
                {expandedLog === i ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />}
              </div>
              {expandedLog === i && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-brand-border)' }}>
                  <div style={{ paddingTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-tertiary)', marginBottom: 6 }}>Work Performed</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{log.summary}</div>
                    {log.issues && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--status-warning)', marginBottom: 6 }}>Issues / Notes</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{log.issues}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Change Orders */}
      {tab === 'Change Orders' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[['CO #','left'],['Description','left'],['Requested By','left'],['Amount','right'],['Status','left'],['Date','left']].map(([h,a]) => (
                  <th key={h} style={{ ...thBase, textAlign: a }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((co, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{co.co}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)' }}>{co.desc}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{co.requested_by}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right' }}>{money(co.amount)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: co.status === 'approved' ? 'rgba(52,211,153,0.12)' : co.status === 'rejected' ? 'rgba(251,113,133,0.12)' : 'rgba(251,191,36,0.12)', color: CO_COLOR[co.status] }}>
                      {co.status.charAt(0).toUpperCase() + co.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{co.date}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                <td colSpan={3} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>APPROVED TOTAL</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(coTotal)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Documents */}
      {tab === 'Documents' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name','Type','Uploaded By','Date','Size'].map(h => <th key={h} style={thBase}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS_DATA.map((doc, i) => (
                <tr key={i} onClick={() => setSelectedDoc(doc)} style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#3b82f6', fontWeight: 500 }}>{doc.name}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${DOC_COLOR[doc.type] || '#64748b'}22`, color: DOC_COLOR[doc.type] || '#64748b' }}>{doc.type}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{doc.uploaded}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{doc.date}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-tertiary)' }}>{doc.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
