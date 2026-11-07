import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { CURRENCY_SYMBOLS } from '../utils/formatters.js';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { profile, user, signOut, isDemo } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Profile & Settings', path: '/settings', icon: Settings },
  ];

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const currencySymbol = CURRENCY_SYMBOLS[profile?.currency || 'INR'] || '₹';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <span className="block font-bold text-slate-900 text-sm tracking-tight truncate">
                  SmartExpense
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">Fintech SaaS</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed && !isMobileOpen ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 p-2 rounded-lg ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-semibold text-xs">
              <User className="w-4 h-4 text-slate-600" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.full_name || 'Account Holder'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="truncate">{profile?.currency || 'INR'} ({currencySymbol})</span>
                  {isDemo && (
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-1 rounded-xs">
                      DEMO
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
            }`}
            title="Log out of account"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
