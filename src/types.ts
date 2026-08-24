export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export type PaymentMethod = 'Apple Pay' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer';

export type RecurrenceType = 'none' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  recurring?: RecurrenceType;
  tags?: string[];
  createdAt: number;
}

export interface UserSettings {
  userName: string;
  currency: string;
  currencySymbol: string;
  monthlyBudget: number;
  savingsGoal: number;
  resetDayOfMonth: number; // 1 to 31
  theme: 'light' | 'dark' | 'system';
  enableHaptics: boolean;
  notifyThreshold: number; // e.g. 80%
  avatarEmoji: string;
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  label: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // %
  budget: number;
  transactionCount: number;
}

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  color: string;
  bgColor: string;
  icon: string;
  totalAmount: number;
  percentage: number;
  count: number;
}
