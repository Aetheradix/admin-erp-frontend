import { useState } from 'react';
import { useGetLeavesQuery, useGetLeaveStatsQuery, useUpdateLeaveStatusMutation } from '@/store/api/leaveSlice';

export const useApprovals = () => {
  const { data: leaves = [], isLoading } = useGetLeavesQuery();
  const { data: stats } = useGetLeaveStatsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateLeaveStatusMutation();
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');

  const pendingLeaves = leaves.filter((l: any) => l.status === 'Pending');
  const counts = stats?.byStatus || {};

  const handleAction = (request: any, type: 'Approved' | 'Rejected') => {
    setSelectedRequest(request);
    setActionType(type);
    setShowApprovalDialog(true);
  };

  const onConfirmAction = async (comment: string) => {
    if (!selectedRequest) return;
    try {
      await updateStatus({
        id: selectedRequest.id,
        status: actionType,
        comment
      }).unwrap();
      setShowApprovalDialog(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return {
    pendingLeaves,
    counts,
    isLoading,
    isUpdating,
    selectedRequest,
    showApprovalDialog,
    actionType,
    setShowApprovalDialog,
    handleAction,
    onConfirmAction
  };
};
