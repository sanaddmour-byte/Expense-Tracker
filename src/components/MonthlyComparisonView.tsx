import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Category, MonthSummary, Transaction, UserSettings } from '../types';
import {
  calculateCategoryBreakdown,
  calculateMonthStats,
  formatCurrency,
  getMonthLabel,
  getShortMonthLabel,
} from '../utils/helpers';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface MonthlyComparisonViewProps {
  transactions: Transaction[];
  categories: Category[];
  availableMonths: string[];
  currentMonthKey: string;
  settings: UserSettings;
  onSelectMonth: (monthKey: string) => void;
}

export const MonthlyComparisonView: React.FC<MonthlyComparisonViewProps> = ({
  transactions,
  categories,
  availableMonths,
  currentMonthKey,
  settings,
  onSelectMonth,
}) => {
  const [comparisonBaseMonth, setComparisonBaseMonth] = useState<string>(currentMonthKey);
  const [chartMode, setChartMode] = useState<'bars' | 'savings'>('bars');

  // Ensure chronological order for historical charts (earliest to latest)
  const sortedMonthsChronological = [...availableMonths].reverse();

  // Multi-month summary data for Bar/Area charts
  const multiMonthData = sortedMonthsChronological.map((mKey) => {
    const stats = calculateMonthStats(transactions, mKey, settings.monthlyBudget);
    return {
      monthKey: mKey,
      shortLabel: getShortMonthLabel(mKey),
      label: stats.label,
      Income: stats.totalIncome,
      Expense: stats.totalExpense,
      NetSavings: stats.netSavings,
      SavingsRate: Number(stats.savingsRate.toFixed(1)),
      Budget: stats.budget,
    };
  });

  // Calculate Month-over-Month comparison for selected comparisonBaseMonth vs previous month in sequence
  const currentMonthStats = calculateMonthStats(transactions, comparisonBaseMonth, settings.monthlyBudget);

  // Find previous month key
  const currentIndex = availableMonths.indexOf(comparisonBaseMonth);
  const previousMonthKey =
    currentIndex !== -1 && currentIndex + 1 < availableMonths.length ? availableMonths[currentIndex + 1] : null;

  const previousMonthStats = previousMonthKey
    ? calculateMonthStats(transactions, previousMonthKey, settings.monthlyBudget)
    : null;

  // Category delta breakdown
  const currentMonthCatExpenses = calculateCategoryBreakdown(transactions, comparisonBaseMonth, categories, 'expense');
  const previousMonthCatExpenses = previousMonthKey
    ? calculateCategoryBreakdown(transactions, previousMonthKey, categories, 'expense')
    : [];

  const categoryDeltas = currentMonthCatExpenses.map((cur) => {
    const prev = previousMonthCatExpenses.find((p) => p.categoryId === cur.categoryId);
    const prevAmount = prev ? prev.totalAmount : 0;
    const diff = cur.totalAmount - prevAmount;
    const percentChange = prevAmount > 0 ? (diff / prevAmount) * 100 : cur.totalAmount > 0 ? 100 : 0;
    return {
      ...cur,
      prevAmount,
      diff,
      percentChange,
    };
  });

  // Calculate high level metrics
  const totalAllTimeExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const averageMonthlyExpense =
    availableMonths.length > 0 ? totalAllTimeExpense / availableMonths.length : 0;

  const expenseDiff = previousMonthStats ? currentMonthStats.totalExpense - previousMonthStats.totalExpense : 0;
  const incomeDiff = previousMonthStats ? currentMonthStats.totalIncome - previousMonthStats.totalIncome : 0;

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/40 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Monthly Comparison & Trends
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track how your income, spending, and savings evolve over time
            </p>
          </div>

          {/* Toggle between Bar Comparison and Savings Rate Area Chart */}
          <div className="flex bg-white/50 dark:bg-white/10 backdrop-blur-md p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto border border-white/60 dark:border-white/10 shadow-xs">
            <button
              onClick={() => setChartMode('bars')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                chartMode === 'bars'
                  ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="chart-mode-bars"
            >
              Income vs Expenses
            </button>
            <button
              onClick={() => setChartMode('savings')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                chartMode === 'savings'
                  ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="chart-mode-savings"
            >
              <Percent className="w-3.5 h-3.5" />
              Savings Rate
            </button>
          </div>
        </div>

        {/* Multi-Month Visual Chart */}
        <div className="pt-6 h-[280px]">
          {chartMode === 'bars' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiMonthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142, 142, 147, 0.15)" />
                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tick={{ fill: '#8E8E93', fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8E8E93', fontSize: 11 }}
                  tickFormatter={(val) => formatCurrency(val, settings.currencySymbol, 0)}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatCurrency(Number(val) || 0, settings.currencySymbol),
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 'bold',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar dataKey="Income" fill="#34C759" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Expense" fill="#FF3B30" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={multiMonthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142, 142, 147, 0.15)" />
                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tick={{ fill: '#8E8E93', fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8E8E93', fontSize: 11 }}
                  unit="%"
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Savings Rate']}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    fontSize: '12px',
                    color: '#0f172a',
                    fontWeight: 'bold',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="SavingsRate"
                  stroke="#007AFF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#savingsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick KPI stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-4 border-t border-white/40 dark:border-white/10">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Avg Monthly Spend
            </span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(averageMonthlyExpense, settings.currencySymbol, 0)}
            </p>
          </div>

          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Months Tracked
            </span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {availableMonths.length} Active Cycles
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/50 dark:bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 dark:border-white/10 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Total Tracked Expenses
            </span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalAllTimeExpense, settings.currencySymbol, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Month-over-Month Delta Inspector */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl border border-white/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Month-over-Month Delta
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing {getMonthLabel(comparisonBaseMonth)} vs{' '}
              {previousMonthKey ? getMonthLabel(previousMonthKey) : 'Previous Period'}
            </p>
          </div>

          {/* Month Selector for Delta */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Base Month:</label>
            <select
              value={comparisonBaseMonth}
              onChange={(e) => {
                setComparisonBaseMonth(e.target.value);
                onSelectMonth(e.target.value);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white border border-white/60 dark:border-white/10 backdrop-blur-md cursor-pointer shadow-xs outline-none"
              id="delta-base-month-select"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Delta Comparison Cards (Income & Expense) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Income MoM */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Income Change
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(currentMonthStats.totalIncome, settings.currencySymbol)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                prev: {previousMonthStats ? formatCurrency(previousMonthStats.totalIncome, settings.currencySymbol) : 'N/A'}
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs border ${
                incomeDiff >= 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {incomeDiff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {incomeDiff >= 0 ? '+' : ''}
              {formatCurrency(incomeDiff, settings.currencySymbol)}
            </div>
          </div>

          {/* Expense MoM */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Spending Change
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(currentMonthStats.totalExpense, settings.currencySymbol)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                prev: {previousMonthStats ? formatCurrency(previousMonthStats.totalExpense, settings.currencySymbol) : 'N/A'}
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs border ${
                expenseDiff <= 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {expenseDiff <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {expenseDiff > 0 ? '+' : ''}
              {formatCurrency(expenseDiff, settings.currencySymbol)}
            </div>
          </div>
        </div>

        {/* Category-by-Category Shift */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Category Shift vs Previous Month
        </h4>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {categoryDeltas.map((cat) => {
            const isIncrease = cat.diff > 0;
            return (
              <div
                key={cat.categoryId}
                className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border border-white/60 dark:border-white/10 backdrop-blur-md transition flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-white/50 dark:border-white/10"
                    style={{ backgroundColor: cat.color + '22', color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{cat.categoryName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(cat.totalAmount, settings.currencySymbol)} vs{' '}
                      {formatCurrency(cat.prevAmount, settings.currencySymbol)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                      isIncrease
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        : cat.diff < 0
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                    }`}
                  >
                    {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isIncrease ? '+' : ''}
                    {formatCurrency(cat.diff, settings.currencySymbol)}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {cat.percentChange >= 0 ? '+' : ''}
                    {cat.percentChange.toFixed(0)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
