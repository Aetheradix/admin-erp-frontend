import React, { useMemo, useState } from 'react';

import { useBenefitsPage } from '../hooks/useBenefits';

import type { PerkType } from '@/store/api/benefitsSlice';

type PerkTypeStatus = 'Active' | 'Inactive';

type PerkTypeFormData = {
  name: string;
  description: string;
};

type TypeModalProps = {
  type: PerkType | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: PerkTypeFormData) => void;
};

export default function PerkTypes(): React.JSX.Element {
  const {
    perkTypes,
    perks,
    perkTypesLoading,
    perkTypesError,
    handleCreatePerkType,
    handleUpdatePerkType,
    isCreatingPerkType,
    isUpdatingPerkType,
    refetchPerkTypes,
  } = useBenefitsPage();

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);

  const [editing, setEditing] = useState<PerkType | null>(null);

  /* ============================================================
     SEARCH
  ============================================================ */

  const filteredTypes = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return perkTypes;
    }

    return perkTypes.filter((item) => item.name.toLowerCase().includes(searchValue));
  }, [perkTypes, search]);

  /* ============================================================
     GET PERK COUNT FOR TYPE
  ============================================================ */

  const getPerkCount = (perkTypeId: number): number => {
    return perks.filter((perk) => perk.perk_type_id === perkTypeId).length;
  };

  /* ============================================================
     SAVE
  ============================================================ */

  const save = async (data: PerkTypeFormData): Promise<void> => {
    try {
      if (editing) {
        await handleUpdatePerkType({
          id: editing.id,
          data: {
            name: data.name,
            description: data.description,
          },
        });

        setShowModal(false);
        setEditing(null);

        return;
      }

      await handleCreatePerkType({
        name: data.name,
        description: data.description,
        is_active: true,
      });

      setShowModal(false);
      setEditing(null);
    } catch (error) {
      console.error('Failed to save perk type:', error);
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (perkTypesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="text-sm font-medium text-gray-600">Loading perk types...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (perkTypesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
              ⚠️
            </div>

            <h2 className="text-lg font-semibold text-gray-900">Unable to load perk types</h2>

            <p className="mt-2 text-sm text-gray-500">
              Something went wrong while fetching perk types.
            </p>

            <button
              type="button"
              onClick={() => void refetchPerkTypes()}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Perk Types</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage categories used for recreational benefits
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          + Add Perk Type
        </button>
      </div>

      {/* Search */}

      <div className="mb-5 rounded-xl border bg-white p-4">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search perk types..."
            className="w-full rounded-lg border px-3 py-2.5 pl-10 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Empty State */}

      {filteredTypes.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl">
            🎁
          </div>

          <h3 className="text-lg font-semibold text-gray-900">No perk types found</h3>

          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Try changing your search.' : 'Create your first perk type to get started.'}
          </p>
        </div>
      ) : (
        /* Cards */

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTypes.map((type) => {
            const perkCount = getPerkCount(type.id);

            return (
              <div key={type.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl">
                    🎁
                  </div>

                  <Status status={type.is_active ? 'Active' : 'Inactive'} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-900">{type.name}</h3>

                <p className="mt-1 min-h-[40px] text-sm text-gray-500">
                  {type.description || 'No description provided.'}
                </p>

                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-gray-400">Available Perks</p>

                    <p className="mt-1 text-sm font-semibold">{perkCount}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(type);
                      setShowModal(true);
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}

      {showModal && (
        <TypeModal
          type={editing}
          isSaving={isCreatingPerkType || isUpdatingPerkType}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

/* ============================================================
   TYPE MODAL
============================================================ */

function TypeModal({ type, isSaving, onClose, onSave }: TypeModalProps): React.JSX.Element {
  const [name, setName] = useState(type?.name ?? '');

  const [description, setDescription] = useState(type?.description ?? '');

  const handleSave = (): void => {
    if (!name.trim() || isSaving) {
      return;
    }

    void onSave({
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">{type ? 'Edit Perk Type' : 'Add Perk Type'}</h2>

            <p className="mt-1 text-sm text-gray-500">Create a reusable category for benefits.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-xl text-gray-400 hover:text-gray-700 disabled:opacity-50">
            ×
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Type Name *</label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Wellness"
              disabled={isSaving}
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe this category..."
              disabled={isSaving}
              className="input resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border bg-white px-4 py-2.5 text-sm disabled:opacity-50">
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? 'Saving...' : type ? 'Update Type' : 'Create Type'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function Status({ status }: { status: PerkTypeStatus }): React.JSX.Element {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}>
      {status}
    </span>
  );
}
