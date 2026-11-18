import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface ErrorStateProps {
  message?: ReactNode;
  className?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  className,
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  if (!onRetry) {
    return (
      <div
        role="alert"
        className={cn('flex justify-center items-center h-64 text-red-500', className)}>
        {message}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col justify-center items-center h-64 gap-3 text-center text-red-500 px-4',
        className
      )}>
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-white border border-border-subtle text-foreground text-sm font-semibold hover:bg-surface-subtle transition-colors">
        {retryLabel}
      </button>
    </div>
  );
}
