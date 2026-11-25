import { useMemo } from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { EmployeeInput } from '../types';

interface UseOrgRelationsParams {
  focusedNode: HierarchyNodeUser | null;
  flatUsers: HierarchyNodeUser[];
  flatUsersById: Map<number, HierarchyNodeUser>;
  childrenByManagerId: Map<number, HierarchyNodeUser[]>;
  resolveUser: (target: EmployeeInput | null | undefined) => HierarchyNodeUser | null;
}

export function useOrgRelations({
  focusedNode,
  flatUsers,
  flatUsersById,
  childrenByManagerId,
  resolveUser,
}: UseOrgRelationsParams) {
  const reportingManager = useMemo<HierarchyNodeUser | null>(() => {
    if (!focusedNode?.reporting_manager_id) return null;
    return (
      flatUsersById.get(focusedNode.reporting_manager_id) ||
      resolveUser(focusedNode.reporting_manager_id)
    );
  }, [focusedNode, flatUsersById, resolveUser]);

  const grandManager = useMemo<HierarchyNodeUser | null>(() => {
    if (!reportingManager?.reporting_manager_id) return null;
    return (
      flatUsersById.get(reportingManager.reporting_manager_id) ||
      resolveUser(reportingManager.reporting_manager_id)
    );
  }, [reportingManager, flatUsersById, resolveUser]);

  const directReports = useMemo<HierarchyNodeUser[]>(() => {
    if (!focusedNode) return [];
    const direct = childrenByManagerId.get(focusedNode.id);
    if (direct && direct.length > 0) return direct;
    return focusedNode.directReports || [];
  }, [focusedNode, childrenByManagerId]);

  const subUnderReportsMap = useMemo<Record<number, HierarchyNodeUser[]>>(() => {
    const map: Record<number, HierarchyNodeUser[]> = {};
    for (const rep of directReports) {
      const subs = childrenByManagerId.get(rep.id);
      map[rep.id] = subs && subs.length > 0 ? subs : rep.directReports || [];
    }
    return map;
  }, [directReports, childrenByManagerId]);

  const peers = useMemo<HierarchyNodeUser[]>(() => {
    if (!focusedNode?.reporting_manager_id) return [];
    return flatUsers
      .filter(
        (u) =>
          u.reporting_manager_id === focusedNode.reporting_manager_id && u.id !== focusedNode.id
      )
      .slice(0, 8);
  }, [focusedNode, flatUsers]);

  return {
    reportingManager,
    grandManager,
    directReports,
    subUnderReportsMap,
    peers,
  };
}
