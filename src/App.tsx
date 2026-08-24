import React, { useState, useEffect, useMemo } from 'react';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_USER_SETTINGS,
  getInitialSeedTransactions,
} from './utils/constants';
import {
  Category,
  MonthSummary,
  Transaction,
  TransactionType,
  UserSettings,
} from './types';
import {
  calculateCategoryBreakdown,
  calculateMonthStats,
  getAvailableMonthKeys,
  getMonthKey,
  getMonthLabel,
  playIOSHapticSound,
} from './utils/helpers';
import { IOSHeader } from './components/IOSHeader';
import { IOSNavigation, ActiveTab } from './components/IOSNavigation';
import { WalletHeroCard } from './components/WalletHeroCard';
import { ExpensesPieChart } from './components/ExpensesPieChart';
import { MonthlyComparisonView } from './components/MonthlyComparisonView';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { MonthlyResetModal } from './components/MonthlyResetModal';
import { ExportDataModal } from './components/ExportDataModal';
import { SettingsModal } from './components/SettingsModal';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'ios_expense_tracker_txs_v1',
  SETTINGS: 'ios_expense_tracker_settings_v1',
  CATEGORIES: 'ios_expense_tracker_cats_v1',
};

export default function App() {
  // Load persisted state or defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return getInitialSeedTransactions();
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_USER_SETTINGS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Active view tab in bottom nav
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Currently selected month view (e.g. '2026-08')
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 7);
    return today;
  });

  // Modal open states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Category drill-down filter on ledger
  const [drillDownCategoryId, setDrillDownCategoryId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories', e);
    }
  }, [categories]);

  // Sync Dark/Light theme class on document body
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Derived available months
  const availableMonths = useMemo(() => {
    return getAvailableMonthKeys(transactions);
  }, [transactions]);

  // Ensure selectedMonthKey is valid
  useEffect(() => {
    if (!availableMonths.includes(selectedMonthKey) && availableMonths.length > 0) {
      setSelectedMonthKey(availableMonths[0]);
    }
  }, [availableMonths, selectedMonthKey]);

  // Month stats for selected month
  const currentMonthSummary: MonthSummary = useMemo(() => {
    return calculateMonthStats(transactions, selectedMonthKey, settings.monthlyBudget);
  }, [transactions, selectedMonthKey, settings.monthlyBudget]);

  // Category breakdown for selected month
  const expenseBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions, selectedMonthKey, categories, 'expense');
  }, [transactions, selectedMonthKey, categories]);

  const incomeBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions, selectedMonthKey, categories, 'income');
  }, [transactions, selectedMonthKey, categories]);

  // Transactions filtered by selected month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => getMonthKey(t.date) === selectedMonthKey);
  }, [transactions, selectedMonthKey]);

  // Add / Edit Transaction Handler
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...txData } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Automatically adjust active month to match added transaction date if needed
      const txMonthKey = getMonthKey(txData.date);
      if (txMonthKey !== selectedMonthKey) {
        setSelectedMonthKey(txMonthKey);
      }
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    if (settings.enableHaptics) playIOSHapticSound('tap');
    setAddModalInitialType(type);
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleSelectCategoryDrillDown = (catId: string) => {
    setDrillDownCategoryId(catId);
    setActiveTab('transactions');
  };

  // Perform Monthly Reset / Rollover
  const handlePerformReset = (options: {
    mode: 'next-month-rollover' | 'clear-current-month' | 'archive-only';
    carryOverSurplus: boolean;
    includeRecurring: boolean;
  }) => {
    const [curYear, curMonth] = selectedMonthKey.split('-').map((v) => parseInt(v, 10));

    if (options.mode === 'clear-current-month') {
      setTransactions((prev) => prev.filter((t) => getMonthKey(t.date) !== selectedMonthKey));
      return;
    }

    if (options.mode === 'next-month-rollover') {
      // Calculate next month key
      let nextYear = curYear;
      let nextMonth = curMonth + 1;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      const nextMonthKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
      const newTxs: Transaction[] = [];

      // Rollover recurring items with new date
      if (options.includeRecurring) {
        const recurringItems = transactions.filter(
          (t) => getMonthKey(t.date) === selectedMonthKey && t.recurring && t.recurring !== 'none'
        );

        recurringItems.forEach((rec, idx) => {
          const originalDay = rec.date.slice(8, 10);
          const newDate = `${nextMonthKey}-${originalDay}`;
          newTxs.push({
            ...rec,
            id: `rec-roll-${Date.now()}-${idx}`,
            date: newDate,
            createdAt: Date.now() + idx * 10,
          });
        });
      }

      // Rollover surplus balance
      if (options.carryOverSurplus && currentMonthSummary.netSavings > 0) {
        newTxs.push({
          id: `surplus-roll-${Date.now()}`,
          title: `Surplus Rollover (${currentMonthSummary.label})`,
          amount: currentMonthSummary.netSavings,
          type: 'income',
          categoryId: 'cat-other-inc',
          date: `${nextMonthKey}-01`,
          paymentMethod: 'Bank Transfer',
          notes: 'Unspent surplus carried over from previous budget cycle',
          createdAt: Date.now(),
        });
      }

      if (newTxs.length > 0) {
        setTransactions((prev) => [...newTxs, ...prev]);
      }

      // Switch view to the new month
      setSelectedMonthKey(nextMonthKey);
    }
  };

  const handleUpdateResetDay = (newDay: number) => {
    setSettings((prev) => ({ ...prev, resetDayOfMonth: newDay }));
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const filteredNew = imported.filter((t) => !existingIds.has(t.id));
      return [...filteredNew, ...prev];
    });
  };

  const handleResetToDemoData = () => {
    setTransactions(getInitialSeedTransactions());
    setCategories(DEFAULT_CATEGORIES);
    setSettings(DEFAULT_USER_SETTINGS);
    setSelectedMonthKey('2026-08');
  };

  const handleClearAllData = () => {
    setTransactions([]);
  };

  return (
    <div className="relative min-h-screen bg-[#D4E4F7] bg-gradient-to-br from-[#E0C3FC]/70 via-[#D4E4F7] to-[#8EC5FC]/80 dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#1E1B4B] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors selection:bg-blue-500 selection:text-white overflow-x-hidden">
      {/* Ambient glowing blurred orbs for frosted glass depth */}
      <div className="fixed top-[-10%] left-[-5%] w-[450px] h-[450px] bg-purple-400/30 dark:bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[20%] w-[450px] h-[450px] bg-pink-300/25 dark:bg-pink-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* iOS Top App Header with Frosted Glass */}
      <IOSHeader
        settings={settings}
        currentMonthKey={selectedMonthKey}
        availableMonths={availableMonths}
        onSelectMonth={setSelectedMonthKey}
        onOpenAddModal={handleOpenAddModal}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-28 space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="tab-dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* iOS Wallet Hero Card */}
            <WalletHeroCard
              summary={currentMonthSummary}
              settings={settings}
              onOpenAddModal={handleOpenAddModal}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />

            {/* Expenses Pie Chart Section */}
            <ExpensesPieChart
              categoriesBreakdown={expenseBreakdown}
              incomeBreakdown={incomeBreakdown}
              transactions={currentMonthTransactions}
              categories={categories}
              monthKey={selectedMonthKey}
              settings={settings}
              onSelectCategory={handleSelectCategoryDrillDown}
            />

            {/* Recent Transactions List */}
            <TransactionList
              transactions={currentMonthTransactions}
              categories={categories}
              settings={settings}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={handleOpenAddModal}
              filterCategoryId={drillDownCategoryId}
              onClearCategoryFilter={() => setDrillDownCategoryId(null)}
            />
          </motion.div>
        )}

        {/* TAB 2: PIE CHART & BREAKDOWN */}
        {activeTab === 'breakdown' && (
          <motion.div
            key="tab-breakdown"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <ExpensesPieChart
              categoriesBreakdown={expenseBreakdown}
              incomeBreakdown={incomeBreakdown}
              transactions={currentMonthTransactions}
              categories={categories}
              monthKey={selectedMonthKey}
              settings={settings}
              onSelectCategory={handleSelectCategoryDrillDown}
            />

            {/* Supporting Transaction List filtered by month */}
            <TransactionList
              transactions={currentMonthTransactions}
              categories={categories}
              settings={settings}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={handleOpenAddModal}
              filterCategoryId={drillDownCategoryId}
              onClearCategoryFilter={() => setDrillDownCategoryId(null)}
            />
          </motion.div>
        )}

        {/* TAB 3: MONTHLY COMPARISON */}
        {activeTab === 'comparison' && (
          <motion.div
            key="tab-comparison"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <MonthlyComparisonView
              transactions={transactions}
              categories={categories}
              availableMonths={availableMonths}
              currentMonthKey={selectedMonthKey}
              settings={settings}
              onSelectMonth={setSelectedMonthKey}
            />
          </motion.div>
        )}

        {/* TAB 4: FULL TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <motion.div
            key="tab-transactions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <TransactionList
              transactions={transactions}
              categories={categories}
              settings={settings}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={handleOpenAddModal}
              filterCategoryId={drillDownCategoryId}
              onClearCategoryFilter={() => setDrillDownCategoryId(null)}
            />
          </motion.div>
        )}

        {/* TAB 5: CSV EXPORT & IMPORT STUDIO */}
        {activeTab === 'export' && (
          <motion.div
            key="tab-export"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/60 dark:border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/40 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs border border-emerald-500/20">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Data Export & Records Management
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Download spreadsheet-ready CSV records or restore backups
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center gap-1.5"
                  id="open-export-studio-btn"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Open Export Studio
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
                <div
                  onClick={() => setIsExportModalOpen(true)}
                  className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition cursor-pointer border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs"
                >
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Current Cycle CSV
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {getMonthLabel(selectedMonthKey)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentMonthTransactions.length} records ready
                  </p>
                </div>

                <div
                  onClick={() => setIsExportModalOpen(true)}
                  className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition cursor-pointer border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs"
                >
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                    All-Time Database CSV
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Full History</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{transactions.length} total entries</p>
                </div>

                <div
                  onClick={() => setIsResetModalOpen(true)}
                  className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition cursor-pointer border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs"
                >
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                    Cycle Reset & Rollover
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Start New Month</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Preserve recurring salary & rent</p>
                </div>
              </div>
            </div>

            {/* Ledger overview inside Export tab */}
            <TransactionList
              transactions={transactions}
              categories={categories}
              settings={settings}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={handleOpenAddModal}
            />
          </motion.div>
        )}
      </main>

      {/* iOS Bottom Navigation Bar */}
      <IOSNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        settings={settings}
        transactionCount={currentMonthTransactions.length}
      />

      {/* MODALS */}
      {/* 1. Transaction Add/Edit Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        settings={settings}
        editingTransaction={editingTransaction}
        initialType={addModalInitialType}
      />

      {/* 2. Monthly Reset Modal */}
      <MonthlyResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        currentSummary={currentMonthSummary}
        settings={settings}
        onPerformReset={handlePerformReset}
        onUpdateResetDay={handleUpdateResetDay}
      />

      {/* 3. Export Data Modal (CSV & JSON) */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
        availableMonths={availableMonths}
        currentMonthKey={selectedMonthKey}
        settings={settings}
        onImportTransactions={handleImportTransactions}
      />

      {/* 4. Personalization & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onResetToDemoData={handleResetToDemoData}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
