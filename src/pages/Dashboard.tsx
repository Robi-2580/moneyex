import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { state, totalBalance, totalIncome, totalExpense, getCategory, getWallet } = useApp();
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  const recentTransactions = state.transactions.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className="py-4 space-y-5" variants={containerVariants} initial="hidden" animate="show">
      {/* Balance Card */}
      <motion.div variants={itemVariants} className="glass-card-primary rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm opacity-80 font-medium">Total Balance</span>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 rounded-lg hover:bg-white/10">
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <h2 className="text-3xl font-extrabold mb-6">
            {showBalance ? `৳${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '৳ ••••••'}
          </h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowDownLeft size={16} />
              </div>
              <div>
                <p className="text-[10px] opacity-70">Income</p>
                <p className="text-sm font-bold">৳{totalIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
              <div>
                <p className="text-[10px] opacity-70">Expense</p>
                <p className="text-sm font-bold">৳{totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wallets Preview */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">My Wallets</h3>
          <button onClick={() => navigate('/wallets')} className="text-sm text-primary font-medium">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {state.wallets.map((wallet, i) => (
            <motion.div
              key={wallet.id}
              variants={itemVariants}
              className="stat-card min-w-[140px] flex-shrink-0"
            >
              <span className="text-2xl mb-2 block">{wallet.icon}</span>
              <p className="text-xs text-muted-foreground font-medium">{wallet.name}</p>
              <p className="text-lg font-bold mt-1">৳{wallet.balance.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} className="text-sm text-primary font-medium">See all</button>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-muted-foreground text-sm">No transactions yet</p>
            <p className="text-muted-foreground text-xs mt-1">Tap + to add your first transaction</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map(txn => {
              const cat = getCategory(txn.categoryId);
              const wal = getWallet(txn.walletId);
              return (
                <motion.div
                  key={txn.id}
                  className="glass-card rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate('/transactions')}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat?.color + '18' }}>
                    {cat?.icon || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{cat?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{txn.note || wal?.name || ''} · {format(new Date(txn.date), 'MMM d')}</p>
                  </div>
                  <span className={`font-bold text-sm ${txn.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {txn.type === 'income' ? '+' : '-'}৳{txn.amount.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
