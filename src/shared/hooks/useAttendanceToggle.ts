import { useCallback } from 'react';
import { useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync, type SyncEventType } from '@/services/syncService';

export interface AttendanceToggleOptions {
  workMode?: 'office' | 'wfh' | 'field';
  checkedInMessage?: string;
  checkedOutMessage?: string;
  errorMessage?: string;
  syncChannel?: SyncEventType;
}

export function useAttendanceToggle(isCheckedIn: boolean, options: AttendanceToggleOptions = {}) {
  const {
    workMode = 'office',
    checkedInMessage = 'Checked in successfully!',
    checkedOutMessage = 'Checked out successfully!',
    errorMessage = 'Attendance action failed',
    syncChannel = 'attendance',
  } = options;

  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const toggle = useCallback(async () => {
    try {
      if (isCheckedIn) {
        await checkOut().unwrap();
        showToast.success(checkedOutMessage);
      } else {
        await checkIn({ work_mode: workMode }).unwrap();
        showToast.success(checkedInMessage);
      }
      broadcastSync(syncChannel);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      showToast.error(message || errorMessage);
    }
  }, [
    isCheckedIn,
    checkIn,
    checkOut,
    workMode,
    checkedInMessage,
    checkedOutMessage,
    errorMessage,
    syncChannel,
  ]);

  return { toggle, isCheckingIn, isCheckingOut, isSubmitting: isCheckingIn || isCheckingOut };
}
