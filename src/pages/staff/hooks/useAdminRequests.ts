import { useState } from 'react';
import { useGetAdminElevationRequestsQuery, useProcessAdminElevationMutation } from '@/store/api/authApiSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const useAdminRequests = () => {
    const { data: requests = [], isLoading, refetch } = useGetAdminElevationRequestsQuery();
    const [processRequest] = useProcessAdminElevationMutation();

    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [comment, setComment] = useState('');
    const [isApprove, setIsApprove] = useState(true);
    const [showDialog, setShowDialog] = useState(false);

    const handleAction = (request: any, approve: boolean) => {
        setSelectedRequest(request);
        setIsApprove(approve);
        setShowDialog(true);
    };

    const handleSubmit = async () => {
        try {
            await processRequest({
                requestId: selectedRequest.id,
                status: isApprove ? 'Approved' : 'Rejected',
                adminComment: comment
            }).unwrap();
            showToast({ severity: 'success', summary: 'Success', detail: `Request ${isApprove ? 'approved' : 'rejected'}.`, life: 3000 });
            setShowDialog(false);
            setComment('');
            refetch();
        } catch (error: any) {
            console.error('Failed to process request:', error);
            showToast({ severity: 'error', summary: 'Error', detail: error.data?.message || 'Failed to process request.', life: 3000 });
        }
    };

    return {
        requests,
        isLoading,
        selectedRequest,
        comment,
        setComment,
        isApprove,
        showDialog,
        setShowDialog,
        handleAction,
        handleSubmit
    };
};
