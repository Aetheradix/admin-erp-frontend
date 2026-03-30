import { useState } from 'react';
import { useGetAdminElevationRequestsQuery, useProcessAdminElevationMutation } from '@/store/api/authApiSlice';

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
            setShowDialog(false);
            setComment('');
            refetch();
        } catch (error) {
            console.error('Failed to process request:', error);
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
