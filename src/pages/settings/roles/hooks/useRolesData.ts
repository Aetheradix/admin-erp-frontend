import { useMemo } from 'react';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetRbacAuditLogsQuery,
} from '@/store/api/roleApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';

export function useRolesData() {
  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useGetRolesQuery();
  const { data: permsData } = useGetPermissionsQuery();
  const {
    data: auditData,
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useGetRbacAuditLogsQuery({ limit: 100 });
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery();

  const roles = useMemo(() => rolesData?.data || [], [rolesData]);
  const permissions = useMemo(() => permsData?.data?.permissions || [], [permsData]);
  const modules = useMemo(() => permsData?.data?.modules || {}, [permsData]);
  const auditLogs = useMemo(() => auditData?.data || [], [auditData]);

  return {
    roles,
    permissions,
    modules,
    auditLogs,
    usersData,
    rolesLoading,
    auditLoading,
    usersLoading,
    refetchRoles,
    refetchAudit,
    refetchUsers,
  };
}
