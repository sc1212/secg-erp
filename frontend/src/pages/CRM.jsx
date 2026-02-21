import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, statusBadge } from '../lib/format';
import KPICard from '../components/KPICard';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import { Users, DollarSign, Target, TrendingUp } from 'lucide-react';

const tabs = ['pipeline', 'leads', 'proposals'];

const demoLeads = [
  { id: 1, opportunity_title: 'Westside Custom Home', lead_status: 'qualified', project_type: 'custom_home', salesperson: 'Matt S.', client_contact: 'Jennifer Adams', estimated_value: 550000 },
  { id: 2, opportunity_title: 'Oak Creek Remodel', lead_status: 'proposal_sent', project_type: 'remodel', salesperson: 'Matt S.', client_contact: 'Robert Chen', estimated_value: 85000 },
  { id: 3, opportunity_title: 'Magnolia Spec Home', lead_status: 'new', project_type: 'spec_home', salesperson: 'Matt S.', client_contact: 'Inbound', estimated_value: 420000 },
  { id: 4, opportunity_title: 'Downtown Loft Renovation', lead_status: 'contacted', project_type: 'remodel', salesperson: 'Matt S.', client_contact: 'Sarah Mitchell', estimated_value: 120000 },
  { id: 5, opportunity_title: 'Riverstone Multi-Family Phase 2', lead_status: 'qualified', project_type: 'multifamily', salesperson: 'Matt S.', client_contact: 'Riverstone Dev LLC', estimated_value: 1800000 },
];

const demoPipeline = [
  { id: 1, opportunity_name: 'Westside Custom Home', client_name: 'Jennifer Adams', estimated_value: 550000, status: 'shortlisted', probability: 70, project_type: 'custom_home' },
  { id: 2, opportunity_name: 'Riverstone Phase 2', client_name: 'Riverstone Dev LLC', estimated_value: 1800000, status: 'pursuing', probability: 40, project_type: 'multifamily' },
  { id: 3, opportunity_name: 'Oak Creek Remodel', client_name: 'Robert Chen', estimated_value: 85000, status: 'bid_submitted', probability: 60, project_type: 'remodel' },
  { id: 4, opportunity_name: 'Crestview Office Build-Out', client_name: 'Crestview Corp', estimated_value: 310000, status: 'identified', probability: 20, project_type: 'commercial' },
];

const statusOrder = ['identified', 'pursuing', 'bid_submitted', 'shortlisted', 'won', 'lost'];

export default function CRM() {
  const [tab, setTab] = useState('pipeline');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">CRM &amp; Pipeline</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Pipeline Value" value={money(2745000, true)} icon={DollarSign} sub="4 opportunities" />
        <KPICard label="Weighted Value" value={money(1127000, true)} icon={Target} sub="By probability" />
        <KPICard label="Active Leads" value="5" icon={Users} sub="2 qualified" />
        <KPICard label="Win Rate" value="68%" icon={TrendingUp} trend={4.2} />
      </div>

      <div className="flex gap-1 border-b border-brand-border pb-px">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-brand-gold text-brand-gold' : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'pipeline' && (
        <div className="space-y-3">
          {demoPipeline.map((p) => (
            <div key={p.id} className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{p.opportunity_name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(p.status)}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-brand-muted">
                    {p.client_name} &middot; {p.project_type?.replace('_', ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{money(p.estimated_value)}</div>
                  <div className="text-xs text-brand-muted">{p.probability}% probability</div>
                </div>
              </div>
              {/* Probability bar */}
              <div className="mt-3 h-1.5 bg-brand-surface rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold rounded-full" style={{ width: `${p.probability}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'leads' && (
        <div className="space-y-3">
          {demoLeads.map((l) => (
            <div key={l.id} className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{l.opportunity_title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(l.lead_status)}`}>
                      {l.lead_status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-brand-muted">
                    {l.client_contact} &middot; {l.project_type?.replace('_', ' ')} &middot; {l.salesperson}
                  </div>
                </div>
                <div className="font-bold">{money(l.estimated_value)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'proposals' && <EmptyState title="Proposals" message="Connect your backend to see lead proposals" />}
    </div>
  );
}
