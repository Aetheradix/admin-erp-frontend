import React, { useMemo } from 'react';
import { useBenefitsPage } from '../hooks/useBenefits'; // Adjust path as needed
import type { Perk, PerkType, UserPerk } from '@/store/api/benefitsSlice';

export interface OptInBenefitsPageProps {
  userId: number; // Strictly required logged-in employee ID
}

// Safe helper to unwrap primitives or { value: ... } objects
const renderValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object' && 'value' in (val as object)) {
    return String((val as { value: unknown }).value ?? '');
  }
  return String(val);
};

const OptInBenefitsPage: React.FC<OptInBenefitsPageProps> = ({ userId }) => {
  const {
    filteredPerks,
    perkTypes,
    userPerks,
    search,
    setSearch,
    activeStatus,
    setActiveStatus,
    handleAssignPerk,
    isLoading,
    isAssigningPerk,
  } = useBenefitsPage(userId);

  // Set of perk IDs the user has opted into
  const optedPerkIds = useMemo<Set<number>>(() => {
    if (!userPerks) return new Set<number>();
    return new Set<number>(
      userPerks.map((userPerk: UserPerk) => {
        const id =
          typeof userPerk.perk_id === 'object' && userPerk.perk_id !== null
            ? (userPerk.perk_id as { value: number }).value
            : userPerk.perk_id;
        return Number(id);
      })
    );
  }, [userPerks]);

  // Helper function handling both primitive IDs and { value: number } objects
  const getPerkTypeName = (perkTypeId?: number | { value: number } | null): string => {
    if (!perkTypeId) return 'General';
    const targetId =
      typeof perkTypeId === 'object' && 'value' in perkTypeId ? perkTypeId.value : perkTypeId;
    const match = perkTypes?.find((type: PerkType) => type.id === targetId);
    return match?.name ? renderValue(match.name) : 'General';
  };

  const onOptInClick = async (perkId: number): Promise<void> => {
    try {
      await handleAssignPerk({
        perkId,
        user_id: userId, // Guaranteed to be 'number'
        valid_from: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error('Opt-in failed:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setActiveStatus(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        Loading benefits catalog...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Opt For Benefits</h1>
        <p className="text-sm text-gray-500">
          Explore available perks and enroll directly into employee benefits.
        </p>
      </div>

      {/* CONTROLS BAR: SEARCH & STATUS FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <input
          type="text"
          placeholder="Search benefits by name or description..."
          value={search}
          onChange={handleSearchChange}
          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-xs font-semibold text-gray-500 uppercase">
            Status:
          </label>
          <select
            id="status-filter"
            value={activeStatus}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="All">All Benefits</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* BENEFIT CARDS GRID */}
      {filteredPerks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No benefits found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPerks.map((perk: Perk) => {
            const rawId =
              typeof perk.id === 'object' && perk.id !== null
                ? (perk.id as { value: number }).value
                : perk.id;
            const isOptedIn: boolean = optedPerkIds.has(Number(rawId));

            return (
              <div
                key={renderValue(perk.id)}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                {/* CARD CONTENT */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {getPerkTypeName(perk.perk_type_id)}
                    </span>
                    {perk.amount !== null && perk.amount !== undefined && (
                      <span className="text-xs font-semibold text-gray-500">
                        ${renderValue(perk.amount)}{' '}
                        {perk.frequency ? `/ ${renderValue(perk.frequency)}` : ''}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">{renderValue(perk.name)}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {renderValue(perk.description) || 'No description provided for this perk.'}
                  </p>
                </div>

                {/* CARD FOOTER / ACTION */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  {Boolean(perk.eligibility) && (
                    <span className="text-xs text-gray-400">{String(perk.eligibility)}</span>
                  )}

                  <button
                    type="button"
                    disabled={isOptedIn || isAssigningPerk}
                    onClick={() => void onOptInClick(Number(rawId))}
                    className={`ml-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isOptedIn
                        ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    } ${isAssigningPerk ? 'opacity-50 cursor-wait' : ''}`}>
                    {isOptedIn ? '✓ Enrolled' : 'Opt In'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OptInBenefitsPage;
