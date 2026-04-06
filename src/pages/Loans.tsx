import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, Check, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Loan } from '@/types';
import { format } from 'date-fns';

export default function Loans() {
  const { state, dispatch, t } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editLoan, setEditLoan] = useState<Loan | null>(null);
  const [filter, setFilter] = useState<'all' | 'payable' | 'receivable' | 'loan'>('all');

  const [type, setType] = useState<Loan['type']>('receivable');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  const resetForm = () => {
    setType('receivable');
    setPersonName('');
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setEditLoan(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || !personName.trim()) return;

    const loan: Loan = {
      id: editLoan?.id || `loan-${Date.now()}`,
      type,
      personName: personName.trim(),
      amount: amt,
      paidAmount: editLoan?.paidAmount || 0,
      note,
      date,
      dueDate: dueDate || undefined,
      status: 'active',
      createdAt: editLoan?.createdAt || new Date().toISOString(),
    };

    if (editLoan) {
      dispatch({ type: 'UPDATE_LOAN', payload: loan });
    } else {
      dispatch({ type: 'ADD_LOAN', payload: loan });
    }
    resetForm();
  };

  const startEdit = (loan: Loan) => {
    setType(loan.type);
    setPersonName(loan.personName);
    setAmount(loan.amount.toString());
    setNote(loan.note);
    setDate(loan.date);
    setDueDate(loan.dueDate || '');
    setEditLoan(loan);
    setShowForm(true);
  };

  const markSettled = (loan: Loan) => {
    dispatch({ type: 'UPDATE_LOAN', payload: { ...loan, status: 'settled', paidAmount: loan.amount } });
  };

  const filteredLoans = state.loans.filter(l => filter === 'all' || l.type === filter);
  const activeLoans = filteredLoans.filter(l => l.status === 'active');
  const settledLoans = filteredLoans.filter(l => l.status === 'settled');

  const typeLabel = (loanType: Loan['type']) => {
    const map = { receivable: t('receivable'), payable: t('payable'), loan: t('loan') };
    return map[loanType];
  };

  const typeColor = (loanType: Loan['type']) => {
    const map = { receivable: 'text-success bg-success/10', payable: 'text-destructive bg-destructive/10', loan: 'text-accent bg-accent/10' };
    return map[loanType];
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('loanBook')}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'receivable', 'payable', 'loan'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? 'All' : typeLabel(f)}
          </button>
        ))}
      </div>

      {/* Active Loans */}
      <div className="space-y-2">
        {activeLoans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No active loans</div>
        )}
        {activeLoans.map(loan => (
          <motion.div
            key={loan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${typeColor(loan.type)}`}>
                  {typeLabel(loan.type)}
                </span>
                <span className="font-semibold text-sm">{loan.personName}</span>
              </div>
              <span className="font-bold">৳{(loan.amount - loan.paidAmount).toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {loan.note && `${loan.note} · `}{format(new Date(loan.date), 'dd MMM yyyy')}
              {loan.dueDate && ` · Due: ${format(new Date(loan.dueDate), 'dd MMM yyyy')}`}
            </p>
            <div className="flex gap-2">
              <button onClick={() => markSettled(loan)} className="text-xs px-2 py-1 rounded-lg bg-success/10 text-success hover:bg-success/20">
                <Check size={12} className="inline mr-1" />Settle
              </button>
              <button onClick={() => startEdit(loan)} className="text-xs px-2 py-1 rounded-lg bg-muted hover:bg-muted/80">
                <Edit2 size={12} className="inline mr-1" />Edit
              </button>
              <button onClick={() => dispatch({ type: 'DELETE_LOAN', payload: loan.id })} className="text-xs px-2 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                <Trash2 size={12} className="inline mr-1" />Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settled */}
      {settledLoans.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Settled</h3>
          <div className="space-y-2">
            {settledLoans.map(loan => (
              <div key={loan.id} className="bg-card/50 rounded-2xl border border-border p-3 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${typeColor(loan.type)}`}>{typeLabel(loan.type)}</span>
                    <span className="text-sm line-through">{loan.personName}</span>
                  </div>
                  <span className="text-sm line-through">৳{loan.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={resetForm} />
            <motion.div
              className="relative w-full max-w-md bg-card rounded-2xl p-6 shadow-2xl mx-4"
              initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{editLoan ? 'Edit' : 'Add'} Loan</h3>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-muted"><X size={18} /></button>
              </div>

              {/* Type */}
              <div className="flex gap-2 mb-4 p-1 bg-muted rounded-xl">
                {(['receivable', 'payable', 'loan'] as const).map(ltype => (
                  <button
                    key={ltype}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                      type === ltype ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                    onClick={() => setType(ltype)}
                  >
                    {typeLabel(ltype)}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Person name" className="w-full py-2.5 px-3 bg-muted rounded-xl text-sm outline-none" />
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-full py-2.5 px-3 bg-muted rounded-xl text-sm outline-none" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full py-2.5 px-3 bg-muted rounded-xl text-sm outline-none" />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="Due date (optional)" className="w-full py-2.5 px-3 bg-muted rounded-xl text-sm outline-none" />
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" className="w-full py-2.5 px-3 bg-muted rounded-xl text-sm outline-none" />
              </div>

              <button onClick={handleSubmit} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                {editLoan ? 'Update' : 'Add'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
