import { useMemo, useState } from 'react';
import {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseStatusMutation,
  type ExpenseRecord,
} from '@/store/api/expenseSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

// =========================================================
// CONSTANTS & TYPES
// =========================================================

export const EXPENSE_CATEGORIES = [
  'All',
  'Travel',
  'Equipment',
  'Software',
  'Meals',
  'Medical',
  'Office Supplies',
  'Client Entertainment',
  'Other',
] as const;

export const EXPENSE_STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Paid'] as const;

export interface CompanyExpenseStats {
  totalExpenses: number;
  pendingAmount: number;
  pendingCount: number;
  approvedAmount: number;
  approvedCount: number;
  paidAmount: number;
  paidCount: number;
  rejectedAmount: number;
  rejectedCount: number;
}

// =========================================================
// CUSTOM HOOK
// =========================================================

export const useExpensesPage = () => {
  // ---------------------------------------------------------
  // RTK QUERY HOOKS
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // LOCAL UI STATE
  // ---------------------------------------------------------
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ---------------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------------
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense: ExpenseRecord) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All' ||
        expense.category?.toLowerCase() === activeCategory.toLowerCase();

      // Status filter
      const matchesStatus =
        activeStatus === 'All' || expense.status?.toLowerCase() === activeStatus.toLowerCase();

      // Multi-field search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        expense.title?.toLowerCase().includes(q) ||
        expense.expense_number?.toLowerCase().includes(q) ||
        expense.vendor_name?.toLowerCase().includes(q) ||
        expense.employee_name?.toLowerCase().includes(q) ||
        expense.category?.toLowerCase().includes(q) ||
        expense.payment_mode?.toLowerCase().includes(q) ||
        String(expense.amount).includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [expenses, activeCategory, activeStatus, searchQuery]);

  // ---------------------------------------------------------
  // COMPANY FINANCIAL METRICS & STATS
  // ---------------------------------------------------------
  const stats: CompanyExpenseStats = useMemo(() => {
    return expenses.reduce(
      (acc, curr) => {
        const amount = Number(curr.amount || 0);
        acc.totalExpenses += amount;

        const status = curr.status?.toLowerCase();
        if (status === 'pending') {
          acc.pendingAmount += amount;
          acc.pendingCount += 1;
        } else if (status === 'approved') {
          acc.approvedAmount += amount;
          acc.approvedCount += 1;
        } else if (status === 'paid') {
          acc.paidAmount += amount;
          acc.paidCount += 1;
        } else if (status === 'rejected') {
          acc.rejectedAmount += amount;
          acc.rejectedCount += 1;
        }

        return acc;
      },
      {
        totalExpenses: 0,
        pendingAmount: 0,
        pendingCount: 0,
        approvedAmount: 0,
        approvedCount: 0,
        paidAmount: 0,
        paidCount: 0,
        rejectedAmount: 0,
        rejectedCount: 0,
      }
    );
  }, [expenses]);

  // ---------------------------------------------------------
  // ACTION HANDLERS
  // ---------------------------------------------------------
  const handleCreateExpense = async (formData: FormData) => {
    try {
      await createExpense(formData).unwrap();
      setShowFormModal(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Expense recorded successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to create expense:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to submit expense record.',
        life: 3000,
      });
    }
  };

  const handleApprove = async (id: number | string, approvedBy?: number) => {
    try {
      await updateExpenseStatus({
        id,
        status: 'Approved',
        approvedBy,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Approved',
        detail: 'Expense marked as Approved.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to approve expense:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to approve expense.',
        life: 3000,
      });
    }
  };

  const handleReject = async (id: number | string, rejectionReason?: string) => {
    try {
      await updateExpenseStatus({
        id,
        status: 'Rejected',
        rejectionReason,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Expense marked as Rejected.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to reject expense:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to reject expense.',
        life: 3000,
      });
    }
  };

  const handleMarkAsPaid = async (id: number | string) => {
    try {
      await updateExpenseStatus({
        id,
        status: 'Paid',
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Marked as Paid',
        detail: 'Expense status updated to Paid.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to mark expense as paid:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to update payment status.',
        life: 3000,
      });
    }
  };

  // ---------------------------------------------------------
  // MODAL HELPERS
  // ---------------------------------------------------------
  const openDetails = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const closeDetails = () => {
    setSelectedExpense(null);
    setShowDetailModal(false);
  };

  const resetFilters = () => {
    setActiveCategory('All');
    setActiveStatus('All');
    setSearchQuery('');
  };

  return {
    // Data
    expenses,
    filteredExpenses,
    stats,

    // Status Flags
    isLoading,
    isFetching,
    isSubmitting,
    isUpdatingStatus,
    isError,
    error,

    // Modals
    showFormModal,
    setShowFormModal,
    showDetailModal,
    selectedExpense,
    openDetails,
    closeDetails,

    // Search & Filters
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    categories: EXPENSE_CATEGORIES,
    activeStatus,
    setActiveStatus,
    statuses: EXPENSE_STATUSES,
    resetFilters,

    // Actions & Mutations
    handleCreateExpense,
    handleApprove,
    handleReject,
    handleMarkAsPaid,
    refetch,
  };
};
