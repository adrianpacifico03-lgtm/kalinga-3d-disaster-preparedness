import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  PhoneCall,
  Plus,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { EmergencyContact, RelationshipType } from '../types/kalinga';
import {
  formatPhoneForTel,
  sortContactsByPriority,
  validateContactInput,
} from '../utils/preparedness';
import { ConfirmDialog } from './ConfirmDialog';

interface CircleOfSafetyViewProps {
  contacts: EmergencyContact[];
  onSaveContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  onTogglePriority: (id: string) => void;
  onBack: () => void;
}

const RELATIONSHIPS: RelationshipType[] = [
  'Spouse / Partner',
  'Parent',
  'Child',
  'Sibling',
  'Relative',
  'Neighbor',
  'Barangay Official',
  'Doctor / Medical',
  'Other',
];

export const CircleOfSafetyView: React.FC<CircleOfSafetyViewProps> = ({
  contacts,
  onSaveContact,
  onDeleteContact,
  onTogglePriority,
  onBack,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Parent');
  const [phone, setPhone] = useState('');
  const [isPriority, setIsPriority] = useState(true);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [callConfirmContact, setCallConfirmContact] = useState<EmergencyContact | null>(null);
  const [deleteConfirmContact, setDeleteConfirmContact] = useState<EmergencyContact | null>(null);

  const sortedContacts = sortContactsByPriority(contacts);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setRelationship('Parent');
    setPhone('');
    setIsPriority(true);
    setNotes('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setIsPriority(contact.isPriority);
    setNotes(contact.notes || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateContactInput({ name, phone, relationship });
    if (!check.valid) {
      setFormError(check.error || 'Please check contact details.');
      return;
    }

    onSaveContact({
      id: editingId || `contact-${Date.now()}`,
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      isPriority,
      notes: notes.trim() || undefined,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <h1 className="text-2xl font-extrabold text-[#071426] dark:text-white">
              Circle of Safety
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage trusted emergency contacts · Confirmation required before dialing
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="self-start sm:self-auto min-h-[44px] px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 kalinga-btn-orange-3d whitespace-nowrap"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Contact</span>
        </button>
      </div>

      {sortedContacts.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-8 text-center kalinga-card-3d">
          <Users className="h-9 w-9 text-orange-500 mx-auto" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-[#071426] dark:text-white">
            Your Circle of Safety is empty
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add family members, neighbors, or barangay emergency numbers so they remain accessible offline.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 min-h-[44px] px-5 py-2.5 rounded-2xl bg-teal-600 text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add First Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedContacts.map((contact) => (
            <article
              key={contact.id}
              className="rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/60 p-5 kalinga-card-3d flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {contact.relationship}
                      {contact.isPriority ? ' · Priority Contact' : ''}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-[#071426] dark:text-white truncate">
                      {contact.name}
                    </h2>
                    <p className="mt-1 text-sm font-mono-num font-semibold text-slate-700 dark:text-slate-200">
                      {contact.phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTogglePriority(contact.id)}
                    aria-label={
                      contact.isPriority
                        ? `Unmark ${contact.name} as priority`
                        : `Mark ${contact.name} as priority`
                    }
                    className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors ${
                      contact.isPriority
                        ? 'bg-orange-500/15 text-orange-500'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Star
                      className={`h-5 w-5 ${contact.isPriority ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {contact.notes && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {contact.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setCallConfirmContact(contact)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold inline-flex items-center gap-2 kalinga-btn-orange-3d transition-colors"
                >
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  <span>Call {contact.name}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(contact)}
                    aria-label={`Edit ${contact.name}`}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmContact(contact)}
                    aria-label={`Delete ${contact.name}`}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#040b16]/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0D213F] border border-slate-200 dark:border-slate-700/70 p-6 kalinga-card-3d space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2
                id="contact-modal-title"
                className="text-lg font-bold text-[#071426] dark:text-white"
              >
                {editingId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close contact form"
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
              <label htmlFor="contact-name" className="block text-xs font-semibold mb-1">
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Maria Santos"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="contact-rel" className="block text-xs font-semibold mb-1">
                  Relationship
                </label>
                <select
                  id="contact-rel"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contact-phone" className="block text-xs font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917 123 4567"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm font-mono-num"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-notes" className="block text-xs font-semibold mb-1">
                Notes (optional)
              </label>
              <input
                id="contact-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Lives two blocks away, blood type O+"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#071426] border border-slate-300 dark:border-slate-700 text-sm"
              />
            </div>

            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                className="h-5 w-5 accent-orange-500 rounded"
              />
              <span className="text-sm font-medium text-[#071426] dark:text-slate-200">
                Mark as priority contact (pins to Home Dashboard)
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold"
              >
                {editingId ? 'Save Changes' : 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mandatory Confirmation Before Emergency Call */}
      <ConfirmDialog
        open={Boolean(callConfirmContact)}
        title={
          callConfirmContact
            ? `Confirm call to ${callConfirmContact.name}?`
            : ''
        }
        description={
          callConfirmContact
            ? `You are about to open your phone dialer to call ${callConfirmContact.name} (${callConfirmContact.phone}). Confirm to place this call.`
            : ''
        }
        confirmLabel="Call Now"
        tone="warning"
        onConfirm={() => {
          if (callConfirmContact) {
            window.location.href = `tel:${formatPhoneForTel(callConfirmContact.phone)}`;
          }
          setCallConfirmContact(null);
        }}
        onCancel={() => setCallConfirmContact(null)}
      />

      {/* Delete Contact Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteConfirmContact)}
        title={
          deleteConfirmContact
            ? `Remove ${deleteConfirmContact.name}?`
            : ''
        }
        description="This contact will be removed from your Circle of Safety on this device."
        confirmLabel="Remove Contact"
        tone="danger"
        onConfirm={() => {
          if (deleteConfirmContact) {
            onDeleteContact(deleteConfirmContact.id);
          }
          setDeleteConfirmContact(null);
        }}
        onCancel={() => setDeleteConfirmContact(null)}
      />
    </div>
  );
};
