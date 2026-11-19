import { useMemo, useState } from 'react';
import type { CalendarHoliday } from '@/store/api/leaveSlice';
import { buildDayKey, getMonthLayout, shiftMonth } from '@/shared/utils/calendar';
import { indexHolidaysByDate } from '../utils/holidays';

export interface HolidayCalendarState {
  year: number;
  month: number;
  leadingBlanks: number;
  daysInMonth: number;
  holidaysByDate: Map<string, CalendarHoliday>;
  todayKey: string | null;
  isCurrentMonth: boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  resetToToday: () => void;
}

export function useHolidayCalendar(allHolidays: CalendarHoliday[]): HolidayCalendarState {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const { leadingBlanks, daysInMonth } = getMonthLayout(year, month);
  const holidaysByDate = useMemo(() => indexHolidaysByDate(allHolidays), [allHolidays]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayKey = isCurrentMonth ? buildDayKey(year, month, today.getDate()) : null;

  const goToPrevMonth = () => {
    const previous = shiftMonth(year, month, -1);
    setCurrentDate(new Date(previous.year, previous.month, 1));
  };

  const goToNextMonth = () => {
    const next = shiftMonth(year, month, 1);
    setCurrentDate(new Date(next.year, next.month, 1));
  };

  return {
    year,
    month,
    leadingBlanks,
    daysInMonth,
    holidaysByDate,
    todayKey,
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    resetToToday: () => setCurrentDate(new Date()),
  };
}