import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, moneyExact, shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import {
  Banknote, ArrowDownLeft, ArrowUpRight, Clock,
  Building2, CreditCard, Landmark, Plus,
} from 'lucide-react';

const tabList = ['accounts', 'pay_vendors', 'request_payment', 'transactions'];
const tabLabels = { accounts: 'Accounts', pay_vendors: 'Pay Vendors', request_payment: 'Request Payment', transactions: 'Transactions' };

// Demo data
const demoAccounts = [
  { type: 'bank', name: 'Chase Checking', last4: '4521', balance: 127342.18, status: 'live' },
  { type: 'bank', name: 'Chase Savings', last4: '8903', balance: 45000.00, status: 'live' },
  { type: 'bank', name: 'Truist Operating', last4: '2201', balance: 83419.55, status: 'live' },
  { type: 'card', name: 'Amex Platinum', last4: '1001', balance: 12847.22, status: 'live' },
  { type: 'card', name: 'Chase Ink', last4: '3344', balance: 4219.00, status: 'live' },
  { type: 'loc', name: 'PNC Line of Credit', last4: '9912', balance: 150000, status: 'live' },
];

const demoTransactions = [
  { id: 1, date: '2026-02-21', description: 'Home Depot #4421', amount: -2847, account: 'Chase ····4521', project: 'PRJ-042', category: 'Materials' },
  { id: 2, date: '2026-02-21', description: 'Johnson Draw #3', amount: 45000, account: 'Chase ····4521', project: 'PRJ-042', category: 'Draw' },
  { id: 3, date: '2026-02-21', description: 'ABC Plumbing', amount: -8500, account: 'Chase ····4521', project: 'PRJ-042', category: 'Subcontractor' },
  { id: 4, date: '2026-02-20', description: 'Gusto Payroll', amount: -24813, account: 'Chase ····4521', project: 'PAYROLL', category: 'Payroll' },
  { id: 5, date: '2026-02-20', description: 'Johnson Draw #2', amount: 32000, account: 'Truist ····2201', project: 'PRJ-038', category: 'Draw' },
  { id: 6, date: '2026-02-19', description: "Lowe's Pro #2283", amount: -1423.67, account: 'Chase Ink ····3344', project: 'PRJ-051', category: 'Materials' },
  { id: 7, date: '2026-02-19', description: 'Williams Electric', amount: -6200, account: 'Chase ····4521', project: 'PRJ-038', category: 'Subcontractor' },
  { id: 8, date: '2026-02-18', description: 'State Farm Ins Claim', amount: 12400, account: 'Truist ····2201', project: 'PRJ-027', category: 'Insurance' },
];

const accountIcon = { bank: Landmark, card: CreditCard, loc: Building2 };

export default function Payments() {
  const [tab, setTab] = useState('accounts');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Cash" value={money(277912)} icon={Banknote} sub="All accounts" />
        <KPICard label="Due to Vendors" value={money(97200)} icon={ArrowUpRight} sub="14 pending" />
        <KPICard label="Due from Clients" value={money(184500)} icon={ArrowDownLeft} sub="8 invoices" />
        <KPICard label="Pending Approval" value="5" icon={Clock} sub="payments" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-border pb-px overflow-x-auto">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* Accounts Tab */}
      {tab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-text">Connected Accounts</h3>
            <button className="flex items-center gap-1.5 text-xs font-medium text-brand-gold hover:text-brand-gold-light transition-colors">
              <Plus size={14} /> Connect Account
            </button>
          </div>
          <div className="space-y-2">
            {demoAccounts.map((a, i) => {
              const Icon = accountIcon[a.type] || Landmark;
              return (
                <div key={i} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg px-5 py-4 hover:border-brand-gold/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-surface flex items-center justify-center">
                      <Icon size={18} className="text-brand-gold" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{a.name}</div>
                      <div className="text-xs text-brand-muted">····{a.last4}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">{moneyExact(a.balance)}</div>
                      <div className="text-[10px] text-brand-muted">{a.type === 'card' ? 'Balance' : a.type === 'loc' ? 'Drawn' : 'Available'}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-ok" />
                      <span className="text-xs text-ok">Live</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pay Vendors Tab */}
      {tab === 'pay_vendors' && (
        <div className="bg-brand-card border border-brand-border rounded-lg p-6 space-y-5">
          <h3 className="font-semibold">Pay a Vendor</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Vendor</label>
              <select className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-gold/60">
                <option>Select vendor...</option>
                <option>ABC Plumbing LLC</option>
                <option>Williams Electric</option>
                <option>Miller Concrete</option>
                <option>Home Depot Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Project</label>
              <select className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-gold/60">
                <option>Select project...</option>
                <option>PRJ-042 — 2847 Elm Street</option>
                <option>PRJ-038 — Lakewood Custom Home</option>
                <option>PRJ-051 — Riverdale Spec #3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-brand-muted mb-1.5">Amount</label>
            <input type="text" placeholder="$0.00" className="w-full sm:w-64 bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/60" />
          </div>

          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Pay Method</label>
              <div className="flex gap-2">
                {['ACH', 'Check', 'Wire'].map((m) => (
                  <button key={m} className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-gold/40 transition-colors first:bg-brand-gold/15 first:text-brand-gold first:border-brand-gold/30">
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="px-5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-sm text-brand-muted hover:text-brand-text transition-colors">
              Cancel
            </button>
            <button className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-bg font-semibold rounded-lg text-sm transition-colors">
              Approve &amp; Send Payment &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Request Payment Tab */}
      {tab === 'request_payment' && (
        <div className="bg-brand-card border border-brand-border rounded-lg p-6 space-y-5">
          <h3 className="font-semibold">Create Invoice / Draw Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Client</label>
              <select className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-gold/60">
                <option>Select client...</option>
                <option>Johnson Family</option>
                <option>ABC Development</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1.5">Project</label>
              <select className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-gold/60">
                <option>Select project...</option>
                <option>PRJ-042 — 2847 Elm Street</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1.5">Amount Requested</label>
            <input type="text" placeholder="$0.00" className="w-full sm:w-64 bg-brand-surface border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/60" />
          </div>
          <button className="px-5 py-2.5 bg-brand-gold hover:bg-brand-gold-light text-brand-bg font-semibold rounded-lg text-sm transition-colors">
            Create &amp; Send Invoice &rarr;
          </button>
        </div>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-brand-text">Recent Transactions</h3>
          <div className="space-y-1">
            {demoTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg px-5 py-3 hover:border-brand-gold/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.amount > 0 ? 'bg-ok/15' : 'bg-danger/15'}`}>
                    {t.amount > 0 ? <ArrowDownLeft size={14} className="text-ok" /> : <ArrowUpRight size={14} className="text-danger" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.description}</div>
                    <div className="text-xs text-brand-muted">{t.account} &middot; {t.project}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${t.amount > 0 ? 'text-ok' : 'text-brand-text'}`}>
                    {t.amount > 0 ? '+' : ''}{moneyExact(t.amount)}
                  </div>
                  <div className="text-[10px] text-brand-muted">{shortDate(t.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
