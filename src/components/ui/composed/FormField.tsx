import React from 'react';
import { classNames } from 'primereact/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const FormField = ({ label, error, help, children, className, id }: FormFieldProps) => {
  return (
    <div className={classNames('mb-4 w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground/80 ml-1">
          {label}
        </label>
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
