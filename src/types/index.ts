export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'mobile';
  balance: number;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  walletId: string;
  note: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string | null;
  amount: number;
  month: string;
  spent: number;
}

export interface Loan {
  id: string;
  type: 'payable' | 'receivable' | 'loan';
  personName: string;
  amount: number;
  paidAmount: number;
  note: string;
  date: string;
  dueDate?: string;
  status: 'active' | 'settled';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export type Language = 'bn' | 'en';
export type FontFamily = string;
