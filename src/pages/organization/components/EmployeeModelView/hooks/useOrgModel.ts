import { useMemo } from 'react';
import {
  useGetOrganizationHierarchyQuery,
  useGetCompanyProfileQuery,
  type HierarchyNodeUser,
} from '@/store/api/organizationApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useGetAllOfficesQuery } from '@/store/api/attendanceSlice';

export function useOrgModel() {
  const { data: hierarchyResponse, isLoading: isLoadingHierarchy } =
    useGetOrganizationHierarchyQuery();
  const { data: dbUsers = [] } = useGetUsersQuery();
  const { data: offices = [] } = useGetAllOfficesQuery();
  const { data: companyProfileResponse } = useGetCompanyProfileQuery();

  const flatUsers = useMemo(
    () => hierarchyResponse?.data?.flatUsers || [],
    [hierarchyResponse?.data?.flatUsers]
  );

  // O(1) user lookup Map
  const flatUsersById = useMemo(() => {
    const map = new Map<number, HierarchyNodeUser>();
    for (const u of flatUsers) {
      map.set(u.id, u);
    }
    return map;
  }, [flatUsers]);

  // O(1) children by manager ID lookup Map
  const childrenByManagerId = useMemo(() => {
    const map = new Map<number, HierarchyNodeUser[]>();
    for (const u of flatUsers) {
      if (u.reporting_manager_id != null) {
        const list = map.get(u.reporting_manager_id) || [];
        list.push(u);
        map.set(u.reporting_manager_id, list);
      }
    }
    return map;
  }, [flatUsers]);

  return {
    flatUsers,
    flatUsersById,
    childrenByManagerId,
    dbUsers,
    offices,
    companyProfile: companyProfileResponse?.data,
    isLoadingHierarchy,
  };
}
