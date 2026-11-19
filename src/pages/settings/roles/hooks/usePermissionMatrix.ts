import { message } from 'antd';
import { useUpdateRoleMutation, type PermissionItem, type RoleItem } from '@/store/api/roleApiSlice';
import { usePermission } from '@/hooks/usePermission';

export function usePermissionMatrix() {
  const [updateRoleApi] = useUpdateRoleMutation();
  const { isSuperadmin } = usePermission();

  const togglePermission = async (role: RoleItem | null, permId: number) => {
    if (!role) return;
    if (role.is_system && !isSuperadmin) {
      message.warning('System role permissions can only be altered by Superadmins.');
      return;
    }

    const currentPermIds = role.permissions.map((p) => p.id);
    const newPermIds = currentPermIds.includes(permId)
      ? currentPermIds.filter((id) => id !== permId)
      : [...currentPermIds, permId];

    try {
      await updateRoleApi({
        id: role.id,
        name: role.name,
        description: role.description,
        permissionIds: newPermIds,
      }).unwrap();
      message.success('Permissions updated');
    } catch (err: unknown) {
      const detail = (err as { data?: { message?: string } } | null)?.data?.message;
      message.error(detail || 'Failed to update permission');
    }
  };

  const toggleModule = async (role: RoleItem | null, modulePerms: PermissionItem[]) => {
    if (!role) return;
    if (role.is_system && !isSuperadmin) {
      message.warning('System role permissions can only be altered by Superadmins.');
      return;
    }

    const currentPermIds = role.permissions.map((p) => p.id);
    const modulePermIds = modulePerms.map((p) => p.id);
    const allSelected = modulePermIds.every((id) => currentPermIds.includes(id));

    const newPermIds = allSelected
      ? currentPermIds.filter((id) => !modulePermIds.includes(id))
      : Array.from(new Set([...currentPermIds, ...modulePermIds]));

    try {
      await updateRoleApi({
        id: role.id,
        name: role.name,
        description: role.description,
        permissionIds: newPermIds,
      }).unwrap();
      message.success(`Updated ${modulePerms[0]?.module} permissions`);
    } catch (err: unknown) {
      const detail = (err as { data?: { message?: string } } | null)?.data?.message;
      message.error(detail || 'Failed to update module permissions');
    }
  };

  return { togglePermission, toggleModule };
}
