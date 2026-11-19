import { useCallback, useState } from 'react';

export function useTabState<T extends string>(items: readonly T[], initialTab?: T) {
  const [activeTab, setActiveTab] = useState<T>(() => initialTab ?? items[0]);

  const reset = useCallback(() => {
    setActiveTab(initialTab ?? items[0]);
  }, [initialTab, items]);

  return { items, activeTab, setActiveTab, reset };
}
