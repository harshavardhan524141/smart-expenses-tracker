import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  PiggyBank,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatCurrency, CATEGORY_META } from '../utils/formatters.js';
import Notification from '../components/Notification.jsx';

export default function ReportsAnalytics() {
  const { token, profile } = useAuth();
  const currency = profile?.currency || 'INR';

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState(null);

  async function loadReports() {
    try {
      setLoading(true);
      const res = await api.getReportsSummary({ year: selectedYear }, token);
      if (res.success) {
        setReportsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast('error', err.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [token, selectedYear]);

  function showToast(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handleExportCSV() {
    try {
      setExporting(true);
      const blob = await api.exportCSV(
        {
          startDate: `${selectedYear}-01-01`,
          endDate: `${selectedYear}-12-31`,
        },
        token
      );

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ExpenseTracker_Transactions_${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('success', `Exported ${selectedYear} transactions to CSV`);
    } catch (err) {
      console.error('CSV Export failed:', err);
      showToast('error', 'Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  const totals = reportsData?.totals || {
    totalYearIncome: 0,
    totalYearExpense: 0,
    totalYearSavings: 0,
    overallSavingsRate: 0,
    avgMonthlyExpense: 0,
    transactionsCount: 0,
  };

  const monthlyData = reportsData?.monthlyData || [];
  const categoryBreakdown = reportsData?.categoryBreakdown || [];
  const paymentMethods = reportsData?.paymentMethods || [];

  return (
    <div className="space-y-6">
      {/* Header and Year Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Annual financial audit, cash flow analytics, and CSV data export
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{exporting ? 'Generating...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Annual Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Total Year Income</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {formatCurrency(totals.totalYearIncome, currency)}
          </p>
          <span className="text-[11px] text-slate-400">All recorded inflows</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Total Year Expenses</span>
          <p className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {formatCurrency(totals.totalYearExpense, currency)}
          </p>
          <span className="text-[11px] text-slate-400">All recorded outflows</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Net Annual Savings</span>
          <p
            className={`text-2xl font-bold font-mono tabular-nums ${
              totals.totalYearSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(totals.totalYearSavings, currency)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Savings Rate:</span>
            <span className="font-semibold text-emerald-600 tabular-nums">{totals.overallSavingsRate}%</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-medium text-slate-500">Average Monthly Expense</span>
          <p className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
            {formatCurrency(totals.avgMonthlyExpense, currency)}
          </p>
          <span className="text-[11px] text-slate-400">Normalized 12-month burn</span>
        </div>
      </div>

      {/* Income vs Expense Annual Bar Chart */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">12-Month Inflow vs Outflow Comparison</h2>
          <p className="text-xs text-slate-500">Monthly breakdown for calendar year {selectedYear}</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
              <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Savings Trend Line Chart */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Monthly Net Savings Trend</h2>
          <p className="text-xs text-slate-500">Positive values indicate surplus accumulation; negative indicate deficit</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value, currency), 'Net Savings']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Net Savings"
                stroke="#0EA5E9"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0EA5E9' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Breakdown: Categories & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Spending Categories */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Highest Spending Categories</h2>
            <span className="text-xs text-slate-400">Annual Aggregation</span>
          </div>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.category}</span>
                    <span className="font-mono text-slate-900 tabular-nums">
                      {formatCurrency(item.amount, currency)}{' '}
                      <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No categorized expenses recorded in {selectedYear}.</p>
          )}
        </div>

        {/* Payment Methods Distribution */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Payment Methods Distribution</h2>
            <span className="text-xs text-slate-400">Payment Channels</span>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((pm, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{pm.method}</span>
                    <span className="font-mono text-slate-900 tabular-nums">
                      {formatCurrency(pm.amount, currency)}{' '}
                      <span className="text-slate-400 font-normal">({pm.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pm.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No payment methods recorded in {selectedYear}.</p>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Notification notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
