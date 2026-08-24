import React, { useState, useMemo } from 'react';
import { Category, Transaction, UserSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatDateDisplay, formatCurrency, playIOSHapticSound } from '../utils/helpers';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Repeat,
  Tag,
  CreditCard,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: (type: 'expense' | 'income') => void;
  filterCategoryId?: string | null;
  onClearCategoryFilter?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  settings,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  filterCategoryId,
  onClearCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const catMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (filterCategoryId && t.categoryId !== filterCategoryId) return false;
      if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const catName = catMap.get(t.categoryId)?.name.toLowerCase() || '';
        const titleMatch = t.title.toLowerCase().includes(query);
        const catMatch = catName.includes(query);
        const notesMatch = t.notes?.toLowerCase().includes(query) || false;
        const tagMatch = t.tags?.some((tg) => tg.toLowerCase().includes(query)) || false;
        return titleMatch || catMatch || notesMatch || tagMatch;
      }

      return true;
    });
  }, [transactions, typeFilter, filterCategoryId, methodFilter, searchTerm, catMap]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach((t) => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const activeCategory = filterCategoryId ? catMap.get(filterCategoryId) : null;

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 dark:border-white/10">
      {/* List Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Activity & Records
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold border border-white/60 dark:border-white/10">
              {filtered.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological log of transactions
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal('expense')}
          className="self-start sm:self-auto px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition active:scale-95"
          id="list-quick-add"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Entry
        </button>
      </div>

      {/* Filter Category Tag if active */}
      {activeCategory && (
        <div className="mb-3 flex items-center gap-2 p-2.5 px-3.5 rounded-2xl bg-blue-500/10 backdrop-blur-md text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
          <span>Filtered by Category:</span>
          <div className="flex items-center gap-1 bg-white/80 dark:bg-white/15 px-2.5 py-0.5 rounded-xl shadow-xs border border-white/60 dark:border-white/10">
            <CategoryIcon name={activeCategory.icon} size={14} />
            <span className="font-bold">{activeCategory.name}</span>
          </div>
          <button
            onClick={onClearCategoryFilter}
            className="ml-auto p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-300 transition"
            title="Clear Filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input and Type Filter Pills */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, tag, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 text-xs font-semibold text-slate-900 dark:text-white border border-white/60 dark:border-white/10 outline-none backdrop-blur-md focus:ring-2 focus:ring-blue-500 shadow-xs"
            id="tx-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
              typeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-bold'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-white/60 dark:border-white/10 hover:bg-white/70'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white shadow-xs font-bold'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-white/60 dark:border-white/10 hover:bg-white/70'
            }`}
          >
            Expenses Only
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-white/60 dark:border-white/10 hover:bg-white/70'
            }`}
          >
            Income Only
          </button>

          {/* Payment Method selector */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/50 dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10 shrink-0 cursor-pointer shadow-xs backdrop-blur-md outline-none"
          >
            <option value="all">All Methods</option>
            <option value="Apple Pay">Apple Pay</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Transaction Records Grouped By Date */}
      {groupedByDate.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No records found</p>
          <p className="text-xs text-slate-400 mt-0.5">Try adjusting filters or tap Add Entry</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedByDate.map(([dateKey, items]) => {
            const dayTotal = items.reduce(
              (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
              0
            );

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>{formatDateDisplay(dateKey)}</span>
                  <span className={dayTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 font-medium'}>
                    {dayTotal >= 0 ? '+' : ''}
                    {formatCurrency(dayTotal, settings.currencySymbol)}
                  </span>
                </div>

                {/* Date items container */}
                <div className="bg-white/40 dark:bg-white/5 rounded-2xl divide-y divide-white/40 dark:divide-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-xs">
                  {items.map((t) => {
                    const cat = catMap.get(t.categoryId) || {
                      name: 'Uncategorized',
                      color: '#8E8E93',
                      bgColor: '#F2F2F7',
                      icon: 'Tag',
                    };
                    const isIncome = t.type === 'income';

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 flex items-center justify-between hover:bg-white/60 dark:hover:bg-white/10 transition group"
                        id={`tx-row-${t.id}`}
                      >
                        {/* Left: Icon & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-white/50 dark:border-white/10"
                            style={{ backgroundColor: cat.color + '20', color: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {t.title}
                              </h4>
                              {t.recurring && t.recurring !== 'none' && (
                                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                                  <Repeat className="w-2.5 h-2.5 mr-0.5" />
                                  {t.recurring}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                              <span>•</span>
                              <span className="text-[11px]">{t.paymentMethod}</span>
                              {t.notes && (
                                <>
                                  <span>•</span>
                                  <span className="italic truncate max-w-[140px] text-[11px]">{t.notes}</span>
                                </>
                              )}
                            </div>

                            {/* Tags */}
                            {t.tags && t.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {t.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold border border-white/50 dark:border-white/10"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Action Hover Buttons */}
                        <div className="flex items-center gap-3 pl-3 shrink-0">
                          <div className="text-right">
                            <p
                              className={`text-sm sm:text-base font-extrabold tracking-tight ${
                                isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(t.amount, settings.currencySymbol)}
                            </p>
                          </div>

                          {/* Action Buttons (iOS subtle) */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (settings.enableHaptics) playIOSHapticSound('tap');
                                onEditTransaction(t);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (settings.enableHaptics) playIOSHapticSound('delete');
                                onDeleteTransaction(t.id);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
