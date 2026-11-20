import React, { useState } from 'react';
import {
  Bell,
  Download,
  HardDrive,
  Info,
  Lock,
  MapPin,
  Moon,
  RotateCcw,
  Shield,
  Sun,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { PHILIPPINE_CITIES } from '../data/kalingaData';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { UserProfile } from '../types/kalinga';
import { ConfirmDialog } from './ConfirmDialog';

interface ProfileSettingsViewProps {
  profile: UserProfile;
  enabledRemindersCount: number;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onOpenNotifications: () => void;
  onReplayOnboarding: () => void;
  onClearAllLocalData: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  enabledRemindersCount,
  onUpdateProfile,
  onOpenNotifications,
  onReplayOnboarding,
  onClearAllLocalData,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#071426] dark:text-white">
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Household details, offline content, privacy controls & theme preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Profile & Preferred Location */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 kalinga-card-3d space-y-4">
          <div className="flex items-center gap-2.5">
            <User className="h-5 w-5 text-teal-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#071426] dark:text-white">
              User Profile & Location
            </h2>
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold mb-1">
              Your Name (used for personal greeting)
            </label>
            <input
              id="profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              placeholder="e.g., Adrian"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
            />
          </div>

          <div>
            <label htmlFor="profile-city" className="block text-xs font-semibold mb-1">
              Preferred City / Municipality
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500"
                aria-hidden="true"
              />
              <select
                id="profile-city"
                value={profile.cityId}
                onChange={(e) =>
                  onUpdateProfile({ cityId: e.target.value, customCityName: '' })
                }
                className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              >
                {PHILIPPINE_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="profile-custom-city" className="block text-xs font-semibold mb-1">
              Custom Barangay / Municipality Override (optional)
            </label>
            <input
              id="profile-custom-city"
              type="text"
              value={profile.customCityName}
              onChange={(e) => onUpdateProfile({ customCityName: e.target.value })}
              placeholder="e.g., Barangay Loyola Heights, Quezon City"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
            />
          </div>
        </section>

        {/* Optional Household Information */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 kalinga-card-3d space-y-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#071426] dark:text-white">
              Optional Household Details
            </h2>
          </div>

          <div>
            <label htmlFor="household-size" className="block text-xs font-semibold mb-1">
              Household Members (helps plan water & food rations)
            </label>
            <input
              id="household-size"
              type="number"
              min={1}
              max={20}
              value={profile.householdSize}
              onChange={(e) =>
                onUpdateProfile({
                  householdSize: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                })
              }
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm font-mono-num"
            />
          </div>

          <div>
            <label htmlFor="meeting-point" className="block text-xs font-semibold mb-1">
              Family Emergency Meeting Point
            </label>
            <input
              id="meeting-point"
              type="text"
              value={profile.meetingPoint}
              onChange={(e) => onUpdateProfile({ meetingPoint: e.target.value })}
              placeholder="e.g., Barangay Covered Court Gate"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasSeniorsOrChildren}
                onChange={(e) =>
                  onUpdateProfile({ hasSeniorsOrChildren: e.target.checked })
                }
                className="h-5 w-5 accent-teal-600 rounded"
              />
              <span className="text-sm text-[#071426] dark:text-slate-200">
                Includes seniors, infants, or members needing mobility assistance
              </span>
            </label>

            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasPets}
                onChange={(e) => onUpdateProfile({ hasPets: e.target.checked })}
                className="h-5 w-5 accent-teal-600 rounded"
              />
              <span className="text-sm text-[#071426] dark:text-slate-200">
                Household includes pets (remember extra water & carrier)
              </span>
            </label>
          </div>
        </section>

        {/* Preferences: Theme, Notifications & Offline PWA */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 kalinga-card-3d space-y-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-teal-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#071426] dark:text-white">
              App, Theme & Offline Settings
            </h2>
          </div>

          {/* Theme Preference */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/70 dark:border-slate-700/50">
            <div>
              <p className="text-sm font-semibold text-[#071426] dark:text-white">
                Theme Appearance
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile.theme === 'dark' ? 'Midnight Navy (Dark)' : 'Daylight High-Contrast (Light)'}
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200 dark:bg-[#0D213F]">
              <button
                type="button"
                onClick={() => onUpdateProfile({ theme: 'light' })}
                aria-label="Switch to Light theme"
                className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  profile.theme === 'light'
                    ? 'bg-white text-[#071426] shadow-sm'
                    : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateProfile({ theme: 'dark' })}
                aria-label="Switch to Dark theme"
                className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  profile.theme === 'dark'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Notification Settings Shortcut */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="w-full min-h-[56px] p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between gap-3 text-left hover:border-teal-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#071426] dark:text-white">
                  Notification & Reminder Settings
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {enabledRemindersCount} active preparedness reminder{enabledRemindersCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              Configure
            </span>
          </button>

          {/* Offline Content & PWA Install */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/70 dark:border-slate-700/50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#071426] dark:text-white">
                  Offline Safety Content
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All 6 hazard guides & 16 checklist items are bundled offline.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={profile.offlineGuidesCached}
                aria-label="Toggle offline safety guide caching"
                onClick={() =>
                  onUpdateProfile({ offlineGuidesCached: !profile.offlineGuidesCached })
                }
                className={`min-h-[36px] min-w-[56px] px-1 rounded-full transition-colors flex items-center shrink-0 ${
                  profile.offlineGuidesCached
                    ? 'bg-teal-600 justify-end'
                    : 'bg-slate-300 dark:bg-slate-700 justify-start'
                }`}
              >
                <span className="h-6 w-6 rounded-full bg-white shadow-sm block" />
              </button>
            </div>

            {!isInstalled && isInstallable && (
              <button
                type="button"
                onClick={install}
                className="w-full min-h-[44px] px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Install KALINGA on Your Phone</span>
              </button>
            )}

            {!isInstalled && isIOS && !isInstallable && (
              <button
                type="button"
                onClick={() => setIosGuideOpen((o) => !o)}
                className="w-full min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold"
              >
                How to Install on iPhone / iPad
              </button>
            )}

            {iosGuideOpen && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0D213F] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                1. Tap the <strong>Share</strong> button in Safari. 2. Scroll down and tap{' '}
                <strong>Add to Home Screen</strong>.
              </p>
            )}
          </div>
        </section>

        {/* Privacy, About KALINGA & Safety Disclaimer */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 kalinga-card-3d space-y-4">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-teal-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#071426] dark:text-white">
              Privacy, About & Disclaimer
            </h2>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/70 dark:border-slate-700/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#071426] dark:text-white">
              <Shield className="h-4 w-4 text-teal-500" aria-hidden="true" />
              <span>Privacy First · On-Device Storage</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Your household details, checklist progress, saved SafeSpots, and Circle of Safety contacts are stored strictly on your device. KALINGA does not upload personal contacts to external servers.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/70 dark:border-slate-700/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#071426] dark:text-white">
              <Info className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span>About KALINGA & Safety Disclaimer</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              KALINGA – Prepared Together. Safer Together. Designed as a community emergency preparedness companion for Filipino families. Guidance is informational and does not replace official instructions from NDRRMC, PAGASA, PHIVOLCS, BFP, or local responders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={onReplayOnboarding}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold inline-flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Replay Welcome Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-semibold inline-flex items-center gap-2 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Clear Local Data</span>
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear all local KALINGA data?"
        description="This will erase your saved checklist progress, custom SafeSpots, Circle of Safety contacts, and preferences on this device."
        confirmLabel="Clear All Data"
        tone="danger"
        onConfirm={() => {
          onClearAllLocalData();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
