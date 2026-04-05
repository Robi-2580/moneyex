import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Budget } from '@/types';

export default function Budgets() {
  const { state, dispatch, getCategory } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Calculate spent per category this month
  const spentMap = useMemo(() => {
    const map = new Map<string, number>();
    state.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount));
    return map;
  }, [state.transactions, currentMonth]);

  const totalSpent = useMemo(() => {
    return state.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0);
  }, [state.transactions, currentMonth]);

  const budgets = state.budgets.filter(b => b.month === currentMonth);

  const openEdit = (b: Budget) => {
    setEditing(b); setCategoryId(b.categoryId || ''); setAmount(b.amount.toString()); setShowForm(true);
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const budget: Budget = {
      id: editing?.id || `budget-${Date.now()}`,
      categoryId: categoryId || null,
      amount: amt,
      month: currentMonth,
      spent: categoryId ? (spentMap.get(categoryId) || 0) : totalSpent,
    };
    dispatch({ type: editing ? 'UPDATE_BUDGET' : 'ADD_BUDGET', payload: budget });
    resetForm();
  };

  const resetForm = () => { setShowForm(false); setEditing(null); setCategoryId(''); setAmount(''); };

  const expenseCategories = state.categories.filter(c => c.type === 'expense');

  return (
    <div className="py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Budgets</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Plus size={16} /> Add Budget
        </motion.button>
      </div>

      <p className="text-sm text-muted-foreground">
        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>

      {budgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-muted-foreground">No budgets set</p>
          <p className="text-muted-foreground text-xs mt-1">Set a monthly budget to track spending</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((b, i) => {
            const cat = b.categoryId ? getCategory(b.categoryId) : null;
            const spent = b.categoryId ? (spentMap.get(b.categoryId) || 0) : totalSpent;
            const pct = Math.min((spent / b.amount) * 100, 100);
            const isOver = spent > b.amount;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat?.icon || '💰'}</span>
                    <div>
                      <p className="font-semibold text-sm">{cat?.name || 'Overall Budget'}</p>
                      <p className="text-xs text-muted-foreground">৳{spent.toLocaleString()} / ৳{b.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOver && <AlertTriangle size={16} className="text-warning" />}
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil size={14} /></button>
                    <button onClick={() => dispatch({ type: 'DELETE_BUDGET', payload: b.id })} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isOver ? 'bg-destructive' : pct > 80 ? 'bg-warning' : 'bg-success'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className={`text-xs mt-1 font-medium ${isOver ? 'text-destructive' : pct > 80 ? 'text-warning' : 'text-success'}`}>
                  {isOver ? `Over by ৳${(spent - b.amount).toLocaleString()}` : `${(100 - pct).toFixed(0)}% remaining`}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={resetForm} />
            <motion.div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Set'} Budget</h2>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Category (leave empty for overall)</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => setCategoryId('')}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl text-xs transition-all ${!categoryId ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
                      <span className="text-xl">💰</span><span className="font-medium">Overall</span>
                    </button>
                    {expenseCategories.map(cat => (
                      <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl text-xs transition-all ${categoryId === cat.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
                        <span className="text-xl">{cat.icon}</span><span className="font-medium truncate w-full text-center">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Budget Amount</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                    className="w-full py-3 px-4 bg-muted rounded-2xl outline-none font-medium text-xl focus:ring-2 focus:ring-primary/30" />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                  className="w-full py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg">
                  {editing ? 'Update' : 'Set'} Budget
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
