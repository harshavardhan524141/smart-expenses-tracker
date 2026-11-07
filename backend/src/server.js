import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// CORS
app.use(cors({
  origin: CLIENT_URL === '*' ? '*' : [CLIENT_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Required for Render)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Smart Expense Tracker Standalone Backend',
    timestamp: new Date().toISOString(),
  });
});

// Auth Middleware for Supabase JWT
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid format.' });
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Demo fallback user
      req.user = { id: token, email: 'demo@example.com' };
      return next();
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authentication session.' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth verification error.' });
  }
}

// Scoped client for RLS
function getSupabase(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// Profile Routes
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req.token);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data: data || { id: req.user.id, full_name: 'Account Holder', currency: 'INR' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, currency } = req.body;
    const supabase = getSupabase(req.token);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: req.user.id, full_name, currency, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Transactions Routes
app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, sortBy = 'transaction_date', sortOrder = 'desc' } = req.query;
    const supabase = getSupabase(req.token);
    let query = supabase.from('transactions').select('*').eq('user_id', req.user.id);

    if (type) query = query.eq('type', type);
    if (category && category !== 'All') query = query.eq('category', category);
    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.order(sortBy === 'amount' ? 'amount' : 'transaction_date', { ascending: sortOrder === 'asc' });
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { type, title, amount, category, payment_method, transaction_date, description } = req.body;
    if (!type || !title || !amount || !category || !payment_method) {
      return res.status(400).json({ error: 'Missing required transaction fields.' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }
    const supabase = getSupabase(req.token);
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: req.user.id,
        type,
        title: title.trim(),
        amount: numAmount,
        category: category.trim(),
        payment_method: payment_method.trim(),
        transaction_date: transaction_date || new Date().toISOString().slice(0, 10),
        description: description || '',
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/transactions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase(req.token);
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase(req.token);
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true, message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Budgets Routes
app.get('/api/budgets', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const supabase = getSupabase(req.token);
    const [budgetsRes, txRes] = await Promise.all([
      supabase.from('budgets').select('*').eq('user_id', req.user.id).eq('month', month).eq('year', year),
      supabase.from('transactions').select('category, amount').eq('user_id', req.user.id).eq('type', 'expense').gte('transaction_date', startDate).lte('transaction_date', endDate)
    ]);

    if (budgetsRes.error) throw budgetsRes.error;
    if (txRes.error) throw txRes.error;

    const spendingByCategory = {};
    for (const t of (txRes.data || [])) {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Number(t.amount);
    }

    let totalBudget = 0;
    let totalSpent = 0;
    const enriched = (budgetsRes.data || []).map((b) => {
      const allocated = Number(b.amount);
      const spent = spendingByCategory[b.category] || 0;
      totalBudget += allocated;
      totalSpent += spent;
      const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      return {
        id: b.id,
        category: b.category,
        allocated_amount: allocated,
        spent_amount: spent,
        remaining_amount: allocated - spent,
        percentage_used: pct,
        status: pct > 100 ? 'exceeded' : pct >= 75 ? 'warning' : 'safe',
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalBudget,
          totalSpent,
          totalRemaining: totalBudget - totalSpent,
          overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        },
        budgets: enriched,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/budgets', requireAuth, async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const supabase = getSupabase(req.token);
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { user_id: req.user.id, category, amount: parseFloat(amount), month: parseInt(month), year: parseInt(year), updated_at: new Date().toISOString() },
        { onConflict: 'user_id, category, month, year' }
      )
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/budgets/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase(req.token);
    const { error } = await supabase.from('budgets').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true, message: 'Budget deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Render Express Backend listening on port ${PORT}`);
});
