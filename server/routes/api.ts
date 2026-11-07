import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { config } from '../config.ts';
import { getProfile, updateProfile } from '../controllers/profileController.ts';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.ts';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.ts';
import {
  getDashboardSummary,
  getDashboardAnalytics,
} from '../controllers/dashboardController.ts';
import {
  getReportsSummary,
  exportCSV,
} from '../controllers/reportsController.ts';

const router = Router();

// Public system status & environment config check
router.get('/config-status', (_req, res) => {
  res.json({
    success: true,
    supabaseConfigured: config.isConfigured,
    supabaseUrl: config.supabaseUrl ? `${config.supabaseUrl.slice(0, 18)}...` : null,
    mode: config.isConfigured ? 'supabase-production' : 'demo-evaluation',
  });
});

// Authenticated Routes
router.use(requireAuth);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Transactions CRUD
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Budgets CRUD
router.get('/budgets', getBudgets);
router.post('/budgets', createBudget);
router.put('/budgets/:id', updateBudget);
router.delete('/budgets/:id', deleteBudget);

// Dashboard
router.get('/dashboard/summary', getDashboardSummary);
router.get('/dashboard/analytics', getDashboardAnalytics);

// Reports
router.get('/reports/summary', getReportsSummary);
router.get('/reports/export', exportCSV);

export default router;
