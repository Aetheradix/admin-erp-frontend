import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Building2, Calendar as CalendarIcon, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AttendanceRecord, AttendanceRequest } from '@/types/models';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  requests?: AttendanceRequest[];
  onDateSelect: (date: Date) => void;
}

export function AttendanceCalendar({ records, requests = [], onDateSelect }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const numDays = daysInMonth(currentMonth.getMonth(), currentMonth.getFullYear());
  const offset = firstDayOfMonth(currentMonth.getMonth(), currentMonth.getFullYear());

  const getDayRecord = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.find(r => r.date === dateStr);
  };

  const getDayRequest = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    d.setHours(0, 0, 0, 0);

    return requests.find(req => {
      const start = new Date(req.start_date);
      start.setHours(0, 0, 0, 0);
      const end = req.end_date ? new Date(req.end_date) : start;
      end.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  };

  const getDayTypeIcon = (type: string) => {
    switch (type) {
      case 'Work from Office': return <Building2 size={12} />;
      case 'Work from Home': return <Home size={12} />;
      case 'Work from home': return <Home size={12} />;
      case 'On Leave':
      case 'Day Off/Leave':
      case 'Sick Leave': return <CalendarIcon size={12} />;
      case 'Holiday': return <Sun size={12} />;
      default: return null;
    }
  };

  const getDayTypeStyles = (type: string, status?: string) => {
    const isPending = status === 'Pending';

    switch (type) {
      case 'Work from Office': return 'bg-primary/10 text-primary border-primary/20';
      case 'Work from Home':
      case 'Work from home': return isPending ? 'bg-info/5 text-info/50 border-info/10 border-dashed' : 'bg-info/10 text-info border-info/20';
      case 'On Leave':
      case 'Day Off/Leave':
      case 'Sick Leave': return isPending ? 'bg-warning/5 text-warning/50 border-warning/10 border-dashed' : 'bg-warning/10 text-warning border-warning/20';
      case 'Holiday': return 'bg-muted/10 text-muted border-muted/20';
      default: return 'bg-surface-subtle border-transparent';
    }
  };


  return (
    <div className="bg-white rounded-[40px] border border-border-subtle shadow-soft overflow-hidden animate-in fade-in duration-700">
      {/* Calendar Header */}
      <div className="p-8 flex items-center justify-between border-b border-border-subtle/50">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-foreground">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <span className="text-xs font-bold text-muted uppercase tracking-widest italic">Personal Attendance Journey</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="w-12 h-12 rounded-2xl bg-surface-subtle hover:bg-surface-elevated flex items-center justify-center transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="w-12 h-12 rounded-2xl bg-surface-subtle hover:bg-surface-elevated flex items-center justify-center transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border-subtle/30">
        {weekDays.map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-muted uppercase tracking-widest bg-surface-subtle/30">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-32 border-r border-b border-border-subtle/10 bg-surface-subtle/10" />
        ))}
        {Array.from({ length: numDays }).map((_, i) => {
          const day = i + 1;
          const record = getDayRecord(day);
          const request = getDayRequest(day);
          const displayItem = request || record;

          return (
            <div
              key={day}
              onClick={() => onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              className="h-32 border-r border-b border-border-subtle/20 p-4 transition-all duration-300 hover:bg-primary/5 cursor-pointer relative group"
            >
              <div className="flex flex-col gap-2">
                <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{day}</span>
                {displayItem && (
                  <div className={cn(
                    "flex flex-col gap-1 text-[8px] font-black uppercase tracking-tighter p-2 rounded-xl border transition-transform duration-500 group-hover:scale-105",
                    getDayTypeStyles(displayItem.type, displayItem.status)
                  )}>
                    <div className="flex items-center gap-1">
                      {getDayTypeIcon(displayItem.type)}
                      <span className="truncate">{displayItem.type}</span>
                    </div>
                    {displayItem.status === 'Pending' && (
                      <span className="opacity-60 italic">Approval Pending</span>
                    )}
                    {'checkIn' in displayItem && displayItem.checkIn && (
                      <span className="opacity-60">{displayItem.checkIn} - {displayItem.checkOut}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

          );
        })}
      </div>
    </div>
  );
}
