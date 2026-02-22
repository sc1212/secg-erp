import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import { money, moneyExact, pct, shortDate, statusBadge } from '../lib/format';
import KPICard from '../components/KPICard';
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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-xs shadow-lg text-brand-text">
      <p className="text-brand-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {money(p.value)}</p>
      ))}
    </div>
  );
}

export default function Financials() {
  const colors = useThemeColors();
  const [tab, setTab] = useState('overview');
  const [showCashFlowTable, setShowCashFlowTable] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financials</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Debt" value={money(265847)} icon={TrendingDown} sub="4 active" />
        <KPICard label="Monthly Obligations" value={money(5825)} icon={Repeat} sub="Debt service" />
        <KPICard label="Outstanding AR" value={money(124900)} icon={DollarSign} sub="3 invoices" />
        <KPICard label="Properties" value="4" icon={Home} sub="$1.2M equity" />
      </div>

      <div className="flex gap-1 border-b border-brand-border pb-px overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t ? 'border-brand-gold text-brand-gold' : 'border-transparent text-brand-muted lg:hover:text-brand-text'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">13-Week Cash Flow Forecast</h3>
              <button onClick={() => setShowCashFlowTable((current) => !current)} className="text-xs font-medium text-brand-gold lg:hover:text-brand-gold-light transition-colors">
                {showCashFlowTable ? 'View Chart' : 'View as Table'}
              </button>
            </div>
            {showCashFlowTable ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                      <th className="pb-3 pr-4">Week</th>
                      <th className="pb-3 pr-4 num">Inflows</th>
                      <th className="pb-3 pr-4 num">Outflows</th>
                      <th className="pb-3 num">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoWeekly.map((row) => (
                      <tr key={row.week} className="border-b border-brand-border/50 lg:hover:bg-brand-card-hover">
                        <td className="py-3 pr-4 font-medium">{row.week}</td>
                        <td className="py-3 pr-4 num">{moneyExact(row.inflows)}</td>
                        <td className="py-3 pr-4 num">{moneyExact(row.outflows)}</td>
                        <td className={`py-3 num ${row.net < 0 ? 'text-danger' : 'text-ok'}`}>{row.net < 0 ? `(${moneyExact(Math.abs(row.net))})` : moneyExact(row.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={demoWeekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="week" stroke={colors.textMuted} fontSize={11} />
                  <YAxis tickFormatter={(v) => money(v, true)} stroke={colors.textMuted} fontSize={11} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="inflows" stroke={colors.ok} fill={colors.ok} fillOpacity={0.1} name="Inflows" />
                  <Area type="monotone" dataKey="outflows" stroke={colors.danger} fill={colors.danger} fillOpacity={0.1} name="Outflows" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === 'debts' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Lender</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4 text-right">Balance</th>
                <th className="pb-3 pr-4 text-right">Rate</th>
                <th className="pb-3 text-right">Monthly Pmt</th>
              </tr>
            </thead>
            <tbody>
              {demoDebts.map((d) => (
                <tr key={d.id} className="border-b border-brand-border/50 lg:hover:bg-brand-card-hover">
                  <td className="py-3 pr-4 font-medium">{d.name}</td>
                  <td className="py-3 pr-4 text-brand-muted">{d.lender}</td>
                  <td className="py-3 pr-4 text-xs capitalize">{d.debt_type.replace('_', ' ')}</td>
                  <td className="py-3 pr-4 num font-bold">{moneyExact(d.current_balance)}</td>
                  <td className="py-3 pr-4 num">{d.interest_rate}%</td>
                  <td className="py-3 num">{moneyExact(d.monthly_payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ar' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-xs text-brand-muted uppercase">
                <th className="pb-3 pr-4">Invoice #</th>
                <th className="pb-3 pr-4">Issued</th>
                <th className="pb-3 pr-4">Due</th>
                <th className="pb-3 pr-4 text-right">Amount</th>
                <th className="pb-3 pr-4 text-right">Balance</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {demoInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-brand-border/50 lg:hover:bg-brand-card-hover">
                  <td className="py-3 pr-4 font-mono text-brand-gold text-xs">{inv.invoice_number}</td>
                  <td className="py-3 pr-4 text-brand-muted">{shortDate(inv.date_issued)}</td>
                  <td className="py-3 pr-4 text-brand-muted">{shortDate(inv.date_due)}</td>
                  <td className="py-3 pr-4 num">{moneyExact(inv.amount)}</td>
                  <td className="py-3 pr-4 num font-medium">{moneyExact(inv.balance)}</td>
                  <td className="py-3">
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
