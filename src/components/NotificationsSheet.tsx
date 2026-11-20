import React, { useState } from 'react';
import { Bell, BellOff, ExternalLink, ShieldAlert, X } from 'lucide-react';
import type { ReminderFrequency, ReminderSetting } from '../types/kalinga';

interface NotificationsSheetProps {
  open: boolean;
  reminders: ReminderSetting[];
  onUpdateReminder: (id: ReminderSetting['id'], patch: Partial<ReminderSetting>) => void;
  onDisableAll: () => void;
  onClose: () => void;
}

export const NotificationsSheet: React.FC<NotificationsSheetProps> = ({
  open,
  reminders,
  onUpdateReminder,
  onDisableAll,
  onClose,
}) => {
  const [permState, setPermState] = useState<string>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return window.Notification.permission;
  });

  if (!open) return null;

  const requestBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      setPermState('unsupported');
      return;
    }
    try {
      const result = await window.Notification.requestPermission();
      setPermState(result);
    } catch {
      setPermState('denied');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040b16]/75 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-sheet-title"
    >
      <div className="w-full max-w-lg max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/70 kalinga-card-3d overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-teal-500" aria-hidden="true" />
            <h2
              id="notifications-sheet-title"
              className="text-lg font-bold text-[#071426] dark:text-white"
            >
              Preparedness Reminders
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications panel"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Device Notification Permission Card */}
          <div className="rounded-2xl bg-slate-50 dark:bg-[#071426]/80 border border-slate-200 dark:border-slate-700/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#071426] dark:text-white">
                Device Notification Permission
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {permState === 'granted'
                  ? 'Browser alerts enabled on this device.'
                  : permState === 'denied'
                    ? 'Permission blocked in browser settings; in-app schedules still remain active.'
                    : permState === 'unsupported'
                      ? 'System notifications unavailable in this environment; in-app schedules remain active.'
                      : 'Allow optional local reminders on this device.'}
              </p>
            </div>

            {permState === 'default' && (
              <button
                type="button"
                onClick={requestBrowserNotifications}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Enable Alerts
              </button>
            )}
          </div>

          {/* 4 Customizable Reminders */}
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 bg-white dark:bg-[#071426]/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#071426] dark:text-white">
                      {rem.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {rem.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={rem.enabled}
                    aria-label={`Toggle ${rem.title}`}
                    onClick={() => onUpdateReminder(rem.id, { enabled: !rem.enabled })}
                    className={`min-h-[36px] min-w-[56px] px-1 rounded-full transition-colors flex items-center shrink-0 ${
                      rem.enabled
                        ? 'bg-teal-600 justify-end'
                        : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="h-6 w-6 rounded-full bg-white shadow-sm block" />
                  </button>
                </div>

                {rem.enabled && (
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label
                        htmlFor={`freq-${rem.id}`}
                        className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                      >
                        Frequency
                      </label>
                      <select
                        id={`freq-${rem.id}`}
                        value={rem.frequency}
                        onChange={(e) =>
                          onUpdateReminder(rem.id, {
                            frequency: e.target.value as ReminderFrequency,
                          })
                        }
                        className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0D213F] border border-slate-300 dark:border-slate-700 text-xs font-medium"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Every 2 Weeks</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`time-${rem.id}`}
                        className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                      >
                        Preferred Time
                      </label>
                      <input
                        id={`time-${rem.id}`}
                        type="time"
                        value={rem.time}
                        onChange={(e) =>
                          onUpdateReminder(rem.id, { time: e.target.value })
                        }
                        className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#0D213F] border border-slate-300 dark:border-slate-700 text-xs font-mono-num"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Official Sources Transparency Notice */}
          <div className="rounded-2xl bg-slate-100 dark:bg-[#071426]/90 border border-slate-200 dark:border-slate-700/60 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-[#071426] dark:text-white">
                Official Real-Time Hazard Alerts
              </p>
              <p className="mt-1">
                KALINGA never fabricates live emergency warnings. Monitor official government bulletins from{' '}
                <a
                  href="https://www.pagasa.dost.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-semibold inline-flex items-center gap-0.5 hover:underline"
                >
                  PAGASA <ExternalLink className="h-3 w-3" />
                </a>{' '}
                and{' '}
                <a
                  href="https://ndrrmc.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-semibold inline-flex items-center gap-0.5 hover:underline"
                >
                  NDRRMC <ExternalLink className="h-3 w-3" />
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDisableAll}
            className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
          >
            <BellOff className="h-4 w-4" aria-hidden="true" />
            <span>Pause All</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
