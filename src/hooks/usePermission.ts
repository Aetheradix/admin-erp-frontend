import { useAuth } from './useAuth';

/**
 * Hook to check and enforce RBAC permissions within React components
 */
export const usePermission = () => {
  const { permissions, roles, teamScopes, isSuperadmin, hasPermission, refreshPermissions } =
    useAuth();

  const can = (permission: string): boolean => {
    return hasPermission(permission);
  };

  const cannot = (permission: string): boolean => {
    return !hasPermission(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (isSuperadmin) return true;
    return requiredPermissions.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (isSuperadmin) return true;
    return requiredPermissions.every((perm) => hasPermission(perm));
  };

  const hasRole = (roleName: string): boolean => {
    if (isSuperadmin && roleName.toLowerCase() === 'superadmin') return true;
    const cleanTarget = roleName.toLowerCase().replace(/[\s_-]/g, '');
    return roles.some((r) => r.toLowerCase().replace(/[\s_-]/g, '') === cleanTarget);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some((r) => hasRole(r));
  };

  return {
    permissions,
    roles,
    teamScopes,
    isSuperadmin,
    hasPermission,
    can,
    cannot,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    refreshPermissions,
  };
};
