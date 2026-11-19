import { useMemo } from 'react';
import { computeLayout, type OrgRelationsInput } from '../utils/layoutEngine';
import type { LayoutResult } from '../types';

export function useOrgLayout(
  relations: OrgRelationsInput,
  expandedSubTrees: Record<number, boolean>
): LayoutResult {
  const { focusedNode, reportingManager, grandManager, directReports, subUnderReportsMap } =
    relations;

  return useMemo(
    () =>
      computeLayout(
        { focusedNode, reportingManager, grandManager, directReports, subUnderReportsMap },
        expandedSubTrees
      ),
    [focusedNode, reportingManager, grandManager, directReports, subUnderReportsMap, expandedSubTrees]
  );
}
