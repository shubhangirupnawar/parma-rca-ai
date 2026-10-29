import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '../../store/uiSlice';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const NotificationToast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in shadow-2xl">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
            : isError
            ? 'bg-slate-900/95 border-rose-500/50 text-rose-200'
            : 'bg-slate-900/95 border-teal-500/50 text-teal-200'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <AlertTriangle className="w-5 h-5 text-teal-400" />}
        </div>
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={() => dispatch(clearToast())}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
