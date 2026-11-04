import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { useGetUpcomingHolidaysQuery, type CalendarHoliday } from '@/store/api/leaveSlice';

export const CompactHolidayCalendarCard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUpcomingHolidaysQuery();
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendar = data?.calendar;
  const upcomingHolidays = data?.upcomingHolidays || [];
  const allHolidays = data?.allHolidays || [];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleResetToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isCurrentMonthThisMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Map holidays by "YYYY-MM-DD"
  const holidaysByDate = allHolidays.reduce<Record<string, CalendarHoliday>>((acc, h) => {
    if (!h.holiday_date) return acc;
    const dStr = typeof h.holiday_date === 'string' ? h.holiday_date.split('T')[0] : '';
    if (dStr) acc[dStr] = h;
    return acc;
  }, {});

  const formatHolidayDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('T')[0].split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs animate-pulse">
        <div className="h-4 w-32 bg-surface-subtle rounded mb-3" />
        <div className="h-32 bg-surface-subtle rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs hover:border-border transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-1">
              <Sun size={11} className="text-amber-500" /> Holidays
            </span>
            {calendar && (
              <span className="text-[10px] text-muted font-bold truncate max-w-[120px]">
                • {calendar.name}
              </span>
            )}
          </div>
          <h3 className="text-sm font-black text-foreground">
            Calendar & Holidays
          </h3>
        </div>

        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="flex items-center gap-1 text-[10px] font-bold text-muted hover:text-primary transition-colors cursor-pointer"
          title="Open Calendar">
          <span>All ({allHolidays.length})</span>
          <ArrowUpRight size={11} />
        </button>
      </div>

      {/* Mini Calendar Month Navigator */}
      <div className="bg-surface-subtle/50 rounded-xl p-2.5 border border-border-subtle/60 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-foreground">
              {monthNames[month]} {year}
            </span>
            {!isCurrentMonthThisMonth && (
              <button
                type="button"
                onClick={handleResetToday}
                className="text-[9px] font-bold text-primary hover:underline cursor-pointer">
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-5 h-5 rounded bg-white border border-border-subtle flex items-center justify-center hover:bg-surface-elevated cursor-pointer transition-colors">
              <ChevronLeft size={11} className="text-muted" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-5 h-5 rounded bg-white border border-border-subtle flex items-center justify-center hover:bg-surface-elevated cursor-pointer transition-colors">
              <ChevronRight size={11} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {weekDays.map((wd) => (
            <span
              key={wd}
              className="text-[8px] font-black text-muted uppercase tracking-wider">
              {wd}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-6" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const holiday = holidaysByDate[dateStr];
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                className="relative group/cal flex items-center justify-center">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all relative ${
                    holiday
                      ? 'bg-amber-500 text-white shadow-2xs font-black cursor-pointer scale-105'
                      : isToday
                        ? 'border border-primary text-primary font-black bg-primary/5'
                        : 'text-foreground/80 hover:bg-white'
                  }`}>
                  {dayNum}
                </div>

                {/* Holiday Tooltip */}
                {holiday && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-36 p-2 rounded-lg bg-zinc-900 text-white text-[9px] shadow-xl opacity-0 group-hover/cal:opacity-100 pointer-events-none transition-all z-50 flex flex-col gap-0.5">
                    <span className="font-bold text-amber-400 truncate">{holiday.name}</span>
                    <span className="text-zinc-400 text-[8px] uppercase">{holiday.holiday_type}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Holidays List (Auto-disappears as dates pass) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted">
            Upcoming Holidays ({upcomingHolidays.length})
          </span>
          <span className="text-[8px] text-muted italic">
            Auto-disappears after date
          </span>
        </div>

        {upcomingHolidays.length === 0 ? (
          <div className="py-4 text-center text-muted text-xs">
            <CalendarDays size={16} className="mx-auto mb-1 text-muted/60" />
            <p className="text-[10px]">No upcoming holidays remaining this year.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar pr-0.5">
            {upcomingHolidays.slice(0, 3).map((h) => {
              const isToday = h.days_away === 0;
              const isTomorrow = h.days_away === 1;

              return (
                <div
                  key={h.id}
                  className="p-2 rounded-lg bg-surface-subtle/60 hover:bg-surface-elevated border border-border-subtle/50 transition-all flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {h.name}
                      </p>
                      <p className="text-[9px] text-muted truncate">
                        {formatHolidayDate(h.holiday_date)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isToday ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black flex items-center gap-0.5">
                        <Sparkles size={8} /> Today
                      </span>
                    ) : isTomorrow ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black">
                        Tomorrow
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-surface-elevated text-muted text-[9px] font-bold border border-border-subtle">
                        in {h.days_away}d
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

