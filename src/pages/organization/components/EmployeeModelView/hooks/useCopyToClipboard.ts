import { useState, useRef, useEffect, useCallback } from 'react';
import { message } from 'antd';

export function useCopyToClipboard(resetDelayMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string, successMsg?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (successMsg) {
          message.success(successMsg);
        }
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
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
