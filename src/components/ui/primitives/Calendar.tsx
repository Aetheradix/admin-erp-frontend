import React from 'react';
import { DatePicker, Calendar as AntCalendar } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { cn } from '@/utils/cn';

interface CalendarProps {
  id?: string;
  value?: Date | Dayjs | null;
  onChange?: (e: { value: Date | null }) => void;
  inline?: boolean;
  showIcon?: boolean;
  showWeek?: boolean;
  className?: string;
  inputClassName?: string;
  panelClassName?: string;
  placeholder?: string;
  dateFormat?: string;
  dateTemplate?: (date: { day: number; month: number; year: number }) => React.ReactNode;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  selectionMode?: 'single' | 'range';
}

export const Calendar = ({
  id,
  value,
  onChange,
  inline,
  className,
  placeholder,
  dateTemplate,
  disabled,
  minDate,
  maxDate,
  inputClassName,
  panelClassName,
}: CalendarProps) => {
  const dayjsValue = value ? dayjs(value) : undefined;
  const format = 'DD/MM/YYYY';

  if (inline) {
    return (
      <AntCalendar
        value={dayjsValue}
        onChange={(date) => onChange?.({ value: date?.toDate() ?? null })}
        className={cn('w-full border-none', className)}
        disabledDate={(date) => {
          if (minDate && date.isBefore(dayjs(minDate), 'day')) return true;
          if (maxDate && date.isAfter(dayjs(maxDate), 'day')) return true;
          return false;
        }}
        fullCellRender={(date) => {
          if (dateTemplate) {
            return (
              <div className="ant-picker-cell-inner">
                {dateTemplate({ day: date.date(), month: date.month(), year: date.year() })}
              </div>
            );
          }
          return <div className="ant-picker-cell-inner">{date.date()}</div>;
        }}
      />
    );
  }

  return (
    <DatePicker
      id={id}
      value={dayjsValue}
      onChange={(date) => onChange?.({ value: date?.toDate() ?? null })}
      className={cn('w-full', className)}
      placeholder={placeholder}
      disabled={disabled}
      format={format}
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      classNames={{
        input: cn(
          'w-full px-5 py-4 border-border-subtle rounded-2xl bg-white text-foreground font-medium text-sm shadow-xs',
          inputClassName
        ),
        popup: cn('rounded-2xl shadow-xl', panelClassName),
      }}
    />
  );
};

Calendar.displayName = 'Calendar';
