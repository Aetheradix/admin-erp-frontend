import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { LogIn } from 'lucide-react';

export default function AttendanceCard() {
  const [time, setTime] = useState(new Date());

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
        <span className="text-[10px] font-bold text-muted">NOT IN</span>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="text-5xl font-black tracking-tight text-foreground mb-1">
          {formatTime(time)}
        </div>
        <p className="text-xs font-bold text-muted tracking-widest uppercase">Real-time Clock</p>
      </div>

      <Button 
        variant="primary" 
        className="mt-10 w-full  h-14 rounded-2xl! shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
      >
        <LogIn size={20} />
        <span className="font-bold tracking-wide">Check In</span>
      </Button>

      <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-border-subtle pt-6">
        <div className="flex flex-col items-center border-r border-border-subtle">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Shift</p>
          <p className="text-xs font-bold text-foreground">09:00 AM – 06:00 PM</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Last Out</p>
          <p className="text-xs font-bold text-foreground">12:04:18 PM</p>
        </div>
      </div>
    </div>
  );
}
