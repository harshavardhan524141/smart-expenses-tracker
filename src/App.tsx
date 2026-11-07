/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import IncomeManagement from './pages/IncomeManagement.jsx';
import ExpenseManagement from './pages/ExpenseManagement.jsx';
import BudgetManagement from './pages/BudgetManagement.jsx';
import ReportsAnalytics from './pages/ReportsAnalytics.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Financial Workspace Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<IncomeManagement />} />
            <Route path="/expenses" element={<ExpenseManagement />} />
            <Route path="/budgets" element={<BudgetManagement />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/settings" element={<ProfileSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
