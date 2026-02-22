import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, FileText, Search, Settings, User, LogOut,
  Sun, Moon, AlertTriangle, CalendarDays, BriefcaseBusiness, DollarSign,
  Users, FolderKanban, ClipboardList, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const menus = [
  { label: 'Dashboard', to: '/' },
  {
    label: 'Jobs', items: [
      { label: 'Jobs List', to: '/projects', icon: FolderKanban },
      { label: 'Job Summary', to: '/projects', icon: FileText },
      { label: 'Job Costing', to: '/financials', icon: DollarSign },
      { divider: true },
      { label: 'Stage Gates', to: '/mission-control', icon: AlertTriangle },
      { label: 'Profit Fade Dashboard', to: '/financials', icon: DollarSign },
    ],
  },
  {
    label: 'Operations', items: [
      { label: 'Schedule / Calendar', to: '/calendar', icon: CalendarDays },
      { label: 'Daily Logs', to: '/daily-logs', icon: ClipboardList },
      { label: 'To-Do / Punch List', to: '/mission-control', icon: ClipboardList },
      { divider: true },
      { label: 'Weather', to: '/', icon: Sun },
      { label: 'Fleet & Equipment', to: '/fleet', icon: BriefcaseBusiness },
      { label: 'Materials & Inventory', to: '/inventory', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'Financial', items: [
      { label: 'Financial Overview', to: '/financials', icon: DollarSign },
      { label: 'Pay Bills', to: '/payments', icon: DollarSign },
      { label: 'Request Payment / Draws', to: '/payments', icon: DollarSign },
      { label: 'QuickBooks Sync Status', to: '/financials', icon: AlertTriangle },
    ],
  },
  {
    label: 'Vendors', items: [
      { label: 'Vendor Directory', to: '/vendors', icon: Users },
      { label: 'Compliance Tracker', to: '/vendors', icon: Shield },
      { label: 'Add New Vendor', to: '/vendors', icon: Users },
    ],
  },
  {
    label: 'Files', items: [
      { label: 'Document Vault', to: '/documents', icon: FileText },
      { label: 'Plans & Drawings', to: '/documents', icon: FileText },
      { label: 'Upload Document', to: '/documents', icon: FileText },
    ],
  },
  {
    label: 'Reports', items: [
      { label: 'Report Builder', to: '/', icon: FileText },
      { label: 'Budget vs Actual', to: '/financials', icon: DollarSign },
      { label: 'Morning Briefing Config', to: '/', icon: Sun },
    ],
  },
];

function Dropdown({ menu, activePath }) {
  const [open, setOpen] = useState(false);
  let timeout;
  const hasActiveChild = menu.items?.some((item) => item.to && activePath.startsWith(item.to));
  return (
    <div
      className="relative"
      onMouseEnter={() => { clearTimeout(timeout); timeout = null; setOpen(true); }}
      onMouseLeave={() => { timeout = setTimeout(() => setOpen(false), 300); }}
    >
      <button className={`px-3 py-2 text-sm font-medium inline-flex items-center gap-1 border-b-2 ${hasActiveChild ? 'border-brand-gold text-brand-text' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
        {menu.label} <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 min-w-64 rounded-lg border border-brand-border bg-brand-card shadow-2xl z-50">
          <div className="p-2">
            {menu.items.map((item, idx) => item.divider ? (
              <div key={idx} className="my-2 border-t border-brand-border" />
            ) : (
              <Link key={item.label} to={item.to} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-brand-card-hover border-l-4 border-transparent hover:border-brand-gold">
                {item.icon ? <item.icon size={14} className="text-brand-muted" /> : null}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs = useMemo(() => {
    const arr = [{ label: 'Dashboard', to: '/' }];
    let path = '';
    parts.forEach((p) => {
      path += `/${p}`;
      arr.push({ label: p.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()), to: path });
    });
    return arr;
  }, [parts]);

  return (
    <div className="text-xs text-brand-muted px-6 py-2 border-b border-brand-border bg-brand-surface">
      {crumbs.map((c, idx) => (
        <span key={c.to}>
          <Link to={c.to} className="hover:text-brand-text">{c.label}</Link>
          {idx < crumbs.length - 1 ? ' > ' : ''}
        </span>
      ))}
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('secg-theme') || 'midnight');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ results: {} });
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unread_count: 0, items: [] });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('secg-theme', theme);
  }, [theme]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) return setResults({ results: {} });
      try { setResults(await api.search(query, 'projects,vendors,employees,documents', 5)); } catch { setResults({ results: {} }); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadNotifications = async () => {
    try { setNotifications(await api.notifications('all', 20)); } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const groupedResults = Object.entries(results.results || {});

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-surface">
        <div className="h-16 px-6 flex items-center gap-4">
          <Link to="/" className="w-8 h-8 rounded bg-brand-gold text-brand-bg font-bold flex items-center justify-center">SE</Link>
          <nav className="hidden md:flex items-center gap-1">
            {menus.map((menu) => menu.to ? (
              <NavLink key={menu.label} to={menu.to} className={({ isActive }) => `px-3 py-2 text-sm font-medium border-b-2 ${isActive ? 'border-brand-gold text-brand-text' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>{menu.label}</NavLink>
            ) : <Dropdown key={menu.label} menu={menu} activePath={pathname} />)}
          </nav>

          <div className="ml-auto flex items-center gap-2 relative">
            <button onClick={() => setSearchOpen((v) => !v)} className="p-2 rounded-md hover:bg-brand-card-hover"><Search size={17} /></button>
            {searchOpen && (
              <div className="absolute right-0 top-12 w-[420px] bg-brand-card border border-brand-border rounded-lg shadow-2xl p-2">
                <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Search projects, vendors, documents... (⌘K)" className="w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2 text-sm" />
                <div className="max-h-72 overflow-auto mt-2">
                  {!query.trim() ? <div className="text-xs text-brand-muted px-2 py-2">Recent searches will appear here.</div> : groupedResults.length === 0 ? <div className="text-xs text-brand-muted px-2 py-2">No results for '{query}'.</div> : groupedResults.map(([type, items]) => (
                    <div key={type} className="mb-2">
                      <div className="px-2 text-[11px] uppercase text-brand-muted">{type}</div>
                      {items.map((r) => <button key={`${type}-${r.id}`} onClick={() => { navigate(r.url); setSearchOpen(false); }} className="w-full text-left px-2 py-2 rounded hover:bg-brand-card-hover"><div className="text-sm">{r.title}</div><div className="text-xs text-brand-muted">{r.subtitle}</div></button>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={async () => { await loadNotifications(); setNotifOpen((v) => !v); }} className="p-2 rounded-md hover:bg-brand-card-hover relative">
              <Bell size={17} />
              {notifications.unread_count > 0 && <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{notifications.unread_count}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-[380px] bg-brand-card border border-brand-border rounded-lg shadow-2xl p-3">
                <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Notifications</h3><button className="text-xs text-brand-gold" onClick={async () => { await api.markAllNotificationsRead(); await loadNotifications(); }}>Mark All</button></div>
                <div className="max-h-80 overflow-auto space-y-2">
                  {notifications.items.map((n) => <button key={n.id} onClick={async () => { await api.markNotificationRead(n.id); if (n.action_url) navigate(n.action_url); setNotifOpen(false); }} className="w-full text-left p-2 rounded hover:bg-brand-card-hover border border-brand-border/50">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-brand-muted">{n.body || n.category}</div>
                  </button>)}
                </div>
              </div>
            )}

            <button onClick={() => setProfileOpen((v) => !v)} className="px-2 py-1.5 rounded-md hover:bg-brand-card-hover inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-gold text-brand-bg flex items-center justify-center text-xs font-bold">{(user?.first_name || 'U')[0]}</div>
              <span className="text-sm hidden sm:block">{user?.first_name || 'Samuel'}</span>
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-60 bg-brand-card border border-brand-border rounded-lg shadow-2xl p-2">
                <div className="px-2 py-2 border-b border-brand-border mb-2"><div className="text-sm font-semibold">{user?.first_name || 'Samuel'} {user?.last_name || ''}</div><div className="text-xs text-brand-muted">{user?.role || 'Director of Finance'}</div></div>
                <button className="w-full text-left px-2 py-2 rounded hover:bg-brand-card-hover text-sm inline-flex items-center gap-2"><User size={14} /> My Profile</button>
                <button className="w-full text-left px-2 py-2 rounded hover:bg-brand-card-hover text-sm inline-flex items-center gap-2"><Settings size={14} /> Settings</button>
                <button onClick={() => setTheme(theme === 'midnight' ? 'arctic' : 'midnight')} className="w-full text-left px-2 py-2 rounded hover:bg-brand-card-hover text-sm inline-flex items-center gap-2">{theme === 'midnight' ? <Sun size={14} /> : <Moon size={14} />} Theme</button>
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-2 py-2 rounded hover:bg-brand-card-hover text-sm inline-flex items-center gap-2 text-danger"><LogOut size={14} /> Sign Out</button>
              </div>
            )}
import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Search, Menu, X, Sun, Moon, ChevronDown, ChevronRight,
  User, Settings, Palette, Link2, Upload, HelpCircle, LogOut,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from './NotificationPanel';
import MorningBriefingOverlay from './MorningBriefingOverlay';
import { api } from '../lib/api';

// ── Theme Context ────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: 'midnight', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

// ── Selected Project Context (for Jobs menu drill-down) ──────────────────────
export const ProjectContext = createContext({ selectedProject: null, setSelectedProject: () => {} });
export const useSelectedProject = () => useContext(ProjectContext);

function initTheme() {
  const saved = localStorage.getItem('secg-theme');
  if (saved === 'midnight' || saved === 'arctic') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'arctic' : 'midnight';
}

// ── Navigation Menu Definitions ──────────────────────────────────────────────

const NAV_MENUS = [
  { label: 'Dashboard', to: '/', exact: true },
  {
    label: 'Jobs',
    activeRoutes: ['/projects', '/profit-fade', '/crm'],
    groups: [
      {
        items: [
          { icon: '\u{1F4CB}', label: 'Jobs List', to: '/projects', desc: 'All projects with filters' },
          { icon: '\u{2139}\u{FE0F}', label: 'Job Summary', to: '/projects/last', projectAware: true, desc: 'Single project overview' },
          { icon: '\u{1F4B0}', label: 'Job Costing', to: '/projects/last?tab=costs', projectAware: true, desc: 'Budget vs actual by cost code' },
          { icon: '\u{1F4CA}', label: 'Job Price Summary', to: '/projects/last?tab=sov', projectAware: true, desc: 'Contract, COs, margin' },
        ],
      },
      {
        items: [
          { icon: '\u{1F6A6}', label: 'Stage Gates', to: '/projects?view=stages', desc: 'Lifecycle phase view' },
          { icon: '\u{1F4C8}', label: 'Profit Fade Dashboard', to: '/profit-fade', desc: 'Early warning across all jobs' },
          { icon: '\u{1F3D7}\u{FE0F}', label: 'Bid Pipeline', to: '/crm', desc: 'Estimates & proposals' },
        ],
      },
    ],
  },
  {
    label: 'Operations',
    activeRoutes: ['/calendar', '/daily-logs', '/decisions', '/warranties', '/timeclock', '/documents', '/portal', '/weather', '/fleet', '/inventory', '/permits', '/safety'],
    groups: [
      {
        items: [
          { icon: '\u{1F4C5}', label: 'Schedule / Calendar', to: '/calendar', desc: 'Inspections, milestones, deadlines' },
          { icon: '\u{1F4DD}', label: 'Daily Logs', to: '/daily-logs', desc: 'Field logs & photos' },
          { icon: '\u{2705}', label: 'Punch List', to: '/decisions', desc: 'QA/QC items' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4D1}', label: 'Change Orders', to: '/projects/last?tab=cos', projectAware: true, desc: 'Create, track, approve' },
          { icon: '\u{1F512}', label: 'Warranties', to: '/warranties', desc: 'Warranty & callbacks' },
          { icon: '\u{23F0}', label: 'Time Clock', to: '/timeclock', desc: 'GPS clock in/out' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4D0}', label: 'Plans and Specs', to: '/documents?type=plans', desc: 'Plans, specs, drawings' },
          { icon: '\u{1F465}', label: 'Client Updates', to: '/portal', desc: 'Client portal management' },
        ],
      },
      {
        items: [
          { icon: '\u{26C5}', label: 'Weather', to: '/weather', desc: 'Weather intelligence' },
          { icon: '\u{1F697}', label: 'Fleet & Equipment', to: '/fleet', desc: 'Vehicle tracking' },
          { icon: '\u{1F4E6}', label: 'Materials & Inventory', to: '/inventory', desc: 'Materials tracking' },
          { icon: '\u{1F50D}', label: 'Permits & Inspections', to: '/permits', desc: 'Permit tracker' },
          { icon: '\u{1F6E1}\u{FE0F}', label: 'Safety & Compliance', to: '/safety', desc: 'Incident tracking' },
        ],
      },
    ],
  },
  {
    label: 'Financial',
    activeRoutes: ['/financials', '/cash-flow', '/payments', '/draws', '/exceptions'],
    groups: [
      {
        items: [
          { icon: '\u{1F4B5}', label: 'Financial Overview', to: '/financials', desc: 'Financial command center' },
          { icon: '\u{1F4CA}', label: 'Cash Flow Forecast', to: '/cash-flow', desc: '13-week projection' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4E5}', label: 'Accounts Payable', to: '/financials?tab=ap', desc: 'Vendor invoices/bills' },
          { icon: '\u{1F4E4}', label: 'Accounts Receivable', to: '/financials?tab=ar', desc: 'Customer invoices' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4B3}', label: 'Pay Bills', to: '/payments', desc: 'Vendor payment workflow' },
          { icon: '\u{1F4E8}', label: 'Request Payment / Draws', to: '/draws', desc: 'Draw request builder' },
          { icon: '\u{1F9FE}', label: 'Invoicing', to: '/financials?tab=ar', desc: 'Create/send invoices' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4CB}', label: 'Purchase Orders', to: '/exceptions', desc: 'Commitments & PO control' },
          { icon: '\u{1F4D2}', label: 'Cost Code Manager', to: '/projects?view=costcodes', desc: 'Chart of accounts setup' },
        ],
      },
      {
        items: [
          { icon: '\u{1F504}', label: 'QuickBooks Sync Status', to: '/financials?tab=sync', desc: 'Integration status' },
          { icon: '\u{1F4D1}', label: 'Period Close / Snapshots', to: '/financials?tab=snapshots', desc: 'Monthly close' },
        ],
      },
    ],
  },
  {
    label: 'Vendors',
    activeRoutes: ['/vendors', '/team'],
    groups: [
      {
        items: [
          { icon: '\u{1F4C7}', label: 'Vendor Directory', to: '/vendors', desc: 'All vendors, dense log view' },
          { icon: '\u{1F4CA}', label: 'Vendor Scorecard', to: '/scorecard', desc: 'Performance ratings' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4CB}', label: 'Compliance Tracker', to: '/vendors?tab=compliance', desc: 'COI, W9, insurance' },
          { icon: '\u{1F3F7}\u{FE0F}', label: 'Subcontractor Portal', to: '/portal', desc: 'Sub-facing portal' },
        ],
      },
    ],
  },
  {
    label: 'Files',
    activeRoutes: ['/documents'],
    groups: [
      {
        items: [
          { icon: '\u{1F4C1}', label: 'Document Vault', to: '/documents', desc: 'All documents' },
          { icon: '\u{1F4C4}', label: 'Contracts', to: '/documents?type=contracts', desc: 'Contracts only' },
          { icon: '\u{1F5BC}\u{FE0F}', label: 'Photos', to: '/documents?type=photos', desc: 'All project photos' },
          { icon: '\u{1F4D0}', label: 'Plans & Drawings', to: '/documents?type=plans', desc: 'Plans/specs' },
          { icon: '\u{1F4CB}', label: 'COIs & Insurance', to: '/documents?type=coi', desc: 'Compliance docs' },
        ],
      },
    ],
  },
  {
    label: 'Reports',
    activeRoutes: ['/mission', '/briefing', '/scorecard'],
    groups: [
      {
        items: [
          { icon: '\u{1F4CA}', label: 'Report Builder', to: '/mission', desc: 'Custom reports' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4B0}', label: 'Job Cost Detail', to: '/projects?report=cost', desc: 'Per-project cost breakdown' },
          { icon: '\u{1F4C8}', label: 'Profit & Loss by Job', to: '/financials?tab=pl', desc: 'P&L per project' },
          { icon: '\u{1F4B5}', label: 'Cash Flow Report', to: '/cash-flow', desc: 'Historical + projected' },
          { icon: '\u{1F477}', label: 'Labor Cost Report', to: '/team', desc: 'Payroll by project' },
        ],
      },
      {
        items: [
          { icon: '\u{1F4CA}', label: 'Budget vs Actual', to: '/projects?report=variance', desc: 'Variance analysis' },
          { icon: '\u{1F3C6}', label: 'Historical Cost Intel', to: '/mission?tab=intel', desc: 'Completed project costs' },
        ],
      },
      {
        items: [
          { icon: '\u{1F305}', label: 'Morning Briefing Config', to: '/briefing', desc: 'Customize briefing' },
          { icon: '\u{1F464}', label: 'Employee Scorecard', to: '/scorecard', desc: 'Team performance' },
        ],
      },
    ],
  },
];

// ── Breadcrumb Mapping ───────────────────────────────────────────────────────
const ROUTE_LABELS = {
  '/': 'Dashboard',
  '/projects': 'Jobs',
  '/calendar': 'Calendar',
  '/daily-logs': 'Daily Logs',
  '/fleet': 'Fleet & Equipment',
  '/inventory': 'Materials & Inventory',
  '/permits': 'Permits & Inspections',
  '/financials': 'Financial Overview',
  '/payments': 'Pay Bills',
  '/vendors': 'Vendor Directory',
  '/draws': 'Draw Requests',
  '/profit-fade': 'Profit Fade',
  '/cash-flow': 'Cash Flow Forecast',
  '/team': 'Team',
  '/timeclock': 'Time Clock',
  '/crm': 'Bid Pipeline',
  '/documents': 'Document Vault',
  '/safety': 'Safety & Compliance',
  '/warranties': 'Warranties',
  '/decisions': 'Approvals',
  '/exceptions': 'Purchase Orders',
  '/weather': 'Weather',
  '/scorecard': 'Scorecard',
  '/portal': 'Client Portal',
  '/mission': 'Mission Control',
  '/briefing': 'Morning Briefing',
};

function getBreadcrumbs(pathname) {
  if (pathname === '/') return [{ label: 'Dashboard', to: '/' }];
  const crumbs = [{ label: 'Dashboard', to: '/' }];
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'projects' && segments[1]) {
    crumbs.push({ label: 'Jobs', to: '/projects' });
    crumbs.push({ label: `Project #${segments[1]}`, to: pathname });
  } else {
    const fullPath = '/' + segments[0];
    crumbs.push({ label: ROUTE_LABELS[fullPath] || segments[0], to: fullPath });
  }

  return crumbs;
}

// ── NavDropdown Component ────────────────────────────────────────────────────

function NavDropdown({ menu, isActive, onNavigate }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const menuRef = useRef(null);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), 100);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), 250);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(o => !o);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      className="nav-dropdown-wrap"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={menuRef}
    >
      <button
        className={`nav-top-item${isActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {menu.label}
        <ChevronDown size={13} style={{ marginLeft: 3, opacity: 0.5 }} />
      </button>

      {open && (
        <div className="nav-dropdown-panel" role="menu">
          <div className="nav-dropdown-caret" />
          {menu.groups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="nav-dropdown-divider" />}
              {group.items.map((item) => (
                <button
                  key={item.to}
                  className="nav-dropdown-item"
                  role="menuitem"
                  onClick={() => { setOpen(false); onNavigate(item); }}
                >
                  <span className="nav-dropdown-icon">{item.icon}</span>
                  <div className="nav-dropdown-text">
                    <span className="nav-dropdown-label">{item.label}</span>
                    {item.desc && <span className="nav-dropdown-desc">{item.desc}</span>}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Menu Component ───────────────────────────────────────────────────

function ProfileMenu({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    { icon: User, label: 'My Profile', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => navigate('/briefing') },
    { icon: Palette, label: `Theme (${theme === 'midnight' ? 'Dark' : 'Light'})`, action: toggleTheme },
    { icon: Link2, label: 'Integrations', action: () => {} },
    { icon: Upload, label: 'Import Data', action: () => {} },
    'divider',
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    { icon: LogOut, label: 'Sign Out', action: () => navigate('/login') },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        className="profile-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Profile menu"
      >
        <div className="profile-avatar">SH</div>
        <span className="profile-name">Samuel</span>
        <ChevronDown size={13} style={{ opacity: 0.5 }} />
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-header-name">Samuel Harrison</div>
            <div className="profile-header-role">Director of Finance</div>
            <div className="profile-header-email">samuel@secg.com</div>
          </div>
          <div className="profile-divider" />
          {menuItems.map((item, i) =>
            item === 'divider' ? (
              <div key={i} className="profile-divider" />
            ) : (
              <button
                key={i}
                className="profile-menu-item"
                onClick={() => { item.action(); setOpen(false); }}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({ isOpen, onClose, onNavigate }) {
  const [expandedMenu, setExpandedMenu] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-overlay" onClick={onClose} />
      <div className="mobile-menu-panel">
        <div className="mobile-menu-header">
          <div className="flex items-center gap-2">
            <div className="nav-logo-badge">SE</div>
            <span className="nav-logo-text">Southeast ERP</span>
          </div>
          <button onClick={onClose} className="mobile-close-btn"><X size={20} /></button>
        </div>
        <nav className="mobile-menu-nav">
          {NAV_MENUS.map((menu) => (
            <div key={menu.label}>
              {menu.to ? (
                <button
                  className="mobile-nav-item"
                  onClick={() => { onNavigate({ to: menu.to }); onClose(); }}
                >
                  {menu.label}
                </button>
              ) : (
                <>
                  <button
                    className="mobile-nav-item"
                    onClick={() => setExpandedMenu(expandedMenu === menu.label ? null : menu.label)}
                  >
                    {menu.label}
                    <ChevronRight
                      size={14}
                      style={{
                        transform: expandedMenu === menu.label ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.15s',
                      }}
                    />
                  </button>
                  {expandedMenu === menu.label && menu.groups && (
                    <div className="mobile-submenu">
                      {menu.groups.map((group, gi) => (
                        <div key={gi}>
                          {gi > 0 && <div className="nav-dropdown-divider" style={{ margin: '4px 0' }} />}
                          {group.items.map((item) => (
                            <button
                              key={item.to}
                              className="mobile-sub-item"
                              onClick={() => { onNavigate(item); onClose(); }}
                            >
                              <span style={{ fontSize: 14 }}>{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

// ── Main Layout ──────────────────────────────────────────────────────────────

export default function Layout() {
  const [theme, setTheme] = useState(initTheme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([]);
  const [selectedProject, setSelectedProject] = useState(() => {
    try { return JSON.parse(localStorage.getItem('secg-selected-project')); } catch { return null; }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Theme persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('secg-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'midnight' ? 'arctic' : 'midnight'));
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Persist selected project
  useEffect(() => {
    if (selectedProject) localStorage.setItem('secg-selected-project', JSON.stringify(selectedProject));
  }, [selectedProject]);

  // Morning briefing check
  useEffect(() => {
    const lastShown = localStorage.getItem('secg-briefing-shown');
    const now = Date.now();
    if (!lastShown || now - parseInt(lastShown, 10) > 4 * 60 * 60 * 1000) {
      setShowBriefing(true);
    }
  }, []);

  // Load notifications
  useEffect(() => {
    const demoNotifs = [
      { id: 1, title: 'Draw request needs approval', body: 'Oak Creek \u2014 $45,000', severity: 'critical', link: '/draws', is_read: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString(), category: 'Financial' },
      { id: 2, title: 'COI expiring in 3 days', body: 'Williams Electric', severity: 'warning', link: '/vendors?tab=compliance', is_read: false, created_at: new Date(Date.now() - 5 * 3600000).toISOString(), category: 'Compliance' },
      { id: 3, title: 'Daily log submitted', body: 'Connor \u2014 Riverside Custom', severity: 'info', link: '/daily-logs', is_read: false, created_at: new Date(Date.now() - 6 * 3600000).toISOString(), category: 'Field' },
      { id: 4, title: 'QuickBooks sync completed', body: '47 transactions synced', severity: 'success', link: '/financials?tab=sync', is_read: true, created_at: new Date(Date.now() - 24 * 3600000).toISOString(), category: 'Sync' },
      { id: 5, title: 'Invoice overdue', body: 'Johnson Corp \u2014 $18,200', severity: 'critical', link: '/financials?tab=ar', is_read: true, created_at: new Date(Date.now() - 25 * 3600000).toISOString(), category: 'Financial' },
      { id: 6, title: 'Budget threshold exceeded', body: 'PRJ-051 at 96% of budget', severity: 'warning', link: '/projects/3?tab=costs', is_read: true, created_at: new Date(Date.now() - 30 * 3600000).toISOString(), category: 'Financial' },
    ];
    api.myNotifications({ limit: 20 })
      .then(data => { if (data?.length) setNotifications(data); else setNotifications(demoNotifs); })
      .catch(() => setNotifications(demoNotifs));
    api.unreadCount()
      .then(r => setUnreadCount(r.count))
      .catch(() => setUnreadCount(3));
  }, []);

  // Click outside for notif
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cmd+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  function handleNavigate(item) {
    let to = item.to;
    if (item.projectAware) {
      if (selectedProject) {
        to = to.replace('/last', `/${selectedProject.id}`);
      } else {
        to = '/projects';
      }
    }
    navigate(to);
  }

  function handleNotifClick(n) {
    if (!n.is_read) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  }

  function markAllRead() {
    api.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  function dismissBriefing() {
    localStorage.setItem('secg-briefing-shown', Date.now().toString());
    setShowBriefing(false);
  }

  function isMenuActive(menu) {
    if (menu.to) return menu.exact ? location.pathname === menu.to : location.pathname.startsWith(menu.to);
    return menu.activeRoutes?.some(r => location.pathname.startsWith(r));
  }

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
        <div className="layout-root">
          {/* ── Morning Briefing Overlay ────────────────────────────── */}
          {showBriefing && (
            <MorningBriefingOverlay onDismiss={dismissBriefing} onNavigate={(to) => { dismissBriefing(); navigate(to); }} />
          )}

          {/* ── Top Navigation Bar ─────────────────────────────────── */}
          <header className="top-nav" style={{ background: theme === 'midnight' ? 'rgba(8, 12, 20, 0.95)' : 'rgba(255, 255, 255, 0.97)' }}>
            <div className="top-nav-inner">
              {/* Left: Logo + Nav Items */}
              <div className="nav-left">
                <button className="mobile-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                  <Menu size={20} />
                </button>
                <NavLink to="/" className="nav-logo" aria-label="Home">
                  <div className="nav-logo-badge">SE</div>
                  <span className="nav-logo-text">SECG</span>
                </NavLink>

                <nav className="nav-items" role="navigation" aria-label="Main navigation">
                  {NAV_MENUS.map((menu) =>
                    menu.to ? (
                      <NavLink
                        key={menu.label}
                        to={menu.to}
                        end={menu.exact}
                        className={({ isActive }) => `nav-top-item${isActive ? ' active' : ''}`}
                      >
                        {menu.label}
                      </NavLink>
                    ) : (
                      <NavDropdown
                        key={menu.label}
                        menu={menu}
                        isActive={isMenuActive(menu)}
                        onNavigate={handleNavigate}
                      />
                    )
                  )}
                </nav>
              </div>

              {/* Right: Search, Notifications, Profile */}
              <div className="nav-right">
                <button
                  className="nav-search-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                >
                  <Search size={16} />
                  <span className="nav-search-hint">Search... \u2318K</span>
                </button>

                <div className="relative" ref={notifRef}>
                  <button
                    className="nav-icon-btn"
                    onClick={() => setNotifOpen(o => !o)}
                    aria-label="Notifications"
                  >
                    <Bell size={17} />
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </button>
                  {notifOpen && (
                    <NotificationPanel
                      notifications={notifications}
                      onClickItem={handleNotifClick}
                      onMarkAllRead={markAllRead}
                      onClose={() => setNotifOpen(false)}
                    />
                  )}
                </div>

                <ProfileMenu theme={theme} toggleTheme={toggleTheme} />
              </div>
            </div>
          </header>

          {/* ── Breadcrumb Bar ──────────────────────────────────────── */}
          {location.pathname !== '/' && (
            <div className="breadcrumb-bar">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.to} className="breadcrumb-item">
                  {i > 0 && <ChevronRight size={12} className="breadcrumb-sep" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="breadcrumb-current">{crumb.label}</span>
                  ) : (
                    <NavLink to={crumb.to} className="breadcrumb-link">{crumb.label}</NavLink>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* ── Page Content ───────────────────────────────────────── */}
          <main className="layout-main" style={{ background: 'var(--bg-base)' }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>

          {/* ── Search Modal ───────────────────────────────────────── */}
          {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

          {/* ── Mobile Menu ────────────────────────────────────────── */}
          <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onNavigate={handleNavigate} />
        </div>
      </ProjectContext.Provider>
    </ThemeContext.Provider>
            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'midnight' ? 'Switch to Arctic Command (light mode)' : 'Switch to Midnight Studio (dark mode)'}
              aria-pressed={theme === 'arctic'}
              title={theme === 'midnight' ? 'Arctic Command' : 'Midnight Studio'}
            >
              {theme === 'midnight' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* User avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
              MS
            </div>
          </div>
        </div>
      </header>

      <Breadcrumbs />

      <main className="p-6">
        <Outlet />
      </main>
        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          style={{ background: 'var(--bg-base, #F8FAFC)', transition: 'background-color 0.25s ease' }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
