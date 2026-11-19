import { useCallback, useEffect, useRef, useState } from 'react';

export interface ClipboardState {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

export function useCopyToClipboard(resetDelayMs = 2000): ClipboardState {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, resetDelayMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetDelayMs]
  );

  return { copied, copy };
}
