import { useState } from 'react';
import {
  useGetReimbursementsQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementStatusMutation,
} from '@/store/api/financeApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { Reimbursement } from '@/types/models';

const CATEGORIES = [
  'All',
  'Travel',
  'Equipment',
  'Software',
  'Meals',
  'Medical',
  'Office Supplies',
];

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

export const useFinancePage = () => {
  const { data: requests = [], isLoading } = useGetReimbursementsQuery();

  const [createReimbursement] = useCreateReimbursementMutation();
  const [updateReimbursementStatus] = useUpdateReimbursementStatusMutation();

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const filteredRequests = requests.filter((r: Reimbursement) => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;

    const matchesStatus = activeStatus === 'All' || r.status === activeStatus;

    return matchesCategory && matchesStatus;
  });

  const handleRequestSubmit = async (data: Partial<Reimbursement>) => {
    try {
      await createReimbursement(data).unwrap();

      setShowForm(false);

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Reimbursement request submitted.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to submit reimbursement request:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to submit request.',
        life: 3000,
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateReimbursementStatus({
        id,
        status: 'Approved',
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Approved',
        detail: 'Reimbursement request approved successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to approve reimbursement:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to approve request.',
        life: 3000,
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateReimbursementStatus({
        id,
        status: 'Rejected',
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Reimbursement request rejected successfully.',
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };

      console.error('Failed to reject reimbursement:', err);

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to reject request.',
        life: 3000,
      });
    }
  };

  return {
    requests,
    filteredRequests,
    isLoading,
    showForm,
    setShowForm,
    activeCategory,
    setActiveCategory,
    CATEGORIES,
    activeStatus,
    setActiveStatus,
    STATUSES,
    handleRequestSubmit,
    handleApprove,
    handleReject,
  };
};
