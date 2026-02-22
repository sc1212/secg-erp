import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { money } from '../lib/format';
import { PROJECTS, STATUS_LABEL, STATUS_COLOR } from '../lib/demoData';

const FILTERS = ['All', 'Active', 'Pre-Con', 'At Risk', 'Completed'];

function SortIcon({ field, sort }) {
  if (sort.field !== field) return <ChevronUp size={10} style={{ opacity: 0.25, marginLeft: 3 }} />;
  return sort.dir === 'asc'
    ? <ChevronUp   size={10} style={{ marginLeft: 3, color: '#3b82f6' }} />
    : <ChevronDown size={10} style={{ marginLeft: 3, color: '#3b82f6' }} />;
}

function matchFilter(p, f) {
  if (f === 'All')       return true;
  if (f === 'Active')    return p.phase !== 'Pre-Construction' && p.status !== 'complete';
  if (f === 'Pre-Con')   return p.phase === 'Pre-Construction';
  if (f === 'At Risk')   return p.status === 'over_budget' || p.status === 'watch';
  if (f === 'Completed') return p.status === 'complete';
  return true;
}

export default function Projects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState({ field: 'name', dir: 'asc' });

  function toggleSort(field) {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' });
  }

  const rows = useMemo(() => {
    let list = PROJECTS.filter(p => matchFilter(p, filter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.pm.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let av = a[sort.field], bv = b[sort.field];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filter, search, sort]);

  const totalContract = rows.reduce((s, p) => s + p.contract, 0);
  const totalSpent    = rows.reduce((s, p) => s + p.spent, 0);

  const thStyle = (right) => ({
    padding: '10px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: 'var(--text-secondary)', cursor: 'pointer',
    borderBottom: '1px solid var(--color-brand-border)',
    textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap', userSelect: 'none',
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Jobs</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {PROJECTS.length} projects  ·  {money(PROJECTS.reduce((s,p)=>s+p.contract,0), true)} total contract
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project, PM, or address..."
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              borderRadius: 8, border: '1px solid var(--color-brand-border)',
              background: 'var(--color-brand-card)', color: 'var(--text-primary)', fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${filter === f ? '#3b82f6' : 'var(--color-brand-border)'}`,
              background: filter === f ? 'rgba(59,130,246,0.14)' : 'transparent',
              color: filter === f ? '#3b82f6' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-brand-card)', border: '1px solid var(--color-brand-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[['Project','name',false],['Address','address',false],['PM','pm',false],
                  ['Phase','phase',false],['Contract','contract',true],['Spent','spent',true],
                  ['Remaining','rem',true],['Margin %','margin_pct',true],['Complete','pct',true],
                ].map(([label, field, right]) => (
                  <th key={label} onClick={() => toggleSort(field)} style={thStyle(right)}>
                    {label} <SortIcon field={field} sort={sort} />
                  </th>
                ))}
                <th style={{ ...thStyle(false), cursor: 'default' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No projects match.</td></tr>
              )}
              {rows.map((p) => {
                const sc  = STATUS_COLOR[p.status] || STATUS_COLOR.on_budget;
                const rem = p.contract - p.spent;
                return (
                  <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                    style={{ borderTop: '1px solid var(--color-brand-border)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{p.code}</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{p.address}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{p.pm.split(' ')[0]}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.phase}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right', whiteSpace: 'nowrap' }}>{money(p.contract)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace', textAlign: 'right', whiteSpace: 'nowrap' }}>{money(p.spent)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', whiteSpace: 'nowrap', color: rem < 0 ? 'var(--status-loss)' : 'var(--text-primary)' }}>{money(rem)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700, color: p.margin_pct < 5 ? 'var(--status-loss)' : p.margin_pct < 12 ? 'var(--status-warning)' : 'var(--status-profit)' }}>{p.margin_pct}%</td>
                    <td style={{ padding: '11px 14px', minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${p.pct}%`, borderRadius: 2, background: sc.color }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{p.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length > 0 && (
                <tr style={{ borderTop: '2px solid var(--color-brand-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={4} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>TOTALS  ·  {rows.length} projects</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalContract)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalSpent)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textAlign: 'right', color: 'var(--text-primary)' }}>{money(totalContract - totalSpent)}</td>
                  <td colSpan={3} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
