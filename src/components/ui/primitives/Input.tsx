import React from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

export const Input = React.forwardRef<HTMLInputElement, InputTextProps>(({ className, ...props }, ref) => {
  return (
    <InputText
      ref={ref}
      className={classNames(
        '!w-full !px-4 !py-2 !border !border-border-subtle !rounded-card !bg-surface-elevated !text-foreground focus:!border-primary focus:!ring-1 focus:!ring-primary !transition-all !duration-200 !outline-none placeholder:!text-muted',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
