import { useCallback, useMemo, useState } from 'react';
import {
  useGetReimbursementsQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementStatusMutation,
} from '@/store/api/financeApiSlice';
import { filterReimbursements, computeFinanceStats } from '../reimbursements/utils';
import { REIMBURSEMENT_ALL } from '../reimbursements/constants';
import type { CreateReimbursementPayload, Reimbursement } from '../reimbursements/types';
import { notifyError, notifySuccess } from '../notifications';

export const useFinancePage = () => {
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

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(REIMBURSEMENT_ALL);
  const [activeStatus, setActiveStatus] = useState<string>(REIMBURSEMENT_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Reimbursement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredRequests = useMemo(
    () =>
      filterReimbursements(requests, {
        category: activeCategory,
        status: activeStatus,
        search: searchQuery,
      }),
    [requests, activeCategory, activeStatus, searchQuery]
  );

  const stats = useMemo(() => computeFinanceStats(requests), [requests]);

  const handleRequestSubmit = useCallback(
    async (data: CreateReimbursementPayload) => {
      try {
        await createReimbursement(data).unwrap();
        setShowForm(false);
        notifySuccess('Expense / Reimbursement request submitted successfully.');
      } catch (err) {
        notifyError(err, 'Failed to submit expense request.', 'Submission Error');
      }
    },
    [createReimbursement]
  );

  const handleApprove = useCallback(
    async (id: string | number) => {
      try {
        await updateReimbursementStatus({ id: String(id), status: 'Approved' }).unwrap();
        notifySuccess('Expense request approved successfully.', 'Approved');
      } catch (err) {
        notifyError(err, 'Failed to approve request.', 'Approval Error');
      }
    },
    [updateReimbursementStatus]
  );

  const handleReject = useCallback(
    async (id: string | number, rejectionReason?: string) => {
      try {
        await updateReimbursementStatus({
          id: String(id),
          status: 'Rejected',
          rejectionReason,
        }).unwrap();
        notifySuccess('Expense request rejected successfully.', 'Rejected');
      } catch (err) {
        notifyError(err, 'Failed to reject request.', 'Rejection Error');
      }
    },
    [updateReimbursementStatus]
  );

  const resetFilters = useCallback(() => {
    setActiveCategory(REIMBURSEMENT_ALL);
    setActiveStatus(REIMBURSEMENT_ALL);
    setSearchQuery('');
  }, []);

  const openExpenseDetail = useCallback((expense: Reimbursement) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  }, []);

  const closeExpenseDetail = useCallback(() => {
    setSelectedExpense(null);
    setShowDetailModal(false);
  }, []);

  return {
    requests,
    filteredRequests,
    stats,

    isLoading,
    isFetching,
    isSubmitting,
    isUpdatingStatus,
    isError,
    error,

    showForm,
    setShowForm,

    selectedExpense,
    showDetailModal,
    openExpenseDetail,
    closeExpenseDetail,

    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    searchQuery,
    setSearchQuery,
    resetFilters,

    handleRequestSubmit,
    handleApprove,
    handleReject,
    refetch,
  };
};
