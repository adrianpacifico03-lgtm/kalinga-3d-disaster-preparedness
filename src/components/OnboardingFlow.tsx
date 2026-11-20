import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PHILIPPINE_CITIES } from '../data/kalingaData';
import type { NavTab } from '../types/kalinga';
import { KalingaShield3D } from './three/KalingaShield3D';
import { ResilientImage } from './ResilientImage';

interface OnboardingFlowProps {
  selectedCityId: string;
  customCityName: string;
  onSelectCity: (cityId: string, customName?: string) => void;
  onComplete: (initialTab: NavTab) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  selectedCityId,
  customCityName,
  onSelectCity,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cityQuery, setCityQuery] = useState('');
  const [customInput, setCustomInput] = useState(customCityName);

  const filteredCities = PHILIPPINE_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(cityQuery.trim().toLowerCase()) ||
      c.region.toLowerCase().includes(cityQuery.trim().toLowerCase())
  );

  const selectedCity = PHILIPPINE_CITIES.find((c) => c.id === selectedCityId);

  return (
    <div className="min-h-[100dvh] bg-[#071426] text-white flex flex-col justify-between px-4 py-6 sm:py-10">
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : 1))}
              aria-label="Previous onboarding step"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-[#0D213F] border border-slate-700/60 text-slate-200 hover:bg-[#132c52] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="text-lg font-extrabold tracking-tight text-white">KALINGA</span>
          )}
        </div>

        <div className="flex items-center gap-2" aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map((num) => (
            <span
              key={num}
              className={`h-2 rounded-full transition-all duration-200 ${
                num === step
                  ? 'w-7 bg-teal-400'
                  : num < step
                    ? 'w-2.5 bg-teal-600'
                    : 'w-2.5 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onComplete('home')}
          className="min-h-[44px] px-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
        >
          Skip
        </button>
      </div>

      <main className="w-full max-w-2xl mx-auto my-auto py-6">
        {step === 1 && (
          <section className="flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center mb-4">
              <KalingaShield3D progressPercent={100} size="lg" />
            </div>
            <p className="text-xs font-semibold tracking-wider text-teal-400">
              Community Emergency Companion
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance text-white">
              Welcome to KALINGA
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-slate-300">
              Prepared Together. Safer Together. Organize your household emergency kit, locate nearby safe spots, and access offline disaster guides anytime.
            </p>
            <div className="mt-8 w-full max-w-sm">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-base kalinga-btn-3d transition-all active:scale-[0.98]"
              >
                Get Started
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-3xl bg-[#0D213F] border border-slate-700/60 p-5 sm:p-8 kalinga-card-3d">
            <div className="flex items-center gap-3 text-teal-400 text-sm font-semibold">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>Step 2 of 4 · Localize Your Safety Plan</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white text-balance">
              Select your city or municipality
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Used for local weather advisories and regional emergency directories. Stored only on your device.
            </p>

            <div className="mt-5 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Search Philippine city or municipality..."
                aria-label="Search Philippine city or municipality"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-[#071426] border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredCities.map((city) => {
                const active = selectedCityId === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      onSelectCity(city.id, '');
                      setCustomInput('');
                    }}
                    className={`min-h-[48px] flex flex-col items-start justify-center px-4 py-2.5 rounded-2xl border text-left transition-all ${
                      active
                        ? 'bg-teal-600/20 border-teal-400 text-white'
                        : 'bg-[#071426]/60 border-slate-700/70 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-sm font-semibold">{city.name}</span>
                    <span className="text-xs text-slate-400">{city.region}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/60">
              <label
                htmlFor="custom-municipality"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Or enter another barangay / municipality (optional)
              </label>
              <input
                id="custom-municipality"
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (e.target.value.trim()) {
                    onSelectCity(selectedCityId || 'quezon-city', e.target.value);
                  }
                }}
                placeholder="e.g., Antipolo City, Rizal"
                className="w-full min-h-[44px] px-4 rounded-2xl bg-[#071426] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[44px] px-4 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="min-h-[48px] px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm inline-flex items-center gap-2 kalinga-btn-3d transition-all active:scale-[0.98]"
              >
                Continue{selectedCity ? ` · ${selectedCity.name}` : ''}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="rounded-3xl bg-[#0D213F] border border-slate-700/60 p-5 sm:p-8 kalinga-card-3d">
            <p className="text-xs font-semibold text-teal-400">
              Step 3 of 4 · Core Capabilities
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white text-balance">
              Everything your family needs in one offline-ready space
            </h1>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-2xl bg-[#071426]/80 border border-slate-700/60 p-4">
                <div className="h-10 w-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-3 text-base font-bold text-white">Ready Check & 3D Kit</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Track 16 essential Go-Bag items and family plans with live readiness scoring.
                </p>
              </div>

              <div className="rounded-2xl bg-[#071426]/80 border border-slate-700/60 p-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-3 text-base font-bold text-white">SafeSpot Directory</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Find verified hospitals, DRRMO hubs, and save your local barangay centers.
                </p>
              </div>

              <div className="rounded-2xl bg-[#071426]/80 border border-slate-700/60 p-4">
                <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-3 text-base font-bold text-white">Offline Safety Guides</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Before, During, and After actions for earthquakes, typhoons, floods, and fires.
                </p>
              </div>

              <div className="rounded-2xl bg-[#071426]/80 border border-slate-700/60 p-4">
                <div className="h-10 w-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-3 text-base font-bold text-white">Circle of Safety</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Pin priority family contacts with confirmation-guarded emergency dialing.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="min-h-[48px] px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm inline-flex items-center gap-2 kalinga-btn-3d transition-all active:scale-[0.98]"
              >
                Next
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="rounded-3xl bg-[#0D213F] border border-slate-700/60 overflow-hidden kalinga-card-3d">
            <div className="h-48 sm:h-56 w-full relative overflow-hidden">
              <ResilientImage
                src="/src/assets/images/kalinga_3d_kit_1795175246102.jpg"
                alt="3D Emergency Preparedness Go-Bag Kit"
                className="h-full w-full object-cover"
                fallbackTitle="Emergency Preparedness Go-Bag"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D213F] via-[#0D213F]/30 to-transparent" />
            </div>

            <div className="p-6 sm:p-8 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Ready When Seconds Matter</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white text-balance">
                Start your preparedness checklist
              </h1>
              <p className="mt-2.5 max-w-md mx-auto text-sm text-slate-300 leading-relaxed">
                Check off what you already have at home and discover the next most important step for your household.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onComplete('ready-check')}
                  className="w-full sm:w-auto min-h-[48px] px-7 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 kalinga-btn-orange-3d transition-all active:scale-[0.98]"
                >
                  Start Preparedness Checklist
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onComplete('home')}
                  className="w-full sm:w-auto min-h-[48px] px-6 rounded-2xl border border-slate-600 hover:bg-slate-800/70 text-slate-200 font-semibold text-sm transition-colors"
                >
                  Explore Home Dashboard
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400">
        KALINGA · Offline-First Emergency Companion
      </footer>
    </div>
  );
};
