import { useMemo, useState } from 'react';
import type { ProfileCompletionData } from '@/services/employeeProfileService';
import { filterHiringProfiles } from '../utils';

export function useHiringFilters(combinedProfiles: ProfileCompletionData[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredProfiles = useMemo(
    () => filterHiringProfiles(combinedProfiles, searchQuery, activeTab),
    [combinedProfiles, searchQuery, activeTab]
  );

  return { searchQuery, setSearchQuery, activeTab, setActiveTab, filteredProfiles };
}
