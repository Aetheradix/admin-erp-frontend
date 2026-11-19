import {
  approveProfile,
  getEmployeeProfile,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { HiringActor } from '../types';

interface UseHiringActionsParams {
  actor: HiringActor;
  refreshList: () => void;
  setSelectedProfile: (profile: ProfileCompletionData | null) => void;
}

export function useHiringActions({ actor, refreshList, setSelectedProfile }: UseHiringActionsParams) {
  const handleApprove = (
    userId: number | string,
    employeeEmail?: string,
    employeeName?: string
  ) => {
    try {
      approveProfile(userId, actor.name, actor.email, actor.role, employeeEmail, employeeName);
      showToast.success('Employee profile approved!');
      const fresh = getEmployeeProfile(userId);
      if (fresh) setSelectedProfile(fresh);
      refreshList();
    } catch (err) {
      console.error('Error in handleApprove:', err);
      showToast.error('Failed to approve profile.');
    }
  };

  return { handleApprove };
}
