/**
 * Pure, unit-testable organizational layout and graph engine.
 * Computes horizontal tree layout (left-to-right), smooth cubic bezier connectors,
 * branch expansion/collapse visibility, and search/department path highlighting.
 */

import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';

export interface LayoutNode {
  id: number;
  user: HierarchyNodeUser;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  isRoot: boolean;
  isDeptHead: boolean;
  isManager: boolean;
  isIndividualContributor: boolean;
  hasReports: boolean;
  directReportsCount: number;
  totalTeamCount: number;
  isExpanded: boolean;
  departmentColor: {
    bg: string;
    text: string;
    dot: string;
    border: string;
  };
}

export interface BezierConnector {
  id: string;
  parentId: number;
  childId: number;
  path: string;
  isHighlighted: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TreeLayoutResult {
  nodes: LayoutNode[];
  nodeMap: Map<number, LayoutNode>;
  connectors: BezierConnector[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  hiddenCount: number;
}

// ── Department Color System ──────────────────────────────────────────────────
export const DEPARTMENT_PALETTE: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Engineering: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', dot: '#3b82f6', border: '#3b82f6' },
  Product: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', dot: '#10b981', border: '#10b981' },
  Design: { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', dot: '#ec4899', border: '#ec4899' },
  Growth: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', dot: '#f59e0b', border: '#f59e0b' },
  Marketing: { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', dot: '#f97316', border: '#f97316' },
  'People & Ops': { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', dot: '#8b5cf6', border: '#8b5cf6' },
  People: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', dot: '#8b5cf6', border: '#8b5cf6' },
  HR: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', dot: '#8b5cf6', border: '#8b5cf6' },
  Finance: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', dot: '#06b6d4', border: '#06b6d4' },
  Sales: { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', dot: '#f43f5e', border: '#f43f5e' },
  Operations: { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', dot: '#94a3b8', border: '#94a3b8' },
  Leadership: { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1', dot: '#6366f1', border: '#6366f1' },
  Executive: { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1', dot: '#6366f1', border: '#6366f1' },
};

const PALETTE_FALLBACKS = [
  { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', dot: '#3b82f6', border: '#3b82f6' },
  { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', dot: '#10b981', border: '#10b981' },
  { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', dot: '#ec4899', border: '#ec4899' },
  { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', dot: '#f59e0b', border: '#f59e0b' },
  { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', dot: '#8b5cf6', border: '#8b5cf6' },
  { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', dot: '#06b6d4', border: '#06b6d4' },
];

export function getDepartmentColor(deptName?: string | null): {
  bg: string;
  text: string;
  dot: string;
  border: string;
} {
  if (!deptName) {
    return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366f1', dot: '#6366f1', border: '#6366f1' };
  }
  const clean = deptName.trim();
  if (DEPARTMENT_PALETTE[clean]) {
    return DEPARTMENT_PALETTE[clean];
  }
  // Case-insensitive match
  const lower = clean.toLowerCase();
  for (const [k, v] of Object.entries(DEPARTMENT_PALETTE)) {
    if (k.toLowerCase() === lower || lower.includes(k.toLowerCase())) {
      return v;
    }
  }
  // Deterministic hash fallback
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
  }
  const idx = Math.abs(hash) % PALETTE_FALLBACKS.length;
  return PALETTE_FALLBACKS[idx];
}

// ── Recursive Subtree Total Counts ───────────────────────────────────────────
export function computeSubtreeSize(user: HierarchyNodeUser): number {
  if (!user.directReports || user.directReports.length === 0) {
    return 0;
  }
  let sum = user.directReports.length;
  for (const child of user.directReports) {
    sum += computeSubtreeSize(child);
  }
  return sum;
}

// ── Layout Dimensions ────────────────────────────────────────────────────────
export const LAYOUT_CONFIG = {
  colGap: 84, // horizontal gap between parent right and child left
  rowGap: 16, // vertical gap between adjacent nodes
  rootWidth: 260,
  rootHeight: 76,
  deptHeadWidth: 250,
  deptHeadHeight: 72,
  managerWidth: 240,
  managerHeight: 70,
  icWidth: 230,
  icHeight: 66,
};

export function getNodeDimensions(depth: number, hasReports: boolean) {
  if (depth === 0) {
    return { width: LAYOUT_CONFIG.rootWidth, height: LAYOUT_CONFIG.rootHeight };
  }
  if (depth === 1) {
    return { width: LAYOUT_CONFIG.deptHeadWidth, height: LAYOUT_CONFIG.deptHeadHeight };
  }
  if (hasReports) {
    return { width: LAYOUT_CONFIG.managerWidth, height: LAYOUT_CONFIG.managerHeight };
  }
  return { width: LAYOUT_CONFIG.icWidth, height: LAYOUT_CONFIG.icHeight };
}

// ── Cubic Bezier Path Generator ──────────────────────────────────────────────
export function generateBezierPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const dx = endX - startX;
  const cp1x = startX + dx * 0.45;
  const cp1y = startY;
  const cp2x = endX - dx * 0.45;
  const cp2y = endY;
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}

// ── Horizontal Recursive Layout ──────────────────────────────────────────────
/**
 * Recursively computes positions for all visible nodes.
 * Leaves (or collapsed parents) get consecutive vertical row slots.
 * Parents are vertically centered between their first and last visible child.
 */
export function computeHorizontalTreeLayout(
  rootUser: HierarchyNodeUser,
  expandedMap: Record<number, boolean>,
  highlightedIds?: Set<number>
): TreeLayoutResult {
  const nodes: LayoutNode[] = [];
  const nodeMap = new Map<number, LayoutNode>();
  const connectors: BezierConnector[] = [];

  let currentY = 40;
  let hiddenCount = 0;

  // First pass: count hidden nodes in collapsed branches
  function countHidden(user: HierarchyNodeUser, parentExpanded: boolean) {
    const isExpanded = expandedMap[user.id] ?? true;
    const children = user.directReports || [];
    for (const child of children) {
      if (!parentExpanded || !isExpanded) {
        hiddenCount++;
        countHidden(child, false);
      } else {
        countHidden(child, true);
      }
    }
  }
  countHidden(rootUser, true);

  // Layout function
  function layoutNode(
    user: HierarchyNodeUser,
    depth: number,
    startX: number
  ): { y: number; height: number; layoutNode: LayoutNode } {
    const isExpanded = expandedMap[user.id] ?? true;
    const children = user.directReports || [];
    const hasReports = children.length > 0;
    const visibleChildren = isExpanded ? children : [];

    const dims = getNodeDimensions(depth, hasReports);
    const isRoot = depth === 0;
    const isDeptHead = depth === 1;
    const isManager = depth > 1 && hasReports;
    const isIndividualContributor = !isRoot && !isDeptHead && !isManager;

    const totalTeamCount = computeSubtreeSize(user);
    const deptColor = getDepartmentColor(user.department);

    let assignedY = 0;

    if (visibleChildren.length === 0) {
      // Leaf node or collapsed node
      assignedY = currentY;
      currentY += dims.height + LAYOUT_CONFIG.rowGap;
    } else {
      // Has visible children: layout children recursively first
      const childLayouts: { y: number; height: number; layoutNode: LayoutNode }[] = [];
      const childStartX = startX + dims.width + LAYOUT_CONFIG.colGap;

      for (const child of visibleChildren) {
        const childRes = layoutNode(child, depth + 1, childStartX);
        childLayouts.push(childRes);
      }

      const firstChildY = childLayouts[0].y + childLayouts[0].height / 2;
      const lastChildY =
        childLayouts[childLayouts.length - 1].y +
        childLayouts[childLayouts.length - 1].height / 2;

      // Vertically center parent between first and last child centers
      assignedY = (firstChildY + lastChildY) / 2 - dims.height / 2;

      // Ensure assignedY does not overlap with previous row boundaries
      if (assignedY < childLayouts[0].y) {
        assignedY = childLayouts[0].y;
      }
    }

    const nodeItem: LayoutNode = {
      id: user.id,
      user,
      x: startX,
      y: assignedY,
      width: dims.width,
      height: dims.height,
      depth,
      isRoot,
      isDeptHead,
      isManager,
      isIndividualContributor,
      hasReports,
      directReportsCount: children.length,
      totalTeamCount,
      isExpanded,
      departmentColor: deptColor,
    };

    nodes.push(nodeItem);
    nodeMap.set(user.id, nodeItem);

    // If node has visible children, generate connectors
    if (visibleChildren.length > 0) {
      const parentRightX = startX + dims.width;
      const parentCenterY = assignedY + dims.height / 2;

      for (const child of visibleChildren) {
        const childNode = nodeMap.get(child.id);
        if (childNode) {
          const childLeftX = childNode.x;
          const childCenterY = childNode.y + childNode.height / 2;

          const isPathHighlighted = Boolean(
            highlightedIds &&
              highlightedIds.has(user.id) &&
              highlightedIds.has(child.id)
          );

          connectors.push({
            id: `edge-${user.id}-${child.id}`,
            parentId: user.id,
            childId: child.id,
            path: generateBezierPath(parentRightX, parentCenterY, childLeftX, childCenterY),
            isHighlighted: isPathHighlighted,
            startX: parentRightX,
            startY: parentCenterY,
            endX: childLeftX,
            endY: childCenterY,
          });
        }
      }
    }

    return { y: assignedY, height: dims.height, layoutNode: nodeItem };
  }

  layoutNode(rootUser, 0, 40);

  // Compute bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  }

  if (nodes.length === 0) {
    minX = 0;
    minY = 0;
    maxX = 500;
    maxY = 300;
  }

  return {
    nodes,
    nodeMap,
    connectors,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
    hiddenCount,
  };
}

// ── Graph Lookups: Ancestors & Descendants ───────────────────────────────────
export function buildParentMap(flatUsers: HierarchyNodeUser[]): Map<number, number> {
  const parentMap = new Map<number, number>();
  for (const u of flatUsers) {
    if (u.reporting_manager_id) {
      parentMap.set(u.id, u.reporting_manager_id);
    }
    if (u.directReports) {
      for (const child of u.directReports) {
        parentMap.set(child.id, u.id);
      }
    }
  }
  return parentMap;
}

export function getAncestors(userId: number, parentMap: Map<number, number>): number[] {
  const ancestors: number[] = [];
  let curr: number | undefined = userId;
  const visited = new Set<number>();

  while (curr && !visited.has(curr)) {
    visited.add(curr);
    const parent = parentMap.get(curr);
    if (parent) {
      ancestors.push(parent);
      curr = parent;
    } else {
      break;
    }
  }
  return ancestors;
}

// ── Filter and Highlight Evaluation ──────────────────────────────────────────
export interface FilterEvaluation {
  matchedIds: Set<number>;
  highlightedIds: Set<number>;
  hasFilter: boolean;
  isEmptyMatch: boolean;
}

export function evaluateFilterAndSearch(
  flatUsers: HierarchyNodeUser[],
  searchQuery: string,
  selectedDepartment: string,
  parentMap: Map<number, number>
): FilterEvaluation {
  const query = searchQuery.trim().toLowerCase();
  const hasQuery = query.length > 0;
  const hasDept = selectedDepartment !== 'ALL' && selectedDepartment.length > 0;

  if (!hasQuery && !hasDept) {
    return {
      matchedIds: new Set<number>(),
      highlightedIds: new Set<number>(),
      hasFilter: false,
      isEmptyMatch: false,
    };
  }

  const matchedIds = new Set<number>();
  const highlightedIds = new Set<number>();

  for (const u of flatUsers) {
    let matches = true;

    if (hasDept) {
      matches = (u.department || '').toLowerCase() === selectedDepartment.toLowerCase();
    }

    if (matches && hasQuery) {
      const nameMatch = (u.username || '').toLowerCase().includes(query);
      const titleMatch = (u.designation || u.role || '').toLowerCase().includes(query);
      const deptMatch = (u.department || '').toLowerCase().includes(query);
      matches = nameMatch || titleMatch || deptMatch;
    }

    if (matches) {
      matchedIds.add(u.id);
      highlightedIds.add(u.id);
      // Highlight the whole ancestor path up to root
      const ancestors = getAncestors(u.id, parentMap);
      for (const ancId of ancestors) {
        highlightedIds.add(ancId);
      }
    }
  }

  return {
    matchedIds,
    highlightedIds,
    hasFilter: true,
    isEmptyMatch: matchedIds.size === 0,
  };
}

