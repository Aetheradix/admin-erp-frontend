import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { OrganizationTab } from '../types';

export function normalizeOrgTab(param: string | null): OrganizationTab | null {
  if (param === 'Organization Hierarchy' || param === 'hierarchy' || param === 'org') {
    return 'Organization Hierarchy';
  }
  if (param === 'Offices & Branches' || param === 'branches') {
    return 'Offices & Branches';
  }
  return null;
}

export function useOrganizationTabs() {
  const [searchParams] = useSearchParams();
  const paramsKey = searchParams.toString();
  const urlTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<OrganizationTab>(
    () => normalizeOrgTab(urlTab) ?? 'Overview'
  );
  const [syncedParamsKey, setSyncedParamsKey] = useState(paramsKey);
  const [autoOpenHQ, setAutoOpenHQ] = useState(false);
  const [autoOpenCreate, setAutoOpenCreate] = useState(false);

  // Re-apply the URL tab whenever the query string changes (matches the old effect).
  if (paramsKey !== syncedParamsKey) {
    setSyncedParamsKey(paramsKey);
    const normalized = normalizeOrgTab(urlTab);
    if (normalized) setActiveTab(normalized);
  }

  const clearAutoOpen = useCallback(() => {
    setAutoOpenHQ(false);
    setAutoOpenCreate(false);
  }, []);

  const openHeadquarters = useCallback(() => {
    setActiveTab('Offices & Branches');
    setAutoOpenHQ(true);
  }, []);

  const openCreateLocation = useCallback(() => {
    setActiveTab('Offices & Branches');
    setAutoOpenCreate(true);
  }, []);

  return {
    activeTab,
    setActiveTab,
    autoOpenHQ,
    autoOpenCreate,
    clearAutoOpen,
    openHeadquarters,
    openCreateLocation,
  };
}
