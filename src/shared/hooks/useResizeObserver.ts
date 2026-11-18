import { useEffect, useRef, type RefObject } from 'react';

export function useResizeObserver<T extends Element>(
  ref: RefObject<T | null>,
  callback: (entry: ResizeObserverEntry) => void,
  enabled = true
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) callbackRef.current(entry);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);
}
