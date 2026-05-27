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

  const addExpense = (data: Omit<Expense, 'id' | 'status' | 'date' | 'submittedBy'>) => {
    const newExpense: Expense = {
      ...data,
      id: `EXP-${Math.floor(Math.random() * 10000)}`,
      status: 'pending',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      submittedBy: 'Current User',
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  return {
    expenses: filteredExpenses,
    totalExpenses: expenses.length,
    loading,
    search,
    setSearch,
    addExpense,
  };
};
