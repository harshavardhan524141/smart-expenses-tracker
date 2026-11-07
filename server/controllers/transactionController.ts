import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthenticatedSupabaseClient, fallbackStore, DemoTransaction } from '../supabaseClient.ts';

export async function getTransactions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      type,
      category,
      payment_method,
      startDate,
      endDate,
      search,
      sortBy = 'transaction_date',
      sortOrder = 'desc',
    } = req.query;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (type && (type === 'income' || type === 'expense')) {
        query = query.eq('type', type);
      }
      if (category && typeof category === 'string' && category !== 'All') {
        query = query.eq('category', category);
      }
      if (payment_method && typeof payment_method === 'string' && payment_method !== 'All') {
        query = query.eq('payment_method', payment_method);
      }
      if (startDate && typeof startDate === 'string') {
        query = query.gte('transaction_date', startDate);
      }
      if (endDate && typeof endDate === 'string') {
        query = query.lte('transaction_date', endDate);
      }
      if (search && typeof search === 'string') {
        query = query.ilike('title', `%${search}%`);
      }

      const ascending = sortOrder === 'asc';
      const orderColumn = sortBy === 'amount' ? 'amount' : 'transaction_date';
      query = query.order(orderColumn, { ascending });

      const { data, error } = await query;
      if (error) throw error;

      return res.json({ success: true, data: data || [] });
    }

    // Fallback store
    let list = fallbackStore.transactions.filter((tx) => tx.user_id === userId);

    if (type && (type === 'income' || type === 'expense')) {
      list = list.filter((tx) => tx.type === type);
    }
    if (category && typeof category === 'string' && category !== 'All') {
      list = list.filter((tx) => tx.category.toLowerCase() === category.toLowerCase());
    }
    if (payment_method && typeof payment_method === 'string' && payment_method !== 'All') {
      list = list.filter((tx) => tx.payment_method.toLowerCase() === payment_method.toLowerCase());
    }
    if (startDate && typeof startDate === 'string') {
      list = list.filter((tx) => tx.transaction_date >= startDate);
    }
    if (endDate && typeof endDate === 'string') {
      list = list.filter((tx) => tx.transaction_date <= endDate);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.toLowerCase();
      list = list.filter((tx) => tx.title.toLowerCase().includes(term) || tx.description.toLowerCase().includes(term));
    }

    list.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortOrder === 'asc'
        ? new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
        : new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
    });

    return res.json({ success: true, data: list });
  } catch (error: any) {
    console.error('getTransactions error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      type,
      title,
      amount,
      category,
      payment_method,
      transaction_date,
      description = '',
    } = req.body;

    // Strict validation
    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ success: false, error: 'Transaction type must be either income or expense.' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number greater than 0.' });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Category is required.' });
    }

    if (!payment_method || typeof payment_method !== 'string' || payment_method.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Payment method is required.' });
    }

    const txDate = transaction_date ? transaction_date.slice(0, 10) : new Date().toISOString().slice(0, 10);

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type,
          title: title.trim(),
          amount: numAmount,
          category: category.trim(),
          payment_method: payment_method.trim(),
          transaction_date: txDate,
          description: description ? description.trim() : '',
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // Fallback store
    const newTx: DemoTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      type,
      title: title.trim(),
      amount: numAmount,
      category: category.trim(),
      payment_method: payment_method.trim(),
      transaction_date: txDate,
      description: description ? description.trim() : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    fallbackStore.transactions.unshift(newTx);
    return res.status(201).json({ success: true, data: newTx });
  } catch (error: any) {
    console.error('createTransaction error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const {
      type,
      title,
      amount,
      category,
      payment_method,
      transaction_date,
      description,
    } = req.body;

    const updateFields: Record<string, any> = { updated_at: new Date().toISOString() };

    if (type !== undefined) {
      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ success: false, error: 'Type must be income or expense.' });
      }
      updateFields.type = type;
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Title cannot be empty.' });
      }
      updateFields.title = title.trim();
    }

    if (amount !== undefined) {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ success: false, error: 'Amount must be greater than 0.' });
      }
      updateFields.amount = num;
    }

    if (category !== undefined) updateFields.category = category.trim();
    if (payment_method !== undefined) updateFields.payment_method = payment_method.trim();
    if (transaction_date !== undefined) updateFields.transaction_date = transaction_date.slice(0, 10);
    if (description !== undefined) updateFields.description = description.trim();

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updateFields)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ success: false, error: 'Transaction not found or unauthorized.' });
      }
      return res.json({ success: true, data });
    }

    // Fallback store
    const idx = fallbackStore.transactions.findIndex((t) => t.id === id && t.user_id === userId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Transaction not found or unauthorized.' });
    }

    fallbackStore.transactions[idx] = {
      ...fallbackStore.transactions[idx],
      ...updateFields,
    };

    return res.json({ success: true, data: fallbackStore.transactions[idx] });
  } catch (error: any) {
    console.error('updateTransaction error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteTransaction(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const supabase = getAuthenticatedSupabaseClient(req.token);

    if (supabase) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return res.json({ success: true, message: 'Transaction deleted successfully.' });
    }

    // Fallback store
    const idx = fallbackStore.transactions.findIndex((t) => t.id === id && t.user_id === userId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Transaction not found or unauthorized.' });
    }

    fallbackStore.transactions.splice(idx, 1);
    return res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (error: any) {
    console.error('deleteTransaction error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
