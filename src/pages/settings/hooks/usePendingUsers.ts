import {
    useGetPendingUsersQuery,
    useApproveAccountMutation,
    useRejectAccountMutation,
} from '@/store/api/authApiSlice';


export function usePendingUsers() {

    const {
        data: pendingUsersResponse,
        isLoading,
        isError,
        refetch,
    } = useGetPendingUsersQuery();


    const [approveAccount, { isLoading: isApproving }] =
        useApproveAccountMutation();


    const [rejectAccount, { isLoading: isRejecting }] =
        useRejectAccountMutation();


    const pendingUsers = pendingUsersResponse?.data || [];


    const handleApproveUser = async (id: number) => {
        try {
            await approveAccount(id).unwrap();
            return true;
        } catch (error) {
            console.error("Approve user failed:", error);
            return false;
        }
    };


    const handleRejectUser = async (id: number) => {
        try {
            await rejectAccount(id).unwrap();
            return true;
        } catch (error) {
            console.error("Reject user failed:", error);
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