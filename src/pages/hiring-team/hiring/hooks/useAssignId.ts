import { useState } from 'react';
import {
  assignEmployeeId,
  getEmployeeProfile,
  type ProfileCompletionData,
} from '@/services/employeeProfileService';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { useUpdateStaffMutation } from '@/store/api/userSlice';
import type { StaffMember } from '@/types/models';
import type { HiringActor } from '../types';
import { syncAssignedUserSession } from '../sessionSync';

interface UseAssignIdParams {
  actor: HiringActor;
  dbUsers: StaffMember[];
  refetchDbUsers: () => void;
  refreshList: () => void;
  selectedProfile: ProfileCompletionData | null;
  setSelectedProfile: (profile: ProfileCompletionData | null) => void;
}

function getErrorMessage(err: unknown): string {
  const e = err as { data?: { message?: string }; message?: string } | null;
  return e?.data?.message || e?.message || 'An unexpected error occurred.';
}

export function useAssignId({
  actor,
  dbUsers,
  refetchDbUsers,
  refreshList,
  selectedProfile,
  setSelectedProfile,
}: UseAssignIdParams) {
  const [updateStaff] = useUpdateStaffMutation();

  const [isAssignIdModalOpen, setIsAssignIdModalOpen] = useState(false);
  const [empIdInput, setEmpIdInput] = useState('');
  const [roleInput, setRoleInput] = useState('Employee');
  const [departmentInput, setDepartmentInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');
  const [assignError, setAssignError] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const openAssignId = (profile: ProfileCompletionData) => {
    setSelectedProfile(profile);
    setEmpIdInput(profile.employeeId || `EMP-${String(profile.userId).padStart(4, '0')}`);
    setRoleInput(profile.role || 'Employee');
    setDepartmentInput(profile.department || '');
    setDesignationInput(profile.designation || '');
    setAssignError('');
    setIsAssignIdModalOpen(true);
  };

  const closeAssignId = () => setIsAssignIdModalOpen(false);

  const confirmAssignId = async () => {
    if (!selectedProfile || isAssigning) return;
    if (!empIdInput.trim()) {
      setAssignError('Employee ID cannot be empty');
      return;
    }

    setIsAssigning(true);
    setAssignError('');

    try {
      const cleanId = empIdInput.trim();
      const cleanRole = roleInput.trim() || 'Employee';
      const cleanDept = departmentInput.trim();
      const cleanDesig = designationInput.trim();

      const result = assignEmployeeId(
        selectedProfile.userId,
        cleanId,
        actor.name,
        actor.email,
        actor.role,
        selectedProfile.userEmail,
        selectedProfile.personal?.fullName,
        {
          role: cleanRole,
          department: cleanDept,
          designation: cleanDesig,
        }
      );

      if (result.success) {
        // Also persist to backend MySQL users table if userId exists
        try {
          const targetDbUser = dbUsers.find(
            (u) =>
              (selectedProfile.userEmail &&
                u.email?.toLowerCase().trim() === selectedProfile.userEmail.toLowerCase().trim()) ||
              String(u.id) === String(selectedProfile.userId)
          );
          const targetUserId = targetDbUser?.id || selectedProfile.userId;

          if (targetUserId) {
            await updateStaff({
              id: targetUserId,
              employee_id: cleanId,
              employee_code: cleanId,
              role: cleanRole,
              department: cleanDept,
              designation: cleanDesig,
            }).unwrap();

            refetchDbUsers();
            syncAssignedUserSession(selectedProfile.userEmail, targetUserId, {
              employeeId: cleanId,
              role: cleanRole,
              department: cleanDept,
              designation: cleanDesig,
            });
          }
        } catch (apiErr) {
          console.warn('Backend updateStaff note:', apiErr);
        }

        showToast.success(
          `Employee ID "${cleanId}", Role "${cleanRole}" and details assigned successfully!`
        );
        setIsAssignIdModalOpen(false);
        const fresh = getEmployeeProfile(selectedProfile.userId);
        if (fresh) setSelectedProfile(fresh);
        refreshList();
      } else {
        const errMsg = result.error || 'Failed to assign employee details.';
        setAssignError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err) {
      console.error('Error in handleConfirmAssignId:', err);
      const msg = getErrorMessage(err);
      setAssignError(msg);
      showToast.error(msg);
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    isAssignIdModalOpen,
    empIdInput,
    setEmpIdInput,
    roleInput,
    setRoleInput,
    departmentInput,
    setDepartmentInput,
    designationInput,
    setDesignationInput,
    assignError,
    setAssignError,
    isAssigning,
    openAssignId,
    closeAssignId,
    confirmAssignId,
  };
}
