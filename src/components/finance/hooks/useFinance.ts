import { useState, useEffect } from 'react';
import { Transaction, BudgetItem } from '../types';
import { recentTransactions as mockRecentTransactions, budgetItems as mockBudgetItems } from '../mockData';

export const useFinance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTransactions(mockRecentTransactions);
        setBudgetItems(mockBudgetItems);
      } catch (error) {
        console.error('Failed to fetch finance data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  return {
    transactions,
    budgetItems,
    loading,
  };
};
