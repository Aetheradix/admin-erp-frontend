import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { canManageUsers } from '../utils';

export function useUsersAccess() {
  const { user: currentAuthUser, updateUser } = useAuth();
  const { isSuperadmin: isRbacSuperadmin, can } = usePermission();

  const isAuthorizedAdmin = useMemo(
    () => canManageUsers(currentAuthUser, isRbacSuperadmin, can),
    [currentAuthUser, isRbacSuperadmin, can]
  );

  return { currentAuthUser, updateUser, isAuthorizedAdmin };
}
