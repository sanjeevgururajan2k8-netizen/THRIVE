import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../common/Badges';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />,
            error: <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />,
            info: <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
          };
          const bgColors = {
            success: 'border-emerald-500/30 bg-emerald-500/10',
            error: 'border-red-500/30 bg-red-500/10',
            warning: 'border-amber-500/30 bg-amber-500/10',
            info: 'border-blue-500/30 bg-blue-500/10'
          };
          return (
            <div key={toast.id} className={cn(
              "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in-right",
              bgColors[toast.type] || bgColors.info
            )}>
              {icons[toast.type] || icons.info}
              <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
