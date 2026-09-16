import React, { useState } from 'react';

import { useBenefitsPage } from '../hooks/useBenefits';

type MyPerkStatus = 'Active' | 'Expired';

type MyPerk = {
  id: number;
  title: string;
  type: string;
  description: string;
  value: string;
  frequency: string;
  used: number | null;
  remaining: number | null;
  limit: number | null;
  validFrom: string;
  validUntil: string;
  icon: string;
  status: MyPerkStatus;
};

type PerkCardProps = {
  perk: MyPerk;
  onView: () => void;
};

export default function MyPerks(): React.JSX.Element {
  const [selected, setSelected] = useState<MyPerk | null>(null);

  const {
    filteredUserPerks,
    userPerksLoading,
    userPerksFetching,
    userPerksError,
    refetchUserPerks,
  } = useBenefitsPage();

  /* ============================================================
     MAP DATABASE DATA TO UI DATA
  ============================================================ */

  const myPerks: MyPerk[] = filteredUserPerks.map((userPerk: any) => {
    const validUntil = userPerk.valid_until ? new Date(userPerk.valid_until) : null;

    const isExpired = validUntil !== null && validUntil.getTime() < Date.now();

    const perk = userPerk.perk || {};

    const limit = userPerk.limit ?? perk.limit ?? null;

    const used = userPerk.used ?? perk.used ?? null;

    const remaining =
      userPerk.remaining ??
      perk.remaining ??
      (limit !== null && used !== null ? Math.max(limit - used, 0) : null);

    return {
      id: Number(userPerk.id),

      title: userPerk.title || userPerk.name || perk.title || perk.name || 'Benefit',

      type: userPerk.type || perk.type || perk.perk_type?.name || 'Benefit',

      description: userPerk.description || perk.description || 'Company provided employee benefit.',

      value: userPerk.value || perk.value || perk.amount || 'Available',

      frequency: userPerk.frequency || perk.frequency || 'As applicable',

      used,

      remaining,

      limit,

      validFrom: formatDate(userPerk.valid_from),

      validUntil: formatDate(userPerk.valid_until),

      icon: userPerk.icon || perk.icon || '🎁',

      status: isExpired ? 'Expired' : 'Active',
    };
  });

  /* ============================================================
     LOADING
  ============================================================ */

  if (userPerksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="text-sm font-medium text-gray-600">Loading your perks...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (userPerksError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
              ⚠️
            </div>

            <h2 className="text-lg font-semibold text-gray-900">Unable to load your perks</h2>

            <p className="mt-2 text-sm text-gray-500">
              Something went wrong while fetching your benefits.
            </p>

            <button
              type="button"
              onClick={() => refetchUserPerks()}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
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
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Perks</h1>

            <p className="mt-1 text-sm text-gray-500">
              Benefits and recreational perks available to you
            </p>
          </div>

          {userPerksFetching && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              Updating...
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100">Your Employee Benefits</p>

            <h2 className="mt-1 text-xl font-semibold">Enjoy your perks 🎉</h2>

            <p className="mt-2 max-w-xl text-sm text-blue-100">
              Explore the recreational benefits provided by your company and make the most of them.
            </p>
          </div>

          <div className="hidden text-6xl md:block">🎁</div>
        </div>
      </div>

      {/* Empty State */}
      {myPerks.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            🎁
          </div>

          <h3 className="text-lg font-semibold text-gray-900">No perks assigned</h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            You currently don't have any employee benefits or recreational perks assigned to you.
          </p>
        </div>
      ) : (
        /* Perks */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {myPerks.map((perk) => (
            <PerkCard key={perk.id} perk={perk} onView={() => setSelected(perk)} />
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selected && <PerkDetails perk={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ================================
   Perk Card
================================ */

function PerkCard({ perk, onView }: PerkCardProps): React.JSX.Element {
  const percentage =
    perk.limit !== null && perk.used !== null && perk.limit > 0
      ? Math.min(Math.round((perk.used / perk.limit) * 100), 100)
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              {perk.icon}
            </div>

            <div>
              <p className="text-xs text-gray-400">{perk.type}</p>

              <h3 className="mt-0.5 font-semibold text-gray-900">{perk.title}</h3>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              perk.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {perk.status}
          </span>
        </div>

        <p className="mt-4 text-sm leading-5 text-gray-500">{perk.description}</p>

        {/* Benefit */}
        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400">Benefit</p>

          <p className="mt-1 text-lg font-semibold text-gray-900">{perk.value}</p>

          <p className="text-xs text-gray-500">{perk.frequency}</p>
        </div>

        {/* Usage */}
        {percentage !== null && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between">
              <span className="text-xs text-gray-500">Usage</span>

              <span className="text-xs font-medium text-gray-700">{percentage}% used</span>
            </div>

            <div className="h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs">
              <span className="text-gray-500">Used ₹{perk.used}</span>

              <span className="font-medium text-green-600">₹{perk.remaining} remaining</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-4">
        <div className="mb-3 flex justify-between">
          <span className="text-xs text-gray-400">Valid until</span>

          <span className="text-xs font-medium text-gray-700">{perk.validUntil}</span>
        </div>

        <button
          type="button"
          onClick={onView}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

/* ================================
   Details Modal
================================ */

function PerkDetails({ perk, onClose }: { perk: MyPerk; onClose: () => void }): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              {perk.icon}
            </div>

            <div>
              <p className="text-xs text-gray-400">{perk.type}</p>

              <h2 className="font-semibold text-gray-900">{perk.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          <div>
            <p className="text-sm font-medium text-gray-900">About this benefit</p>

            <p className="mt-2 text-sm leading-6 text-gray-500">{perk.description}</p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs text-blue-600">Benefit Value</p>

            <p className="mt-1 text-xl font-semibold text-gray-900">{perk.value}</p>

            <p className="text-xs text-gray-500">{perk.frequency}</p>
          </div>

          {perk.limit !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-400">Used</p>

                <p className="mt-1 font-semibold">₹{perk.used}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-gray-400">Remaining</p>

                <p className="mt-1 font-semibold text-green-600">₹{perk.remaining}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Valid From</p>

              <p className="mt-1 text-sm font-medium">{perk.validFrom}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Valid Until</p>

              <p className="mt-1 text-sm font-medium">{perk.validUntil}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================
   Date Formatter
================================ */

function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
