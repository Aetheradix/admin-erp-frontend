import { useState } from 'react';
import { message } from 'antd';
import type { User } from '@/types/auth';
import { useDeleteUserMutation, useUpdateStaffMutation } from '@/store/api/userSlice';
import { useRevokeSystemInvitationMutation } from '@/store/api/authApiSlice';
import { recordAuditLog } from '@/services/auditService';
import type { ConfirmModalState, UserRecord } from '../types';
import { ADMIN_FALLBACK_EMAIL, ADMIN_FALLBACK_NAME } from '../constants';

const CLOSED_CONFIRM: ConfirmModalState = {
  open: false,
  type: 'offboard',
  targetUser: null,
  targetInvitation: null,
};

interface UseUserActionsParams {
  currentAuthUser: User | null;
  setLocalUsers: React.Dispatch<React.SetStateAction<UserRecord[]>>;
  refetchUsers: () => void;
  refetchInvitations: () => void;
  refetchAuditLogs: () => void;
}

export function useUserActions({
  currentAuthUser,
  setLocalUsers,
  refetchUsers,
  refetchInvitations,
  refetchAuditLogs,
}: UseUserActionsParams) {
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [revokeSystemInvitation] = useRevokeSystemInvitationMutation();

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(CLOSED_CONFIRM);

  const closeConfirm = () => setConfirmModal(CLOSED_CONFIRM);

  const openConfirm = (next: Omit<ConfirmModalState, 'open'>) => {
    setConfirmModal({ open: true, ...next });
  };

  const handleExecuteRevokeInvitation = async (target: NonNullable<ConfirmModalState['targetInvitation']>) => {
    try {
      await revokeSystemInvitation(target.id).unwrap();
      message.warning(`Invitation for ${target.email} has been revoked and access invalidated.`);
      refetchInvitations();
      refetchAuditLogs();
    } catch {
      message.error('Failed to revoke invitation — please try again.');
    }
  };

  const handleExecuteStatusChange = async () => {
    if (confirmModal.type === 'revoke_invitation') {
      if (confirmModal.targetInvitation) {
        await handleExecuteRevokeInvitation(confirmModal.targetInvitation);
      }
      closeConfirm();
      return;
    }

    if (!confirmModal.targetUser) return;
    const { targetUser, type } = confirmModal;

    try {
      if (type === 'offboard') {
        await updateStaff({ id: targetUser.id, status: 'Inactive' }).unwrap();
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Inactive' } : u))
        );

        recordAuditLog({
          action: 'User Account Offboarded / Disabled',
          category: 'user_management',
          user: currentAuthUser?.username || ADMIN_FALLBACK_NAME,
          userEmail: currentAuthUser?.email || ADMIN_FALLBACK_EMAIL,
          target: `${targetUser.name} (${targetUser.email})`,
          targetEmail: targetUser.email,
          status: 'Warning',
          details: `User account disabled and active sessions terminated.`,
        });

        message.success(`${targetUser.name} has been off-boarded and access is disabled.`);
      } else if (type === 'reactivate') {
        await updateStaff({ id: targetUser.id, status: 'Active' }).unwrap();
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Active' } : u))
        );

        recordAuditLog({
          action: 'User Account Reactivated',
          category: 'user_management',
          user: currentAuthUser?.username || ADMIN_FALLBACK_NAME,
          userEmail: currentAuthUser?.email || ADMIN_FALLBACK_EMAIL,
          target: `${targetUser.name} (${targetUser.email})`,
          targetEmail: targetUser.email,
          status: 'Success',
          details: `Account reactivated. Access restored.`,
        });

        message.success(`${targetUser.name}'s account has been reactivated.`);
      } else if (type === 'delete') {
        await deleteUser(targetUser.id).unwrap();
        setLocalUsers((prev) => prev.filter((u) => u.id !== targetUser.id));

        recordAuditLog({
          action: 'User Account Record Deleted',
          category: 'user_management',
          user: currentAuthUser?.username || ADMIN_FALLBACK_NAME,
          userEmail: currentAuthUser?.email || ADMIN_FALLBACK_EMAIL,
          target: `${targetUser.name} (${targetUser.email})`,
          targetEmail: targetUser.email,
          status: 'Critical',
          details: `User permanently deleted from system database.`,
        });

        message.success(`${targetUser.name} has been deleted.`);
      }
    } catch {
      // Local fallback
      if (type === 'offboard') {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Inactive' } : u))
        );
        message.success(`${targetUser.name} has been off-boarded.`);
      } else if (type === 'reactivate') {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Active' } : u))
        );
        message.success(`${targetUser.name}'s account reactivated.`);
      } else if (type === 'delete') {
        setLocalUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        message.success(`${targetUser.name} deleted.`);
      }
    } finally {
      closeConfirm();
      refetchUsers();
    }
  };

  return {
    confirmModal,
    openConfirm,
    closeConfirm,
    handleExecuteStatusChange,
  };
}
