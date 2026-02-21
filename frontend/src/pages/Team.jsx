import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import { Users, DollarSign, Calendar, Shield, Phone, Mail } from 'lucide-react';

const tabs = ['roster', 'payroll', 'crew', 'lien_waivers'];
const tabLabels = { roster: 'Roster', payroll: 'Payroll', crew: 'Crew Allocation', lien_waivers: 'Lien Waivers' };

const demoEmployees = [
  { id: 1, first_name: 'Matt', last_name: 'Sizemore', role: 'Owner / PM', email: 'matt@secg.com', phone: '(555) 111-1111', hourly_rate: 0, salary: 120000, is_active: true },
  { id: 2, first_name: 'Jake', last_name: 'Rodriguez', role: 'Superintendent', email: 'jake@secg.com', phone: '(555) 222-2222', hourly_rate: 42, salary: 0, is_active: true },
  { id: 3, first_name: 'Chris', last_name: 'Taylor', role: 'Lead Carpenter', email: 'chris@secg.com', phone: '(555) 333-3333', hourly_rate: 35, salary: 0, is_active: true },
  { id: 4, first_name: 'Marcus', last_name: 'Johnson', role: 'Apprentice', email: 'marcus@secg.com', phone: '(555) 444-4444', hourly_rate: 22, salary: 0, is_active: true },
  { id: 5, first_name: 'Lisa', last_name: 'Park', role: 'Office Manager', email: 'lisa@secg.com', phone: '(555) 555-5555', hourly_rate: 0, salary: 52000, is_active: true },
];

const demoPayroll = [
  { id: 1, pay_date: '2026-02-28', status: 'scheduled', notes: 'Bi-weekly payroll' },
  { id: 2, pay_date: '2026-03-14', status: 'scheduled', notes: 'Bi-weekly payroll' },
  { id: 3, pay_date: '2026-03-28', status: 'scheduled', notes: 'Bi-weekly payroll' },
  { id: 4, pay_date: '2026-02-14', status: 'paid', notes: 'Bi-weekly payroll — $24,813' },
];

const demoLienWaivers = [
  { id: 1, vendor: 'ABC Plumbing LLC', project: 'PRJ-042', waiver_type: 'conditional', amount: 8500, through_date: '2026-02-01', received_date: null, risk: 'HIGH' },
  { id: 2, vendor: 'Williams Electric', project: 'PRJ-038', waiver_type: 'unconditional', amount: 12100, through_date: '2026-01-31', received_date: '2026-02-05', risk: 'LOW' },
  { id: 3, vendor: 'Miller Concrete', project: 'PRJ-042', waiver_type: 'conditional', amount: 17500, through_date: '2026-01-15', received_date: null, risk: 'HIGH' },
  { id: 4, vendor: 'Carolina Framing', project: 'PRJ-051', waiver_type: 'unconditional', amount: 24000, through_date: '2026-02-10', received_date: '2026-02-12', risk: 'LOW' },
];

const riskColor = { LOW: 'text-ok', MEDIUM: 'text-warn', HIGH: 'text-danger', 'VERY HIGH': 'text-danger' };
const riskBg = { LOW: 'bg-ok/15', MEDIUM: 'bg-warn/15', HIGH: 'bg-danger/15', 'VERY HIGH': 'bg-danger/15' };

export default function Team() {
  const [tab, setTab] = useState('roster');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Employees" value="5" icon={Users} sub="All active" />
        <KPICard label="Bi-Weekly Payroll" value={money(24813)} icon={DollarSign} sub="Next: Feb 28" />
        <KPICard label="Next Pay Date" value="Feb 28" icon={Calendar} />
        <KPICard label="Lien Waivers" value="2 missing" icon={Shield} sub="High risk" />
      </div>

      <div className="flex gap-1 border-b border-brand-border pb-px overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t ? 'border-brand-gold text-brand-gold' : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === 'roster' && (
        <div className="space-y-3">
          {demoEmployees.map((e) => (
            <div key={e.id} className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-gold/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold text-sm font-semibold">
                    {e.first_name[0]}{e.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{e.first_name} {e.last_name}</h3>
                    <div className="text-xs text-brand-gold">{e.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  {e.salary > 0 ? (
                    <div className="font-bold">{money(e.salary)}<span className="text-xs text-brand-muted font-normal">/yr</span></div>
                  ) : (
                    <div className="font-bold">${e.hourly_rate}<span className="text-xs text-brand-muted font-normal">/hr</span></div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-brand-muted">
                <span className="flex items-center gap-1"><Phone size={11} /> {e.phone}</span>
                <span className="flex items-center gap-1"><Mail size={11} /> {e.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'payroll' && (
        <div className="space-y-2">
          {demoPayroll.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg px-5 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${p.status === 'paid' ? 'bg-ok' : 'bg-brand-gold'}`} />
                <div>
                  <div className="text-sm font-medium">{shortDate(p.pay_date)}</div>
                  <div className="text-xs text-brand-muted">{p.notes}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${p.status === 'paid' ? 'bg-ok/20 text-ok' : 'bg-brand-gold/20 text-brand-gold'}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'crew' && <EmptyState title="Crew allocation" message="Connect your backend to see the weekly crew matrix" />}

      {tab === 'lien_waivers' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                <th className="pb-3 pr-4">Vendor</th>
                <th className="pb-3 pr-4">Project</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4 text-right">Amount</th>
                <th className="pb-3 pr-4">Through</th>
                <th className="pb-3 pr-4">Received</th>
                <th className="pb-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {demoLienWaivers.map((lw) => (
                <tr key={lw.id} className="border-b border-brand-border/50 hover:bg-brand-card-hover">
                  <td className="py-3 pr-4 font-medium">{lw.vendor}</td>
                  <td className="py-3 pr-4 text-brand-gold font-mono text-xs">{lw.project}</td>
                  <td className="py-3 pr-4 capitalize text-xs">{lw.waiver_type}</td>
                  <td className="py-3 pr-4 text-right">{money(lw.amount)}</td>
                  <td className="py-3 pr-4 text-brand-muted">{shortDate(lw.through_date)}</td>
                  <td className="py-3 pr-4">{lw.received_date ? <span className="text-ok">{shortDate(lw.received_date)}</span> : <span className="text-danger">Missing</span>}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${riskBg[lw.risk]} ${riskColor[lw.risk]}`}>{lw.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
