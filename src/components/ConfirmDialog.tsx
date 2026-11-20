import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'warning',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmStyles =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : tone === 'warning'
        ? 'bg-orange-500 hover:bg-orange-600 text-white kalinga-btn-orange-3d'
        : 'bg-teal-600 hover:bg-teal-700 text-white kalinga-btn-3d';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040b16]/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/70 p-6 kalinga-card-3d">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                tone === 'danger'
                  ? 'bg-red-500/15 text-red-500'
                  : tone === 'warning'
                    ? 'bg-orange-500/15 text-orange-500'
                    : 'bg-teal-500/15 text-teal-500'
              }`}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-[#071426] dark:text-white"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] whitespace-nowrap ${confirmStyles}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
