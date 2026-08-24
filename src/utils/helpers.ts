import { Category, CategorySpend, MonthSummary, Transaction, UserSettings } from '../types';

export function formatCurrency(amount: number, currencySymbol: string = '$', decimals = 2): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, currencySymbol: string = '$'): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${currencySymbol}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${currencySymbol}${(abs / 1_000).toFixed(1)}k`;
  }
  return `${sign}${currencySymbol}${abs.toFixed(0)}`;
}

export function getMonthKey(dateString: string): string {
  if (!dateString) return new Date().toISOString().slice(0, 7);
  return dateString.slice(0, 7); // 'YYYY-MM'
}

export function getMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getShortMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function formatDateDisplay(dateStr: string): string {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return target.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function calculateMonthStats(transactions: Transaction[], monthKey: string, budget: number): MonthSummary {
  const filtered = transactions.filter((t) => getMonthKey(t.date) === monthKey);

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of filtered) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  return {
    monthKey,
    label: getMonthLabel(monthKey),
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    budget,
    transactionCount: filtered.length,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  monthKey: string,
  categories: Category[],
  type: 'expense' | 'income' = 'expense'
): CategorySpend[] {
  const filtered = transactions.filter((t) => getMonthKey(t.date) === monthKey && t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { totalAmount: number; count: number }>();

  for (const t of filtered) {
    const existing = map.get(t.categoryId) || { totalAmount: 0, count: 0 };
    map.set(t.categoryId, {
      totalAmount: existing.totalAmount + t.amount,
      count: existing.count + 1,
    });
  }

  const result: CategorySpend[] = [];

  map.forEach((value, catId) => {
    const cat = categories.find((c) => c.id === catId) || {
      id: catId,
      name: 'Uncategorized',
      color: '#8E8E93',
      bgColor: '#F2F2F7',
      icon: 'Tag',
      type,
    };

    result.push({
      categoryId: catId,
      categoryName: cat.name,
      color: cat.color,
      bgColor: cat.bgColor,
      icon: cat.icon,
      totalAmount: value.totalAmount,
      percentage: total > 0 ? (value.totalAmount / total) * 100 : 0,
      count: value.count,
    });
  });

  return result.sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getAvailableMonthKeys(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  set.add(currentMonthKey);

  for (const t of transactions) {
    set.add(getMonthKey(t.date));
  }

  return Array.from(set).sort().reverse();
}

/**
 * Generate CSV string from transactions
 */
export function exportToCSV(
  transactions: Transaction[],
  categories: Category[],
  currencySymbol: string = '$',
  filterMonth?: string
): string {
  const items = filterMonth
    ? transactions.filter((t) => getMonthKey(t.date) === filterMonth)
    : transactions;

  const headers = [
    'ID',
    'Date',
    'Title',
    'Type',
    'Category',
    `Amount (${currencySymbol})`,
    'Payment Method',
    'Recurring',
    'Tags',
    'Notes',
  ];

  const catMap = new Map<string, string>();
  categories.forEach((c) => catMap.set(c.id, c.name));

  const escapeCSV = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map((t) => [
    escapeCSV(t.id),
    escapeCSV(t.date),
    escapeCSV(t.title),
    escapeCSV(t.type),
    escapeCSV(catMap.get(t.categoryId) || 'Uncategorized'),
    t.amount.toFixed(2),
    escapeCSV(t.paymentMethod),
    escapeCSV(t.recurring || 'none'),
    escapeCSV(t.tags?.join('; ') || ''),
    escapeCSV(t.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Trigger CSV File download in browser
 */
export function downloadCSVFile(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded CSV back into Transactions
 */
export function parseCSVToTransactions(
  csvText: string,
  categories: Category[]
): { transactions: Transaction[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { transactions: [], errors: ['CSV file is empty or missing data rows'] };
  }

  const categoryLookup = new Map<string, string>();
  categories.forEach((c) => categoryLookup.set(c.name.toLowerCase(), c.id));

  const transactions: Transaction[] = [];
  const errors: string[] = [];

  // Parse RFC4180 CSV line into tokens
  const parseCSVLine = (text: string): string[] => {
    const p: string[] = [];
    let insideQuotes = false;
    let token = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (insideQuotes && text[i + 1] === '"') {
          token += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        p.push(token.trim());
        token = '';
      } else {
        token += char;
      }
    }
    p.push(token.trim());
    return p;
  };

  const headerTokens = parseCSVLine(lines[0]).map((h) => h.toLowerCase());

  // Find column indices
  const dateIdx = headerTokens.findIndex((h) => h.includes('date'));
  const titleIdx = headerTokens.findIndex((h) => h.includes('title') || h.includes('desc') || h.includes('name'));
  const typeIdx = headerTokens.findIndex((h) => h.includes('type'));
  const catIdx = headerTokens.findIndex((h) => h.includes('category'));
  const amountIdx = headerTokens.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('price'));
  const methodIdx = headerTokens.findIndex((h) => h.includes('method') || h.includes('payment'));
  const notesIdx = headerTokens.findIndex((h) => h.includes('note'));

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCSVLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => c === '')) continue;

      const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : `Imported Record #${i}`;
      const rawDate = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().slice(0, 10);
      const cleanDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : new Date().toISOString().slice(0, 10);

      const rawAmount = amountIdx !== -1 && cols[amountIdx] ? cols[amountIdx].replace(/[^0-9.-]/g, '') : '0';
      const amount = Math.abs(parseFloat(rawAmount) || 0);

      const rawType = typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx].toLowerCase() : 'expense';
      const type: 'expense' | 'income' = rawType.includes('inc') ? 'income' : 'expense';

      const catName = catIdx !== -1 && cols[catIdx] ? cols[catIdx].toLowerCase() : '';
      let categoryId = categoryLookup.get(catName);
      if (!categoryId) {
        categoryId = type === 'income' ? 'cat-salary' : 'cat-other-exp';
      }

      const paymentMethod = methodIdx !== -1 && cols[methodIdx] ? (cols[methodIdx] as any) : 'Apple Pay';
      const notes = notesIdx !== -1 && cols[notesIdx] ? cols[notesIdx] : '';

      transactions.push({
        id: `imp-${Date.now()}-${i}`,
        title,
        amount,
        type,
        categoryId,
        date: cleanDate,
        paymentMethod: ['Apple Pay', 'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'].includes(paymentMethod)
          ? paymentMethod
          : 'Apple Pay',
        notes,
        createdAt: Date.now() - i * 1000,
      });
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err?.message || 'Invalid row format'}`);
    }
  }

  return { transactions, errors };
}

/**
 * Web Audio API gentle iOS Haptic Feedback simulation
 */
export function playIOSHapticSound(type: 'tap' | 'success' | 'delete' | 'warning' = 'tap') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'tap') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'delete') {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    // Ignore audio permission/context errors
  }
}
