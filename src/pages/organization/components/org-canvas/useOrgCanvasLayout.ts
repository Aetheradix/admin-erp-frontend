import { useMemo } from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import {
  buildParentMap,
  computeHorizontalTreeLayout,
  evaluateFilterAndSearch,
  type TreeLayoutResult,
} from '../../utils/orgLayoutEngine';

function buildUnifiedRoot(rootUsers: HierarchyNodeUser[]): HierarchyNodeUser | null {
  if (!rootUsers || rootUsers.length === 0) return null;
  if (rootUsers.length === 1) return rootUsers[0];

  const apexLeader =
    rootUsers.find(
      (user) =>
        user.designation?.toLowerCase().includes('founder') ||
        user.designation?.toLowerCase().includes('ceo') ||
        user.designation?.toLowerCase().includes('director') ||
        user.username?.toLowerCase().includes('pratyush') ||
        (user.directReports && user.directReports.length > 0)
    ) || rootUsers[0];

  const unassignedRoots = rootUsers.filter((user) => user.id !== apexLeader.id);
  if (unassignedRoots.length === 0) return apexLeader;

  const unassignedGroupNode: HierarchyNodeUser = {
    id: -999,
    username: 'Unassigned Personnel',
    email: 'unassigned@organization.local',
    role: 'Staff Pool',
    department: 'Operations',
    designation: `${unassignedRoots.length} awaiting manager`,
    employee_code: 'POOL',
    reporting_manager_id: apexLeader.id,
    directReports: unassignedRoots,
    subordinatesCount: unassignedRoots.length,
  };

  return {
    ...apexLeader,
    directReports: [...(apexLeader.directReports || []), unassignedGroupNode],
  };
}

export function useOrgCanvasLayout(
  rootUsers: HierarchyNodeUser[],
  flatUsers: HierarchyNodeUser[],
  searchQuery: string,
  selectedDepartment: string,
  expandedNodes: Record<number, boolean>
) {
  const parentMap = useMemo(() => buildParentMap(flatUsers), [flatUsers]);
  const unifiedRoot = useMemo(() => buildUnifiedRoot(rootUsers), [rootUsers]);

  const filterEval = useMemo(
    () => evaluateFilterAndSearch(flatUsers, searchQuery, selectedDepartment, parentMap),
    [flatUsers, searchQuery, selectedDepartment, parentMap]
  );

  const layoutResult = useMemo(() => {
    if (!unifiedRoot) {
      const empty: TreeLayoutResult = {
        nodes: [],
        nodeMap: new Map(),
        connectors: [],
        bounds: { minX: 0, minY: 0, maxX: 600, maxY: 400, width: 600, height: 400 },
        hiddenCount: 0,
      };
      return empty;
    }
    return computeHorizontalTreeLayout(
      unifiedRoot,
      expandedNodes,
      filterEval.highlightedIds
    );
  }, [unifiedRoot, expandedNodes, filterEval.highlightedIds]);

  return { filterEval, layoutResult };
}
