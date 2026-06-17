import React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxProps as AntCheckboxProps } from 'antd';
import { cn } from '@/utils/cn';

export const Checkbox = React.forwardRef<unknown, AntCheckboxProps>(({ className, ...props }, ref) => {
  return (
    <AntCheckbox
      ref={ref as React.Ref<never>}
      className={cn('transition-all duration-200', className)}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';
