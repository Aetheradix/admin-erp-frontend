import type { RefObject } from 'react';
import { usePanZoom as useSharedPanZoom } from '@/shared/hooks/usePanZoom';
import type { LayoutBounds, NodePosition } from '../types';

interface UsePanZoomParams {
  containerRef: RefObject<HTMLDivElement | null>;
  bounds: LayoutBounds;
  centralPos: NodePosition;
  isOpen: boolean;
}

export function usePanZoom({ containerRef, bounds, centralPos, isOpen }: UsePanZoomParams) {
  const {
    pan,
    zoom,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    handleFit,
    handleCenter,
  } = useSharedPanZoom({ containerRef, bounds, centralPos, isOpen });

  return {
    pan,
    zoom,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    handleFit,
    handleCenter,
  };
}
