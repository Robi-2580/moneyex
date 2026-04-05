import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Category } from '@/types';

const iconOptions = ['🍔', '🚗', '🛍️', '📄', '💊', '📚', '🎮', '🏠', '☕', '✈️', '💰', '💻', '📈', '🎁', '💵', '📦', '🎵', '🏋️', '🎨', '🔧'];
const colorOptions = ['#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#6B7280'];

export default function Categories() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState(iconOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');

  const openEdit = (c: Category) => {
    setEditing(c); setName(c.name); setType(c.type); setIcon(c.icon); setColor(c.color); setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const cat: Category = {
      id: editing?.id || `cat-${Date.now()}`,
      name, type, icon, color, isDefault: false,
    };
    dispatch({ type: editing ? 'UPDATE_CATEGORY' : 'ADD_CATEGORY', payload: cat });
    resetForm();
  };

  const resetForm = () => { setShowForm(false); setEditing(null); setName(''); setType('expense'); setIcon(iconOptions[0]); setColor(colorOptions[0]); };

  const cats = state.categories.filter(c => c.type === viewType);

  return (
    <div className="py-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories</h2>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Plus size={16} /> Add
        </motion.button>
      </div>

      <div className="flex gap-2 p-1 bg-muted rounded-2xl">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} onClick={() => setViewType(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${viewType === t ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cats.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-2xl p-4 flex flex-col items-center text-center relative group"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: cat.color + '18' }}>
              {cat.icon}
            </div>
            <p className="font-semibold text-sm">{cat.name}</p>
            {!cat.isDefault && (
              <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1 rounded-lg hover:bg-muted"><Pencil size={12} /></button>
                <button onClick={() => dispatch({ type: 'DELETE_CATEGORY', payload: cat.id })} className="p-1 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={resetForm} />
            <motion.div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Category</h2>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-muted"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name"
                    className="w-full py-3 px-4 bg-muted rounded-2xl outline-none font-medium focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Type</label>
                  <div className="flex gap-2">
                    {(['expense', 'income'] as const).map(t => (
                      <button key={t} onClick={() => setType(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${type === t ? 'bg-primary text-primary-foreground shadow' : 'bg-muted'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(ic => (
                      <button key={ic} onClick={() => setIcon(ic)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === ic ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(c => (
                      <button key={c} onClick={() => setColor(c)}
                        className={`w-9 h-9 rounded-full transition-transform ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                  className="w-full py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg">
                  {editing ? 'Update' : 'Add'} Category
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
