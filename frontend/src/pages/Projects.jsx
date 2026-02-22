import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { PROJECTS } from '../data/demoData';
import { money } from '../lib/format';

const filters = ['All', 'Active', 'Pre-Con', 'At Risk', 'Completed'];
const budgetDot = { on_budget: '#34d399', watch: '#fbbf24', over_budget: '#fb7185' };
const budgetLabel = { on_budget: 'On Budget', watch: 'Watch', over_budget: 'Over Budget' };

export default function Projects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...PROJECTS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.pm.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
    }
    if (filter === 'Active') list = list.filter(p => p.pct > 5 && p.pct < 100);
    else if (filter === 'Pre-Con') list = list.filter(p => p.phase === 'Pre-Con');
    else if (filter === 'At Risk') list = list.filter(p => p.budgetStatus === 'over_budget' || p.budgetStatus === 'watch');
    else if (filter === 'Completed') list = list.filter(p => p.pct >= 100);

    list.sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'name': av = a.name; bv = b.name; break;
        case 'pm': av = a.pm; bv = b.pm; break;
        case 'phase': av = a.phase; bv = b.phase; break;
        case 'contract': av = a.contract; bv = b.contract; break;
        case 'spent': av = a.spent; bv = b.spent; break;
        case 'remaining': av = a.contract - a.spent; bv = b.contract - b.spent; break;
        case 'margin': av = a.margin; bv = b.margin; break;
        case 'pct': av = a.pct; bv = b.pct; break;
        default: av = a.name; bv = b.name;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [search, filter, sortCol, sortDir]);

  const SH = ({ label, col, align }) => (
    <th
      onClick={() => handleSort(col)}
      style={{ padding: '10px 12px', cursor: 'pointer', userSelect: 'none', textAlign: align || 'left', whiteSpace: 'nowrap' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {label}
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 0 }}>
          <ChevronUp size={10} style={{ color: sortCol === col && sortDir === 'asc' ? 'var(--accent)' : 'var(--text-tertiary)', opacity: sortCol === col && sortDir === 'asc' ? 1 : 0.3, marginBottom: -2 }} />
          <ChevronDown size={10} style={{ color: sortCol === col && sortDir === 'desc' ? 'var(--accent)' : 'var(--text-tertiary)', opacity: sortCol === col && sortDir === 'desc' ? 1 : 0.3 }} />
        </span>
      </span>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>Jobs</h1>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div style={{ position: 'relative', maxWidth: 280, flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, PM, or address..."
            style={{
              width: '100%', padding: '8px 10px 8px 32px', borderRadius: 6,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)', fontSize: 13, outline: 'none',
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: filter === f ? '1px solid var(--accent)' : '1px solid var(--border-medium)',
                background: filter === f ? 'rgba(59,130,246,0.1)' : 'var(--bg-surface)',
                color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 8, border: '1px solid var(--border-medium)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'var(--bg-elevated)' }}>
              <SH label="Project" col="name" />
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Address</th>
              <SH label="PM" col="pm" />
              <SH label="Phase" col="phase" />
              <SH label="Contract" col="contract" align="right" />
              <SH label="Spent" col="spent" align="right" />
              <SH label="Remaining" col="remaining" align="right" />
              <SH label="Margin %" col="margin" align="right" />
              <SH label="Complete %" col="pct" align="right" />
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>{p.address}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{p.pm}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{p.phase}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{money(p.contract)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{money(p.spent)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{money(p.contract - p.spent)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: p.margin < 5 ? '#fb7185' : p.margin < 15 ? '#fbbf24' : '#34d399' }}>{p.margin}%</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{p.pct}%</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: budgetDot[p.budgetStatus] }} title={budgetLabel[p.budgetStatus]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
