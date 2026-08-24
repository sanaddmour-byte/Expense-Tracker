import React, { useState } from 'react';
import { UserSettings } from '../types';
import { playIOSHapticSound } from '../utils/helpers';
import {
  X,
  User,
  DollarSign,
  Target,
  Calendar,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2,
  Check,
  Smartphone,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($)' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar ($)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
];

const AVATAR_PRESETS = ['🍏', '💼', '🚀', '💎', '💳', '☕', '📈', '🌟', '🌴', '🎯'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetToDemoData,
  onClearAllData,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [avatarEmoji, setAvatarEmoji] = useState(settings.avatarEmoji);
  const [currency, setCurrency] = useState(settings.currency);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [monthlyBudget, setMonthlyBudget] = useState(settings.monthlyBudget.toString());
  const [savingsGoal, setSavingsGoal] = useState(settings.savingsGoal.toString());
  const [resetDayOfMonth, setResetDayOfMonth] = useState(settings.resetDayOfMonth || 1);
  const [theme, setTheme] = useState(settings.theme);
  const [enableHaptics, setEnableHaptics] = useState(settings.enableHaptics);

  if (!isOpen) return null;

  const handleCurrencyChange = (currCode: string) => {
    const found = CURRENCIES.find((c) => c.code === currCode);
    if (found) {
      setCurrency(found.code);
      setCurrencySymbol(found.symbol);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSettings = {
      ...settings,
      userName: userName.trim() || 'Alex',
      avatarEmoji,
      currency,
      currencySymbol,
      monthlyBudget: parseFloat(monthlyBudget) || 3000,
      savingsGoal: parseFloat(savingsGoal) || 1000,
      resetDayOfMonth,
      theme,
      enableHaptics,
    };

    onSaveSettings(updated);
    if (enableHaptics) playIOSHapticSound('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-t-[36px] sm:rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        id="settings-modal"
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Personalization & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* User Profile Info */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Profile & Greeting
            </label>
            <div className="flex items-center gap-3">
              {/* Avatar Selector */}
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-xs">
                  {avatarEmoji}
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-md focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                  id="settings-username-input"
                />
              </div>
            </div>

            {/* Avatar emojis */}
            <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1">
              {AVATAR_PRESETS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setAvatarEmoji(emo)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition backdrop-blur-md ${
                    avatarEmoji === emo
                      ? 'bg-blue-500/25 border-2 border-blue-500 scale-110 shadow-xs'
                      : 'bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:bg-white/80'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Currency & Financial Target Setup */}
          <div className="pt-2 border-t border-white/40 dark:border-white/10">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Financial Targets
            </label>

            <div className="space-y-3">
              {/* Currency */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-md shadow-xs cursor-pointer outline-none"
                  id="settings-currency-select"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Spending Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-500" />
                    Monthly Budget Target
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-md shadow-xs outline-none focus:ring-2 focus:ring-blue-500"
                      id="settings-budget-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    Savings Goal Target
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={savingsGoal}
                      onChange={(e) => setSavingsGoal(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-md shadow-xs outline-none focus:ring-2 focus:ring-blue-500"
                      id="settings-savings-input"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Day of Month */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Monthly Reset Day of Month
                </label>
                <select
                  value={resetDayOfMonth}
                  onChange={(e) => setResetDayOfMonth(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-md shadow-xs cursor-pointer outline-none"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Day {d} of every month
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Preferences (Theme & Haptics) */}
          <div className="pt-2 border-t border-white/40 dark:border-white/10 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Preferences
            </label>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                Appearance Theme
              </span>
              <div className="flex bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/10 p-0.5 rounded-xl text-xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Haptic Sounds Toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs cursor-pointer">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                {enableHaptics ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                iOS Haptic Audio Feedback
              </span>
              <input
                type="checkbox"
                checked={enableHaptics}
                onChange={(e) => setEnableHaptics(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-0"
              />
            </label>
          </div>

          {/* Database management */}
          <div className="pt-2 border-t border-white/40 dark:border-white/10 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Data Management
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset sample transactions and categories to default?')) {
                    onResetToDemoData();
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/80 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition backdrop-blur-md shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                Load Sample Data
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear ALL transactions? This cannot be undone.')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition backdrop-blur-md shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              id="save-settings-btn"
            >
              <Check className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
