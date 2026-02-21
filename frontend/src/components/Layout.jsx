import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, DollarSign, CreditCard,
  Users, Handshake, UserCog, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X,
} from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/financials', icon: DollarSign, label: 'Financials' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/vendors', icon: Handshake, label: 'Vendors' },
  { to: '/crm', icon: Users, label: 'CRM' },
  { to: '/team', icon: UserCog, label: 'Team' },
];

function SideLink({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-gold/15 text-brand-gold'
            : 'text-brand-muted hover:text-brand-text hover:bg-brand-card-hover'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full bg-brand-surface border-r border-brand-border flex flex-col transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-brand-border ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg bg-brand-gold flex items-center justify-center font-bold text-brand-bg text-sm shrink-0">
            SE
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-brand-text truncate">Southeast Enterprise</div>
              <div className="text-[10px] text-brand-muted">ERP Platform</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <SideLink key={n.to} {...n} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-brand-border text-brand-muted hover:text-brand-text transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-brand-border bg-brand-surface/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-brand-muted hover:text-brand-text">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-brand-card rounded-lg px-3 py-2 text-sm text-brand-muted w-64">
              <Search size={16} />
              <span>Search... ⌘K</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-brand-muted hover:text-brand-text transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[10px] font-bold flex items-center justify-center text-white">3</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold text-xs font-semibold">
              MS
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
