import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Wallet } from '@/types';

const walletTypes = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'mobile', label: 'Mobile Banking', icon: '📱' },
] as const;

const walletColors = ['#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444'];

export default function Wallets() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Wallet['type']>('cash');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(walletColors[0]);

  const totalBalance = state.wallets.reduce((s, w) => s + w.balance, 0);

  const openEdit = (w: Wallet) => {
    setEditing(w); setName(w.name); setType(w.type);
    setBalance(w.balance.toString()); setColor(w.color); setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const icon = walletTypes.find(t => t.value === type)?.icon || '💵';
    if (editing) {
      dispatch({ type: 'UPDATE_WALLET', payload: { ...editing, name, type, icon, color } });
    } else {
      const wallet: Wallet = {
        id: `wallet-${Date.now()}`, name, type, icon, color,
        balance: parseFloat(balance) || 0, createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_WALLET', payload: wallet });
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false); setEditing(null); setName('');
    setType('cash'); setBalance(''); setColor(walletColors[0]);
  };

  return (
    <div className="py-4 space-y-5">
      {/* Total */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-primary rounded-3xl p-5 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-sm opacity-80">Total across all wallets</p>
        <p className="text-3xl font-extrabold mt-1">৳{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
      </motion.div>

      {/* Wallet List */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">Wallets ({state.wallets.length})</h3>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Plus size={16} /> Add
        </motion.button>
      </div>

      <div className="space-y-3">
        {state.wallets.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: w.color + '18' }}>
              {w.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{w.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{w.type}</p>
            </div>
            <p className="font-bold text-lg mr-2">৳{w.balance.toLocaleString()}</p>
            <div className="flex gap-1">
              <button onClick={() => openEdit(w)} className="p-2 rounded-xl hover:bg-muted"><Pencil size={16} /></button>
              <button onClick={() => dispatch({ type: 'DELETE_WALLET', payload: w.id })} className="p-2 rounded-xl hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={resetForm} />
            <motion.div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Wallet</h2>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bkash" className="w-full py-3 px-4 bg-muted rounded-2xl outline-none font-medium focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Type</label>
                  <div className="flex gap-2">
                    {walletTypes.map(t => (
                      <button key={t.value} onClick={() => setType(t.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${type === t.value ? 'bg-primary text-primary-foreground shadow' : 'bg-muted'}`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!editing && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Initial Balance</label>
                    <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" className="w-full py-3 px-4 bg-muted rounded-2xl outline-none font-medium focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Color</label>
                  <div className="flex gap-2">
                    {walletColors.map(c => (
                      <button key={c} onClick={() => setColor(c)}
                        className={`w-9 h-9 rounded-full transition-transform ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                  className="w-full py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg">
                  {editing ? 'Update' : 'Add'} Wallet
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
