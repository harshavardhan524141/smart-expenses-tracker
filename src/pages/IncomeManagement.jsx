import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Notification from '../components/Notification.jsx';

const INCOME_SOURCES = ['Salary', 'Freelancing', 'Business', 'Investments', 'Other'];
const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Direct Deposit', 'Other'];

export default function IncomeManagement() {
  const { token, profile } = useAuth();
  const currency = profile?.currency || 'INR';

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Salary',
    payment_method: 'Bank Transfer',
    transaction_date: formatDateForInput(),
    description: '',
  });

  async function loadIncomes() {
    try {
      setLoading(true);
      const res = await api.getTransactions(
        {
          type: 'income',
          category: sourceFilter !== 'All' ? sourceFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: searchTerm || undefined,
          sortBy: 'transaction_date',
          sortOrder: 'desc',
        },
        token
      );
      if (res.success) {
        setIncomes(res.data);
      }
    } catch (err) {
      console.error('Failed to load income:', err);
      showToast('error', err.message || 'Failed to fetch income records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncomes();
  }, [token, sourceFilter, startDate, endDate]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadIncomes();
  }

  function showToast(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      title: '',
      amount: '',
      category: 'Salary',
      payment_method: 'Bank Transfer',
      transaction_date: formatDateForInput(),
      description: '',
    });
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      amount: item.amount,
      category: item.category,
      payment_method: item.payment_method,
      transaction_date: formatDateForInput(item.transaction_date),
      description: item.description || '',
    });
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const payload = {
        type: 'income',
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        payment_method: formData.payment_method,
        transaction_date: formData.transaction_date,
        description: formData.description.trim(),
      };

      if (editingItem) {
        await api.updateTransaction(editingItem.id, payload, token);
        showToast('success', 'Income record updated successfully');
      } else {
        await api.createTransaction(payload, token);
        showToast('success', 'New income logged successfully');
      }

      setIsModalOpen(false);
      loadIncomes();
    } catch (err) {
      console.error('Form submission error:', err);
      showToast('error', err.message || 'Failed to save income record');
    } finally {
      setFormSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await api.deleteTransaction(deletingId, token);
      showToast('success', 'Income record deleted');
      setDeletingId(null);
      loadIncomes();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete record');
    }
  }

  const totalIncomeAmount = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Income Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track revenue sources, salary deposits, client payouts, and investments
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Income</span>
        </button>
      </div>

      {/* Total Filtered Income Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Income (Selected Filter)</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 tracking-tight tabular-nums">
              {formatCurrency(totalIncomeAmount, currency)}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 sm:text-right">
          <span className="font-semibold text-slate-900 tabular-nums">{incomes.length}</span> recorded income entries
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </form>

          {/* Source Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="All">All Sources</option>
              {INCOME_SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Date Range End */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {(searchTerm || sourceFilter !== 'All' || startDate || endDate) && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('All');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Income Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading income records...</span>
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">No income records found</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your filters or log a new income entry.</p>
                  </td>
                </tr>
              ) : (
                incomes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(item.transaction_date)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{item.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.payment_method}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                      +{formatCurrency(item.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                {editingItem ? 'Edit Income Entry' : 'Log New Income'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Income Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Company Salary, Client Milestone"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="85000.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Income Source *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {INCOME_SOURCES.map((src) => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context about this payment..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
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
                  {formSubmitting ? 'Saving...' : editingItem ? 'Update Income' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Income Record"
        message="Are you sure you want to delete this income entry? Your total balance and reports will be recalculated automatically."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

      {/* Toast Notification */}
      <Notification notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
