import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useGetUpcomingHolidaysQuery, type CalendarHoliday } from '@/store/api/leaveSlice';

export const HolidayCalendarCard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUpcomingHolidaysQuery();
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendar = data?.calendar;
  const upcomingHolidays = data?.upcomingHolidays || [];
  const allHolidays = data?.allHolidays || [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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

  const getHolidayTypeBadge = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300/60';
      case 'COMPANY':
        return 'bg-indigo-500/15 text-indigo-700 border-indigo-300/60';
      case 'OPTIONAL':
      case 'RESTRICTED':
        return 'bg-purple-500/15 text-purple-700 border-purple-300/60';
      default:
        return 'bg-amber-500/15 text-amber-700 border-amber-300/60';
    }
  };

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
      <div className="bg-white rounded-3xl p-6 border border-border-subtle shadow-soft animate-pulse flex flex-col gap-4">
        <div className="h-6 w-48 bg-surface-subtle rounded-xl" />
        <div className="h-44 bg-surface-subtle rounded-2xl" />
        <div className="h-28 bg-surface-subtle rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.25em] flex items-center gap-1">
                <Sun size={11} className="text-amber-500 animate-spin-slow" />
                Organization Calendar
              </span>
              {calendar && (
                <span className="text-[10px] text-muted font-bold">
                  • {calendar.name}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">
              Holidays & Time Off
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="px-3 py-1.5 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              title="Open full Company Calendar">
              <span>All Holidays</span>
              <ArrowUpRight size={13} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Mini Month Calendar */}
        <div className="bg-surface-subtle/50 rounded-2xl p-4 border border-border-subtle/60 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-foreground">
                {monthNames[month]} {year}
              </span>
              {!isCurrentMonthThisMonth && (
                <button
                  type="button"
                  onClick={handleResetToday}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                  Today
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="w-7 h-7 rounded-lg bg-white border border-border-subtle flex items-center justify-center hover:bg-surface-elevated cursor-pointer transition-colors shadow-2xs">
                <ChevronLeft size={14} className="text-muted" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="w-7 h-7 rounded-lg bg-white border border-border-subtle flex items-center justify-center hover:bg-surface-elevated cursor-pointer transition-colors shadow-2xs">
                <ChevronRight size={14} className="text-muted" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-black text-muted uppercase tracking-wider py-1">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
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
                  className="relative group/day flex items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${
                      holiday
                        ? 'bg-amber-500 text-white shadow-xs font-black cursor-pointer scale-105'
                        : isToday
                          ? 'border-2 border-primary text-primary font-black bg-primary/5'
                          : 'text-foreground/80 hover:bg-white hover:shadow-2xs'
                    }`}>
                    {dayNum}
                    {holiday && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-300 ring-1 ring-white" />
                    )}
                  </div>

                  {/* Tooltip on hover for holidays */}
                  {holiday && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 p-2.5 rounded-xl bg-zinc-900 text-white text-[10px] shadow-2xl opacity-0 group-hover/day:opacity-100 pointer-events-none transition-all duration-200 z-50 border border-zinc-700/60 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-amber-400 font-black">
                        <span className="truncate">{holiday.name}</span>
                        <Sun size={11} className="shrink-0" />
                      </div>
                      <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">
                        {holiday.holiday_type} HOLIDAY
                      </span>
                      {holiday.is_half_day ? (
                        <span className="text-amber-300 font-medium text-[9px]">
                          ⚡ Half-day holiday
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section B: Upcoming Holidays (Auto-disappears when date passes) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                Upcoming Holidays
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-black">
                {upcomingHolidays.length} upcoming
              </span>
            </div>
            <span className="text-[10px] text-muted font-medium italic">
              Auto-disappears after date passes
            </span>
          </div>

          {upcomingHolidays.length === 0 ? (
            <div className="p-6 rounded-2xl bg-surface-subtle/40 border border-border-subtle/50 text-center flex flex-col items-center justify-center">
              <CalendarDays size={24} className="text-muted/60 mb-2" />
              <p className="text-xs font-bold text-foreground">
                No Upcoming Holidays
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                All scheduled holidays for this period have passed. Past holidays remain stored in company records.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {upcomingHolidays.slice(0, 4).map((h) => {
                const isToday = h.days_away === 0;
                const isTomorrow = h.days_away === 1;

                return (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl bg-surface-subtle/60 hover:bg-surface-elevated border border-border-subtle/60 transition-all flex items-center justify-between gap-3 group/item">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-border-subtle/80 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="text-[8px] font-black text-amber-600 leading-none uppercase">
                          {formatHolidayDate(h.holiday_date).split(',')[0]}
                        </span>
                        <span className="text-xs font-black text-foreground leading-tight mt-0.5">
                          {h.holiday_date.split('T')[0].split('-')[2]}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-foreground truncate group-hover/item:text-primary transition-colors">
                            {h.name}
                          </p>
                          {h.is_half_day ? (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-100 text-amber-800">
                              Half-Day
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted font-medium mt-0.5">
                          <span>{formatHolidayDate(h.holiday_date)}</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded border text-[8px] font-black uppercase tracking-wider ${getHolidayTypeBadge(
                              h.holiday_type
                            )}`}>
                            {h.holiday_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isToday ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                          <Sparkles size={10} /> Today
                        </span>
                      ) : isTomorrow ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                          Tomorrow
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-surface-elevated border border-border-subtle text-foreground text-[10px] font-bold">
                          in {h.days_away} days
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {upcomingHolidays.length > 4 && (
                <button
                  type="button"
                  onClick={() => navigate('/calendar')}
                  className="text-center py-2 text-[11px] font-black text-primary hover:underline cursor-pointer">
                  +{upcomingHolidays.length - 4} more upcoming holidays →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
