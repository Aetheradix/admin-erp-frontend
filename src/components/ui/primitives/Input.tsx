import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps as AntInputProps } from 'antd';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef<unknown, AntInputProps>(({ className, ...props }, ref) => {
  return (
    <AntInput
      ref={ref as React.Ref<never>}
      className={cn(
        'w-full px-5 py-4 border-border-subtle rounded-2xl bg-white text-foreground font-medium text-sm shadow-xs',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
