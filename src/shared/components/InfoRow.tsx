import { memo, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  description?: string;
  className?: string;
}

export const InfoRow = memo(function InfoRow({
  icon,
  label,
  value,
  badge,
  action,
  description,
  className,
}: InfoRowProps) {
  return (
    <div
      className={cn(
        'p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-1.5',
        className
      )}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {badge}
      </div>

      <div className="flex items-start justify-between gap-3 mt-1">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-slate-900 block truncate">{value}</div>
          {description && (
            <span className="text-[10px] text-slate-500 block mt-1 leading-relaxed">
              {description}
            </span>
          )}
        </div>
        {action}
      </div>
    </div>
  );
});
