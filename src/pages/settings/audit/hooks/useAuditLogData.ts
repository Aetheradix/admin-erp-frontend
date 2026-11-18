import { useMemo } from 'react';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import { useGetSystemAuditLogsQuery, useGetSystemInvitationsQuery } from '@/store/api/authApiSlice';

export function useAuditLogData() {
  const {
    data: auditLogsResponse,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    refetch: refetchLogs,
  } = useGetSystemAuditLogsQuery();

  const {
    data: invitationsResponse,
    isLoading: isLoadingInvitations,
    refetch: refetchInvitations,
  } = useGetSystemInvitationsQuery();

  const logs = useMemo<AuditLogEntry[]>(
    () => (auditLogsResponse?.data ?? []) as AuditLogEntry[],
    [auditLogsResponse]
  );
  const invitations = useMemo<InvitationRecord[]>(
    () => (invitationsResponse?.data ?? []) as InvitationRecord[],
    [invitationsResponse]
  );

  return {
    logs,
    invitations,
    isLoadingLogs,
    isLoadingInvitations,
    isFetchingLogs,
    refetchLogs,
    refetchInvitations,
  };
}
