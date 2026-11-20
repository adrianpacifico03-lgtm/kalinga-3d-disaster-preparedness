import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CloudRain,
  Compass,
  ExternalLink,
  HeartHandshake,
  Lightbulb,
  MapPin,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { DAILY_TIPS } from '../data/kalingaData';
import type { WeatherTelemetry } from '../hooks/useWeatherAdvisory';
import type {
  EmergencyContact,
  NavTab,
  PhilippineCity,
  PreparednessMetrics,
  UserProfile,
} from '../types/kalinga';
import { KalingaShield3D } from './three/KalingaShield3D';

interface HomeDashboardProps {
  profile: UserProfile;
  city: PhilippineCity | undefined;
  metrics: PreparednessMetrics;
  contacts: EmergencyContact[];
  weather: WeatherTelemetry | null;
  weatherLoading: boolean;
  weatherError: string | null;
  onNavigateTab: (tab: NavTab) => void;
  onOpenScoreDetail: () => void;
  onOpenCircle: () => void;
  onRequestCall: (contact: EmergencyContact) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Magandang umaga';
  if (hour < 18) return 'Magandang hapon';
  return 'Magandang gabi';
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  city,
  metrics,
  contacts,
  weather,
  weatherLoading,
  weatherError,
  onNavigateTab,
  onOpenScoreDetail,
  onOpenCircle,
  onRequestCall,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  const formattedDate = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const displayCity = profile.customCityName.trim() || city?.name || 'Philippines';
  const priorityContacts = contacts.filter((c) => c.isPriority).slice(0, 2);
  const quickCallContact = priorityContacts[0] || contacts[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Greeting & Date Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {formattedDate} · {displayCity}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#071426] dark:text-white text-balance">
            {getGreeting()}
            {profile.name.trim() ? `, ${profile.name.trim()}` : ''}
          </h1>
        </div>

        {quickCallContact && (
          <button
            type="button"
            onClick={() => onRequestCall(quickCallContact)}
            className="self-start sm:self-auto min-h-[44px] px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 kalinga-btn-orange-3d transition-all active:scale-[0.98] whitespace-nowrap"
          >
            <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Emergency Call · {quickCallContact.name}</span>
          </button>
        )}
      </section>

      {/* Hero 3D Preparedness Card + Circle of Safety Split on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Dominant Focal Anchor: 3D KALINGA Preparedness Showcase */}
        <section className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#071426] via-[#0D213F] to-[#0E3156] text-white p-5 sm:p-7 border border-slate-700/60 kalinga-card-3d flex flex-col sm:flex-row items-center gap-5">
          <div className="shrink-0 flex flex-col items-center">
            <KalingaShield3D progressPercent={metrics.overallPercent} size="md" />
            <span className="text-[11px] text-slate-400 mt-1">Drag 3D Shield</span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-wide text-teal-400">
              Your Preparedness
            </p>
            <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-2">
              <span
                className="text-4xl sm:text-5xl font-extrabold font-mono-num text-white"
                data-testid="home-readiness-percent"
              >
                {metrics.overallPercent}%
              </span>
              <span className="text-sm font-bold tracking-wider text-teal-300">READY</span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-300">
              {metrics.completedCount} of {metrics.totalCount} checklist items packed ·{' '}
              {contacts.length} emergency contact{contacts.length === 1 ? '' : 's'}
            </p>

            {/* Animated Progress Bar */}
            <div className="mt-3.5 h-2.5 w-full rounded-full bg-[#071426] overflow-hidden border border-slate-700/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-teal-400 to-teal-300 transition-all duration-500"
                style={{ width: `${metrics.overallPercent}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateTab('ready-check')}
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-[#071426] font-bold text-sm inline-flex items-center gap-2 kalinga-btn-3d transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <span>Continue Preparing</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenScoreDetail}
                className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Score Breakdown
              </button>
            </div>
          </div>
        </section>

        {/* Prominent Circle of Safety Card */}
        <section className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 sm:p-6 kalinga-card-3d flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#071426] dark:text-white">
                    Circle of Safety
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {contacts.length} saved · {contacts.filter((c) => c.isPriority).length} priority
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCircle}
                className="min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors whitespace-nowrap"
              >
                Manage
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {contacts.slice(0, 2).map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/80 dark:border-slate-700/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071426] dark:text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {contact.relationship} · <span className="font-mono-num">{contact.phone}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRequestCall(contact)}
                    aria-label={`Call ${contact.name}`}
                    className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCircle}
            className="mt-4 w-full min-h-[44px] rounded-2xl bg-[#0D213F] dark:bg-slate-800 hover:bg-[#132f57] dark:hover:bg-slate-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <HeartHandshake className="h-4 w-4 text-orange-400" aria-hidden="true" />
            <span>Open Circle of Safety</span>
          </button>
        </section>
      </div>

      {/* Quick-Access Navigation Tiles */}
      <section aria-label="Quick navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('ready-check')}
            className="min-h-[88px] rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-4 text-left hover:border-teal-500/60 transition-colors kalinga-card-3d"
          >
            <CheckCircle2 className="h-5 w-5 text-teal-500" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-bold text-[#071426] dark:text-white">Ready Check</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono-num">
              {metrics.remainingCount} items left
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('safe-spots')}
            className="min-h-[88px] rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-4 text-left hover:border-teal-500/60 transition-colors kalinga-card-3d"
          >
            <MapPin className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-bold text-[#071426] dark:text-white">Safe Spots</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hospitals & shelters
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('safety-guide')}
            className="min-h-[88px] rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-4 text-left hover:border-teal-500/60 transition-colors kalinga-card-3d"
          >
            <BookOpen className="h-5 w-5 text-sky-500" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-bold text-[#071426] dark:text-white">Safety Guide</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              6 offline manuals
            </p>
          </button>

          <button
            type="button"
            onClick={onOpenScoreDetail}
            className="min-h-[88px] rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-4 text-left hover:border-teal-500/60 transition-colors kalinga-card-3d"
          >
            <Compass className="h-5 w-5 text-teal-400" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-bold text-[#071426] dark:text-white">Readiness</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono-num">
              {metrics.milestones.filter((m) => m.unlocked).length}/{metrics.milestones.length} milestones
            </p>
          </button>
        </div>
      </section>

      {/* Secondary Grid: Weather & Official Advisories + Daily Tip + Recent Checklist Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weather & Official Disaster Awareness */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-teal-500" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#071426] dark:text-white">
                Weather & Official Advisories
              </h2>
            </div>
          </div>

          <div className="mt-3">
            {weatherLoading && !weather ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Checking local weather telemetry for {displayCity}...
              </p>
            ) : weather ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold font-mono-num text-[#071426] dark:text-white">
                    {weather.temperatureC}°C
                  </span>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    {weather.conditionLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono-num">
                  Wind {weather.windKmh} km/h · Humidity {weather.humidity}% · Rain {weather.precipitationMm} mm
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {weather.isCached ? 'Cached observation' : 'Open-Meteo live data'} · Updated {weather.fetchedAt}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {weatherError || 'No live meteorological telemetry loaded.'}
              </p>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-700/60">
            <p className="text-xs font-semibold text-[#071426] dark:text-slate-200">
              Official Philippine Advisories
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Always confirm active typhoon signals and seismic bulletins from official agencies:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <a
                href="https://www.pagasa.dost.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                PAGASA <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <span className="text-slate-400" aria-hidden="true">·</span>
              <a
                href="https://www.phivolcs.dost.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                PHIVOLCS <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <span className="text-slate-400" aria-hidden="true">·</span>
              <a
                href="https://ndrrmc.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                NDRRMC <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* Daily Preparedness Tip */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-500" aria-hidden="true" />
                <h2 className="text-base font-bold text-[#071426] dark:text-white">
                  Daily Preparedness Tip
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setTipIndex((i) => (i + 1) % DAILY_TIPS.length)}
                aria-label="Show next preparedness tip"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {DAILY_TIPS[tipIndex]}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
            Tip {tipIndex + 1} of {DAILY_TIPS.length} · Practical Home Readiness
          </p>
        </section>

        {/* Recent Checklist Category Progress */}
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-500" aria-hidden="true" />
                <h2 className="text-base font-bold text-[#071426] dark:text-white">
                  Checklist Progress
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('ready-check')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3.5 space-y-3">
              {metrics.categoryProgress.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {cat.label}
                    </span>
                    <span className="font-mono-num text-slate-500 dark:text-slate-400">
                      {cat.completed}/{cat.total}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#071426] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-300"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
            Next: {metrics.suggestedNextAction.label}
          </p>
        </section>
      </div>
    </div>
  );
};
