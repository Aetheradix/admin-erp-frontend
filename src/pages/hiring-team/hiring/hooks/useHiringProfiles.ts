import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAllEmployeeProfiles,
  syncProfilesFromBackend,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { computeHiringMetrics, mergeProfilesWithDbUsers } from '../utils';

export function useHiringProfiles() {
  const {
    data: dbUsers = [],
    isLoading: isUsersLoading,
    refetch: refetchDbUsers,
  } = useGetUsersQuery();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync DB users list to local storage for persistence & cross-component access
  useEffect(() => {
    if (dbUsers && dbUsers.length > 0) {
      try {
        localStorage.setItem('aether_staff_list', JSON.stringify(dbUsers));
      } catch {
        // Storage may be unavailable
      }
    }
  }, [dbUsers]);

  // Initial sync from backend database and periodic polling
  useEffect(() => {
    syncProfilesFromBackend();
    const interval = setInterval(() => {
      syncProfilesFromBackend();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dbUsers && dbUsers.length > 0) {
      syncProfilesFromBackend();
    }
  }, [dbUsers]);

  // Listen to cross-module employee profile and invitation updates
  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('aether_employee_profiles_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aether_employee_profiles_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Profiles live in localStorage and are refreshed whenever a sync event bumps the trigger
  const profiles = useMemo<ProfileCompletionData[]>(() => {
    void refreshTrigger;
    return getAllEmployeeProfiles();
  }, [refreshTrigger]);

  const combinedProfiles = useMemo(
    () => mergeProfilesWithDbUsers(dbUsers, profiles),
    [dbUsers, profiles]
  );

  const metrics = useMemo(() => computeHiringMetrics(combinedProfiles), [combinedProfiles]);

  const refreshList = useCallback(() => {
    refetchDbUsers();
    setRefreshTrigger((prev) => prev + 1);
  }, [refetchDbUsers]);

  return {
    dbUsers,
    isUsersLoading,
    refetchDbUsers,
    combinedProfiles,
    metrics,
    refreshList,
  };
}
