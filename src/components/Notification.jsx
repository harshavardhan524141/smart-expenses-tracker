import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  if (!notification) return null;

  const { type = 'info', message } = notification;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
    },
  }[type] || {
    bg: 'bg-slate-50 border-slate-200 text-slate-900',
    icon: <Info className="w-4 h-4 text-slate-600 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg ${config.bg}`}
      >
        <div className="flex items-center gap-2.5 text-xs font-medium">
          {config.icon}
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
