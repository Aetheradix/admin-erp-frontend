import { cn } from '@/utils/cn';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

export interface LoadingStateProps {
  className?: string;
  label?: string;
  variant?: 'spinner' | 'skeleton';
  rows?: number;
  skeletonClassName?: string;
}

export function LoadingState({
  className,
  label = 'Loading',
  variant = 'spinner',
  rows = 3,
  skeletonClassName,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div role="status" aria-live="polite" className={cn('flex flex-col gap-3', className)}>
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className={cn('h-16 rounded-2xl bg-surface-subtle animate-pulse', skeletonClassName)}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex justify-center items-center h-64', className)}>
      <ProgressSpinner />
      <span className="sr-only">{label}</span>
    </div>
  );
}
