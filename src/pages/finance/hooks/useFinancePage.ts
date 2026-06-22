import { useState } from 'react';
import { useGetReimbursementsQuery, useCreateReimbursementMutation } from '@/store/api/financeApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { Reimbursement } from '@/types/models';

const CATEGORIES = ['All', 'Travel', 'Equipment', 'Software', 'Meals', 'Medical', 'Office Supplies'];

export const useFinancePage = () => {
  const { data: requests = [], isLoading } = useGetReimbursementsQuery();
  const [createReimbursement] = useCreateReimbursementMutation();

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredRequests = requests.filter((r: Reimbursement) =>
    activeCategory === 'All' || r.category === activeCategory
  );

  const handleRequestSubmit = async (data: Partial<Reimbursement>) => {
    try {
      await createReimbursement(data).unwrap();
      setShowForm(false);
      showToast({ severity: 'success', summary: 'Success', detail: 'Reimbursement request submitted.', life: 3000 });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to submit reimbursement request:', err);
      showToast({ severity: 'error', summary: 'Error', detail: apiError.data?.message || 'Failed to submit request.', life: 3000 });
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
    handleRequestSubmit
  };
};
