import { useCallback, useEffect, useRef, useState } from 'react';

export interface EntryCollectionOptions<T> {
  onChange?: (entries: T[]) => void;
}

export function useEntryCollection<T>(
  initialEntries: T[],
  options: EntryCollectionOptions<T> = {}
) {
  const [entries, setEntries] = useState<T[]>(initialEntries);
  const onChangeRef = useRef(options.onChange);

  useEffect(() => {
    onChangeRef.current = options.onChange;
  }, [options.onChange]);

  const commit = useCallback((next: T[]) => {
    setEntries(next);
    onChangeRef.current?.(next);
  }, []);

  const addEntry = useCallback((entry: T) => commit([...entries, entry]), [entries, commit]);

  const updateEntry = useCallback(
    (index: number, patch: Partial<T>) =>
      commit(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))),
    [entries, commit]
  );

  const replaceEntry = useCallback(
    (index: number, entry: T) => commit(entries.map((current, i) => (i === index ? entry : current))),
    [entries, commit]
  );

  const removeEntry = useCallback(
    (index: number) => commit(entries.filter((_, i) => i !== index)),
    [entries, commit]
  );

  const load = useCallback((next: T[]) => setEntries(next), []);

  return { entries, addEntry, updateEntry, replaceEntry, removeEntry, commit, load };
}
