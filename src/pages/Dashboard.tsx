import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { state, totalBalance, totalIncome, totalExpense, getCategory, getWallet } = useApp();
  const { user, isGuest } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'শুভ সকাল';
    if (h < 17) return 'শুভ অপরাহ্ন';
    return 'শুভ সন্ধ্যা';
  })();

  const recentTransactions = state.transactions.slice(0, 5);

  // Budget status
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = state.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  const budgetStatus = useMemo(() => {
    return state.budgets
      .filter(b => b.month === currentMonth && b.categoryId)
      .map(b => {
        const cat = state.categories.find(c => c.id === b.categoryId);
        const spent = monthExpenses.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
        return { ...b, spent, cat };
      })
      .slice(0, 6);
  }, [state.budgets, state.categories, monthExpenses, currentMonth]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">হ্যালো, {displayName}!</h1>
          <p className="text-muted-foreground text-sm">{greeting}</p>
        </div>
        <span className="text-4xl">👋</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <motion.div variants={itemVariants} className="glass-card-primary rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm opacity-80 font-medium">মোট ব্যালেন্স</span>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 rounded-lg hover:bg-white/10">
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <h2 className="text-4xl font-extrabold mb-6">
                {showBalance ? `৳${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '৳ ••••••'}
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2.5 flex-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowDownLeft size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-70">আয়</p>
                    <p className="text-sm font-bold">৳{totalIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2.5 flex-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-70">ব্যয়</p>
                    <p className="text-sm font-bold">৳{totalExpense.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base">সাম্প্রতিক লেনদেন</h3>
              <button onClick={() => navigate('/transactions')} className="text-sm text-primary font-medium flex items-center gap-1">
                সব দেখুন <ChevronRight size={14} />
              </button>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-muted-foreground text-sm">No transactions yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Click + to add your first transaction</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentTransactions.map(txn => {
                    const cat = getCategory(txn.categoryId);
                    const wal = getWallet(txn.walletId);
                    return (
                      <div
                        key={txn.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate('/transactions')}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat?.color + '18' }}>
                          {cat?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{cat?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {txn.note || wal?.name || ''} · {format(new Date(txn.date), 'dd MMM, yyyy')}
                          </p>
                        </div>
                        <span className={`font-bold text-sm ${txn.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {txn.type === 'income' ? '+' : '-'}৳{txn.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Wallets / Accounts */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base">অ্যাকাউন্ট</h3>
              <button onClick={() => navigate('/wallets')} className="text-sm text-primary font-medium flex items-center gap-1">
                সব দেখুন <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {state.wallets.map(wallet => (
                <div
                  key={wallet.id}
                  className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/wallets')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{wallet.icon}</span>
                    <span className="text-xs text-muted-foreground capitalize">{wallet.type === 'bank' ? 'ব্যাংক' : wallet.type === 'cash' ? 'নগদ' : 'মোবাইল'}</span>
                  </div>
                  <p className="font-bold text-lg">৳{wallet.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Budget Status */}
          {budgetStatus.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base">বাজেট স্ট্যাটাস</h3>
                <button onClick={() => navigate('/budgets')} className="text-sm text-primary font-medium flex items-center gap-1">
                  সব দেখুন <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {budgetStatus.map(b => {
                  const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
                  const over = pct > 100;
                  return (
                    <div key={b.id} className="bg-card rounded-2xl border border-border p-4 text-center">
                      <span className="text-2xl block mb-1">{b.cat?.icon || '📊'}</span>
                      <p className="text-xs font-semibold mb-1">{b.cat?.name}</p>
                      <p className={`text-[10px] ${over ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {over ? 'বাজেট ছেড়ে গেছে!' : 'বাজেটে আছে'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
