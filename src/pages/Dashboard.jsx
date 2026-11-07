import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronRight,
  AlertCircle,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatCurrency, formatDate, CATEGORY_META } from '../utils/formatters.js';

export default function Dashboard() {
  const { token, profile } = useAuth();
  const currency = profile?.currency || 'INR';

  const [period, setPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const [summaryData, setSummaryData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const [summaryRes, analyticsRes] = await Promise.all([
        api.getDashboardSummary(
          {
            period,
            startDate: period === 'custom' ? customStart : undefined,
            endDate: period === 'custom' ? customEnd : undefined,
          },
          token
        ),
        api.getDashboardAnalytics(token),
      ]);

      if (summaryRes.success) setSummaryData(summaryRes.data);
      if (analyticsRes.success) setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Error fetching dashboard analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [token, period]);

  const cards = summaryData?.cards || {
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    remainingMonthlyBudget: 0,
    savingsRate: 0,
    budgetUsedPercentage: 0,
    totalAllocatedBudget: 0,
    transactionsCount: 0,
  };

  const recentTx = summaryData?.recentTransactions || [];
  const monthlyTrends = analyticsData?.monthlyTrends || [];
  const categoryBreakdown = analyticsData?.categoryBreakdown || [];

  const filterButtons = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Financial Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial summary, cash flow, and category budgets
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setPeriod(btn.id);
                  if (btn.id === 'custom') setIsCustomOpen(true);
                  else setIsCustomOpen(false);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  period === btn.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadDashboard}
            title="Refresh calculations"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Filter Expansion */}
      {period === 'custom' && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <button
            onClick={loadDashboard}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Apply Range
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Balance */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Balance</span>
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              cards.totalBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(cards.totalBalance, currency)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Savings Rate:</span>
            <span className="font-semibold text-emerald-600 tabular-nums">{cards.savingsRate}%</span>
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Income</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 tracking-tight tabular-nums">
            {formatCurrency(cards.totalIncome, currency)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Period cash inflow</span>
          </div>
        </div>

        {/* 3. Total Expenses */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Expenses</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 tracking-tight tabular-nums">
            {formatCurrency(cards.totalExpenses, currency)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Period cash outflow</span>
          </div>
        </div>

        {/* 4. Remaining Monthly Budget */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Remaining Budget</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              cards.remainingMonthlyBudget < 0 ? 'text-rose-600' : 'text-blue-700'
            }`}
          >
            {formatCurrency(cards.remainingMonthlyBudget, currency)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Budget used:</span>
            <span
              className={`font-semibold tabular-nums ${
                cards.budgetUsedPercentage > 100
                  ? 'text-rose-600'
                  : cards.budgetUsedPercentage >= 75
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {cards.budgetUsedPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      {cards.totalAllocatedBudget > 0 && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Monthly Budget Consumption</span>
            <span className="font-mono text-slate-600 tabular-nums">
              {formatCurrency(cards.totalMonthSpent, currency)} / {formatCurrency(cards.totalAllocatedBudget, currency)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                cards.budgetUsedPercentage > 100
                  ? 'bg-rose-500'
                  : cards.budgetUsedPercentage >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(cards.budgetUsedPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {cards.budgetUsedPercentage > 100
                ? '⚠️ You have exceeded your monthly allocated budget.'
                : cards.budgetUsedPercentage >= 75
                ? '⚡ Warning: Approaching your allocated budget limit.'
                : '✅ Safe spending: Currently within monthly budget limits.'}
            </span>
            <Link to="/budgets" className="text-slate-900 font-semibold hover:underline">
              Manage Budgets →
            </Link>
          </div>
        </div>
      )}

      {/* Interactive Charts: Cash Flow Trend & Doughnut Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Comparison */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Income vs Expense Trend</h2>
              <p className="text-xs text-slate-500">Past 6 months cash flow comparison</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1">
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value, currency), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Doughnut */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Expense by Category</h2>
            <p className="text-xs text-slate-500">Current month spending distribution</p>
          </div>

          {categoryBreakdown.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(value, currency), '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2">
                {categoryBreakdown.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums text-slate-900">
                      <span>{formatCurrency(cat.value, currency)}</span>
                      <span className="text-slate-400 text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <PieIcon className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs">No expense transactions recorded yet for this month.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Latest income and expense entries</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/income"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </Link>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </Link>
          </div>
        </div>

        {recentTx.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentTx.map((tx) => {
              const isIncome = tx.type === 'income';
              const meta = CATEGORY_META[tx.category] || CATEGORY_META.Others;

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{tx.title}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>{tx.category}</span>
                        <span>·</span>
                        <span>{formatDate(tx.transaction_date)}</span>
                        <span>·</span>
                        <span className="hidden sm:inline">{tx.payment_method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">{tx.payment_method}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state for new users as explicitly requested */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6 stroke-1" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">No transactions recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Start tracking your finances by logging your first salary, freelance payment, or daily grocery expense.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/income"
                className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                Log First Income
              </Link>
              <Link
                to="/expenses"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Record First Expense
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
