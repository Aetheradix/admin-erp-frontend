import { useState } from 'react';
import { useGetAttendanceHistoryQuery } from '@/store/api/attendanceSlice';
import { useGetLeavesQuery, useCreateLeaveRequestMutation } from '@/store/api/leaveSlice';
import { useAuth } from '../../../hooks/useAuth';

import type { AttendanceRequest } from '@/types/models';

export const useAttendancePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const { data: records = [], isLoading: recordsLoading } = useGetAttendanceHistoryQuery();
  const { data: requests = [], isLoading: requestsLoading } = useGetLeavesQuery();
  const [createLeaveRequest] = useCreateLeaveRequestMutation();

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Hide from admin: they handle global approvals elsewhere
  const calendarRequests = isAdmin ? [] : requests;

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
      setShowRequestForm(false);
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
  };

  return {
    isAdmin,
    records,
    requests,
    calendarRequests,
    isLoading: recordsLoading || requestsLoading,
    showRequestForm,
    setShowRequestForm,
    selectedDate,
    setSelectedDate,
    handleRequestSubmit,
  };
};
