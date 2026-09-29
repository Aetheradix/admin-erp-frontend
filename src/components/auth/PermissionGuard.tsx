import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally render UI children based on RBAC permissions
 */
export const PermissionGuard = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperadmin } = usePermission();

  if (isSuperadmin) {
    return <>{children}</>;
  }

  if (Array.isArray(permission)) {
    const isAllowed = requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission);
    return isAllowed ? <>{children}</> : <>{fallback}</>;
  }

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};
