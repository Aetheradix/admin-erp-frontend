import { useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import type { DataTableFilterMeta } from 'primereact/datatable';


export function useBlogFilters() {
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({
      ...prev,
      global: { ...prev.global, value: value || null },
    }));
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setFilters((prev) => ({
      ...prev,
      category: { ...prev.category as any, value: category === 'All' ? null : category },
    }));
  };

  return {
    searchValue,
    activeCategory,
    filters,
    handleSearchChange,
    handleCategoryChange,
  };
}