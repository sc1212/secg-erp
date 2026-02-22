/**
 * Pay Bills — Redesigned vendor payment workflow (Issue 11)
 * Features: batch payment, compliance gating, overdue highlighting, lien waiver tracking
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money, moneyExact, moneyAccounting, shortDate } from '../lib/format';
import KPICard from '../components/KPICard';
import DemoBanner from '../components/DemoBanner';
import {
  Banknote, ArrowUpRight, ArrowDownLeft, Clock,
  Check, AlertTriangle, Shield, FileText, Eye,
  Filter, Search, ChevronDown,
} from 'lucide-react';

const DEMO_BILLS = [
  {
    id: 1, vendor: 'Miller Concrete', invoice: 'INV-2025-089', project: 'Riverside Custom',
    description: 'Foundation pour', invoiceDate: '2026-02-10', dueDate: '2026-02-24',
    terms: 'Net 15', amount: 8400, paid: 0, balance: 8400,
    lienWaiver: 'on_file', coi: 'current', coiExpiry: '2026-10-15', daysUntilDue: 2, overdue: false,
  },
  {
    id: 2, vendor: '84 Lumber', invoice: 'INV-2025-092', project: 'Oak Creek',
    description: 'Framing materials', invoiceDate: '2026-02-12', dueDate: '2026-02-27',
    terms: 'Net 30', amount: 12100, paid: 0, balance: 12100,
    lienWaiver: 'needed', coi: 'current', coiExpiry: '2027-01-20', daysUntilDue: 5, overdue: false,
  },
  {
    id: 3, vendor: 'Williams Electric', invoice: 'INV-2025-088', project: 'Magnolia Spec',
    description: 'Rough electrical', invoiceDate: '2026-02-05', dueDate: '2026-02-20',
    terms: 'Net 15', amount: 6200, paid: 0, balance: 6200,
    lienWaiver: 'on_file', coi: 'expiring', coiExpiry: '2026-02-28', daysUntilDue: -2, overdue: true,
  },
  {
    id: 4, vendor: 'TN Mechanical', invoice: 'INV-2025-085', project: 'Riverside Custom',
    description: 'HVAC rough-in', invoiceDate: '2026-02-01', dueDate: '2026-03-01',
    terms: 'Net 30', amount: 9800, paid: 0, balance: 9800,
    lienWaiver: 'on_file', coi: 'expired', coiExpiry: '2026-01-31', daysUntilDue: 7, overdue: false,
  },
  {
    id: 5, vendor: 'Smith Plumbing', invoice: 'INV-2025-091', project: 'Oak Creek',
    description: 'Plumbing rough-in', invoiceDate: '2026-02-08', dueDate: '2026-02-23',
    terms: 'Net 15', amount: 5400, paid: 0, balance: 5400,
    lienWaiver: 'on_file', coi: 'current', coiExpiry: '2026-09-30', daysUntilDue: 1, overdue: false,
  },
  {
    id: 6, vendor: 'Carolina Framing', invoice: 'INV-2025-087', project: 'Johnson Rehab',
    description: 'Framing labor — 2nd floor', invoiceDate: '2026-02-03', dueDate: '2026-02-18',
    terms: 'Net 15', amount: 7600, paid: 0, balance: 7600,
    lienWaiver: 'needed', coi: 'current', coiExpiry: '2026-07-15', daysUntilDue: -4, overdue: true,
  },
];

const REQUIRE_LIEN_WAIVER = true;

function LienStatus({ status }) {
  if (status === 'on_file') return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-profit)' }}><Check size={12} /> On file</span>;
  if (status === 'needed') return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-warning)' }}><AlertTriangle size={12} /> Needed</span>;
  return <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>N/A</span>;
}

function COIStatus({ status, expiry }) {
  if (status === 'current') return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-profit)' }}><Check size={12} /> Current</span>;
  if (status === 'expiring') return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-warning)' }}><AlertTriangle size={12} /> Expiring {shortDate(expiry)}</span>;
  if (status === 'expired') return <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--status-loss)' }}><AlertTriangle size={12} /> Expired</span>;
  return <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Unknown</span>;
}

export default function Payments() {
  const navigate = useNavigate();
  const { isDemo } = useApi(() => api.dashboard(), []);
  const [selected, setSelected] = useState(new Set());
  const [filterVendor, setFilterVendor] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [requireLienWaiver, setRequireLienWaiver] = useState(REQUIRE_LIEN_WAIVER);

  const bills = DEMO_BILLS;
  const filtered = bills
    .filter(b => filterVendor === 'all' || b.vendor === filterVendor)
    .filter(b => filterProject === 'all' || b.project === filterProject)
    .filter(b => {
      if (filterStatus === 'overdue') return b.overdue;
      if (filterStatus === 'due_this_week') return b.daysUntilDue <= 7 && !b.overdue;
      return true;
    })
    .sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return a.daysUntilDue - b.daysUntilDue;
    });

  const dueThisWeek = bills.filter(b => b.daysUntilDue <= 7 && b.daysUntilDue >= 0).reduce((s, b) => s + b.balance, 0);
  const overdueTotal = bills.filter(b => b.overdue).reduce((s, b) => s + b.balance, 0);
  const overdueCount = bills.filter(b => b.overdue).length;
  const selectedTotal = [...selected].reduce((s, id) => s + (bills.find(b => b.id === id)?.balance || 0), 0);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllDueThisWeek = () => {
    const ids = bills.filter(b => b.daysUntilDue <= 7 && b.daysUntilDue >= 0).map(b => b.id);
    setSelected(new Set(ids));
  };

  const vendors = [...new Set(bills.map(b => b.vendor))];
  const projects = [...new Set(bills.map(b => b.project))];

  return (
    <div className="space-y-5">
      {isDemo && <DemoBanner />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pay Bills</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Due This Week: <strong style={{ color: 'var(--text-primary)' }}>{money(dueThisWeek)}</strong>
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Outstanding" value={money(bills.reduce((s, b) => s + b.balance, 0))} icon={Banknote} sub={`${bills.length} bills`} />
        <KPICard label="Due This Week" value={money(dueThisWeek)} icon={Clock} sub="< 7 days" />
        <KPICard label="Overdue" value={money(overdueTotal)} icon={AlertTriangle} sub={`${overdueCount} bills`} trend={overdueCount > 0 ? -1 : undefined} />
        <KPICard label="Pending Lien Waivers" value={bills.filter(b => b.lienWaiver === 'needed').length} icon={Shield} sub="required before pay" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Filter size={13} /> Filter:
        </div>
        <select
          className="text-xs px-3 py-1.5 rounded border"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Bills</option>
          <option value="overdue">Overdue</option>
          <option value="due_this_week">Due This Week</option>
        </select>
        <select
          className="text-xs px-3 py-1.5 rounded border"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
          value={filterVendor}
          onChange={e => setFilterVendor(e.target.value)}
        >
          <option value="all">All Vendors</option>
          {vendors.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select
          className="text-xs px-3 py-1.5 rounded border"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filtered.map(bill => {
          const isSelected = selected.has(bill.id);
          const canPay = !requireLienWaiver || bill.lienWaiver === 'on_file';

          return (
            <div
              key={bill.id}
              className="rounded-lg overflow-hidden"
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${bill.overdue ? 'var(--status-loss)' : isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Checkbox */}
                <button
                  className="mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center"
                  style={{
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-medium)',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? 'var(--text-inverse)' : 'transparent',
                  }}
                  onClick={() => toggleSelect(bill.id)}
                >
                  {isSelected && <Check size={12} />}
                </button>

                {/* Bill Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{bill.vendor.toUpperCase()}</span>
                    {bill.overdue && (
                      <span className="mc-badge mc-badge-loss">OVERDUE</span>
                    )}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {bill.invoice} &middot; {bill.project} &middot; {bill.description}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Invoice Date: {shortDate(bill.invoiceDate)} &middot; Due: {shortDate(bill.dueDate)}
                    {bill.overdue
                      ? <span style={{ color: 'var(--status-loss)', fontWeight: 600 }}> (OVERDUE {Math.abs(bill.daysUntilDue)} days)</span>
                      : <span> ({bill.daysUntilDue} days)</span>
                    }
                    &middot; Terms: {bill.terms}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span style={{ color: 'var(--text-primary)' }}>
                      Amount: <strong>{moneyExact(bill.amount)}</strong> &middot; Paid: {moneyExact(bill.paid)} &middot; Balance: <strong>{moneyExact(bill.balance)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Lien Waiver:</span>
                    <LienStatus status={bill.lienWaiver} />
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>COI:</span>
                    <COIStatus status={bill.coi} expiry={bill.coiExpiry} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}
              >
                <button className="ghost-btn flex items-center gap-1">
                  <Eye size={12} /> View Invoice
                </button>
                {canPay ? (
                  <button
                    className="px-3 py-1 rounded text-xs font-semibold"
                    style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
                  >
                    {bill.overdue ? 'Pay Now' : 'Schedule Payment'}
                  </button>
                ) : (
                  <button className="ghost-btn flex items-center gap-1" style={{ color: 'var(--status-warning)' }}>
                    <Shield size={12} /> Hold \u2014 Request Lien Waiver
      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-border pb-px overflow-x-auto">
        {tabList.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-brand-muted lg:hover:text-brand-text'
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
            <button className="flex items-center gap-1.5 text-xs font-medium text-brand-gold lg:hover:text-brand-gold-light transition-colors">
              <Plus size={14} /> Connect Account
            </button>
          </div>
          <div className="space-y-2">
            {demoAccounts.map((a, i) => {
              const Icon = accountIcon[a.type] || Landmark;
              return (
                <div key={i} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-xl px-5 py-4 lg:hover:border-brand-gold/20 transition-colors">
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
                      <div className="font-bold num">{moneyExact(a.balance)}</div>
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
                  <button key={m} className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-surface border border-brand-border text-brand-muted lg:hover:text-brand-text lg:hover:border-brand-gold/40 transition-colors first:bg-brand-gold/15 first:text-brand-gold first:border-brand-gold/30">
                    {m}
                  </button>
                )}
                <button className="ghost-btn">Dispute</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div
        className="rounded-lg p-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Selected: <strong style={{ color: 'var(--text-primary)' }}>{selected.size} bills ({money(selectedTotal)})</strong>
        </div>
        <div className="flex items-center gap-3">
          <button className="ghost-btn" onClick={selectAllDueThisWeek}>Select All Due This Week</button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: selected.size > 0 ? 'var(--accent)' : 'var(--bg-elevated)',
              color: selected.size > 0 ? 'var(--text-inverse)' : 'var(--text-tertiary)',
              cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            }}
            disabled={selected.size === 0}
          >
            Pay Selected \u2192
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span className="flex items-center gap-1.5">
          \u2699\uFE0F Payment Method: Company Checking ****4521 (via QuickBooks)
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={requireLienWaiver}
            onChange={e => setRequireLienWaiver(e.target.checked)}
          />
          Require lien waiver before payment
        </label>
      </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="px-5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-sm text-brand-muted lg:hover:text-brand-text transition-colors">
              Cancel
            </button>
            <button className="px-5 py-2.5 bg-brand-gold lg:hover:bg-brand-gold-light text-brand-bg font-semibold rounded-lg text-sm transition-colors">
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
          <button className="px-5 py-2.5 bg-brand-gold lg:hover:bg-brand-gold-light text-brand-bg font-semibold rounded-lg text-sm transition-colors">
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
              <div key={t.id} className="flex items-center justify-between bg-brand-card border border-brand-border rounded-lg px-5 py-3 lg:hover:border-brand-gold/20 transition-colors">
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
                  <div className={`font-bold text-sm num ${t.amount > 0 ? 'text-ok' : 'text-danger'}`}>
                    {t.amount > 0 ? `+${moneyExact(t.amount)}` : moneyAccounting(t.amount)}
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
