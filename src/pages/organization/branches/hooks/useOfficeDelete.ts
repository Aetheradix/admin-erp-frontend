import { useState } from 'react';
import { useDeleteOfficeMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { getApiErrorMessage } from '@/shared/utils/apiError';

export function useOfficeDelete() {
  const [deleteOffice, { isLoading: isDeleting }] = useDeleteOfficeMutation();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const closeDeleteConfirm = () => setDeleteConfirmId(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteOffice(id).unwrap();
      showToast({ severity: 'success', summary: 'Deleted', detail: 'Office location removed.' });
      setDeleteConfirmId(null);
    } catch (err) {
      showToast({
        severity: 'error',
        summary: 'Delete Failed',
        detail: getApiErrorMessage(err, 'Could not delete office.'),
      });
    }
  };

  return { deleteConfirmId, setDeleteConfirmId, closeDeleteConfirm, handleDelete, isDeleting };
}
