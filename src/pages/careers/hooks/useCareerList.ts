import { useState } from 'react';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import { showToast } from '@/components/ui/composed/Toast.utils';
import {
  useGetCareersQuery,
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
} from '@/store/api/careerSlice';
import { useCareerFilters } from './useCareerFilters';
import type { Career } from '@/types/models';

export const useCareerList = () => {
  const { data: careers = [], isLoading, isError } = useGetCareersQuery();
  const [createCareer] = useCreateCareerMutation();
  const [updateCareer] = useUpdateCareerMutation();
  const [deleteCareer] = useDeleteCareerMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);

  const { searchQuery, setSearchQuery, activeDepartment, setActiveDepartment } = useCareerFilters();

  const filteredCareers = careers.filter((career) => {
    const matchesDepartment = activeDepartment === 'All' || career.department === activeDepartment;
    const title = career.title || '';
    const description = career.description || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const handleCreate = () => {
    setEditingCareer(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const career = careers.find((c) => String(c.id) === String(id));
    if (career) {
      setEditingCareer({
        ...career,
        postedDate: career.postedDate || career.posted_date || '',
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      message: 'Are you sure you want to remove this position?',
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          await deleteCareer(id).unwrap();
          showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Position removed successfully!',
            life: 3000,
          });
        } catch (err: unknown) {
          const apiError = err as { data?: { message?: string } };
          console.error('Failed to delete position:', err);
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: apiError.data?.message || 'Failed to delete position',
            life: 3000,
          });
        }
      },
    });
  };

  const handleSubmit = async (data: Partial<Career>) => {
    try {
      if (editingCareer) {
        await updateCareer({ id: editingCareer.id, ...data }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Position updated successfully!',
          life: 3000,
        });
      } else {
        await createCareer(data).unwrap();
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'New position posted successfully!',
          life: 3000,
        });
      }
      setShowForm(false);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to save position:', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to save position',
        life: 3000,
      });
    }
  };

  return {
    careers,
    filteredCareers,
    isLoading,
    isError,
    showForm,
    setShowForm,
    editingCareer,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
  };
};
