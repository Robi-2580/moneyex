import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Wallet, BarChart3, Settings, Plus, Moon, Sun,
  ReceiptText, Search, Landmark, Tag, Menu, LogOut, BookOpen, WifiOff, CloudOff,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AddTransactionModal } from '@/components/AddTransactionModal';

export default function AppLayout() {
  const [showAdd, setShowAdd] = useState(false);
  const [prefilledCategoryId, setPrefilledCategoryId] = useState<string | undefined>();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('mm-sidebar-collapsed') === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('mm-sidebar-collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);
  const { state, dispatch, t, isOnline, pendingSync } = useApp();
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

  const SidebarContent = ({ onNavigate, isCollapsed = false }: { onNavigate?: () => void; isCollapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-border shrink-0 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md" style={{ background: 'var(--gradient-primary)' }}>FC</div>
        {!isCollapsed && <h1 className="text-base font-bold whitespace-nowrap gradient-text">Finance Control</h1>}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-3 ${isCollapsed ? 'px-2' : 'px-3'} space-y-1 overflow-y-auto`}>
        {sidebarItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium transition-all relative group
              ${isActive
                ? 'bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r-full before:bg-primary'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2 py-2`}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md shrink-0" style={{ background: 'var(--gradient-primary)' }}>
            {displayName[0]?.toUpperCase()}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'Guest Mode'}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive" title={t('logout')}>
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-border bg-sidebar shrink-0 transition-[width] duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-60'}`}>
        <SidebarContent isCollapsed={collapsed} />
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
              className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border flex flex-col"
            >
              <SidebarContent onNavigate={() => setMobileSidebar(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden p-2 rounded-xl hover:bg-muted">
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="hidden md:flex p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Online/Offline status */}
            {!isOnline ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-semibold" title="অফলাইন — ডাটা লোকাল সেভ হচ্ছে">
                <WifiOff size={14} />
                <span className="hidden sm:inline">{state.language === 'bn' ? 'অফলাইন' : 'Offline'}</span>
                {pendingSync > 0 && <span className="bg-amber-500 text-white rounded-full px-1.5 text-[10px]">{pendingSync}</span>}
              </div>
            ) : pendingSync > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-semibold" title="সিঙ্ক হচ্ছে...">
                <CloudOff size={14} className="animate-pulse" />
                <span className="hidden sm:inline">{state.language === 'bn' ? 'সিঙ্ক হচ্ছে' : 'Syncing'}</span>
                <span className="bg-blue-500 text-white rounded-full px-1.5 text-[10px]">{pendingSync}</span>
              </div>
            ) : null}
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
