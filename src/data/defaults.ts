import { Category, Wallet } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', type: 'expense', icon: '🍔', color: '#EF4444', isDefault: true },
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: '🚗', color: '#3B82F6', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#8B5CF6', isDefault: true },
  { id: 'cat-bills', name: 'Bills', type: 'expense', icon: '📄', color: '#F59E0B', isDefault: true },
  { id: 'cat-health', name: 'Health', type: 'expense', icon: '💊', color: '#10B981', isDefault: true },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: '📚', color: '#6366F1', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: '🎮', color: '#EC4899', isDefault: true },
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: '💰', color: '#22C55E', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: '💻', color: '#3B82F6', isDefault: true },
  { id: 'cat-investment', name: 'Investment', type: 'income', icon: '📈', color: '#F59E0B', isDefault: true },
  { id: 'cat-gift', name: 'Gift', type: 'income', icon: '🎁', color: '#EC4899', isDefault: true },
  { id: 'cat-other-income', name: 'Other', type: 'income', icon: '💵', color: '#6B7280', isDefault: true },
  { id: 'cat-other-expense', name: 'Other', type: 'expense', icon: '📦', color: '#6B7280', isDefault: true },
];

export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'wallet-cash', name: 'Cash', type: 'cash', balance: 0, icon: '💵', color: '#22C55E', createdAt: new Date().toISOString() },
  { id: 'wallet-bank', name: 'Bank Account', type: 'bank', balance: 0, icon: '🏦', color: '#3B82F6', createdAt: new Date().toISOString() },
];
