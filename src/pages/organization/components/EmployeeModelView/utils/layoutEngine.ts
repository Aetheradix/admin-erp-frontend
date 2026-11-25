import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { LayoutResult, NodePosition, ReportPositionItem, ConnectorPath } from '../types';
import { NODE_SIZES, GAPS } from '../constants';
import { buildBezierPath } from './connectors';

export interface OrgRelationsInput {
  focusedNode: HierarchyNodeUser | null;
  reportingManager: HierarchyNodeUser | null;
  grandManager: HierarchyNodeUser | null;
  directReports: HierarchyNodeUser[];
  subUnderReportsMap: Record<number, HierarchyNodeUser[]>;
}

function link(
  id: string,
  from: NodePosition,
  to: NodePosition,
  highlighted = false
): ConnectorPath {
  return {
    id,
    d: buildBezierPath(
      { x: from.x + from.width / 2, y: from.y + from.height },
      { x: to.x + to.width / 2, y: to.y }
    ),
    highlighted,
  };
}

export function computeLayout(
  relations: OrgRelationsInput,
  expandedSubTrees: Record<number, boolean>
): LayoutResult {
  const { focusedNode, reportingManager, grandManager, directReports, subUnderReportsMap } =
    relations;
  if (!focusedNode) {
    return {
      bounds: { minX: 0, maxX: 600, minY: 0, maxY: 400, width: 600, height: 400 },
      grandManagerPos: null,
      managerPos: null,
      centralPos: { x: 0, y: 0, ...NODE_SIZES.CENTRAL },
      reportsPositions: [],
      emptyReportsPos: null,
      connectors: [],
    };
  }

  const centralPos: NodePosition = {
    x: -NODE_SIZES.CENTRAL.width / 2,
    y: 0,
    ...NODE_SIZES.CENTRAL,
  };
  const managerY = centralPos.y - (NODE_SIZES.SECONDARY.height + GAPS.ROW);
  const managerPos: NodePosition | null = reportingManager
    ? { x: -NODE_SIZES.SECONDARY.width / 2, y: managerY, ...NODE_SIZES.SECONDARY }
    : null;
  const grandManagerPos: NodePosition | null = grandManager
    ? {
        x: -NODE_SIZES.SECONDARY.width / 2,
        y: managerY - (NODE_SIZES.SECONDARY.height + GAPS.ROW),
        ...NODE_SIZES.SECONDARY,
      }
    : null;

  const reportsY = centralPos.y + NODE_SIZES.CENTRAL.height + GAPS.ROW;
  let emptyReportsPos: NodePosition | null = null;
  const reportsPositions: ReportPositionItem[] = [];
  const connectors: ConnectorPath[] = [];

  if (directReports.length === 0) {
    emptyReportsPos = { x: -NODE_SIZES.EMPTY.width / 2, y: reportsY, ...NODE_SIZES.EMPTY };
    connectors.push(link('conn-central-empty', centralPos, emptyReportsPos));
  } else {
    const colWidths = directReports.map((rep) => {
      const subs = subUnderReportsMap[rep.id] || [];
      if (expandedSubTrees[rep.id] && subs.length > 0) {
        return Math.max(
          NODE_SIZES.SECONDARY.width,
          subs.length * NODE_SIZES.SUB.width + (subs.length - 1) * GAPS.SUB_COL
        );
      }
      return NODE_SIZES.SECONDARY.width;
    });

    const totalSpan =
      colWidths.reduce((a, b) => a + b, 0) + (directReports.length - 1) * GAPS.CHILD_COL;
    let currX = -totalSpan / 2;

    directReports.forEach((rep, i) => {
      const repPos: NodePosition = {
        x: currX + (colWidths[i] - NODE_SIZES.SECONDARY.width) / 2,
        y: reportsY,
        ...NODE_SIZES.SECONDARY,
      };
      const subPositions: Array<{ pos: NodePosition; user: HierarchyNodeUser }> = [];
      const subs = subUnderReportsMap[rep.id] || [];

      if (expandedSubTrees[rep.id] && subs.length > 0) {
        const subRowY = reportsY + NODE_SIZES.SECONDARY.height + GAPS.ROW;
        const totalSubW = subs.length * NODE_SIZES.SUB.width + (subs.length - 1) * GAPS.SUB_COL;
        const subStartX = currX + (colWidths[i] - totalSubW) / 2;

        subs.forEach((subUser, sIdx) => {
          const subPos: NodePosition = {
            x: subStartX + sIdx * (NODE_SIZES.SUB.width + GAPS.SUB_COL),
            y: subRowY,
            ...NODE_SIZES.SUB,
          };
          subPositions.push({ pos: subPos, user: subUser });
          connectors.push(link(`conn-sub-${rep.id}-${subUser.id}`, repPos, subPos));
        });
      }

      reportsPositions.push({ pos: repPos, user: rep, subPositions });
      connectors.push(link(`conn-central-rep-${i}`, centralPos, repPos, true));
      currX += colWidths[i] + GAPS.CHILD_COL;
    });
  }

  if (grandManagerPos && managerPos)
    connectors.push(link('conn-grand-mgr', grandManagerPos, managerPos));
  if (managerPos) connectors.push(link('conn-mgr-central', managerPos, centralPos, true));

  const allPositions = [
    centralPos,
    ...(grandManagerPos ? [grandManagerPos] : []),
    ...(managerPos ? [managerPos] : []),
    ...(emptyReportsPos ? [emptyReportsPos] : []),
  ];
  reportsPositions.forEach((r) => {
    allPositions.push(r.pos);
    r.subPositions.forEach((s) => allPositions.push(s.pos));
  });

  const minX = Math.min(...allPositions.map((p) => p.x));
  const maxX = Math.max(...allPositions.map((p) => p.x + p.width));
  const minY = Math.min(...allPositions.map((p) => p.y));
  const maxY = Math.max(...allPositions.map((p) => p.y + p.height));

  return {
    bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
    grandManagerPos,
    managerPos,
    centralPos,
    reportsPositions,
    emptyReportsPos,
    connectors,
  };
}
