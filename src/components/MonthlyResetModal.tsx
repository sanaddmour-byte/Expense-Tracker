import React, { useState } from 'react';
import { MonthSummary, Transaction, UserSettings } from '../types';
import { formatCurrency, getMonthLabel, playIOSHapticSound } from '../utils/helpers';
import { RotateCcw, X, Calendar, Sparkles, CheckCircle2, AlertCircle, Check } from 'lucide-react';

interface MonthlyResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSummary: MonthSummary;
  settings: UserSettings;
  onPerformReset: (options: {
    mode: 'next-month-rollover' | 'clear-current-month' | 'archive-only';
    carryOverSurplus: boolean;
    includeRecurring: boolean;
  }) => void;
  onUpdateResetDay: (newDay: number) => void;
}

export const MonthlyResetModal: React.FC<MonthlyResetModalProps> = ({
  isOpen,
  onClose,
  currentSummary,
  settings,
  onPerformReset,
  onUpdateResetDay,
}) => {
  const [resetMode, setResetMode] = useState<'next-month-rollover' | 'clear-current-month'>('next-month-rollover');
  const [carryOverSurplus, setCarryOverSurplus] = useState<boolean>(true);
  const [includeRecurring, setIncludeRecurring] = useState<boolean>(true);
  const [selectedResetDay, setSelectedResetDay] = useState<number>(settings.resetDayOfMonth || 1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (settings.enableHaptics) playIOSHapticSound('success');
    if (selectedResetDay !== settings.resetDayOfMonth) {
      onUpdateResetDay(selectedResetDay);
    }
    onPerformReset({
      mode: resetMode,
      carryOverSurplus,
      includeRecurring,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-t-[36px] sm:rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        id="monthly-reset-modal"
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Reset & Rollover</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage budget cycle & start next period</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Current Month Wrap-up Card */}
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              {currentSummary.label} Status
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Net Surplus: </span>
                <span
                  className={`text-base font-extrabold ${
                    currentSummary.netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }`}
                >
                  {formatCurrency(currentSummary.netSavings, settings.currencySymbol)}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {currentSummary.transactionCount} transactions logged
              </span>
            </div>
          </div>

          {/* Reset Mode Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Choose Reset Action
            </label>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setResetMode('next-month-rollover')}
                className={`w-full p-4 rounded-2xl text-left border transition flex items-start gap-3 backdrop-blur-md ${
                  resetMode === 'next-month-rollover'
                    ? 'border-blue-500 bg-blue-500/15 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60'
                }`}
                id="reset-mode-rollover"
              >
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                    resetMode === 'next-month-rollover'
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-400'
                  }`}
                >
                  {resetMode === 'next-month-rollover' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Start Next Month (Recommended)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Archives {currentSummary.label} and initializes a clean budget cycle for the upcoming month with
                    recurring bills preserved.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResetMode('clear-current-month')}
                className={`w-full p-4 rounded-2xl text-left border transition flex items-start gap-3 backdrop-blur-md ${
                  resetMode === 'clear-current-month'
                    ? 'border-rose-500 bg-rose-500/15 shadow-sm ring-2 ring-rose-500/20'
                    : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60'
                }`}
                id="reset-mode-clear"
              >
                <div
                  className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                    resetMode === 'clear-current-month'
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-slate-400'
                  }`}
                >
                  {resetMode === 'clear-current-month' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Clear Current Month Records
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Wipes transactions for {currentSummary.label} to start fresh from scratch in this month.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Rollover options */}
          {resetMode === 'next-month-rollover' && (
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 cursor-pointer shadow-xs">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Carry over recurring salaries & monthly bills
                </span>
                <input
                  type="checkbox"
                  checked={includeRecurring}
                  onChange={(e) => setIncludeRecurring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/10 cursor-pointer shadow-xs">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Log net savings surplus into new month
                </span>
                <input
                  type="checkbox"
                  checked={carryOverSurplus}
                  onChange={(e) => setCarryOverSurplus(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-0"
                />
              </label>
            </div>
          )}

          {/* Reset Day of Month Setting */}
          <div className="pt-2 border-t border-white/40 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Monthly Reset Day
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Day of month your budget cycle starts</p>
              </div>

              <select
                value={selectedResetDay}
                onChange={(e) => setSelectedResetDay(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white cursor-pointer backdrop-blur-md shadow-xs outline-none"
                id="reset-day-select"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                    {d === 1 ? 'st (Default)' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/40 dark:border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center gap-1.5"
            id="confirm-reset-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Apply Monthly Reset
          </button>
        </div>
      </div>
    </div>
  );
};
