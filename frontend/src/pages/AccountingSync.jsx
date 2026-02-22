import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock, X } from 'lucide-react';
import { money } from '../lib/format';

const CONNECTIONS = [
  { id: 'qbo',   name: 'QuickBooks Online',  icon: '📒', status: 'connected',    lastSync: '2026-02-22 05:12 AM', nextSync: '2026-02-23 05:00 AM', syncedToday: 47, pendingItems: 0,  version: 'v2.1.8', company: 'Southeast Construction Group LLC' },
  { id: 'gusto', name: 'Gusto Payroll',       icon: '👥', status: 'connected',    lastSync: '2026-02-21 11:48 PM', nextSync: '2026-02-22 11:00 PM', syncedToday: 12, pendingItems: 0,  version: 'v3.4.0', company: 'SECG Payroll' },
  { id: 'ramp',  name: 'Ramp Corporate Card', icon: '💳', status: 'warning',      lastSync: '2026-02-22 02:18 AM', nextSync: '2026-02-22 08:00 AM', syncedToday: 8,  pendingItems: 3,  version: 'v1.9.2', company: 'SECG Operating' },
  { id: 'bank',  name: 'Bank Feed (BancorpSouth)', icon: '🏦', status: 'connected', lastSync: '2026-02-22 06:00 AM', nextSync: '2026-02-22 18:00 AM', syncedToday: 28, pendingItems: 0, version: 'Direct Feed', company: 'Checking x4821' },
];

const SYNC_QUEUE = [
  { id: 1, source: 'Ramp',       date: '2026-02-21', vendor: 'Home Depot',         amount: 1248.44, type: 'Expense',     status: 'failed',  error: 'Vendor not found in QB — "Home Depot #8842" needs mapping', project: 'Riverside Custom',   code: '06-110' },
  { id: 2, source: 'Ramp',       date: '2026-02-21', vendor: 'Nashville Fasteners', amount: 342.00, type: 'Expense',     status: 'failed',  error: 'Cost code 06-110 not mapped to QB account', project: 'Elm St Multifamily', code: '06-110' },
  { id: 3, source: 'Ramp',       date: '2026-02-20', vendor: 'Amazon Business',     amount: 188.92, type: 'Expense',     status: 'pending', error: 'Awaiting project allocation — card holder assigned no project', project: null, code: null },
  { id: 4, source: 'QuickBooks', date: '2026-02-20', vendor: 'Thompson Framing',   amount: 18400.00,type: 'Bill Payment',status: 'synced',  error: null, project: 'Riverside Custom',   code: '06-100' },
  { id: 5, source: 'QuickBooks', date: '2026-02-20', vendor: 'Miller Concrete',    amount: 5180.00, type: 'Bill Payment',status: 'synced',  error: null, project: 'Oak Creek',         code: '03-100' },
  { id: 6, source: 'Gusto',      date: '2026-02-21', vendor: 'Payroll (all staff)',amount: 28420.00,type: 'Payroll',     status: 'synced',  error: null, project: 'Various',           code: '01-300' },
  { id: 7, source: 'Gusto',      date: '2026-02-21', vendor: 'Employer Taxes',     amount: 3248.00, type: 'Payroll Tax', status: 'synced',  error: null, project: null,                code: '99-100' },
  { id: 8, source: 'Bank Feed',  date: '2026-02-22', vendor: 'Williams Electric — ACH', amount: 9400.00, type: 'Payment', status: 'synced', error: null, project: 'Johnson Office TI', code: '16-100' },
];

// Reconciliation — ERP vs QB account balances
const RECONCILIATION = [
  { account: 'Accounts Payable',     erpBalance: 148240, qbBalance: 148240, variance: 0,      status: 'match' },
  { account: 'Accounts Receivable',  erpBalance: 218600, qbBalance: 218600, variance: 0,      status: 'match' },
  { account: 'Checking x4821',       erpBalance: 284420, qbBalance: 284420, variance: 0,      status: 'match' },
  { account: 'Retainage Held',       erpBalance: 62400,  qbBalance: 62400,  variance: 0,      status: 'match' },
  { account: 'WIP / Job Costs',      erpBalance: 1286040,qbBalance: 1188000,variance: 98040,  status: 'variance', note: 'Ramp card expenses not yet synced from Feb ($3 items above)' },
  { account: 'Revenue Recognized',   erpBalance: 821600, qbBalance: 821600, variance: 0,      status: 'match' },
  { account: 'Payroll Liability',    erpBalance: 8420,   qbBalance: 8420,   variance: 0,      status: 'match' },
  { account: 'Equipment Deprec.',    erpBalance: 24800,  qbBalance: 24800,  variance: 0,      status: 'match' },
];

const INTEGRITY_CHECKS = [
  { name: 'All transactions have project codes',     status: 'warning', detail: '3 Ramp transactions missing project allocation (see sync queue)' },
  { name: 'No duplicate vendor payments',            status: 'pass',    detail: 'No duplicates detected' },
  { name: 'Payroll matches QB payroll module',       status: 'pass',    detail: 'Gusto payroll synced — $28,420 Feb 21' },
  { name: 'AR invoices match sent invoices',         status: 'pass',    detail: 'All 8 open invoices reconciled' },
  { name: 'Retainage balance matches contracts',     status: 'pass',    detail: '$62,400 retainage tied to 4 active contracts' },
  { name: 'WIP schedule balances to job cost ledger',status: 'warning', detail: '$98K variance — Ramp expenses pending sync resolution' },
  { name: 'Bank statement matches ERP',              status: 'pass',    detail: 'Bank feed synced — last check 6:00 AM today' },
  { name: 'All POs have matching AP entries',        status: 'pass',    detail: 'PO-to-bill match verified for 5 active POs' },
];

const SYNC_STATUS_STYLE = {
  connected: { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.1)',   label: 'Connected' },
  warning:   { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Warning' },
  error:     { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Error' },
  offline:   { color: 'var(--text-tertiary)',  bg: 'rgba(255,255,255,0.06)', label: 'Offline' },
};

const QUEUE_STATUS_STYLE = {
  synced:  { color: 'var(--status-profit)',  bg: 'rgba(52,211,153,0.1)',   label: 'Synced' },
  pending: { color: 'var(--status-warning)', bg: 'rgba(251,191,36,0.12)', label: 'Pending' },
  failed:  { color: 'var(--status-loss)',    bg: 'rgba(251,113,133,0.12)', label: 'Failed' },
};

export default function AccountingSync() {
  const [tab, setTab] = useState('status');
  const failedItems   = SYNC_QUEUE.filter(i => i.status === 'failed').length;
  const pendingItems  = SYNC_QUEUE.filter(i => i.status === 'pending').length;
  const reconcileVariances = RECONCILIATION.filter(r => r.status === 'variance').length;
  const integrityIssues = INTEGRITY_CHECKS.filter(c => c.status !== 'pass').length;

  const thBase = { padding: '8px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--color-brand-border)', textAlign: 'left', whiteSpace: 'nowrap' };

  return (
    <div className="space-y-5">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Accounting Integration Status</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {CONNECTIONS.filter(c => c.status === 'connected').length}/{CONNECTIONS.length} connections active · {failedItems + pendingItems} items need attention
          </p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-brand-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Sync Now
        </button>
      </div>

      {/* Alert */}
      {(failedItems > 0 || reconcileVariances > 0) && (
        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '11px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: failedItems > 0 ? 6 : 0 }}>
            <AlertTriangle size={14} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--status-warning)' }}>{failedItems} failed sync items</strong> and <strong style={{ color: 'var(--status-warning)' }}>{reconcileVariances} balance variance{reconcileVariances > 1 ? 's' : ''}</strong> need resolution before period close.</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-brand-border)' }}>
        {[['status', 'Connections'], ['queue', `Sync Queue (${SYNC_QUEUE.length})`], ['reconcile', `Reconciliation (${reconcileVariances > 0 ? reconcileVariances + ' var' : 'OK'})`], ['integrity', `Data Integrity (${integrityIssues} issues)`]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: '7px 7px 0 0', border: 'none', background: tab === t ? 'var(--color-brand-card)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CONNECTIONS ── */}
      {tab === 'status' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {CONNECTIONS.map(conn => {
            const ss = SYNC_STATUS_STYLE[conn.status];
            return (
              <div key={conn.id} style={{ background: 'var(--color-brand-card)', border: `1px solid ${conn.status === 'warning' ? 'rgba(251,191,36,0.3)' : 'var(--color-brand-border)'}`, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{conn.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{conn.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{conn.company}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: ss.bg, color: ss.color }}>{ss.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['Last Sync', conn.lastSync], ['Next Sync', conn.nextSync], ['Synced Today', conn.syncedToday + ' items'], ['Pending', conn.pendingItems + ' items']].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{v}</div>
                    </div>
                  ))}
                </div>
                {conn.pendingItems > 0 && (
                  <div style={{ marginTop: 10, padding: '7px 10px', background: 'rgba(251,191,36,0.08)', borderRadius: 6, fontSize: 11, color: 'var(--status-warning)' }}>
                    {conn.pendingItems} item{conn.pendingItems > 1 ? 's' : ''} pending — see Sync Queue
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SYNC QUEUE ── */}
      {tab === 'queue' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Source', 'Date', 'Vendor', 'Amount', 'Type', 'Project', 'Cost Code', 'Status', 'Error / Note'].map(h => (
                <th key={h} style={thBase}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {SYNC_QUEUE.map((item, i) => {
                const ss = QUEUE_STATUS_STYLE[item.status];
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--color-brand-border)', background: item.status === 'failed' ? 'rgba(251,113,133,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item.source}</td>
                    <td style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.date}</td>
                    <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-primary)', fontWeight: item.status === 'failed' ? 600 : 400 }}>{item.vendor}</td>
                    <td style={{ padding: '8px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{money(item.amount)}</td>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-tertiary)' }}>{item.type}</td>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text-secondary)' }}>{item.project || '—'}</td>
                    <td style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{item.code || '—'}</td>
                    <td style={{ padding: '8px 14px' }}><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                    <td style={{ padding: '8px 14px', fontSize: 11, color: item.error ? 'var(--status-warning)' : 'var(--text-tertiary)', maxWidth: 240 }}>{item.error || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── RECONCILIATION ── */}
      {tab === 'reconcile' && (
        <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-brand-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>ERP vs QuickBooks — Account Balance Comparison</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>As of nightly sync 2026-02-22 05:12 AM</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Account', 'ERP Balance', 'QB Balance', 'Variance', 'Status', 'Note'].map(h => (
                <th key={h} style={{ ...thBase, textAlign: ['ERP Balance', 'QB Balance', 'Variance'].includes(h) ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {RECONCILIATION.map((r, i) => (
                <tr key={r.account} style={{ borderTop: '1px solid var(--color-brand-border)', background: r.status === 'variance' ? 'rgba(251,191,36,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.account}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(r.erpBalance)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-secondary)' }}>{money(r.qbBalance)}</td>
                  <td style={{ padding: '9px 14px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, textAlign: 'right', color: r.variance !== 0 ? 'var(--status-warning)' : 'var(--status-profit)' }}>
                    {r.variance !== 0 ? money(r.variance) : '—'}
                  </td>
                  <td style={{ padding: '9px 14px' }}>
                    {r.status === 'match'
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--status-profit)' }}><CheckCircle size={12} /> Match</span>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--status-warning)', fontWeight: 700 }}><AlertTriangle size={12} /> Variance</span>
                    }
                  </td>
                  <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-tertiary)', maxWidth: 260 }}>{r.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── INTEGRITY CHECKS ── */}
      {tab === 'integrity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Nightly data integrity checks — run automatically at 5:00 AM. Last run: 2026-02-22 05:18 AM.</div>
          {INTEGRITY_CHECKS.map((check, i) => (
            <div key={i} style={{ background: 'var(--color-brand-card)', border: `1px solid ${check.status === 'pass' ? 'var(--color-brand-border)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {check.status === 'pass'
                ? <CheckCircle size={16} style={{ color: 'var(--status-profit)', flexShrink: 0, marginTop: 1 }} />
                : <AlertTriangle size={16} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: 1 }} />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: check.status === 'pass' ? 'var(--text-primary)' : 'var(--status-warning)' }}>{check.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{check.detail}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: check.status === 'pass' ? 'var(--status-profit)' : 'var(--status-warning)' }}>
                {check.status === 'pass' ? 'PASS' : 'ISSUE'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
