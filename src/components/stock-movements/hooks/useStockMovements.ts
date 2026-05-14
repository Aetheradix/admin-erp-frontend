import { useState, useEffect, useMemo } from 'react';
import { StockMovement } from '../types';
import { mockMovements } from '../mockData';

export const useStockMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        setMovements(mockMovements);
      } catch (error) {
        console.error('Failed to fetch movements', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchSearch = m.item.toLowerCase().includes(search.toLowerCase()) || m.reference.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || m.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [movements, search, typeFilter]);

  return {
    movements: filteredMovements,
    loading,
    search,
    setSearch,
    setTypeFilter,
  };
};
