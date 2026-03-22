import { useState } from 'react';

export function useStaffFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  return {
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    activeStatus,
    setActiveStatus,
  };
}
