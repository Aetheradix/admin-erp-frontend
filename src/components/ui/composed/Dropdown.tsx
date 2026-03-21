import React from 'react';
import { Dropdown as PRDropdown, type DropdownProps as PRDropdownProps } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

export const Dropdown = React.forwardRef<PRDropdown, PRDropdownProps>(({ className, ...props }, ref) => {
  return (
    <PRDropdown
      ref={ref}
      className={classNames(
        'w-full border border-border-subtle rounded-card bg-surface-elevated text-foreground focus:border-primary transition-all duration-200 outline-none',
        className
      )}
      {...props}
    />
  );
});

Dropdown.displayName = 'Dropdown';
