import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Pencil, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { AddTransactionModal } from '@/components/AddTransactionModal';

export default function Transactions() {
  const { state, dispatch, getCategory, getWallet } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return state.transactions
      .filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (search) {
          const cat = getCategory(t.categoryId);
          const wal = getWallet(t.walletId);
          const text = `${cat?.name} ${wal?.name} ${t.note}`.toLowerCase();
          if (!text.includes(search.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, filterType, search, getCategory, getWallet]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach(t => {
      const key = t.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="py-4 space-y-4">
      <h2 className="text-xl font-bold">Transactions</h2>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
          className="w-full pl-11 pr-4 py-3 bg-card rounded-2xl outline-none font-medium border border-border focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 p-1 bg-muted rounded-2xl">
        {(['all', 'income', 'expense'] as const).map(f => (
          <button key={f} onClick={() => setFilterType(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filterType === f ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        grouped.map(([date, txns]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">{format(new Date(date), 'EEEE, MMM d, yyyy')}</p>
            <div className="space-y-2">
              {txns.map((txn, i) => {
                const cat = getCategory(txn.categoryId);
                const wal = getWallet(txn.walletId);
                return (
                  <motion.div key={txn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat?.color + '18' }}>
                      {cat?.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{cat?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{txn.note || wal?.name}</p>
                    </div>
                    <span className={`font-bold text-sm mr-1 ${txn.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {txn.type === 'income' ? '+' : '-'}৳{txn.amount.toLocaleString()}
                    </span>
                    <div className="flex gap-0.5">
                      <button onClick={() => setEditTxn(txn)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil size={14} /></button>
                      <button onClick={() => dispatch({ type: 'DELETE_TRANSACTION', payload: txn })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {editTxn && (
        <AddTransactionModal open={!!editTxn} onClose={() => setEditTxn(null)} editTransaction={editTxn} />
      )}
    </div>
  );
}
