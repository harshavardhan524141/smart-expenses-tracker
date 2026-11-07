// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  AED: 'AED ',
};

/**
 * Format currency amount with Indian numbering format (e.g., ₹1,25,000.00 for INR)
 * or standard international format for other currencies.
 */
export function formatCurrency(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] || (currency ? `${currency} ` : '₹');

  try {
    if (currency === 'INR') {
      // Indian numbering system: 1,25,000.00
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
      return `${symbol}${formatted}`;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
    return `${symbol}${formatted}`;
  } catch (_e) {
    return `${symbol}${num.toFixed(2)}`;
  }
}

/**
 * Format date to human-readable format: "07 Nov 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (_e) {
    return dateString;
  }
}

/**
 * Format date for input elements: "YYYY-MM-DD"
 */
export function formatDateForInput(dateString) {
  if (!dateString) return new Date().toISOString().slice(0, 10);
  try {
    const d = new Date(dateString);
    return d.toISOString().slice(0, 10);
  } catch (_e) {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Get category metadata (colors, icons)
 */
export const CATEGORY_META = {
  // Expenses
  Food: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badgeColor: '#10B981' },
  Transportation: { color: 'text-blue-700 bg-blue-50 border-blue-200', badgeColor: '#3B82F6' },
  Shopping: { color: 'text-purple-700 bg-purple-50 border-purple-200', badgeColor: '#8B5CF6' },
  Education: { color: 'text-cyan-700 bg-cyan-50 border-cyan-200', badgeColor: '#06B6D4' },
  Entertainment: { color: 'text-amber-700 bg-amber-50 border-amber-200', badgeColor: '#F59E0B' },
  Healthcare: { color: 'text-rose-700 bg-rose-50 border-rose-200', badgeColor: '#EF4444' },
  Bills: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', badgeColor: '#6366F1' },
  Rent: { color: 'text-sky-700 bg-sky-50 border-sky-200', badgeColor: '#0EA5E9' },
  Travel: { color: 'text-teal-700 bg-teal-50 border-teal-200', badgeColor: '#14B8A6' },
  Others: { color: 'text-slate-700 bg-slate-100 border-slate-200', badgeColor: '#64748B' },

  // Income sources
  Salary: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badgeColor: '#10B981' },
  Freelancing: { color: 'text-blue-700 bg-blue-50 border-blue-200', badgeColor: '#3B82F6' },
  Business: { color: 'text-purple-700 bg-purple-50 border-purple-200', badgeColor: '#8B5CF6' },
  Investments: { color: 'text-amber-700 bg-amber-50 border-amber-200', badgeColor: '#F59E0B' },
  Other: { color: 'text-slate-700 bg-slate-100 border-slate-200', badgeColor: '#64748B' },
};
