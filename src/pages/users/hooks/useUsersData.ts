import { useCallback, useMemo, useState } from 'react';
import { useGetUsersQuery } from '@/store/api/userSlice';
import {
  useGetApprovalLogsQuery,
  useGetSystemInvitationsQuery,
  useGetSystemAuditLogsQuery,
  useGetDepartmentsQuery,
} from '@/store/api/authApiSlice';
import { useGetRolesQuery } from '@/store/api/roleApiSlice';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import type { UserRecord } from '../types';
import { buildDepartmentOptions, buildRoleOptions, mergeUserRecords } from '../utils';

export const initialUsers: UserRecord[] = [];

export function useUsersData() {
  const { data: apiUsers, isLoading: isUsersLoading, refetch: refetchUsers } = useGetUsersQuery();
  const { data: rolesData } = useGetRolesQuery();
  const { data: deptResponse } = useGetDepartmentsQuery({});
  const { refetch: refetchLogs } = useGetApprovalLogsQuery();
  const { data: invitationsResponse, refetch: refetchInvitations } = useGetSystemInvitationsQuery();
  const { data: auditLogsResponse, refetch: refetchAuditLogs } = useGetSystemAuditLogsQuery();

  const [localUsers, setLocalUsers] = useState<UserRecord[]>(initialUsers);

  const invitations = useMemo<InvitationRecord[]>(
    () => (invitationsResponse?.data ?? []) as InvitationRecord[],
    [invitationsResponse]
  );
  const auditLogs = useMemo<AuditLogEntry[]>(
    () => (auditLogsResponse?.data ?? []) as AuditLogEntry[],
    [auditLogsResponse]
  );

  const availableRoles = useMemo(
    () => buildRoleOptions(rolesData?.data, apiUsers),
    [rolesData, apiUsers]
  );
  const availableDepartments = useMemo(
    () => buildDepartmentOptions(deptResponse, apiUsers),
    [deptResponse, apiUsers]
  );
  const mergedUsers = useMemo(() => mergeUserRecords(apiUsers, localUsers), [apiUsers, localUsers]);

  const refetchAll = useCallback(() => {
    refetchUsers();
    refetchLogs();
    refetchAuditLogs();
    refetchInvitations();
  }, [refetchUsers, refetchLogs, refetchAuditLogs, refetchInvitations]);

  return {
    roles: rolesData?.data ?? [],
    invitations,
    auditLogs,
    availableRoles,
    availableDepartments,
    mergedUsers,
    isUsersLoading,
    localUsers,
    setLocalUsers,
    refetchUsers,
    refetchInvitations,
    refetchAuditLogs,
    refetchAll,
  };
}
