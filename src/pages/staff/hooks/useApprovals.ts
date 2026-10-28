import { useState } from 'react';
import { useGetLeavesQuery, useUpdateLeaveStatusMutation } from '@/store/api/leaveSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { AttendanceRequest } from '@/types/models';

export const useApprovals = () => {
  const { data: leaves = [], isLoading, refetch } = useGetLeavesQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateLeaveStatusMutation();

  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
  const [showDayApprovalModal, setShowDayApprovalModal] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');

  // Requests requiring action: pending or partially processed requests
  const pendingLeaves = leaves.filter((l: AttendanceRequest) => {
    const s = (l.status || '').toLowerCase();
    return s === 'pending' || s.includes('partial');
  });

  const counts = {
    Pending: pendingLeaves.length,
    Approved: leaves.filter((l: AttendanceRequest) => (l.status || '').toLowerCase() === 'approved').length,
    Rejected: leaves.filter(
      (l: AttendanceRequest) =>
        (l.status || '').toLowerCase() === 'rejected' ||
        (l.status || '').toLowerCase() === 'partially approved / rejected'
    ).length,
  };

  const handleReviewRequest = (request: AttendanceRequest) => {
    setSelectedRequest(request);
    setShowDayApprovalModal(true);
  };

  const handleAction = (request: AttendanceRequest, type: 'Approved' | 'Rejected') => {
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
        comment,
      }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: `Request ${actionType.toLowerCase()} successfully.`,
        life: 3000,
      });
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      refetch();
    } catch (err: unknown) {
      console.error('Failed to update status', err);
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update leave status.';
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: msg,
        life: 3000,
      });
    }
  };

  return {
    leaves,
    pendingLeaves,
    counts,
    isLoading,
    isUpdating,
    selectedRequest,
    showDayApprovalModal,
    showApprovalDialog,
    actionType,
    setSelectedRequest,
    setShowDayApprovalModal,
    setShowApprovalDialog,
    handleReviewRequest,
    handleAction,
    onConfirmAction,
    refetch,
  };
};
