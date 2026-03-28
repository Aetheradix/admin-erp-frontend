import { Button } from '@/components/ui/primitives/Button';
import { LogIn, LogOut } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { MoodSelector } from './MoodSelector';
import { formatTime, formatFullDate } from '@/utils/date';

export default function AttendanceCard() {
  const {
    time,
    status,
    selectedMood,
    isLoading,
    isSubmittingMood,
    handleAttendance,
    logMood
  } = useAttendance();

  return (
    <div className="bg-white rounded-4xl p-8 border border-border-subtle shadow-soft relative overflow-hidden flex flex-col items-center justify-center min-h-85">
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Attendance Center</h2>
          <p className="text-[10px] font-medium text-muted">{formatFullDate(time)}</p>
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

      <MoodSelector 
        selectedMood={selectedMood} 
        isSubmittingMood={isSubmittingMood} 
        onMoodSelect={logMood} 
      />

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
