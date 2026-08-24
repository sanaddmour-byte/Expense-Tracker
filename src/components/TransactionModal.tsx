import React, { useState, useEffect } from 'react';
import { Category, PaymentMethod, RecurrenceType, Transaction, TransactionType, UserSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { X, Calendar, Tag, FileText, Check, Repeat, CreditCard } from 'lucide-react';
import { playIOSHapticSound } from '../utils/helpers';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  categories: Category[];
  settings: UserSettings;
  editingTransaction?: Transaction | null;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  settings,
  editingTransaction,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Apple Pay');
  const [recurring, setRecurring] = useState<RecurrenceType>('none');
  const [notes, setNotes] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setTitle(editingTransaction.title);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setRecurring(editingTransaction.recurring || 'none');
      setNotes(editingTransaction.notes || '');
      setTagInput(editingTransaction.tags?.join(', ') || '');
    } else {
      setType(initialType);
      setAmount('');
      setTitle('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod(type === 'income' ? 'Bank Transfer' : 'Apple Pay');
      setRecurring('none');
      setNotes('');
      setTagInput('');
      const defaultCat = categories.find((c) => c.type === initialType);
      if (defaultCat) setCategoryId(defaultCat.id);
    }
  }, [editingTransaction, initialType, isOpen, categories]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (settings.enableHaptics) playIOSHapticSound('tap');
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) setCategoryId(firstCat.id);
    if (newType === 'income' && paymentMethod === 'Apple Pay') {
      setPaymentMethod('Bank Transfer');
    }
  };

  const handlePresetAmount = (val: number) => {
    if (settings.enableHaptics) playIOSHapticSound('tap');
    setAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title or description');
      return;
    }

    if (settings.enableHaptics) playIOSHapticSound('success');

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave(
      {
        title: title.trim(),
        amount: numAmount,
        type,
        categoryId: categoryId || filteredCategories[0]?.id || 'cat-other-exp',
        date,
        paymentMethod,
        recurring,
        notes: notes.trim(),
        tags: tags.length > 0 ? tags : undefined,
      },
      editingTransaction?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-t-[36px] sm:rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        id="transaction-modal"
      >
        {/* iOS Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/40 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTransaction ? 'Edit Transaction' : 'New Entry'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            id="close-tx-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* iOS Segmented Type Switcher */}
          <div className="grid grid-cols-2 p-1 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 shadow-xs">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              id="modal-type-expense"
            >
              Expense (-{settings.currencySymbol})
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              id="modal-type-income"
            >
              Income (+{settings.currencySymbol})
            </button>
          </div>

          {/* Big Amount Input Field with Currency Symbol */}
          <div className="text-center py-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Amount
            </label>
            <div className="inline-flex items-center justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-400">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white bg-transparent border-0 outline-none w-56 text-center focus:ring-0"
                id="tx-amount-input"
              />
            </div>

            {/* Quick Amount Pill Presets */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {[10, 25, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePresetAmount(val)}
                  className="px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 border border-white/60 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-xs"
                >
                  +{settings.currencySymbol}
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Title / Payee
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Whole Foods Groceries, Rent, Uber' : 'e.g. Monthly Salary, Freelance Work'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-sm font-semibold border border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-md shadow-xs"
              id="tx-title-input"
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      if (settings.enableHaptics) playIOSHapticSound('tap');
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all border ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 shadow-sm ring-2 ring-blue-500/30'
                        : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/70 backdrop-blur-md'
                    }`}
                    id={`cat-select-${cat.id}`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-white/40 dark:border-white/10"
                      style={{ backgroundColor: cat.color + '22', color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight line-clamp-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-semibold border border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-md shadow-xs"
                id="tx-date-input"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-semibold border border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer backdrop-blur-md shadow-xs"
                id="tx-method-select"
              >
                <option value="Apple Pay">Apple Pay</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Recurrence & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-purple-500" />
                Repeat Frequency
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurrenceType)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-semibold border border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer backdrop-blur-md shadow-xs"
                id="tx-recurring-select"
              >
                <option value="none">One-time only</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly (Recurring Bill)</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Vacation, Groceries"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-semibold border border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-md shadow-xs"
                id="tx-tags-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              Notes / Memo (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add details, receipt reference, or memo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs font-semibold border border-white/60 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none resize-none backdrop-blur-md shadow-xs"
              id="tx-notes-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 pb-3">
            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
              id="save-tx-btn"
            >
              <Check className="w-4 h-4" />
              {editingTransaction ? 'Save Changes' : type === 'expense' ? 'Record Expense' : 'Record Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
