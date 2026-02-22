import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import { money, moneyExact, pct, shortDate, statusBadge, moneyClass } from '../lib/format';
import KPICard from '../components/KPICard';
import ChartTooltip from '../components/ChartTooltip';
import DemoBanner from '../components/DemoBanner';
import { PageLoading, ErrorState, EmptyState } from '../components/LoadingState';
import { DollarSign, TrendingDown, Building2, CreditCard, Repeat, Home } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const tabs = ['overview', 'debts', 'ar', 'retainage', 'recurring', 'properties'];
const tabLabels = { overview: 'Overview', debts: 'Debt Schedule', ar: 'AR / Invoices', retainage: 'Retainage', recurring: 'Recurring', properties: 'Properties' };

const demoDebts = [
  { id: 1, name: 'Chase LOC', lender: 'Chase', debt_type: 'line_of_credit', current_balance: 75000, original_balance: 200000, interest_rate: 8.25, monthly_payment: 1250, is_active: true },
  { id: 2, name: 'PNC Construction Loan', lender: 'PNC', debt_type: 'construction_loan', current_balance: 150000, original_balance: 400000, interest_rate: 7.5, monthly_payment: 3200, is_active: true },
  { id: 3, name: 'F-250 Truck', lender: 'Ford Motor Credit', debt_type: 'vehicle_loan', current_balance: 28000, original_balance: 52000, interest_rate: 5.9, monthly_payment: 875, is_active: true },
  { id: 4, name: 'Amex Platinum', lender: 'American Express', debt_type: 'credit_card', current_balance: 12847, original_balance: 12847, interest_rate: 22.99, monthly_payment: 500, is_active: true },
];

const demoInvoices = [
  { id: 1, invoice_number: 'INV-2024-001', date_issued: '2026-01-15', date_due: '2026-02-14', amount: 45000, balance: 45000, status: 'overdue' },
  { id: 2, invoice_number: 'INV-2024-002', date_issued: '2026-02-01', date_due: '2026-03-03', amount: 38500, balance: 38500, status: 'sent' },
  { id: 3, invoice_number: 'INV-2024-003', date_issued: '2026-02-10', date_due: '2026-03-12', amount: 41400, balance: 41400, status: 'sent' },
  { id: 4, invoice_number: 'INV-2024-004', date_issued: '2025-12-01', date_due: '2025-12-31', amount: 32000, balance: 0, status: 'paid' },
];

const demoWeekly = [
  { week: 'W1', inflows: 85000, outflows: 62000, net: 23000 },
  { week: 'W2', inflows: 45000, outflows: 71000, net: -26000 },
  { week: 'W3', inflows: 92000, outflows: 58000, net: 34000 },
  { week: 'W4', inflows: 78000, outflows: 65000, net: 13000 },
  { week: 'W5', inflows: 110000, outflows: 74000, net: 36000 },
  { week: 'W6', inflows: 65000, outflows: 82000, net: -17000 },
];

export default function Financials() {
  const [searchParams] = useSearchParams();
  const validTabs = ['overview', 'debts', 'ar', 'retainage', 'recurring', 'properties'];
  const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const [tab, setTab] = useState(initialTab);
  const tc = useThemeColors();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Financials</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Debt" value={money(265847)} icon={TrendingDown} sub="4 active" />
        <KPICard label="Monthly Obligations" value={money(5825)} icon={Repeat} sub="Debt service" />
        <KPICard label="Outstanding AR" value={money(124900)} icon={DollarSign} sub="3 invoices" />
        <KPICard label="Properties" value="4" icon={Home} sub="$1.2M equity" />
      </div>

      <div className="flex gap-1 pb-px overflow-x-auto" style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="mc-tab"
            style={tab === t ? { color: 'var(--accent)', borderBottomColor: 'var(--accent)' } : undefined}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="rounded-lg p-5" style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)' }}>
            <div className="panel-head" style={{ padding: 0, border: 'none', marginBottom: 16 }}>
              <div>
                <h3 className="panel-title">13-Week Cash Flow Forecast</h3>
                <div className="panel-sub">Projected inflows vs outflows</div>
              </div>
              <button className="ghost-btn">View as Table</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={demoWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
                <XAxis dataKey="week" stroke={tc.textSecondary} fontSize={11} />
                <YAxis tickFormatter={(v) => money(v, true)} stroke={tc.textSecondary} fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="inflows" stroke={tc.statusProfit} fill={tc.statusProfit} fillOpacity={0.1} name="Inflows" />
                <Area type="monotone" dataKey="outflows" stroke={tc.statusLoss} fill={tc.statusLoss} fillOpacity={0.1} name="Outflows" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'debts' && (
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Lender</th>
                <th>Type</th>
                <th className="right">Balance</th>
                <th className="right">Rate</th>
                <th className="right">Monthly Pmt</th>
              </tr>
            </thead>
            <tbody>
              {demoDebts.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.lender}</td>
                  <td className="text-xs capitalize">{d.debt_type.replace('_', ' ')}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{moneyExact(d.current_balance)}</td>
                  <td className="num right">{d.interest_rate}%</td>
                  <td className="num right">{moneyExact(d.monthly_payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ar' && (
        <div className="overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Issued</th>
                <th>Due</th>
                <th className="right">Amount</th>
                <th className="right">Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {demoInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{inv.invoice_number}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{shortDate(inv.date_issued)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{shortDate(inv.date_due)}</td>
                  <td className="num right">{moneyExact(inv.amount)}</td>
                  <td className="num right" style={{ fontWeight: 500 }}>{moneyExact(inv.balance)}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(inv.status)}`}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'retainage' && <EmptyState title="Retainage data" message="Connect your backend to see retainage entries" />}
      {tab === 'recurring' && <EmptyState title="Recurring expenses" message="Connect your backend to see recurring obligations" />}
      {tab === 'properties' && <EmptyState title="Property portfolio" message="Connect your backend to see property data" />}
    </div>
  );
}
