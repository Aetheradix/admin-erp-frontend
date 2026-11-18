import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { WHEEL_ZOOM_FACTORS, ZOOM_LIMITS } from '../constants/zoom';
import type { LayoutBounds, PositionedNode } from '../types/common';

export interface PanState {
  x: number;
  y: number;
}

export interface UsePanZoomOptions {
  containerRef: RefObject<HTMLElement | null>;
  isOpen?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  initialPan?: PanState;
  step?: number;
  wheelZoomIn?: number;
  wheelZoomOut?: number;
  fitPadding?: number;
  fitMin?: number;
  fitMax?: number;
  fitMinBounds?: number;
  centerZoom?: number;
  bounds?: LayoutBounds | null;
  centralPos?: PositionedNode | null;
  dragIgnoreSelector?: string;
}

export interface PanZoomApi {
  pan: PanState;
  zoom: number;
  isDragging: boolean;
  setPan: (pan: PanState) => void;
  setZoom: (zoom: number) => void;
  handlePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  adjustZoom: (factor: number) => void;
  handleFit: () => void;
  handleCenter: () => void;
}

interface ViewState {
  pan: PanState;
  zoom: number;
}

const DEFAULT_DRAG_IGNORE = '[data-node-card], button, a, input, select';

export function usePanZoom({
  containerRef,
  isOpen = true,
  minZoom = ZOOM_LIMITS.MIN,
  maxZoom = ZOOM_LIMITS.MAX,
  defaultZoom = ZOOM_LIMITS.DEFAULT,
  initialPan = { x: 0, y: 0 },
  step = ZOOM_LIMITS.STEP,
  wheelZoomIn = WHEEL_ZOOM_FACTORS.IN,
  wheelZoomOut = WHEEL_ZOOM_FACTORS.OUT,
  fitPadding = ZOOM_LIMITS.CANVAS_PADDING,
  fitMin = ZOOM_LIMITS.FIT_MIN,
  fitMax = ZOOM_LIMITS.FIT_MAX,
  fitMinBounds = 300,
  centerZoom = 1,
  bounds,
  centralPos,
  dragIgnoreSelector = DEFAULT_DRAG_IGNORE,
}: UsePanZoomOptions): PanZoomApi {
  const [view, setView] = useState<ViewState>({
    pan: initialPan,
    zoom: defaultZoom,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const setPan = useCallback((pan: PanState) => {
    setView((current) => ({ ...current, pan }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setView((current) => ({ ...current, zoom }));
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !isOpen) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? wheelZoomIn : wheelZoomOut;

      setView((current) => {
        const nextZoom = Math.min(Math.max(current.zoom * factor, minZoom), maxZoom);
        if (nextZoom === current.zoom) return current;
        return {
          zoom: nextZoom,
          pan: {
            x: mouseX - (mouseX - current.pan.x) * (nextZoom / current.zoom),
            y: mouseY - (mouseY - current.pan.y) * (nextZoom / current.zoom),
          },
        };
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [containerRef, isOpen, minZoom, maxZoom, wheelZoomIn, wheelZoomOut]);

  const adjustZoom = useCallback(
    (factor: number) => {
      const element = containerRef.current;
      if (!element) return;
      const centerX = element.clientWidth / 2;
      const centerY = element.clientHeight / 2;

      setView((current) => {
        const nextZoom = Math.min(Math.max(current.zoom * factor, minZoom), maxZoom);
        if (nextZoom === current.zoom) return current;
        return {
          zoom: nextZoom,
          pan: {
            x: centerX - (centerX - current.pan.x) * (nextZoom / current.zoom),
            y: centerY - (centerY - current.pan.y) * (nextZoom / current.zoom),
          },
        };
      });
    },
    [containerRef, minZoom, maxZoom]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement).closest(dragIgnoreSelector)) return;
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        panX: view.pan.x,
        panY: view.pan.y,
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dragIgnoreSelector, view.pan.x, view.pan.y]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setView((current) => ({
        ...current,
        pan: {
          x: dragStartRef.current.panX + (event.clientX - dragStartRef.current.x),
          y: dragStartRef.current.panY + (event.clientY - dragStartRef.current.y),
        },
      }));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    },
    [isDragging]
  );

  const zoomIn = useCallback(() => adjustZoom(step), [adjustZoom, step]);
  const zoomOut = useCallback(() => adjustZoom(1 / step), [adjustZoom, step]);

  const handleFit = useCallback(() => {
    const element = containerRef.current;
    if (!element || !bounds || element.clientWidth === 0 || element.clientHeight === 0) return;

    const availableWidth = Math.max(100, element.clientWidth - fitPadding);
    const availableHeight = Math.max(100, element.clientHeight - fitPadding);
    const fitScale = Math.min(
      Math.max(
        Math.min(
          availableWidth / Math.max(bounds.width, fitMinBounds),
          availableHeight / Math.max(bounds.height, fitMinBounds)
        ),
        fitMin
      ),
      fitMax
    );

    setView({
      zoom: fitScale,
      pan: {
        x: element.clientWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * fitScale,
        y: element.clientHeight / 2 - ((bounds.minY + bounds.maxY) / 2) * fitScale,
      },
    });
  }, [containerRef, bounds, fitPadding, fitMin, fitMax, fitMinBounds]);

  const handleCenter = useCallback(() => {
    const element = containerRef.current;
    if (!element || !centralPos) return;
    setView({
      zoom: centerZoom,
      pan: {
        x: element.clientWidth / 2 - (centralPos.x + centralPos.width / 2) * centerZoom,
        y: element.clientHeight / 2 - (centralPos.y + centralPos.height / 2) * centerZoom,
      },
    });
  }, [containerRef, centralPos, centerZoom]);

  return {
    pan: view.pan,
    zoom: view.zoom,
    isDragging,
    setPan,
    setZoom,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    adjustZoom,
    handleFit,
    handleCenter,
  };
}
