export type NavTab = 'home' | 'ready-check' | 'safe-spots' | 'safety-guide' | 'profile';

export type SubView = 'none' | 'score' | 'circle';

export type ChecklistCategory = 'go-bag' | 'documents' | 'family-plan';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  kitPartId?: 'water' | 'food' | 'flashlight' | 'battery' | 'powerbank' | 'firstaid' | 'hygiene' | 'whistle' | 'documents' | 'cash' | 'clothing' | 'essentials' | 'plan';
  priority: 'essential' | 'recommended';
}

export interface PhilippineCity {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  drrmoHotline?: string;
}

export type HazardId =
  | 'earthquakes'
  | 'typhoons'
  | 'floods'
  | 'fires'
  | 'landslides'
  | 'power-outages';

export interface SafetyGuide {
  id: HazardId;
  title: string;
  subtitle: string;
  sourceAgency: string;
  imagePath: string;
  before: string[];
  during: string[];
  after: string[];
}

export type FacilityCategory =
  | 'evacuation'
  | 'hospital'
  | 'clinic'
  | 'fire'
  | 'police'
  | 'drrmo'
  | 'pharmacy';

export interface SafeSpotFacility {
  id: string;
  name: string;
  category: FacilityCategory;
  cityId: string;
  cityLabel: string;
  address: string;
  phone?: string;
  verifiedSource: string;
  isUserAdded?: boolean;
  notes?: string;
}

export type RelationshipType =
  | 'Spouse / Partner'
  | 'Parent'
  | 'Child'
  | 'Sibling'
  | 'Relative'
  | 'Neighbor'
  | 'Barangay Official'
  | 'Doctor / Medical'
  | 'Other';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: RelationshipType;
  phone: string;
  isPriority: boolean;
  notes?: string;
}

export type ReminderFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface ReminderSetting {
  id: 'supplies' | 'evacuation' | 'powerbank' | 'contacts';
  title: string;
  description: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  time: string;
  lastCompletedAt?: string;
}

export interface UserProfile {
  name: string;
  cityId: string;
  customCityName: string;
  householdSize: number;
  hasSeniorsOrChildren: boolean;
  hasPets: boolean;
  meetingPoint: string;
  theme: 'dark' | 'light';
  privacyOfflineOnly: boolean;
  offlineGuidesCached: boolean;
  onboardingComplete: boolean;
}

export interface CategoryProgress {
  category: ChecklistCategory;
  label: string;
  completed: number;
  total: number;
  percent: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  thresholdPercent: number;
  unlocked: boolean;
}

export interface PreparednessMetrics {
  overallPercent: number;
  checklistPercent: number;
  completedCount: number;
  totalCount: number;
  remainingCount: number;
  categoryProgress: CategoryProgress[];
  milestones: Milestone[];
  suggestedNextAction: {
    label: string;
    detail: string;
    targetTab: NavTab | 'circle';
    itemId?: string;
  };
}
