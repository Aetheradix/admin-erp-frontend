export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastOptions {
  severity?: ToastSeverity;
  summary?: string;
  detail: string;
  life?: number;
}

export const TOAST_EVENT = 'AETHER_SHOW_TOAST';

export interface ShowToastFn {
  (options: ToastOptions | string): void;
  success: (detail: string, summary?: string) => void;
  error: (detail: string, summary?: string) => void;
  warn: (detail: string, summary?: string) => void;
  warning: (detail: string, summary?: string) => void;
  info: (detail: string, summary?: string) => void;
}

export const showToast: ShowToastFn = ((options: ToastOptions | string) => {
  const detail = typeof options === 'string' ? options : options.detail;
  const severity = typeof options === 'string' ? 'info' : options.severity || 'info';
  const summary =
    typeof options === 'string'
      ? severity.charAt(0).toUpperCase() + severity.slice(1)
      : options.summary || severity.charAt(0).toUpperCase() + severity.slice(1);
  const life = typeof options === 'object' && options.life ? options.life : 3000;

  const event = new CustomEvent(TOAST_EVENT, {
    detail: { detail, severity, summary, life },
  });
  window.dispatchEvent(event);
}) as ShowToastFn;

showToast.success = (detail: string, summary: string = 'Success') => {
  showToast({ severity: 'success', summary, detail });
};

showToast.error = (detail: string, summary: string = 'Error') => {
  showToast({ severity: 'error', summary, detail });
};

showToast.warn = (detail: string, summary: string = 'Warning') => {
  showToast({ severity: 'warn', summary, detail });
};

showToast.warning = (detail: string, summary: string = 'Warning') => {
  showToast({ severity: 'warn', summary, detail });
};

showToast.info = (detail: string, summary: string = 'Info') => {
  showToast({ severity: 'info', summary, detail });
};

export const severityMap: Record<ToastSeverity, 'success' | 'info' | 'warning' | 'error'> = {
  success: 'success',
  info: 'info',
  warn: 'warning',
  error: 'error',
};
