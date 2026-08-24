import React from 'react';
import { UserSettings } from '../types';
import { getMonthLabel, playIOSHapticSound } from '../utils/helpers';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Download,
  Calendar,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface IOSHeaderProps {
  settings: UserSettings;
  currentMonthKey: string;
  availableMonths: string[];
  onSelectMonth: (monthKey: string) => void;
  onOpenAddModal: (type: 'expense' | 'income') => void;
  onOpenSettingsModal: () => void;
  onOpenExportModal: () => void;
  onOpenResetModal: () => void;
}

export const IOSHeader: React.FC<IOSHeaderProps> = ({
  settings,
  currentMonthKey,
  availableMonths,
  onSelectMonth,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenExportModal,
  onOpenResetModal,
}) => {
  const currentIndex = availableMonths.indexOf(currentMonthKey);
  const hasNext = currentIndex > 0; // later month
  const hasPrev = currentIndex < availableMonths.length - 1; // earlier month

  const handlePrevMonth = () => {
    if (hasPrev) {
      if (settings.enableHaptics) playIOSHapticSound('tap');
      onSelectMonth(availableMonths[currentIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    if (hasNext) {
      if (settings.enableHaptics) playIOSHapticSound('tap');
      onSelectMonth(availableMonths[currentIndex - 1]);
    }
  };

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 bg-white/65 dark:bg-slate-950/65 backdrop-blur-2xl border-b border-white/50 dark:border-white/10 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: User Profile & Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSettingsModal}
            className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 flex items-center justify-center text-xl shadow-xs shrink-0 hover:scale-105 active:scale-95 transition"
            title="Personalize Profile"
            id="header-profile-avatar"
          >
            {settings.avatarEmoji || '🍏'}
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
              {greeting}
            </p>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {settings.userName || 'Sarah Mitchell'}
            </h1>
          </div>
        </div>

        {/* Center: Month Cycle Selector */}
        <div className="flex items-center bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full p-1 shadow-xs border border-white/60 dark:border-white/15">
          <button
            onClick={handlePrevMonth}
            disabled={!hasPrev}
            className={`p-1.5 rounded-full transition ${
              hasPrev
                ? 'text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/20 shadow-xs'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            title="Previous Month"
            id="header-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-2.5 sm:px-3 text-center">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap block">
              {getMonthLabel(currentMonthKey)}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={!hasNext}
            className={`p-1.5 rounded-full transition ${
              hasNext
                ? 'text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/20 shadow-xs'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            title="Next Month"
            id="header-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenExportModal}
            className="px-3 py-2 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 hover:bg-white/80 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition hidden sm:flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Export CSV"
            id="header-export-btn"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/25 transition"
            id="header-add-entry-btn"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Entry</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/20 transition shadow-xs"
            title="Settings & Personalization"
            id="header-settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
