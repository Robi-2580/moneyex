import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function Reports() {
  const { state, getCategory } = useApp();
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month');

  const now = new Date();
  const dateRange = useMemo(() => {
    if (period === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start, end: now };
    }
    if (period === '3months') {
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }, [period]);

  const filteredTxns = useMemo(() => {
    return state.transactions.filter(t => {
      const d = new Date(t.date);
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [state.transactions, dateRange]);

  const totalIncome = filteredTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredTxns.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([catId, amount]) => {
      const cat = getCategory(catId);
      return { name: cat?.name || 'Other', value: amount, color: cat?.color || '#6B7280', icon: cat?.icon || '📦' };
    }).sort((a, b) => b.value - a.value);
  }, [filteredTxns, getCategory]);

  // Monthly income vs expense
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    filteredTxns.forEach(t => {
      const month = t.date.slice(0, 7);
      if (!map.has(month)) map.set(month, { income: 0, expense: 0 });
      const entry = map.get(month)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM'),
        Income: data.income,
        Expense: data.expense,
      }));
  }, [filteredTxns]);

  return (
    <div className="py-4 space-y-5">
      <h2 className="text-xl font-bold">Reports</h2>

      {/* Period filter */}
      <div className="flex gap-2 p-1 bg-muted rounded-2xl">
        {(['week', 'month', '3months'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${period === p ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
            {p === 'week' ? '7 Days' : p === 'month' ? 'This Month' : '3 Months'}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <p className="text-xs text-muted-foreground font-medium">Income</p>
          <p className="text-xl font-bold text-success">৳{totalIncome.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
          <p className="text-xs text-muted-foreground font-medium">Expense</p>
          <p className="text-xl font-bold text-destructive">৳{totalExpense.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Expense Pie Chart */}
      {expenseByCategory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <h3 className="font-bold text-sm mb-3">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {expenseByCategory.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `৳${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {expenseByCategory.map(e => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-muted-foreground">{e.icon} {e.name}</span>
                <span className="font-semibold">৳{e.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bar Chart */}
      {monthlyData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
          <h3 className="font-bold text-sm mb-3">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `৳${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Income" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {filteredTxns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-muted-foreground">No data for this period</p>
          <p className="text-muted-foreground text-xs mt-1">Add some transactions to see reports</p>
        </div>
      )}
    </div>
  );
}
