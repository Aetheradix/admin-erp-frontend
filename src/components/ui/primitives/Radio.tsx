import React from 'react';
import { RadioButton, type RadioButtonProps } from 'primereact/radiobutton';
import { classNames } from 'primereact/utils';

export const Radio = React.forwardRef<RadioButton, RadioButtonProps>(({ className, ...props }, ref) => {
  return (
    <RadioButton
      ref={ref}
      className={classNames(
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  );
});

Radio.displayName = 'Radio';
