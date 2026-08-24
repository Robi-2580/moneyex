import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getFirebase } from '@/lib/firebase';
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS } from '@/data/defaults';
import type { Wallet, Category, Transaction, Budget, Loan, Language } from '@/types';

export interface UserData {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  loans: Loan[];
  isDark: boolean;
  language: Language;
  fontFamily: string;
}

const DEFAULT_FONT = "'Tiro Bangla', 'Poppins', sans-serif";

/**
 * Loads all data for a user from Firestore.
 * Layout: users/{uid} (profile doc) + users/{uid}/{wallets|categories|transactions|budgets|loans}/{id}
 * First-time users are seeded with the default wallets/categories.
 */
export async function loadUserData(userId: string): Promise<UserData> {
  const { db } = await getFirebase();
  const col = (name: string) => collection(db, 'users', userId, name);

  const [profileSnap, walletsSnap, categoriesSnap, txSnap, budgetsSnap, loansSnap] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(col('wallets')),
    getDocs(col('categories')),
    getDocs(col('transactions')),
    getDocs(col('budgets')),
    getDocs(col('loans')),
  ]);

  let wallets = walletsSnap.docs.map(d => d.data() as Wallet);
  let categories = categoriesSnap.docs.map(d => d.data() as Category);

  // Seed defaults for brand-new users
  const seeds: Promise<void>[] = [];
  if (wallets.length === 0) {
    wallets = DEFAULT_WALLETS;
    seeds.push(...DEFAULT_WALLETS.map(w => setDoc(doc(db, 'users', userId, 'wallets', w.id), w)));
  }
  if (categories.length === 0) {
    categories = DEFAULT_CATEGORIES;
    seeds.push(...DEFAULT_CATEGORIES.map(c => setDoc(doc(db, 'users', userId, 'categories', c.id), c)));
  }
  if (seeds.length > 0) await Promise.all(seeds);

  const profile = (profileSnap.data() || {}) as { isDark?: boolean; language?: Language; fontFamily?: string };
  const transactions = txSnap.docs
    .map(d => d.data() as Transaction)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return {
    wallets,
    categories,
    transactions,
    budgets: budgetsSnap.docs.map(d => d.data() as Budget),
    loans: loansSnap.docs.map(d => d.data() as Loan),
    isDark: profile.isDark ?? false,
    language: profile.language ?? 'bn',
    fontFamily: profile.fontFamily ?? DEFAULT_FONT,
  };
}
