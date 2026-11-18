import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

export interface CanProps {
  children: ReactNode;
  roles?: readonly string[];
  permission?: string;
  permissions?: readonly string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function Can({
  children,
  roles,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: CanProps) {
  const { hasAnyRole, hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  const roleAllowed = !roles || roles.length === 0 || hasAnyRole([...roles]);
  const permissionAllowed = !permission || hasPermission(permission);
  const permissionsAllowed =
    !permissions || permissions.length === 0
      ? true
      : requireAll
        ? hasAllPermissions([...permissions])
        : hasAnyPermission([...permissions]);

  return <>{roleAllowed && permissionAllowed && permissionsAllowed ? children : fallback}</>;
}
