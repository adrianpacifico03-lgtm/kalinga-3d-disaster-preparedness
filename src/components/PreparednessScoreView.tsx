import React from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import type { NavTab, PreparednessMetrics } from '../types/kalinga';
import { KalingaShield3D } from './three/KalingaShield3D';

interface PreparednessScoreViewProps {
  metrics: PreparednessMetrics;
  onBack: () => void;
  onAction: (target: NavTab | 'circle') => void;
}

export const PreparednessScoreView: React.FC<PreparednessScoreViewProps> = ({
  metrics,
  onBack,
  onAction,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home Dashboard"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-teal-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#071426] dark:text-white">
            Preparedness Score
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Household readiness breakdown, milestones & suggested next step
          </p>
        </div>
      </div>

      {/* 3D Readiness Hero Summary */}
      <section className="rounded-3xl bg-gradient-to-br from-[#071426] via-[#0D213F] to-[#113158] text-white p-6 border border-slate-700/60 kalinga-card-3d grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 flex justify-center">
          <KalingaShield3D progressPercent={metrics.overallPercent} size="md" />
        </div>

        <div className="md:col-span-8 space-y-4">
          <div>
            <p className="text-xs font-semibold text-teal-400">Overall Readiness Score</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-5xl font-extrabold font-mono-num">
                {metrics.overallPercent}%
              </span>
              <span className="text-sm font-semibold text-slate-300">
                Checklist {metrics.checklistPercent}% · Contacts & City linked
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
              <p className="text-xs text-slate-300">Completed</p>
              <p className="mt-1 text-2xl font-bold font-mono-num text-teal-400">
                {metrics.completedCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
              <p className="text-xs text-slate-300">Remaining</p>
              <p className="mt-1 text-2xl font-bold font-mono-num text-orange-400">
                {metrics.remainingCount}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
              <p className="text-xs text-slate-300">Total Tasks</p>
              <p className="mt-1 text-2xl font-bold font-mono-num text-white">
                {metrics.totalCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Next Action */}
      <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              Suggested Next Action
            </p>
            <h2 className="text-base font-bold text-[#071426] dark:text-white mt-0.5">
              {metrics.suggestedNextAction.label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              {metrics.suggestedNextAction.detail}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAction(metrics.suggestedNextAction.targetTab)}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 kalinga-btn-3d whitespace-nowrap shrink-0"
        >
          <span>Take Action</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      {/* Category Progress & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d space-y-4">
          <h2 className="text-base font-bold text-[#071426] dark:text-white">
            Category Progress
          </h2>
          {metrics.categoryProgress.map((cat) => (
            <div
              key={cat.category}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071426]/70 border border-slate-200/70 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[#071426] dark:text-white">
                  {cat.label}
                </span>
                <span className="font-mono-num text-xs font-bold text-teal-600 dark:text-teal-400">
                  {cat.completed}/{cat.total} ({cat.percent}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#071426] dark:text-white">
              Preparedness Milestones
            </h2>
          </div>

          <div className="space-y-2.5">
            {metrics.milestones.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
                  m.unlocked
                    ? 'bg-teal-500/10 border-teal-500/40'
                    : 'bg-slate-50 dark:bg-[#071426]/60 border-slate-200/70 dark:border-slate-700/50 opacity-80'
                }`}
              >
                {m.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-bold text-[#071426] dark:text-white">
                    {m.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Explicit Safety Disclaimer */}
      <section className="rounded-2xl bg-slate-100 dark:bg-[#0D213F]/80 border border-slate-200 dark:border-slate-700/70 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <strong className="text-[#071426] dark:text-white">Important Safety Notice:</strong>{' '}
          Your KALINGA preparedness score helps track household planning progress, but a high score does not guarantee safety during a disaster. Always follow official evacuation orders from your LGU DRRMO, PAGASA, PHIVOLCS, and NDRRMC.
        </p>
      </section>
    </div>
  );
};
