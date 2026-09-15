import React, { useState } from 'react';

import {
  useBenefitsPage,
} from '../hooks/useBenefits';

import type {
  Perk,
  PerkType,
  CreatePerkRequest,
  UpdatePerkRequest,
  AssignPerkRequest,
} from '@/store/api/benefitsSlice';

/* =========================================================
   TYPES
========================================================= */

type PerkStatus = 'Active' | 'Inactive';

type PerkFormProps = {
  perk: Perk | null;
  perkTypes: PerkType[];
  perkTypesLoading: boolean;
  onClose: () => void;
  onCreate: (data: CreatePerkRequest) => Promise<unknown>;
  onUpdate: (data: UpdatePerkRequest) => Promise<unknown>;
};

type AssignModalProps = {
  perk: Perk | null;
  onClose: () => void;
  onAssign: (data: AssignPerkRequest) => Promise<unknown>;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

/* =========================================================
   PAGE
========================================================= */

export default function RecreationalBenefits(): React.JSX.Element {
  const {
    /* Perks */
    perks,
    filteredPerks,

    /* Perk Types */
    perkTypes,
    perkTypesLoading,

    /* Search */
    search,
    setSearch,

    /* Perk Type Filter */
    activePerkType,
    setActivePerkType,

    /* Status */
    activeStatus,
    setActiveStatus,

    /* Forms */
    openPerkForm,
    closePerkForm,
    selectedPerk,
    showPerkForm,

    /* Actions */
    handleCreatePerk,
    handleUpdatePerk,
    handleDeletePerk,
    handleAssignPerk,

    /* Loading */
    perksLoading,
    isMutating,
  } = useBenefitsPage();

  /* =========================================================
     LOCAL UI STATE
  ========================================================= */

  const [showAssign, setShowAssign] = useState(false);

  const [assignPerk, setAssignPerk] =
    useState<Perk | null>(null);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalPerks = perks.length;

  const activePerks = perks.filter(
    (perk) => perk.is_active === true
  ).length;

  const employeesCovered = perks.reduce(
    (total, perk) =>
      total + getNumericValue(perk.assigned),
    0
  );

  /* =========================================================
     OPEN ASSIGN MODAL
  ========================================================= */

  const openAssignModal = (perk: Perk): void => {
    setAssignPerk(perk);
    setShowAssign(true);
  };

  /* =========================================================
     CLOSE ASSIGN MODAL
  ========================================================= */

  const closeAssignModal = (): void => {
    setShowAssign(false);
    setAssignPerk(null);
  };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const toggleStatus = async (
    perk: Perk
  ): Promise<void> => {
    await handleDeletePerk(perk.id);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Recreational Benefits
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage employee recreational benefits
          </p>
        </div>

        <button
          type="button"
          onClick={() => openPerkForm(null)}
          disabled={
            isMutating ||
            perkTypesLoading
          }
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add New Perk
        </button>

      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <Stat
          title="Total Perks"
          value={totalPerks}
          icon="🎁"
        />

        <Stat
          title="Active Perks"
          value={activePerks}
          icon="✓"
        />

        <Stat
          title="Employees Covered"
          value={employeesCovered}
          icon="👥"
        />

      </div>

      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <span className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search perks..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />

          </div>

          {/* PERK TYPE */}

          <select
            value={activePerkType}
            onChange={(event) =>
              setActivePerkType(event.target.value)
            }
            disabled={perkTypesLoading}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >

            <option value="All">
              {perkTypesLoading
                ? 'Loading Types...'
                : 'All Types'}
            </option>

            {!perkTypesLoading &&
              perkTypes.map((type) => (
                <option
                  key={getPrimitiveValue(type.id)}
                  value={String(getPrimitiveValue(type.id))}
                >
                  {displayValue(type.name)}
                </option>
              ))}

          </select>

          {/* STATUS */}

          <select
            value={activeStatus}
            onChange={(event) =>
              setActiveStatus(event.target.value)
            }
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </div>

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {perksLoading && (
        <div className="rounded-xl border bg-white p-10 text-center">

          <div className="text-sm text-gray-500">
            Loading perks...
          </div>

        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!perksLoading &&
        filteredPerks.length === 0 && (

          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

            <div className="text-4xl">
              🎁
            </div>

            <h3 className="mt-3 text-base font-semibold text-gray-900">
              No perks found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>

          </div>
        )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      {!perksLoading &&
        filteredPerks.length > 0 && (

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="border-b bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Perk
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Value
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Eligibility
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Assigned
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredPerks.map((perk) => (

                    <tr
                      key={getPrimitiveValue(perk.id)}
                      className="hover:bg-gray-50"
                    >

                      {/* =================================================
                          PERK
                      ================================================= */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                            {displayValue(perk.icon, '🎁')}
                          </div>

                          <div>

                            <p className="text-sm font-medium text-gray-900">
                              {displayValue(perk.name)}
                            </p>

                            <p className="max-w-sm truncate text-xs text-gray-500">
                              {displayValue(
                                perk.description,
                                'No description'
                              )}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* =================================================
                          TYPE
                      ================================================= */}

                      <td className="px-6 py-4 text-sm text-gray-600">

                        {getPerkTypeName(
                          perk,
                          perkTypes
                        )}

                      </td>

                      {/* =================================================
                          VALUE
                      ================================================= */}

                      <td className="px-6 py-4">

                        <p className="text-sm font-medium text-gray-900">
                          {formatAmount(perk.amount)}
                        </p>

                        <p className="text-xs text-gray-500">
                          {displayValue(
                            perk.frequency
                          )}
                        </p>

                      </td>

                      {/* =================================================
                          ELIGIBILITY
                      ================================================= */}

                      <td className="px-6 py-4">

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          {displayValue(
                            perk.eligibility,
                            'All Employees'
                          )}
                        </span>

                      </td>

                      {/* =================================================
                          ASSIGNED
                      ================================================= */}

                      <td className="px-6 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            openAssignModal(perk)
                          }
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {getNumericValue(
                            perk.assigned
                          )}
                          {' employees'}
                        </button>

                      </td>

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <td className="px-6 py-4">

                        <Status
                          status={
                            perk.is_active
                              ? 'Active'
                              : 'Inactive'
                          }
                        />

                      </td>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td className="px-6 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            openPerkForm(perk)
                          }
                          className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            toggleStatus(perk)
                          }
                          className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {perk.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* =====================================================
          PERK FORM
      ===================================================== */}

      {showPerkForm && (

        <PerkForm
          perk={selectedPerk}
          perkTypes={perkTypes}
          perkTypesLoading={perkTypesLoading}
          onClose={closePerkForm}
          onCreate={handleCreatePerk}
          onUpdate={handleUpdatePerk}
        />

      )}

      {/* =====================================================
          ASSIGN MODAL
      ===================================================== */}

      {showAssign && (

        <AssignModal
          perk={assignPerk}
          onClose={closeAssignModal}
          onAssign={handleAssignPerk}
        />

      )}

    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function Status({
  status,
}: {
  status: PerkStatus;
}): React.JSX.Element {
  const active = status === 'Active';

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   PERK FORM
========================================================= */

function PerkForm({
  perk,
  perkTypes,
  perkTypesLoading,
  onClose,
  onCreate,
  onUpdate,
}: PerkFormProps): React.JSX.Element {

  const [form, setForm] = useState({
    perk_type_id:
      getNumericValue(perk?.perk_type_id),

    name:
      displayValue(perk?.name, ''),

    description:
      displayValue(perk?.description, ''),

    amount:
      getNumericValue(perk?.amount) > 0
        ? String(getNumericValue(perk?.amount))
        : '',

    frequency:
      displayValue(
        perk?.frequency,
        'Monthly'
      ),

    eligibility:
      displayValue(
        perk?.eligibility,
        'All Employees'
      ),
  });

  const [error, setError] = useState('');

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const update = (
    field: string,
    value: string | number
  ): void => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError('');
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const submit = async (): Promise<void> => {

    if (!form.perk_type_id) {
      setError('Please select a perk type.');
      return;
    }

    if (!String(form.name).trim()) {
      setError('Please enter a perk name.');
      return;
    }

    if (perkTypes.length === 0) {
      setError(
        'No perk types are available. Please create a perk type first.'
      );
      return;
    }

    const data: CreatePerkRequest = {

      perk_type_id:
        Number(form.perk_type_id),

      name:
        String(form.name).trim(),

      description:
        String(form.description).trim(),

      amount:
        form.amount
          ? Number(form.amount)
          : null,

      frequency:
        String(form.frequency),

      eligibility:
        String(form.eligibility),

      is_active:
        perk?.is_active ?? true,
    };

    if (perk) {

      await onUpdate({
        id: perk.id,
        data,
      });

    } else {

      await onCreate(data);

    }
  };

  return (
    <Modal
      title={
        perk
          ? 'Edit Perk'
          : 'Add New Perk'
      }
      onClose={onClose}
    >

      <div className="space-y-5">

        {/* =================================================
            TYPE + NAME
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Field label="Perk Type">

            <select
              value={form.perk_type_id}
              onChange={(event) =>
                update(
                  'perk_type_id',
                  Number(event.target.value)
                )
              }
              disabled={perkTypesLoading}
              className="input disabled:cursor-not-allowed disabled:bg-gray-100"
            >

              <option value={0}>
                {perkTypesLoading
                  ? 'Loading perk types...'
                  : 'Select perk type'}
              </option>

              {!perkTypesLoading &&
                perkTypes.map((type) => (

                  <option
                    key={getPrimitiveValue(type.id)}
                    value={getPrimitiveValue(type.id)}
                  >
                    {displayValue(type.name)}
                  </option>

                ))}

            </select>

          </Field>

          <Field label="Perk Name">

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                update(
                  'name',
                  event.target.value
                )
              }
              placeholder="e.g. Food Delivery Allowance"
              className="input"
            />

          </Field>

        </div>

        {/* =================================================
            DATABASE TYPE ERROR
        ================================================= */}

        {!perkTypesLoading &&
          perkTypes.length === 0 && (

            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
              No perk types were found in the database.
              Please create a perk type before creating
              a perk.
            </div>

          )}

        {/* =================================================
            FORM ERROR
        ================================================= */}

        {error && (

          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>

        )}

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Field label="Description">

          <textarea
            value={form.description}
            onChange={(event) =>
              update(
                'description',
                event.target.value
              )
            }
            rows={3}
            className="input resize-none"
            placeholder="Describe the benefit..."
          />

        </Field>

        {/* =================================================
            AMOUNT + FREQUENCY
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Field label="Benefit Amount">

            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(event) =>
                update(
                  'amount',
                  event.target.value
                )
              }
              placeholder="1500"
              className="input"
            />

          </Field>

          <Field label="Frequency">

            <select
              value={form.frequency}
              onChange={(event) =>
                update(
                  'frequency',
                  event.target.value
                )
              }
              className="input"
            >

              <option value="Monthly">
                Monthly
              </option>

              <option value="Quarterly">
                Quarterly
              </option>

              <option value="Yearly">
                Yearly
              </option>

              <option value="One Time">
                One Time
              </option>

              <option value="Subscription">
                Subscription
              </option>

            </select>

          </Field>

        </div>

        {/* =================================================
            ELIGIBILITY
        ================================================= */}

        <Field label="Eligibility">

          <select
            value={form.eligibility}
            onChange={(event) =>
              update(
                'eligibility',
                event.target.value
              )
            }
            className="input"
          >

            <option value="All Employees">
              All Employees
            </option>

            <option value="Full Time">
              Full Time
            </option>

            <option value="Part Time">
              Part Time
            </option>

            <option value="Grade L3+">
              Grade L3+
            </option>

            <option value="Management">
              Management
            </option>

          </select>

        </Field>

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-6 flex justify-end gap-3 border-t pt-5">

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={
            isDisabled(
              perkTypesLoading,
              perkTypes.length
            )
          }
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {perk
            ? 'Update Perk'
            : 'Create Perk'}
        </button>

      </div>

    </Modal>
  );
}

/* =========================================================
   ASSIGN MODAL
========================================================= */

function AssignModal({
  perk,
  onClose,
  onAssign,
}: AssignModalProps): React.JSX.Element {

  const employees = [
    {
      id: 1,
      name: 'Rahul Sharma',
    },
    {
      id: 2,
      name: 'Priya Singh',
    },
    {
      id: 3,
      name: 'Amit Kumar',
    },
    {
      id: 4,
      name: 'Sneha Verma',
    },
  ];

  const [selectedEmployees, setSelectedEmployees] =
    useState<number[]>([]);

  const [validFrom, setValidFrom] =
    useState('');

  const [validUntil, setValidUntil] =
    useState('');

  /* =========================================================
     SUBMIT
  ========================================================= */

  const submit = async (): Promise<void> => {

    if (!perk) {
      return;
    }

    if (selectedEmployees.length === 0) {
      return;
    }

    for (const userId of selectedEmployees) {

      await onAssign({
        perkId: perk.id,
        user_id: userId,
        valid_from:
          validFrom || null,
        valid_until:
          validUntil || null,
      });

    }

    onClose();
  };

  /* =========================================================
     TOGGLE EMPLOYEE
  ========================================================= */

  const toggleEmployee = (
    employeeId: number
  ): void => {

    setSelectedEmployees((previous) => {

      if (previous.includes(employeeId)) {

        return previous.filter(
          (id) => id !== employeeId
        );

      }

      return [
        ...previous,
        employeeId,
      ];
    });
  };

  return (
    <Modal
      title={`Assign ${displayValue(
        perk?.name,
        'Perk'
      )}`}
      onClose={onClose}
    >

      <div className="space-y-5">

        {/* =================================================
            EMPLOYEES
        ================================================= */}

        <Field label="Select Employees">

          <div className="space-y-2 rounded-lg border p-3">

            {employees.map((employee) => (

              <label
                key={employee.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
              >

                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(
                    employee.id
                  )}
                  onChange={() =>
                    toggleEmployee(
                      employee.id
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />

                <span className="text-sm text-gray-700">
                  {employee.name}
                </span>

              </label>

            ))}

          </div>

        </Field>

        {/* =================================================
            VALIDITY
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <Field label="Valid From">

            <input
              type="date"
              value={validFrom}
              onChange={(event) =>
                setValidFrom(
                  event.target.value
                )
              }
              className="input"
            />

          </Field>

          <Field label="Valid Until">

            <input
              type="date"
              value={validUntil}
              onChange={(event) =>
                setValidUntil(
                  event.target.value
                )
              }
              className="input"
            />

          </Field>

        </div>

        {/* =================================================
            INFO
        ================================================= */}

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Selected employees will receive this
          benefit according to the configured
          eligibility and validity period.
        </div>

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-6 flex justify-end gap-3 border-t pt-5">

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={
            selectedEmployees.length === 0
          }
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Assign Perk
        </button>

      </div>

    </Modal>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}): React.JSX.Element {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure benefit information.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}: FieldProps): React.JSX.Element {

  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}

    </div>
  );
}

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

/**
 * Safely converts API values into something React
 * can render.
 *
 * Handles values such as:
 *
 * "Fitness"
 *
 * 1500
 *
 * { value: "Fitness" }
 *
 * { value: 1500 }
 */
function displayValue(
  value: unknown,
  fallback = '-'
): string {

  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  if (
    typeof value === 'object'
  ) {

    if (
      'value' in value
    ) {

      const nestedValue =
        (
          value as {
            value?: unknown;
          }
        ).value;

      if (
        nestedValue === null ||
        nestedValue === undefined
      ) {
        return fallback;
      }

      return String(
        nestedValue
      );
    }

    return fallback;
  }

  return String(value);
}

/**
 * Converts API values to a primitive ID.
 *
 * Handles:
 *
 * 1
 *
 * "1"
 *
 * { value: 1 }
 *
 * { value: "1" }
 */
function getPrimitiveValue(
  value: unknown
): string | number {

  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (
    typeof value === 'object' &&
    'value' in value
  ) {

    return getPrimitiveValue(
      (
        value as {
          value?: unknown;
        }
      ).value
    );
  }

  if (
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }

  return String(value);
}

/**
 * Converts API values to a number.
 *
 * Handles:
 *
 * 100
 *
 * "100"
 *
 * { value: 100 }
 *
 * { value: "100" }
 */
function getNumericValue(
  value: unknown
): number {

  const primitive =
    getPrimitiveValue(value);

  const number =
    Number(primitive);

  return Number.isNaN(number)
    ? 0
    : number;
}

/* =========================================================
   AMOUNT FORMATTER
========================================================= */

function formatAmount(
  amount?: unknown
): string {

  if (
    amount === null ||
    amount === undefined
  ) {
    return '-';
  }

  const numericAmount =
    getNumericValue(amount);

  if (
    numericAmount === 0 &&
    displayValue(amount, '') !== '0'
  ) {
    return '-';
  }

  return `₹${numericAmount.toLocaleString(
    'en-IN'
  )}`;
}

/* =========================================================
   PERK TYPE NAME
========================================================= */

function getPerkTypeName(
  perk: Perk,
  perkTypes: PerkType[]
): string {

  const perkTypeId =
    getPrimitiveValue(
      perk.perk_type_id
    );

  const type =
    perkTypes.find(
      (item) =>
        String(
          getPrimitiveValue(item.id)
        ) ===
        String(perkTypeId)
    );

  return displayValue(
    type?.name,
    '-'
  );
}

/* =========================================================
   DISABLED STATE
========================================================= */

function isDisabled(
  loading: boolean,
  typeCount: number
): boolean {

  return (
    loading ||
    typeCount === 0
  );
}
