import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.ts';

// Get a Supabase client scoped to the user's JWT access token for RLS
export function getAuthenticatedSupabaseClient(accessToken?: string): SupabaseClient | null {
  if (
  !config.supabaseUrl ||
  !config.supabaseAnonKey ||
  accessToken?.startsWith('demo-')
) {
  return null;
}

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

// In-Memory store fallback for demo mode when Supabase is not yet configured by the student
export interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  currency: string;
}

export interface DemoTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category: string;
  payment_method: string;
  transaction_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DemoBudget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

// In-memory persistent database for evaluation & local testing
export const fallbackStore = {
  profiles: new Map<string, DemoUser>([
    [
      'demo-user-123',
      {
        id: 'demo-user-123',
        email: 'student@example.com',
        full_name: 'Rahul Sharma',
        currency: 'INR',
      },
    ],
  ]),
  transactions: [
    {
      id: 'tx-1',
      user_id: 'demo-user-123',
      type: 'income',
      title: 'Monthly Salary',
      amount: 85000,
      category: 'Salary',
      payment_method: 'Bank Transfer',
      transaction_date: new Date().toISOString().slice(0, 10),
      description: 'Monthly payroll deposit',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      user_id: 'demo-user-123',
      type: 'income',
      title: 'Freelance Web Design',
      amount: 22000,
      category: 'Freelancing',
      payment_method: 'UPI',
      transaction_date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
      description: 'Landing page project payment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      user_id: 'demo-user-123',
      type: 'expense',
      title: 'Apartment Rent',
      amount: 24000,
      category: 'Rent',
      payment_method: 'Net Banking',
      transaction_date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
      description: 'Monthly apartment rent payment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tx-4',
      user_id: 'demo-user-123',
      type: 'expense',
      title: 'Grocery Superstore',
      amount: 6450,
      category: 'Food',
      payment_method: 'Credit Card',
      transaction_date: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
      description: 'Monthly food and pantry supplies',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      user_id: 'demo-user-123',
      type: 'expense',
      title: 'Electricity & High-speed Wifi',
      amount: 3200,
      category: 'Bills',
      payment_method: 'UPI',
      transaction_date: new Date().toISOString().slice(0, 10),
      description: 'Utilities for the month',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'tx-6',
      user_id: 'demo-user-123',
      type: 'expense',
      title: 'Metro Smart Card Recharge',
      amount: 1500,
      category: 'Transportation',
      payment_method: 'UPI',
      transaction_date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
      description: 'Transit commute',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as DemoTransaction[],
  budgets: [
    {
      id: 'bg-1',
      user_id: 'demo-user-123',
      category: 'Rent',
      amount: 25000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bg-2',
      user_id: 'demo-user-123',
      category: 'Food',
      amount: 12000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bg-3',
      user_id: 'demo-user-123',
      category: 'Bills',
      amount: 5000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bg-4',
      user_id: 'demo-user-123',
      category: 'Transportation',
      amount: 4000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bg-5',
      user_id: 'demo-user-123',
      category: 'Entertainment',
      amount: 5000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as DemoBudget[],
};
