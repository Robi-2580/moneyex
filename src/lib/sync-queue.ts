import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase';
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

export interface QueuedItem {
  id: string;
  ts: number;
  action: SyncAction;
}

const queueKey = (uid: string) => `mm-sync-queue-${uid}`;

export function getQueue(userId: string): QueuedItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(queueKey(userId)) || '[]');
    // Backwards compat: old queue stored bare actions
    return raw.map((it: any) =>
      it && it.action ? it : { id: crypto.randomUUID(), ts: Date.now(), action: it }
    );
  } catch { return []; }
}

export function setQueue(userId: string, q: QueuedItem[]) {
  try { localStorage.setItem(queueKey(userId), JSON.stringify(q)); } catch { }
}

export function enqueue(userId: string, action: SyncAction) {
  const q = getQueue(userId);
  q.push({ id: crypto.randomUUID(), ts: Date.now(), action });
  setQueue(userId, q);
}

type CollectionName = 'wallets' | 'categories' | 'transactions' | 'budgets' | 'loans';

async function docRef(userId: string, col: CollectionName, id: string) {
  const { db } = await getFirebase();
  return doc(db, 'users', userId, col, id);
}

async function profileRef(userId: string) {
  const { db } = await getFirebase();
  return doc(db, 'users', userId);
}

export async function executeAction(userId: string, action: SyncAction): Promise<void> {
  switch (action.type) {
    case 'ADD_WALLET':
      await setDoc(await docRef(userId, 'wallets', action.payload.id), action.payload);
      return;
    case 'UPDATE_WALLET': {
      const { id, ...data } = action.payload;
      await updateDoc(await docRef(userId, 'wallets', id), data);
      return;
    }
    case 'DELETE_WALLET':
      await deleteDoc(await docRef(userId, 'wallets', action.payload));
      return;
    case 'ADD_CATEGORY':
      await setDoc(await docRef(userId, 'categories', action.payload.id), action.payload);
      return;
    case 'UPDATE_CATEGORY': {
      const { id, ...data } = action.payload;
      await updateDoc(await docRef(userId, 'categories', id), data);
      return;
    }
    case 'DELETE_CATEGORY':
      await deleteDoc(await docRef(userId, 'categories', action.payload));
      return;
    case 'ADD_TRANSACTION': {
      const { _walletDelta, ...t } = action.payload;
      await setDoc(await docRef(userId, 'transactions', t.id), t);
      return;
    }
    case 'UPDATE_TRANSACTION': {
      const { id, ...data } = action.payload.new;
      await updateDoc(await docRef(userId, 'transactions', id), data);
      return;
    }
    case 'DELETE_TRANSACTION':
      await deleteDoc(await docRef(userId, 'transactions', action.payload.id));
      return;
    case 'ADD_BUDGET':
      await setDoc(await docRef(userId, 'budgets', action.payload.id), action.payload);
      return;
    case 'UPDATE_BUDGET': {
      const { id, ...data } = action.payload;
      await updateDoc(await docRef(userId, 'budgets', id), data);
      return;
    }
    case 'DELETE_BUDGET':
      await deleteDoc(await docRef(userId, 'budgets', action.payload));
      return;
    case 'ADD_LOAN':
      await setDoc(await docRef(userId, 'loans', action.payload.id), action.payload);
      return;
    case 'UPDATE_LOAN': {
      const { id, ...data } = action.payload;
      await updateDoc(await docRef(userId, 'loans', id), data);
      return;
    }
    case 'DELETE_LOAN':
      await deleteDoc(await docRef(userId, 'loans', action.payload));
      return;
    case 'TOGGLE_THEME':
      await setDoc(await profileRef(userId), { isDark: action.payload }, { merge: true });
      return;
    case 'SET_LANGUAGE':
      await setDoc(await profileRef(userId), { language: action.payload }, { merge: true });
      return;
    case 'SET_FONT':
      await setDoc(await profileRef(userId), { fontFamily: action.payload }, { merge: true });
      return;
    case 'WALLET_BALANCE':
      await updateDoc(await docRef(userId, 'wallets', action.payload.walletId), { balance: action.payload.balance });
      return;
  }
}

export async function flushQueue(userId: string): Promise<{ success: number; remaining: number }> {
  const q = getQueue(userId);
  if (q.length === 0) return { success: 0, remaining: 0 };
  // Conflict-safe ordering: stable sort by timestamp ascending (earliest first)
  // Last write per resource will naturally win since we process in time order.
  const ordered = [...q].sort((a, b) => a.ts - b.ts);
  let success = 0;
  const remaining: QueuedItem[] = [];
  for (const item of ordered) {
    try {
      await executeAction(userId, item.action);
      success++;
    } catch (e) {
      remaining.push(item);
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
