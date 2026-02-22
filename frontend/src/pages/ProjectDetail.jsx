import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, pct, shortDate, statusBadge } from '../lib/format';
import { PageLoading, ErrorState } from '../components/LoadingState';
import {
  ArrowLeft, DollarSign, FileText, ClipboardList, Calendar,
  AlertTriangle, Gavel, Receipt, TrendingUp, BarChart3, GitCommit, Scale,
} from 'lucide-react';

import { demoProject } from '../components/jobcosting/demoData';
import CostCodesTab from '../components/jobcosting/CostCodesTab';
import BidsQuotesTab from '../components/jobcosting/BidsQuotesTab';
import CommitmentsTab from '../components/jobcosting/CommitmentsTab';
import ActualsTab from '../components/jobcosting/ActualsTab';
import ForecastTab from '../components/jobcosting/ForecastTab';
import SOVTab from '../components/jobcosting/SOVTab';
import PayAppsTab from '../components/jobcosting/PayAppsTab';
import ChangeOrdersTab from '../components/jobcosting/ChangeOrdersTab';
import ScheduleTab from '../components/jobcosting/ScheduleTab';
import CashflowWipTab from '../components/jobcosting/CashflowWipTab';
import WhatChangedTab from '../components/jobcosting/WhatChangedTab';

const tabs = [
  { key: 'costs', label: 'Cost Codes', icon: DollarSign },
  { key: 'bids', label: 'Bids & Quotes', icon: Scale },
  { key: 'commitments', label: 'Commitments', icon: Gavel },
  { key: 'actuals', label: 'Actuals', icon: Receipt },
  { key: 'forecast', label: 'Forecast', icon: TrendingUp },
  { key: 'sov', label: 'Schedule of Values', icon: FileText },
  { key: 'draws', label: 'Pay Apps', icon: ClipboardList },
  { key: 'cos', label: 'Change Orders', icon: AlertTriangle },
  { key: 'milestones', label: 'Schedule', icon: Calendar },
  { key: 'cashflow', label: 'Cashflow / WIP', icon: BarChart3 },
  { key: 'changed', label: 'What Changed', icon: GitCommit },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const validTabs = tabs.map(t => t.key);
  const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'costs';
  const [tab, setTab] = useState(initialTab);
  const [bidRef, setBidRef] = useState(null);
  const { data, loading, error, refetch } = useApi(() => api.project(id), [id]);

  const project = data || demoProject;

  if (loading) return <PageLoading />;
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />;

  const spent = (project.phases || []).reduce((s, p) => s + (p.actual || 0), 0);
  const budgetPct = project.budget_total ? ((spent / Number(project.budget_total)) * 100) : 0;

  const handleNavigateToBids = (ref) => {
    setBidRef(ref);
    setTab('bids');
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-gold transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="bg-brand-card border border-brand-border rounded-lg p-6">
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
      {tab === 'costs' && <CostCodesTab project={project} onNavigateToBids={handleNavigateToBids} />}
      {tab === 'bids' && <BidsQuotesTab project={project} initialBidRef={bidRef} />}
      {tab === 'commitments' && <CommitmentsTab project={project} />}
      {tab === 'actuals' && <ActualsTab project={project} />}
      {tab === 'forecast' && <ForecastTab project={project} />}
      {tab === 'sov' && <SOVTab project={project} />}
      {tab === 'draws' && <PayAppsTab project={project} />}
      {tab === 'cos' && <ChangeOrdersTab project={project} />}
      {tab === 'milestones' && <ScheduleTab project={project} />}
      {tab === 'cashflow' && <CashflowWipTab project={project} />}
      {tab === 'changed' && <WhatChangedTab project={project} />}
    </div>
  );
}
