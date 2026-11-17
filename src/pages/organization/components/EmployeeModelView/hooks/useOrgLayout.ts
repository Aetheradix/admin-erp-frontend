import { useMemo } from 'react';
import { computeLayout, type OrgRelationsInput } from '../utils/layoutEngine';
import type { LayoutResult } from '../types';

export function useOrgLayout(
  relations: OrgRelationsInput,
  expandedSubTrees: Record<number, boolean>
): LayoutResult {
  return useMemo(() => {
    return computeLayout(relations, expandedSubTrees);
  }, [
    relations.focusedNode,
    relations.reportingManager,
    relations.grandManager,
    relations.directReports,
    relations.subUnderReportsMap,
    expandedSubTrees,
  ]);
}
