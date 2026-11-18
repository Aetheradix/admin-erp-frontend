import { useCallback, useState } from 'react';
import {
  showToast,
  type ToastOptions,
  type ToastSeverity,
} from '@/components/ui/composed/Toast.utils';
import { getApiErrorMessage } from '../utils/apiError';

function emitToast(message: string | ToastOptions, severity: ToastSeverity): void {
  if (typeof message === 'string') {
    showToast({ severity, detail: message });
    return;
  }
  showToast(message);
}

export interface SubmitOptions<R> {
  success?: string | ToastOptions;
  error?: string | ToastOptions;
  errorFallback?: string;
  onSuccess?: (result: R) => void;
  onError?: (error: unknown) => void;
  rethrow?: boolean;
}

export function useSubmitHandler() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async function run<R>(
      action: () => Promise<R>,
      options: SubmitOptions<R> = {}
    ): Promise<R | undefined> {
      setIsSubmitting(true);
      try {
        const result = await action();
        if (options.success) emitToast(options.success, 'success');
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        if (options.error) {
          emitToast(options.error, 'error');
        } else if (options.errorFallback) {
          emitToast(getApiErrorMessage(error, options.errorFallback), 'error');
        }
        options.onError?.(error);
        if (options.rethrow) throw error;
        return undefined;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { isSubmitting, submit };
}
