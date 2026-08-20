import {
  useGetPendingUsersQuery,
  useApproveAccountMutation,
  useRejectAccountMutation,
} from '@/store/api/authApiSlice';
import type { User } from '@/types/auth';
import type { UserRole } from '@/config/navItems';

export function usePendingUsers() {
  const { data: pendingUsersResponse, isLoading, isError, refetch } = useGetPendingUsersQuery();

  const [approveAccount, { isLoading: isApproving }] = useApproveAccountMutation();

  const [rejectAccount, { isLoading: isRejecting }] = useRejectAccountMutation();

  const pendingUsers: User[] = pendingUsersResponse?.data ?? [];

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

  return {
    pendingUsers,
    isLoading,
    isError,
    isApproving,
    isRejecting,
    handleApproveUser,
    handleRejectUser,
    refetch,
  };
}
