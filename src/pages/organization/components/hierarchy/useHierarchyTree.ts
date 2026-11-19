import { useCallback, useMemo, useState } from 'react';
import { message } from 'antd';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import {
  buildUnifiedTree,
  computeDepartmentFilters,
  exportHierarchyJson,
  filterHierarchyTree,
} from './utils';
import type { HierarchyViewMode } from './types';

const EMPTY_STATS = {
  totalEmployees: 0,
  totalManagers: 0,
  totalDepartments: 0,
  hierarchyDepth: 0,
};

export function useHierarchyTree() {
  const { data: hierarchyResponse, isLoading, refetch } = useGetOrganizationHierarchyQuery();
  const hierarchyData = hierarchyResponse?.data;

  const rootUsers = useMemo(() => hierarchyData?.tree ?? [], [hierarchyData]);
  const flatUsers = useMemo(() => hierarchyData?.flatUsers ?? [], [hierarchyData]);
  const departments = useMemo(() => hierarchyData?.departments ?? [], [hierarchyData]);
  const stats = useMemo(() => hierarchyData?.stats ?? EMPTY_STATS, [hierarchyData]);

  const [viewMode, setViewMode] = useState<HierarchyViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<HierarchyNodeUser | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  const [hiddenCount, setHiddenCount] = useState(0);

  const unassignedCount = useMemo(
    () => (rootUsers.length > 1 ? rootUsers.length - 1 : 0),
    [rootUsers]
  );

  const departmentFilters = useMemo(() => computeDepartmentFilters(flatUsers), [flatUsers]);

  const toggleNode = useCallback((id: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  }, []);

  const handleExpandAll = useCallback(() => {
    const allExpanded: Record<number, boolean> = {};
    flatUsers.forEach((user) => {
      allExpanded[user.id] = true;
    });
    setExpandedNodes(allExpanded);
  }, [flatUsers]);

  const handleCollapseAll = useCallback(() => {
    const allCollapsed: Record<number, boolean> = {};
    flatUsers.forEach((user) => {
      allCollapsed[user.id] = false;
    });
    setExpandedNodes(allCollapsed);
  }, [flatUsers]);

  const unifiedTree = useMemo(
    () => buildUnifiedTree(rootUsers, flatUsers),
    [rootUsers, flatUsers]
  );

  const filteredTree = useMemo(
    () => filterHierarchyTree(unifiedTree, searchQuery, selectedDepartment),
    [unifiedTree, searchQuery, selectedDepartment]
  );

  const handleExportJson = () => {
    if (!hierarchyData) {
      message.warning('No organization data available to export.');
      return;
    }
    exportHierarchyJson(hierarchyData);
    message.success('Organization data exported successfully as JSON.');
  };

  return {
    hierarchyData,
    isLoading,
    refetch,
    rootUsers,
    flatUsers,
    departments,
    stats,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedEmployee,
    setSelectedEmployee,
    expandedNodes,
    setExpandedNodes,
    hiddenCount,
    setHiddenCount,
    unassignedCount,
    departmentFilters,
    toggleNode,
    handleExpandAll,
    handleCollapseAll,
    filteredTree,
    handleExportJson,
  };
}
