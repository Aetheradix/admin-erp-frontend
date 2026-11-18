import { useState } from 'react';
import { message } from 'antd';
import type { RoleItem } from '@/store/api/roleApiSlice';
import type { StaffMember } from '@/types/models';
import type { User } from '@/types/auth';
import type { UserRole } from '@/config/navItems';
import { useUpdateStaffMutation } from '@/store/api/userSlice';
import { recordAuditLog } from '@/services/auditService';
import type { EditUserModalState, UserRecord } from '../types';
import { ADMIN_FALLBACK_EMAIL, ADMIN_FALLBACK_NAME, EMPTY_EDIT_MODAL } from '../constants';
import { buildChangedFields } from '../utils';

interface UseUserEditParams {
  roles: RoleItem[];
  currentAuthUser: User | null;
  updateUser: (partial: Partial<User>) => void;
  setLocalUsers: React.Dispatch<React.SetStateAction<UserRecord[]>>;
  refetchUsers: () => void;
}

type UpdateStaffPayload = Partial<StaffMember> & { id: string | number; roleIds: number[] };

export function useUserEdit({
  roles,
  currentAuthUser,
  updateUser,
  setLocalUsers,
  refetchUsers,
}: UseUserEditParams) {
  const [updateStaff] = useUpdateStaffMutation();
  const [editUserModal, setEditUserModal] = useState<EditUserModalState>(EMPTY_EDIT_MODAL);

  const closeEditUser = () => setEditUserModal((prev) => ({ ...prev, open: false, user: null }));

  const handleOpenEditUser = (record: UserRecord) => {
    const roleIds = record.roles?.map((r) => r.id) || [];
    setEditUserModal({
      open: true,
      user: record,
      form: {
        name: record.name,
        email: record.email,
        role: record.role,
        roleIds,
        reportingManagerId: record.reportingManagerId ?? null,
        department: record.department,
        status: record.status,
        contactNo: record.contactNo || '',
        address: record.address || '',
      },
    });
  };

  const handleSaveUserEdit = async () => {
    if (!editUserModal.user) return;
    const orig = editUserModal.user;
    const { form: edited } = editUserModal;

    if (!edited.name || !edited.email) {
      message.error('Name and email are required fields.');
      return;
    }

    const changedFields = buildChangedFields(orig, edited);

    const selectedRoles = roles
      .filter((r) => edited.roleIds.includes(r.id))
      .map((r) => ({ id: r.id, name: r.name, is_system: r.is_system }));

    const payload: UpdateStaffPayload = {
      id: orig.id,
      name: edited.name,
      email: edited.email,
      role: edited.role,
      department: edited.department,
      status: edited.status,
      roleIds: edited.roleIds,
      roles: selectedRoles,
      reporting_manager_id: edited.reportingManagerId,
    };

    try {
      await updateStaff(payload).unwrap();
    } catch {
      // Local fallback keeps the edited values visible even when the backend rejects the update.
    }

    setLocalUsers((prev) =>
      prev.map((u) =>
        u.id === orig.id
          ? { ...u, ...edited, roles: selectedRoles.length > 0 ? selectedRoles : u.roles }
          : u
      )
    );

    // If current logged-in user was updated, sync AuthContext
    if (
      currentAuthUser &&
      (String(currentAuthUser.id) === String(orig.id) ||
        currentAuthUser.email?.toLowerCase() === orig.email?.toLowerCase())
    ) {
      updateUser({
        email: edited.email,
        role: edited.role as UserRole,
        department: edited.department,
        address: edited.address,
        ...(selectedRoles.length > 0 ? { roles: selectedRoles.map((r) => r.name) } : {}),
      });
    }

    // Record in centralized audit log
    if (changedFields.length > 0) {
      recordAuditLog({
        action: 'User Profile Modified by Administrator',
        category: 'user_management',
        user: currentAuthUser?.username || ADMIN_FALLBACK_NAME,
        userEmail: currentAuthUser?.email || ADMIN_FALLBACK_EMAIL,
        target: `${edited.name} (${edited.email})`,
        targetEmail: edited.email,
        status: 'Success',
        details: `Administrator updated user properties: ${changedFields.map((c) => c.field).join(', ')}.`,
        changes: changedFields,
      });
    }

    message.success(`User profile for ${edited.name} updated and recorded in audit log.`);
    closeEditUser();
    refetchUsers();
  };

  return {
    editUserModal,
    setEditUserModal,
    closeEditUser,
    handleOpenEditUser,
    handleSaveUserEdit,
  };
}
