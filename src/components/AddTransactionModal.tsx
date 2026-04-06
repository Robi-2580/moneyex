import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  prefilledCategoryId?: string;
}

export function AddTransactionModal({ open, onClose, editTransaction, prefilledCategoryId }: Props) {
  const { state, dispatch, catName } = useApp();
  const [type, setType] = useState<'expense' | 'income'>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(editTransaction?.categoryId || '');
  const [walletId, setWalletId] = useState(editTransaction?.walletId || state.wallets[0]?.id || '');
  const [note, setNote] = useState(editTransaction?.note || '');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);

  // Handle prefilled category
  useEffect(() => {
    if (prefilledCategoryId && open) {
      const cat = state.categories.find(c => c.id === prefilledCategoryId);
      if (cat) {
        setCategoryId(prefilledCategoryId);
        setType(cat.type);
      }
    }
  }, [prefilledCategoryId, open, state.categories]);

  const filteredCategories = state.categories.filter(c => c.type === type);

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !categoryId || !walletId) return;

    const transaction: Transaction = {
      id: editTransaction?.id || `txn-${Date.now()}`,
      type,
      amount: amt,
      categoryId,
      walletId,
      note,
      date,
      createdAt: editTransaction?.createdAt || new Date().toISOString(),
    };

    if (editTransaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { old: editTransaction, new: transaction } });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setAmount('');
    setCategoryId('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={resetAndClose} />
          <motion.div
            className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editTransaction ? 'Edit' : 'Add'} Transaction</h2>
              <button onClick={resetAndClose} className="p-2 rounded-xl hover:bg-muted">
                <X size={20} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-2xl">
              {(['expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    type === t
                      ? t === 'expense'
                        ? 'bg-destructive text-destructive-foreground shadow-md'
                        : 'bg-success text-success-foreground shadow-md'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => { setType(t); setCategoryId(''); }}
                >
                  {t === 'expense' ? '💸 Expense' : '💰 Income'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-muted rounded-2xl text-2xl font-bold outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl text-xs transition-all ${
                      categoryId === cat.id
                        ? 'bg-primary/10 ring-2 ring-primary shadow-sm'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium truncate w-full text-center">{catName(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Wallet</label>
              <div className="relative">
                <select
                  value={walletId}
                  onChange={e => setWalletId(e.target.value)}
                  className="w-full py-3 px-4 bg-muted rounded-2xl outline-none appearance-none font-medium focus:ring-2 focus:ring-primary/30"
                >
                  {state.wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.icon} {w.name} (৳{w.balance.toLocaleString()})</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full py-3 px-4 bg-muted rounded-2xl outline-none font-medium focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full py-3 px-4 bg-muted rounded-2xl outline-none font-medium focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className={`w-full py-3.5 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                type === 'expense'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-success text-success-foreground'
              }`}
            >
              {editTransaction ? 'Update' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
