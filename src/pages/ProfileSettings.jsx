import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Key,
  Database,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sliders,
  DollarSign,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { getSupabase } from '../services/supabase.js';
import SupabaseSetupModal from '../components/SupabaseSetupModal.jsx';
import Notification from '../components/Notification.jsx';

export default function ProfileSettings() {
  const { profile, user, token, signOut, isDemo, isConfigured, updateProfileLocal } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  function showToast(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('error', 'Full name is required.');
      return;
    }

    try {
      setUpdatingProfile(true);
      const res = await api.updateProfile(
        {
          full_name: fullName.trim(),
          currency,
        },
        token
      );

      if (res.success) {
        updateProfileLocal({ full_name: fullName.trim(), currency });
        showToast('success', 'Profile and currency preferences updated.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    if (!isConfigured) {
      showToast('info', 'Demo mode does not store passwords in Supabase.');
      setNewPassword('');
      setConfirmNewPassword('');
      return;
    }

    try {
      setChangingPassword(true);
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable.');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showToast('success', 'Password successfully updated.');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Change password error:', err);
      showToast('error', err.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Profile & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal details, preferred currency, security credentials, and database connection
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <User className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {profile?.full_name || 'Account Holder'}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.email || user?.email || 'student@example.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isConfigured && !isDemo
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isConfigured && !isDemo ? 'Supabase Live' : 'Demo Evaluation'}</span>
            </span>
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Preferred Currency (Default: INR ₹)
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="INR">INR (₹) - Indian Rupee (₹1,25,000.00)</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingProfile}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-700" />
            <span>Security & Authentication</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your account password via Supabase Auth encryption
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Database Connection Settings Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase PostgreSQL Integration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure or view your cloud database project credentials
            </p>
          </div>

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Database</span>
          </button>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 font-mono text-[11px]">
          <div>Status: <span className="font-semibold text-slate-900">{isConfigured ? 'Connected to Supabase' : 'In-Memory Fallback Demo'}</span></div>
          <div>Schema File: <span className="text-emerald-700">supabase/schema.sql</span></div>
          <div>RLS Protection: <span className="text-emerald-700">Active</span></div>
        </div>
      </div>

      {/* Logout Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sign Out</h3>
          <p className="text-xs text-slate-500 mt-0.5">End your current session safely</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onConfigSaved={() => setIsSetupModalOpen(false)}
      />

      {/* Toast Notification */}
      <Notification notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
}
