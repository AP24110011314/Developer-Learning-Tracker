import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ListChecks, Target, FolderGit2, Settings, User,
  Menu, X, LogOut, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import Logo from './Logo.jsx';

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/problems',  label: 'Problems',  icon: ListChecks },
  { to: '/goals',     label: 'Goals',     icon: Target },
  { to: '/projects',  label: 'Projects',  icon: FolderGit2 },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

function SidebarContent({ collapsed, setCollapsed, onClose }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    onClose?.();
    await logout();
    nav('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <Link to="/" aria-label="BigO home" onClick={onClose}>
            <Logo size={32} withText />
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto" aria-label="BigO home" onClick={onClose}>
            <Logo size={32} />
          </Link>
        )}
        {setCollapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[var(--border)]">
        {user && (
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <Link
              to={`/u/${user.username}`}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0"
              title={`View @${user.username}'s profile`}
            >
              {user.username[0].toUpperCase()}
            </Link>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user.username}
                </div>
                <div className="text-xs text-[var(--text-muted)] truncate">{user.email}</div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={doLogout}
                aria-label="Log out"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-rose-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Bottom tab bar for mobile */
function BottomTabBar() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--border)] px-1 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.filter((item) => item.to !== '/settings').map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-600 font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] active:scale-95'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50 text-primary-600' : ''}`}>
                  <Icon size={19} />
                </div>
                <span className="text-[10px] leading-tight mt-0.5 tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'text-primary-600 font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] active:scale-95'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50 text-primary-600' : ''}`}>
                <Settings size={19} />
              </div>
              <span className="text-[10px] leading-tight mt-0.5 tracking-tight">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

/**
 * App shell wraps all authenticated pages.
 * Renders a collapsible sidebar on desktop, bottom tab bar on mobile,
 * and a sticky glassmorphism top bar.
 */
export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />

      <div className="flex min-h-screen bg-[var(--bg-page)]">
        {/* ── Desktop sidebar ─────────────────────────────────────── */}
        <aside
          className={`hidden lg:flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)] sticky top-0 h-screen shrink-0 transition-all duration-200 ${
            collapsed ? 'w-16' : 'w-60'
          }`}
        >
          <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
        </aside>

        {/* ── Mobile sidebar overlay ───────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[var(--border)] lg:hidden shadow-2xl"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky top bar */}
          <header className="glass sticky top-0 z-30 px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
            {/* Mobile menu button + brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 -ml-1 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-input)] active:scale-95 transition-colors"
              >
                <Menu size={22} />
              </button>
              <Link to="/" aria-label="BigO home" className="flex items-center">
                <Logo size={26} withText />
              </Link>
            </div>

            {/* Spacer on desktop */}
            <div className="hidden lg:block" />

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {user && (
                <Link
                  to={`/u/${user.username}`}
                  className="flex items-center gap-2 p-1 pl-2 sm:px-2 py-1 rounded-xl hover:bg-[var(--bg-input)] transition-colors group"
                  aria-label={`View profile of ${user.username}`}
                >
                  <span className="hidden sm:inline text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    @{user.username}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-xs">
                    {user.username[0].toUpperCase()}
                  </div>
                </Link>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-3.5 sm:p-5 md:p-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────── */}
      <BottomTabBar />
    </>
  );
}
