import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';

export default function Search() {
  const { state, getCategory, getWallet, t, catName } = useApp();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return state.transactions.filter(tx => {
      const cat = getCategory(tx.categoryId);
      const wal = getWallet(tx.walletId);
      const hay = [
        cat?.name, cat?.nameBn, wal?.name, tx.note,
        String(tx.amount), tx.date, tx.type
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(query);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [q, state.transactions, getCategory, getWallet]);

  return (
    <div className="py-4 space-y-4">
      <h2 className="text-xl font-bold">{t('search')}</h2>

      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={state.language === 'bn' ? 'ক্যাটাগরি, নোট বা পরিমাণ লিখুন...' : 'Type category, note or amount...'}
          className="w-full pl-11 pr-4 py-3 bg-card rounded-2xl outline-none font-medium border border-border focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {!q.trim() ? (
        <div className="text-center py-16 text-muted-foreground">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">{state.language === 'bn' ? 'লেনদেন খুঁজতে কিছু লিখুন' : 'Start typing to search transactions'}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-muted-foreground">{state.language === 'bn' ? 'কিছু পাওয়া যায়নি' : 'No results found'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((txn, i) => {
            const cat = getCategory(txn.categoryId);
            const wal = getWallet(txn.walletId);
            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="bg-card border border-border rounded-2xl p-3.5 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: (cat?.color || '#999') + '18' }}>
                  {cat?.icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{cat ? catName(cat) : '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {txn.note || wal?.name} · {format(new Date(txn.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className={`font-bold text-sm ${txn.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {txn.type === 'income' ? '+' : '-'}৳{txn.amount.toLocaleString()}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
