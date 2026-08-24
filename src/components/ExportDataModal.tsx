import React, { useState, useMemo } from 'react';
import { Category, Transaction, UserSettings } from '../types';
import {
  downloadCSVFile,
  exportToCSV,
  formatCurrency,
  getMonthLabel,
  parseCSVToTransactions,
  playIOSHapticSound,
} from '../utils/helpers';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Copy,
  Check,
  X,
  Filter,
  Eye,
  FileCode,
} from 'lucide-react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  availableMonths: string[];
  currentMonthKey: string;
  settings: UserSettings;
  onImportTransactions: (imported: Transaction[]) => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  availableMonths,
  currentMonthKey,
  settings,
  onImportTransactions,
}) => {
  const [exportScope, setExportScope] = useState<'current' | 'all' | 'custom'>('current');
  const [customMonth, setCustomMonth] = useState<string>(currentMonthKey);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const selectedMonthFilter = exportScope === 'current' ? currentMonthKey : exportScope === 'custom' ? customMonth : undefined;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonthFilter && !t.date.startsWith(selectedMonthFilter)) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      return true;
    });
  }, [transactions, selectedMonthFilter, filterType]);

  const csvContent = useMemo(() => {
    return exportToCSV(filteredTransactions, categories, settings.currencySymbol);
  }, [filteredTransactions, categories, settings.currencySymbol]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (settings.enableHaptics) playIOSHapticSound('success');
    const timeStamp = new Date().toISOString().slice(0, 10);
    const scopeLabel = exportScope === 'all' ? 'all_time' : selectedMonthFilter;
    const fileName = `ios_expenses_${scopeLabel}_${timeStamp}.csv`;
    downloadCSVFile(csvContent, fileName);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    if (settings.enableHaptics) playIOSHapticSound('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            onImportTransactions(parsed);
            setImportStatus(`Successfully restored ${parsed.length} transactions from JSON.`);
            if (settings.enableHaptics) playIOSHapticSound('success');
          }
        } catch (err) {
          setImportStatus('Invalid JSON backup file format.');
        }
      } else {
        const { transactions: parsedTx, errors } = parseCSVToTransactions(text, categories);
        if (parsedTx.length > 0) {
          onImportTransactions(parsedTx);
          setImportStatus(
            `Imported ${parsedTx.length} transactions from CSV! ${
              errors.length > 0 ? `(${errors.length} skipped rows)` : ''
            }`
          );
          if (settings.enableHaptics) playIOSHapticSound('success');
        } else {
          setImportStatus(`Failed to parse CSV. ${errors.join(', ')}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ios_expenses_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-t-[36px] sm:rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        id="export-data-modal"
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Data Management & CSV Export
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export records in standard CSV format for Excel, Numbers, or Sheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 pt-3 border-b border-white/40 dark:border-white/10 gap-4">
          <button
            onClick={() => setActiveViewTab('export')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeViewTab === 'export'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Records
          </button>
          <button
            onClick={() => setActiveViewTab('import')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeViewTab === 'import'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import / Backup
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeViewTab === 'export' ? (
            <>
              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Scope */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Timeframe Scope
                  </label>
                  <div className="grid grid-cols-3 p-1 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/10 rounded-2xl text-xs font-semibold backdrop-blur-md shadow-xs">
                    <button
                      type="button"
                      onClick={() => setExportScope('current')}
                      className={`py-2 rounded-xl transition ${
                        exportScope === 'current'
                          ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Active Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportScope('all')}
                      className={`py-2 rounded-xl transition ${
                        exportScope === 'all'
                          ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportScope('custom')}
                      className={`py-2 rounded-xl transition ${
                        exportScope === 'custom'
                          ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Select Month
                    </button>
                  </div>
                </div>

                {/* Filter Type */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Entry Type
                  </label>
                  <div className="grid grid-cols-3 p-1 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/10 rounded-2xl text-xs font-semibold backdrop-blur-md shadow-xs">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`py-2 rounded-xl transition ${
                        filterType === 'all'
                          ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('expense')}
                      className={`py-2 rounded-xl transition ${
                        filterType === 'expense'
                          ? 'bg-rose-500 text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Expenses
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('income')}
                      className={`py-2 rounded-xl transition ${
                        filterType === 'income'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Month selector if custom scope selected */}
              {exportScope === 'custom' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Select Target Month:
                  </label>
                  <select
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-md shadow-xs outline-none cursor-pointer"
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {getMonthLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick Summary Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-xs text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Ready to export: <strong className="text-slate-900 dark:text-white font-bold">{filteredTransactions.length} entries</strong>
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Total Volume:{' '}
                  <strong className="text-slate-900 dark:text-white font-extrabold">
                    {formatCurrency(
                      filteredTransactions.reduce((s, t) => s + t.amount, 0),
                      settings.currencySymbol
                    )}
                  </strong>
                </span>
              </div>

              {/* Live CSV Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    CSV Output Preview
                  </label>
                  <button
                    onClick={handleCopyClipboard}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Raw CSV'}
                  </button>
                </div>

                <div className="bg-slate-950/85 backdrop-blur-md text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] max-h-40 overflow-auto border border-white/10 shadow-inner leading-relaxed">
                  <pre className="whitespace-pre">{csvContent}</pre>
                </div>
              </div>
            </>
          ) : (
            /* Import & Backup View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 backdrop-blur-md text-xs text-blue-900 dark:text-blue-200 space-y-1 shadow-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-500" />
                  Import from CSV or JSON
                </p>
                <p className="opacity-90">
                  Upload an existing CSV file from your bank or a previous export to seamlessly add records into your
                  tracker.
                </p>
              </div>

              {importStatus && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 backdrop-blur-md text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
                  {importStatus}
                </div>
              )}

              {/* Upload Drop Area */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/60 dark:border-white/20 bg-white/40 dark:bg-white/5 rounded-3xl cursor-pointer hover:border-blue-500 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-md transition text-center shadow-xs">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to select CSV or JSON File
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports standard CSV exports & JSON backups</span>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* JSON Backup Export Button */}
              <div className="pt-3 border-t border-white/40 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Full Snapshot Backup
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Export complete raw database in JSON format</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs backdrop-blur-md"
                >
                  <FileCode className="w-3.5 h-3.5 text-purple-500" />
                  Download JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {activeViewTab === 'export' && (
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
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center gap-1.5"
              id="confirm-export-csv-btn"
            >
              <Download className="w-4 h-4" />
              Download CSV ({filteredTransactions.length} items)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
