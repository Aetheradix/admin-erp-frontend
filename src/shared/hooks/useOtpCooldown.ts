import { useCallback, useEffect, useRef, useState } from 'react';

export function useOtpCooldown(durationSeconds = 60) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds?: number) => {
      clear();
      setRemaining(seconds ?? durationSeconds);
      intervalRef.current = setInterval(() => {
        setRemaining((current) => (current <= 1 ? 0 : current - 1));
      }, 1000);
    },
    [clear, durationSeconds]
  );

  const stop = useCallback(() => {
    clear();
    setRemaining(0);
  }, [clear]);

  useEffect(() => {
    if (remaining === 0) clear();
  }, [remaining, clear]);

  useEffect(() => () => clear(), [clear]);

  return { remaining, isCooling: remaining > 0, start, stop };
}
