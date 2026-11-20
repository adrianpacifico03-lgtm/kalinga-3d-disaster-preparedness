import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { SAFETY_GUIDES } from '../data/kalingaData';
import type { HazardId } from '../types/kalinga';
import { ResilientImage } from './ResilientImage';

export const SafetyGuideView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<HazardId>('earthquakes');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    before: true,
    during: true,
    after: false,
  });

  const q = searchQuery.trim().toLowerCase();
  const visibleGuides = q
    ? SAFETY_GUIDES.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.subtitle.toLowerCase().includes(q) ||
          g.before.some((s) => s.toLowerCase().includes(q)) ||
          g.during.some((s) => s.toLowerCase().includes(q)) ||
          g.after.some((s) => s.toLowerCase().includes(q))
      )
    : SAFETY_GUIDES;

  const activeGuide =
    visibleGuides.find((g) => g.id === selectedId) || visibleGuides[0] || SAFETY_GUIDES[0];

  const togglePhase = (phase: 'before' | 'during' | 'after') => {
    setExpandedPhases((prev) => ({ ...prev, [phase]: !prev[phase] }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071426] dark:text-white">
            Safety Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Offline-ready Before, During & After protocols from PHIVOLCS, PAGASA, BFP & NDRRMC
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Available Offline</span>
        </div>
      </div>

      {/* Search & Hazard Selector */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hazard or safety instruction (e.g., tsunami, leptospirosis, LPG)..."
            aria-label="Search safety guides"
            className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/70 text-sm text-[#071426] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Disaster hazard categories"
        >
          {visibleGuides.map((guide) => {
            const active = activeGuide.id === guide.id;
            return (
              <button
                key={guide.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedId(guide.id)}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-teal-600 border-teal-600 text-white kalinga-btn-3d'
                    : 'bg-white dark:bg-[#0D213F] border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:border-teal-500/50'
                }`}
              >
                {guide.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Guide Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-5 rounded-3xl bg-[#0D213F] border border-slate-700/60 overflow-hidden kalinga-card-3d text-white">
          <div className="h-52 sm:h-60 relative">
            <ResilientImage
              src={activeGuide.imagePath}
              alt={`${activeGuide.title} 3D safety illustration`}
              className="h-full w-full object-cover"
              fallbackTitle={activeGuide.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D213F] via-[#0D213F]/30 to-transparent" />
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold text-teal-400">
              Source: {activeGuide.sourceAgency}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">{activeGuide.title}</h2>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
              {activeGuide.subtitle}
            </p>
          </div>
        </section>

        {/* Expandable Before / During / After Cards */}
        <section className="lg:col-span-7 space-y-3">
          {(
            [
              { key: 'before', label: 'Before', subtitle: 'Preparation & Risk Reduction', items: activeGuide.before, accent: 'text-teal-500' },
              { key: 'during', label: 'During', subtitle: 'Immediate Life-Safety Actions', items: activeGuide.during, accent: 'text-orange-500' },
              { key: 'after', label: 'After', subtitle: 'Recovery & Post-Event Checks', items: activeGuide.after, accent: 'text-sky-500' },
            ] as const
          ).map((phase) => {
            const isOpen = expandedPhases[phase.key];
            return (
              <div
                key={phase.key}
                className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 overflow-hidden kalinga-card-3d"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => togglePhase(phase.key)}
                  className="w-full min-h-[56px] px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className={`h-5 w-5 shrink-0 ${phase.accent}`} aria-hidden="true" />
                    <div>
                      <h3 className="text-base font-bold text-[#071426] dark:text-white">
                        {phase.label} · {activeGuide.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {phase.subtitle}
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <ol className="space-y-2.5 mt-3">
                      {phase.items.map((stepText, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200"
                        >
                          <span className="font-mono-num text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 shrink-0">
                            0{idx + 1}.
                          </span>
                          <span>{stepText}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};
