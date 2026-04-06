import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Wallet, BarChart3, Settings, Plus, Moon, Sun,
  ReceiptText, Search, StickyNote, Landmark, Tag, Menu, X, LogOut, User, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AddTransactionModal } from '@/components/AddTransactionModal';

const sidebarItems = [
  { to: '/', icon: Home, label: 'হোম', labelEn: 'Home' },
  { to: '/wallets', icon: Wallet, label: 'অ্যাকাউন্ট', labelEn: 'Accounts' },
  { to: '/reports', icon: BarChart3, label: 'রিপোর্ট', labelEn: 'Reports' },
  { to: '/transactions', icon: ReceiptText, label: 'লেনদেন', labelEn: 'Transactions' },
  { to: '/budgets', icon: Landmark, label: 'বাজেট', labelEn: 'Budgets' },
  { to: '/categories', icon: Tag, label: 'ক্যাটাগরি', labelEn: 'Categories' },
  { to: '/settings', icon: Settings, label: 'সেটিংস', labelEn: 'Settings' },
];

export default function AppLayout() {
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { state, dispatch } = useApp();
  const { user, isGuest, logout } = useAuth();
  const location = useLocation();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Menu size={20} />
          </button>
          {sidebarOpen && <h1 className="text-lg font-bold gradient-text whitespace-nowrap">💰 MoneyFlow</h1>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map(({ to, icon: Icon, label, labelEn }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
              }
            >
              <Icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'Guest Mode'}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="w-full flex justify-center p-2.5 rounded-xl hover:bg-destructive/10 text-destructive" title="Logout">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                <h1 className="text-lg font-bold gradient-text">💰 MoneyFlow</h1>
                <button onClick={() => setMobileSidebar(false)} className="p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {sidebarItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setMobileSidebar(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
                    }
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                  </div>
                  <button onClick={logout} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden p-2 rounded-xl hover:bg-muted">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-semibold text-sm">{displayName} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Transaction</span>
            </motion.button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              {state.isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:hidden">
              {displayName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
