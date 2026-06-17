import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import { cn } from '@/utils/cn';
import { resolvePrimeIcon } from '@/utils/primeIcon';

interface ButtonProps extends Omit<AntButtonProps, 'size' | 'type' | 'variant' | 'icon'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  icon?: string | React.ReactNode;
  htmlType?: AntButtonProps['htmlType'];
  type?: 'button' | 'submit' | 'reset';
}

const variantMap = {
  primary: 'primary' as const,
  secondary: 'default' as const,
  outline: 'default' as const,
  ghost: 'text' as const,
  danger: 'primary' as const,
};

const variantClasses = {
  primary: '',
  secondary: '!bg-surface-subtle !border-border-subtle !text-foreground hover:!bg-surface-elevated',
  outline: '!bg-transparent !border-primary !text-primary hover:!bg-primary-soft',
  ghost: '!bg-transparent !border-transparent !text-muted hover:!bg-surface-subtle hover:!text-foreground !shadow-none',
  danger: '!bg-error !border-error hover:!opacity-90',
};

const sizeClasses = {
  small: '!h-8 !px-3 !text-sm',
  medium: '!h-10 !px-4',
  large: '!h-12 !px-6 !text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  className,
  label,
  icon,
  children,
  danger: dangerProp,
  htmlType,
  type,
  ...props
}, ref) => {
  const content = children ?? label;
  const resolvedIcon = typeof icon === 'string' ? resolvePrimeIcon(icon) : icon;

  return (
    <AntButton
      ref={ref}
      htmlType={htmlType ?? type}
      type={variantMap[variant]}
      danger={variant === 'danger' || dangerProp}
      icon={resolvedIcon}
      className={cn(
        'transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2',
        !className?.includes('rounded-') && '!rounded-md',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {content}
    </AntButton>
  );
});

Button.displayName = 'Button';
