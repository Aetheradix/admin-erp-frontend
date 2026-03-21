import React from 'react';
import { Calendar as PRCalendar, type CalendarProps as PRCalendarProps } from 'primereact/calendar';
import { classNames } from 'primereact/utils';

export const Calendar = React.forwardRef<any, PRCalendarProps>(({ className, ...props }, ref) => {
  return (
    <PRCalendar
      ref={ref}
      className={classNames('w-full', className)}
      inputClassName="!w-full !px-5 !py-4 !border !border-border-subtle !rounded-2xl !bg-white !text-foreground focus:!border-primary/50 !transition-all !duration-200 !outline-none font-medium text-sm !shadow-xs"
      panelClassName="!rounded-2xl !border-none !shadow-xl !bg-white !p-4"
      {...props}
      showIcon
      pt={{
        header: { className: 'bg-white border-b border-border-subtle pb-4 mb-4' },
        title: { className: 'text-sm font-black uppercase tracking-widest text-foreground' },
        table: { className: 'w-full' },
        dayLabel: { className: 'p-2 text-xs font-bold rounded-xl hover:bg-surface-subtle transition-all' }
      }}
    />
  );
});

Calendar.displayName = 'Calendar';
