import { useState, useEffect } from 'react';
import {
  useCheckInMutation,
  useCheckOutMutation,
  useGetAttendanceStatusQuery,
  useTakeBreakMutation,
  useEndBreakMutation,
} from '@/store/api/attendanceSlice';
import { useSubmitMoodMutation } from '@/store/api/moodSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const useAttendance = () => {
  const [time, setTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const { data: status, isLoading: isFetching } = useGetAttendanceStatusQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();
  const [submitMood, { isLoading: isSubmittingMood }] = useSubmitMoodMutation();

  const [takeBreak, { isLoading: isStartingBreak }] = useTakeBreakMutation();
  const [endBreak, { isLoading: isEndingBreak }] = useEndBreakMutation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAttendance = async () => {
    try {
      if (status?.status === 'checked-in') {
        await checkOut().unwrap();
        showToast({
          severity: 'success',
          summary: 'Checked Out',
          detail: 'You have been successfully checked out.',
          life: 3000,
        });
      } else {
        await checkIn({ remark: 'Manual check-in from dashboard' }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Checked In',
          detail: 'Welcome! You have been successfully checked in.',
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      console.error('Attendance action failed:', error);
      showToast({
        severity: 'error',
        summary: 'Attendance Error',
        detail: apiError.data?.message || 'Action failed',
        life: 3000,
      });
    }
  };

  const handleBreak = async () => {
    try {
      if (status?.onBreak) {
        await endBreak().unwrap();

        showToast({
          severity: 'success',
          summary: 'Break Ended',
          detail: 'Your break has ended.',
          life: 3000,
        });
      } else {
        await takeBreak({
          remark: 'Break from dashboard',
        }).unwrap();

        showToast({
          severity: 'success',
          summary: 'Break Started',
          detail: 'Your break has started.',
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      console.error('Break action failed:', error);
      showToast({
        severity: 'error',
        summary: 'Break Error',
        detail: apiError.data?.message || 'Action failed',
        life: 3000,
      });
    }
  };

  const logMood = async (score: number, label: string) => {
    setSelectedMood(score);
    try {
      await submitMood({
        mood_score: score,
        stress_level: 3,
        comments: `Feeling ${label}`,
      }).unwrap();
      showToast({
        severity: 'success',
        summary: 'Mood Logged',
        detail: `You're feeling ${label.toLowerCase()} today. Thanks for sharing!`,
        life: 3000,
      });
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Mood submission failed:', err);
      showToast({
        severity: 'error',
        summary: 'Mood Logging Error',
        detail: apiError.data?.message || 'Failed to log mood',
        life: 3000,
      });
    }
  };

  // return {
  //   time,
  //   status,
  //   selectedMood,
  //   isLoading: isFetching || isCheckingIn || isCheckingOut,
  //   isSubmittingMood,
  //   handleAttendance,
  //   handleBreak,
  //   logMood
  // };

  return {
    time,
    status,
    selectedMood,
    isLoading: isFetching || isCheckingIn || isCheckingOut,
    isBreakLoading: isStartingBreak || isEndingBreak,
    isSubmittingMood,
    handleAttendance,
    handleBreak,
    logMood,
  };
};
