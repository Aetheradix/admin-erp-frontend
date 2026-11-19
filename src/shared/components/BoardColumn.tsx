import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface BoardColumnProps {
  title: ReactNode;
  count?: number;
  dotClassName?: string;
  children?: ReactNode;
  empty?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function BoardColumn({
  title,
  count,
  dotClassName,
  children,
  empty,
  className,
  headerClassName,
  bodyClassName,
}: BoardColumnProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[32px] bg-surface-subtle/50 border border-border-subtle p-5 min-h-[240px]',
        className
      )}>
      <div className={cn('flex items-center justify-between gap-3 px-1', headerClassName)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn('w-2.5 h-2.5 rounded-full bg-primary shrink-0', dotClassName)} />
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest truncate">
            {title}
          </h3>
        </div>
        {count !== undefined && (
          <span className="text-[11px] font-black text-muted bg-white rounded-full px-2.5 py-0.5 border border-border-subtle">
            {count}
          </span>
        )}
      </div>
      <div className={cn('flex flex-col gap-3 flex-1', bodyClassName)}>
        {children}
        {!children &&
          (empty ?? (
            <div className="flex-1 rounded-2xl border-2 border-dashed border-border-strong flex items-center justify-center text-xs font-bold text-muted/60 py-10">
              Nothing here yet
            </div>
          ))}
      </div>
    </div>
  );
}
