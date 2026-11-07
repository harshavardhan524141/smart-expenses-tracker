import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  X,
  ArrowUpRight,
  ArrowUpDown,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatCurrency, formatDate, formatDateForInput, CATEGORY_META } from '../utils/formatters.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Notification from '../components/Notification.jsx';

const EXPENSE_CATEGORIES = [
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

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Cash',
  'Other',
];

export default function ExpenseManagement() {
  const { token, profile } = useAuth();
  const currency = profile?.currency || 'INR';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, highest, lowest

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    payment_method: 'UPI',
    transaction_date: formatDateForInput(),
    description: '',
  });

  async function loadExpenses() {
    try {
      setLoading(true);

      let sortBy = 'transaction_date';
      let sortOrder = 'desc';

      if (sortOption === 'oldest') {
        sortBy = 'transaction_date';
        sortOrder = 'asc';
      } else if (sortOption === 'highest') {
        sortBy = 'amount';
        sortOrder = 'desc';
      } else if (sortOption === 'lowest') {
        sortBy = 'amount';
        sortOrder = 'asc';
      }

      const res = await api.getTransactions(
        {
          type: 'expense',
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          payment_method: paymentFilter !== 'All' ? paymentFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: searchTerm || undefined,
          sortBy,
          sortOrder,
        },
        token
      );

      if (res.success) {
        setExpenses(res.data);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
      showToast('error', err.message || 'Failed to fetch expense records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, [token, categoryFilter, paymentFilter, startDate, endDate, sortOption]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadExpenses();
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
      category: 'Food',
      payment_method: 'UPI',
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
        type: 'expense',
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        payment_method: formData.payment_method,
        transaction_date: formData.transaction_date,
        description: formData.description.trim(),
      };

      if (editingItem) {
        await api.updateTransaction(editingItem.id, payload, token);
        showToast('success', 'Expense updated successfully');
      } else {
        await api.createTransaction(payload, token);
        showToast('success', 'New expense logged successfully');
      }

      setIsModalOpen(false);
      loadExpenses();
    } catch (err) {
      console.error('Form submit error:', err);
      showToast('error', err.message || 'Failed to save expense record');
    } finally {
      setFormSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await api.deleteTransaction(deletingId, token);
      showToast('success', 'Expense record deleted successfully');
      setDeletingId(null);
      loadExpenses();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete record');
    }
  }

  const totalExpenseAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Expense Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and categorize all personal expenditures and outflows
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary KPI Card */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Total Expenses (Current View)</span>
            <p className="text-2xl font-bold font-mono text-rose-600 tracking-tight tabular-nums">
              {formatCurrency(totalExpenseAmount, currency)}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 sm:text-right">
          <span className="font-semibold text-slate-900 tabular-nums">{expenses.length}</span> logged transactions
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="All">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {(searchTerm || categoryFilter !== 'All' || paymentFilter !== 'All' || startDate || endDate || sortOption !== 'newest') && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setPaymentFilter('All');
                setStartDate('');
                setEndDate('');
                setSortOption('newest');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Title & Notes</th>
                <th className="py-3 px-4">Category</th>
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
                    <span>Loading expenses...</span>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">No expenses found</p>
                    <p className="text-[11px] mt-0.5">Try relaxing filters or add your first expense record.</p>
                  </td>
                </tr>
              ) : (
                expenses.map((item) => (
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
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_META[item.category]?.badgeColor || '#64748B' }}
                        />
                        <span className="font-medium text-slate-800">{item.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.payment_method}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      -{formatCurrency(item.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Expense"
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

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">
                {editingItem ? 'Edit Expense Record' : 'Record New Expense'}
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
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery Superstore, Uber Ride, Wifi Bill"
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
                    placeholder="250.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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
                  Description / Receipt Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Details about items purchased or billing reference..."
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
                  {formSubmitting ? 'Saving...' : editingItem ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Delete Expense Record"
        message="Are you sure you want to remove this expense entry? Your monthly budget calculations and charts will be updated immediately."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />

      {/* Toast Notification */}
      <Notification notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
