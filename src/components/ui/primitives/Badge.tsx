import type { ReactNode } from 'react';
import { Tag } from 'antd';
import { cn } from '@/utils/cn';

interface BadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'secondary';
  className?: string;
  children?: ReactNode;
  value?: string | number;
}

const variantClasses = {
  primary: 'bg-primary-soft text-primary border-primary/20',
  secondary: 'bg-surface-subtle text-muted border-border-subtle',
  success: 'bg-success/10 text-success border-success/20',
  info: 'bg-info/10 text-info border-info/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-error/10 text-error border-error/20',
};

export const Badge = ({ variant = 'primary', className, children, value }: BadgeProps) => {
  const content = children ?? value;

  return (
    <Tag
      bordered
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border m-0 inline-flex items-center',
        variantClasses[variant],
        className
      )}
    >
      {content}
    </Tag>
  );
};
