import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowLeft, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword, isConfigured } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your account email address.');
      return;
    }

    if (!isConfigured) {
      setError('Supabase is not configured yet. Password recovery requires a connected Supabase project.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess('Password reset link sent! Please check your inbox.');
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to send password reset link. Please check the email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SmartExpense
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your email to receive a password recovery link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
