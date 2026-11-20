import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePreparednessMetrics,
  filterSafeSpots,
  formatPhoneForTel,
  sortContactsByPriority,
  validateContactInput,
} from './preparedness';
import { CHECKLIST_ITEMS, VERIFIED_SAFESPOTS } from '../data/kalingaData';
import type { EmergencyContact } from '../types/kalinga';

const sampleContact: EmergencyContact = {
  id: 'c1',
  name: 'Maria Santos',
  relationship: 'Parent',
  phone: '0917 123 4567',
  isPriority: true,
};

test('calculatePreparednessMetrics returns 0% checklist and 5% city baseline when empty', () => {
  const result = calculatePreparednessMetrics(CHECKLIST_ITEMS, [], [], {
    cityId: 'quezon-city',
    meetingPoint: '',
  });
  assert.equal(result.checklistPercent, 0);
  assert.equal(result.completedCount, 0);
  assert.equal(result.remainingCount, CHECKLIST_ITEMS.length);
  assert.equal(result.overallPercent, 5);
  assert.equal(result.suggestedNextAction.targetTab, 'circle');
});

test('calculatePreparednessMetrics reaches 100% when all items checked and contact added', () => {
  const allIds = CHECKLIST_ITEMS.map((i) => i.id);
  const result = calculatePreparednessMetrics(
    CHECKLIST_ITEMS,
    allIds,
    [sampleContact],
    { cityId: 'quezon-city', meetingPoint: 'Barangay Covered Court' }
  );
  assert.equal(result.checklistPercent, 100);
  assert.equal(result.overallPercent, 100);
  assert.equal(result.remainingCount, 0);
  assert.equal(result.milestones.every((m) => m.unlocked), true);
  assert.equal(result.suggestedNextAction.targetTab, 'safe-spots');
});

test('calculatePreparednessMetrics computes category progress accurately', () => {
  const firstFour = CHECKLIST_ITEMS.slice(0, 4).map((i) => i.id);
  const result = calculatePreparednessMetrics(
    CHECKLIST_ITEMS,
    firstFour,
    [sampleContact],
    { cityId: 'manila', meetingPoint: '' }
  );
  assert.equal(result.completedCount, 4);
  assert.equal(result.checklistPercent, 25);
  const goBag = result.categoryProgress.find((c) => c.category === 'go-bag');
  assert.ok(goBag);
  assert.equal(goBag.completed, 4);
});

test('filterSafeSpots filters by category, search query, and saved state', () => {
  const hospitals = filterSafeSpots(VERIFIED_SAFESPOTS, '', 'hospital', false, [], 'all');
  assert.ok(hospitals.length > 0);
  assert.equal(hospitals.every((h) => h.category === 'hospital'), true);

  const savedOnly = filterSafeSpots(
    VERIFIED_SAFESPOTS,
    '',
    'all',
    true,
    [VERIFIED_SAFESPOTS[0].id],
    'all'
  );
  assert.equal(savedOnly.length, 1);
  assert.equal(savedOnly[0].id, VERIFIED_SAFESPOTS[0].id);
});

test('sortContactsByPriority puts priority contacts first and sorts alphabetically', () => {
  const contacts: EmergencyContact[] = [
    { id: '1', name: 'Zed Cruz', relationship: 'Neighbor', phone: '09180001111', isPriority: false },
    { id: '2', name: 'Bea Reyes', relationship: 'Sibling', phone: '09180002222', isPriority: true },
    { id: '3', name: 'Ana Lim', relationship: 'Parent', phone: '09180003333', isPriority: true },
  ];
  const sorted = sortContactsByPriority(contacts);
  assert.deepEqual(
    sorted.map((c) => c.name),
    ['Ana Lim', 'Bea Reyes', 'Zed Cruz']
  );
});

test('validateContactInput rejects invalid inputs and formatPhoneForTel sanitizes numbers', () => {
  assert.equal(validateContactInput({ name: 'A', phone: '09171234567', relationship: 'Parent' }).valid, false);
  assert.equal(validateContactInput({ name: 'Ana', phone: '12', relationship: 'Parent' }).valid, false);
  assert.equal(validateContactInput({ name: 'Ana', phone: '0917 123-4567', relationship: 'Parent' }).valid, true);
  assert.equal(formatPhoneForTel('+63 (917) 123-4567'), '+639171234567');
});
