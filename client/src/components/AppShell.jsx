import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ListChecks, Target, FolderGit2, Settings, User,
  Sun, Moon, Menu, X, Search, LogOut, ChevronLeft,
  Zap, BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/problems',  label: 'Problems',  icon: ListChecks },
  { to: '/goals',     label: 'Goals',     icon: Target },
  { to: '/projects',  label: 'Projects',  icon: FolderGit2 },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function SidebarContent({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    await logout();
    nav('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-[var(--text-primary)] text-lg tracking-tight">
              DLT
            </span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors"
        >
          <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border)] px-2 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.filter(item => item.to !== '/settings').map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-500'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-primary-500' : ''} />
                <span className="text-[10px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'text-primary-500'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={20} className={isActive ? 'text-primary-500' : ''} />
              <span className="text-[10px]">Settings</span>
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
  const { theme, toggle } = useTheme();

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
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border)] lg:hidden"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <SidebarContent collapsed={false} setCollapsed={setCollapsed} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky top bar */}
          <header className="glass sticky top-0 z-30 px-4 h-14 flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Spacer on desktop */}
            <div className="hidden lg:block" />

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <Link
                  to={`/u/${user.username}`}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold"
                  aria-label={`View profile of ${user.username}`}
                >
                  {user.username[0].toUpperCase()}
                </Link>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────── */}
      <BottomTabBar />
    </>
  );
}
