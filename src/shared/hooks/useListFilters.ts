import { useCallback, useState } from 'react';
import { ALL_FILTER } from '../constants/pagination';
import type { ViewMode } from '../types/filters';
import { useDebouncedValue } from './useDebounce';

export interface UseListFiltersOptions {
  initialSearch?: string;
  initialFilter?: string;
  initialTab?: string;
  initialView?: ViewMode;
  allValue?: string;
  debounceMs?: number;
}

export interface ListFiltersApi {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  tab: string;
  setTab: (value: string) => void;
  view: ViewMode;
  setView: (value: ViewMode) => void;
  hasActiveFilters: boolean;
  reset: () => void;
}

export function useListFilters(options: UseListFiltersOptions = {}): ListFiltersApi {
  const {
    initialSearch = '',
    initialFilter = ALL_FILTER,
    initialTab = ALL_FILTER,
    initialView = 'table',
    allValue = ALL_FILTER,
    debounceMs = 250,
  } = options;

  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState<ViewMode>(initialView);
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const reset = useCallback(() => {
    setSearch(initialSearch);
    setFilter(initialFilter);
    setTab(initialTab);
    setView(initialView);
  }, [initialSearch, initialFilter, initialTab, initialView]);

  return {
    search,
    debouncedSearch,
    setSearch,
    filter,
    setFilter,
    tab,
    setTab,
    view,
    setView,
    hasActiveFilters:
      search.trim().length > 0 || filter !== allValue || tab !== initialTab || view !== initialView,
    reset,
  };
}
