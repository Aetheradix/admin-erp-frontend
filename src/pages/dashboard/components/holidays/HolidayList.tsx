import { CalendarDays, Sparkles } from 'lucide-react';
import type { UpcomingHolidayItem } from '@/store/api/leaveSlice';
import { HOLIDAY_UPCOMING_LIMIT } from '../../constants';
import { formatHolidayDate } from '../../utils/holidays';

function HolidayDayBadge({ daysAway }: { daysAway: number }) {
  if (daysAway === 0) {
    return (
      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black flex items-center gap-0.5">
        <Sparkles size={8} /> Today
      </span>
    );
  }
  if (daysAway === 1) {
    return (
      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black">
        Tomorrow
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 rounded bg-surface-elevated text-muted text-[9px] font-bold border border-border-subtle">
      in {daysAway}d
    </span>
  );
}

export function HolidayList({ holidays }: { holidays: UpcomingHolidayItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted">
          Upcoming Holidays ({holidays.length})
        </span>
        <span className="text-[8px] text-muted italic">Auto-disappears after date</span>
      </div>

      {holidays.length === 0 ? (
        <div className="py-4 text-center text-muted text-xs">
          <CalendarDays size={16} className="mx-auto mb-1 text-muted/60" />
          <p className="text-[10px]">No upcoming holidays remaining this year.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar pr-0.5">
          {holidays.slice(0, HOLIDAY_UPCOMING_LIMIT).map((holiday) => (
            <div
              key={holiday.id}
              className="p-2 rounded-lg bg-surface-subtle/60 hover:bg-surface-elevated border border-border-subtle/50 transition-all flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{holiday.name}</p>
                  <p className="text-[9px] text-muted truncate">
                    {formatHolidayDate(holiday.holiday_date)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <HolidayDayBadge daysAway={holiday.days_away} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}