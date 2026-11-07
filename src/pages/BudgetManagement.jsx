import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatCurrency, CATEGORY_META } from '../utils/formatters.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Notification from '../components/Notification.jsx';

const BUDGET_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Rent',
  'Travel',
  'Others',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function BudgetManagement() {
  const { token, profile } = useAuth();
  const currency = profile?.currency || 'INR';

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [budgetsData, setBudgetsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
  });

  async function loadBudgets() {
    try {
      setLoading(true);
      const res = await api.getBudgets(
        {
          month: selectedMonth,
          year: selectedYear,
        },
        token
      );
      if (res.success) {
        setBudgetsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
      showToast('error', err.message || 'Failed to fetch budget calculations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, [token, selectedMonth, selectedYear]);

  function showToast(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  function handlePrevMonth() {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  }

  function handleNextMonth() {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  }

  function openAddModal() {
    setEditingBudget(null);
    setFormData({
      category: 'Food',
      amount: '',
    });
    setIsModalOpen(true);
  }

  function openEditModal(budget) {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.allocated_amount,
    });
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const payload = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: selectedMonth,
        year: selectedYear,
      };

      if (editingBudget) {
        await api.updateBudget(editingBudget.id, payload, token);
        showToast('success', 'Budget cap updated successfully');
      } else {
        await api.createBudget(payload, token);
        showToast('success', 'New category budget allocated');
      }

      setIsModalOpen(false);
      loadBudgets();
    } catch (err) {
      console.error('Budget submit error:', err);
      showToast('error', err.message || 'Failed to save budget limit');
    } finally {
      setFormSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await api.deleteBudget(deletingId, token);
      showToast('success', 'Budget cap removed');
      setDeletingId(null);
      loadBudgets();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete budget');
    }
  }

  const summary = budgetsData?.summary || {
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
    status: 'safe',
  };

  const budgetsList = budgetsData?.budgets || [];

  return (
    <div className="space-y-6">
      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Budget Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure monthly expenditure limits and track spending pace
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800 whitespace-nowrap min-w-32 text-center">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* High-level Overall Budget Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Budget Utilization ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(summary.totalSpent, currency)}
              </span>
              <span className="text-sm font-mono text-slate-400 tabular-nums">
                of {formatCurrency(summary.totalBudget, currency)} allocated
              </span>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                summary.status === 'exceeded'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : summary.status === 'warning'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {summary.status === 'exceeded' && <AlertCircle className="w-3.5 h-3.5" />}
              {summary.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
              {summary.status === 'safe' && <CheckCircle className="w-3.5 h-3.5" />}
              <span>{summary.overallPercentage}% Consumed</span>
            </span>
            <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
              {summary.totalRemaining >= 0 ? 'Remaining:' : 'Over budget:'}{' '}
              <span className="font-semibold text-slate-900">
                {formatCurrency(Math.abs(summary.totalRemaining), currency)}
              </span>
            </p>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                summary.status === 'exceeded'
                  ? 'bg-rose-500'
                  : summary.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>0%</span>
            <span className="text-amber-600 font-medium">75% Warning threshold</span>
            <span>100% Limit</span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Category Budgets Breakdown</h2>
          <span className="text-xs text-slate-500">
            {budgetsList.length} categories active
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Computing category expenditures...</p>
          </div>
        ) : budgetsList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 space-y-3">
            <PieIcon className="w-10 h-10 stroke-1 mx-auto text-slate-300" />
            <div>
              <h3 className="text-sm font-semibold text-slate-700">No budgets defined for this month</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Set category limits for Groceries, Rent, Utilities, or Travel to keep your spending controlled.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Budget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetsList.map((b) => {
              const meta = CATEGORY_META[b.category] || CATEGORY_META.Others;

              // Color indicators
              // Green: safe <= 75%
              // Orange: warning 75%-100%
              // Red: exceeded > 100%
              const isExceeded = b.status === 'exceeded';
              const isWarning = b.status === 'warning';

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: meta.badgeColor || '#64748B' }}
                        />
                        <h3 className="text-sm font-bold text-slate-900">{b.category}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Budget Cap"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(b.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Spent:</span>{' '}
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrency(b.spent_amount, currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Limit:</span>{' '}
                        <span className="font-mono text-slate-600 tabular-nums">
                          {formatCurrency(b.allocated_amount, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Category Progress Bar */}
                    <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(b.percentage_used, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Indicator & Remaining */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {isExceeded ? 'Exceeded by ' : 'Remaining: '}
                      {formatCurrency(Math.abs(b.remaining_amount), currency)}
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">{b.percentage_used}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                {editingBudget ? 'Edit Category Budget' : 'Allocate Category Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
                Target Period: <span className="font-semibold text-slate-900">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Category *
                </label>
                <select
                  disabled={Boolean(editingBudget)}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white disabled:bg-slate-100"
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Monthly Budget Cap ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 15000.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 tabular-nums"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget Cap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Remove Budget Cap"
        message="Are you sure you want to remove this category budget? This will not delete your actual transactions, only the spending target."
        confirmText="Remove"
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

      {/* Toast Notification */}
      <Notification notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
