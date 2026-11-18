import { useCallback, useMemo, useState } from 'react';
import type { ExpenseRecord } from '@/store/api/expenseSlice';
import type { DateRangePreset } from '../types';
import { filterExpensesByDateRange } from '../utils';

export function useExpenseDateFilter(expenses: ExpenseRecord[]) {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const dateFilteredExpenses = useMemo(
    () => filterExpensesByDateRange(expenses, datePreset, customStartDate, customEndDate),
    [expenses, datePreset, customStartDate, customEndDate]
  );

  const clearCustomDates = useCallback(() => {
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  const resetDateFilter = useCallback(() => {
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  return {
    datePreset,
    setDatePreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    dateFilteredExpenses,
    clearCustomDates,
    resetDateFilter,
  };
}
