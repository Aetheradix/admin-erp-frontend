import React from 'react';
import { InputTextarea, type InputTextareaProps } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, InputTextareaProps>(({ className, ...props }, ref) => {
  return (
    <InputTextarea
      ref={ref}
      className={classNames(
        'w-full px-4 py-2 border border-border-subtle rounded-card bg-surface-elevated text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none placeholder:text-muted min-h-[100px]',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
