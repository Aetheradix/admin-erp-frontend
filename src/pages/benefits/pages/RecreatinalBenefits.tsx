import React, { useState } from 'react';

import { useBenefitsPage } from '../hooks/useBenefits';

import type {
  Perk,
  PerkType,
  CreatePerkRequest,
  UpdatePerkRequest,
  AssignPerkRequest,
} from '../types/perks.types';

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
    perks,
    filteredPerks,
    perkTypes,
    perkTypesLoading,
    search,
    setSearch,
    activePerkType,
    setActivePerkType,
    activeStatus,
    setActiveStatus,
    openPerkForm,
    closePerkForm,
    selectedPerk,
    showPerkForm,
    handleCreatePerk,
    handleUpdatePerk,
    handleAssignPerk,
    perksLoading,
    isMutating,
  } = useBenefitsPage();

  const [showAssign, setShowAssign] = useState(false);
  const [assignPerk, setAssignPerk] = useState<Perk | null>(null);

  /* STATISTICS */
  const totalPerks = perks.length;
  // Fixed: Map to SQL `status` field instead of `is_active`
  const activePerks = perks.filter((perk) => perk.status === 'Active').length;
  const employeesCovered = perks.reduce((total, perk) => total + getNumericValue(perk.assigned), 0);

  const openAssignModal = (perk: Perk): void => {
    setAssignPerk(perk);
    setShowAssign(true);
  };

  const closeAssignModal = (): void => {
    setShowAssign(false);
    setAssignPerk(null);
  };

  const toggleStatus = async (perk: Perk): Promise<void> => {
    const nextStatus: PerkStatus = perk.status === 'Active' ? 'Inactive' : 'Active';
    await handleUpdatePerk({
      id: perk.id,
      data: { status: nextStatus },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recreational Benefits</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage employee recreational benefits
          </p>
        </div>

        <button
          type="button"
          onClick={() => openPerkForm(null)}
          disabled={isMutating || perkTypesLoading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add New Perk
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat title="Total Perks" value={totalPerks} icon="🎁" />
        <Stat title="Active Perks" value={activePerks} icon="✓" />
        <Stat title="Employees Covered" value={employeesCovered} icon="👥" />
      </div>

      {/* SEARCH / FILTER */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search perks..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={activePerkType}
            onChange={(event) => setActivePerkType(event.target.value)}
            disabled={perkTypesLoading}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="All">{perkTypesLoading ? 'Loading Types...' : 'All Types'}</option>
            {!perkTypesLoading &&
              perkTypes.map((type) => (
                <option key={getPrimitiveValue(type.id)} value={String(getPrimitiveValue(type.id))}>
                  {displayValue(type.name)}
                </option>
              ))}
          </select>

          <select
            value={activeStatus}
            onChange={(event) => setActiveStatus(event.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {perksLoading && (
        <div className="rounded-xl border bg-white p-10 text-center">
          <div className="text-sm text-gray-500">Loading perks...</div>
        </div>
      )}

      {!perksLoading && filteredPerks.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <div className="text-4xl">🎁</div>
          <h3 className="mt-3 text-base font-semibold text-gray-900">No perks found</h3>
          <p className="mt-1 text-sm text-gray-500">Try changing your search or filter.</p>
        </div>
      )}

      {!perksLoading && filteredPerks.length > 0 && (
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
                  <tr key={getPrimitiveValue(perk.id)} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                          🎁
                        </div>
                        <div>
                          {/* Fixed: Maps to perk.title */}
                          <p className="text-sm font-medium text-gray-900">
                            {displayValue(perk.title)}
                          </p>
                          <p className="max-w-sm truncate text-xs text-gray-500">
                            {displayValue(perk.description, 'No description')}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getPerkTypeName(perk, perkTypes)}
                    </td>

                    {/* Fixed: Maps to perk.value & perk.usage_period */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(perk.value, perk.currency ?? undefined)}
                      </p>
                      <p className="text-xs text-gray-500">{displayValue(perk.usage_period)}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                        {parseEligibility(perk.eligibility)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openAssignModal(perk)}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {getNumericValue(perk.assigned)} employees
                      </button>
                    </td>

                    {/* Fixed: Passes perk.status directly */}
                    <td className="px-6 py-4">
                      <Status status={perk.status ?? 'Active'} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openPerkForm(perk)}
                        className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => toggleStatus(perk)}
                        className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {perk.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
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

      {/* ASSIGN MODAL */}
      {showAssign && (
        <AssignModal perk={assignPerk} onClose={closeAssignModal} onAssign={handleAssignPerk} />
      )}
    </div>
  );
}

/* =========================================================
   COMPONENTS & HELPERS
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
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Status({ status }: { status: PerkStatus }): React.JSX.Element {
  const active = status === 'Active';
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   PERK FORM (SCHEMA-ALIGNED)
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
    perk_type_id: getNumericValue(perk?.perk_type_id),
    title: displayValue(perk?.title, ''),
    description: displayValue(perk?.description, ''),
    value: getNumericValue(perk?.value) > 0 ? String(getNumericValue(perk?.value)) : '',
    value_type: displayValue(perk?.value_type, 'fixed'),
    currency: displayValue(perk?.currency, 'INR'),
    usage_limit: perk?.usage_limit ? String(perk.usage_limit) : '',
    usage_period: displayValue(perk?.usage_period, 'monthly'),
    eligibility_type: parseEligibility(perk?.eligibility),
    valid_from: displayValue(perk?.valid_from, ''),
    valid_until: displayValue(perk?.valid_until, ''),
    status: perk?.status ?? 'Active',
  });

  const [error, setError] = useState('');

  const update = (field: string, value: unknown): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError('');
  };

  const submit = async (): Promise<void> => {
    if (!form.perk_type_id) {
      setError('Please select a perk type.');
      return;
    }

    if (!String(form.title).trim()) {
      setError('Please enter a perk title.');
      return;
    }

    // Construct request matching SQL columns
    const data: CreatePerkRequest = {
      perk_type_id: Number(form.perk_type_id),
      title: String(form.title).trim(),
      description: String(form.description).trim() || null,
      value: form.value ? Number(form.value) : null,
      value_type: form.value_type,
      currency: form.currency,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      usage_period: form.usage_period,
      eligibility: JSON.stringify({ role: form.eligibility_type }),
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      status: form.status as PerkStatus,
    };

    if (perk) {
      await onUpdate({ id: perk.id, data });
    } else {
      await onCreate(data);
    }
  };

  return (
    <Modal title={perk ? 'Edit Perk' : 'Add New Perk'} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Perk Type">
            <select
              value={form.perk_type_id}
              onChange={(e) => update('perk_type_id', Number(e.target.value))}
              disabled={perkTypesLoading}
              className="input disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value={0}>
                {perkTypesLoading ? 'Loading perk types...' : 'Select perk type'}
              </option>
              {!perkTypesLoading &&
                perkTypes.map((type) => (
                  <option key={getPrimitiveValue(type.id)} value={getPrimitiveValue(type.id)}>
                    {displayValue(type.name)}
                  </option>
                ))}
            </select>
          </Field>

          <Field label="Perk Title">
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Food Delivery Allowance"
              className="input"
            />
          </Field>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="Describe the benefit..."
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Value">
            <input
              type="number"
              min="0"
              value={form.value}
              onChange={(e) => update('value', e.target.value)}
              placeholder="1500"
              className="input"
            />
          </Field>

          <Field label="Value Type">
            <select
              value={form.value_type}
              onChange={(e) => update('value_type', e.target.value)}
              className="input"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
              <option value="freebie">Freebie / Item</option>
            </select>
          </Field>

          <Field label="Currency">
            <input
              type="text"
              value={form.currency}
              onChange={(e) => update('currency', e.target.value)}
              className="input"
              placeholder="INR"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Usage Period">
            <select
              value={form.usage_period}
              onChange={(e) => update('usage_period', e.target.value)}
              className="input"
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </Field>

          <Field label="Usage Limit (Per User)">
            <input
              type="number"
              value={form.usage_limit}
              onChange={(e) => update('usage_limit', e.target.value)}
              placeholder="Unlimited if empty"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Valid From">
            <input
              type="date"
              value={form.valid_from}
              onChange={(e) => update('valid_from', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Valid Until">
            <input
              type="date"
              value={form.valid_until}
              onChange={(e) => update('valid_until', e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value as PerkStatus)}
            className="input"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>
      </div>

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
          disabled={isDisabled(perkTypesLoading, perkTypes.length)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {perk ? 'Update Perk' : 'Create Perk'}
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   ASSIGN MODAL
========================================================= */

function AssignModal({ perk, onClose, onAssign }: AssignModalProps): React.JSX.Element {
  const employees = [
    { id: 1, name: 'Rahul Sharma' },
    { id: 2, name: 'Priya Singh' },
    { id: 3, name: 'Amit Kumar' },
    { id: 4, name: 'Sneha Verma' },
  ];

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const submit = async (): Promise<void> => {
    if (!perk || selectedEmployees.length === 0) return;

    for (const userId of selectedEmployees) {
      await onAssign({
        perkId: perk.id,
        user_id: userId,
        valid_from: validFrom || null,
        valid_until: validUntil || null,
      });
    }
    onClose();
  };

  const toggleEmployee = (employeeId: number): void => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]
    );
  };

  return (
    <Modal title={`Assign ${displayValue(perk?.title, 'Perk')}`} onClose={onClose}>
      <div className="space-y-5">
        <Field label="Select Employees">
          <div className="space-y-2 rounded-lg border p-3">
            {employees.map((employee) => (
              <label
                key={employee.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">{employee.name}</span>
              </label>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Valid From">
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Valid Until">
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </div>

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
          disabled={selectedEmployees.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Assign Perk
        </button>
      </div>
    </Modal>
  );
}

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
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">Configure benefit information.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: FieldProps): React.JSX.Element {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

/* =========================================================
   UTILITIES
========================================================= */

function parseEligibility(eligibility: unknown): string {
  if (!eligibility) return 'All Employees';
  if (typeof eligibility === 'string') {
    try {
      const parsed = JSON.parse(eligibility);
      return parsed.role || 'All Employees';
    } catch {
      return eligibility;
    }
  }
  if (typeof eligibility === 'object' && 'role' in eligibility) {
    return String((eligibility as { role?: string }).role || 'All Employees');
  }
  return 'All Employees';
}

function displayValue(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object' && 'value' in value) {
    const val = (value as { value?: unknown }).value;
    return val !== null && val !== undefined ? String(val) : fallback;
  }
  return String(value);
}

function getPrimitiveValue(value: unknown): string | number {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && 'value' in value) {
    return getPrimitiveValue((value as { value?: unknown }).value);
  }
  return typeof value === 'number' || typeof value === 'string' ? value : String(value);
}

function getNumericValue(value: unknown): number {
  const primitive = getPrimitiveValue(value);
  const num = Number(primitive);
  return Number.isNaN(num) ? 0 : num;
}

function formatAmount(amount?: unknown, currency = 'INR'): string {
  if (amount === null || amount === undefined) return '-';
  const numericAmount = getNumericValue(amount);
  if (numericAmount === 0 && displayValue(amount, '') !== '0') return '-';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${numericAmount.toLocaleString('en-IN')}`;
}

function getPerkTypeName(perk: Perk, perkTypes: PerkType[]): string {
  const perkTypeId = getPrimitiveValue(perk.perk_type_id);
  const type = perkTypes.find((item) => String(getPrimitiveValue(item.id)) === String(perkTypeId));
  return displayValue(type?.name, '-');
}

function isDisabled(loading: boolean, typeCount: number): boolean {
  return loading || typeCount === 0;
}
