import { App } from 'antd';
import { useEffect } from 'react';
import { TOAST_EVENT, type ToastOptions, severityMap, type ToastSeverity } from './Toast.utils';

export const Toast = () => {
  const { notification } = App.useApp();

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const {
        severity = 'info',
        summary = 'Notification',
        detail,
        life = 3000,
      } = (e as CustomEvent<ToastOptions>).detail;
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
