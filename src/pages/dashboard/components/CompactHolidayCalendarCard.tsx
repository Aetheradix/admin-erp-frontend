import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sun } from 'lucide-react';
import { useGetUpcomingHolidaysQuery } from '@/store/api/leaveSlice';
import { DASHBOARD_CARD_CLASS, DASHBOARD_CARD_SKELETON_CLASS } from '../constants';
import { useHolidayCalendar } from '../hooks/useHolidayCalendar';
import { HolidayList } from './holidays/HolidayList';
import { HolidayMonthGrid } from './holidays/HolidayMonthGrid';

export function CompactHolidayCalendarCard() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUpcomingHolidaysQuery();

  const calendar = data?.calendar;
  const upcomingHolidays = data?.upcomingHolidays || [];
  const allHolidays = data?.allHolidays || [];
  const monthCalendar = useHolidayCalendar(allHolidays);

  if (isLoading) {
    return (
      <div className={DASHBOARD_CARD_SKELETON_CLASS}>
        <div className="h-4 w-32 bg-surface-subtle rounded mb-3" />
        <div className="h-32 bg-surface-subtle rounded" />
      </div>
    );
  }

  return (
    <div className={DASHBOARD_CARD_CLASS}>
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
          <h3 className="text-sm font-black text-foreground">Calendar & Holidays</h3>
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

      <HolidayMonthGrid calendar={monthCalendar} />

      <HolidayList holidays={upcomingHolidays} />
    </div>
  );
}
