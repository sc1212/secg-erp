import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, moneyExact, pct, shortDate, statusBadge } from '../lib/format';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import { ArrowLeft, FileText, DollarSign, ClipboardList, Calendar, AlertTriangle } from 'lucide-react';

const tabs = [
  { key: 'costs', label: 'Cost Codes', icon: DollarSign },
  { key: 'sov', label: 'Schedule of Values', icon: FileText },
  { key: 'draws', label: 'Pay Apps', icon: ClipboardList },
  { key: 'cos', label: 'Change Orders', icon: AlertTriangle },
  { key: 'milestones', label: 'Schedule', icon: Calendar },
];

// Demo project detail
const demoProject = {
  id: 1, code: 'PRJ-042', name: '2847 Elm Street Renovation', status: 'active',
  project_type: 'remodel', budget_total: 120000, contract_amount: 145000,
  estimated_cost: 118000, project_manager: 'Matt S.', superintendent: 'Jake R.',
  start_date: '2025-09-15', target_completion: '2026-04-01',
  cost_codes: [
    { id: 1, code: '01-100', description: 'General Conditions', budget_amount: 12000, committed_amount: 11200, actual_amount: 9800, variance: 2200, category: 'General' },
    { id: 2, code: '03-100', description: 'Concrete & Foundation', budget_amount: 18000, committed_amount: 17500, actual_amount: 17500, variance: 500, category: 'Structure' },
    { id: 3, code: '22-100', description: 'Plumbing Rough-In', budget_amount: 15000, committed_amount: 14200, actual_amount: 8500, variance: 6500, category: 'MEP' },
    { id: 4, code: '26-100', description: 'Electrical', budget_amount: 14000, committed_amount: 13800, actual_amount: 12100, variance: 1900, category: 'MEP' },
    { id: 5, code: '09-100', description: 'Drywall & Paint', budget_amount: 16000, committed_amount: 0, actual_amount: 0, variance: 16000, category: 'Finishes' },
  ],
  sov_lines: [
    { id: 1, line_number: 1, description: 'Demolition', scheduled_value: 12000, previous_billed: 12000, current_billed: 0, stored_materials: 0, percent_complete: 100, balance_to_finish: 0 },
    { id: 2, line_number: 2, description: 'Foundation', scheduled_value: 18000, previous_billed: 18000, current_billed: 0, stored_materials: 0, percent_complete: 100, balance_to_finish: 0 },
    { id: 3, line_number: 3, description: 'Framing', scheduled_value: 25000, previous_billed: 20000, current_billed: 5000, stored_materials: 0, percent_complete: 100, balance_to_finish: 0 },
    { id: 4, line_number: 4, description: 'Plumbing', scheduled_value: 15000, previous_billed: 8500, current_billed: 0, stored_materials: 0, percent_complete: 56.7, balance_to_finish: 6500 },
  ],
  pay_apps: [
    { id: 1, pay_app_number: 1, amount_requested: 30000, amount_approved: 30000, retainage_held: 3000, net_payment: 27000, status: 'paid', submitted_date: '2025-10-15', paid_date: '2025-10-28' },
    { id: 2, pay_app_number: 2, amount_requested: 38500, amount_approved: 38500, retainage_held: 3850, net_payment: 34650, status: 'paid', submitted_date: '2025-12-01', paid_date: '2025-12-18' },
    { id: 3, pay_app_number: 3, amount_requested: 41400, amount_approved: 41400, retainage_held: 4140, net_payment: 37260, status: 'approved', submitted_date: '2026-02-01', approved_date: '2026-02-15' },
  ],
  change_orders: [
    { id: 1, co_number: 'CO-001', title: 'Add powder room plumbing', amount: 4200, status: 'approved', date_submitted: '2025-11-20', date_approved: '2025-11-25' },
    { id: 2, co_number: 'CO-002', title: 'Upgrade electrical panel to 400A', amount: 3800, status: 'pending_approval', date_submitted: '2026-02-10' },
  ],
  milestones: [
    { id: 1, task_name: 'Demolition', status: 'completed', planned_start: '2025-09-15', planned_end: '2025-09-30', actual_start: '2025-09-15', actual_end: '2025-09-28' },
    { id: 2, task_name: 'Foundation', status: 'completed', planned_start: '2025-10-01', planned_end: '2025-10-20', actual_start: '2025-10-01', actual_end: '2025-10-22' },
    { id: 3, task_name: 'Framing', status: 'completed', planned_start: '2025-10-23', planned_end: '2025-11-20', actual_start: '2025-10-23', actual_end: '2025-11-18' },
    { id: 4, task_name: 'MEP Rough-In', status: 'in_progress', planned_start: '2025-11-21', planned_end: '2026-01-15', actual_start: '2025-11-20' },
    { id: 5, task_name: 'Drywall & Paint', status: 'not_started', planned_start: '2026-01-16', planned_end: '2026-02-28' },
    { id: 6, task_name: 'Finishes & Punch', status: 'not_started', planned_start: '2026-03-01', planned_end: '2026-04-01' },
  ],
};

const milestoneColor = {
  completed: 'bg-ok', in_progress: 'bg-brand-gold', not_started: 'bg-brand-border', delayed: 'bg-warn', blocked: 'bg-danger',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('costs');
  const { data, loading, error, refetch } = useApi(() => api.project(id), [id]);

  const project = data || demoProject;

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  const spent = project.cost_codes?.reduce((s, c) => s + Number(c.actual_amount || 0), 0) || 0;
  const budgetPct = project.budget_total ? ((spent / Number(project.budget_total)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-gold transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-brand-gold">{project.code}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(project.status)}`}>
                {project.status?.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-brand-muted">
              <span>PM: <b className="text-brand-text">{project.project_manager}</b></span>
              {project.superintendent && <span>Super: <b className="text-brand-text">{project.superintendent}</b></span>}
              <span>{shortDate(project.start_date)} → {shortDate(project.target_completion)}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-xs text-brand-muted">Budget</div>
              <div className="text-lg font-bold">{money(project.budget_total)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-brand-muted">Contract</div>
              <div className="text-lg font-bold">{money(project.contract_amount)}</div>
            </div>
          </div>
        </div>

        {/* Budget bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-brand-muted mb-1">
            <span>Spent: {money(spent)}</span>
            <span>{pct(budgetPct)} of budget</span>
          </div>
          <div className="h-2 bg-brand-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-danger' : budgetPct > 75 ? 'bg-warn' : 'bg-brand-gold'}`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-brand-border pb-px">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === key
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'costs' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3 pr-4 text-right">Budget</th>
                <th className="pb-3 pr-4 text-right">Committed</th>
                <th className="pb-3 pr-4 text-right">Actual</th>
                <th className="pb-3 text-right">Variance</th>
              </tr>
            </thead>
            <tbody>
              {(project.cost_codes || []).map((c) => (
                <tr key={c.id} className="border-b border-brand-border/50 hover:bg-brand-card-hover">
                  <td className="py-3 pr-4 font-mono text-brand-gold text-xs">{c.code}</td>
                  <td className="py-3 pr-4">{c.description}</td>
                  <td className="py-3 pr-4 text-right">{moneyExact(c.budget_amount)}</td>
                  <td className="py-3 pr-4 text-right">{moneyExact(c.committed_amount)}</td>
                  <td className="py-3 pr-4 text-right">{moneyExact(c.actual_amount)}</td>
                  <td className={`py-3 text-right font-medium ${Number(c.variance) < 0 ? 'text-danger' : 'text-ok'}`}>
                    {moneyExact(c.variance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sov' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                <th className="pb-3 pr-4">#</th>
                <th className="pb-3 pr-4">Description</th>
                <th className="pb-3 pr-4 text-right">Scheduled Value</th>
                <th className="pb-3 pr-4 text-right">Prev Billed</th>
                <th className="pb-3 pr-4 text-right">Current</th>
                <th className="pb-3 pr-4 text-right">% Complete</th>
                <th className="pb-3 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {(project.sov_lines || []).map((l) => (
                <tr key={l.id} className="border-b border-brand-border/50 hover:bg-brand-card-hover">
                  <td className="py-3 pr-4 text-brand-muted">{l.line_number}</td>
                  <td className="py-3 pr-4">{l.description}</td>
                  <td className="py-3 pr-4 text-right">{moneyExact(l.scheduled_value)}</td>
                  <td className="py-3 pr-4 text-right">{moneyExact(l.previous_billed)}</td>
                  <td className="py-3 pr-4 text-right">{moneyExact(l.current_billed)}</td>
                  <td className="py-3 pr-4 text-right">{pct(l.percent_complete)}</td>
                  <td className="py-3 text-right">{moneyExact(l.balance_to_finish)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'draws' && (
        <div className="space-y-3">
          {(project.pay_apps || []).map((d) => (
            <div key={d.id} className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Draw #{d.pay_app_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(d.status)}`}>{d.status}</span>
                  </div>
                  <div className="text-xs text-brand-muted mt-1">
                    Submitted: {shortDate(d.submitted_date)} {d.paid_date && `• Paid: ${shortDate(d.paid_date)}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{moneyExact(d.net_payment)}</div>
                  <div className="text-xs text-brand-muted">Retainage: {moneyExact(d.retainage_held)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'cos' && (
        <div className="space-y-3">
          {(project.change_orders || []).length === 0 ? (
            <EmptyState title="No change orders" />
          ) : (project.change_orders || []).map((co) => (
            <div key={co.id} className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-brand-gold">{co.co_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(co.status)}`}>{co.status?.replace('_', ' ')}</span>
                  </div>
                  <div className="font-medium mt-1">{co.title}</div>
                  <div className="text-xs text-brand-muted mt-1">Submitted: {shortDate(co.date_submitted)}</div>
                </div>
                <div className="text-right font-bold text-lg">{moneyExact(co.amount)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'milestones' && (
        <div className="space-y-2">
          {(project.milestones || []).map((m) => (
            <div key={m.id} className="flex items-center gap-4 bg-brand-card border border-brand-border rounded-lg px-5 py-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${milestoneColor[m.status] || 'bg-brand-border'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{m.task_name}</div>
                <div className="text-xs text-brand-muted">
                  {shortDate(m.planned_start)} → {shortDate(m.planned_end)}
                  {m.actual_end && <span className="text-ok ml-2">Done: {shortDate(m.actual_end)}</span>}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(m.status)}`}>
                {m.status?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
