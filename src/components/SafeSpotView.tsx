import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { VERIFIED_SAFESPOTS } from '../data/kalingaData';
import type { FacilityCategory, PhilippineCity, SafeSpotFacility } from '../types/kalinga';
import { filterSafeSpots, formatPhoneForTel } from '../utils/preparedness';
import { ResilientImage } from './ResilientImage';
import { ConfirmDialog } from './ConfirmDialog';

interface SafeSpotViewProps {
  selectedCity: PhilippineCity | undefined;
  customCityName: string;
  userSafeSpots: SafeSpotFacility[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onAddFacility: (facility: SafeSpotFacility) => void;
  onDeleteFacility: (id: string) => void;
}

const CATEGORY_OPTIONS: { id: FacilityCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'evacuation', label: 'Evacuation Centers' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'clinic', label: 'Clinics' },
  { id: 'fire', label: 'Fire Stations' },
  { id: 'police', label: 'Police Stations' },
  { id: 'drrmo', label: 'DRRMO Offices' },
  { id: 'pharmacy', label: 'Pharmacies' },
];

const CATEGORY_LABEL_MAP: Record<FacilityCategory, string> = {
  evacuation: 'Evacuation Center',
  hospital: 'Hospital',
  clinic: 'Clinic',
  fire: 'Fire Station',
  police: 'Police Station',
  drrmo: 'Disaster-Response Office',
  pharmacy: 'Pharmacy',
};

export const SafeSpotView: React.FC<SafeSpotViewProps> = ({
  selectedCity,
  customCityName,
  userSafeSpots,
  savedIds,
  onToggleSave,
  onAddFacility,
  onDeleteFacility,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FacilityCategory | 'all'>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [cityFilter, setCityFilter] = useState<'my-city' | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [callTarget, setCallTarget] = useState<SafeSpotFacility | null>(null);

  // Add Local Facility Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<FacilityCategory>('evacuation');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const cityLabel = customCityName.trim() || selectedCity?.name || 'Philippines';
  const allFacilities = [...userSafeSpots, ...VERIFIED_SAFESPOTS];
  const filtered = filterSafeSpots(
    allFacilities,
    query,
    category,
    savedOnly,
    savedIds,
    cityFilter === 'my-city' && selectedCity ? selectedCity.id : 'all'
  );

  const savedSet = new Set(savedIds);

  const buildExternalMapUrl = (searchTerm: string) => {
    const q = encodeURIComponent(`${searchTerm} near ${cityLabel}, Philippines`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  const handleSaveNewFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim().length < 3) {
      setFormError('Please enter the verified facility name (at least 3 characters).');
      return;
    }
    if (newAddress.trim().length < 4) {
      setFormError('Please enter the street or barangay location.');
      return;
    }

    const facility: SafeSpotFacility = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      cityId: selectedCity?.id || 'custom',
      cityLabel,
      address: newAddress.trim(),
      phone: newPhone.trim() || undefined,
      verifiedSource: 'Added by You (Local Directory)',
      isUserAdded: true,
    };

    onAddFacility(facility);
    onToggleSave(facility.id);
    setNewName('');
    setNewAddress('');
    setNewPhone('');
    setFormError(null);
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071426] dark:text-white">
            Safe Spots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verified emergency facilities, live map lookups & your local barangay pins
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="self-start sm:self-auto min-h-[44px] px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 kalinga-btn-3d whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Local SafeSpot</span>
        </button>
      </div>

      {/* Isometric 3D Emergency Facility Banner + Live Map Launcher */}
      <section className="rounded-3xl bg-[#0D213F] border border-slate-700/60 overflow-hidden kalinga-card-3d grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 h-44 lg:h-full relative">
          <ResilientImage
            src="/src/assets/images/kalinga_3d_shelter_1795175246098.jpg"
            alt="Isometric 3D Community Evacuation and Medical Facility Campus"
            className="h-full w-full object-cover"
            fallbackTitle="Community SafeSpot Campus"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0D213F] via-[#0D213F]/30 to-transparent" />
        </div>

        <div className="lg:col-span-7 p-5 sm:p-6 text-white flex flex-col justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-teal-400">
              Live Map & Directions · {cityLabel}
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-balance">
              Find nearby verified shelters & clinics on the map
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              KALINGA never fabricates local addresses. Use verified national hotlines below, add your barangay evacuation center offline, or launch live map search for your city.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Evacuation Centers', q: 'Evacuation Center' },
              { label: 'Hospitals', q: 'Hospital Emergency Room' },
              { label: 'Fire Stations', q: 'Fire Station BFP' },
              { label: 'Police Stations', q: 'Police Station PNP' },
              { label: 'Pharmacies', q: '24 hour Pharmacy' },
            ].map((item) => (
              <a
                key={item.label}
                href={buildExternalMapUrl(item.q)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-teal-500/25 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Navigation className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                <span>{item.label}</span>
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospital, DRRMO, barangay, or city..."
              aria-label="Search emergency facilities"
              className="w-full min-h-[44px] pl-10 pr-4 rounded-2xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/70 text-sm text-[#071426] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSavedOnly((s) => !s)}
              aria-pressed={savedOnly}
              className={`min-h-[44px] px-4 rounded-2xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                savedOnly
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white dark:bg-[#0D213F] border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Bookmark className="h-4 w-4" aria-hidden="true" />
              <span>Saved ({savedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setCityFilter((c) => (c === 'all' ? 'my-city' : 'all'))}
              className={`min-h-[44px] px-4 rounded-2xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                cityFilter === 'my-city'
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'bg-white dark:bg-[#0D213F] border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200'
              }`}
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{cityFilter === 'my-city' ? cityLabel : 'All Regions'}</span>
            </button>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter facilities by category"
        >
          {CATEGORY_OPTIONS.map((opt) => {
            const active = category === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(opt.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white dark:bg-[#0D213F] border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:border-teal-500/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Directory List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-8 text-center">
          <MapPin className="h-8 w-8 text-slate-400 mx-auto" aria-hidden="true" />
          <h3 className="mt-3 text-base font-bold text-[#071426] dark:text-white">
            No matching verified facilities in local cache
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You can search live maps for {CATEGORY_OPTIONS.find((c) => c.id === category)?.label || 'emergency facilities'} in {cityLabel}, or add your own barangay location for offline access.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <a
              href={buildExternalMapUrl(
                category === 'all' ? 'Emergency Hospital Evacuation' : CATEGORY_OPTIONS.find((c) => c.id === category)?.label || 'SafeSpot'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-teal-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <span>Search Map for {cityLabel}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('all');
                setSavedOnly(false);
                setCityFilter('all');
              }}
              className="min-h-[44px] px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-600 text-xs font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((facility) => {
            const isSaved = savedSet.has(facility.id);
            return (
              <article
                key={facility.id}
                className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                        {CATEGORY_LABEL_MAP[facility.category]} · {facility.cityLabel}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-[#071426] dark:text-white">
                        {facility.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleSave(facility.id)}
                        aria-label={isSaved ? `Unsave ${facility.name}` : `Save ${facility.name}`}
                        aria-pressed={isSaved}
                        className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors ${
                          isSaved
                            ? 'bg-orange-500/15 text-orange-500'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>

                      {facility.isUserAdded && (
                        <button
                          type="button"
                          onClick={() => onDeleteFacility(facility.id)}
                          aria-label={`Remove ${facility.name}`}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {facility.address}
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Source: {facility.verifiedSource}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  {facility.phone && (
                    <button
                      type="button"
                      onClick={() => setCallTarget(facility)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="font-mono-num">{facility.phone}</span>
                    </button>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${facility.name}, ${facility.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#071426] hover:bg-slate-200 dark:hover:bg-slate-800 text-[#071426] dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5 text-teal-500" aria-hidden="true" />
                    <span>Directions</span>
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add Local SafeSpot Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040b16]/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-safespot-title"
        >
          <form
            onSubmit={handleSaveNewFacility}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/70 p-6 kalinga-card-3d space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2
                id="add-safespot-title"
                className="text-lg font-bold text-[#071426] dark:text-white"
              >
                Add Local SafeSpot
              </h2>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                aria-label="Close modal"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs font-medium text-red-500 bg-red-500/10 rounded-xl p-3">
                {formError}
              </p>
            )}

            <div>
              <label htmlFor="spot-name" className="block text-xs font-semibold mb-1">
                Facility Name
              </label>
              <input
                id="spot-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Barangay Covered Court Evacuation Center"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              />
            </div>

            <div>
              <label htmlFor="spot-category" className="block text-xs font-semibold mb-1">
                Category
              </label>
              <select
                id="spot-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as FacilityCategory)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              >
                {CATEGORY_OPTIONS.filter((o) => o.id !== 'all').map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="spot-address" className="block text-xs font-semibold mb-1">
                Address / Landmark
              </label>
              <input
                id="spot-address"
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Street, Barangay, City"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              />
            </div>

            <div>
              <label htmlFor="spot-phone" className="block text-xs font-semibold mb-1">
                Contact Number (optional)
              </label>
              <input
                id="spot-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="e.g., +63 2 8123 4567"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold"
              >
                Save SafeSpot
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(callTarget)}
        title={callTarget ? `Call ${callTarget.name}?` : ''}
        description={
          callTarget
            ? `This will open your phone dialer to call ${callTarget.phone}. Proceed only if you intend to contact this facility.`
            : ''
        }
        confirmLabel="Open Phone Dialer"
        tone="warning"
        onConfirm={() => {
          if (callTarget?.phone) {
            window.location.href = `tel:${formatPhoneForTel(callTarget.phone)}`;
          }
          setCallTarget(null);
        }}
        onCancel={() => setCallTarget(null)}
      />
    </div>
  );
};
