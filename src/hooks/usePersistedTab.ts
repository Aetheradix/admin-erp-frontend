import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PersistOptions<T extends string> {
  paramName?: string;
  defaultTab: T;
  storageKey?: string;
  validTabs?: T[];
}

/**
 * Custom hook to persist active tab/sub-tab across browser refresh,
 * direct URL links, and browser back/forward navigation.
 */
export function usePersistedTab<T extends string>({
  paramName = 'tab',
  defaultTab,
  storageKey,
  validTabs,
}: PersistOptions<T>): [T, (tab: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial tab from URL, then Storage, then default
  const getInitialTab = (): T => {
    // 1. Check URL query param
    const paramVal = searchParams.get(paramName) as T | null;
    if (paramVal && (!validTabs || validTabs.includes(paramVal))) {
      return paramVal;
    }

    // 2. Check URL hash (e.g. #identity)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashVal = window.location.hash.replace('#', '') as T;
      if (hashVal && (!validTabs || validTabs.includes(hashVal))) {
        return hashVal;
      }
    }

    // 3. Check sessionStorage
    if (storageKey && typeof sessionStorage !== 'undefined') {
      const sessionVal = sessionStorage.getItem(storageKey) as T | null;
      if (sessionVal && (!validTabs || validTabs.includes(sessionVal))) {
        return sessionVal;
      }
    }

    // 4. Check localStorage
    if (storageKey && typeof localStorage !== 'undefined') {
      const localVal = localStorage.getItem(storageKey) as T | null;
      if (localVal && (!validTabs || validTabs.includes(localVal))) {
        return localVal;
      }
    }

    return defaultTab;
  };

  const [activeTab, setActiveTabState] = useState<T>(getInitialTab);

  // Sync tab changes to URL and browser storage
  const setTab = useCallback(
    (newTab: T) => {
      setActiveTabState(newTab);

      // Update storage
      if (storageKey) {
        try {
          sessionStorage.setItem(storageKey, newTab);
          localStorage.setItem(storageKey, newTab);
        } catch {}
      }

      // Update URL query parameter without full page reload
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(paramName, newTab);
          return next;
        },
        { replace: true }
      );
    },
    [paramName, storageKey, setSearchParams]
  );

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const currentUrlParam = searchParams.get(paramName) as T | null;
    if (currentUrlParam && currentUrlParam !== activeTab) {
      if (!validTabs || validTabs.includes(currentUrlParam)) {
        setActiveTabState(currentUrlParam);
        if (storageKey) {
          sessionStorage.setItem(storageKey, currentUrlParam);
        }
      }
    }
  }, [searchParams, paramName, activeTab, storageKey, validTabs]);

  return [activeTab, setTab];
}

