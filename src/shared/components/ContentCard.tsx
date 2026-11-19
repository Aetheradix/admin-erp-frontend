import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ContentCardProps {
  media?: ReactNode;
  badges?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
  bodyClassName?: string;
}

export function ContentCard({
  media,
  badges,
  title,
  subtitle,
  meta,
  footer,
  actions,
  onClick,
  className,
  bodyClassName,
}: ContentCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      {...(isInteractive
        ? {
            role: 'button',
            tabIndex: 0,
            onClick,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            },
          }
        : {})}
      className={cn(
        'bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col group',
        isInteractive &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className
      )}>
      {media && (
        <div className="relative">
          {media}
          {badges && <div className="absolute top-4 left-4 flex flex-wrap gap-2">{badges}</div>}
          {actions && <div className="absolute top-4 right-4 flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-6 flex flex-col gap-3 flex-1', bodyClassName)}>
        <div className="min-w-0">
          <h3 className="text-base font-black text-foreground truncate">{title}</h3>
          {subtitle && <p className="text-xs text-muted font-bold mt-1">{subtitle}</p>}
        </div>
        {meta}
        {footer && <div className="mt-auto pt-2">{footer}</div>}
      </div>
    </div>
  );
}
