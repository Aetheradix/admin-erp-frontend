import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { WEEKDAY_LABELS } from '../constants/dateFormats';
import { buildDayKey, getMonthLayout } from '../utils/calendar';

export interface CalendarDay {
  key: string;
  day: number;
  isToday: boolean;
  isSelected: boolean;
}

export interface CalendarGridProps {
  year: number;
  month: number;
  renderDay: (day: CalendarDay) => ReactNode;
  onDayClick?: (day: CalendarDay) => void;
  todayKey?: string | null;
  selectedKey?: string | null;
  weekdayLabels?: readonly string[];
  className?: string;
  weekdayClassName?: string;
  dayClassName?: string | ((day: CalendarDay) => string);
}

export function CalendarGrid({
  year,
  month,
  renderDay,
  onDayClick,
  todayKey,
  selectedKey,
  weekdayLabels = WEEKDAY_LABELS,
  className,
  weekdayClassName,
  dayClassName,
}: CalendarGridProps) {
  const { leadingBlanks, daysInMonth } = getMonthLayout(year, month);
  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const key = buildDayKey(year, month, day);
    return { key, day, isToday: key === todayKey, isSelected: key === selectedKey };
  });

  return (
    <div className={cn('grid grid-cols-7 gap-2', className)}>
      {weekdayLabels.map((label) => (
        <div
          key={label}
          className={cn(
            'text-[10px] font-black uppercase tracking-wider text-muted text-center py-1',
            weekdayClassName
          )}>
          {label}
        </div>
      ))}

      {Array.from({ length: leadingBlanks }, (_, index) => (
        <div key={`blank-${index}`} aria-hidden="true" />
      ))}

      {days.map((day) => (
        <div
          key={day.key}
          {...(onDayClick
            ? {
                role: 'button',
                tabIndex: 0,
                onClick: () => onDayClick(day),
                onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onDayClick(day);
                  }
                },
              }
            : {})}
          className={cn(
            'min-h-[72px] rounded-2xl border border-border-subtle bg-white p-2 text-left transition-colors',
            onDayClick &&
              'cursor-pointer hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            day.isSelected && 'border-primary ring-1 ring-primary/30',
            typeof dayClassName === 'function' ? dayClassName(day) : dayClassName
          )}>
          {renderDay(day)}
        </div>
      ))}
    </div>
  );
}
