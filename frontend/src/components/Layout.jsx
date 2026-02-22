import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
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
  );
}
