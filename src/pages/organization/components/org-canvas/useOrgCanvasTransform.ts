import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { usePanZoom } from '@/shared/hooks/usePanZoom';
import type { LayoutNode, TreeLayoutResult } from '../../utils/orgLayoutEngine';

interface UseOrgCanvasTransformParams {
  containerRef: RefObject<HTMLDivElement | null>;
  nodes: LayoutNode[];
  nodeMap: Map<number, LayoutNode>;
  bounds: TreeLayoutResult['bounds'];
  selectedUserId: number | null;
}

export function useOrgCanvasTransform({
  containerRef,
  nodes,
  nodeMap,
  bounds,
  selectedUserId,
}: UseOrgCanvasTransformParams) {
  const {
    pan,
    zoom,
    setPan,
    setZoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    adjustZoom,
    handleFit,
  } = usePanZoom({
    containerRef,
    defaultZoom: 1.0,
    initialPan: { x: 80, y: 140 },
    minZoom: 0.35,
    maxZoom: 2.0,
    fitPadding: 100,
    fitMin: 0.7,
    fitMax: 1.1,
    fitMinBounds: 250,
    wheelZoomIn: 1.12,
    wheelZoomOut: 0.89,
    bounds: nodes.length > 0 ? bounds : null,
  });

  const hasInitializedZoom = useRef(false);

  useEffect(() => {
    if (hasInitializedZoom.current || !containerRef.current || nodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const rootNode = nodes.find((node) => node.isRoot) || nodes[0];

    if (rootNode) {
      const defaultZoom = 1.0;
      setZoom(defaultZoom);
      setPan({
        x: Math.max(60, clientWidth * 0.08),
        y: clientHeight / 2 - (rootNode.y + rootNode.height / 2) * defaultZoom,
      });
      hasInitializedZoom.current = true;
    }
  }, [containerRef, nodes, setPan, setZoom]);

  useEffect(() => {
    if (!selectedUserId || !containerRef.current) return;
    const targetNode = nodeMap.get(selectedUserId);
    if (!targetNode) return;

    const { clientWidth, clientHeight } = containerRef.current;
    setPan({
      x: clientWidth * 0.38 - (targetNode.x + targetNode.width / 2) * zoom,
      y: clientHeight * 0.5 - (targetNode.y + targetNode.height / 2) * zoom,
    });
  }, [selectedUserId, nodeMap, zoom, containerRef, setPan]);

  const zoomIn = useCallback(() => adjustZoom(1.2), [adjustZoom]);
  const zoomOut = useCallback(() => adjustZoom(0.8), [adjustZoom]);

  return {
    pan,
    zoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    handleFit,
    setPan,
  };
}
