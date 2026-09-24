import { useMemo, useState } from 'react';
import {
  useGetReimbursementsQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementStatusMutation,
} from '@/store/api/financeApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

// =========================================================
// TYPES & INTERFACES
// =========================================================

export interface Reimbursement {
  id: string | number;
  item: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  receiptUrl?: string;
  description: string;
  user_id: number;
  employee_name: string;
  title: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

export type CreateReimbursementPayload = Partial<
  Omit<Reimbursement, 'id' | 'created_at' | 'updated_at' | 'approved_at'>
>;

export interface FinanceStats {
  totalExpenses: number;
  approvedAmount: number;
  approvedCount: number;
  pendingAmount: number;
  pendingCount: number;
  rejectedAmount: number;
  rejectedCount: number;
}

export const CATEGORIES = [
  'All',
  'Travel',
  'Equipment',
  'Software',
  'Meals',
  'Medical',
  'Office Supplies',
] as const;

export const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'] as const;

// =========================================================
// CUSTOM HOOK
// =========================================================

export const useFinancePage = () => {
  // ---------------------------------------------------------
  // RTK QUERY HOOKS
  // ---------------------------------------------------------
  const {
    data: requests = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetReimbursementsQuery();

  const [createReimbursement, { isLoading: isSubmitting }] = useCreateReimbursementMutation();
  const [updateReimbursementStatus, { isLoading: isUpdatingStatus }] =
    useUpdateReimbursementStatusMutation();

  // ---------------------------------------------------------
  // LOCAL UI STATE
  // ---------------------------------------------------------
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExpense, setSelectedExpense] = useState<Reimbursement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // ---------------------------------------------------------
  // FILTERING LOGIC
  // ---------------------------------------------------------
  const filteredRequests = useMemo(() => {
    return requests.filter((r: Reimbursement) => {
      // Category Filter
      const matchesCategory =
        activeCategory === 'All' || r.category?.toLowerCase() === activeCategory.toLowerCase();

      // Status Filter
      const matchesStatus =
        activeStatus === 'All' || r.status?.toLowerCase() === activeStatus.toLowerCase();

      // Search Query Filter across multiple fields
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        r.title?.toLowerCase().includes(searchLower) ||
        r.item?.toLowerCase().includes(searchLower) ||
        r.employee_name?.toLowerCase().includes(searchLower) ||
        r.category?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        String(r.amount).includes(searchLower);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [requests, activeCategory, activeStatus, searchQuery]);

  // ---------------------------------------------------------
  // FINANCIAL METRICS & SUMMARY
  // ---------------------------------------------------------
  const stats: FinanceStats = useMemo(() => {
    return requests.reduce(
      (acc, curr) => {
        const amount = Number(curr.amount || 0);
        acc.totalExpenses += amount;

        const status = curr.status?.toLowerCase();
        if (status === 'approved') {
          acc.approvedAmount += amount;
          acc.approvedCount += 1;
        } else if (status === 'pending') {
          acc.pendingAmount += amount;
          acc.pendingCount += 1;
        } else if (status === 'rejected') {
          acc.rejectedAmount += amount;
          acc.rejectedCount += 1;
        }

        return acc;
      },
      {
        totalExpenses: 0,
        approvedAmount: 0,
        approvedCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        rejectedAmount: 0,
        rejectedCount: 0,
      }
    );
  }, [requests]);

  // ---------------------------------------------------------
  // ACTION HANDLERS
  // ---------------------------------------------------------
  const handleRequestSubmit = async (data: FormData | CreateReimbursementPayload) => {
    try {
      await createReimbursement(data).unwrap();

      setShowForm(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Expense / Reimbursement request submitted successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to submit expense request:', err);

      showToast({
        severity: 'error',
        summary: 'Submission Error',
        detail: apiError.data?.message || 'Failed to submit expense request.',
        life: 3000,
      });
    }
  };

  const handleApprove = async (id: string | number) => {
    try {
      await updateReimbursementStatus({
        id,
        status: 'Approved',
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Approved',
        detail: 'Expense request approved successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to approve expense:', err);

      showToast({
        severity: 'error',
        summary: 'Approval Error',
        detail: apiError.data?.message || 'Failed to approve request.',
        life: 3000,
      });
    }
  };

  const handleReject = async (id: string | number, rejectionReason?: string) => {
    try {
      await updateReimbursementStatus({
        id,
        status: 'Rejected',
        rejectionReason,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Expense request rejected successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to reject expense:', err);

      showToast({
        severity: 'error',
        summary: 'Rejection Error',
        detail: apiError.data?.message || 'Failed to reject request.',
        life: 3000,
      });
    }
  };

  // ---------------------------------------------------------
  // UTILITY HELPERS
  // ---------------------------------------------------------
  const resetFilters = () => {
    setActiveCategory('All');
    setActiveStatus('All');
    setSearchQuery('');
  };

  const openExpenseDetail = (expense: Reimbursement) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const closeExpenseDetail = () => {
    setSelectedExpense(null);
    setShowDetailModal(false);
  };

  return {
    // Data & Calculations
    requests,
    filteredRequests,
    stats,

    // Loading & Error states
    isLoading,
    isFetching,
    isSubmitting,
    isUpdatingStatus,
    isError,
    error,

    // Form Modal
    showForm,
    setShowForm,

    // Detail Modal
    selectedExpense,
    showDetailModal,
    openExpenseDetail,
    closeExpenseDetail,

    // Filters & Search
    activeCategory,
    setActiveCategory,
    CATEGORIES,
    activeStatus,
    setActiveStatus,
    STATUSES,
    searchQuery,
    setSearchQuery,
    resetFilters,

    // Mutations & Actions
    handleRequestSubmit,
    handleApprove,
    handleReject,
    refetch,
  };
};
