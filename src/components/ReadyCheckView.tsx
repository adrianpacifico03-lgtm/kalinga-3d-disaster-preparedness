import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '../data/kalingaData';
import type { ChecklistCategory, PreparednessMetrics } from '../types/kalinga';
import { EmergencyKit3D } from './three/EmergencyKit3D';
import { ConfirmDialog } from './ConfirmDialog';

interface ReadyCheckViewProps {
  checkedIds: string[];
  metrics: PreparednessMetrics;
  onToggleItem: (itemId: string) => void;
  onResetAll: () => void;
}

const FILTER_TABS: { id: 'all' | ChecklistCategory; label: string }[] = [
  { id: 'all', label: 'All (16)' },
  { id: 'go-bag', label: 'Go-Bag' },
  { id: 'documents', label: 'Documents & Cash' },
  { id: 'family-plan', label: 'Family Plan' },
];

export const ReadyCheckView: React.FC<ReadyCheckViewProps> = ({
  checkedIds,
  metrics,
  onToggleItem,
  onResetAll,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | ChecklistCategory>('all');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [recentlyCheckedId, setRecentlyCheckedId] = useState<string | null>(null);

  const checkedSet = new Set(checkedIds);
  const filteredItems =
    activeCategory === 'all'
      ? CHECKLIST_ITEMS
      : CHECKLIST_ITEMS.filter((item) => item.category === activeCategory);

  const handleToggle = (id: string) => {
    const willBeChecked = !checkedSet.has(id);
    onToggleItem(id);
    if (willBeChecked) {
      setRecentlyCheckedId(id);
      window.setTimeout(() => {
        setRecentlyCheckedId((curr) => (curr === id ? null : curr));
      }, 650);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071426] dark:text-white">
            Ready Check
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive 72-hour Go-Bag & household preparedness checklist
          </p>
        </div>

        <button
          type="button"
          disabled={checkedIds.length === 0}
          onClick={() => setConfirmResetOpen(true)}
          className="self-start sm:self-auto min-h-[44px] px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Reset Progress</span>
        </button>
      </div>

      {/* Top Layout: Interactive 3D Kit + Summary Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 space-y-4">
          <EmergencyKit3D checkedIds={checkedIds} />

          {/* Summary Progress Card */}
          <section className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-500" aria-hidden="true" />
                <span className="text-sm font-bold text-[#071426] dark:text-white">
                  Checklist Readiness
                </span>
              </div>
              <span
                className="text-xl font-extrabold font-mono-num text-teal-600 dark:text-teal-400"
                data-testid="readycheck-percent"
              >
                {metrics.checklistPercent}%
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-[#071426] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-teal-400 transition-all duration-300"
                style={{ width: `${metrics.checklistPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {metrics.categoryProgress.map((cat) => (
                <div
                  key={cat.category}
                  className="rounded-xl bg-slate-50 dark:bg-[#071426]/70 p-2.5 text-center"
                >
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {cat.category === 'go-bag'
                      ? 'Go-Bag'
                      : cat.category === 'documents'
                        ? 'Documents'
                        : 'Family Plan'}
                  </p>
                  <p className="text-sm font-bold font-mono-num text-[#071426] dark:text-white mt-0.5">
                    {cat.completed}/{cat.total}
                  </p>
                </div>
              ))}
            </div>

            {metrics.checklistPercent === 100 && (
              <div className="rounded-2xl bg-teal-500/15 border border-teal-500/30 p-3 flex items-center gap-2.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>All 16 preparedness items packed and verified!</span>
              </div>
            )}
          </section>
        </div>

        {/* Checklist Items Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter Tabs */}
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 overflow-x-auto"
            role="tablist"
            aria-label="Filter checklist by category"
          >
            {FILTER_TABS.map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Checklist Cards */}
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const checked = checkedSet.has(item.id);
              const justChecked = recentlyCheckedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => handleToggle(item.id)}
                  className={`w-full min-h-[64px] text-left rounded-2xl p-4 border transition-all duration-200 flex items-start gap-3.5 ${
                    checked
                      ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-500/40'
                      : 'bg-white dark:bg-[#0D213F] border-slate-200 dark:border-slate-700/60 hover:border-teal-500/40'
                  } ${justChecked ? 'scale-[0.99]' : ''}`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                      checked
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-transparent'
                    }`}
                  >
                    {checked && <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-bold ${
                          checked
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-[#071426] dark:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                        {item.priority === 'essential' ? 'Essential' : 'Recommended'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset checklist progress?"
        description="This will uncheck all packed items in your Ready Check list and reset your checklist progress to 0%. Your emergency contacts and settings will remain saved."
        confirmLabel="Reset Progress"
        tone="danger"
        onConfirm={() => {
          onResetAll();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
