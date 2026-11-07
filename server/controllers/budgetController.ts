import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthenticatedSupabaseClient, fallbackStore, DemoBudget } from '../supabaseClient.ts';

export async function getBudgets(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    // Last day of target month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    let budgetsData: any[] = [];
    let transactionsData: any[] = [];

    if (supabase) {
      const [budgetsRes, txRes] = await Promise.all([
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId)
          .eq('month', month)
          .eq('year', year),
        supabase
          .from('transactions')
          .select('category, amount')
          .eq('user_id', userId)
          .eq('type', 'expense')
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate),
      ]);

      if (budgetsRes.error) throw budgetsRes.error;
      if (txRes.error) throw txRes.error;

      budgetsData = budgetsRes.data || [];
      transactionsData = txRes.data || [];
    } else {
      budgetsData = fallbackStore.budgets.filter(
        (b) => b.user_id === userId && b.month === month && b.year === year
      );
      transactionsData = fallbackStore.transactions.filter(
        (t) =>
          t.user_id === userId &&
          t.type === 'expense' &&
          t.transaction_date >= startDate &&
          t.transaction_date <= endDate
      );
    }

    // Aggregate spending per category
    const spendingByCategory: Record<string, number> = {};
    for (const tx of transactionsData) {
      const cat = tx.category.trim();
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + Number(tx.amount);
    }

    let totalBudget = 0;
    let totalSpent = 0;

    const enrichedBudgets = budgetsData.map((b) => {
      const allocated = Number(b.amount);
      const spent = spendingByCategory[b.category] || 0;
      const remaining = allocated - spent;
      const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

      let status = 'safe'; // Green: <= 75%
      if (percentage > 100) {
        status = 'exceeded'; // Red: > 100%
      } else if (percentage >= 75) {
        status = 'warning'; // Orange: 75% - 100%
      }

      totalBudget += allocated;
      totalSpent += spent;

      return {
        id: b.id,
        category: b.category,
        allocated_amount: allocated,
        spent_amount: spent,
        remaining_amount: remaining,
        percentage_used: percentage,
        status,
        month: b.month,
        year: b.year,
        created_at: b.created_at,
      };
    });

    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return res.json({
      success: true,
      data: {
        month,
        year,
        summary: {
          totalBudget,
          totalSpent,
          totalRemaining,
          overallPercentage,
          status: overallPercentage > 100 ? 'exceeded' : overallPercentage >= 75 ? 'warning' : 'safe',
        },
        budgets: enrichedBudgets,
      },
    });
  } catch (error: any) {
    console.error('getBudgets error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createBudget(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { category, amount, month, year } = req.body;

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Category is required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Budget amount must be a positive number greater than 0.' });
    }

    const numMonth = parseInt(month, 10);
    if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
      return res.status(400).json({ success: false, error: 'Month must be between 1 and 12.' });
    }

    const numYear = parseInt(year, 10);
    if (isNaN(numYear) || numYear < 2000) {
      return res.status(400).json({ success: false, error: 'Valid year is required (e.g. 2026).' });
    }

    const trimmedCategory = category.trim();
    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      // Upsert budget on conflict (user_id, category, month, year)
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userId,
            category: trimmedCategory,
            amount: numAmount,
            month: numMonth,
            year: numYear,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, category, month, year' }
        )
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // Fallback store
    const existingIndex = fallbackStore.budgets.findIndex(
      (b) =>
        b.user_id === userId &&
        b.category.toLowerCase() === trimmedCategory.toLowerCase() &&
        b.month === numMonth &&
        b.year === numYear
    );

    if (existingIndex >= 0) {
      fallbackStore.budgets[existingIndex].amount = numAmount;
      fallbackStore.budgets[existingIndex].updated_at = new Date().toISOString();
      return res.status(200).json({ success: true, data: fallbackStore.budgets[existingIndex] });
    }

    const newBudget: DemoBudget = {
      id: `bg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      category: trimmedCategory,
      amount: numAmount,
      month: numMonth,
      year: numYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    fallbackStore.budgets.push(newBudget);
    return res.status(201).json({ success: true, data: newBudget });
  } catch (error: any) {
    console.error('createBudget error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateBudget(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { amount, category } = req.body;

    const updateFields: Record<string, any> = { updated_at: new Date().toISOString() };

    if (amount !== undefined) {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ success: false, error: 'Budget amount must be greater than 0.' });
      }
      updateFields.amount = num;
    }

    if (category !== undefined && typeof category === 'string' && category.trim().length > 0) {
      updateFields.category = category.trim();
    }

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .update(updateFields)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, error: 'Budget not found.' });

      return res.json({ success: true, data });
    }

    // Fallback store
    const idx = fallbackStore.budgets.findIndex((b) => b.id === id && b.user_id === userId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Budget not found.' });
    }

    fallbackStore.budgets[idx] = {
      ...fallbackStore.budgets[idx],
      ...updateFields,
    };

    return res.json({ success: true, data: fallbackStore.budgets[idx] });
  } catch (error: any) {
    console.error('updateBudget error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteBudget(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return res.json({ success: true, message: 'Budget deleted successfully.' });
    }

    // Fallback store
    const idx = fallbackStore.budgets.findIndex((b) => b.id === id && b.user_id === userId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Budget not found.' });
    }

    fallbackStore.budgets.splice(idx, 1);
    return res.json({ success: true, message: 'Budget deleted successfully.' });
  } catch (error: any) {
    console.error('deleteBudget error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
