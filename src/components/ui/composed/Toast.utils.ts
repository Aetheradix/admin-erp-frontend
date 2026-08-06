export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastOptions {
  severity?: ToastSeverity;
  summary?: string;
  detail: string;
  life?: number;
}

export const TOAST_EVENT = 'AETHER_SHOW_TOAST';

export const showToast = (options: ToastOptions) => {
  const event = new CustomEvent(TOAST_EVENT, { detail: options });
  window.dispatchEvent(event);
};

export const severityMap: Record<ToastSeverity, 'success' | 'info' | 'warning' | 'error'> = {
  success: 'success',
  info: 'info',
  warn: 'warning',
  error: 'error',
};
