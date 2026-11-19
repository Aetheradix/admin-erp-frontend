import type { CalendarHoliday } from '@/store/api/leaveSlice';
import { createLookupMap } from '@/shared/utils/lookup';

export function holidayDateKey(holidayDate: string): string {
  return typeof holidayDate === 'string' ? holidayDate.split('T')[0] : '';
}

export function indexHolidaysByDate(
  allHolidays: CalendarHoliday[]
): Map<string, CalendarHoliday> {
  return createLookupMap(
    allHolidays.filter((holiday) => Boolean(holidayDateKey(holiday.holiday_date))),
    (holiday) => holidayDateKey(holiday.holiday_date)
  );
}

export function formatHolidayDate(dateStr: string): string {
  try {
    const parts = dateStr.split('T')[0].split('-');
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}