import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DetailSectionEmpty {
  icon: LucideIcon;
  title: string;
  message?: ReactNode;
}

export interface DetailSectionProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  empty?: DetailSectionEmpty;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  emptyClassName?: string;
}

export function DetailSection({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  action,
  children,
  empty,
  className,
  headerClassName,
  contentClassName,
  emptyClassName,
}: DetailSectionProps) {
  const EmptyIcon = empty?.icon;

  return (
    <section
      className={cn(
        'bg-white rounded-[32px] border border-border-subtle shadow-soft p-8 flex flex-col gap-6',
        className
      )}>
      <div className={cn('flex items-start justify-between gap-4', headerClassName)}>
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={cn(
                'w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0',
                iconClassName
              )}>
              <Icon size={18} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest truncate">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted font-bold mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>

      {children ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        empty &&
        EmptyIcon && (
          <div
            className={cn(
              'rounded-3xl border-2 border-dashed border-border-strong bg-surface-subtle/40 px-6 py-10 text-center',
              emptyClassName
            )}>
            <EmptyIcon size={28} className="mx-auto text-muted/40" />
            <p className="mt-3 text-sm font-black text-foreground">{empty.title}</p>
            {empty.message && (
              <p className="mt-1 text-xs text-muted font-medium">{empty.message}</p>
            )}
          </div>
        )
      )}
    </section>
  );
}
