import { Button } from '@/components/ui/primitives/Button';
import { useCheckInMutation, useCheckOutMutation, useGetAttendanceStatusQuery } from '@/store/api/attendanceSlice';
import { useSubmitMoodMutation } from '@/store/api/moodSlice';
import { LogIn, LogOut, Smile, Meh, Frown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AttendanceCard() {
  const [time, setTime] = useState(new Date());
  
  const { data: status, isLoading: isFetching } = useGetAttendanceStatusQuery();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();
  
  const [submitMood, { isLoading: isSubmittingMood }] = useSubmitMoodMutation();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const MOODS = [
    { value: 1, icon: Frown, label: 'Awful', color: 'text-error' },
    { value: 2, icon: Frown, label: 'Bad', color: 'text-warning' },
    { value: 3, icon: Meh, label: 'Okay', color: 'text-info' },
    { value: 4, icon: Smile, label: 'Good', color: 'text-success' },
    { value: 5, icon: Smile, label: 'Great', color: 'text-primary' },
  ];

  const handleMoodSubmit = async (score: number) => {
    setSelectedMood(score);
    try {
      await submitMood({
        mood_score: score,
        stress_level: 3, // Default mid-level
        comments: `Feeling ${MOODS.find(m => m.value === score)?.label}`
      }).unwrap();
    } catch (err) {
      console.error('Mood submission failed:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  };

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

  const isLoading = isFetching || isCheckingIn || isCheckingOut;

  return (
    <div className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft relative overflow-hidden flex flex-col items-center justify-center min-h-85">
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Attendance Center</h2>
          <p className="text-[10px] font-medium text-muted">{formatDate(time)}</p>
        </div>
      </div>
      
      <div className="absolute top-6 right-8 bg-surface-subtle px-3 py-1 rounded-full border border-border-subtle">
        <span className={`text-[10px] font-bold ${status?.status === 'checked-in' ? 'text-success' : 'text-muted'}`}>
          {status?.status === 'checked-in' ? 'IN OFFICE' : 'NOT IN'}
        </span>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="text-5xl font-black tracking-tight text-foreground mb-1">
          {formatTime(time)}
        </div>
        <p className="text-xs font-bold text-muted tracking-widest uppercase">Real-time Clock</p>
      </div>

      <Button 
        variant={status?.status === 'checked-in' ? 'ghost' : 'primary'} 
        aria-label={status?.status === 'checked-in' ? 'Check out' : 'Check in'}
        className={`mt-10 w-full h-14 rounded-2xl! shadow-lg ${status?.status === 'checked-in' ? '' : 'shadow-primary/20'} flex items-center justify-center gap-3 active:scale-95 transition-all`}
        onClick={handleAttendance}
        loading={isLoading}
        disabled={isLoading}
      >
        {status?.status === 'checked-in' ? <LogOut size={20} /> : <LogIn size={20} />}
        <span className="font-bold tracking-wide">{status?.status === 'checked-in' ? 'Check Out' : 'Check In'}</span>
      </Button>

      {/* Mood Check-in Section */}
      <div className="mt-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">How are you feeling?</p>
          {selectedMood && (
            <span className="text-[10px] font-bold text-success flex items-center gap-1 animate-in fade-in zoom-in">
              <div className="w-1 h-1 rounded-full bg-success"></div>
              LOGGED
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMoodSubmit(m.value)}
              disabled={isSubmittingMood}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 border ${
                selectedMood === m.value 
                  ? 'bg-primary/5 border-primary/20 shadow-sm' 
                  : 'bg-surface-subtle border-transparent hover:border-border-subtle hover:bg-surface-elevated'
              }`}
            >
              <m.icon size={20} className={selectedMood === m.value ? 'text-primary' : 'text-muted/60'} />
              <span className={`text-[8px] font-bold uppercase tracking-tighter ${selectedMood === m.value ? 'text-primary' : 'text-muted'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-border-subtle pt-6">
        <div className="flex flex-col items-center border-r border-border-subtle">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Shift</p>
          <p className="text-xs font-bold text-foreground">09:00 AM – 06:00 PM</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Status</p>
          <p className="text-xs font-bold text-foreground">
            {status?.status === 'checked-in' ? 'Active' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  );
}
