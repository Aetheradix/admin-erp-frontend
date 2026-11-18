import type { RoleItem } from '@/store/api/roleApiSlice';
import type { StaffMember } from '@/types/models';
import { aggregateRolePermissions, extractUserRoles, SYSTEM_ROLE_PERMISSIONS } from '@/utils/rbac';
import type { RoleAssignmentUser, RoleOption, StaffRoleObject } from './types';

export function buildAvailableRoleOptions(roles: RoleItem[]): RoleOption[] {
  const map = new Map<string, string>();
  Object.keys(SYSTEM_ROLE_PERMISSIONS).forEach((r) => map.set(r.toLowerCase(), r));
  roles.forEach((r) => {
    if (r.name && r.name.trim()) map.set(r.name.trim().toLowerCase(), r.name.trim());
  });
  return Array.from(map.values()).map((name) => ({ label: name, value: name }));
}

export function buildPreviewPermissions(selectedRoleNames: string[], roles: RoleItem[]): string[] {
  if (selectedRoleNames.length === 0) return [];
  const roleEntries = selectedRoleNames.map((name) => {
    const found = roles.find((r) => r.name.toLowerCase() === name.toLowerCase());
    return found || { name, permissions: SYSTEM_ROLE_PERMISSIONS[name] || [] };
  });
  return aggregateRolePermissions(roleEntries, roles);
}

export function filterAssignableUsers(users: StaffMember[], search: string): StaffMember[] {
  if (!search.trim()) return users;
  const q = search.toLowerCase().trim();
  return users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      extractUserRoles(u).some((r) => r.name.toLowerCase().includes(q))
  );
}

export function findUserFromParam(
  users: StaffMember[],
  userParam: string | null
): RoleAssignmentUser | undefined {
  if (!userParam) return undefined;
  return users.find(
    (u) =>
      String(u.id) === String(userParam) ||
      u.email?.toLowerCase() === userParam.toLowerCase() ||
      u.name?.toLowerCase() === userParam.toLowerCase() ||
      u.username?.toLowerCase() === userParam.toLowerCase()
  );
}

export function buildRoleObjects(selectedRoleNames: string[], roles: RoleItem[]): StaffRoleObject[] {
  return selectedRoleNames.map((name) => {
    const found = roles.find((r) => r.name.toLowerCase() === name.toLowerCase());
    return {
      id: found ? found.id : undefined,
      name: found ? found.name : name,
      is_system: found ? found.is_system : true,
    };
  });
}

export function getValidRoleIds(roleObjects: StaffRoleObject[]): number[] {
  return roleObjects.map((r) => Number(r.id)).filter((id) => !isNaN(id) && id > 0);
}

export function resolveRolePermissionCount(roleName: string, roles: RoleItem[]): number {
  const found = roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
  return found?.permissions?.length || (SYSTEM_ROLE_PERMISSIONS[roleName]?.length ?? 0);
}
