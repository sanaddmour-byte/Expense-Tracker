import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  BarChart3,
  ListOrdered,
  FileSpreadsheet,
} from 'lucide-react';
import { playIOSHapticSound } from '../utils/helpers';
import { UserSettings } from '../types';

export type ActiveTab = 'dashboard' | 'breakdown' | 'comparison' | 'transactions' | 'export';

interface IOSNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  transactionCount: number;
}

export const IOSNavigation: React.FC<IOSNavigationProps> = ({
  activeTab,
  onChangeTab,
  settings,
  transactionCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'breakdown', label: 'Pie Chart', icon: <PieChart className="w-5 h-5" /> },
    { id: 'comparison', label: 'Comparison', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'transactions', label: 'Ledger', icon: <ListOrdered className="w-5 h-5" />, badge: transactionCount },
    { id: 'export', label: 'CSV Export', icon: <FileSpreadsheet className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    if (settings.enableHaptics) playIOSHapticSound('tap');
    onChangeTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-t border-white/60 dark:border-white/10 px-3 py-2 pb-safe transition-colors shadow-2xl shadow-blue-900/10">
      <div className="max-w-lg mx-auto grid grid-cols-5 gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/80 dark:bg-white/15 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-white/70 dark:border-white/10 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5 font-medium'
              }`}
              id={`nav-tab-${tab.id}`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
