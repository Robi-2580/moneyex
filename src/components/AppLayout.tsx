import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Wallet, BarChart3, Settings, Plus, Moon, Sun,
  ReceiptText, Search, Landmark, Tag, Menu, LogOut, BookOpen, WifiOff, CloudOff, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AddTransactionModal } from '@/components/AddTransactionModal';

export default function AppLayout() {
  const [showAdd, setShowAdd] = useState(false);
  const [prefilledCategoryId, setPrefilledCategoryId] = useState<string | undefined>();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const { state, dispatch, t } = useApp();
  const { user, isGuest, logout } = useAuth();
  const location = useLocation();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guest';

  const sidebarItems = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/wallets', icon: Wallet, label: t('accounts') },
    { to: '/reports', icon: BarChart3, label: t('reports') },
    { to: '/transactions', icon: ReceiptText, label: t('transactions') },
    { to: '/loans', icon: BookOpen, label: t('loanBook') },
    { to: '/search', icon: Search, label: t('search') },
    { to: '/budgets', icon: Landmark, label: t('budgets') },
    { to: '/categories', icon: Tag, label: t('categories') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  const openQuickAdd = (categoryId?: string) => {
    setPrefilledCategoryId(categoryId);
    setShowAdd(true);
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">FC</div>
        <h1 className="text-base font-bold whitespace-nowrap">Finance Control</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {sidebarItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'Guest Mode'}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title={t('logout')}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0">
        <SidebarContent />
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
              className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col"
            >
              <SidebarContent onNavigate={() => setMobileSidebar(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden p-2 rounded-xl hover:bg-muted">
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openQuickAdd()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t('addTransaction')}</span>
            </motion.button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              {state.isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
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
                <Outlet context={{ openQuickAdd }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setPrefilledCategoryId(undefined); }}
        prefilledCategoryId={prefilledCategoryId}
      />
    </div>
  );
}
