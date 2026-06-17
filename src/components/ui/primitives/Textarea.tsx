import React from 'react';
import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import { cn } from '@/utils/cn';

const { TextArea: AntTextArea } = Input;

export const Textarea = React.forwardRef<unknown, TextAreaProps>(({ className, ...props }, ref) => {
  return (
    <AntTextArea
      ref={ref as React.Ref<never>}
      className={cn(
        'w-full px-5 py-4 border-border-subtle rounded-2xl bg-white text-foreground font-medium text-sm shadow-xs min-h-[120px]',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export const InputTextarea = Textarea;
