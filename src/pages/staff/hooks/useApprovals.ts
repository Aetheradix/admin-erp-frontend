import { useState } from 'react';
import { useGetLeavesQuery, useGetLeaveStatsQuery, useUpdateLeaveStatusMutation } from '@/store/api/leaveSlice';
import { showToast } from '@/components/ui/composed/Toast';

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
      showToast({ severity: 'success', summary: 'Success', detail: `Leave ${actionType.toLowerCase()} successfully.`, life: 3000 });
      setShowApprovalDialog(false);
      setSelectedRequest(null);
    } catch (err: any) {
      console.error('Failed to update status', err);
      showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to update leave status.', life: 3000 });
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
