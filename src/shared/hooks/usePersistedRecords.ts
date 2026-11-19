import { useCallback, useState } from 'react';
import { readJson, writeJson } from '../utils/storage';

export function usePersistedRecords<T>(key: string, fallback: T) {
  const [records, setRecords] = useState<T>(() => readJson(key, fallback));

  const save = useCallback(
    (next: T) => {
      setRecords(next);
      writeJson(key, next);
    },
    [key]
  );

  const patch = useCallback(
    (updater: (current: T) => T) => save(updater(records)),
    [records, save]
  );

  const reload = useCallback(() => setRecords(readJson(key, fallback)), [key, fallback]);

  return { records, save, patch, reload };
}
