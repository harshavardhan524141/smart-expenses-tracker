import React from 'react';
import { Database, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SupabaseBanner({ onOpenSetup }) {
  const { isConfigured, isDemo } = useAuth();

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        {isConfigured && !isDemo ? (
          <>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Connected to Supabase PostgreSQL (RLS Enabled)
            </span>
            <span className="text-slate-400 hidden md:inline">· User data secured with PostgreSQL Row Level Security</span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Demo / Evaluation Mode
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Running with sample data & in-memory backend. Connect Supabase anytime!
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSetup}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors underline underline-offset-2"
        >
          <Sliders className="w-3.5 h-3.5" />
          {isConfigured ? 'Database Settings' : 'Connect Supabase'}
        </button>
      </div>
    </div>
  );
}
