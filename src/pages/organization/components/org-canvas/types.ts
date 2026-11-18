import type { HierarchyNodeUser } from '@/store/api/organizationApiSlice';
import type { LayoutNode } from '../../utils/orgLayoutEngine';

export interface OrgCanvasTransformApi {
  pan: { x: number; y: number };
  zoom: number;
  handlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  handleFit: () => void;
  setPan: (pan: { x: number; y: number }) => void;
}

export interface OrgCanvasLayoutApi {
  nodes: LayoutNode[];
  nodeMap: Map<number, LayoutNode>;
  connectors: Array<{
    id: string;
    path: string;
    isHighlighted: boolean;
  }>;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  hiddenCount: number;
  hasFilter: boolean;
  isEmptyMatch: boolean;
  matchedIds: Set<number>;
  highlightedIds: Set<number>;
}

export interface OrgCanvasNodeHandlers {
  onSelectUser: (user: HierarchyNodeUser) => void;
  onAddDirectReport: (user: HierarchyNodeUser) => void;
  onRemoveUser: (user: HierarchyNodeUser) => void;
  onToggleNode: (nodeId: number) => void;
}
