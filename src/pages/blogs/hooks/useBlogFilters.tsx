import { useState } from 'react';
import { FilterMatchMode, type DataTableFilterMeta } from '@/components/ui/composed/DataTable';

export function useBlogFilters() {
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
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
      category: { ...prev.category, value: category === 'All' ? null : category },
    }));
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setFilters((prev) => ({
      ...prev,
      status: { ...prev.status, value: status === 'All' ? null : status },
    }));
  };

  return {
    searchValue,
    activeCategory,
    statusFilter,
    filters,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
  };
}
