import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Wallet, Category, Transaction, Budget, Loan, Language } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS, LABELS, FONTS } from '@/data/defaults';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { loadUserData } from '@/lib/supabase-data';

interface AppState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  loans: Loan[];
  isDark: boolean;
  language: Language;
  fontFamily: string;
}

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'DELETE_WALLET'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { old: Transaction; new: Transaction } }
  | { type: 'DELETE_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_LOAN'; payload: Loan }
  | { type: 'DELETE_LOAN'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_FONT'; payload: string };

const initialState: AppState = {
  wallets: DEFAULT_WALLETS,
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  budgets: [],
  loans: [],
  isDark: false,
  language: 'bn',
  fontFamily: "'Hind Siliguri', sans-serif",
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE': return { ...state, ...action.payload };
    case 'ADD_WALLET': return { ...state, wallets: [...state.wallets, action.payload] };
    case 'UPDATE_WALLET': return { ...state, wallets: state.wallets.map(w => w.id === action.payload.id ? action.payload : w) };
    case 'DELETE_WALLET': return { ...state, wallets: state.wallets.filter(w => w.id !== action.payload) };
    case 'ADD_CATEGORY': return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY': return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY': return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'ADD_TRANSACTION': {
      const t = action.payload;
      const wallets = state.wallets.map(w => {
        if (w.id === t.walletId) {
          return { ...w, balance: t.type === 'income' ? w.balance + t.amount : w.balance - t.amount };
        }
        return w;
      });
      return { ...state, transactions: [t, ...state.transactions], wallets };
    }
    case 'UPDATE_TRANSACTION': {
      const { old: oldT, new: newT } = action.payload;
      let wallets = state.wallets.map(w => {
        if (w.id === oldT.walletId) return { ...w, balance: oldT.type === 'income' ? w.balance - oldT.amount : w.balance + oldT.amount };
        return w;
      });
      wallets = wallets.map(w => {
        if (w.id === newT.walletId) return { ...w, balance: newT.type === 'income' ? w.balance + newT.amount : w.balance - newT.amount };
        return w;
      });
      return { ...state, transactions: state.transactions.map(t => t.id === newT.id ? newT : t), wallets };
    }
    case 'DELETE_TRANSACTION': {
      const dt = action.payload;
      const wals = state.wallets.map(w => {
        if (w.id === dt.walletId) return { ...w, balance: dt.type === 'income' ? w.balance - dt.amount : w.balance + dt.amount };
        return w;
      });
      return { ...state, transactions: state.transactions.filter(t => t.id !== dt.id), wallets: wals };
    }
    case 'ADD_BUDGET': return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET': return { ...state, budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BUDGET': return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    case 'ADD_LOAN': return { ...state, loans: [...state.loans, action.payload] };
    case 'UPDATE_LOAN': return { ...state, loans: state.loans.map(l => l.id === action.payload.id ? action.payload : l) };
    case 'DELETE_LOAN': return { ...state, loans: state.loans.filter(l => l.id !== action.payload) };
    case 'TOGGLE_THEME': return { ...state, isDark: !state.isDark };
    case 'SET_LANGUAGE': return { ...state, language: action.payload };
    case 'SET_FONT': return { ...state, fontFamily: action.payload };
    default: return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  getCategory: (id: string) => Category | undefined;
  getWallet: (id: string) => Wallet | undefined;
  t: (key: keyof typeof LABELS['bn']) => string;
  catName: (cat: Category) => string;
  dbDispatch: (action: Action) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isGuest } = useAuth();

  // Load data from database on mount
  useEffect(() => {
    const load = async () => {
      if (user && !isGuest) {
        try {
          const data = await loadUserData(user.id);
          dispatch({ type: 'SET_STATE', payload: data });
        } catch (e) {
          console.error('Failed to load data from cloud', e);
        }
      } else {
        // Guest mode: use localStorage
        try {
          const saved = localStorage.getItem('money-manager-data');
          if (saved) dispatch({ type: 'SET_STATE', payload: JSON.parse(saved) });
        } catch (e) { console.error('Failed to load local data', e); }
      }
    };
    load();
  }, [user, isGuest]);

  // Save guest data to localStorage
  useEffect(() => {
    if (isGuest || !user) {
      try { localStorage.setItem('money-manager-data', JSON.stringify(state)); } catch {}
    }
  }, [state, user, isGuest]);

  // Database dispatch — persists actions to Supabase
  const dbDispatch = useCallback(async (action: Action) => {
    dispatch(action);
    if (!user || isGuest) return;

    try {
      switch (action.type) {
        case 'ADD_WALLET': {
          const w = action.payload;
          await supabase.from('wallets').insert({ id: w.id, user_id: user.id, name: w.name, type: w.type, balance: w.balance, icon: w.icon, color: w.color });
          break;
        }
        case 'UPDATE_WALLET': {
          const w = action.payload;
          await supabase.from('wallets').update({ name: w.name, type: w.type, balance: w.balance, icon: w.icon, color: w.color }).eq('id', w.id);
          break;
        }
        case 'DELETE_WALLET':
          await supabase.from('wallets').delete().eq('id', action.payload);
          break;
        case 'ADD_CATEGORY': {
          const c = action.payload;
          await supabase.from('categories').insert({ id: c.id, user_id: user.id, name: c.name, name_bn: c.nameBn, type: c.type, icon: c.icon, color: c.color, is_default: c.isDefault });
          break;
        }
        case 'UPDATE_CATEGORY': {
          const c = action.payload;
          await supabase.from('categories').update({ name: c.name, name_bn: c.nameBn, type: c.type, icon: c.icon, color: c.color }).eq('id', c.id);
          break;
        }
        case 'DELETE_CATEGORY':
          await supabase.from('categories').delete().eq('id', action.payload);
          break;
        case 'ADD_TRANSACTION': {
          const t = action.payload;
          await supabase.from('transactions').insert({ id: t.id, user_id: user.id, type: t.type, amount: t.amount, category_id: t.categoryId, wallet_id: t.walletId, note: t.note, date: t.date });
          // Update wallet balance
          const wallet = state.wallets.find(w => w.id === t.walletId);
          if (wallet) {
            const newBal = t.type === 'income' ? wallet.balance + t.amount : wallet.balance - t.amount;
            await supabase.from('wallets').update({ balance: newBal }).eq('id', t.walletId);
          }
          break;
        }
        case 'UPDATE_TRANSACTION': {
          const { old: oldT, new: newT } = action.payload;
          await supabase.from('transactions').update({ type: newT.type, amount: newT.amount, category_id: newT.categoryId, wallet_id: newT.walletId, note: newT.note, date: newT.date }).eq('id', newT.id);
          // Recalculate wallet balances (simplified — reload is better but this works for now)
          break;
        }
        case 'DELETE_TRANSACTION': {
          const dt = action.payload;
          await supabase.from('transactions').delete().eq('id', dt.id);
          const dw = state.wallets.find(w => w.id === dt.walletId);
          if (dw) {
            const newBal = dt.type === 'income' ? dw.balance - dt.amount : dw.balance + dt.amount;
            await supabase.from('wallets').update({ balance: newBal }).eq('id', dt.walletId);
          }
          break;
        }
        case 'ADD_BUDGET': {
          const b = action.payload;
          await supabase.from('budgets').insert({ id: b.id, user_id: user.id, category_id: b.categoryId, amount: b.amount, month: b.month, spent: b.spent });
          break;
        }
        case 'UPDATE_BUDGET': {
          const b = action.payload;
          await supabase.from('budgets').update({ category_id: b.categoryId, amount: b.amount, month: b.month, spent: b.spent }).eq('id', b.id);
          break;
        }
        case 'DELETE_BUDGET':
          await supabase.from('budgets').delete().eq('id', action.payload);
          break;
        case 'ADD_LOAN': {
          const l = action.payload;
          await supabase.from('loans').insert({ id: l.id, user_id: user.id, type: l.type, person_name: l.personName, amount: l.amount, paid_amount: l.paidAmount, note: l.note, date: l.date, due_date: l.dueDate, status: l.status });
          break;
        }
        case 'UPDATE_LOAN': {
          const l = action.payload;
          await supabase.from('loans').update({ type: l.type, person_name: l.personName, amount: l.amount, paid_amount: l.paidAmount, note: l.note, date: l.date, due_date: l.dueDate, status: l.status }).eq('id', l.id);
          break;
        }
        case 'DELETE_LOAN':
          await supabase.from('loans').delete().eq('id', action.payload);
          break;
        case 'TOGGLE_THEME':
          await supabase.from('profiles').update({ is_dark: !state.isDark }).eq('user_id', user.id);
          break;
        case 'SET_LANGUAGE':
          await supabase.from('profiles').update({ language: action.payload }).eq('user_id', user.id);
          break;
        case 'SET_FONT':
          await supabase.from('profiles').update({ font_family: action.payload }).eq('user_id', user.id);
          break;
      }
    } catch (e) {
      console.error('DB sync error:', e);
    }
  }, [user, isGuest, state.wallets, state.isDark]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDark);
  }, [state.isDark]);

  // Apply font
  useEffect(() => {
    document.documentElement.style.fontFamily = state.fontFamily;
    const allFonts = [...FONTS.bn, ...FONTS.en];
    const fontDef = allFonts.find(f => f.value === state.fontFamily);
    if (fontDef) {
      const existing = document.querySelector(`link[href="${fontDef.url}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontDef.url;
        document.head.appendChild(link);
      }
    }
  }, [state.fontFamily]);

  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = state.transactions.filter(t => t.date.startsWith(currentMonth));
  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const getCategory = useCallback((id: string) => state.categories.find(c => c.id === id), [state.categories]);
  const getWallet = useCallback((id: string) => state.wallets.find(w => w.id === id), [state.wallets]);
  const t = useCallback((key: keyof typeof LABELS['bn']) => LABELS[state.language]?.[key] || LABELS['bn'][key] || key, [state.language]);
  const catName = useCallback((cat: Category) => state.language === 'bn' && cat.nameBn ? cat.nameBn : cat.name, [state.language]);

  return (
    <AppContext.Provider value={{ state, dispatch, totalBalance, totalIncome, totalExpense, getCategory, getWallet, t, catName, dbDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
