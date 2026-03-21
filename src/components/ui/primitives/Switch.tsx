import React from 'react';
import { InputSwitch, type InputSwitchProps } from 'primereact/inputswitch';
import { classNames } from 'primereact/utils';

export const Switch = React.forwardRef<InputSwitch, InputSwitchProps>(({ className, ...props }, ref) => {
  return (
    <InputSwitch
      ref={ref}
      className={classNames(
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  );
});

Switch.displayName = 'Switch';
