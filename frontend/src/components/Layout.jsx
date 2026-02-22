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
          </div>
        </div>
      </header>

      <Breadcrumbs />

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
