import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Wallet, BarChart3, Settings, Plus, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AddTransactionModal } from '@/components/AddTransactionModal';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/wallets', icon: Wallet, label: 'Wallets' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'More' },
];

export default function AppLayout() {
  const [showAdd, setShowAdd] = useState(false);
  const { state, dispatch } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold gradient-text">💰 MoneyFlow</h1>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            {state.isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto pb-24 px-4">
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
      </main>

      {/* FAB */}
      <motion.button
        className="fab-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAdd(true)}
      >
        <Plus size={24} />
      </motion.button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item py-1 px-3 rounded-xl ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Add Transaction Modal */}
      <AddTransactionModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
