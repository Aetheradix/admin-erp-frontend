import { useAuth } from './useAuth';

/**
 * Hook to check and enforce RBAC permissions within React components
 */
export const usePermission = () => {
  const { permissions, roles, teamScopes, isSuperadmin, hasPermission, refreshPermissions } = useAuth();

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
    refreshPermissions,
  };
};
