import { useState } from 'react';
import { useGetGrievancesQuery, useSubmitGrievanceMutation } from '@/store/api/grievanceApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { Grievance } from './mockGrievances';

const CATEGORIES = ['All', 'Work Environment', 'Management', 'Harassment', 'Software/Tools', 'Other'];

export const useGrievancePage = () => {
  const { data: grievances = [], isLoading, isError } = useGetGrievancesQuery();
  const [submitGrievance] = useSubmitGrievanceMutation();

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGrievances = grievances.filter((g: Grievance) =>
    activeCategory === 'All' || g.category === activeCategory
  );

  const handleGrievanceSubmit = async (data: Partial<Grievance>) => {
    try {
      await submitGrievance(data).unwrap();
      setShowForm(false);
      showToast({ severity: 'success', summary: 'Submitted', detail: 'Grievance submitted successfully.', life: 3000 });
    } catch (err: any) {
      console.error('Failed to submit grievance:', err);
      showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to submit grievance.', life: 3000 });
    }
  };

  return {
    grievances,
    filteredGrievances,
    isLoading,
    isError,
    showForm,
    setShowForm,
    activeCategory,
    setActiveCategory,
    CATEGORIES,
    handleGrievanceSubmit
  };
};
