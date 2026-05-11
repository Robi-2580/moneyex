import { Category, Wallet } from '@/types';

// Ash / grey + red palette — used app-wide for category/wallet accents
export const ACCENT_COLORS = [
  '#DC2626', // red-600
  '#EF4444', // red-500
  '#B91C1C', // red-700
  '#F87171', // red-400
  '#1F2937', // gray-800
  '#374151', // gray-700
  '#4B5563', // gray-600
  '#6B7280', // gray-500
  '#9CA3AF', // gray-400
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', nameBn: 'খাবার', type: 'expense', icon: 'food', color: '#DC2626', isDefault: true },
  { id: 'cat-transport', name: 'Transport', nameBn: 'যাতায়াত', type: 'expense', icon: 'transport', color: '#374151', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', nameBn: 'শপিং', type: 'expense', icon: 'shopping', color: '#EF4444', isDefault: true },
  { id: 'cat-bills', name: 'Bills', nameBn: 'বিল', type: 'expense', icon: 'bills', color: '#4B5563', isDefault: true },
  { id: 'cat-health', name: 'Health', nameBn: 'স্বাস্থ্য', type: 'expense', icon: 'health', color: '#B91C1C', isDefault: true },
  { id: 'cat-education', name: 'Education', nameBn: 'শিক্ষা', type: 'expense', icon: 'education', color: '#1F2937', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', nameBn: 'বিনোদন', type: 'expense', icon: 'entertainment', color: '#F87171', isDefault: true },
  { id: 'cat-restaurant', name: 'Restaurant', nameBn: 'রেস্তোরাঁ', type: 'expense', icon: 'restaurant', color: '#DC2626', isDefault: true },
  { id: 'cat-family', name: 'Family', nameBn: 'পরিবার', type: 'expense', icon: 'family', color: '#6B7280', isDefault: true },
  { id: 'cat-groceries', name: 'Groceries/daily', nameBn: 'মুদি/দৈনিক', type: 'expense', icon: 'groceries', color: '#374151', isDefault: true },
  { id: 'cat-wifi', name: 'Wifi Bill', nameBn: 'ওয়াইফাই বিল', type: 'expense', icon: 'wifi', color: '#4B5563', isDefault: true },
  { id: 'cat-mobile-bill', name: 'Mobile bill', nameBn: 'মোবাইল বিল', type: 'expense', icon: 'mobile', color: '#EF4444', isDefault: true },
  { id: 'cat-salary', name: 'Salary', nameBn: 'বেতন', type: 'income', icon: 'salary', color: '#1F2937', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance', nameBn: 'ফ্রিল্যান্স', type: 'income', icon: 'freelance', color: '#374151', isDefault: true },
  { id: 'cat-investment', name: 'Investment', nameBn: 'বিনিয়োগ', type: 'income', icon: 'investment', color: '#DC2626', isDefault: true },
  { id: 'cat-gift', name: 'Gift', nameBn: 'উপহার', type: 'income', icon: 'gift', color: '#EF4444', isDefault: true },
  { id: 'cat-other-income', name: 'Other', nameBn: 'অন্যান্য', type: 'income', icon: 'other', color: '#6B7280', isDefault: true },
  { id: 'cat-other-expense', name: 'Other', nameBn: 'অন্যান্য', type: 'expense', icon: 'other', color: '#6B7280', isDefault: true },
];

export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'wallet-cash', name: 'Cash', type: 'cash', balance: 0, icon: 'cash', color: '#374151', createdAt: new Date().toISOString() },
  { id: 'wallet-bank', name: 'Bank Account', type: 'bank', balance: 0, icon: 'bank', color: '#DC2626', createdAt: new Date().toISOString() },
];

// Available fonts
export const FONTS = {
  bn: [
    { name: 'Tiro Bangla + Poppins', value: "'Tiro Bangla', 'Poppins', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Poppins:wght@300;400;500;600;700;800&display=swap' },
    { name: 'Tiro Bangla', value: "'Tiro Bangla', serif", url: 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap' },
    { name: 'Noto Sans Bengali', value: "'Noto Sans Bengali', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap' },
    { name: 'Hind Siliguri', value: "'Hind Siliguri', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap' },
    { name: 'Baloo Da 2', value: "'Baloo Da 2', cursive", url: 'https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&display=swap' },
    { name: 'Anek Bangla', value: "'Anek Bangla', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@300;400;500;600;700&display=swap' },
  ],
  en: [
    { name: 'Poppins', value: "'Poppins', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap' },
    { name: 'Inter', value: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' },
    { name: 'Nunito', value: "'Nunito', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap' },
    { name: 'Roboto', value: "'Roboto', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' },
    { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap' },
  ],
};

// i18n labels
export const LABELS = {
  bn: {
    home: 'হোম',
    accounts: 'অ্যাকাউন্ট',
    reports: 'রিপোর্ট',
    transactions: 'তালিকা',
    search: 'অনুসন্ধান',
    notes: 'নোট',
    loanBook: 'ঋণ হিসাব',
    categories: 'ক্যাটাগরি',
    settings: 'সেটিংস',
    budgets: 'বাজেট',
    logout: 'লগআউট',
    hello: 'হ্যালো',
    goodMorning: 'শুভ সকাল',
    goodAfternoon: 'শুভ অপরাহ্ন',
    goodEvening: 'শুভ সন্ধ্যা',
    totalBalance: 'মোট ব্যালেন্স',
    income: 'আয়',
    expense: 'ব্যয়',
    recentTransactions: 'সাম্প্রতিক লেনদেন',
    viewAll: 'সব দেখুন',
    addTransaction: 'নতুন যোগ করুন',
    loanSummary: 'ঋণ হিসাব',
    receivable: 'পাওনা',
    payable: 'দেনা',
    loan: 'লোন',
    budgetStatus: 'বাজেট স্ট্যাটাস',
    quickEntry: 'কুইক এন্ট্রি',
    bank: 'ব্যাংক',
    cash: 'নগদ',
    mobile: 'মোবাইল',
    appName: 'PaysaPro',
    welcomeBack: 'ফিরে আসার জন্য স্বাগতম!',
    signIn: 'সাইন ইন',
    signUp: 'সাইন আপ',
    guestMode: 'গেস্ট মোডে চালিয়ে যান',
    exportData: 'ডাটা এক্সপোর্ট',
    importData: 'ডাটা ইমপোর্ট',
    clearData: 'সব ডাটা মুছুন',
    language: 'ভাষা',
    budgetExceeded: 'বাজেট ছেড়ে গেছে!',
    withinBudget: 'বাজেটে আছে',
    noTransactions: 'কোনো লেনদেন নেই',
    clickToAdd: 'নতুন লেনদেন যোগ করতে + বাটনে ক্লিক করুন',
    font: 'ফন্ট',
    selectFont: 'ফন্ট নির্বাচন করুন',
    cloudSync: 'ক্লাউড সিঙ্ক',
    syncing: 'সিঙ্ক হচ্ছে...',
    synced: 'সিঙ্ক সম্পন্ন',
  },
  en: {
    home: 'Home',
    accounts: 'Accounts',
    reports: 'Reports',
    transactions: 'Transactions',
    search: 'Search',
    notes: 'Notes',
    loanBook: 'Loan Book',
    categories: 'Categories',
    settings: 'Settings',
    budgets: 'Budgets',
    logout: 'Logout',
    hello: 'Hello',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    totalBalance: 'Total Balance',
    income: 'Income',
    expense: 'Expense',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    addTransaction: 'Add New',
    loanSummary: 'Loan Summary',
    receivable: 'Receivable',
    payable: 'Payable',
    loan: 'Loan',
    budgetStatus: 'Budget Status',
    quickEntry: 'Quick Entry',
    bank: 'Bank',
    cash: 'Cash',
    mobile: 'Mobile',
    appName: 'PaysaPro',
    welcomeBack: 'Welcome Back!',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    guestMode: 'Continue as Guest',
    exportData: 'Export Data',
    importData: 'Import Data',
    clearData: 'Clear All Data',
    language: 'Language',
    budgetExceeded: 'Over Budget!',
    withinBudget: 'Within Budget',
    noTransactions: 'No transactions yet',
    clickToAdd: 'Click + to add your first transaction',
    font: 'Font',
    selectFont: 'Select Font',
    cloudSync: 'Cloud Sync',
    syncing: 'Syncing...',
    synced: 'Synced',
  },
};
