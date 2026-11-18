import { showToast } from '@/components/ui/composed/Toast.utils';

export function notifySuccess(detail: string, summary = 'Success'): void {
  showToast({ severity: 'success', summary, detail, life: 3000 });
}

export function notifyError(error: unknown, fallback: string, summary: string): void {
  const apiError = error as { data?: { message?: string } } | null;

  showToast({
    severity: 'error',
    summary,
    detail: apiError?.data?.message || fallback,
    life: 3000,
  });
}
