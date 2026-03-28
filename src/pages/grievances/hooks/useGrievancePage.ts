import { useState } from 'react';
import { useGetGrievancesQuery, useSubmitGrievanceMutation } from '@/store/api/grievanceApiSlice';
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
    } catch (err) {
      console.error('Failed to submit grievance:', err);
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
