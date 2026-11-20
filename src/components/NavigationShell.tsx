import React from 'react';
import {
  Bell,
  BookOpen,
  CheckSquare,
  Download,
  Home,
  MapPin,
  Shield,
  User,
  Users,
  WifiOff,
} from 'lucide-react';
import type { NavTab, SubView } from '../types/kalinga';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavigationShellProps {
  activeTab: NavTab;
  subView: SubView;
  cityLabel: string;
  isOnline: boolean;
  dueReminderCount: number;
  onSelectTab: (tab: NavTab) => void;
  onOpenCircle: () => void;
  onOpenNotifications: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'ready-check', label: 'Ready Check', icon: CheckSquare },
  { id: 'safe-spots', label: 'Safe Spots', icon: MapPin },
  { id: 'safety-guide', label: 'Safety Guide', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
];

export const NavigationShell: React.FC<NavigationShellProps> = ({
  activeTab,
  subView,
  cityLabel,
  isOnline,
  dueReminderCount,
  onSelectTab,
  onOpenCircle,
  onOpenNotifications,
  children,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const isNavActive = (tabId: NavTab) => subView === 'none' && activeTab === tabId;

  return (
    <div className="min-h-[100dvh] bg-[#f4f7fb] dark:bg-[#071426] text-[#071426] dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar Rail (visible on lg+ so desktop screens feel spacious & balanced) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-[#0B1B34] border-r border-slate-200 dark:border-slate-800/80 z-30">
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0D213F] border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#071426] dark:text-white block leading-none">
                KALINGA
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block truncate max-w-[140px]">
                {cityLabel}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full min-h-[46px] flex items-center gap-3 px-4 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-teal-600 text-white kalinga-btn-3d'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onOpenCircle}
              className={`w-full min-h-[46px] flex items-center gap-3 px-4 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                subView === 'circle'
                  ? 'bg-orange-500 text-white kalinga-btn-orange-3d'
                  : 'text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
              }`}
            >
              <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Circle of Safety</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5">
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-medium">
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Offline Mode Active</span>
            </div>
          )}

          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={install}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 rounded-2xl bg-[#0D213F] dark:bg-teal-600/20 border border-teal-500/40 text-white dark:text-teal-300 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Install Mobile App</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Compact Sticky Top App Bar (<= 52px height) */}
      <header className="lg:hidden sticky top-0 z-30 h-[52px] px-4 flex items-center justify-between bg-white dark:bg-[#0B1B34] border-b border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2 min-h-[44px] text-left"
        >
          <Shield className="h-5 w-5 text-teal-500 shrink-0" aria-hidden="true" />
          <span className="text-base font-extrabold tracking-tight text-[#071426] dark:text-white whitespace-nowrap">
            KALINGA
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {!isOnline && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 mr-1">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              Offline
            </span>
          )}
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Open preparedness reminders and alerts"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {dueReminderCount > 0 && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-orange-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Desktop Sub-Header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-slate-200/80 dark:border-slate-800/70 bg-white/85 dark:bg-[#071426]/90">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-[#071426] dark:text-white">
              Prepared Together. Safer Together.
            </span>
            <span className="mx-2 text-slate-400" aria-hidden="true">
              ·
            </span>
            <span>{cityLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenNotifications}
              aria-label="Open preparedness reminders"
              className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0D213F] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-500/60 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Bell className="h-4 w-4 text-teal-500" aria-hidden="true" />
              <span>Reminders ({dueReminderCount})</span>
            </button>
          </div>
        </div>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Fixed 5-Tab Bottom Navigation Bar (one-handed thumb zone, <= 64px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0B1B34] border-t border-slate-200 dark:border-slate-800/90 pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center max-w-xl mx-auto px-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors px-0.5 ${
                  active
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-[10px] leading-tight font-semibold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
