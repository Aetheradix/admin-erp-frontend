import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface MonthNavigatorProps {
  label: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
  extra?: ReactNode;
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
}

const DEFAULT_BUTTON =
  'w-9 h-9 rounded-xl border border-border-subtle bg-white text-muted flex items-center justify-center hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

export function MonthNavigator({
  label,
  onPrev,
  onNext,
  prevLabel = 'Previous month',
  nextLabel = 'Next month',
  extra,
  className,
  buttonClassName,
  labelClassName,
}: MonthNavigatorProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <button
        type="button"
        aria-label={prevLabel}
        onClick={onPrev}
        className={cn(DEFAULT_BUTTON, buttonClassName)}>
        <ChevronLeft size={16} />
      </button>
      <div className={cn('text-sm font-black text-foreground tracking-tight', labelClassName)}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <button
          type="button"
          aria-label={nextLabel}
          onClick={onNext}
          className={cn(DEFAULT_BUTTON, buttonClassName)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
