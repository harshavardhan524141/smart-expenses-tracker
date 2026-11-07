import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthenticatedSupabaseClient, fallbackStore } from '../supabaseClient.ts';

export async function getReportsSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    let allTransactions: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startOfYear)
        .lte('transaction_date', endOfYear);

      if (error) throw error;
      allTransactions = data || [];
    } else {
      allTransactions = fallbackStore.transactions.filter(
        (t) => t.user_id === userId && t.transaction_date >= startOfYear && t.transaction_date <= endOfYear
      );
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((name, idx) => ({
      month: name,
      monthIndex: idx + 1,
      income: 0,
      expense: 0,
      savings: 0,
    }));

    const categorySpending: Record<string, number> = {};
    const paymentMethodSpending: Record<string, number> = {};

    let totalYearIncome = 0;
    let totalYearExpense = 0;

    for (const tx of allTransactions) {
      const amt = Number(tx.amount);
      const txDate = new Date(tx.transaction_date);
      const mIdx = txDate.getMonth(); // 0 - 11

      if (tx.type === 'income') {
        monthlyData[mIdx].income += amt;
        totalYearIncome += amt;
      } else if (tx.type === 'expense') {
        monthlyData[mIdx].expense += amt;
        totalYearExpense += amt;

        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + amt;
        paymentMethodSpending[tx.payment_method] = (paymentMethodSpending[tx.payment_method] || 0) + amt;
      }
    }

    for (const m of monthlyData) {
      m.savings = m.income - m.expense;
    }

    const totalYearSavings = totalYearIncome - totalYearExpense;
    const overallSavingsRate = totalYearIncome > 0 ? Math.max(0, Math.round((totalYearSavings / totalYearIncome) * 100)) : 0;
    const avgMonthlyExpense = Math.round(totalYearExpense / 12);

    const categoryBreakdown = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalYearExpense > 0 ? Math.round((amount / totalYearExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const paymentMethods = Object.entries(paymentMethodSpending)
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: totalYearExpense > 0 ? Math.round((amount / totalYearExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return res.json({
      success: true,
      data: {
        year,
        totals: {
          totalYearIncome,
          totalYearExpense,
          totalYearSavings,
          overallSavingsRate,
          avgMonthlyExpense,
          transactionsCount: allTransactions.length,
        },
        monthlyData,
        categoryBreakdown,
        paymentMethods,
        topSpendingCategory: categoryBreakdown[0] || null,
      },
    });
  } catch (error: any) {
    console.error('getReportsSummary error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function exportCSV(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, type } = req.query;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    let list: any[] = [];

    if (supabase) {
      let query = supabase.from('transactions').select('*').eq('user_id', userId);
      if (startDate && typeof startDate === 'string') query = query.gte('transaction_date', startDate);
      if (endDate && typeof endDate === 'string') query = query.lte('transaction_date', endDate);
      if (type && (type === 'income' || type === 'expense')) query = query.eq('type', type);
      query = query.order('transaction_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      list = data || [];
    } else {
      list = fallbackStore.transactions.filter((t) => t.user_id === userId);
      if (startDate && typeof startDate === 'string') list = list.filter((t) => t.transaction_date >= startDate);
      if (endDate && typeof endDate === 'string') list = list.filter((t) => t.transaction_date <= endDate);
      if (type && (type === 'income' || type === 'expense')) list = list.filter((t) => t.type === type);
      list.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    }

    // Build CSV content
    const headers = ['Date', 'Type', 'Title', 'Category', 'Payment Method', 'Amount', 'Description'];
    const rows = list.map((tx) => [
      `"${tx.transaction_date}"`,
      `"${tx.type.toUpperCase()}"`,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      `"${(tx.payment_method || '').replace(/"/g, '""')}"`,
      tx.amount,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const filename = `expense_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('exportCSV error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
