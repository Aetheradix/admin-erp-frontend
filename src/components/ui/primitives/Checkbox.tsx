import React from 'react';
import { Checkbox as PRCheckbox, type CheckboxProps as PRCheckboxProps } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';

export const Checkbox = React.forwardRef<PRCheckbox, PRCheckboxProps>(({ className, ...props }, ref) => {
  return (
    <PRCheckbox
      ref={ref}
      className={classNames(
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';
