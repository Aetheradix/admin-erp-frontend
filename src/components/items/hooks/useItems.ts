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

  const addItem = (data: Omit<InventoryItem, 'id' | 'status'>) => {
    const newItem: InventoryItem = {
      ...data,
      id: `ITM-${Math.floor(Math.random() * 10000)}`,
      status: 'active',
    };
    setItems((prev) => [newItem, ...prev]);
  };

  return {
    items: filteredItems,
    totalItems: items.length,
    loading,
    search,
    setSearch,
    addItem,
  };
};
