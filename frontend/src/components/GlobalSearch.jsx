import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Construction, File, FileText, FolderKanban, Handshake, Home, Save, Search, Users } from 'lucide-react';
import { api } from '../lib/api';

const ENTITY_ICONS = {
  project: FolderKanban,
  vendor: Handshake,
  employee: Users,
  invoice: FileText,
  document: File,
};

const ENTITY_LABELS = {
  project: 'PROJECTS',
  vendor: 'VENDORS',
  employee: 'EMPLOYEES',
  invoice: 'INVOICES',
  document: 'DOCUMENTS',
};

// Demo search results for when backend search isn't available
function demoSearch(query) {
  const q = query.toLowerCase();
  const results = {};

  const projects = [
    { id: 1, title: 'Riverside Custom Home', subtitle: '123 River Rd, Murfreesboro \u2014 Active', url: '/projects/1' },
    { id: 2, title: 'Oak Creek Spec Home', subtitle: '456 Oak Dr, Franklin \u2014 Active', url: '/projects/2' },
    { id: 3, title: 'Magnolia Spec Home', subtitle: '789 Magnolia Ln, Brentwood \u2014 Active', url: '/projects/3' },
    { id: 4, title: 'Johnson Insurance Rehab', subtitle: '321 Johnson Ave, Antioch \u2014 Active', url: '/projects/4' },
    { id: 5, title: 'Berry Hill Commercial', subtitle: '555 Berry Rd, Nashville \u2014 Pre-Construction', url: '/projects/5' },
  ].filter(p => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q));

  const vendors = [
    { id: 1, title: 'Miller Concrete', subtitle: 'Concrete \u2014 Active', url: '/vendors?search=miller' },
    { id: 2, title: 'Williams Electric', subtitle: 'Electrical \u2014 Active', url: '/vendors?search=williams' },
    { id: 3, title: 'Carolina Framing', subtitle: 'Framing \u2014 Active', url: '/vendors?search=carolina' },
    { id: 4, title: '84 Lumber', subtitle: 'Material Supplier \u2014 Active', url: '/vendors?search=84+lumber' },
    { id: 5, title: 'TN Mechanical', subtitle: 'HVAC \u2014 Active', url: '/vendors?search=tn+mechanical' },
    { id: 6, title: 'Smith Plumbing', subtitle: 'Plumbing \u2014 Active', url: '/vendors?search=smith' },
  ].filter(v => v.title.toLowerCase().includes(q) || v.subtitle.toLowerCase().includes(q));

  const employees = [
    { id: 1, title: 'Matt Harrison', subtitle: 'Owner/CEO', url: '/team' },
    { id: 2, title: 'Samuel Harrison', subtitle: 'Director of Finance', url: '/team' },
    { id: 3, title: 'Connor M.', subtitle: 'Project Manager', url: '/team' },
    { id: 4, title: 'Joseph K.', subtitle: 'Project Manager', url: '/team' },
    { id: 5, title: 'Abi', subtitle: 'Office Manager', url: '/team' },
  ].filter(e => e.title.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q));

  const invoices = [
    { id: 1, title: 'INV-2025-089', subtitle: 'Miller Concrete \u2014 $8,400', url: '/payments' },
    { id: 2, title: 'INV-2025-092', subtitle: '84 Lumber \u2014 $12,100', url: '/payments' },
    { id: 3, title: 'INV-2025-088', subtitle: 'Williams Electric \u2014 $6,200', url: '/payments' },
  ].filter(inv => inv.title.toLowerCase().includes(q) || inv.subtitle.toLowerCase().includes(q));

  if (projects.length) results.project = projects.slice(0, 3);
  if (vendors.length) results.vendor = vendors.slice(0, 3);
  if (employees.length) results.employee = employees.slice(0, 3);
  if (invoices.length) results.invoice = invoices.slice(0, 3);

  return results;
}

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('secg-recent-searches') || '[]'); } catch { return []; }
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search — try backend, fall back to demo
  useEffect(() => {
    if (!query.trim()) { setResults({}); return; }
    const timer = setTimeout(() => {
      api.search(query)
        .then((data) => {
          // Transform backend response into our format
          const mapped = {};
          if (data.results?.projects?.length) {
            mapped.project = data.results.projects.map(p => ({
              id: p.id, title: p.name || p.code, subtitle: p.code || '', url: `/projects/${p.id}`,
            }));
          }
          if (data.results?.vendors?.length) {
            mapped.vendor = data.results.vendors.map(v => ({
              id: v.id, title: v.name, subtitle: v.trade || '', url: `/vendors/${v.id}`,
            }));
          }
          if (data.results?.employees?.length) {
            mapped.employee = data.results.employees.map(e => ({
              id: e.id, title: e.name, subtitle: e.role || '', url: '/team',
            }));
          }
          if (data.results?.invoices?.length) {
            mapped.invoice = data.results.invoices.map(inv => ({
              id: inv.id, title: inv.number, subtitle: `$${inv.amount}`, url: '/payments',
            }));
          }
          if (data.results?.documents?.length) {
            mapped.document = data.results.documents.map(d => ({
              id: d.id, title: d.title, subtitle: d.doc_type || '', url: '/documents',
            }));
          }
          const hasResults = Object.keys(mapped).length > 0;
          setResults(hasResults ? mapped : demoSearch(query));
        })
        .catch(() => setResults(demoSearch(query)));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const allResults = Object.entries(results).flatMap(([type, items]) =>
    items.map(item => ({ ...item, type }))
  );

  const handleSelect = useCallback((item) => {
    // Save to recent
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem('secg-recent-searches', JSON.stringify(updated));
    setRecentSearches(updated);

    onClose();
    navigate(item.url);
  }, [query, recentSearches, onClose, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && allResults[selectedIndex]) {
      handleSelect(allResults[selectedIndex]);
    }
  };

  const handleRecentClick = (term) => {
    setQuery(term);
  };

  const totalResults = allResults.length;

  return (
    <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-modal">
        {/* Search Input */}
        <div className="search-input-wrap">
          <Search size={18} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search projects, vendors, documents, invoices... (\u2318K)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
          <button className="search-esc" onClick={onClose}>ESC</button>
        </div>

        {/* Results */}
        <div className="search-results">
          {!query.trim() && recentSearches.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">RECENT SEARCHES</div>
              {recentSearches.map((term, i) => (
                <button key={i} className="search-recent-item" onClick={() => handleRecentClick(term)}>
                  <Search size={14} style={{ opacity: 0.4 }} />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="search-empty">
              No results for &ldquo;{query}&rdquo;. Try a different search term.
            </div>
          )}

          {Object.entries(results).map(([type, items]) => {
            const Icon = ENTITY_ICONS[type] || FileText;
            return (
              <div key={type} className="search-section">
                <div className="search-section-label">
                  <Icon size={13} style={{ opacity: 0.6 }} />
                  {ENTITY_LABELS[type] || type.toUpperCase()}
                </div>
                {items.map((item) => {
                  const flatIdx = allResults.findIndex(r => r.id === item.id && r.type === type);
                  return (
                    <button
                      key={item.id}
                      className={`search-result-item${flatIdx === selectedIndex ? ' selected' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(flatIdx)}
                    >
                      <div className="search-result-title">{item.title}</div>
                      <div className="search-result-subtitle">{item.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {totalResults > 0 && (
            <div className="search-footer">
              View all {totalResults} results \u2192
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
