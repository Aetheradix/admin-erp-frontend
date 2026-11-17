import { useState, useRef, useEffect, useCallback, type RefObject, type PointerEvent } from 'react';
import type { LayoutBounds, NodePosition } from '../types';
import { ZOOM_LIMITS } from '../constants';

interface UsePanZoomParams {
  containerRef: RefObject<HTMLDivElement | null>;
  bounds: LayoutBounds;
  centralPos: NodePosition;
  isOpen: boolean;
}

export function usePanZoom({ containerRef, bounds, centralPos, isOpen }: UsePanZoomParams) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(ZOOM_LIMITS.DEFAULT);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Native Wheel Zoom Handler with non-passive listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;

      setZoom((prev) => {
        const next = Math.min(Math.max(prev * factor, ZOOM_LIMITS.MIN), ZOOM_LIMITS.MAX);
        setPan((p) => ({
          x: mouseX - (mouseX - p.x) * (next / prev),
          y: mouseY - (mouseY - p.y) * (next / prev),
        }));
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef, isOpen]);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-node-card], button, a, input, select')) return;
    setIsDragging(true);
    setPan((curr) => {
      dragStartRef.current = { x: e.clientX, y: e.clientY, panX: curr.x, panY: curr.y };
      return curr;
    });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.y),
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    }
  }, [isDragging]);

  const adjustZoom = useCallback((factor: number, min: number, max: number) => {
    const el = containerRef.current;
    if (!el) return;
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    setZoom((curr) => {
      const next = Math.min(Math.max(curr * factor, min), max);
      setPan((p) => ({ x: cx - (cx - p.x) * (next / curr), y: cy - (cy - p.y) * (next / curr) }));
      return next;
    });
  }, [containerRef]);

  const zoomIn = useCallback(() => adjustZoom(ZOOM_LIMITS.STEP, ZOOM_LIMITS.MIN, ZOOM_LIMITS.MAX), [adjustZoom]);
  const zoomOut = useCallback(() => adjustZoom(1 / ZOOM_LIMITS.STEP, ZOOM_LIMITS.MIN, ZOOM_LIMITS.MAX), [adjustZoom]);

  const handleFit = useCallback(() => {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
    const availW = Math.max(100, el.clientWidth - ZOOM_LIMITS.CANVAS_PADDING);
    const availH = Math.max(100, el.clientHeight - ZOOM_LIMITS.CANVAS_PADDING);
    const fitScale = Math.min(
      Math.max(Math.min(availW / Math.max(bounds.width, 300), availH / Math.max(bounds.height, 300)), ZOOM_LIMITS.FIT_MIN),
      ZOOM_LIMITS.FIT_MAX
    );
    setZoom(fitScale);
    setPan({
      x: el.clientWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * fitScale,
      y: el.clientHeight / 2 - ((bounds.minY + bounds.maxY) / 2) * fitScale,
    });
  }, [containerRef, bounds]);

  const handleCenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setZoom(1.0);
    setPan({
      x: el.clientWidth / 2 - (centralPos.x + centralPos.width / 2) * 1.0,
      y: el.clientHeight / 2 - (centralPos.y + centralPos.height / 2) * 1.0,
    });
  }, [containerRef, centralPos]);

  return { pan, zoom, isDragging, handlePointerDown, handlePointerMove, handlePointerUp, zoomIn, zoomOut, handleFit, handleCenter };
}
