import { supabase } from '@/integrations/supabase/client';
import type { Wallet, Category, Transaction, Budget, Loan, Language } from '@/types';

export type SyncAction =
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'DELETE_WALLET'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction & { _walletDelta?: number } }
  | { type: 'UPDATE_TRANSACTION'; payload: { old: Transaction; new: Transaction } }
  | { type: 'DELETE_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_LOAN'; payload: Loan }
  | { type: 'DELETE_LOAN'; payload: string }
  | { type: 'TOGGLE_THEME'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_FONT'; payload: string }
  | { type: 'WALLET_BALANCE'; payload: { walletId: string; balance: number } };

const queueKey = (uid: string) => `mm-sync-queue-${uid}`;

export function getQueue(userId: string): SyncAction[] {
  try { return JSON.parse(localStorage.getItem(queueKey(userId)) || '[]'); } catch { return []; }
}

export function setQueue(userId: string, q: SyncAction[]) {
  try { localStorage.setItem(queueKey(userId), JSON.stringify(q)); } catch { }
}

export function enqueue(userId: string, action: SyncAction) {
  const q = getQueue(userId);
  q.push(action);
  setQueue(userId, q);
}

export async function executeAction(userId: string, action: SyncAction): Promise<void> {
  switch (action.type) {
    case 'ADD_WALLET': {
      const w = action.payload;
      await supabase.from('wallets').insert({ id: w.id, user_id: userId, name: w.name, type: w.type, balance: w.balance, icon: w.icon, color: w.color });
      return;
    }
    case 'UPDATE_WALLET': {
      const w = action.payload;
      await supabase.from('wallets').update({ name: w.name, type: w.type, balance: w.balance, icon: w.icon, color: w.color }).eq('id', w.id);
      return;
    }
    case 'DELETE_WALLET':
      await supabase.from('wallets').delete().eq('id', action.payload); return;
    case 'ADD_CATEGORY': {
      const c = action.payload;
      await supabase.from('categories').insert({ id: c.id, user_id: userId, name: c.name, name_bn: c.nameBn, type: c.type, icon: c.icon, color: c.color, is_default: c.isDefault });
      return;
    }
    case 'UPDATE_CATEGORY': {
      const c = action.payload;
      await supabase.from('categories').update({ name: c.name, name_bn: c.nameBn, type: c.type, icon: c.icon, color: c.color }).eq('id', c.id); return;
    }
    case 'DELETE_CATEGORY':
      await supabase.from('categories').delete().eq('id', action.payload); return;
    case 'ADD_TRANSACTION': {
      const t = action.payload;
      await supabase.from('transactions').insert({ id: t.id, user_id: userId, type: t.type, amount: t.amount, category_id: t.categoryId, wallet_id: t.walletId, note: t.note, date: t.date });
      return;
    }
    case 'UPDATE_TRANSACTION': {
      const { new: newT } = action.payload;
      await supabase.from('transactions').update({ type: newT.type, amount: newT.amount, category_id: newT.categoryId, wallet_id: newT.walletId, note: newT.note, date: newT.date }).eq('id', newT.id);
      return;
    }
    case 'DELETE_TRANSACTION':
      await supabase.from('transactions').delete().eq('id', action.payload.id); return;
    case 'ADD_BUDGET': {
      const b = action.payload;
      await supabase.from('budgets').insert({ id: b.id, user_id: userId, category_id: b.categoryId, amount: b.amount, month: b.month, spent: b.spent }); return;
    }
    case 'UPDATE_BUDGET': {
      const b = action.payload;
      await supabase.from('budgets').update({ category_id: b.categoryId, amount: b.amount, month: b.month, spent: b.spent }).eq('id', b.id); return;
    }
    case 'DELETE_BUDGET':
      await supabase.from('budgets').delete().eq('id', action.payload); return;
    case 'ADD_LOAN': {
      const l = action.payload;
      await supabase.from('loans').insert({ id: l.id, user_id: userId, type: l.type, person_name: l.personName, amount: l.amount, paid_amount: l.paidAmount, note: l.note, date: l.date, due_date: l.dueDate, status: l.status }); return;
    }
    case 'UPDATE_LOAN': {
      const l = action.payload;
      await supabase.from('loans').update({ type: l.type, person_name: l.personName, amount: l.amount, paid_amount: l.paidAmount, note: l.note, date: l.date, due_date: l.dueDate, status: l.status }).eq('id', l.id); return;
    }
    case 'DELETE_LOAN':
      await supabase.from('loans').delete().eq('id', action.payload); return;
    case 'TOGGLE_THEME':
      await supabase.from('profiles').update({ is_dark: action.payload }).eq('user_id', userId); return;
    case 'SET_LANGUAGE':
      await supabase.from('profiles').update({ language: action.payload }).eq('user_id', userId); return;
    case 'SET_FONT':
      await supabase.from('profiles').update({ font_family: action.payload }).eq('user_id', userId); return;
    case 'WALLET_BALANCE':
      await supabase.from('wallets').update({ balance: action.payload.balance }).eq('id', action.payload.walletId); return;
  }
}

export async function flushQueue(userId: string): Promise<{ success: number; remaining: number }> {
  const q = getQueue(userId);
  if (q.length === 0) return { success: 0, remaining: 0 };
  let success = 0;
  const remaining: SyncAction[] = [];
  for (const action of q) {
    try {
      await executeAction(userId, action);
      success++;
    } catch (e) {
      remaining.push(action);
    }
  }
  setQueue(userId, remaining);
  return { success, remaining: remaining.length };
}

export async function syncOrQueue(userId: string, action: SyncAction): Promise<boolean> {
  const existing = getQueue(userId);
  if (!navigator.onLine || existing.length > 0) {
    enqueue(userId, action);
    if (navigator.onLine) {
      const r = await flushQueue(userId);
      return r.remaining === 0;
    }
    return false;
  }
  try {
    await executeAction(userId, action);
    return true;
  } catch (e) {
    enqueue(userId, action);
    return false;
  }
}
