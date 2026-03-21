import React from 'react';
import { Button as PRButton, type ButtonProps as PRButtonProps } from 'primereact/button';
import { classNames } from 'primereact/utils';

interface ButtonProps extends Omit<PRButtonProps, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const Button = React.forwardRef<PRButton, ButtonProps>(({ 
  variant = 'primary', 
  size = 'medium', 
  className, 
  ...props 
}, ref) => {
  const variantClasses = {
    primary: '!bg-primary !border-primary text-white hover:!bg-primary-hover',
    secondary: '!bg-surface-subtle !border-border-subtle text-foreground hover:!bg-surface-elevated',
    outline: '!bg-transparent !border-primary !text-primary hover:!bg-primary-soft',
    ghost: '!bg-transparent !border-transparent text-muted hover:!bg-surface-subtle hover:text-foreground',
    danger: '!bg-error !border-error text-white hover:opacity-90',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <PRButton
      ref={ref}
      className={classNames(
        'transition-all duration-200 font-medium shadow-sm! flex items-center justify-center gap-2',
        !className?.includes('rounded-2xl') && 'rounded-pill!',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';
