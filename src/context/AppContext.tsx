import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Wallet, Category, Transaction, Budget } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS } from '@/data/defaults';

interface AppState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  isDark: boolean;
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
  | { type: 'TOGGLE_THEME' };

const initialState: AppState = {
  wallets: DEFAULT_WALLETS,
  categories: DEFAULT_CATEGORIES,
  transactions: [],
  budgets: [],
  isDark: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_WALLET':
      return { ...state, wallets: [...state.wallets, action.payload] };
    case 'UPDATE_WALLET':
      return { ...state, wallets: state.wallets.map(w => w.id === action.payload.id ? action.payload : w) };
    case 'DELETE_WALLET':
      return { ...state, wallets: state.wallets.filter(w => w.id !== action.payload) };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
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
      // Reverse old transaction effect
      let wallets = state.wallets.map(w => {
        if (w.id === oldT.walletId) {
          return { ...w, balance: oldT.type === 'income' ? w.balance - oldT.amount : w.balance + oldT.amount };
        }
        return w;
      });
      // Apply new transaction effect
      wallets = wallets.map(w => {
        if (w.id === newT.walletId) {
          return { ...w, balance: newT.type === 'income' ? w.balance + newT.amount : w.balance - newT.amount };
        }
        return w;
      });
      return { ...state, transactions: state.transactions.map(t => t.id === newT.id ? newT : t), wallets };
    }
    case 'DELETE_TRANSACTION': {
      const dt = action.payload;
      const wals = state.wallets.map(w => {
        if (w.id === dt.walletId) {
          return { ...w, balance: dt.type === 'income' ? w.balance - dt.amount : w.balance + dt.amount };
        }
        return w;
      });
      return { ...state, transactions: state.transactions.filter(t => t.id !== dt.id), wallets: wals };
    }
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return { ...state, budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
    case 'TOGGLE_THEME':
      return { ...state, isDark: !state.isDark };
    default:
      return state;
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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('money-manager-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'SET_STATE', payload: parsed });
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('money-manager-data', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  }, [state]);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDark);
  }, [state.isDark]);

  const totalBalance = state.wallets.reduce((sum, w) => sum + w.balance, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTransactions = state.transactions.filter(t => t.date.startsWith(currentMonth));
  const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const getCategory = useCallback((id: string) => state.categories.find(c => c.id === id), [state.categories]);
  const getWallet = useCallback((id: string) => state.wallets.find(w => w.id === id), [state.wallets]);

  return (
    <AppContext.Provider value={{ state, dispatch, totalBalance, totalIncome, totalExpense, getCategory, getWallet }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
