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
  categoryId: string | null; // null = overall monthly budget
  amount: number;
  month: string; // YYYY-MM
  spent: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
