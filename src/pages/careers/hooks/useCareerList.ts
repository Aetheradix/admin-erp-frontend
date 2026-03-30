import { useState } from 'react';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog';
import { useGetCareersQuery, useCreateCareerMutation, useUpdateCareerMutation, useDeleteCareerMutation } from '@/store/api/careerApiSlice';
import { useCareerFilters } from './useCareerFilters';
import type { Career } from './mockCareers';

export const useCareerList = () => {
  const { data: careers = [], isLoading, isError } = useGetCareersQuery();
  const [createCareer] = useCreateCareerMutation();
  const [updateCareer] = useUpdateCareerMutation();
  const [deleteCareer] = useDeleteCareerMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);

  const { searchQuery, setSearchQuery, activeDepartment, setActiveDepartment } = useCareerFilters();

  const filteredCareers = careers.filter((career: Career) => {
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
    const career = careers.find((c: Career) => String(c.id) === String(id));
    if (career) {
      setEditingCareer({
        ...career,
        postedDate: career.postedDate || (career as any).posted_date
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
        } catch (err) {
          console.error('Failed to delete position:', err);
        }
      }
    });
  };

  const handleSubmit = async (data: Partial<Career>) => {
    try {
      if (editingCareer) {
        await updateCareer({ id: editingCareer.id, ...data }).unwrap();
      } else {
        await createCareer(data).unwrap();
      }
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save position:', err);
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
    handleSubmit
  };
};
