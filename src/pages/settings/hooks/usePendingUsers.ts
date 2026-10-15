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
  } = useGetPendingUsersQuery();

  const {
    data: logsResponse,
    isLoading: isLoadingLogs,
    isError: isLogsError,
    refetch: refetchLogs,
  } = useGetApprovalLogsQuery();

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
