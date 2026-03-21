import React from 'react';
import { Dropdown as PRDropdown, type DropdownProps as PRDropdownProps } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

export const Select = React.forwardRef<PRDropdown, PRDropdownProps>(({ className, ...props }, ref) => {
  return (
    <PRDropdown
      ref={ref}
      className={classNames(
        '!w-full !border !border-border-subtle !rounded-2xl !bg-white !text-foreground focus:!border-primary/50 !transition-all !duration-200 !outline-none !shadow-xs !h-14 flex items-center',
        className
      )}
      pt={{
        input: { className: 'px-5 font-medium text-sm text-foreground' },
        trigger: { className: 'pr-4' }
      }}
      {...props}
    />
  );
});

Select.displayName = 'Select';
