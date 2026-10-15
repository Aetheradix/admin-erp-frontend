import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Forbidden403Page } from '@/pages/error/Forbidden403Page';

interface RoutePermissionGuardProps {
  permission: string | string[];
  children: ReactNode;
}

export const RoutePermissionGuard = ({ permission, children }: RoutePermissionGuardProps) => {
  const { hasPermission, hasAnyPermission, isSuperadmin } = usePermission();

  if (isSuperadmin) {
    return <>{children}</>;
  }

  const isAllowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!isAllowed) {
    return <Forbidden403Page />;
  }

  return <>{children}</>;
};

export default RoutePermissionGuard;
