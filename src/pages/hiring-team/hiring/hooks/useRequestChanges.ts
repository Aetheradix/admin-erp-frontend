import { useState } from 'react';
import { requestProfileChanges } from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { HiringActor } from '../types';

interface UseRequestChangesParams {
  actor: HiringActor;
  refreshList: () => void;
}

export function useRequestChanges({ actor, refreshList }: UseRequestChangesParams) {
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [changesNotes, setChangesNotes] = useState('');
  const [targetUserId, setTargetUserId] = useState<number | null>(null);

  const openChangesModal = (userId: number) => {
    setTargetUserId(userId);
    setChangesNotes('');
    setIsChangesModalOpen(true);
  };

  const closeChangesModal = () => setIsChangesModalOpen(false);

  const submitChanges = () => {
    if (!targetUserId) return;
    if (!changesNotes.trim()) {
      showToast.error('Please provide details on what changes are needed.');
      return;
    }
    try {
      requestProfileChanges(targetUserId, actor.name, actor.email, actor.role, changesNotes.trim());
      showToast.warning('Requested changes sent to employee.');
      setIsChangesModalOpen(false);
      refreshList();
    } catch (err) {
      console.error('Error in handleSubmitChanges:', err);
      showToast.error('Failed to request changes.');
    }
  };

  return {
    isChangesModalOpen,
    changesNotes,
    setChangesNotes,
    openChangesModal,
    closeChangesModal,
    submitChanges,
  };
}
