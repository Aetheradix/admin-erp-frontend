import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';

export function buildUnifiedTree(
  rootUsers: HierarchyNodeUser[],
  flatUsers: HierarchyNodeUser[]
): HierarchyNodeUser[] {
  if (!rootUsers.length) return [];

  const apexLeader =
    rootUsers.find(
      (user) =>
        user.designation?.toLowerCase().includes('founder') ||
        user.designation?.toLowerCase().includes('ceo') ||
        user.designation?.toLowerCase().includes('director') ||
        user.username?.toLowerCase().includes('pratyush') ||
        (user.directReports && user.directReports.length > 0)
    ) ||
    flatUsers.find(
      (user) =>
        !user.reporting_manager_id &&
        (user.designation?.toLowerCase().includes('founder') ||
          user.designation?.toLowerCase().includes('ceo') ||
          user.designation?.toLowerCase().includes('director') ||
          user.username?.toLowerCase().includes('pratyush') ||
          (user.directReports && user.directReports.length > 0))
    ) ||
    rootUsers[0];

  const unassignedRoots = rootUsers.filter((user) => user.id !== apexLeader.id);
  if (unassignedRoots.length === 0) return [apexLeader];

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

  return [
    {
      ...apexLeader,
      directReports: [...(apexLeader.directReports || []), unassignedGroupNode],
    },
  ];
}

export function filterHierarchyTree(
  unifiedTree: HierarchyNodeUser[],
  searchQuery: string,
  selectedDepartment: string
): HierarchyNodeUser[] {
  if (!searchQuery.trim() && selectedDepartment === 'ALL') return unifiedTree;
  const query = searchQuery.toLowerCase().trim();

  const filterNode = (node: HierarchyNodeUser): HierarchyNodeUser | null => {
    const nameMatch = !query || node.username.toLowerCase().includes(query);
    const emailMatch = !query || (node.email && node.email.toLowerCase().includes(query));
    const roleMatch = !query || (node.role && node.role.toLowerCase().includes(query));
    const desigMatch =
      !query || (node.designation && node.designation.toLowerCase().includes(query));
    const deptMatch =
      selectedDepartment === 'ALL' ||
      (node.department && node.department.toLowerCase() === selectedDepartment.toLowerCase());

    const selfMatch = Boolean((nameMatch || emailMatch || roleMatch || desigMatch) && deptMatch);

    const matchedChildren = (node.directReports || [])
      .map(filterNode)
      .filter((child): child is HierarchyNodeUser => Boolean(child));

    if (selfMatch || matchedChildren.length > 0) {
      return { ...node, directReports: matchedChildren };
    }
    return null;
  };

  return unifiedTree.map(filterNode).filter((node): node is HierarchyNodeUser => Boolean(node));
}

export function computeDepartmentFilters(flatUsers: HierarchyNodeUser[]) {
  const counts: Record<string, number> = {};
  flatUsers.forEach((user) => {
    if (user.department) {
      counts[user.department] = (counts[user.department] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function exportHierarchyJson(hierarchyData: unknown): void {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(hierarchyData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `organization-map-${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
