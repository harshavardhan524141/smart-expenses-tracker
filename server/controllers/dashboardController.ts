import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthenticatedSupabaseClient, fallbackStore } from '../supabaseClient.ts';

// Helper to calculate date ranges
function getDateRange(period: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (period) {
    case 'week': {
      // Start of current week (Monday)
      const day = now.getDay() || 7;
      start.setDate(now.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'last_month': {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case 'year': {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    }
    case 'custom': {
      if (customStart) start = new Date(customStart);
      if (customEnd) end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'month':
    default: {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;

    const { startDate, endDate } = getDateRange(
      period as string,
      customStart as string | undefined,
      customEnd as string | undefined
    );

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const curMonthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const curMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const curMonthEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(curMonthLastDay).padStart(2, '0')}`;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    let periodTransactions: any[] = [];
    let curMonthExpenses: any[] = [];
    let curMonthBudgets: any[] = [];
    let recentTransactions: any[] = [];

    if (supabase) {
      const [periodTxRes, curMonthTxRes, budgetsRes, recentTxRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate),
        supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('type', 'expense')
          .gte('transaction_date', curMonthStart)
          .lte('transaction_date', curMonthEnd),
        supabase
          .from('budgets')
          .select('amount')
          .eq('user_id', userId)
          .eq('month', currentMonth)
          .eq('year', currentYear),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('transaction_date', { ascending: false })
          .limit(5),
      ]);

      if (periodTxRes.error) throw periodTxRes.error;
      if (curMonthTxRes.error) throw curMonthTxRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (recentTxRes.error) throw recentTxRes.error;

      periodTransactions = periodTxRes.data || [];
      curMonthExpenses = curMonthTxRes.data || [];
      curMonthBudgets = budgetsRes.data || [];
      recentTransactions = recentTxRes.data || [];
    } else {
      periodTransactions = fallbackStore.transactions.filter(
        (t) =>
          t.user_id === userId &&
          t.transaction_date >= startDate &&
          t.transaction_date <= endDate
      );
      curMonthExpenses = fallbackStore.transactions.filter(
        (t) =>
          t.user_id === userId &&
          t.type === 'expense' &&
          t.transaction_date >= curMonthStart &&
          t.transaction_date <= curMonthEnd
      );
      curMonthBudgets = fallbackStore.budgets.filter(
        (b) => b.user_id === userId && b.month === currentMonth && b.year === currentYear
      );
      recentTransactions = [...fallbackStore.transactions]
        .filter((t) => t.user_id === userId)
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
        .slice(0, 5);
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of periodTransactions) {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
      }
    }

    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

    // Monthly budget calculations
    const totalAllocatedBudget = curMonthBudgets.reduce((acc, b) => acc + Number(b.amount), 0);
    const totalMonthSpent = curMonthExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
    const remainingMonthlyBudget = totalAllocatedBudget > 0 ? totalAllocatedBudget - totalMonthSpent : 0;
    const budgetUsedPercentage = totalAllocatedBudget > 0 ? Math.round((totalMonthSpent / totalAllocatedBudget) * 100) : 0;

    return res.json({
      success: true,
      data: {
        filter: {
          period,
          startDate,
          endDate,
        },
        cards: {
          totalBalance,
          totalIncome,
          totalExpenses,
          remainingMonthlyBudget,
          totalAllocatedBudget,
          totalMonthSpent,
          budgetUsedPercentage,
          savingsRate,
          transactionsCount: periodTransactions.length,
        },
        recentTransactions,
      },
    });
  } catch (error: any) {
    console.error('getDashboardSummary error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDashboardAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // 6-Month historical window
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startDate = sixMonthsAgo.toISOString().slice(0, 10);

    const supabase = getAuthenticatedSupabaseClient(req.token);

    let allTransactions: any[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startDate);

      if (error) throw error;
      allTransactions = data || [];
    } else {
      allTransactions = fallbackStore.transactions.filter(
        (t) => t.user_id === userId && t.transaction_date >= startDate
      );
    }

    // Prepare 6 months trend buckets
    const monthsMap: Record<string, { month: string; rawMonth: string; income: number; expense: number; net: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      monthsMap[key] = {
        month: label,
        rawMonth: key,
        income: 0,
        expense: 0,
        net: 0,
      };
    }

    // Category breakdown map for current month
    const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const categoryTotals: Record<string, number> = {};
    let totalExpenseCurMonth = 0;

    for (const tx of allTransactions) {
      const txMonthKey = tx.transaction_date.slice(0, 7);
      const amt = Number(tx.amount);

      if (monthsMap[txMonthKey]) {
        if (tx.type === 'income') {
          monthsMap[txMonthKey].income += amt;
        } else if (tx.type === 'expense') {
          monthsMap[txMonthKey].expense += amt;
        }
        monthsMap[txMonthKey].net = monthsMap[txMonthKey].income - monthsMap[txMonthKey].expense;
      }

      if (tx.type === 'expense' && txMonthKey === curMonthKey) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
        totalExpenseCurMonth += amt;
      }
    }

    const monthlyTrends = Object.values(monthsMap);

    // Format category breakdown with percentages
    const categoryColors: Record<string, string> = {
      Food: '#10B981', // emerald
      Transportation: '#3B82F6', // blue
      Shopping: '#8B5CF6', // purple
      Education: '#06B6D4', // cyan
      Entertainment: '#F59E0B', // amber
      Healthcare: '#EF4444', // red
      Bills: '#6366F1', // indigo
      Rent: '#0EA5E9', // sky
      Travel: '#14B8A6', // teal
      Others: '#64748B', // slate
      Salary: '#10B981',
      Freelancing: '#3B82F6',
      Business: '#8B5CF6',
      Investments: '#F59E0B',
    };

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenseCurMonth > 0 ? Math.round((value / totalExpenseCurMonth) * 100) : 0,
        color: categoryColors[name] || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);

    return res.json({
      success: true,
      data: {
        monthlyTrends,
        categoryBreakdown,
        totalExpenseCurMonth,
      },
    });
  } catch (error: any) {
    console.error('getDashboardAnalytics error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
