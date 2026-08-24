import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Category, CategorySpend, Transaction, UserSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/helpers';
import { PieChart as PieIcon, Layers, CreditCard, ChevronRight } from 'lucide-react';

interface ExpensesPieChartProps {
  categoriesBreakdown: CategorySpend[];
  incomeBreakdown: CategorySpend[];
  transactions: Transaction[];
  categories: Category[];
  monthKey: string;
  settings: UserSettings;
  onSelectCategory?: (categoryId: string) => void;
}

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({
  categoriesBreakdown,
  incomeBreakdown,
  transactions,
  settings,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'payment'>('expense');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Compute payment method breakdown
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(transactions[0]?.date.slice(0, 7) || '2026-08'));
  const paymentMethodsMap = new Map<string, number>();
  currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cur = paymentMethodsMap.get(t.paymentMethod) || 0;
      paymentMethodsMap.set(t.paymentMethod, cur + t.amount);
    });

  const paymentColors: Record<string, string> = {
    'Apple Pay': '#000000',
    'Credit Card': '#007AFF',
    'Debit Card': '#34C759',
    Cash: '#FF9500',
    'Bank Transfer': '#5856D6',
  };

  const paymentBreakdown = Array.from(paymentMethodsMap.entries()).map(([method, amount]) => {
    const totalExp = categoriesBreakdown.reduce((sum, c) => sum + c.totalAmount, 0);
    return {
      categoryId: method,
      categoryName: method,
      color: paymentColors[method] || '#8E8E93',
      bgColor: '#F2F2F7',
      icon: 'CreditCard',
      totalAmount: amount,
      percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
      count: currentMonthTransactions.filter((t) => t.paymentMethod === method && t.type === 'expense').length,
    };
  });

  const currentDataset =
    activeTab === 'expense'
      ? categoriesBreakdown
      : activeTab === 'income'
      ? incomeBreakdown
      : paymentBreakdown;

  const totalAmount = currentDataset.reduce((sum, item) => sum + item.totalAmount, 0);

  const chartData = currentDataset.map((item) => ({
    name: item.categoryName,
    value: item.totalAmount,
    color: item.color,
    percentage: item.percentage,
    count: item.count,
    id: item.categoryId,
  }));

  const activeItem = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 dark:border-white/10 transition-colors">
      {/* Header and iOS Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Spending Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visual distribution for current cycle
          </p>
        </div>

        {/* iOS-style Segmented Control */}
        <div className="flex bg-white/50 dark:bg-white/10 backdrop-blur-md p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto border border-white/60 dark:border-white/10 shadow-xs">
          <button
            onClick={() => {
              setActiveTab('expense');
              setActiveIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="pie-tab-expense"
          >
            Expenses
          </button>
          <button
            onClick={() => {
              setActiveTab('income');
              setActiveIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'income'
                ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="pie-tab-income"
          >
            Income
          </button>
          <button
            onClick={() => {
              setActiveTab('payment');
              setActiveIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'payment'
                ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="pie-tab-payment"
          >
            <CreditCard className="w-3 h-3" />
            By Method
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No transactions recorded for this view</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie / Donut Chart */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Tooltip
                  formatter={(val: any) => [
                    formatCurrency(Number(val) || 0, settings.currencySymbol),
                    'Amount',
                  ]}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    color: '#0f172a',
                    fontWeight: 'bold',
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={102}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onClick={(_, index) => {
                    setActiveIndex(index);
                    if (onSelectCategory && chartData[index]) {
                      onSelectCategory(chartData[index].id);
                    }
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                      className="cursor-pointer transition-opacity duration-200"
                      style={{
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.45,
                        filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {activeItem ? activeItem.name : 'Total'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(activeItem ? activeItem.value : totalAmount, settings.currencySymbol, 0)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeItem ? `${activeItem.percentage.toFixed(1)}%` : `${chartData.length} categories`}
              </span>
            </div>
          </div>

          {/* Interactive Category Breakdown List */}
          <div className="lg:col-span-7 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {currentDataset.map((item, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <div
                  key={item.categoryId}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={() => {
                    setActiveIndex(idx);
                    if (onSelectCategory) {
                      onSelectCategory(item.categoryId);
                    }
                  }}
                  className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all backdrop-blur-md border ${
                    isSelected
                      ? 'bg-white/80 dark:bg-white/15 border-blue-500/50 dark:border-blue-400/50 shadow-md scale-[1.01]'
                      : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 shadow-xs'
                  }`}
                  id={`cat-breakdown-${item.categoryId}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-white/50 dark:border-white/10"
                      style={{ backgroundColor: item.color + '22', color: item.color }}
                    >
                      <CategoryIcon name={item.icon} size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.categoryName}
                        </p>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          ({item.count} {item.count === 1 ? 'tx' : 'txs'})
                        </span>
                      </div>

                      {/* Percentage progress bar */}
                      <div className="w-28 sm:w-36 bg-black/5 dark:bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3 flex items-center gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(item.totalAmount, settings.currencySymbol)}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
