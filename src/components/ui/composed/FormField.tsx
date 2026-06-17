import React from 'react';
import { cn } from '@/utils/cn';

interface FormFieldProps {
  label?: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  required?: boolean;
  description?: string;
}

export const FormField = ({ label, error, help, children, className, id, required, description }: FormFieldProps) => {
  return (
    <div className={cn('mb-4 w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground/80 ml-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-[11px] text-muted ml-1 -mt-1 mb-1">
          {description}
        </p>
      )}
      <div className="w-full">
        {children}
      </div>
      {error && (
        <small className="text-error text-xs font-medium ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </small>
      )}
      {!error && help && (
        <small className="text-muted text-xs ml-1">
          {help}
        </small>
      )}
    </div>
  );
};
