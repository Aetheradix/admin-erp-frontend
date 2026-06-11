import { App } from 'antd';
import { useEffect } from 'react';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

interface ToastOptions {
  severity?: ToastSeverity;
  summary?: string;
  detail: string;
  life?: number;
}

const TOAST_EVENT = 'AETHER_SHOW_TOAST';

export const showToast = (options: ToastOptions) => {
  const event = new CustomEvent(TOAST_EVENT, { detail: options });
  window.dispatchEvent(event);
};

const severityMap: Record<ToastSeverity, 'success' | 'info' | 'warning' | 'error'> = {
  success: 'success',
  info: 'info',
  warn: 'warning',
  error: 'error',
};

export const Toast = () => {
  const { notification } = App.useApp();

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const { severity = 'info', summary = 'Notification', detail, life = 3000 } = (e as CustomEvent<ToastOptions>).detail;
      notification[severityMap[severity as ToastSeverity]]({
        message: summary,
        description: detail,
        placement: 'topRight',
        duration: life / 1000,
        className: 'rounded-lg shadow-2xl font-body',
      });
    };

    window.addEventListener(TOAST_EVENT, handleShowToast);
    return () => window.removeEventListener(TOAST_EVENT, handleShowToast);
  }, [notification]);

  return null;
};
