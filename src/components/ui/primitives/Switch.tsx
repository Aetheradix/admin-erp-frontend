import React from 'react';
import { Switch as AntSwitch } from 'antd';
import type { SwitchProps as AntSwitchProps } from 'antd';
import { cn } from '@/utils/cn';

interface PrimeSwitchChangeEvent {
  value: boolean;
  originalEvent?: React.SyntheticEvent;
}

interface SwitchProps extends Omit<AntSwitchProps, 'onChange'> {
  onChange?: (e: PrimeSwitchChangeEvent) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ className, onChange, ...props }, ref) => {
  return (
    <AntSwitch
      ref={ref}
      className={cn('transition-all duration-200', className)}
      onChange={(checked, event) => onChange?.({ value: checked, originalEvent: event })}
      {...props}
    />
  );
});

Switch.displayName = 'Switch';

export const InputSwitch = Switch;
