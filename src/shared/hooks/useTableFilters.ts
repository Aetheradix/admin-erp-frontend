import { useCallback, useMemo, useState } from 'react';

export interface TableFiltersApi {
  search: string;
  setSearch: (value: string) => void;
  values: Record<string, string>;
  setValues: (values: Record<string, string>) => void;
  setFilter: (key: string, value: string) => void;
  reset: () => void;
  activeValues: Record<string, string>;
  hasActiveFilters: boolean;
}

export function useTableFilters(
  initialValues: Record<string, string> = {},
  allValue = 'All'
): TableFiltersApi {
  const [search, setSearch] = useState('');
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const setFilter = useCallback((key: string, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSearch('');
    setValues(initialValues);
  }, [initialValues]);

  const activeValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(values).filter(([, value]) => Boolean(value) && value !== allValue)
    );
  }, [values, allValue]);

  return {
    search,
    setSearch,
    values,
    setValues,
    setFilter,
    reset,
    activeValues,
    hasActiveFilters: search.trim().length > 0 || Object.keys(activeValues).length > 0,
  };
}
