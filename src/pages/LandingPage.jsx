import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  CreditCard,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { startDemoSession, user } = useAuth();
  const navigate = useNavigate();

  function handleTryDemo() {
    startDemoSession();
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 1. TOP BAR CONTRACT: Brand — 4-5 nav links — 1 primary action */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              SmartExpense
            </span>
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Benefits
            </a>
            <a href="#security" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Security
            </a>
          </nav>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full-Stack Web Technologies Project · Supabase PostgreSQL & Express</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight" style={{ textWrap: 'balance' }}>
            Take Total Command of Your Personal Finances and Budgets
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A modern financial management platform enabling individuals to monitor income streams,
            track daily expenses, enforce category budgets, and explore interactive spending analytics.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleTryDemo}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
            >
              <span>Explore Live Demo Instantly</span>
            </button>
          </div>
        </div>

        {/* Live Interface Showcase Mockup */}
        <div className="mt-14 max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-slate-400">smart-expense.fintech/dashboard</span>
            </div>
            <span className="text-xs font-medium text-slate-500">Live Preview</span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Metric row preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-medium text-slate-500">Total Net Balance</span>
                <p className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">₹71,850.00</p>
                <span className="text-[11px] text-emerald-600 font-medium">Safe liquidity</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-xs font-medium text-emerald-800">Total Income</span>
                <p className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">₹1,07,000.00</p>
                <span className="text-[11px] text-emerald-600 font-medium">2 Active sources</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-xs font-medium text-rose-800">Total Expenses</span>
                <p className="mt-1 text-xl font-bold font-mono text-rose-700 tabular-nums">₹35,150.00</p>
                <span className="text-[11px] text-rose-600 font-medium">Within limit</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="text-xs font-medium text-blue-800">Monthly Budget Cap</span>
                <p className="mt-1 text-xl font-bold font-mono text-blue-700 tabular-nums">₹51,000.00</p>
                <span className="text-[11px] text-blue-600 font-medium">68% allocated spent</span>
              </div>
            </div>

            {/* Simulated mini chart & recent activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Monthly Cash Flow Comparison
                  </h4>
                  <span className="text-xs text-slate-400">Current Semester</span>
                </div>
                <div className="h-32 flex items-end justify-between gap-3 pt-4">
                  {[
                    { m: 'Jun', inc: 70, exp: 40 },
                    { m: 'Jul', inc: 85, exp: 50 },
                    { m: 'Aug', inc: 75, exp: 45 },
                    { m: 'Sep', inc: 90, exp: 55 },
                    { m: 'Oct', inc: 95, exp: 48 },
                    { m: 'Nov', inc: 107, exp: 35 },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-24">
                        <div
                          className="w-1/2 bg-emerald-500 rounded-t-sm"
                          style={{ height: `${(bar.inc / 110) * 100}%` }}
                        />
                        <div
                          className="w-1/2 bg-slate-400 rounded-t-sm"
                          style={{ height: `${(bar.exp / 110) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Top Spending Categories
                </h4>
                <div className="space-y-2.5 pt-2">
                  {[
                    { cat: 'Apartment Rent', pct: 68, val: '₹24,000' },
                    { cat: 'Groceries & Pantry', pct: 18, val: '₹6,450' },
                    { cat: 'Utilities & Internet', pct: 9, val: '₹3,200' },
                    { cat: 'Transit Metro', pct: 5, val: '₹1,500' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-medium">{item.cat}</span>
                        <span className="font-mono text-slate-900 tabular-nums">{item.val}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES */}
      <section id="features" className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for Complete Financial Clarity
            </h2>
            <p className="text-sm text-slate-600">
              Everything required to monitor cash flow, stop budget leaks, and maintain disciplined savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Income Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log multiple revenue streams including Salary, Freelancing, Business, and Investments with custom payment methods and date filtering.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Expense Auditing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorize spending across 10 distinguished categories with instant search, sorting by amount, payment method filters, and delete protection.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Smart Budget Caps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set category-wise monthly limits with intelligent dynamic progress indicators: green for safe spending, orange for warnings, and red for overages.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Visual Analytics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive charts powered by Recharts, month-over-month trend comparisons, savings rates, and real-time CSV exports for spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How It Works in 4 Simple Steps
          </h2>
          <p className="text-sm text-slate-600">
            A frictionless financial workflow tailored for students, professionals, and households.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Create an Account',
              desc: 'Register in seconds with Supabase Auth or evaluate immediately using Demo mode.',
            },
            {
              num: '02',
              title: 'Log Inflows & Outflows',
              desc: 'Record earnings and daily expenditures with precise categories, dates, and payment methods.',
            },
            {
              num: '03',
              title: 'Establish Category Budgets',
              desc: 'Allocate spending caps for Food, Rent, Entertainment, and Bills with live progress monitoring.',
            },
            {
              num: '04',
              title: 'Analyze & Export',
              desc: 'Review interactive charts, identify your highest spending areas, and export clean CSV reports.',
            },
          ].map((step, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold text-slate-400 font-mono">{step.num}</span>
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BENEFITS & SECURITY */}
      <section id="benefits" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Enterprise-Grade Foundation
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Built on PostgreSQL & Row Level Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unlike toy applications that store financial records in browser local storage or insecure flat files,
              SmartExpense utilizes Supabase PostgreSQL with strict Row Level Security (RLS) policies.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero cross-user data leakage enforced at the database kernel level</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Express REST API token validation verifies every inbound request</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Default INR (₹) formatting with authentic Indian numbering standards</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-click CSV data export for offline audit and tax preparation</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/register"
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
              >
                Start Tracking Now
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-2">
              <span>supabase/schema.sql (PostgreSQL RLS)</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <pre className="text-[11px] leading-relaxed text-emerald-300 overflow-x-auto">
{`-- Enforced at the database level:
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);`}
            </pre>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto py-8 px-6 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-900" />
            <span className="font-semibold text-slate-900">SmartExpense System</span>
            <span aria-hidden="true">·</span>
            <span>College Web Technologies Project</span>
          </div>

          <p>© {new Date().getFullYear()} Smart Personal Expense Tracker & Budget Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
