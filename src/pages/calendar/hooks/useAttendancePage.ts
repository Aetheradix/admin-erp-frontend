import { useState } from 'react';
import { useGetAttendanceHistoryQuery } from '@/store/api/attendanceSlice';
import {
  useGetLeavesQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
} from '@/store/api/leaveSlice';
import { useAuth } from '../../../hooks/useAuth';
import { showToast } from '@/components/ui/composed/Toast.utils';
import type { AttendanceRequest } from '@/types/models';

export const useAttendancePage = () => {
  const { user } = useAuth();
  const isAdmin = Boolean(
    user?.role &&
    ['admin', 'superadmin', 'hradmin', 'financeadmin', 'manager'].some((r) =>
      String(user.role).toLowerCase().includes(r)
    )
  );

  const { data: records = [], isLoading: recordsLoading } = useGetAttendanceHistoryQuery();
  const { data: requests = [], isLoading: requestsLoading } = useGetLeavesQuery();
  const [createLeaveRequest, { isLoading: isSubmittingRequest }] = useCreateLeaveRequestMutation();
  const [updateLeaveStatus, { isLoading: isUpdatingStatus }] = useUpdateLeaveStatusMutation();

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Show requests on calendar for both employee and admin
  const calendarRequests = requests;

  // Filter pending requests for approval workflows
  const pendingRequests = requests.filter((req) => (req.status || '').toLowerCase() === 'pending');

  const handleRequestSubmit = async (
    data: Partial<AttendanceRequest> & { startDate: string; endDate: string }
  ) => {
    try {
      await createLeaveRequest({
        type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
      }).unwrap();

      showToast({
        severity: 'success',
        summary: 'Request Submitted',
        detail: `Your ${data.type} request has been submitted for approval.`,
      });
      setShowRequestForm(false);
    } catch (error: unknown) {
      console.error('Failed to submit request:', error);
      const errMsg =
        (error as { data?: { message?: string } })?.data?.message ||
        'Failed to submit request. Please try again.';
      showToast({
        severity: 'error',
        summary: 'Submission Failed',
        detail: errMsg,
      });
    }
  };

  const handleApprove = async (id: string | number, comment?: string): Promise<boolean> => {
    try {
      await updateLeaveStatus({ id, status: 'Approved', comment }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Request Approved',
        detail: 'The attendance request has been approved successfully.',
      });
      return true;
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to approve request';
      showToast({
        severity: 'error',
        summary: 'Approval Failed',
        detail: msg,
      });
      return false;
    }
  };

  const handleReject = async (id: string | number, comment?: string): Promise<boolean> => {
    try {
      await updateLeaveStatus({ id, status: 'Rejected', comment }).unwrap();
      showToast({
        severity: 'info',
        summary: 'Request Rejected',
        detail: 'The attendance request has been rejected.',
      });
      return true;
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to reject request';
      showToast({
        severity: 'error',
        summary: 'Rejection Failed',
        detail: msg,
      });
      return false;
    }
  };

  return {
    user,
    isAdmin,
    records,
    requests,
    pendingRequests,
    calendarRequests,
    isLoading: recordsLoading || requestsLoading,
    isSubmittingRequest,
    isUpdatingStatus,
    showRequestForm,
    setShowRequestForm,
    selectedDate,
    setSelectedDate,
    handleRequestSubmit,
    handleApprove,
    handleReject,
  };
};
