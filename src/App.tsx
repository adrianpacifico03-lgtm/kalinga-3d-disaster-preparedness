import { useEffect, useMemo, useState } from 'react';
import {
  CHECKLIST_ITEMS,
  DEFAULT_EMERGENCY_CONTACTS,
  DEFAULT_REMINDERS,
  PHILIPPINE_CITIES,
} from './data/kalingaData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useWeatherAdvisory } from './hooks/useWeatherAdvisory';
import type {
  EmergencyContact,
  NavTab,
  ReminderSetting,
  SafeSpotFacility,
  SubView,
  UserProfile,
} from './types/kalinga';
import {
  calculatePreparednessMetrics,
  formatPhoneForTel,
} from './utils/preparedness';
import { OnboardingFlow } from './components/OnboardingFlow';
import { NavigationShell } from './components/NavigationShell';
import { HomeDashboard } from './components/HomeDashboard';
import { PreparednessScoreView } from './components/PreparednessScoreView';
import { ReadyCheckView } from './components/ReadyCheckView';
import { SafeSpotView } from './components/SafeSpotView';
import { SafetyGuideView } from './components/SafetyGuideView';
import { CircleOfSafetyView } from './components/CircleOfSafetyView';
import { NotificationsSheet } from './components/NotificationsSheet';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { ConfirmDialog } from './components/ConfirmDialog';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  cityId: 'quezon-city',
  customCityName: '',
  householdSize: 4,
  hasSeniorsOrChildren: false,
  hasPets: false,
  meetingPoint: '',
  theme: 'dark',
  privacyOfflineOnly: true,
  offlineGuidesCached: true,
  onboardingComplete: false,
};

export default function App() {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [profile, setProfile] = useLocalStorage<UserProfile>(
    'kalinga_profile_v1',
    DEFAULT_PROFILE
  );
  const [checkedIds, setCheckedIds] = useLocalStorage<string[]>(
    'kalinga_checklist_v1',
    []
  );
  const [contacts, setContacts] = useLocalStorage<EmergencyContact[]>(
    'kalinga_contacts_v1',
    DEFAULT_EMERGENCY_CONTACTS
  );
  const [userSafeSpots, setUserSafeSpots] = useLocalStorage<SafeSpotFacility[]>(
    'kalinga_user_safespots_v1',
    []
  );
  const [savedSpotIds, setSavedSpotIds] = useLocalStorage<string[]>(
    'kalinga_saved_spots_v1',
    ['ndrrmc-national', 'pnp-911']
  );
  const [reminders, setReminders] = useLocalStorage<ReminderSetting[]>(
    'kalinga_reminders_v1',
    DEFAULT_REMINDERS
  );

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [subView, setSubView] = useState<SubView>('none');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickCallConfirm, setQuickCallConfirm] = useState<EmergencyContact | null>(null);

  const isOnline = useOnlineStatus();

  const selectedCity = useMemo(
    () => PHILIPPINE_CITIES.find((c) => c.id === profile.cityId) || PHILIPPINE_CITIES[0],
    [profile.cityId]
  );

  const cityDisplayLabel = profile.customCityName.trim() || selectedCity.name;

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useWeatherAdvisory(selectedCity, isOnline);

  const metrics = useMemo(
    () =>
      calculatePreparednessMetrics(CHECKLIST_ITEMS, checkedIds, contacts, {
        cityId: profile.cityId,
        meetingPoint: profile.meetingPoint,
      }),
    [checkedIds, contacts, profile.cityId, profile.meetingPoint]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [profile.theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, subView]);

  const showOnboarding = !profile.onboardingComplete && !autostart;

  const handleToggleChecklistItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveContact = (contact: EmergencyContact) => {
    setContacts((prev) => {
      const exists = prev.some((c) => c.id === contact.id);
      if (exists) {
        return prev.map((c) => (c.id === contact.id ? contact : c));
      }
      return [...prev, contact];
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTogglePriority = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPriority: !c.isPriority } : c))
    );
  };

  const handleToggleSavedSpot = (id: string) => {
    setSavedSpotIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUpdateReminder = (
    id: ReminderSetting['id'],
    patch: Partial<ReminderSetting>
  ) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const handleClearAllData = () => {
    setProfile(DEFAULT_PROFILE);
    setCheckedIds([]);
    setContacts(DEFAULT_EMERGENCY_CONTACTS);
    setUserSafeSpots([]);
    setSavedSpotIds(['ndrrmc-national', 'pnp-911']);
    setReminders(DEFAULT_REMINDERS);
    setActiveTab('home');
    setSubView('none');
  };

  const enabledRemindersCount = reminders.filter((r) => r.enabled).length;

  if (showOnboarding) {
    return (
      <OnboardingFlow
        selectedCityId={profile.cityId}
        customCityName={profile.customCityName}
        onSelectCity={(cityId, customName) =>
          setProfile((p) => ({
            ...p,
            cityId,
            customCityName: customName ?? p.customCityName,
          }))
        }
        onComplete={(initialTab) => {
          setProfile((p) => ({ ...p, onboardingComplete: true }));
          setActiveTab(initialTab);
          setSubView('none');
        }}
      />
    );
  }

  return (
    <NavigationShell
      activeTab={activeTab}
      subView={subView}
      cityLabel={cityDisplayLabel}
      isOnline={isOnline}
      dueReminderCount={enabledRemindersCount}
      onSelectTab={(tab) => {
        setActiveTab(tab);
        setSubView('none');
      }}
      onOpenCircle={() => setSubView('circle')}
      onOpenNotifications={() => setNotificationsOpen(true)}
    >
      {subView === 'score' ? (
        <PreparednessScoreView
          metrics={metrics}
          onBack={() => setSubView('none')}
          onAction={(target) => {
            if (target === 'circle') {
              setSubView('circle');
            } else {
              setSubView('none');
              setActiveTab(target);
            }
          }}
        />
      ) : subView === 'circle' ? (
        <CircleOfSafetyView
          contacts={contacts}
          onSaveContact={handleSaveContact}
          onDeleteContact={handleDeleteContact}
          onTogglePriority={handleTogglePriority}
          onBack={() => setSubView('none')}
        />
      ) : activeTab === 'home' ? (
        <HomeDashboard
          profile={profile}
          city={selectedCity}
          metrics={metrics}
          contacts={contacts}
          weather={weather}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          onNavigateTab={(tab) => {
            setSubView('none');
            setActiveTab(tab);
          }}
          onOpenScoreDetail={() => setSubView('score')}
          onOpenCircle={() => setSubView('circle')}
          onRequestCall={(c) => setQuickCallConfirm(c)}
        />
      ) : activeTab === 'ready-check' ? (
        <ReadyCheckView
          checkedIds={checkedIds}
          metrics={metrics}
          onToggleItem={handleToggleChecklistItem}
          onResetAll={() => setCheckedIds([])}
        />
      ) : activeTab === 'safe-spots' ? (
        <SafeSpotView
          selectedCity={selectedCity}
          customCityName={profile.customCityName}
          userSafeSpots={userSafeSpots}
          savedIds={savedSpotIds}
          onToggleSave={handleToggleSavedSpot}
          onAddFacility={(f) => setUserSafeSpots((prev) => [f, ...prev])}
          onDeleteFacility={(id) => {
            setUserSafeSpots((prev) => prev.filter((f) => f.id !== id));
            setSavedSpotIds((prev) => prev.filter((x) => x !== id));
          }}
        />
      ) : activeTab === 'safety-guide' ? (
        <SafetyGuideView />
      ) : (
        <ProfileSettingsView
          profile={profile}
          enabledRemindersCount={enabledRemindersCount}
          onUpdateProfile={(patch) => setProfile((p) => ({ ...p, ...patch }))}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onReplayOnboarding={() =>
            setProfile((p) => ({ ...p, onboardingComplete: false }))
          }
          onClearAllLocalData={handleClearAllData}
        />
      )}

      <NotificationsSheet
        open={notificationsOpen}
        reminders={reminders}
        onUpdateReminder={handleUpdateReminder}
        onDisableAll={() =>
          setReminders((prev) => prev.map((r) => ({ ...r, enabled: false })))
        }
        onClose={() => setNotificationsOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(quickCallConfirm)}
        title={
          quickCallConfirm
            ? `Confirm call to ${quickCallConfirm.name}?`
            : ''
        }
        description={
          quickCallConfirm
            ? `This will open your phone dialer to call ${quickCallConfirm.name} (${quickCallConfirm.phone}). Proceed only if you intend to place this emergency call.`
            : ''
        }
        confirmLabel="Call Now"
        tone="warning"
        onConfirm={() => {
          if (quickCallConfirm) {
            window.location.href = `tel:${formatPhoneForTel(quickCallConfirm.phone)}`;
          }
          setQuickCallConfirm(null);
        }}
        onCancel={() => setQuickCallConfirm(null)}
      />
    </NavigationShell>
  );
}
