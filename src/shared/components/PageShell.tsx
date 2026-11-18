import type { ReactNode } from 'react';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

export interface PageShellProps {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: ReactNode;
  onRetry?: () => void;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
}

export function PageShell({
  children,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
  loadingClassName,
  errorClassName,
}: PageShellProps) {
  if (isLoading) return <LoadingState className={loadingClassName} />;
  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} className={errorClassName} />;
  }
  return <div className={className}>{children}</div>;
}
