import { useState } from 'react';
import { useGetReimbursementsQuery, useCreateReimbursementMutation } from '@/store/api/financeApiSlice';
import type { Reimbursement } from './mockFinance';

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
    } catch (err) {
      console.error('Failed to submit reimbursement request:', err);
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
