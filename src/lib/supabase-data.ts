import { supabase } from '@/integrations/supabase/client';

export async function loadUserData(userId: string) {
  const [walletsRes, categoriesRes, transactionsRes, budgetsRes, loansRes, profileRes] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('budgets').select('*').eq('user_id', userId),
    supabase.from('loans').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
  ]);

  const wallets = (walletsRes.data || []).map((w: any) => ({
    id: w.id,
    name: w.name,
    type: w.type,
    balance: Number(w.balance),
    icon: w.icon,
    color: w.color,
    createdAt: w.created_at,
  }));

  const categories = (categoriesRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    nameBn: c.name_bn,
    type: c.type,
    icon: c.icon,
    color: c.color,
    isDefault: c.is_default,
  }));

  const transactions = (transactionsRes.data || []).map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    categoryId: t.category_id,
    walletId: t.wallet_id,
    note: t.note || '',
    date: t.date,
    createdAt: t.created_at,
  }));

  const budgets = (budgetsRes.data || []).map((b: any) => ({
    id: b.id,
    categoryId: b.category_id,
    amount: Number(b.amount),
    month: b.month,
    spent: Number(b.spent),
  }));

  const loans = (loansRes.data || []).map((l: any) => ({
    id: l.id,
    type: l.type,
    personName: l.person_name,
    amount: Number(l.amount),
    paidAmount: Number(l.paid_amount),
    note: l.note || '',
    date: l.date,
    dueDate: l.due_date,
    status: l.status,
    createdAt: l.created_at,
  }));

  const profile = profileRes.data;

  return {
    wallets,
    categories,
    transactions,
    budgets,
    loans,
    isDark: profile?.is_dark ?? false,
    language: (profile?.language as 'bn' | 'en') ?? 'bn',
    fontFamily: profile?.font_family ?? "'Hind Siliguri', sans-serif",
  };
}
