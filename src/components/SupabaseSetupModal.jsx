import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, clearStoredSupabaseConfig } from '../services/supabase.js';
import { X, Database, CheckCircle, ExternalLink, Key, Globe, Shield } from 'lucide-react';

export default function SupabaseSetupModal({ isOpen, onClose, onConfigSaved }) {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  function handleSave(e) {
    e.preventDefault();
    if (!url || !anonKey) return;
    saveStoredSupabaseConfig(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onConfigSaved) onConfigSaved();
      onClose();
      window.location.reload();
    }, 1000);
  }

  function handleReset() {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    if (onConfigSaved) onConfigSaved();
    onClose();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Supabase PostgreSQL Setup</h3>
              <p className="text-xs text-slate-500">Connect to your real cloud database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-600">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs leading-relaxed space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              How to configure in 3 simple steps:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-800 pt-1">
              <li>Create a free project at <span className="font-mono">supabase.com</span></li>
              <li>Execute the SQL from <span className="font-mono font-medium">supabase/schema.sql</span> in the SQL Editor</li>
              <li>Paste your Project URL & Anon Key below, or set in <span className="font-mono font-medium">.env</span></li>
            </ol>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Supabase Project URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Supabase Anon / Public Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-xs"
                />
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Credentials saved! Reloading connection...
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Reset to Demo Mode
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
