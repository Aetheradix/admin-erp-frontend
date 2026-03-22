import { useState } from 'react';

export function useCareerFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('All');

  return {
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
  };
}
