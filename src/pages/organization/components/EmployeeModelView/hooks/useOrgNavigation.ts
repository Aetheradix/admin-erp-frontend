import { useState, useCallback, useMemo } from 'react';
import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { EmployeeInput } from '../types';

interface UseOrgNavigationProps {
  isOpen: boolean;
  employee: EmployeeInput | null | undefined;
  resolveUser: (target: EmployeeInput | null | undefined) => HierarchyNodeUser | null;
  flatUsersById: Map<number, HierarchyNodeUser>;
}

export const useOrgNavigation = ({
  isOpen,
  employee,
  resolveUser,
  flatUsersById,
}: UseOrgNavigationProps) => {
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [inspectedId, setInspectedId] = useState<number | null>(null);
  const [navHistory, setNavHistory] = useState<number[]>([]);
  const [showDetail, setShowDetail] = useState(true);
  const [expandedSubTrees, setExpandedSubTrees] = useState<Record<number, boolean>>({});

  const [syncedSession, setSyncedSession] = useState<{
    isOpen: boolean;
    employee: EmployeeInput | null | undefined;
  }>({ isOpen: false, employee: null });

  if (syncedSession.isOpen !== isOpen || syncedSession.employee !== employee) {
    setSyncedSession({ isOpen, employee });
    if (isOpen && employee) {
      const u = resolveUser(employee);
      if (u) {
        setFocusedId(u.id);
        setInspectedId(u.id);
      }
      setNavHistory([]);
      setExpandedSubTrees({});
    }
  }

  const focusedNode = useMemo(
    () =>
      focusedId ? flatUsersById.get(focusedId) || resolveUser(focusedId) : resolveUser(employee),
    [focusedId, employee, flatUsersById, resolveUser]
  );

  const inspectedNode = useMemo(
    () => (inspectedId ? flatUsersById.get(inspectedId) || resolveUser(inspectedId) : focusedNode),
    [inspectedId, focusedNode, flatUsersById, resolveUser]
  );

  const handleFocus = useCallback(
    (u: HierarchyNodeUser) => {
      if (u.id === focusedNode?.id) {
        setInspectedId(u.id);
        return;
      }
      if (focusedNode) setNavHistory((p) => [...p, focusedNode.id]);
      setFocusedId(u.id);
      setInspectedId(u.id);
    },
    [focusedNode]
  );

  const handleBack = useCallback(() => {
    if (!navHistory.length) return;
    const prev = navHistory[navHistory.length - 1];
    setNavHistory((p) => p.slice(0, -1));
    setFocusedId(prev);
    setInspectedId(prev);
  }, [navHistory]);

  const handleInspect = useCallback((u: HierarchyNodeUser) => {
    setInspectedId(u.id);
    setShowDetail(true);
  }, []);

  const toggleSubTree = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubTrees((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  return {
    focusedNode,
    inspectedNode,
    navHistory,
    showDetail,
    setShowDetail,
    expandedSubTrees,
    handleFocus,
    handleBack,
    handleInspect,
    toggleSubTree,
  };
};
