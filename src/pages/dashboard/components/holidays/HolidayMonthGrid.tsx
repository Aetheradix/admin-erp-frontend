import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildDayKey } from '@/shared/utils/calendar';
import { cn } from '@/utils/cn';
import { HOLIDAY_MONTH_NAMES, HOLIDAY_WEEKDAY_LABELS } from '../../constants';
import type { HolidayCalendarState } from '../../hooks/useHolidayCalendar';

export function HolidayMonthGrid({ calendar }: { calendar: HolidayCalendarState }) {
  const {
    year,
    month,
    leadingBlanks,
    daysInMonth,
    holidaysByDate,
    todayKey,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    resetToToday,
  } = calendar;

  return (
    <div className="bg-surface-subtle/50 rounded-xl p-2.5 border border-border-subtle/60 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-foreground">
            {HOLIDAY_MONTH_NAMES[month]} {year}
          </span>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={resetToToday}
              className="text-[9px] font-bold text-primary hover:underline cursor-pointer">
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Previous month"
            className="w-5 h-5 rounded bg-white border border-border-subtle flex items-center justify-center hover:bg-surface-elevated cursor-pointer transition-colors">
            <ChevronLeft size={11} className="text-muted" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="w-5 h-5 rounded bg-white border border-border-subtle flex items-center justify-center hover:bg-surface-elevated cursor-pointer transition-colors">
            <ChevronRight size={11} className="text-muted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {HOLIDAY_WEEKDAY_LABELS.map((weekday) => (
          <span key={weekday} className="text-[8px] font-black text-muted uppercase tracking-wider">
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <div key={`empty-${index}`} className="h-6" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNum = index + 1;
          const dateStr = buildDayKey(year, month, dayNum);
          const holiday = holidaysByDate.get(dateStr);
          const isToday = dateStr === todayKey;

          return (
            <div key={`day-${dayNum}`} className="relative group/cal flex items-center justify-center">
              <div
                className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all relative',
                  holiday
                    ? 'bg-amber-500 text-white shadow-2xs font-black cursor-pointer scale-105'
                    : isToday
                      ? 'border border-primary text-primary font-black bg-primary/5'
                      : 'text-foreground/80 hover:bg-white'
                )}>
                {dayNum}
              </div>

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
  );
}