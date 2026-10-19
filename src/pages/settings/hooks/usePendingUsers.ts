import { useEffect } from 'react';
import {
  useGetPendingUsersQuery,
  useApproveAccountMutation,
  useRejectAccountMutation,
  useGetApprovalLogsQuery,
  useSendInvitationMutation,
  type AuditLog,
} from '@/store/api/authApiSlice';
import type { User } from '@/types/auth';
import type { UserRole } from '@/config/navItems';

export function usePendingUsers() {
  const {
    data: pendingUsersResponse,
    isLoading: isLoadingPending,
    isError: isPendingError,
    refetch: refetchPending,
  } = useGetPendingUsersQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: logsResponse,
    isLoading: isLoadingLogs,
    isError: isLogsError,
    refetch: refetchLogs,
  } = useGetApprovalLogsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Cross-tab & instant event listeners for real-time auto-update
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('aether_events');
      channel.onmessage = () => {
        refetchLogs();
        refetchPending();
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'aether_last_onboarding_sync' ||
        e.key === 'aether_user_invitations' ||
        e.key === 'aether_system_audit_logs'
      ) {
        refetchLogs();
        refetchPending();
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleCustom = () => {
      refetchLogs();
      refetchPending();
    };
    window.addEventListener('aether_onboarding_completed', handleCustom);
    window.addEventListener('aether_invitations_updated', handleCustom);
    window.addEventListener('aether_audit_logs_updated', handleCustom);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('aether_onboarding_completed', handleCustom);
      window.removeEventListener('aether_invitations_updated', handleCustom);
      window.removeEventListener('aether_audit_logs_updated', handleCustom);
    };
  }, [refetchLogs, refetchPending]);

  const [approveAccount, { isLoading: isApproving }] = useApproveAccountMutation();
  const [rejectAccount, { isLoading: isRejecting }] = useRejectAccountMutation();
  const [sendInvitation, { isLoading: isSendingInvite }] = useSendInvitationMutation();

  const pendingUsers: User[] = pendingUsersResponse?.data ?? pendingUsersResponse ?? [];

  // ✅ Fix: Safely unwrap logs array from response envelope
  const responseObj = logsResponse as unknown as { data?: AuditLog[]; logs?: AuditLog[] };
  const rawLogs = Array.isArray(logsResponse)
    ? logsResponse
    : (responseObj?.data ?? responseObj?.logs ?? []);
  const logs: AuditLog[] = Array.isArray(rawLogs) ? rawLogs : [];

  const handleApproveUser = async (id: number, role: UserRole) => {
    try {
      await approveAccount({ id, role }).unwrap();
      return true;
    } catch (error) {
      console.error('Approve user failed:', error);
      return false;
    }
  };

  const handleRejectUser = async (id: number) => {
    try {
      await rejectAccount(id).unwrap();
      return true;
    } catch (error) {
      console.error('Reject user failed:', error);
      return false;
    }
  };

  const handleSendInvite = async (email: string, role: UserRole): Promise<boolean> => {
    try {
      await sendInvitation({ email, role }).unwrap();
      return true;
    } catch (error) {
      console.error('Send invite email failed:', error);
      return false;
    }
  };

  const refetchAll = () => {
    refetchPending();
    refetchLogs();
  };

  return {
    pendingUsers,
    logs,
    isLoading: isLoadingPending || isLoadingLogs,
    isApproving,
    isRejecting,
    isSendingInvite,
    isError: isPendingError || isLogsError,
    handleApproveUser,
    handleRejectUser,
    handleSendInvite,
    refetch: refetchAll,
  };
}
