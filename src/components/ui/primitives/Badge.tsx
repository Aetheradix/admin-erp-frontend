import { Badge as PRBadge, type BadgeProps as PRBadgeProps } from 'primereact/badge';
import { classNames } from 'primereact/utils';

interface BadgeProps extends PRBadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'primary';
}

export const Badge = ({ variant = 'primary', className, ...props }: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-primary-soft text-primary border-primary-glow',
    success: 'bg-success/10 text-success border-success/20',
    info: 'bg-info/10 text-info border-info/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-error/10 text-error border-error/20',
  };

  return (
    <PRBadge
      className={classNames(
        'px-2 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider border',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};
