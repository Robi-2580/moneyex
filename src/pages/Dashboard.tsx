import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoanSummaryCard from '@/components/LoanSummaryCard';
import QuickEntryGrid from '@/components/QuickEntryGrid';
import AccountsOverview from '@/components/AccountsOverview';

export default function Dashboard() {
  const { state, totalBalance, totalIncome, totalExpense, getCategory, getWallet, t, catName } = useApp();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{ openQuickAdd: (catId?: string) => void }>();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guest';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  })();

  const recentTransactions = state.transactions.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">{t('hello')}, {displayName}!</h1>
          <p className="text-muted-foreground text-sm">{greeting}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Balance Card */}
          <motion.div variants={itemVariants} className="glass-card-primary rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm opacity-80 font-medium">{t('totalBalance')}</span>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 rounded-lg hover:bg-white/10">
                  {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <h2 className="text-3xl font-extrabold mb-4">
                {showBalance ? `৳${totalBalance.toLocaleString('en-IN')}` : '৳ ••••••'}
              </h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowDownLeft size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-70">{t('income')}</p>
                    <p className="text-sm font-bold">৳{totalIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 flex-1">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowUpRight size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-70">{t('expense')}</p>
                    <p className="text-sm font-bold">৳{totalExpense.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">{t('recentTransactions')}</h3>
              <button onClick={() => navigate('/transactions')} className="text-xs text-primary font-medium flex items-center gap-1">
                {t('viewAll')} <ChevronRight size={14} />
              </button>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-muted-foreground text-sm">{t('noTransactions')}</p>
                  <p className="text-muted-foreground text-xs mt-1">{t('clickToAdd')}</p>
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
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: (cat?.color || '#999') + '18' }}>
                          {cat?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{cat ? catName(cat) : 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {txn.note || (wal?.name || '')} · {format(new Date(txn.date), 'dd MMM, yyyy')}
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
        <div className="space-y-5">
          {/* Accounts Overview */}
          <motion.div variants={itemVariants}>
            <AccountsOverview />
          </motion.div>

          {/* Loan Summary */}
          <motion.div variants={itemVariants}>
            <LoanSummaryCard />
          </motion.div>

          {/* Budget Status / Quick Entry */}
          <motion.div variants={itemVariants}>
            <QuickEntryGrid onQuickAdd={openQuickAdd} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
