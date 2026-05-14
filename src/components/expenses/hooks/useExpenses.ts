import { useState, useEffect, useMemo } from 'react';
import { Expense } from '../types';
import { mockExpenses } from '../mockData';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        setExpenses(mockExpenses);
      } catch (error) {
        console.error('Failed to fetch expenses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => e.description.toLowerCase().includes(search.toLowerCase()));
  }, [expenses, search]);

  return {
    expenses: filteredExpenses,
    totalExpenses: expenses.length,
    loading,
    search,
    setSearch,
  };
};
