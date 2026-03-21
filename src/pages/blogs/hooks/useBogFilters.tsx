import { useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import type { DataTableFilterMeta } from 'primereact/datatable';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBlogFilters() {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({
      ...prev,
      global: { ...prev.global, value: value || null },
    }));
  };

  return {
    searchValue,
    filters,
    handleSearchChange,
  };
}