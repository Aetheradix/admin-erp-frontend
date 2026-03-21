import React from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

export const Input = React.forwardRef<HTMLInputElement, InputTextProps>(({ className, ...props }, ref) => {
  return (
    <InputText
      ref={ref}
      className={classNames(
        '!w-full !px-5 !py-4 !border !border-border-subtle !rounded-2xl !bg-white !text-foreground focus:!border-primary/50 !transition-all !duration-200 !outline-none placeholder:!text-muted/50 font-medium text-sm !shadow-xs',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
