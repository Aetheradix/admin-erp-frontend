import { useState, useEffect } from 'react';
import { StockItem } from '../types';
import { mockStockData } from '../mockData';

export const useStock = () => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        setStock(mockStockData);
      } catch (error) {
        console.error('Failed to fetch stock', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const stats = {
    good: stock.filter(s => s.level === 'good').length,
    low: stock.filter(s => s.level === 'low').length,
    critical: stock.filter(s => s.level === 'critical' || s.level === 'out').length,
  };

  return {
    stock,
    stats,
    loading,
  };
};
