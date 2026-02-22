import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, DollarSign, CreditCard,
  Users, Handshake, UserCog, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X, Sun, Moon, Crosshair,
  CalendarDays, FileText, CloudSun, FolderArchive,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

const navSections = [
  {
    label: 'Command',
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/mission',   icon: Crosshair,       label: 'Mission Control' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/projects',   icon: FolderKanban, label: 'Projects' },
      { to: '/calendar',   icon: CalendarDays, label: 'Calendar' },
      { to: '/daily-logs', icon: FileText,     label: 'Daily Logs' },
      { to: '/weather',    icon: CloudSun,     label: 'Weather' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/financials', icon: DollarSign, label: 'Financials' },
      { to: '/payments',   icon: CreditCard, label: 'Payments' },
      { to: '/vendors',    icon: Handshake,  label: 'Vendors' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/team', icon: UserCog, label: 'Team' },
      { to: '/crm',  icon: Users,   label: 'CRM' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/documents', icon: FolderArchive, label: 'Documents' },
    ],
  },
];

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

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(initTheme);
  useLocation(); // re-render on route change to close mobile menu

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('secg-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'midnight' ? 'arctic' : 'midnight'));
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
            {/* Notification bell */}
            <button
              className="relative transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'var(--status-loss)', color: '#fff' }}
              >
                3
              </span>
            </button>

            {/* Theme toggle — icon shows current state: Moon = dark, Sun = light */}
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
        </header>

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
