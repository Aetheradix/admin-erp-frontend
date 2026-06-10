import React from 'react';
import { Radio as AntRadio } from 'antd';
import type { RadioProps as AntRadioProps } from 'antd';
import { cn } from '@/utils/cn';

export const Radio = React.forwardRef<unknown, AntRadioProps>(({ className, ...props }, ref) => {
  return (
    <AntRadio
      ref={ref as React.Ref<never>}
      className={cn('transition-all duration-200', className)}
      {...props}
    />
  );
});

Radio.displayName = 'Radio';
