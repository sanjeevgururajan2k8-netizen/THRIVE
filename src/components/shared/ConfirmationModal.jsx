import React from 'react';
import { cn } from '../common/Badges';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
            danger ? "bg-red-500/10" : "bg-blue-500/10"
          )}>
            <AlertTriangle className={cn("h-5 w-5", danger ? "text-red-400" : "text-blue-400")} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
              danger 
                ? "bg-red-600 hover:bg-red-700 border border-red-500" 
                : "bg-blue-600 hover:bg-blue-700 border border-blue-500"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
