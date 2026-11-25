import { useCallback, useMemo, useState } from 'react';
import {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseStatusMutation,
  type ExpenseRecord,
} from '@/store/api/expenseSlice';
import { notifyError, notifySuccess } from '../notifications';
import { EXPENSE_ALL } from '../expenses/constants';
import type { CompanyExpenseStats } from '../expenses/types';
import { computeExpenseStats, filterExpenses } from '../expenses/utils';

export { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../expenses/constants';

export type { CompanyExpenseStats };

export const useExpensesPage = () => {
  const {
    data: expenses = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllExpensesQuery();

  const [createExpense, { isLoading: isSubmitting }] = useCreateExpenseMutation();
  const [updateExpenseStatus, { isLoading: isUpdatingStatus }] = useUpdateExpenseStatusMutation();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>(EXPENSE_ALL);
  const [activeStatus, setActiveStatus] = useState<string>(EXPENSE_ALL);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = useMemo(
    () =>
      filterExpenses(expenses, {
        category: activeCategory,
        status: activeStatus,
        search: searchQuery,
      }),
    [expenses, activeCategory, activeStatus, searchQuery]
  );

  const stats: CompanyExpenseStats = useMemo(() => computeExpenseStats(expenses), [expenses]);

  const handleCreateExpense = useCallback(
    async (formData: FormData) => {
      try {
        await createExpense(formData).unwrap();
        setShowFormModal(false);
        notifySuccess('Expense recorded successfully.');
      } catch (err) {
        notifyError(err, 'Failed to submit expense record.', 'Error');
      }
    },
    [createExpense]
  );

  const handleApprove = useCallback(
    async (id: number | string, approvedBy?: number) => {
      try {
        await updateExpenseStatus({ id, status: 'Approved', approvedBy }).unwrap();
        notifySuccess('Expense marked as Approved.', 'Approved');
      } catch (err) {
        notifyError(err, 'Failed to approve expense.', 'Error');
      }
    },
    [updateExpenseStatus]
  );

  const handleReject = useCallback(
    async (id: number | string, rejectionReason?: string) => {
      try {
        await updateExpenseStatus({ id, status: 'Rejected', rejectionReason }).unwrap();
        notifySuccess('Expense marked as Rejected.', 'Rejected');
      } catch (err) {
        notifyError(err, 'Failed to reject expense.', 'Error');
      }
    },
    [updateExpenseStatus]
  );

  const handleMarkAsPaid = useCallback(
    async (id: number | string) => {
      try {
        await updateExpenseStatus({ id, status: 'Paid' }).unwrap();
        notifySuccess('Expense status updated to Paid.', 'Marked as Paid');
      } catch (err) {
        notifyError(err, 'Failed to update payment status.', 'Error');
      }
    },
    [updateExpenseStatus]
  );

  const openDetails = useCallback((expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedExpense(null);
    setShowDetailModal(false);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveCategory(EXPENSE_ALL);
    setActiveStatus(EXPENSE_ALL);
    setSearchQuery('');
  }, []);

  return {
    expenses,
    filteredExpenses,
    stats,

    isLoading,
    isFetching,
    isSubmitting,
    isUpdatingStatus,
    isError,
    error,

    showFormModal,
    setShowFormModal,
    showDetailModal,
    selectedExpense,
    openDetails,
    closeDetails,

    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    resetFilters,

    handleCreateExpense,
    handleApprove,
    handleReject,
    handleMarkAsPaid,
    refetch,
  };
};
