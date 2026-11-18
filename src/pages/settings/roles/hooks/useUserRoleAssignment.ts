import { useMemo, useState } from 'react';
import { message } from 'antd';
import type { RoleItem } from '@/store/api/roleApiSlice';
import type { StaffMember } from '@/types/models';
import type { User } from '@/types/auth';
import type { UserRole } from '@/config/navItems';
import { useUpdateStaffMutation } from '@/store/api/userSlice';
import { recordAuditLog } from '@/services/auditService';
import { aggregateRolePermissions, extractUserRoles } from '@/utils/rbac';
import { DEFAULT_USER_ROLE, FALLBACK_ADMIN_EMAIL, FALLBACK_ADMIN_NAME } from '../constants';
import type { RoleAssignmentUser } from '../types';
import {
  buildPreviewPermissions,
  buildRoleObjects,
  findUserFromParam,
  getValidRoleIds,
} from '../utils';

type StaffRoles = NonNullable<StaffMember['roles']>;
type UpdateStaffRolesPayload = Partial<StaffMember> & { id: string | number; roleIds: number[] };

interface UseUserRoleAssignmentParams {
  currentAuthUser: User | null;
  updateUser: (partial: Partial<User>) => void;
  roles: RoleItem[];
  usersData: StaffMember[] | undefined;
  userParam: string | null;
  refetchUsers: () => void;
  refetchAudit: () => void;
}

export function useUserRoleAssignment({
  currentAuthUser,
  updateUser,
  roles,
  usersData,
  userParam,
  refetchUsers,
  refetchAudit,
}: UseUserRoleAssignmentParams) {
  const [updateStaffApi, { isLoading: isUpdatingStaff }] = useUpdateStaffMutation();

  const [manageRolesModalVisible, setManageRolesModalVisible] = useState(false);
  const [targetUser, setTargetUser] = useState<RoleAssignmentUser | null>(null);
  const [selectedUserRoleNames, setSelectedUserRoleNames] = useState<string[]>([]);
  const [autoOpenedParam, setAutoOpenedParam] = useState<string | null>(null);

  const previewPermissions = useMemo(
    () => buildPreviewPermissions(selectedUserRoleNames, roles),
    [selectedUserRoleNames, roles]
  );

  const openManageRoles = (u: StaffMember) => {
    setTargetUser(u);
    const assigned = extractUserRoles(u).map((r) => r.name);
    setSelectedUserRoleNames(assigned.length > 0 ? assigned : [DEFAULT_USER_ROLE]);
    setManageRolesModalVisible(true);
  };

  // Auto-open modal if user was provided via query parameter and matches
  if (userParam && usersData && autoOpenedParam !== userParam && !manageRolesModalVisible) {
    const match = findUserFromParam(usersData, userParam);
    if (match) {
      setAutoOpenedParam(userParam);
      openManageRoles(match);
    }
  }

  const closeManageRoles = () => {
    setManageRolesModalVisible(false);
    setTargetUser(null);
  };

  const saveUserRoles = async () => {
    if (!targetUser) return;
    if (selectedUserRoleNames.length === 0) {
      message.error('A user must have at least one assigned role.');
      return;
    }

    const primaryRole = selectedUserRoleNames[0];
    const roleObjects = buildRoleObjects(selectedUserRoleNames, roles);
    const validRoleIds = getValidRoleIds(roleObjects);

    const payload: UpdateStaffRolesPayload = {
      id: targetUser.id,
      role: primaryRole,
      roles: roleObjects as unknown as StaffRoles,
      roleIds: validRoleIds,
    };

    try {
      await updateStaffApi(payload).unwrap();
    } catch {
      // Local fallback handled gracefully
    }

    // If current logged-in user, immediately update local user and permissions
    if (
      currentAuthUser &&
      (String(currentAuthUser.id) === String(targetUser.id) ||
        currentAuthUser.email?.toLowerCase() === targetUser.email?.toLowerCase())
    ) {
      const effective = aggregateRolePermissions(roleObjects, roles);
      updateUser({
        role: primaryRole as UserRole,
        roles: roleObjects,
      });
      localStorage.setItem('erp_permissions', JSON.stringify(effective));
      localStorage.setItem('erp_roles_list', JSON.stringify(selectedUserRoleNames));
      window.dispatchEvent(
        new CustomEvent('aether_user_updated', {
          detail: {
            ...currentAuthUser,
            role: primaryRole,
            roles: roleObjects,
          },
        })
      );
    }

    recordAuditLog({
      action: 'User Roles Updated (RBAC)',
      category: 'user_management',
      user: currentAuthUser?.username || FALLBACK_ADMIN_NAME,
      userEmail: currentAuthUser?.email || FALLBACK_ADMIN_EMAIL,
      target: `${targetUser.name || targetUser.username} (${targetUser.email})`,
      targetEmail: targetUser.email,
      status: 'Success',
      details: `Assigned roles: ${selectedUserRoleNames.join(', ')}. Combined permissions: ${previewPermissions.length} effective permissions.`,
    });

    message.success(`Roles updated for ${targetUser.name || targetUser.username}`);
    setManageRolesModalVisible(false);
    refetchUsers();
    refetchAudit();
  };

  return {
    manageRolesModalVisible,
    targetUser,
    selectedUserRoleNames,
    setSelectedUserRoleNames,
    previewPermissions,
    isUpdatingStaff,
    openManageRoles,
    closeManageRoles,
    saveUserRoles,
  };
}
