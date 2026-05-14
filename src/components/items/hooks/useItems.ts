import { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '../types';
import { mockItems } from '../mockData';

export const useItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        setItems(mockItems);
      } catch (error) {
        console.error('Failed to fetch items', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  return {
    items: filteredItems,
    totalItems: items.length,
    loading,
    search,
    setSearch,
  };
};
