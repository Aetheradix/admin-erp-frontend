import { useState, useEffect } from 'react';
import { useCheckInMutation, useCheckOutMutation, useGetAttendanceStatusQuery } from '@/store/api/attendanceSlice';
import { useSubmitMoodMutation } from '@/store/api/moodSlice';

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
      } else {
        await checkIn({ remark: 'Manual check-in from dashboard' }).unwrap();
      }
    } catch (error) {
      console.error('Attendance action failed:', error);
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
    } catch (err) {
      console.error('Mood submission failed:', err);
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
