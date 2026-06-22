import { useState, useEffect } from 'react';
import { useCheckInMutation, useCheckOutMutation, useGetAttendanceStatusQuery } from '@/store/api/attendanceSlice';
import { useSubmitMoodMutation } from '@/store/api/moodSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';

export const useAttendance = () => {
  const [time, setTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const { data: status, isLoading: isFetching } = useGetAttendanceStatusQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();
  const [submitMood, { isLoading: isSubmittingMood }] = useSubmitMoodMutation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAttendance = async () => {
    try {
      if (status?.status === 'checked-in') {
        await checkOut().unwrap();
        showToast({ severity: 'success', summary: 'Checked Out', detail: 'You have been successfully checked out.', life: 3000 });
      } else {
        await checkIn({ remark: 'Manual check-in from dashboard' }).unwrap();
        showToast({ severity: 'success', summary: 'Checked In', detail: 'Welcome! You have been successfully checked in.', life: 3000 });
      }
    } catch (error: any) {
      console.error('Attendance action failed:', error);
      showToast({ severity: 'error', summary: 'Attendance Error', detail: error.data?.message || 'Action failed', life: 3000 });
    }
  };

  const logMood = async (score: number, label: string) => {
    setSelectedMood(score);
    try {
      await submitMood({
        mood_score: score,
        stress_level: 3,
        comments: `Feeling ${label}`
      }).unwrap();
      showToast({ severity: 'success', summary: 'Mood Logged', detail: `You're feeling ${label.toLowerCase()} today. Thanks for sharing!`, life: 3000 });
    } catch (err: any) {
      console.error('Mood submission failed:', err);
      showToast({ severity: 'error', summary: 'Mood Logging Error', detail: err.data?.message || 'Failed to log mood', life: 3000 });
    }
  };

  return {
    time,
    status,
    selectedMood,
    isLoading: isFetching || isCheckingIn || isCheckingOut,
    isSubmittingMood,
    handleAttendance,
    logMood
  };
};
