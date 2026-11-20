import type {
  CategoryProgress,
  ChecklistCategory,
  ChecklistItem,
  EmergencyContact,
  FacilityCategory,
  Milestone,
  PreparednessMetrics,
  SafeSpotFacility,
  UserProfile,
} from '../types/kalinga';

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  'go-bag': 'Go-Bag Essentials',
  documents: 'Documents & Finance',
  'family-plan': 'Family & Evacuation Plan',
};

export function calculatePreparednessMetrics(
  items: ChecklistItem[],
  checkedIds: string[],
  contacts: EmergencyContact[],
  profile: Pick<UserProfile, 'cityId' | 'meetingPoint'>
): PreparednessMetrics {
  const checkedSet = new Set(checkedIds);
  const totalCount = items.length;
  const completedCount = items.filter((item) => checkedSet.has(item.id)).length;
  const remainingCount = Math.max(0, totalCount - completedCount);

  const checklistPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Overall readiness combines checklist completion (85%) + Circle of Safety contact setup (10%) + Location/Meeting setup (5%)
  const hasContact = contacts.length > 0;
  const hasCity = Boolean(profile.cityId);
  const overallPercent = Math.min(
    100,
    Math.round(
      checklistPercent * 0.85 +
        (hasContact ? 10 : 0) +
        (hasCity ? 5 : 0)
    )
  );

  const categories: ChecklistCategory[] = ['go-bag', 'documents', 'family-plan'];
  const categoryProgress: CategoryProgress[] = categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    const catDone = catItems.filter((i) => checkedSet.has(i.id)).length;
    const catTotal = catItems.length;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      completed: catDone,
      total: catTotal,
      percent: catTotal === 0 ? 0 : Math.round((catDone / catTotal) * 100),
    };
  });

  const milestones: Milestone[] = [
    {
      id: 'first-step',
      title: 'First Step Ready',
      description: 'Complete at least 25% of your emergency preparedness items.',
      thresholdPercent: 25,
      unlocked: checklistPercent >= 25,
    },
    {
      id: 'halfway-resilient',
      title: 'Halfway Resilient',
      description: 'Reach 50% completion across your household survival checklist.',
      thresholdPercent: 50,
      unlocked: checklistPercent >= 50,
    },
    {
      id: '72-hour-ready',
      title: '72-Hour Go-Bag Ready',
      description: 'Reach 75% checklist readiness for multi-day self-reliance.',
      thresholdPercent: 75,
      unlocked: checklistPercent >= 75,
    },
    {
      id: 'prepared-together',
      title: 'Prepared Together',
      description: 'Complete 100% of checklist items and add a Circle of Safety contact.',
      thresholdPercent: 100,
      unlocked: checklistPercent === 100 && hasContact,
    },
  ];

  const firstUnchecked = items.find((i) => !checkedSet.has(i.id));
  let suggestedNextAction: PreparednessMetrics['suggestedNextAction'];

  if (!hasContact) {
    suggestedNextAction = {
      label: 'Add an Emergency Contact',
      detail: 'Set up at least one trusted person in your Circle of Safety.',
      targetTab: 'circle',
    };
  } else if (firstUnchecked) {
    suggestedNextAction = {
      label: `Pack: ${firstUnchecked.title}`,
      detail: firstUnchecked.description,
      targetTab: 'ready-check',
      itemId: firstUnchecked.id,
    };
  } else {
    suggestedNextAction = {
      label: 'Review Local Safe Spots',
      detail: 'All checklist items are packed. Verify evacuation centers near your city.',
      targetTab: 'safe-spots',
    };
  }

  return {
    overallPercent,
    checklistPercent,
    completedCount,
    totalCount,
    remainingCount,
    categoryProgress,
    milestones,
    suggestedNextAction,
  };
}

export function filterSafeSpots(
  facilities: SafeSpotFacility[],
  query: string,
  category: FacilityCategory | 'all',
  savedOnly: boolean,
  savedIds: string[],
  cityFilterId: string | 'all'
): SafeSpotFacility[] {
  const q = query.trim().toLowerCase();
  const savedSet = new Set(savedIds);

  return facilities.filter((f) => {
    if (savedOnly && !savedSet.has(f.id)) return false;
    if (category !== 'all' && f.category !== category) return false;
    if (cityFilterId !== 'all' && f.cityId !== 'national' && f.cityId !== cityFilterId) {
      return false;
    }
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.cityLabel.toLowerCase().includes(q) ||
      f.address.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });
}

export function sortContactsByPriority(contacts: EmergencyContact[]): EmergencyContact[] {
  return [...contacts].sort((a, b) => {
    if (a.isPriority !== b.isPriority) {
      return a.isPriority ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function validateContactInput(input: {
  name: string;
  phone: string;
  relationship: string;
}): { valid: boolean; error?: string } {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (name.length < 2) {
    return { valid: false, error: 'Please enter a contact name (at least 2 characters).' };
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 3) {
    return { valid: false, error: 'Please enter a valid phone number or emergency hotline.' };
  }
  if (!input.relationship.trim()) {
    return { valid: false, error: 'Please choose a relationship.' };
  }
  return { valid: true };
}

export function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}
