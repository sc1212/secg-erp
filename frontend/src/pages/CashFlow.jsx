import { useState, useEffect } from 'react';
import { useThemeColors } from '../hooks/useThemeColors';
import { api } from '../lib/api';
import { money, moneyClass } from '../lib/format';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, TrendingDown, DollarSign, Calendar } from 'lucide-react';

// ─── Demo data generator ──────────────────────────────────────────────────────
function buildDemoWeeks() {
  // 13 weeks starting Feb 24, 2026
  const startDate = new Date(2026, 1, 24); // Feb 24
  const weeks = [];
  let cash = 142800;

  // Pattern: every 3rd week is a draw week (big inflow), others alternate
  const pattern = [
    // w1 Feb 24 — draw week
    { draws: 45200, ar: 8400, payroll: 22400, vendor: 18600, debt: 1800 },
    // w2 Mar 3 — payroll heavy
    { draws: 0, ar: 6200, payroll: 23100, vendor: 24800, debt: 1800 },
    // w3 Mar 10
    { draws: 0, ar: 14500, payroll: 22800, vendor: 12400, debt: 1800 },
    // w4 Mar 17 — draw week
    { draws: 62000, ar: 5800, payroll: 23400, vendor: 21600, debt: 1800 },
    // w5 Mar 24
    { draws: 0, ar: 9200, payroll: 22600, vendor: 16800, debt: 1800 },
    // w6 Mar 31
    { draws: 0, ar: 11800, payroll: 24100, vendor: 28400, debt: 1800 },
    // w7 Apr 7 — draw week
    { draws: 58500, ar: 7400, payroll: 23200, vendor: 19400, debt: 1800 },
    // w8 Apr 14
    { draws: 0, ar: 8800, payroll: 22900, vendor: 14200, debt: 1800 },
    // w9 Apr 21
    { draws: 0, ar: 13200, payroll: 23600, vendor: 17800, debt: 1800 },
    // w10 Apr 28 — draw week
    { draws: 71000, ar: 6100, payroll: 24000, vendor: 22600, debt: 1800 },
    // w11 May 5
    { draws: 0, ar: 9600, payroll: 23300, vendor: 15900, debt: 1800 },
    // w12 May 12
    { draws: 0, ar: 7900, payroll: 22700, vendor: 31200, debt: 1800 }, // large vendor month-end
    // w13 May 19
    { draws: 48000, ar: 8200, payroll: 23800, vendor: 17400, debt: 1800 },
  ];

  for (let i = 0; i < 13; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i * 7);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isoDate = d.toISOString().slice(0, 10);

    const p = pattern[i];
    const totalIn  = p.draws + p.ar;
    const totalOut = p.payroll + p.vendor + p.debt;
    const net      = totalIn - totalOut;
    cash += net;

    weeks.push({
      weekNum: i + 1,
      weekLabel: label,
      weekDate: isoDate,
      draws: p.draws,
      arCollections: p.ar,
      totalIn,
      payroll: p.payroll,
      vendorPayments: p.vendor,
      debtService: p.debt,
      totalOut,
      netFlow: net,
      endingCash: Math.round(cash),
    });
  }
  return weeks;
}

const DEMO_WEEKS    = buildDemoWeeks();
const DEMO_RUNWAY   = { weeks: 10.4, current_cash: 142800, min_threshold: 50000, next_draw_date: '2026-03-05', next_draw_amount: 45200 };
const SCENARIO_TABS = ['Expected', 'Best Case', 'Worst Case'];

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function CashTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const byKey = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      color: 'var(--text-primary)',
      minWidth: 180,
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 700 }}>{label}</p>
      {byKey.totalIn   != null && <p style={{ color: 'var(--status-profit)', margin: '2px 0' }}>Inflows: {money(byKey.totalIn)}</p>}
      {byKey.totalOut  != null && <p style={{ color: 'var(--status-loss)', margin: '2px 0' }}>Outflows: {money(byKey.totalOut)}</p>}
      {byKey.netFlow   != null && (
        <p style={{ color: byKey.netFlow >= 0 ? 'var(--status-profit)' : 'var(--status-loss)', margin: '2px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: 4, marginTop: 4, fontWeight: 600 }}>
          Net: {byKey.netFlow < 0 ? `(${money(Math.abs(byKey.netFlow))})` : money(byKey.netFlow)}
        </p>
      )}
      {byKey.endingCash != null && (
        <p style={{ color: 'var(--accent)', margin: '2px 0', fontWeight: 700 }}>
          Ending Cash: {money(byKey.endingCash)}
        </p>
      )}
    </div>
  );
}

// ─── Runway hero card ─────────────────────────────────────────────────────────
function RunwayHero({ runway }) {
  const weeks   = runway?.weeks ?? DEMO_RUNWAY.weeks;
  const current = runway?.current_cash ?? DEMO_RUNWAY.current_cash;
  const minThresh = runway?.min_threshold ?? DEMO_RUNWAY.min_threshold;
  const isAlarm   = weeks < 8;
  const isWarn    = weeks >= 8 && weeks < 12;
  const color     = isAlarm ? 'var(--status-loss)' : isWarn ? 'var(--status-warning)' : 'var(--status-profit)';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `2px solid ${isAlarm ? 'var(--status-loss)' : 'var(--border-subtle)'}`,
      borderRadius: 8,
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isAlarm && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'var(--status-loss)',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
          Cash Runway
        </span>
        {isAlarm && <AlertTriangle size={13} style={{ color: 'var(--status-loss)' }} />}
      </div>
      <div style={{
        fontSize: 48,
        fontWeight: 900,
        color,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {weeks.toFixed(1)}
        <span style={{ fontSize: 20, fontWeight: 700, marginLeft: 6, color }}>WEEKS</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
        Current cash: <strong style={{ color: 'var(--text-primary)' }}>{money(current)}</strong>
        {' · '}
        Min threshold: <strong style={{ color: 'var(--status-warning)' }}>{money(minThresh)}</strong>
      </div>
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[...Array(11)].map((_, i) => (
        <td key={i} style={{ padding: '10px 12px' }}>
          <div style={{
            height: 13, borderRadius: 4,
            background: 'var(--border-subtle)',
            width: i === 0 ? '40px' : i === 1 ? '70px' : '60px',
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CashFlow() {
  const tc = useThemeColors();
  const [scenario, setScenario]   = useState('Expected');
  const [weeks, setWeeks]         = useState(DEMO_WEEKS);
  const [runway, setRunway]       = useState(DEMO_RUNWAY);
  const [loading, setLoading]     = useState(false);

  // Load runway on mount
  useEffect(() => {
    api.cashRunway?.()
      .then((d) => { if (d) setRunway(d); })
      .catch(() => {});
  }, []);

  // Load scenario data
  useEffect(() => {
    setLoading(true);
    api.cashFlowForecast?.(scenario.toLowerCase().replace(' ', '_'))
      .then((d) => { if (d?.length) setWeeks(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scenario]);

  // KPI derived values
  const startCash   = runway?.current_cash ?? DEMO_RUNWAY.current_cash;
  const lowestCash  = Math.min(...weeks.map((w) => w.endingCash));
  const nextDraw    = runway?.next_draw_amount ?? DEMO_RUNWAY.next_draw_amount;
  const nextDrawDate = runway?.next_draw_date ?? DEMO_RUNWAY.next_draw_date;
  const nextDrawLabel = nextDrawDate
    ? new Date(nextDrawDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—';

  // Y-axis tick formatter
  function yAxisFmt(v) {
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
    return `$${v}`;
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
          Cash Flow Forecast
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          13-week rolling — Expected · Best Case · Worst Case
        </p>
      </div>

      {/* ── Runway hero + KPI strip ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* Hero */}
        <RunwayHero runway={runway} />

        {/* Starting Cash */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Starting Cash
            </span>
            <DollarSign size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {money(startCash)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>as of today</div>
        </div>

        {/* Lowest Projected */}
        <div style={{
          background: 'var(--bg-card)',
          border: `1px solid ${lowestCash < 50000 ? 'var(--status-loss)' : lowestCash < 75000 ? 'var(--status-warning)' : 'var(--border-subtle)'}`,
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Lowest Projected
            </span>
            <TrendingDown size={15} style={{ color: lowestCash < 50000 ? 'var(--status-loss)' : lowestCash < 75000 ? 'var(--status-warning)' : 'var(--text-tertiary)' }} />
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800,
            color: lowestCash < 50000 ? 'var(--status-loss)' : lowestCash < 75000 ? 'var(--status-warning)' : 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {money(lowestCash)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>over 13-week window</div>
        </div>

        {/* Next Draw */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 8, padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Next Draw Expected
            </span>
            <Calendar size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--status-profit)', fontVariantNumeric: 'tabular-nums' }}>
            {money(nextDraw)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{nextDrawLabel}</div>
        </div>
      </div>

      {/* ── Scenario tabs ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 4,
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 0,
      }}>
        {SCENARIO_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            style={{
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: scenario === s ? 700 : 400,
              color: scenario === s ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: scenario === s ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s',
              marginBottom: -1,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Main ComposedChart ─────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '20px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            13-Week Cash Flow — {scenario}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Bars: weekly inflows / outflows · Line: cumulative cash position · Dashed: $50K minimum threshold
          </p>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={weeks} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={tc.borderSubtle} />
            <XAxis
              dataKey="weekLabel"
              stroke={tc.textSecondary}
              fontSize={11}
              tick={{ fill: tc.textSecondary }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tickFormatter={yAxisFmt}
              stroke={tc.textSecondary}
              fontSize={11}
              tick={{ fill: tc.textSecondary }}
            />
            <Tooltip content={<CashTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: tc.textSecondary, paddingTop: 8 }}
            />
            <ReferenceLine
              y={50000}
              stroke="var(--status-warning)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: '$50K min', fill: tc.statusWarning, fontSize: 10, position: 'insideTopRight' }}
            />
            <Bar
              dataKey="totalIn"
              name="Inflows"
              fill="var(--status-profit)"
              fillOpacity={0.75}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="totalOut"
              name="Outflows"
              fill="var(--status-loss)"
              fillOpacity={0.75}
              radius={[3, 3, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="endingCash"
              name="Cash Position"
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Weekly Table ───────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Weekly Detail</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Row highlighted yellow if ending cash &lt;$75K · red if &lt;$50K
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="mc-table">
            <thead>
              <tr>
                <th className="num">Wk #</th>
                <th>Week Starting</th>
                <th className="num">Draws</th>
                <th className="num">AR Collections</th>
                <th className="num">Total In</th>
                <th className="num">Payroll</th>
                <th className="num">Vendor Pmts</th>
                <th className="num">Debt Service</th>
                <th className="num">Total Out</th>
                <th className="num">Net Flow</th>
                <th className="num">Ending Cash</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : weeks.map((w) => {
                    const isCritical = w.endingCash < 50000;
                    const isWarning  = !isCritical && w.endingCash < 75000;
                    const rowBg      = isCritical
                      ? 'rgba(var(--status-loss-rgb, 251, 113, 133), 0.08)'
                      : isWarning
                        ? 'rgba(var(--status-warning-rgb, 251, 191, 36), 0.06)'
                        : undefined;

                    return (
                      <tr key={w.weekNum} style={{ background: rowBg }}>
                        <td className="num" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{w.weekNum}</td>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: 13 }}>
                          {new Date(w.weekDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="num" style={{ color: w.draws > 0 ? 'var(--status-profit)' : 'var(--text-tertiary)' }}>
                          {w.draws > 0 ? money(w.draws) : '—'}
                        </td>
                        <td className="num">{money(w.arCollections)}</td>
                        <td className="num" style={{ fontWeight: 600, color: 'var(--status-profit)' }}>
                          {money(w.totalIn)}
                        </td>
                        <td className="num">{money(w.payroll)}</td>
                        <td className="num">{money(w.vendorPayments)}</td>
                        <td className="num">{money(w.debtService)}</td>
                        <td className="num" style={{ fontWeight: 600, color: 'var(--status-loss)' }}>
                          {money(w.totalOut)}
                        </td>
                        <td className="num" style={{
                          fontWeight: 700,
                          color: w.netFlow >= 0 ? 'var(--status-profit)' : 'var(--status-loss)',
                        }}>
                          {w.netFlow < 0 ? `(${money(Math.abs(w.netFlow))})` : money(w.netFlow)}
                        </td>
                        <td className="num" style={{
                          fontWeight: 700,
                          color: isCritical
                            ? 'var(--status-loss)'
                            : isWarning
                              ? 'var(--status-warning)'
                              : 'var(--text-primary)',
                        }}>
                          {money(w.endingCash)}
                          {isCritical && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--status-loss)' }}>
                              ▼ CRIT
                            </span>
                          )}
                          {isWarning && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--status-warning)' }}>
                              ▲ WARN
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend footnote ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        padding: '12px 16px',
        background: 'var(--bg-elevated)',
        borderRadius: 8,
        border: '1px solid var(--border-subtle)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Row indicators:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--status-warning)', opacity: 0.7 }} />
          <span>Yellow — ending cash &lt; $75,000</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--status-loss)', opacity: 0.7 }} />
          <span>Red — ending cash &lt; $50,000 (critical threshold)</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block', width: 24, height: 2,
            background: 'var(--status-warning)',
            backgroundImage: 'repeating-linear-gradient(90deg, var(--status-warning) 0, var(--status-warning) 6px, transparent 6px, transparent 9px)',
          }} />
          <span>Dashed line — $50K minimum threshold</span>
        </span>
      </div>
    </div>
  );
}
