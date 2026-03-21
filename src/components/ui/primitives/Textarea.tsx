import React from 'react';
import { InputTextarea, type InputTextareaProps } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, InputTextareaProps>(({ className, ...props }, ref) => {
  return (
    <InputTextarea
      ref={ref}
      className={classNames(
        'w-full px-5 py-4 border border-border-subtle rounded-2xl bg-white text-foreground focus:border-primary/50 transition-all duration-200 outline-none placeholder:text-muted/50 font-medium text-sm shadow-xs min-h-[120px]',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
