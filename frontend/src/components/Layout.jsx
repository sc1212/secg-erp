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
  LayoutDashboard, FolderKanban, DollarSign, CreditCard,
  Users, Handshake, UserCog, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X, Sun, Moon, Crosshair,
  CalendarDays, FileText, FolderArchive, Truck, Package,
  ShieldCheck, Wrench, Sunrise, FileCheck, Clock, Building2,
  TrendingDown, BarChart3,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { api } from '../lib/api';

// ── Demo notifications (shown when backend returns nothing) ───────────────

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Exception: Unmapped Cost Code',
    body: 'Cost event #2847 — Home Depot $847 needs review',
    link: '/exceptions',
    is_read: false,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 2,
    title: 'PO Approval Needed',
    body: 'PO-0047 for $12,500 (ACE Plumbing) awaits approval',
    link: '/decisions',
    is_read: false,
    created_at: new Date(Date.now() - 57 * 60000).toISOString(),
  },
  {
    id: 3,
    title: 'COI Expiring in 14 Days',
    body: 'ACE Plumbing COI expires Mar 8 — request renewal',
    link: '/vendors',
    is_read: true,
    created_at: new Date(Date.now() - 23 * 3600000).toISOString(),
  },
  {
    id: 4,
    title: 'Critical Stock: PEX 3/4"',
    body: '2 units remaining — reorder needed',
    link: '/inventory',
    is_read: true,
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
  },
];

function formatTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Navigation ────────────────────────────────────────────────────────────

const navSections = [
  {
    label: 'Command',
    items: [
      { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/mission',  icon: Crosshair,       label: 'Mission Control' },
      { to: '/briefing', icon: Sunrise,         label: 'Morning Briefing' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/projects',   icon: FolderKanban, label: 'Projects' },
      { to: '/calendar',   icon: CalendarDays, label: 'Calendar' },
      { to: '/daily-logs', icon: FileText,     label: 'Daily Logs' },
      { to: '/fleet',      icon: Truck,        label: 'Fleet' },
      { to: '/inventory',  icon: Package,      label: 'Inventory' },
      { to: '/permits',    icon: FileCheck,    label: 'Permits & Inspections' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/financials',  icon: DollarSign,   label: 'Financials' },
      { to: '/payments',    icon: CreditCard,   label: 'Payments' },
      { to: '/vendors',     icon: Handshake,    label: 'Vendors' },
      { to: '/draws',       icon: Building2,    label: 'Draws' },
      { to: '/profit-fade', icon: TrendingDown, label: 'Profit Fade' },
      { to: '/cash-flow',   icon: BarChart3,    label: 'Cash Flow' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/team',      icon: UserCog, label: 'Team & Scorecard' },
      { to: '/timeclock', icon: Clock,   label: 'Time Clock' },
      { to: '/crm',       icon: Users,   label: 'CRM' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/documents',  icon: FolderArchive, label: 'Documents' },
      { to: '/safety',     icon: ShieldCheck,   label: 'Safety' },
      { to: '/warranties', icon: Wrench,        label: 'Warranties' },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────

function SideLink({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `sidebar-link${isActive ? ' active' : ''}${collapsed ? ' collapsed' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} strokeWidth={1.75} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

function initTheme() {
  const saved = localStorage.getItem('secg-theme');
  if (saved === 'midnight' || saved === 'arctic') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'arctic' : 'midnight';
}

// ── Layout ────────────────────────────────────────────────────────────────

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(initTheme);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  useLocation(); // re-render on route change to close mobile menu

  // Theme persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('secg-theme', theme);
  }, [theme]);

  // Click-outside to close notification panel
  useEffect(() => {
    function handleOutsideClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Load notification data from backend (falls back to demo)
  useEffect(() => {
    api.unreadCount()
      .then(r => setUnreadCount(r.count))
      .catch(() => {});
    api.myNotifications({ limit: 20 })
      .then(data => { if (data && data.length > 0) setNotifications(data); })
      .catch(() => {});
  }, []);

  function toggleTheme() {
    setTheme(t => (t === 'midnight' ? 'arctic' : 'midnight'));
  }

  function handleNotifClick(n) {
    if (!n.is_read) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev =>
        prev.map(x => (x.id === n.id ? { ...x, is_read: true } : x))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifOpen(false);
    const link = n.link || n.action_url;
    if (link) navigate(link);
  }

  function markAllRead() {
    api.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always dark in both themes */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full flex flex-col transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: 'var(--bg-deepest)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--text-inverse)' }}
          >
            SE
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: 'var(--sidebar-text-active)' }}>
                Southeast Enterprise
              </div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--sidebar-text)' }}>
                ERP Platform
              </div>
            </div>
          )}
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-2 pb-3 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div
                  className="px-2 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}
                >
                  {section.label}
                </div>
              )}
              {collapsed && <div className="pt-3" />}
              <div className="space-y-0.5">
                {section.items.map((n) => (
                  <SideLink key={n.to} {...n} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 transition-colors"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            color: 'var(--sidebar-text)',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            background: theme === 'midnight'
              ? 'rgba(12, 18, 32, 0.85)'
              : 'rgba(244, 245, 247, 0.92)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Search */}
            <div
              className="search-wrap hidden sm:flex items-center gap-2 px-3 py-2 text-sm rounded"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-tertiary)',
              }}
            >
              <Search size={15} />
              <span style={{ fontSize: 13 }}>Search... ⌘K</span>
            </div>
          </div>

          <div className="topbar-right flex items-center gap-3">
            {/* Notification bell with dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Notifications"
                onClick={() => setNotifOpen(o => !o)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: 'var(--status-loss)', color: '#fff' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 top-8 w-80 rounded-lg shadow-xl z-50 overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Notifications
                    </span>
                    <button
                      onClick={markAllRead}
                      className="text-xs"
                      style={{ color: 'var(--accent)' }}
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
                    {notifications.length === 0 ? (
                      <div
                        className="px-4 py-8 text-center text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        All caught up!
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className="w-full text-left px-4 py-3 transition-opacity hover:opacity-80"
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: n.is_read ? 'transparent' : 'var(--accent-bg)',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {!n.is_read && (
                              <div
                                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                style={{ background: 'var(--accent)' }}
                              />
                            )}
                            <div className="min-w-0">
                              <div
                                className="text-xs font-medium truncate"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {n.title}
                              </div>
                              {n.body && (
                                <div
                                  className="text-xs mt-0.5 line-clamp-2"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {n.body}
                                </div>
                              )}
                              <div
                                className="text-[10px] mt-1"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {formatTimeAgo(n.created_at)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
