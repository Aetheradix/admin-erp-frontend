import { cn } from '@/utils/cn';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

export interface LoadingStateProps {
  className?: string;
  label?: string;
}

export function LoadingState({ className, label = 'Loading' }: LoadingStateProps) {
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
