import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 animate-slideUp"
    >
      <div
        className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
          isError
            ? 'bg-rose-50/95 border-rose-200 text-rose-900'
            : isSuccess
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
            : 'bg-white/95 border-stone-200 text-stone-900'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {!isError && !isSuccess && <Info className="w-4 h-4 text-stone-500" />}
        </div>

        <div className="flex-1 text-xs">
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          <p className="mt-0.5 leading-relaxed">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

