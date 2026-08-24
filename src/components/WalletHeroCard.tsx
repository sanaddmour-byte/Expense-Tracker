import React from 'react';
import { ArrowDownRight, ArrowUpRight, Plus, RotateCcw, Download, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MonthSummary, UserSettings } from '../types';
import { formatCurrency } from '../utils/helpers';
import confetti from 'canvas-confetti';

interface WalletHeroCardProps {
  summary: MonthSummary;
  settings: UserSettings;
  onOpenAddModal: (type: 'expense' | 'income') => void;
  onOpenResetModal: () => void;
  onOpenExportModal: () => void;
}

export const WalletHeroCard: React.FC<WalletHeroCardProps> = ({
  summary,
  settings,
  onOpenAddModal,
  onOpenResetModal,
  onOpenExportModal,
}) => {
  const budget = settings.monthlyBudget;
  const expensePercentage = budget > 0 ? (summary.totalExpense / budget) * 100 : 0;
  const remainingBudget = budget - summary.totalExpense;
  const isOverBudget = remainingBudget < 0;

  // Calculate days remaining in active month
  const now = new Date();
  const [yearStr, monthStr] = summary.monthKey.split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonth = parseInt(monthStr, 10);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear ? now.getDate() : 1;
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const dailyAllowance = Math.max(0, remainingBudget / daysRemaining);

  const handleCelebrate = () => {
    if (summary.savingsRate > 20) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#34C759', '#007AFF', '#FFD60A', '#FF9500'],
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/65 backdrop-blur-2xl text-slate-900 dark:text-white p-6 sm:p-7 shadow-xl border border-white/60 dark:border-white/10 transition-all duration-300">
      {/* Decorative frosted ambient glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/25 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-400/25 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar within Card */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/50 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {summary.label} Overview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {summary.savingsRate > 0 && (
            <button
              onClick={handleCelebrate}
              className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/25 transition backdrop-blur-xs shadow-xs"
              title="Click to celebrate savings!"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {summary.savingsRate.toFixed(0)}% saved
            </button>
          )}
          <button
            onClick={onOpenResetModal}
            className="p-2 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-white/60 dark:border-white/10 transition shadow-xs"
            title="Monthly Reset & Rollover"
            id="hero-reset-month-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenExportModal}
            className="p-2 rounded-full bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-white/60 dark:border-white/10 transition shadow-xs"
            title="Export CSV"
            id="hero-export-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Net Balance & Cash Flow */}
      <div className="relative z-10 pt-5 pb-4">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Total Net Balance
        </p>
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(summary.netSavings, settings.currencySymbol)}
          </h2>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs border ${
              summary.netSavings >= 0
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
            }`}
          >
            {summary.netSavings >= 0 ? '+' : ''}
            {summary.totalIncome > 0 ? ((summary.netSavings / summary.totalIncome) * 100).toFixed(1) : '0'}%
          </span>
        </div>
      </div>

      {/* Income & Expense Breakdown Pills */}
      <div className="relative z-10 grid grid-cols-2 gap-3.5 my-2">
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.totalIncome, settings.currencySymbol)}
          </p>
        </div>

        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/60 dark:border-white/10 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Expenses
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(summary.totalExpense, settings.currencySymbol)}
          </p>
        </div>
      </div>

      {/* Monthly Budget Progress Section */}
      <div className="relative z-10 mt-3 pt-4 border-t border-white/50 dark:border-white/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            Budget Target ({expensePercentage.toFixed(0)}%)
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(summary.totalExpense, settings.currencySymbol, 0)} /{' '}
            {formatCurrency(budget, settings.currencySymbol, 0)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/5 dark:bg-white/10 h-3 rounded-full overflow-hidden border border-white/40 dark:border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500'
                : expensePercentage > settings.notifyThreshold
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, expensePercentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2.5">
          <span>
            {isOverBudget
              ? `Over budget by ${formatCurrency(Math.abs(remainingBudget), settings.currencySymbol)}`
              : `${formatCurrency(remainingBudget, settings.currencySymbol)} available`}
          </span>
          <span>
            Daily allowance: <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatCurrency(dailyAllowance, settings.currencySymbol, 0)}/day</strong> ({daysRemaining}d left)
          </span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="relative z-10 grid grid-cols-2 gap-3.5 mt-5">
        <button
          onClick={() => onOpenAddModal('expense')}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition"
          id="hero-quick-add-expense"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>

        <button
          onClick={() => onOpenAddModal('income')}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-sm border border-white/70 dark:border-white/15 backdrop-blur-md shadow-xs active:scale-[0.98] transition"
          id="hero-quick-add-income"
        >
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Add Income
        </button>
      </div>
    </div>
  );
};
