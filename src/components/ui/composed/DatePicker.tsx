import { Calendar, type CalendarProps } from 'primereact/calendar';
import { classNames } from 'primereact/utils';

export const DatePicker = ({ className, ...props }: CalendarProps) => {
  return (
    <Calendar
      className={classNames(
        'w-full border border-border-subtle rounded-card bg-surface-elevated text-foreground focus:border-primary transition-all duration-200 outline-none',
        className
      )}
      inputClassName="w-full border-none shadow-none focus:shadow-none"
      {...props}
    />
  );
};

DatePicker.displayName = 'DatePicker';
