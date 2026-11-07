import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import SupabaseBanner from '../components/SupabaseBanner.jsx';
import SupabaseSetupModal from '../components/SupabaseSetupModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Menu } from 'lucide-react';

export default function DashboardLayout() {
  const { user, loading, isDemo } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying financial session...</p>
        </div>
      </div>
    );
  }

  // Protect route
  if (!user && !isDemo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Database Status Indicator */}
      <SupabaseBanner onOpenSetup={() => setIsSetupOpen(true)} />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header Bar */}
          <header className="md:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-slate-900">SmartExpense</span>
            <div className="w-5" />
          </header>

          {/* Dynamic Page Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Supabase Connection Setup Modal */}
      <SupabaseSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onConfigSaved={() => setIsSetupOpen(false)}
      />
    </div>
  );
}
